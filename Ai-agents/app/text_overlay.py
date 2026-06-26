"""
text_overlay.py — Renders crisp, pixel-perfect text onto the generated flyer.

ALL content is fully dynamic — extracted from user prompt via LLM.
This guarantees 100% sharp text by bypassing AI text rendering entirely.
"""

from __future__ import annotations

import base64
import logging
import os
from io import BytesIO
from typing import Optional

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

# ── Font Paths ────────────────────────────────────────────────────────────────
NOTO_DIR   = "/usr/share/fonts/truetype/noto"
DEJAVU_DIR = "/usr/share/fonts/truetype/dejavu"

def _font(name: str, size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        os.path.join(NOTO_DIR, name),
        os.path.join(DEJAVU_DIR, name.replace("NotoSans", "DejaVuSans")),
    ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def overlay_flyer_text(
    b64_string: str,
    filepath: str,
    layout: dict,
) -> str:
    """
    Draws all flyer text using Pillow TTF fonts — 100% crisp.

    layout dict keys (all dynamic, all from LLM extraction):
        hospital_name  : str   — e.g. "SHRIKRISHNA HOSPITAL"
        hospital_sub   : str   — e.g. "Heart & Multispeciality Hospital, Nagpur"
        tagline        : str   — e.g. "CARE • COMPASSION • TRUST"
        headline       : list  — e.g. ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."]
        headline_colors: list  — e.g. ["dark", "dark", "bright"] ('dark'|'bright' per line)
        subheadline    : str   — e.g. "Comprehensive healthcare under one roof"
        icons          : list  — e.g. ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"]
        phone          : str   — e.g. "9823125233"
        badge_text     : list  — e.g. ["Your Health", "Our Priority"]   (shown bottom-right)
        green_dark     : tuple — e.g. (0, 120, 60)
        green_bright   : tuple — e.g. (0, 170, 85)
        footer_color   : tuple — e.g. (0, 160, 80)
    """
    try:
        logger.info("[TextOverlay] Starting dynamic text overlay.")

        img = Image.open(BytesIO(base64.b64decode(b64_string))).convert("RGBA")
        W, H = img.size
        draw = ImageDraw.Draw(img)

        # ── Dynamic colors ──────────────────────────────────────────────────
        GREEN_DARK   = tuple(layout.get("green_dark",   [0, 100, 50]))
        GREEN_BRIGHT = tuple(layout.get("green_bright", [0, 160, 80]))
        FOOTER_COLOR = tuple(layout.get("footer_color", [0, 100, 50]))
        GREY_DARK    = (35, 35, 35)
        WHITE        = (255, 255, 255)

        # ── Layout zones ────────────────────────────────────────────────────
        # Left text zone = 50% of canvas width, padded
        LEFT_ZONE = int(W * 0.50)
        PAD       = int(W * 0.045)
        FOOTER_H  = int(H * 0.115)

        # ── Font sizes ──────────────────────────────────────────────────────
        sz_name     = max(15, int(H * 0.026))
        sz_sub_name = max(11, int(H * 0.017))
        sz_headline = max(36, int(H * 0.068))
        sz_sub      = max(13, int(H * 0.021))
        sz_icon     = max(11, int(H * 0.018))
        sz_footer   = max(22, int(H * 0.036))
        sz_badge    = max(14, int(H * 0.024))

        fn_black   = lambda s: _font("NotoSans-Black.ttf",   s)
        fn_bold    = lambda s: _font("NotoSans-Bold.ttf",    s)
        fn_regular = lambda s: _font("NotoSans-Regular.ttf", s)

        y = int(H * 0.04)

        # ── Hospital name + logo area ────────────────────────────────────────
        # Draw small green circle as logo placeholder
        logo_r = int(sz_name * 0.9)
        draw.ellipse([(PAD, y), (PAD + logo_r*2, y + logo_r*2)], fill=GREEN_DARK)
        # Draw a small "+" cross inside
        cx, cy = PAD + logo_r, y + logo_r
        cross_arm = int(logo_r * 0.55)
        cross_thick = max(2, int(logo_r * 0.18))
        draw.rectangle([(cx - cross_arm, cy - cross_thick), (cx + cross_arm, cy + cross_thick)], fill=WHITE)
        draw.rectangle([(cx - cross_thick, cy - cross_arm), (cx + cross_thick, cy + cross_arm)], fill=WHITE)

        name_x = PAD + logo_r * 2 + int(W * 0.015)
        hospital_name = layout.get("hospital_name", "HOSPITAL")
        draw.text((name_x, y), hospital_name, font=fn_bold(sz_name), fill=GREEN_DARK)

        hospital_sub = layout.get("hospital_sub", "")
        if hospital_sub:
            draw.text((name_x, y + sz_name + 2), hospital_sub, font=fn_regular(sz_sub_name), fill=GREY_DARK)

        y += logo_r * 2 + int(H * 0.03)

        # ── Headline lines ───────────────────────────────────────────────────
        headline_lines  = layout.get("headline", ["Your Headline"])
        headline_colors = layout.get("headline_colors", ["dark"] * len(headline_lines))
        for i, line in enumerate(headline_lines):
            color = GREEN_DARK if headline_colors[i] == "dark" else GREEN_BRIGHT
            # Measure and check if line fits within LEFT_ZONE
            bbox = draw.textbbox((0, 0), line, font=fn_black(sz_headline))
            line_w = bbox[2] - bbox[0]
            # If too wide, shrink font slightly
            fs = sz_headline
            while line_w > (LEFT_ZONE - PAD * 2) and fs > 20:
                fs -= 2
                bbox = draw.textbbox((0, 0), line, font=fn_black(fs))
                line_w = bbox[2] - bbox[0]
            draw.text((PAD, y), line, font=fn_black(fs), fill=color)
            y += fs + int(H * 0.006)

        y += int(H * 0.012)

        # ── Subheadline ──────────────────────────────────────────────────────
        subheadline = layout.get("subheadline", "")
        if subheadline:
            # Word-wrap within LEFT_ZONE
            words = subheadline.split()
            line_buf, wrapped = [], []
            for word in words:
                test = " ".join(line_buf + [word])
                bbox = draw.textbbox((0, 0), test, font=fn_regular(sz_sub))
                if bbox[2] - bbox[0] > (LEFT_ZONE - PAD * 2):
                    wrapped.append(" ".join(line_buf))
                    line_buf = [word]
                else:
                    line_buf.append(word)
            if line_buf:
                wrapped.append(" ".join(line_buf))
            for sub_line in wrapped:
                draw.text((PAD, y), sub_line, font=fn_regular(sz_sub), fill=GREY_DARK)
                y += sz_sub + int(H * 0.006)

        y += int(H * 0.02)

        # ── Icon row ─────────────────────────────────────────────────────────
        icons = layout.get("icons", [])
        if icons:
            n_icons    = len(icons)
            avail_w    = LEFT_ZONE - PAD * 2
            icon_gap   = int(W * 0.015)
            icon_box_w = min(int(avail_w / n_icons) - icon_gap, int(W * 0.13))
            icon_box_h = int(H * 0.10)
            icon_radius = int(icon_box_w * 0.14)
            border_w   = max(2, int(W * 0.0025))

            # Icon symbols (unicode) — safe fallback chars
            ICON_CHARS = ["✚", "⚙", "🕐", "♡", "✦", "★"]

            for j, label in enumerate(icons):
                x0 = PAD + j * (icon_box_w + icon_gap)
                y0 = y
                x1 = x0 + icon_box_w
                y1 = y0 + icon_box_h
                if x1 > LEFT_ZONE - int(PAD * 0.3):
                    break

                # Card background
                draw.rounded_rectangle(
                    [(x0, y0), (x1, y1)],
                    radius=icon_radius,
                    fill=(236, 255, 244),
                    outline=GREEN_BRIGHT,
                    width=border_w,
                )

                # Icon symbol in center top area
                icon_char = ICON_CHARS[j % len(ICON_CHARS)]
                try:
                    ic_font = fn_regular(int(icon_box_h * 0.35))
                    ic_bbox = draw.textbbox((0, 0), icon_char, font=ic_font)
                    ic_w = ic_bbox[2] - ic_bbox[0]
                    ic_x = x0 + (icon_box_w - ic_w) // 2
                    ic_y = y0 + int(icon_box_h * 0.08)
                    draw.text((ic_x, ic_y), icon_char, font=ic_font, fill=GREEN_DARK)
                except Exception:
                    pass

                # Label — word-wrap within icon box
                words_label = label.split()
                label_lines, buf = [], []
                for w in words_label:
                    test = " ".join(buf + [w])
                    bbox = draw.textbbox((0, 0), test, font=fn_regular(sz_icon))
                    if bbox[2] - bbox[0] > icon_box_w - 6:
                        label_lines.append(" ".join(buf))
                        buf = [w]
                    else:
                        buf.append(w)
                if buf:
                    label_lines.append(" ".join(buf))

                label_block_h = len(label_lines) * (sz_icon + 2)
                label_y_start = y1 - label_block_h - int(icon_box_h * 0.1)
                for lbl in label_lines:
                    lb = draw.textbbox((0, 0), lbl, font=fn_regular(sz_icon))
                    lbl_x = x0 + (icon_box_w - (lb[2] - lb[0])) // 2
                    draw.text((lbl_x, label_y_start), lbl, font=fn_regular(sz_icon), fill=GREY_DARK)
                    label_y_start += sz_icon + 2

        # ── Badge (bottom-right of LEFT zone, above footer) ──────────────────
        badge_lines = layout.get("badge_text", [])
        if badge_lines:
            badge_pad = int(W * 0.025)
            badge_x0  = int(W * 0.34)
            badge_y0  = H - FOOTER_H - int(H * 0.13)
            badge_x1  = LEFT_ZONE + int(W * 0.02)
            badge_y1  = H - FOOTER_H - int(H * 0.02)
            draw.rounded_rectangle(
                [(badge_x0, badge_y0), (badge_x1, badge_y1)],
                radius=int(H * 0.025),
                fill=GREEN_DARK,
            )
            bby = badge_y0 + badge_pad
            for bl in badge_lines:
                draw.text((badge_x0 + badge_pad, bby), bl, font=fn_bold(sz_badge), fill=WHITE)
                bby += sz_badge + 4

        # ── Footer ────────────────────────────────────────────────────────────
        footer_y = H - FOOTER_H
        draw.rectangle([(0, footer_y), (W, H)], fill=FOOTER_COLOR)

        # WhatsApp circle icon
        icon_r = int(FOOTER_H * 0.38)
        ic_cx  = PAD + icon_r
        ic_cy  = footer_y + FOOTER_H // 2
        draw.ellipse([(ic_cx - icon_r, ic_cy - icon_r), (ic_cx + icon_r, ic_cy + icon_r)], fill=WHITE)
        draw.text(
            (ic_cx - icon_r + int(icon_r * 0.25), ic_cy - icon_r + int(icon_r * 0.2)),
            "✆", font=fn_bold(int(icon_r * 1.2)), fill=GREEN_DARK
        )

        # Phone number + label
        phone       = layout.get("phone", "")
        phone_label = layout.get("phone_label", "(WhatsApp Business)")
        text_x = ic_cx + icon_r + int(W * 0.02)
        text_y = footer_y + int(FOOTER_H * 0.12)
        if phone:
            draw.text((text_x, text_y), phone, font=fn_black(sz_footer), fill=WHITE)
        draw.text((text_x, text_y + sz_footer + 2), phone_label, font=fn_regular(int(sz_footer * 0.52)), fill=(220, 255, 220))

        # ── Finalize ──────────────────────────────────────────────────────────
        final = img.convert("RGB")
        buf   = BytesIO()
        final.save(buf, format="PNG")
        if filepath and os.path.exists(filepath):
            final.save(filepath, format="PNG")
        logger.info("[TextOverlay] Complete.")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    except Exception as e:
        logger.error(f"[TextOverlay] Failed: {e}", exc_info=True)
        return b64_string