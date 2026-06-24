"""
compositor.py — Composites a reference image onto a DALL-E generated base image.

Strategy: Place the user's photo on the RIGHT 45% of the canvas, with a 
smooth curved left edge. The left 55% is strictly reserved for text. No overflow.
"""

import requests
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageOps
import logging
import os

logger = logging.getLogger(__name__)


def composite_reference_image(b64_string: str, filepath: str, ref_url: str) -> str:
    """
    Downloads ref_url, fits it into the right 45% of the flyer with a curved
    left edge and forest-green border. Saves to disk and returns new b64.
    """
    try:
        logger.info(f"[Compositor] Compositing {ref_url}")

        # ── Load base image ─────────────────────────────────────────────────
        base_img = Image.open(BytesIO(base64.b64decode(b64_string))).convert("RGBA")
        base_w, base_h = base_img.size

        # ── Download reference image ─────────────────────────────────────────
        resp = requests.get(ref_url, timeout=15)
        resp.raise_for_status()
        ref_img = Image.open(BytesIO(resp.content)).convert("RGBA")

        # ── Target region: strictly the right 45%, full height minus footer ──
        # Footer is roughly 10% of height, so photo goes from y=5% to y=90%
        footer_h = int(base_h * 0.12)
        top_pad  = int(base_h * 0.04)

        photo_w  = int(base_w * 0.45)          # right 45% of canvas width
        photo_h  = base_h - footer_h - top_pad  # full height minus footer and top pad

        # anchor: top-left corner of the photo region
        anchor_x = base_w - photo_w             # start at 55% from left
        anchor_y = top_pad

        # ── Fit reference image to photo region ──────────────────────────────
        ref_img = ImageOps.fit(ref_img, (photo_w, photo_h), Image.Resampling.LANCZOS)

        # ── Create rounded-rectangle mask (top corners rounded) ──────────────
        mask = Image.new('L', (photo_w, photo_h), 0)
        mask_draw = ImageDraw.Draw(mask)
        radius = int(photo_w * 0.12)
        # Draw a rounded rectangle (pill on top-left and top-right, square on bottom)
        mask_draw.rounded_rectangle([(0, 0), (photo_w, photo_h)], radius=radius, fill=255)
        ref_img.putalpha(mask)

        # ── Draw a green border ───────────────────────────────────────────────
        border = int(base_w * 0.018)
        border_img_w = photo_w + border * 2
        border_img_h = photo_h + border * 2
        border_img = Image.new('RGBA', (border_img_w, border_img_h), (255, 255, 255, 0))
        border_draw = ImageDraw.Draw(border_img)
        border_draw.rounded_rectangle(
            [(0, 0), (border_img_w, border_img_h)],
            radius=radius + border,
            fill=(0, 100, 50, 255)  # Forest green
        )
        border_img.paste(ref_img, (border, border), ref_img)

        # ── Paste onto base — clamp so it never overflows left ───────────────
        paste_x = anchor_x - border
        paste_y = anchor_y - border

        # Safety: never let it cross the 50% midline
        midline = base_w // 2
        if paste_x < midline:
            paste_x = midline

        # Safety: never let it go off the right edge
        if paste_x + border_img_w > base_w:
            border_img_w_clamped = base_w - paste_x
            border_img = border_img.crop((0, 0, border_img_w_clamped, border_img_h))

        base_img.paste(border_img, (paste_x, paste_y), border_img)

        # ── Save and return ──────────────────────────────────────────────────
        final_img = base_img.convert("RGB")
        out_buffer = BytesIO()
        final_img.save(out_buffer, format="PNG")

        if filepath and os.path.exists(filepath):
            final_img.save(filepath, format="PNG")

        logger.info("[Compositor] Done.")
        return base64.b64encode(out_buffer.getvalue()).decode("utf-8")

    except Exception as e:
        logger.error(f"[Compositor] Failed: {e}")
        return b64_string
