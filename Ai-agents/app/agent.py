"""
agent.py — LangGraph-based decision-making agent for graphic generation.

Architecture:
  Uses LangGraph's prebuilt ReAct agent (create_react_agent) backed by the
  four registered tools. Per-session sliding-window history gives the agent
  short-term context so it can remember previous requests within the same
  API session.

  The agent dynamically decides:
    • Whether to call fetch_trending_keywords before building the prompt.
    • Whether to use enhance_raw_prompt (for text-only inputs) or
      build_prompt_from_details (for structured inputs).
    • Whether to skip any step that would be redundant.
    • When to call generate_image and with which parameters.

  Migration from AgentExecutor (LangChain <1.x) to langgraph.prebuilt
  create_react_agent (LangChain 1.x+).
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Optional

from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import APIKeys, ModelConfig, SystemPrompts
from app.tools import ALL_TOOLS

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Session Memory Store
# ─────────────────────────────────────────────────────────────────────────────
# Architecture note:
#   History is keyed by session_id.  A simple in-process dict is used here —
#   for multi-worker / multi-pod deployments, replace this with a Redis-backed
#   store (see scaling notes at the bottom).
#   Each entry is a list of BaseMessage objects (HumanMessage / AIMessage).
_WINDOW_K = 5  # Keep last K turn-pairs in context
_session_histories: dict[str, list] = {}


def _get_history(session_id: str) -> list:
    """Return (or lazily create) the message history list for the session."""
    if session_id not in _session_histories:
        _session_histories[session_id] = []
        logger.debug("[Agent] Created new history for session_id='%s'", session_id)
    return _session_histories[session_id]


def _append_turn(session_id: str, human_msg: str, ai_msg: str) -> None:
    """Append a turn and trim to the sliding window."""
    history = _get_history(session_id)
    history.append(HumanMessage(content=human_msg))
    history.append(AIMessage(content=ai_msg))
    # Keep only the last K pairs (2 messages per pair)
    if len(history) > _WINDOW_K * 2:
        _session_histories[session_id] = history[-(  _WINDOW_K * 2):]


def clear_session_memory(session_id: str) -> None:
    """Explicitly clear memory for a session (e.g. on logout)."""
    _session_histories.pop(session_id, None)
    logger.info("[Agent] Cleared memory for session_id='%s'", session_id)


# ─────────────────────────────────────────────────────────────────────────────
# Agent Builder
# ─────────────────────────────────────────────────────────────────────────────

def _build_agent():
    """
    Build a LangGraph ReAct agent.

    Architecture note:
      create_react_agent is the LangGraph replacement for AgentExecutor +
      create_openai_tools_agent. It supports tool-calling models natively
      and handles intermediate steps / parsing errors internally.
    """
    llm = ChatOpenAI(
        model=ModelConfig.LLM_MODEL,
        temperature=ModelConfig.LLM_TEMP,
        openai_api_key=APIKeys.OPENAI,
    )

    return create_react_agent(
        model=llm,
        tools=ALL_TOOLS,
        prompt=SystemPrompts.AGENT_SYSTEM,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public Agent Invocation
# ─────────────────────────────────────────────────────────────────────────────

class GraphicAgent:
    """
    High-level facade over the LangChain agent executor.

    Usage:
        agent = GraphicAgent()
        result = agent.run_from_details(details_dict, session_id="user-123")
        result = agent.run_from_prompt("luxury apartment poster", session_id="user-123")
    """

    @staticmethod
    def _extract_layout(source_text: str) -> dict:
        """
        Uses GPT-4o-mini to extract fully dynamic flyer layout from any prompt or details dict.
        Returns a structured layout dict consumed by text_overlay.overlay_flyer_text().
        """
        from openai import OpenAI
        client = OpenAI(api_key=APIKeys.OPENAI)

        system = (
            "You are a graphic design layout extractor. Given marketing content or a business prompt, "
            "extract ALL text and design details needed for a professional flyer.\n"
            "Identify the brand niche: 'healthcare', 'real_estate', 'dental', 'fitness', 'education', or 'general'.\n"
            "Determine professional, aesthetic brand colors based on the niche (e.g. elegant blues/golds for real estate, "
            "vibrant teals/oranges for gym, professional greens/teals for hospital).\n"
            "Select the most appropriate template_id (integer: 0, 1, 2, 3, or 4):\n"
            "  - 0: Split Curve (elegant layered curves & dot-grid. Good for medical, education, corporate)\n"
            "  - 1: Bold Header Banner (prominent top header bar. Good for high contrast, dental, business)\n"
            "  - 2: Center Stage (large central circular frame. Good for real estate, luxury, dental)\n"
            "  - 3: Minimal Dark (split-canvas dark theme. Good for gym, fitness, tech, premium modern)\n"
            "  - 4: AI Dynamic Canvas (DALL-E designs the background, visual assets, shapes, and layout canvas; text and logo are overlaid on a glassmorphic card. Pick this by default whenever the user describes custom background designs, abstract shapes, custom composition, or unique positioning in their prompt, or when they want maximum creativity and uniqueness. Highly recommended for creative variations).\n"
            "If template_id is 4, you MUST also extract the alignment side for the text overlay ('left' or 'right') based on where the user wants the text or where DALL-E should leave negative space, and write a detailed DALL-E prompt in dalle_bg_prompt to generate the background design canvas.\n\n"
            "Return ONLY valid JSON with these keys:\n"
            "  brand_name: string (short brand name in CAPS, e.g. 'SHRIKRISHNA', 'EMAAR', 'DENTOCARE')\n"
            "  brand_sub: string (subtitle / description of business, e.g. 'Heart & Multispeciality Hospital, Nagpur')\n"
            "  niche: string (one of: 'healthcare', 'real_estate', 'dental', 'fitness', 'education', 'general')\n"
            "  template_id: integer (0, 1, 2, 3, or 4)\n"
            "  text_align: string ('left' or 'right' - only used if template_id is 4. The side where the text overlay card will be placed. Choose 'left' if visuals are on the right, or 'right' if visuals are on the left)\n"
            "  dalle_bg_prompt: string (only used if template_id is 4. A highly detailed prompt for DALL-E/gpt-image-2 to generate the background design canvas. It should describe the visual subject, background colors, shapes, composition, and explicitly instruct DALL-E to leave the text_align side completely empty/negative space for text overlays. STRICTLY forbid any text, words, labels, or logos in this generated background)\n"
            "  headline: array of 2-3 short punchy lines (max 4 words each)\n"
            "  subheadline: string (1 sentence describing core value)\n"
            "  icons: array of 3-4 short service / benefit labels (max 3 words each)\n"
            "  phone: string (digits only)\n"
            "  phone_label: string e.g. '(WhatsApp Business)'\n"
            "  badge_text: array of 1-2 short lines for a bottom badge e.g. ['Your Health', 'Our Priority']\n"
            "  primary_color: [r,g,b] (dark dominant theme color)\n"
            "  secondary_color: [r,g,b] (bright accent color)\n"
            "  background_color: [r,g,b] (very soft background tint color)\n"
            "Only output the JSON. No explanation."
        )
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": f"Source content:\n{source_text}"},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            layout = json.loads(resp.choices[0].message.content)
            
            # Map to legacy keys for compatibility
            layout["hospital_name"] = layout.get("brand_name", "BRAND")
            layout["hospital_sub"] = layout.get("brand_sub", "")
            layout["green_dark"] = layout.get("primary_color", [6, 95, 70])
            layout["green_bright"] = layout.get("secondary_color", [16, 185, 129])
            
            logger.info("[GraphicAgent] Layout extracted: %s", list(layout.keys()))
            return layout
        except Exception as exc:
            logger.warning("[GraphicAgent] Layout extraction failed: %s", exc)
            return {
                "brand_name": "BRAND",
                "brand_sub": "",
                "hospital_name": "BRAND",
                "hospital_sub": "",
                "niche": "general",
                "template_id": 4,
                "text_align": "left",
                "dalle_bg_prompt": "A professional square advertising background with white background and subtle abstract shapes. The right side contains the business visual asset. The left side is solid empty space.",
                "headline": ["Premium Quality.", "Reliable Service.", "Contact Us."],
                "subheadline": "Providing exceptional service with passion and expertise.",
                "icons": ["Expert Team", "Modern Tech", "24/7 Support", "Quality Care"],
                "phone": "",
                "phone_label": "(WhatsApp Business)",
                "badge_text": ["Quality First", "Best Service"],
                "primary_color": [30, 41, 59],
                "secondary_color": [59, 130, 246],
                "background_color": [248, 250, 252],
                "green_dark": [30, 41, 59],
                "green_bright": [59, 130, 246]
            }

    @staticmethod
    def _generate_background_image(prompt_text: str, size: str = "1024x1024", quality: str = "low") -> Optional[str]:
        """
        Uses GPT-4o-mini to extract a clean DALL-E prompt describing ONLY the visual/photographic
        assets of the prompt (no text, no overlays), then calls ImageService to generate the image.
        Returns the absolute filepath of the generated image, or None if failed.
        """
        from openai import OpenAI
        from app.services.image_service import ImageService
        
        client = OpenAI(api_key=APIKeys.OPENAI)
        system = (
            "You are an AI image generator prompt engineer. Given a marketing flyer prompt, extract "
            "and write a highly detailed visual description of the main photographic subject or background asset "
            "described in the prompt. The description MUST be optimized for DALL-E 3 (gpt-image-2).\n"
            "It should describe ONLY the raw photograph/scene (e.g. 'A high-end modern house with glass doors and a pool at sunset' "
            "or 'A white professional ambulance with green stripes and glowing emergency lights').\n"
            "STRICTLY FORBID any text, words, brand name, phone, icons, buttons, templates, grids, or overlays in the generated image. "
            "Do not describe text labels or layout placement instructions. Keep it as a raw, clean visual asset. "
            "Return ONLY the image prompt, nothing else."
        )
        try:
            logger.info("[GraphicAgent] Extracting clean visual prompt for DALL-E...")
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": f"Flyer Prompt:\n{prompt_text}"},
                ],
                temperature=0.7,
            )
            dalle_prompt = resp.choices[0].message.content.strip()
            dalle_prompt = dalle_prompt.replace('"', '').replace("'", "")
            logger.info("[GraphicAgent] Extracted DALL-E prompt: %s", dalle_prompt)
            
            img_service = ImageService()
            results = img_service.generate(
                prompt=dalle_prompt,
                quality=quality,
                size=size,
                num_variants=1,
            )
            if results:
                filepath = results[0]["filepath"]
                logger.info("[GraphicAgent] Successfully generated background visual asset: %s", filepath)
                return filepath
        except Exception as exc:
            logger.warning("[GraphicAgent] Background image generation failed: %s", exc)
        return None

    @staticmethod
    def _overlay_logo(image_b64: str, logo_src: str, brand_name: Optional[str] = None) -> str:
        """
        Overlays logo_src and optional brand_name onto image_b64 in the top-left corner.
        Creates a clean white pill container if a brand name is present, or a clean white
        rounded square container if only the logo is present.
        """
        import base64
        import requests
        import logging
        import os
        from io import BytesIO
        from PIL import Image, ImageDraw, ImageFont

        try:
            # 1. Load background image
            bg_data = base64.b64decode(image_b64)
            bg_img = Image.open(BytesIO(bg_data)).convert("RGBA")
            W, H = bg_img.size

            # 2. Load logo image
            logo_img = None
            if logo_src.startswith("data:image"):
                try:
                    header, data = logo_src.split(",", 1)
                    logo_img = Image.open(BytesIO(base64.b64decode(data))).convert("RGBA")
                except Exception as e:
                    logger.warning("Failed to parse base64 logo: %s", e)
            elif logo_src.startswith("http"):
                try:
                    resp = requests.get(logo_src, timeout=10)
                    if resp.status_code == 200:
                        logo_img = Image.open(BytesIO(resp.content)).convert("RGBA")
                except Exception as e:
                    logger.warning("Failed to download logo: %s", e)
            else:
                # Assume local file path
                if os.path.exists(logo_src):
                    try:
                        logo_img = Image.open(logo_src).convert("RGBA")
                    except Exception as e:
                        logger.warning("Failed to open local logo file: %s", e)

            if not logo_img:
                logger.warning("Logo image could not be loaded. Returning background unaltered.")
                return image_b64

            # 3. Helper to get font
            def get_font(font_size):
                NOTO_DIR = "/usr/share/fonts/truetype/noto"
                DEJAVU_DIR = "/usr/share/fonts/truetype/dejavu"
                is_devanagari = any('\u0900' <= c <= '\u097F' for c in (brand_name or ""))
                if is_devanagari:
                    candidates = [
                        os.path.join(NOTO_DIR, "NotoSansDevanagari-Bold.ttf"),
                        os.path.join(NOTO_DIR, "NotoSansDevanagari-Regular.ttf"),
                        os.path.join(NOTO_DIR, "NotoSans-Bold.ttf"),
                        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                    ]
                else:
                    candidates = [
                        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                        os.path.join(NOTO_DIR, "NotoSans-Bold.ttf"),
                        os.path.join(DEJAVU_DIR, "DejaVuSans-Bold.ttf"),
                        os.path.join(NOTO_DIR, "NotoSans-Regular.ttf"),
                        os.path.join(DEJAVU_DIR, "DejaVuSans.ttf"),
                    ]
                for p in candidates:
                    if os.path.exists(p):
                        try:
                            return ImageFont.truetype(p, font_size)
                        except Exception:
                            pass
                return ImageFont.load_default()

            # Scale logo and font sizes dynamically based on canvas width (normalized to 1024px)
            scale = W / 1024.0

            # 4. Resize logo
            logo_h = max(int(45 * scale), 20)
            logo_w = int(logo_img.width * (logo_h / logo_img.height))
            
            # Prevent absurdly wide logos
            if logo_w > int(W * 0.20):
                logo_w = int(W * 0.20)
                logo_h = int(logo_img.height * (logo_w / logo_img.width))

            logo_resized = logo_img.resize((logo_w, logo_h), Image.Resampling.LANCZOS)

            # Determine brand name text width
            brand_name_clean = str(brand_name).strip() if brand_name else None
            if brand_name_clean == "None" or brand_name_clean == "":
                brand_name_clean = None

            if brand_name_clean:
                f_size = max(int(22 * scale), 11)
                font = get_font(f_size)
                
                # Dummy image to measure text
                dummy = Image.new("RGBA", (1, 1))
                draw_dummy = ImageDraw.Draw(dummy)
                # Use textlength + safety margin for absolute advance width, preventing cutoffs
                text_w = int(draw_dummy.textlength(brand_name_clean, font=font)) + int(15 * scale)
                text_bbox = draw_dummy.textbbox((0, 0), brand_name_clean, font=font)
                text_h = text_bbox[3] - text_bbox[1]

                # Constrain max width of text to 65% of canvas width
                max_text_w = int(W * 0.65)
                if text_w > max_text_w:
                    f_size = int(f_size * (max_text_w / text_w))
                    min_f = max(int(10 * scale), 8)
                    if f_size < min_f:
                        f_size = min_f
                    font = get_font(f_size)
                    text_w = int(draw_dummy.textlength(brand_name_clean, font=font)) + int(15 * scale)
                    text_bbox = draw_dummy.textbbox((0, 0), brand_name_clean, font=font)
                    text_h = text_bbox[3] - text_bbox[1]

                # Pill dimensions
                pill_h = logo_h + int(16 * scale)
                # Plenty of right-padding so the rounded edge doesn't clip
                pill_w = int(12 * scale) + logo_w + int(10 * scale) + text_w + int(40 * scale)

                # Ensure pill fits within canvas bounds
                if pill_w > W - int(W * 0.08):
                    pill_w = W - int(W * 0.08)

                pill = Image.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
                draw_pill = ImageDraw.Draw(pill)

                # Draw rounded rectangle container
                draw_pill.rounded_rectangle(
                    [(0, 0), (pill_w, pill_h)],
                    radius=pill_h // 2,
                    fill=(255, 255, 255, 255),
                    outline=(210, 215, 220, 255),
                    width=max(int(2 * scale), 1)
                )

                # Paste logo
                logo_x = int(12 * scale)
                logo_y = (pill_h - logo_h) // 2
                try:
                    pill.paste(logo_resized, (logo_x, logo_y), logo_resized)
                except ValueError:
                    pill.paste(logo_resized, (logo_x, logo_y))

                # Draw text
                text_x = int(12 * scale) + logo_w + int(10 * scale)
                text_y = (pill_h - text_h) // 2 - text_bbox[1]
                draw_pill.text(
                    (text_x, text_y),
                    brand_name_clean,
                    font=font,
                    fill=(40, 44, 52, 255)
                )

                # Paste container onto top-left corner
                pad = int(W * 0.04)
                pos = (pad, pad)
                bg_img.paste(pill, pos, pill)
            else:
                # No brand name: draw rounded square container for logo
                box_pad = 12
                box_w = logo_w + box_pad * 2
                box_h = logo_h + box_pad * 2
                
                box = Image.new("RGBA", (box_w, box_h), (0, 0, 0, 0))
                draw_box = ImageDraw.Draw(box)
                
                draw_box.rounded_rectangle(
                    [(0, 0), (box_w, box_h)],
                    radius=12,
                    fill=(255, 255, 255, 255),
                    outline=(210, 215, 220, 255),
                    width=2
                )
                
                try:
                    box.paste(logo_resized, (box_pad, box_pad), logo_resized)
                except ValueError:
                    box.paste(logo_resized, (box_pad, box_pad))
                
                pad = int(W * 0.04)
                pos = (pad, pad)
                bg_img.paste(box, pos, box)

            # 5. Convert back to RGB PNG base64
            out_buf = BytesIO()
            bg_img.convert("RGB").save(out_buf, format="PNG")
            return base64.b64encode(out_buf.getvalue()).decode("utf-8")
        except Exception as e:
            logger.error("Error overlaying logo: %s", e)
            return image_b64

    @staticmethod
    def _extract_brand_name(prompt_text: str) -> Optional[str]:
        """
        Extracts business, hospital, or brand name from the raw prompt text.
        """
        from openai import OpenAI
        from app.config import APIKeys
        try:
            client = OpenAI(api_key=APIKeys.OPENAI)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a branding assistant. Given a prompt for a marketing graphic, extract the business, hospital, builder, or brand name (e.g. 'Shreekrishna Hospital' or 'Trump Towers'). Return ONLY the extracted name, or return 'None' if no specific brand or business name is mentioned. Do not include quotes or extra text."},
                    {"role": "user", "content": prompt_text}
                ],
                temperature=0.0,
            )
            name = resp.choices[0].message.content.strip()
            if name.lower() == "none" or not name:
                return None
            return name
        except Exception as e:
            logger.warning("Failed to extract brand name: %s", e)
            return None

    @staticmethod
    def _translate_to_hindi(text: str) -> str:
        """
        Translates or phonetically transliterates English brand/business names to Hindi (Devanagari).
        """
        if not text:
            return ""
        # Check if already contains Devanagari
        if any('\u0900' <= c <= '\u097F' for c in text):
            return text
        from openai import OpenAI
        from app.config import APIKeys
        try:
            client = OpenAI(api_key=APIKeys.OPENAI)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional translator and transliterator. Translate or phonetically transliterate the given business, builder, brand, or hospital name into Hindi using the Devanagari script. Return ONLY the translated/transliterated name in Devanagari, with no punctuation, no quotes, and no extra text. Example: 'Shreekrishna Hospital' -> 'श्रीकृष्ण हॉस्पिटल', 'Emaar' -> 'एमार', 'Bitlance' -> 'बिटलांस'."},
                    {"role": "user", "content": text}
                ],
                temperature=0.0,
            )
            translated = resp.choices[0].message.content.strip()
            return translated
        except Exception as e:
            logger.warning("Failed to translate brand name to Hindi: %s", e)
            return text

    def run_from_details(
        self,
        details: dict,
        session_id: str = "default",
    ) -> dict[str, Any]:
        """
        Run the agent with structured property/business details.

        Args:
            details:    Dict matching PropertyDetailsRequest schema.
            session_id: Unique identifier for memory isolation.

        Returns:
            Parsed result dict.
        """
        import base64
        import os
        logo_img = details.get("logo_image") or details.get("logo")
        brand_name = details.get("builder") or details.get("hospital_name") or details.get("brand_name") or details.get("hospital")
        language = details.get("language") or "english"
        
        if language == "hindi_marathi" and brand_name:
            brand_name = self._translate_to_hindi(brand_name)

        # Bulletproof Fix: Remove the brand name from the details sent to the LLM.
        # If DALL-E never sees the hospital name, it is physically impossible for it 
        # to hallucinate or duplicate the name in the footer or background.
        safe_details = details.copy()
        for k in ["builder", "hospital_name", "brand_name", "hospital"]:
            safe_details.pop(k, None)
            
        # Build the agent instruction
        instruction = (
            f"Please generate a marketing graphic/flyer for the following business/property details:\n"
            f"{json.dumps(safe_details, indent=2)}\n\n"
            f"Make sure to use the image size: '{details.get('image_size') or '1024x1024'}' and image quality: '{details.get('image_quality') or 'low'}'.\n"
            f"The target language is: '{language}'.\n"
        )
        ref_img = details.get("reference_image")
        if ref_img:
            from app.services.prompt_service import PromptService
            try:
                desc = PromptService()._analyze_image(ref_img)
                if desc:
                    instruction += (
                        f"\n\nIMPORTANT: The user has provided a reference image. "
                        f"Here is a detailed visual description of the reference image's subject matter: '{desc}'. "
                        "When you write the DALL-E image generation prompt, you MUST describe a subject "
                        "that is highly consistent with this reference subject. "
                        "For example, if the reference subject is a specific building, describe that building's "
                        "architecture, color scheme, and lighting in your DALL-E prompt to make it match."
                    )
            except Exception as e:
                logger.warning("Failed to analyze reference image in run_from_details: %s", e)

        if logo_img:
            instruction += (
                f"\n\nIMPORTANT: The branding logo and brand name container ('{brand_name}') will be programmatically overlaid at the top-left corner of the final image. "
                "Ensure that the DALL-E prompt you generate explicitly instructs DALL-E to push ALL headlines, subheadlines, and context DOWN, "
                "leaving the top 20% of the image (especially the top-left quadrant) COMPLETELY EMPTY (e.g., solid color, sky, or soft gradient) "
                "to accommodate the programmatic overlay without overlapping ANY context for God's sake. "
                "Also, DO NOT ask DALL-E to write the logo, brand name, or hospital name anywhere else, "
                "as branding is handled entirely programmatically. Keep the top 20% free of any text or critical subjects."
            )

        # Run ReAct agent
        result = self._invoke(instruction, session_id=session_id)

        # Post-process: Overlay logo if present
        if logo_img and result.get("success") and result.get("images"):
            for img_data in result["images"]:
                b64 = img_data.get("b64_string")
                if b64:
                    new_b64 = self._overlay_logo(b64, logo_img, brand_name)
                    img_data["b64_string"] = new_b64
                    filepath = img_data.get("filepath")
                    if filepath and os.path.exists(filepath):
                        with open(filepath, "wb") as f:
                            f.write(base64.b64decode(new_b64))

        return result

    def run_from_prompt(
        self,
        raw_prompt: str,
        niche: Optional[str] = None,
        image_size: str = "1024x1024",
        image_quality: str = "low",
        logo_image: Optional[str] = None,
        reference_image: Optional[str] = None,
        session_id: str = "default",
        language: str = "english",
    ) -> dict[str, Any]:
        """
        Run the agent from a raw text prompt.

        Args:
            raw_prompt:    The user's short description.
            niche:         Optional design niche for trend enrichment.
            image_size:    Desired output size.
            image_quality: Desired quality level.
            logo_image:    Optional logo image url or base64.
            reference_image: Optional reference image (local path, URL, or base64).
            session_id:    Memory namespace.
            language:      Language of the flyer text.

        Returns:
            Parsed result dict.
        """
        import base64
        import os
        
        # Pre-analyze the reference image and append description to the prompt
        if reference_image:
            from app.services.prompt_service import PromptService
            try:
                desc = PromptService()._analyze_image(reference_image)
                if desc:
                    raw_prompt = f"{raw_prompt}\n\n[Visual Subject Reference: {desc}]"
            except Exception as e:
                logger.warning("Failed to pre-analyze reference image in run_from_prompt: %s", e)

        brand_name = None
        if logo_image:
            import re
            brand_name = self._extract_brand_name(raw_prompt)
            if brand_name and brand_name.lower() != "none":
                # Sanitize the raw prompt to hide the name from DALL-E (case-insensitive)
                raw_prompt = re.sub(re.escape(brand_name), "the business", raw_prompt, flags=re.IGNORECASE)
            
            # Translate brand name for overlay
            if language == "hindi_marathi" and brand_name:
                brand_name = self._translate_to_hindi(brand_name)
                
        # Build the agent instruction
        instruction = (
            f"Please generate a marketing graphic/flyer for: '{raw_prompt}'.\n"
            f"Make sure to use the image size: '{image_size}' and image quality: '{image_quality}'.\n"
            f"The target language is: '{language}'.\n"
        )
        if niche:
            instruction += f"The niche is: '{niche}'.\n"
        if logo_image:
            instruction += (
                f"\n\nIMPORTANT: The branding logo and brand name container ('{brand_name}') will be programmatically overlaid at the top-left corner of the final image. "
                "CRITICAL BULLETPROOF RULE: You MUST COMPLETELY OMIT the brand name / hospital name from the final DALL-E prompt you generate. "
                "If DALL-E sees the hospital name in the prompt, it will hallucinate and duplicate it on the background canvas. "
                "Instead of the name, just use generic terms like 'the hospital' or 'the business' in the DALL-E prompt. "
                "Ensure that the DALL-E prompt you generate explicitly instructs DALL-E to push ALL headlines, subheadlines, and context DOWN, "
                "leaving the top 20% of the image (especially the top-left quadrant) COMPLETELY EMPTY (e.g., solid color, sky, or soft gradient) "
                "to accommodate the programmatic overlay without overlapping ANY context for God's sake. "
                "Keep the top 20% free of any text or critical subjects."
            )

        # Run ReAct agent
        result = self._invoke(instruction, session_id=session_id)

        # Post-process: Overlay logo if present
        if logo_image and result.get("success") and result.get("images"):
            for img_data in result["images"]:
                b64 = img_data.get("b64_string")
                if b64:
                    new_b64 = self._overlay_logo(b64, logo_image, brand_name)
                    img_data["b64_string"] = new_b64
                    filepath = img_data.get("filepath")
                    if filepath and os.path.exists(filepath):
                        with open(filepath, "wb") as f:
                            f.write(base64.b64decode(new_b64))

        return result

    # ──────────────────────────────────────────────────────────────────────────
    # Internal
    # ──────────────────────────────────────────────────────────────────────────

    def _invoke(self, instruction: str, session_id: str) -> dict[str, Any]:
        """Run the LangGraph agent and parse the output."""
        from app.tools import _last_image_results as _img_cache  # noqa: F401 (reset check)

        history = _get_history(session_id)
        agent   = _build_agent()

        # Build the messages list: history + current human message
        messages = history + [HumanMessage(content=instruction)]

        logger.info("[GraphicAgent] Invoking agent | session_id='%s'", session_id)
        try:
            raw_output = agent.invoke({"messages": messages})
        except Exception as exc:
            logger.error("[GraphicAgent] Agent execution failed: %s", exc)
            raise

        result = self._parse_agent_output(raw_output)

        # Persist this turn — store only a short AI summary (not raw tool blobs)
        # to keep session history compact and within token limits.
        _append_turn(session_id, instruction, result.get("agent_output", ""))

        return result

    @staticmethod
    def _parse_agent_output(raw_output: dict) -> dict[str, Any]:
        """
        Extract structured data from the LangGraph agent's output.

        LangGraph returns a dict with a 'messages' list. The last AIMessage
        (with no tool_calls) is the final answer.  Full image results (with b64)
        are retrieved from the tools._last_image_results module cache — they
        are never stored in ToolMessage content to avoid context overflow.
        """
        from langchain_core.messages import AIMessage as _AI, ToolMessage
        import app.tools as _tools

        trending_keywords: list[str] = []
        final_text: str = ""

        messages = raw_output.get("messages", [])

        for msg in messages:
            # Final AI text answer (last AIMessage with no pending tool_calls)
            if isinstance(msg, _AI):
                if not getattr(msg, "tool_calls", None):
                    final_text = msg.content or ""

            # Mine only lightweight tool outputs for trending_keywords
            elif isinstance(msg, ToolMessage):
                tool_output = msg.content or ""
                if not isinstance(tool_output, str):
                    continue
                try:
                    parsed = json.loads(tool_output)
                except (json.JSONDecodeError, TypeError):
                    continue
                if "trending_keywords" in parsed:
                    trending_keywords = parsed["trending_keywords"] or []

        # Pull full image results (including b64_string) from the module-level
        # cache set by generate_image — this data NEVER enters the LLM context.
        images = list(_tools._last_image_results)

        return {
            "success":           True,
            "agent_output":      final_text,
            "images":            images,
            "trending_keywords": trending_keywords,
        }


# =============================================================================
# ─── LANGGRAPH MIGRATION NOTES ───────────────────────────────────────────────
# =============================================================================
#
# To migrate to LangGraph (recommended for complex multi-step workflows):
#
# 1. Replace the AgentExecutor with a StateGraph:
#
#    from langgraph.graph import StateGraph, END
#
#    workflow = StateGraph(AgentState)
#    workflow.add_node("decide",   decide_node)      # Router node
#    workflow.add_node("keywords", keyword_node)
#    workflow.add_node("prompt",   prompt_node)
#    workflow.add_node("image",    image_node)
#    workflow.set_entry_point("decide")
#
# 2. Define AgentState as a TypedDict holding:
#      input, details, raw_prompt, niche, keywords, prompt, images, session_id
#
# 3. Use conditional_edges for routing:
#      workflow.add_conditional_edges("decide", route_fn, {
#          "details": "prompt",
#          "raw":     "prompt",
#      })
#
# 4. Replace in-process memory with LangGraph checkpointing:
#      from langgraph.checkpoint.redis import RedisSaver
#      checkpointer = RedisSaver.from_conn_string(REDIS_URL)
#      graph = workflow.compile(checkpointer=checkpointer)
#
# 5. Each node becomes a pure function (stateless, testable, traceable).
#
# =============================================================================
# ─── SCALING NOTES ───────────────────────────────────────────────────────────
# =============================================================================
#
# Current bottlenecks and recommended solutions:
#
# 1. In-process session memory (_session_memories dict):
#    → Replace with Redis:
#      from langchain.memory import RedisChatMessageHistory
#      history = RedisChatMessageHistory(session_id=session_id, url=REDIS_URL)
#      memory  = ConversationBufferWindowMemory(chat_memory=history, k=5, ...)
#
# 2. Synchronous OpenAI calls block the FastAPI event loop:
#    → Use run_in_executor or AsyncAgentExecutor:
#      loop.run_in_executor(None, executor.invoke, {"input": instruction})
#
# 3. Rate limiting (OpenAI TPM/RPM):
#    → Add a token-bucket limiter per API key (slowapi or custom Redis counter).
#
# 4. Image generation latency (2-15 seconds per call):
#    → Queue jobs with Celery + Redis broker.
#    → Return a job_id immediately; poll /jobs/{job_id} for status.
#    → This is already partially implemented in the Node.js server layer.
#
# 5. Multi-tenant isolation:
#    → Namespace Redis keys by workspace_id + user_id.
#    → Pass session_id = f"{workspace_id}:{user_id}" from the API layer.
#
# =============================================================================
