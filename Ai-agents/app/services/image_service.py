"""
image_service.py — OpenAI image generation service.

Extracted from GraphicAIService.generate_image().
Handles: API call, base64 decode/download, local disk save.
Pure, stateless, no coupling to prompt or keyword logic.
"""

from __future__ import annotations

import base64
import logging
import os
import uuid
from typing import Optional

import requests
from openai import OpenAI

from app.config import APIKeys, ModelConfig, StorageConfig

logger = logging.getLogger(__name__)

# Ensure output directory exists at import time
os.makedirs(StorageConfig.OUTPUT_FOLDER, exist_ok=True)


class ImageService:
    """
    Generates images via OpenAI gpt-image-2 and persists them locally.

    Returns a list of dicts with keys:
        filepath    — absolute path to saved PNG
        filename    — bare filename (e.g. "image_<uuid>.png")
        b64_string  — base64-encoded PNG content
        image_url   — None (populated upstream if CDN upload is added)
    """

    def __init__(self) -> None:
        if not APIKeys.OPENAI:
            raise EnvironmentError("OPENAI_API_KEY is not set.")
        self.client = OpenAI(api_key=APIKeys.OPENAI)

    # ──────────────────────────────────────────────────────────────────────────

    def generate(
        self,
        prompt: str,
        quality: str = "low",
        size: str = "1024x1024",
        num_variants: int = 1,
    ) -> list[dict]:
        """
        Generate one or more images.

        Args:
            prompt:       The final, detailed image generation prompt.
            quality:      'low' | 'medium' | 'high' | 'auto'
            size:         '1024x1024' | '1536x1024' | '1024x1536'
            num_variants: How many images to generate (API n parameter).

        Returns:
            List of image result dicts (filepath, filename, b64_string, image_url).

        Raises:
            Exception: On API failure or if no image data is returned.
        """
        logger.info(
            "[ImageService] Generating %d image(s) | size=%s | quality=%s",
            num_variants, size, quality,
        )

        try:
            api_result = self.client.images.generate(
                model=ModelConfig.IMAGE_MODEL,
                prompt=prompt,
                size=size,
                quality=quality,
                n=num_variants,
            )
        except Exception as exc:
            logger.error("[ImageService] OpenAI API call failed: %s", exc)
            raise Exception(f"OpenAI Image Generation Error: {exc}") from exc

        # DEBUG: Save the prompt to a text file for inspection
        import time
        try:
            with open(f"outputs/debug_prompt_{int(time.time())}.txt", "w") as f:
                f.write(prompt)
        except Exception:
            pass

        output_list: list[dict] = []

        for img_data in api_result.data:
            result = self._process_image_data(img_data, quality)
            if result:
                output_list.append(result)

        if not output_list:
            raise Exception("No image data returned from OpenAI API.")

        logger.info("[ImageService] %d image(s) saved to '%s'.", len(output_list), StorageConfig.OUTPUT_FOLDER)
        return output_list

    # ──────────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _process_image_data(self, img_data, quality: str) -> Optional[dict]:
        """Decode a single image API response item and persist to disk."""
        job_id   = str(uuid.uuid4())
        filename = f"image_{job_id}.png"
        filepath = os.path.join(StorageConfig.OUTPUT_FOLDER, filename)
        b64_string: Optional[str] = None

        try:
            if hasattr(img_data, "b64_json") and img_data.b64_json:
                # API returned base64 directly
                b64_string  = img_data.b64_json
                image_bytes = base64.b64decode(b64_string)
                image_bytes = self._resize_if_needed(image_bytes, quality)
                self._save_bytes(filepath, image_bytes)
                b64_string = base64.b64encode(image_bytes).decode("utf-8")

            elif hasattr(img_data, "url") and img_data.url:
                # API returned a temporary URL — download it
                resp = requests.get(img_data.url, timeout=30)
                resp.raise_for_status()
                image_bytes = resp.content
                image_bytes = self._resize_if_needed(image_bytes, quality)
                self._save_bytes(filepath, image_bytes)
                b64_string = base64.b64encode(image_bytes).decode("utf-8")

            else:
                logger.warning("[ImageService] Image item has neither b64_json nor url — skipping.")
                return None

        except Exception as exc:
            logger.error("[ImageService] Failed to process image item: %s", exc)
            return None

        return {
            "filepath":   filepath,
            "filename":   filename,
            "b64_string": b64_string,
            "image_url":  None,   # Populated by upload layer if CDN is configured
        }

    def _resize_if_needed(self, image_bytes: bytes, quality: str) -> bytes:
        """Physically resizes the image bytes if quality settings require downscaling."""
        if quality not in ["low", "medium"]:
            return image_bytes

        try:
            from PIL import Image
            import io

            img = Image.open(io.BytesIO(image_bytes))
            width, height = img.size

            scale = 0.5 if quality == "low" else 0.75
            new_w = int(width * scale)
            new_h = int(height * scale)

            logger.info("[ImageService] Resizing generated image from %dx%d to %dx%d (requested quality: %s)", width, height, new_w, new_h, quality)

            try:
                resample_filter = Image.Resampling.LANCZOS
            except AttributeError:
                resample_filter = Image.ANTIALIAS

            img_resized = img.resize((new_w, new_h), resample=resample_filter)

            out_buf = io.BytesIO()
            img_resized.save(out_buf, format="PNG")
            return out_buf.getvalue()
        except Exception as e:
            logger.error("[ImageService] Failed to resize image for quality: %s, error: %s", quality, e)
            return image_bytes

    @staticmethod
    def _save_bytes(filepath: str, data: bytes) -> None:
        with open(filepath, "wb") as f:
            f.write(data)
        logger.debug("[ImageService] Saved image → %s", filepath)