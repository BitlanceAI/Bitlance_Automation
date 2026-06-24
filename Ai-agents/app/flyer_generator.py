"""
flyer_generator.py — Builds a complete professional flyer from scratch using Pillow.
Supports 4 distinct visually unique layout templates.
"""

from __future__ import annotations

import base64
import logging
import os
import re
import math
from io import BytesIO
from typing import Optional

import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps

logger = logging.getLogger(__name__)

NOTO_DIR   = "/usr/share/fonts/truetype/noto"
DEJAVU_DIR = "/usr/share/fonts/truetype/dejavu"


def _font(name: str, size: int) -> ImageFont.FreeTypeFont:
    for p in [
        os.path.join(NOTO_DIR, name),
        os.path.join(DEJAVU_DIR, name.replace("NotoSans", "DejaVuSans")),
        os.path.join(DEJAVU_DIR, "DejaVuSans-Bold.ttf"),
    ]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def _download_image(url: str) -> Optional[Image.Image]:
    try:
        if os.path.exists(url):
            return Image.open(url).convert("RGBA")
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        return Image.open(BytesIO(r.content)).convert("RGBA")
    except Exception as e:
        logger.error(f"[FlyerGen] Download failed {url}: {e}")
        return None


def _load_logo_image(src: str) -> Optional[Image.Image]:
    if not src:
        return None
    try:
        if os.path.exists(src):
            return Image.open(src).convert("RGBA")
        elif src.startswith("data:image"):
            import re
            base64_data = re.sub(r'^data:image/.+;base64,', '', src)
            return Image.open(BytesIO(base64.b64decode(base64_data))).convert("RGBA")
        elif src.startswith("http"):
            r = requests.get(src, timeout=15)
            r.raise_for_status()
            return Image.open(BytesIO(r.content)).convert("RGBA")
        else:
            # Fallback to direct base64 decode
            return Image.open(BytesIO(base64.b64decode(src))).convert("RGBA")
    except Exception as e:
        logger.error(f"[FlyerGen] Logo load failed: {e}")
        return None


def _wrap(draw, text: str, font, max_w: int) -> list[str]:
    words, lines, buf = text.split(), [], []
    for word in words:
        test = " ".join(buf + [word])
        if draw.textbbox((0, 0), test, font=font)[2] > max_w:
            if buf:
                lines.append(" ".join(buf))
            buf = [word]
        else:
            buf.append(word)
    if buf:
        lines.append(" ".join(buf))
    return lines or [""]


def save_and_encode(pil_img: Image.Image, filepath: Optional[str] = None) -> str:
    buf = BytesIO()
    pil_img.convert("RGB").save(buf, format="PNG")
    if filepath:
        pil_img.convert("RGB").save(filepath, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


# ── GLOBAL DRAWING HELPERS ──────────────────────────────────────────────────

def _draw_heart(draw_obj, cx, cy, size, color):
    points = []
    h_steps = 60
    for step in range(h_steps):
        theta = (step / h_steps) * 2 * math.pi
        x = 16 * (math.sin(theta) ** 3)
        y = -(13 * math.cos(theta) - 5 * math.cos(2*theta) - 2 * math.cos(3*theta) - math.cos(4*theta))
        px = cx + x * (size / 32.0)
        py = cy + y * (size / 32.0)
        points.append((px, py))
    draw_obj.polygon(points, fill=color)


def _draw_niche_logo(draw, niche: str, lcx: int, lcy: int, logo_r: int, GD, GB, WHT):
    if niche in ["healthcare", "dental"]:
        # Leaf outline enclosing heart-cross
        leaf_pts = []
        for i in range(16):
            t = i / 15.0
            xt = int((1-t)**2 * lcx + 2*(1-t)*t * (lcx - logo_r * 1.05) + t**2 * lcx)
            yt = int((1-t)**2 * (lcy - logo_r) + 2*(1-t)*t * lcy + t**2 * (lcy + logo_r))
            leaf_pts.append((xt, yt))
        for i in range(16):
            t = i / 15.0
            xt = int((1-t)**2 * lcx + 2*(1-t)*t * (lcx + logo_r * 1.05) + t**2 * lcx)
            yt = int((1-t)**2 * (lcy + logo_r) + 2*(1-t)*t * lcy + t**2 * (lcy - logo_r))
            leaf_pts.append((xt, yt))
        draw.polygon(leaf_pts, outline=GD, width=5)
        _draw_heart(draw, lcx, lcy + 1, logo_r * 0.52, GD)
        draw.line([(lcx - 4, lcy + 1), (lcx + 4, lcy + 1)], fill=WHT, width=2)
        draw.line([(lcx, lcy - 3), (lcx, lcy + 5)], fill=WHT, width=2)
    elif niche == "real_estate":
        # House outline logo fallback
        hw, hh = logo_r * 0.8, logo_r * 0.8
        roof = [(lcx, lcy - hh), (lcx - hw, lcy), (lcx + hw, lcy)]
        draw.polygon(roof, outline=GD, width=4)
        draw.rectangle([(lcx - hw * 0.7, lcy), (lcx + hw * 0.7, lcy + hh)], outline=GD, width=4)
        # Door
        draw.rectangle([(lcx - hw * 0.22, lcy + hh * 0.4), (lcx + hw * 0.22, lcy + hh)], fill=GD)
    elif niche == "fitness":
        # Shield with flame/dumbbell logo fallback
        sw, sh = logo_r * 0.8, logo_r * 0.85
        shield_pts = [
            (lcx - sw, lcy - sh), (lcx + sw, lcy - sh),
            (lcx + sw, lcy),
            (lcx, lcy + sh),
            (lcx - sw, lcy)
        ]
        draw.polygon(shield_pts, outline=GD, width=4)
        draw.line([(lcx - 6, lcy), (lcx + 6, lcy)], fill=GB, width=4)
        draw.ellipse([(lcx - 10, lcy - 5), (lcx - 5, lcy + 5)], fill=GB)
        draw.ellipse([(lcx + 5, lcy - 5), (lcx + 10, lcy + 5)], fill=GB)
    elif niche == "education":
        # Cap logo fallback
        cw, ch = logo_r * 0.9, logo_r * 0.35
        cap_top = [(lcx, lcy - ch), (lcx + cw, lcy), (lcx, lcy + ch), (lcx - cw, lcy)]
        draw.polygon(cap_top, fill=GD)
        draw.chord([(lcx - cw * 0.45, lcy), (lcx + cw * 0.45, lcy + ch * 1.6)], start=0, end=180, fill=GD)
        draw.line([(lcx, lcy), (lcx + cw * 0.6, lcy + ch * 0.7)], fill=GB, width=2)
        draw.ellipse([(lcx + cw * 0.6 - 2, lcy + ch * 0.7 - 2), (lcx + cw * 0.6 + 2, lcy + ch * 0.7 + 2)], fill=GB)
    else:
        # Monogram Hexagon fallback
        side = logo_r * 0.85
        hex_pts = []
        for i in range(6):
            angle = i * math.pi / 3
            hex_pts.append((lcx + side * math.sin(angle), lcy - side * math.cos(angle)))
        draw.polygon(hex_pts, outline=GD, width=4)
        draw.ellipse([(lcx - 5, lcy - 5), (lcx + 5, lcy + 5)], fill=GB)


def _draw_niche_icon(draw, niche: str, idx: int, col_cx: int, ic_cy: int, container_h: int, GD, GB, WHT):
    if niche == "real_estate":
        if idx == 0:
            # House outline
            r_h = int(container_h * 0.11)
            draw.polygon([(col_cx, ic_cy - r_h), (col_cx - r_h, ic_cy), (col_cx + r_h, ic_cy)], outline=GD, width=2)
            draw.rectangle([(col_cx - r_h * 0.8, ic_cy), (col_cx + r_h * 0.8, ic_cy + r_h)], outline=GD, width=2)
        elif idx == 1:
            # Key/Shield
            r_circ = int(container_h * 0.08)
            draw.ellipse([(col_cx - r_circ, ic_cy - r_circ * 1.5), (col_cx + r_circ, ic_cy - r_circ * 0.5)], outline=GD, width=2)
            draw.line([(col_cx, ic_cy - r_circ * 0.5), (col_cx, ic_cy + r_circ * 1.2)], fill=GD, width=2)
            draw.line([(col_cx, ic_cy + r_circ * 0.5), (col_cx + r_circ * 0.6, ic_cy + r_circ * 0.5)], fill=GD, width=2)
            draw.line([(col_cx, ic_cy + r_circ * 1.0), (col_cx + r_circ * 0.6, ic_cy + r_circ * 1.0)], fill=GD, width=2)
        elif idx == 2:
            # Location Pin
            r_pin = int(container_h * 0.09)
            draw.ellipse([(col_cx - r_pin, ic_cy - r_pin * 1.2), (col_cx + r_pin, ic_cy + r_pin * 0.4)], outline=GD, width=2)
            draw.ellipse([(col_cx - r_pin * 0.3, ic_cy - r_pin * 0.6), (col_cx + r_pin * 0.3, ic_cy - r_pin * 0.0)], fill=GD)
            draw.polygon([(col_cx - r_pin, ic_cy), (col_cx, ic_cy + r_pin * 1.1), (col_cx + r_pin, ic_cy)], fill=GD)
        else:
            # Star
            r_star = int(container_h * 0.12)
            star_pts = []
            for s in range(5):
                angle = s * 2 * math.pi / 5 - math.pi / 2
                star_pts.append((col_cx + r_star * math.cos(angle), ic_cy + r_star * math.sin(angle)))
                angle += math.pi / 5
                star_pts.append((col_cx + r_star * 0.45 * math.cos(angle), ic_cy + r_star * 0.45 * math.sin(angle)))
            draw.polygon(star_pts, fill=GD)
    elif niche == "dental":
        if idx == 0:
            # Tooth
            r_t = int(container_h * 0.11)
            draw.ellipse([(col_cx - r_t * 0.8, ic_cy - r_t * 0.8), (col_cx + r_t * 0.8, ic_cy + r_t * 0.3)], fill=GD)
            draw.rectangle([(col_cx - r_t * 0.6, ic_cy), (col_cx + r_t * 0.6, ic_cy + r_t * 0.9)], fill=GD)
            draw.ellipse([(col_cx - r_t * 0.4, ic_cy - r_t * 1.1), (col_cx + r_t * 0.4, ic_cy - r_t * 0.5)], fill=WHT)
        elif idx == 1:
            # Toothbrush
            r_b = int(container_h * 0.11)
            draw.line([(col_cx - r_b, ic_cy + r_b), (col_cx + r_b * 0.8, ic_cy - r_b * 0.8)], fill=GD, width=3)
            draw.rectangle([(col_cx + r_b * 0.4, ic_cy - r_b * 1.0), (col_cx + r_b * 0.9, ic_cy - r_b * 0.5)], fill=GB)
        elif idx == 2:
            # Shield
            r_s = int(container_h * 0.11)
            draw.polygon([(col_cx - r_s, ic_cy - r_s), (col_cx + r_s, ic_cy - r_s), (col_cx + r_s, ic_cy), (col_cx, ic_cy + r_s), (col_cx - r_s, ic_cy)], fill=GD)
            draw.ellipse([(col_cx - r_s * 0.4, ic_cy - r_s * 0.4), (col_cx + r_s * 0.4, ic_cy + r_s * 0.4)], fill=WHT)
        else:
            # Sparkle
            r_sp = int(container_h * 0.12)
            sparkle_pts = [
                (col_cx, ic_cy - r_sp), (col_cx + r_sp * 0.3, ic_cy - r_sp * 0.3),
                (col_cx + r_sp, ic_cy), (col_cx + r_sp * 0.3, ic_cy + r_sp * 0.3),
                (col_cx, ic_cy + r_sp), (col_cx - r_sp * 0.3, ic_cy + r_sp * 0.3),
                (col_cx - r_sp, ic_cy), (col_cx - r_sp * 0.3, ic_cy - r_sp * 0.3)
            ]
            draw.polygon(sparkle_pts, fill=GD)
    elif niche == "fitness":
        if idx == 0:
            # Dumbbell
            r_d = int(container_h * 0.11)
            draw.line([(col_cx - r_d, ic_cy), (col_cx + r_d, ic_cy)], fill=GD, width=4)
            draw.rectangle([(col_cx - r_d, ic_cy - r_d * 0.6), (col_cx - r_d * 0.7, ic_cy + r_d * 0.6)], fill=GD)
            draw.rectangle([(col_cx + r_d * 0.7, ic_cy - r_d * 0.6), (col_cx + r_d, ic_cy + r_d * 0.6)], fill=GD)
        elif idx == 1:
            # Flame
            r_f = int(container_h * 0.11)
            draw.ellipse([(col_cx - r_f * 0.8, ic_cy - r_f * 0.5), (col_cx + r_f * 0.8, ic_cy + r_f)], fill=GD)
            draw.polygon([(col_cx - r_f * 0.8, ic_cy), (col_cx, ic_cy - r_f * 1.1), (col_cx + r_f * 0.8, ic_cy)], fill=GD)
        elif idx == 2:
            # Stopwatch
            r_w = int(container_h * 0.11)
            draw.ellipse([(col_cx - r_w, ic_cy - r_w), (col_cx + r_w, ic_cy + r_w)], outline=GD, width=2)
            draw.line([(col_cx, ic_cy), (col_cx, ic_cy - int(r_w * 0.6))], fill=GD, width=2)
            draw.line([(col_cx, ic_cy), (col_cx + int(r_w * 0.5), ic_cy)], fill=GD, width=2)
            draw.rectangle([(col_cx - 3, ic_cy - r_w - 3), (col_cx + 3, ic_cy - r_w)], fill=GD)
        else:
            # Trophy
            r_tr = int(container_h * 0.11)
            draw.rectangle([(col_cx - r_tr * 0.6, ic_cy - r_tr * 0.8), (col_cx + r_tr * 0.6, ic_cy)], fill=GD)
            draw.line([(col_cx, ic_cy), (col_cx, ic_cy + r_tr * 0.7)], fill=GD, width=3)
            draw.rectangle([(col_cx - r_tr * 0.5, ic_cy + r_tr * 0.7), (col_cx + r_tr * 0.5, ic_cy + r_tr * 0.9)], fill=GD)
    elif niche == "education":
        if idx == 0:
            # Book
            r_b = int(container_h * 0.11)
            draw.rectangle([(col_cx - r_b, ic_cy - r_b * 0.5), (col_cx, ic_cy + r_b * 0.5)], outline=GD, width=2)
            draw.rectangle([(col_cx, ic_cy - r_b * 0.5), (col_cx + r_b, ic_cy + r_b * 0.5)], outline=GD, width=2)
        elif idx == 1:
            # Cap
            r_c = int(container_h * 0.11)
            draw.polygon([(col_cx, ic_cy - r_c * 0.5), (col_cx + r_c, ic_cy), (col_cx, ic_cy + r_c * 0.5), (col_cx - r_c, ic_cy)], fill=GD)
            draw.chord([(col_cx - r_c * 0.45, ic_cy), (col_cx + r_c * 0.45, ic_cy + r_c * 0.7)], start=0, end=180, fill=GD)
        elif idx == 2:
            # Lightbulb
            r_l = int(container_h * 0.09)
            draw.ellipse([(col_cx - r_l, ic_cy - r_l * 1.1), (col_cx + r_l, ic_cy + r_l * 0.2)], outline=GD, width=2)
            draw.rectangle([(col_cx - r_l * 0.5, ic_cy + r_l * 0.2), (col_cx + r_l * 0.5, ic_cy + r_l * 0.9)], fill=GD)
        else:
            # Certificate
            r_r = int(container_h * 0.11)
            draw.ellipse([(col_cx - r_r * 0.6, ic_cy - r_r * 0.6), (col_cx + r_r * 0.6, ic_cy + r_r * 0.6)], outline=GD, width=2)
            draw.polygon([(col_cx - r_r * 0.4, ic_cy + r_r * 0.4), (col_cx - r_r * 0.7, ic_cy + r_r * 1.2), (col_cx, ic_cy + r_r * 0.8)], fill=GD)
            draw.polygon([(col_cx + r_r * 0.4, ic_cy + r_r * 0.4), (col_cx + r_r * 0.7, ic_cy + r_r * 1.2), (col_cx, ic_cy + r_r * 0.8)], fill=GD)
    else:
        if idx == 0:
            # Silhouette
            r_head = int(container_h * 0.11)
            draw.ellipse([(col_cx - r_head, ic_cy - 1.2 * r_head), (col_cx + r_head, ic_cy - 0.2 * r_head)], fill=GD)
            draw.chord([(col_cx - 1.4 * r_head, ic_cy), (col_cx + 1.4 * r_head, ic_cy + r_head)], start=180, end=360, fill=GD)
        elif idx == 1:
            # Gear
            r_circ = int(container_h * 0.12)
            draw.ellipse([(col_cx - r_circ, ic_cy - r_circ), (col_cx + r_circ, ic_cy + r_circ)], outline=GD, width=2)
            arm = int(r_circ * 0.55)
            thick = max(1, int(r_circ * 0.22))
            draw.rectangle([(col_cx - arm, ic_cy - thick), (col_cx + arm, ic_cy + thick)], fill=GD)
            draw.rectangle([(col_cx - thick, ic_cy - arm), (col_cx + thick, ic_cy + arm)], fill=GD)
        elif idx == 2:
            # Clock
            r_clock = int(container_h * 0.12)
            draw.ellipse([(col_cx - r_clock, ic_cy - r_clock), (col_cx + r_clock, ic_cy + r_clock)], outline=GD, width=2)
            draw.line([(col_cx, ic_cy), (col_cx, ic_cy - int(r_clock * 0.6))], fill=GD, width=2)
            draw.line([(col_cx, ic_cy), (col_cx + int(r_clock * 0.5), ic_cy)], fill=GD, width=2)
        else:
            # Heart
            r_heart = int(container_h * 0.24)
            _draw_heart(draw, col_cx, ic_cy, r_heart, GD)


# ── TEMPLATE A: SPLIT CURVE (CURRENT LOOK, CLEANED) ─────────────────────────

def _layout_split_curve(layout: dict, ref_url: Optional[str] = None) -> str:
    import re
    size_match = re.match(r"(\d+)x(\d+)", layout.get("image_size", "1536x1024"))
    W, H = (int(size_match.group(1)), int(size_match.group(2))) if size_match else (1536, 1024)
        
    img  = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    GD   = tuple(layout.get("primary_color") or layout.get("green_dark") or [6, 95, 70])
    GB   = tuple(layout.get("secondary_color") or layout.get("green_bright") or [16, 185, 129])
    BG   = tuple(layout.get("background_color") or [245, 248, 246])
    BLK  = (30, 41, 59)
    GRY  = (100, 116, 139)
    WHT  = (255, 255, 255)
    
    aspect_ratio = W / H
    is_square = aspect_ratio < 1.2
    steps = 40

    # 1. Background Fill
    draw.rectangle([(0, 0), (W, H)], fill=(BG[0], BG[1], BG[2], 255))

    # 2. Top-Left Wave
    wave_top = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wt_draw = ImageDraw.Draw(wave_top)
    wt_points = []
    for i in range(steps + 1):
        t = i / steps
        xt = int(t * (W * 0.55))
        yt = int((1-t)**2 * 0 + 2*(1-t)*t * (H * 0.15) + t**2 * 0)
        wt_points.append((xt, yt))
    wt_points.extend([(int(W * 0.55), 0), (0, 0)])
    wt_draw.polygon(wt_points, fill=(GB[0], GB[1], GB[2], 25))
    img = Image.alpha_composite(img, wave_top)
    draw = ImageDraw.Draw(img)

    # 3. Bottom Layered Curve Waves
    wave_bottom = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wb_draw = ImageDraw.Draw(wave_bottom)
    
    w1_points = []
    for i in range(steps + 1):
        t = i / steps
        xt = int(t * W)
        yt = int((1-t)**2 * (H * 0.93) + 2*(1-t)*t * (H * 0.88) + t**2 * (H * 0.94))
        w1_points.append((xt, yt))
    w1_points.extend([(W, H), (0, H)])
    wb_draw.polygon(w1_points, fill=(GB[0], GB[1], GB[2], 35))
    
    w2_points = []
    for i in range(steps + 1):
        t = i / steps
        xt = int(t * W)
        yt = int((1-t)**2 * (H * 0.95) + 2*(1-t)*t * (H * 0.92) + t**2 * (H * 0.97))
        w2_points.append((xt, yt))
    w2_points.extend([(W, H), (0, H)])
    wb_draw.polygon(w2_points, fill=(GD[0], GD[1], GD[2], 45))
    
    img = Image.alpha_composite(img, wave_bottom)
    draw = ImageDraw.Draw(img)

    # 4. Dot-grid pattern
    dot_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dot_d     = ImageDraw.Draw(dot_layer)
    dot_r     = int(W * 0.004)
    dot_gap   = int(W * 0.026)
    dot_col   = (GB[0], GB[1], GB[2], 40)
    
    grid1_x_start = int(W * (0.50 if is_square else 0.42))
    grid1_x_end = int(W * (0.60 if is_square else 0.52))
    for gx in range(grid1_x_start, grid1_x_end, dot_gap):
        for gy in range(int(H * 0.03), int(H * 0.15), dot_gap):
            dot_d.ellipse([(gx - dot_r, gy - dot_r), (gx + dot_r, gy + dot_r)], fill=dot_col)
            
    grid2_x_start = int(W * (0.42 if is_square else 0.35))
    grid2_x_end = int(W * (0.52 if is_square else 0.45))
    for gx in range(grid2_x_start, grid2_x_end, dot_gap):
        for gy in range(int(H * 0.85), int(H * 0.94), dot_gap):
            dot_d.ellipse([(gx - dot_r, gy - dot_r), (gx + dot_r, gy + dot_r)], fill=dot_col)
            
    img = Image.alpha_composite(img, dot_layer)
    draw = ImageDraw.Draw(img)

    # 5. Mask + Photo
    if is_square:
        x0, y0 = int(W * 0.82), 0
        x1, y1 = int(W * 0.54), int(H * 0.46)
        x2, y2 = int(W * 0.82), H
        target_w = int(W * 0.50)
    else:
        x0, y0 = int(W * 0.70), 0
        x1, y1 = int(W * 0.45), int(H * 0.46)
        x2, y2 = int(W * 0.75), H
        target_w = int(W * 0.6)
    
    border_points = []
    for i in range(steps + 1):
        t = i / steps
        xt = int((1-t)**2 * x0 + 2*(1-t)*t * x1 + t**2 * x2)
        yt = int((1-t)**2 * y0 + 2*(1-t)*t * y1 + t**2 * y2)
        border_points.append((xt, yt))
        
    border_left = [(x - 8, y) for (x, y) in border_points]
    draw.line(border_left, fill=GB, width=14)
    draw.line([(x - 2, y) for (x, y) in border_points], fill=WHT, width=3)
    
    photo_mask = Image.new("L", (W, H), 0)
    pm_draw = ImageDraw.Draw(photo_mask)
    poly_points = list(border_points)
    poly_points.append((W, H))
    poly_points.append((W, 0))
    pm_draw.polygon(poly_points, fill=255)
    
    photo_layer = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    pl_draw = ImageDraw.Draw(photo_layer)
    for row in range(H):
        t = row / H
        r = int((GB[0] * 0.2 + 200) * (1 - t) + (GD[0] * 0.15 + 210) * t)
        g = int((GB[1] * 0.2 + 200) * (1 - t) + (GD[1] * 0.15 + 210) * t)
        b = int((GB[2] * 0.2 + 200) * (1 - t) + (GD[2] * 0.15 + 210) * t)
        pl_draw.line([(0, row), (W, row)], fill=(r, g, b))
    
    if ref_url:
        ref_img = _download_image(ref_url)
        if ref_img:
            ref_img = ImageOps.fit(ref_img, (target_w, H), Image.Resampling.LANCZOS)
            photo_layer.paste(ref_img, (W - target_w, 0))
            
    img.paste(photo_layer, (0, 0), photo_mask)
    draw = ImageDraw.Draw(img)

    # 6. Header
    PAD = int(W * 0.05)
    y_logo = int(H * 0.045)
    sz_nm = max(18, int(H * (0.035 if is_square else 0.043)))
    sz_sub_nm = max(10, int(H * (0.016 if is_square else 0.020)))
    
    logo_r = int(sz_nm * 0.95)
    logo_img_src = layout.get("logo_image")
    logo_img = _load_logo_image(logo_img_src) if logo_img_src else None
    
    if logo_img:
        max_h = logo_r * 2
        max_w = int(logo_r * 2.5)
        logo_img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        img.paste(logo_img, (PAD, y_logo), logo_img)
        nx = PAD + logo_img.width + int(W * 0.015)
    else:
        niche = layout.get("niche", "healthcare").lower()
        lcx, lcy = PAD + logo_r, y_logo + logo_r
        _draw_niche_logo(draw, niche, lcx, lcy, logo_r, GD, GB, WHT)
        nx = PAD + logo_r * 2 + int(W * 0.015)
    
    fn_nm = _font("NotoSans-Black.ttf", sz_nm)
    fn_sn = _font("NotoSans-Regular.ttf", sz_sub_nm)
    
    draw.text((nx, y_logo), layout.get("brand_name") or layout.get("hospital_name") or "BRAND", font=fn_nm, fill=GD)
    draw.text((nx, y_logo + sz_nm + 2), layout.get("brand_sub") or layout.get("hospital_sub") or "", font=fn_sn, fill=GRY)

    headlines = layout.get("headline", ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."])
    if not headlines:
        headlines = ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."]
        
    sz_h = max(28, int(H * 0.044)) if is_square else max(38, int(H * 0.072))
    y_head = y_logo + sz_nm + sz_sub_nm + int(H * (0.05 if is_square else 0.055))
    fn_h = _font("NotoSans-Black.ttf", sz_h)
    
    for idx, hl in enumerate(headlines[:3]):
        color = GD if idx == 0 else BLK
        draw.text((PAD, y_head), hl, font=fn_h, fill=color)
        y_head += sz_h + int(H * 0.008)
        
    sub = layout.get("subheadline", "Comprehensive healthcare under one roof for you & your family.")
    sz_s = max(12, int(H * (0.018 if is_square else 0.024)))
    y_sub = y_head + int(H * (0.012 if is_square else 0.018))
    fn_s = _font("NotoSans-Regular.ttf", sz_s)
    
    wrap_w = int(W * 0.48) if is_square else int(W * 0.41)
    for sl in _wrap(draw, sub, fn_s, wrap_w):
        draw.text((PAD, y_sub), sl, font=fn_s, fill=GRY)
        y_sub += sz_s + int(H * 0.006)

    # 8. Highlights
    sz_ic = max(10, int(H * (0.013 if is_square else 0.018)))
    y_icons = y_sub + int(H * (0.025 if is_square else 0.035))
    
    icons = layout.get("icons", ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"])
    if not icons or len(icons) < 4:
        icons = ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"]
        
    n_icons = 4
    container_x0 = PAD
    container_y0 = y_icons
    container_x1 = int(W * 0.50)
    container_h  = int(H * (0.11 if is_square else 0.14))
    container_y1 = container_y0 + container_h
    
    draw.rounded_rectangle(
        [(container_x0, container_y0), (container_x1, container_y1)],
        radius=int(container_h * 0.12),
        fill=(int(GB[0]*0.05 + 242), int(GB[1]*0.05 + 242), int(GB[2]*0.05 + 242), 255),
        outline=(int(GB[0]*0.4 + 150), int(GB[1]*0.4 + 150), int(GB[2]*0.4 + 150), 255),
        width=2
    )
    
    col_w = (container_x1 - container_x0) / n_icons
    for idx, label in enumerate(icons[:n_icons]):
        col_x0 = container_x0 + idx * col_w
        col_x1 = col_x0 + col_w
        col_cx = col_x0 + col_w / 2
        
        if idx < n_icons - 1:
            draw.line(
                [(col_x1, container_y0 + int(container_h * 0.15)), (col_x1, container_y1 - int(container_h * 0.15))],
                fill=(int(GB[0]*0.3 + 175), int(GB[1]*0.3 + 175), int(GB[2]*0.3 + 175), 255),
                width=1
            )
            
        niche = layout.get("niche", "healthcare").lower()
        ic_cy = container_y0 + int(container_h * 0.35)
        _draw_niche_icon(draw, niche, idx, col_cx, ic_cy, container_h, GD, GB, WHT)
            
        fn_ic = _font("NotoSans-Regular.ttf", sz_ic)
        lbl_lines = _wrap(draw, label, fn_ic, int(col_w - 8))
        lbl_h = len(lbl_lines) * (sz_ic + 2)
        ly = container_y1 - lbl_h - int(container_h * 0.08)
        for line in lbl_lines:
            l_w = draw.textbbox((0, 0), line, font=fn_ic)[2]
            draw.text((col_cx - l_w / 2, ly), line, font=fn_ic, fill=BLK)
            ly += sz_ic + 2

    # 9. Contact Pill
    pill_w = int(W * (0.35 if is_square else 0.28))
    pill_h = int(H * (0.070 if is_square else 0.082))
    pill_x0 = PAD
    pill_y0 = int(H * (0.83 if is_square else 0.81))
    pill_x1 = pill_x0 + pill_w
    pill_y1 = pill_y0 + pill_h
    
    draw.rounded_rectangle(
        [(pill_x0, pill_y0), (pill_x1, pill_y1)],
        radius=int(pill_h * 0.5),
        fill=GD
    )
    
    wsz = int(pill_h * 0.52)
    wcx = pill_x0 + int(pill_h * 0.5)
    wcy = pill_y0 + pill_h // 2
    draw.ellipse([(wcx - wsz//2, wcy - wsz//2), (wcx + wsz//2, wcy + wsz//2)], fill=WHT)
    tail_points = [
        (wcx - int(wsz*0.2), wcy + int(wsz*0.25)),
        (wcx - int(wsz*0.35), wcy + int(wsz*0.35)),
        (wcx - int(wsz*0.1), wcy + int(wsz*0.35))
    ]
    draw.polygon(tail_points, fill=WHT)
    rec_sz = int(wsz * 0.6)
    draw.arc(
        [(wcx - rec_sz//2, wcy - rec_sz//2), (wcx + rec_sz//2, wcy + rec_sz//2)],
        start=100, end=350, fill=GD, width=2
    )
    
    phone = layout.get("phone", "9823125233")
    if not phone or phone == "N/A":
        phone = "9823125233"
    phone_lbl = layout.get("phone_label", "(WhatsApp Business)")
    
    tx = pill_x0 + int(pill_h * 1.05)
    fn_ft = _font("NotoSans-Bold.ttf", max(14, int(pill_h * 0.35)))
    fn_fl = _font("NotoSans-Regular.ttf", max(9, int(pill_h * 0.20)))
    
    draw.text((tx, pill_y0 + int(pill_h * 0.15)), phone, font=fn_ft, fill=WHT)
    lbl_color = (int(WHT[0]*0.7 + GB[0]*0.3), int(WHT[1]*0.7 + GB[1]*0.3), int(WHT[2]*0.7 + GB[2]*0.3))
    draw.text((tx, pill_y0 + int(pill_h * 0.52)), phone_lbl, font=fn_fl, fill=lbl_color)

    # 10. Circular Badge
    badge_r = int(H * (0.100 if is_square else 0.125))
    badge_cx = int(W * (0.76 if is_square else 0.86))
    badge_cy = int(H * (0.78 if is_square else 0.77))
    
    draw.ellipse([(badge_cx - badge_r - 2, badge_cy - badge_r - 2), (badge_cx + badge_r + 2, badge_cy + badge_r + 2)], fill=(0, 0, 0, 15))
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], fill=WHT)
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], outline=GB, width=6)
    
    badge_lines = layout.get("badge_text", ["Your Health", "Our Priority"])
    if not badge_lines:
        badge_lines = ["Your Health", "Our Priority"]
        
    sz_bdg = max(12, int(H * (0.018 if is_square else 0.024)))
    fn_bdg = _font("NotoSans-Bold.ttf", sz_bdg)
    bdg_total_h = len(badge_lines) * (sz_bdg + 4) - 4
    by = badge_cy - bdg_total_h / 2
    for line in badge_lines:
        l_w = draw.textbbox((0, 0), line, font=fn_bdg)[2]
        draw.text((badge_cx - l_w / 2, by), line, font=fn_bdg, fill=GD)
        by += sz_bdg + 4

    return save_and_encode(img)


# ── TEMPLATE B: BOLD HEADER BANNER ──────────────────────────────────────────

def _layout_bold_banner(layout: dict, ref_url: Optional[str] = None) -> str:
    import re
    size_match = re.match(r"(\d+)x(\d+)", layout.get("image_size", "1536x1024"))
    W, H = (int(size_match.group(1)), int(size_match.group(2))) if size_match else (1536, 1024)
        
    img  = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    GD   = tuple(layout.get("primary_color") or layout.get("green_dark") or [6, 95, 70])
    GB   = tuple(layout.get("secondary_color") or layout.get("green_bright") or [16, 185, 129])
    BG   = tuple(layout.get("background_color") or [245, 248, 246])
    BLK  = (30, 41, 59)
    GRY  = (100, 116, 139)
    WHT  = (255, 255, 255)
    
    aspect_ratio = W / H
    is_square = aspect_ratio < 1.2
    
    H_head = int(H * 0.16)
    PAD = int(W * 0.05)
    
    # 1. Background Fill
    draw.rectangle([(0, 0), (W, H)], fill=(BG[0], BG[1], BG[2], 255))
    
    # 2. Photo (Right Side, Diagonally Masked)
    target_w = int(W * 0.40)
    x_top = W - target_w - int(W * 0.06)
    x_bot = W - target_w + int(W * 0.04)
    
    photo_mask = Image.new("L", (W, H), 0)
    pm_draw = ImageDraw.Draw(photo_mask)
    pm_draw.polygon([(x_top, H_head), (W, H_head), (W, H), (x_bot, H), (x_top, H_head)], fill=255)
    
    photo_layer = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    pl_draw = ImageDraw.Draw(photo_layer)
    for row in range(H):
        t = row / H
        r = int((GB[0] * 0.2 + 200) * (1 - t) + (GD[0] * 0.15 + 210) * t)
        g = int((GB[1] * 0.2 + 200) * (1 - t) + (GD[1] * 0.15 + 210) * t)
        b = int((GB[2] * 0.2 + 200) * (1 - t) + (GD[2] * 0.15 + 210) * t)
        pl_draw.line([(0, row), (W, row)], fill=(r, g, b))
        
    if ref_url:
        ref_img = _download_image(ref_url)
        if ref_img:
            ref_img = ImageOps.fit(ref_img, (target_w + int(W * 0.1), H - H_head), Image.Resampling.LANCZOS)
            photo_layer.paste(ref_img, (W - ref_img.width, H_head))
            
    img.paste(photo_layer, (0, 0), photo_mask)
    draw = ImageDraw.Draw(img)
    
    # Draw diagonal border line
    draw.line([(x_top, H_head), (x_bot, H)], fill=GB, width=8)
    
    # 3. Top Banner Header
    draw.rectangle([(0, 0), (W, H_head)], fill=GD)
    draw.line([(0, H_head), (W, H_head)], fill=GB, width=4)
    
    y_logo = int(H_head * 0.20)
    sz_nm = max(18, int(H * (0.035 if is_square else 0.043)))
    sz_sub_nm = max(10, int(H * (0.016 if is_square else 0.020)))
    logo_r = int(sz_nm * 0.95)
    
    logo_img_src = layout.get("logo_image")
    logo_img = _load_logo_image(logo_img_src) if logo_img_src else None
    
    if logo_img:
        max_h = logo_r * 2
        max_w = int(logo_r * 2.5)
        logo_img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        img.paste(logo_img, (PAD, y_logo), logo_img)
        nx = PAD + logo_img.width + int(W * 0.015)
    else:
        niche = layout.get("niche", "healthcare").lower()
        lcx, lcy = PAD + logo_r, y_logo + logo_r
        _draw_niche_logo(draw, niche, lcx, lcy, logo_r, WHT, GB, GD)
        nx = PAD + logo_r * 2 + int(W * 0.015)
        
    fn_nm = _font("NotoSans-Black.ttf", sz_nm)
    fn_sn = _font("NotoSans-Regular.ttf", sz_sub_nm)
    
    draw.text((nx, y_logo), layout.get("brand_name") or layout.get("hospital_name") or "BRAND", font=fn_nm, fill=WHT)
    draw.text((nx, y_logo + sz_nm + 2), layout.get("brand_sub") or layout.get("hospital_sub") or "", font=fn_sn, fill=(int(WHT[0]*0.7 + GB[0]*0.3), int(WHT[1]*0.7 + GB[1]*0.3), int(WHT[2]*0.7 + GB[2]*0.3)))

    headlines = layout.get("headline", ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."])
    if not headlines:
        headlines = ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."]
        
    sz_h = max(28, int(H * 0.044)) if is_square else max(38, int(H * 0.072))
    y_head = H_head + int(H * (0.04 if is_square else 0.05))
    fn_h = _font("NotoSans-Black.ttf", sz_h)
    
    for idx, hl in enumerate(headlines[:3]):
        color = GD if idx == 0 else BLK
        draw.text((PAD, y_head), hl, font=fn_h, fill=color)
        y_head += sz_h + int(H * 0.008)
        
    sub = layout.get("subheadline", "Comprehensive healthcare under one roof for you & your family.")
    sz_s = max(12, int(H * (0.018 if is_square else 0.024)))
    y_sub = y_head + int(H * (0.012 if is_square else 0.018))
    fn_s = _font("NotoSans-Regular.ttf", sz_s)
    
    wrap_w = int(W * 0.48) if is_square else int(W * 0.41)
    for sl in _wrap(draw, sub, fn_s, wrap_w):
        draw.text((PAD, y_sub), sl, font=fn_s, fill=GRY)
        y_sub += sz_s + int(H * 0.006)

    # 5. Highlights Container
    sz_ic = max(10, int(H * (0.013 if is_square else 0.018)))
    y_icons = y_sub + int(H * (0.025 if is_square else 0.035))
    
    icons = layout.get("icons", ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"])
    if not icons or len(icons) < 4:
        icons = ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"]
        
    n_icons = 4
    container_x0 = PAD
    container_y0 = y_icons
    container_x1 = int(W * 0.50)
    container_h  = int(H * (0.11 if is_square else 0.14))
    container_y1 = container_y0 + container_h
    
    draw.rounded_rectangle(
        [(container_x0, container_y0), (container_x1, container_y1)],
        radius=int(container_h * 0.12),
        fill=(int(GB[0]*0.05 + 242), int(GB[1]*0.05 + 242), int(GB[2]*0.05 + 242), 255),
        outline=(int(GB[0]*0.4 + 150), int(GB[1]*0.4 + 150), int(GB[2]*0.4 + 150), 255),
        width=2
    )
    
    col_w = (container_x1 - container_x0) / n_icons
    for idx, label in enumerate(icons[:n_icons]):
        col_x0 = container_x0 + idx * col_w
        col_x1 = col_x0 + col_w
        col_cx = col_x0 + col_w / 2
        
        if idx < n_icons - 1:
            draw.line(
                [(col_x1, container_y0 + int(container_h * 0.15)), (col_x1, container_y1 - int(container_h * 0.15))],
                fill=(int(GB[0]*0.3 + 175), int(GB[1]*0.3 + 175), int(GB[2]*0.3 + 175), 255),
                width=1
            )
            
        niche = layout.get("niche", "healthcare").lower()
        ic_cy = container_y0 + int(container_h * 0.35)
        _draw_niche_icon(draw, niche, idx, col_cx, ic_cy, container_h, GD, GB, WHT)
            
        fn_ic = _font("NotoSans-Regular.ttf", sz_ic)
        lbl_lines = _wrap(draw, label, fn_ic, int(col_w - 8))
        lbl_h = len(lbl_lines) * (sz_ic + 2)
        ly = container_y1 - lbl_h - int(container_h * 0.08)
        for line in lbl_lines:
            l_w = draw.textbbox((0, 0), line, font=fn_ic)[2]
            draw.text((col_cx - l_w / 2, ly), line, font=fn_ic, fill=BLK)
            ly += sz_ic + 2

    # 6. Contact Pill
    pill_w = int(W * (0.35 if is_square else 0.28))
    pill_h = int(H * (0.070 if is_square else 0.082))
    pill_x0 = PAD
    pill_y0 = int(H * (0.83 if is_square else 0.81))
    pill_x1 = pill_x0 + pill_w
    pill_y1 = pill_y0 + pill_h
    
    draw.rounded_rectangle(
        [(pill_x0, pill_y0), (pill_x1, pill_y1)],
        radius=int(pill_h * 0.5),
        fill=GD
    )
    
    wsz = int(pill_h * 0.52)
    wcx = pill_x0 + int(pill_h * 0.5)
    wcy = pill_y0 + pill_h // 2
    draw.ellipse([(wcx - wsz//2, wcy - wsz//2), (wcx + wsz//2, wcy + wsz//2)], fill=WHT)
    tail_points = [
        (wcx - int(wsz*0.2), wcy + int(wsz*0.25)),
        (wcx - int(wsz*0.35), wcy + int(wsz*0.35)),
        (wcx - int(wsz*0.1), wcy + int(wsz*0.35))
    ]
    draw.polygon(tail_points, fill=WHT)
    rec_sz = int(wsz * 0.6)
    draw.arc(
        [(wcx - rec_sz//2, wcy - rec_sz//2), (wcx + rec_sz//2, wcy + rec_sz//2)],
        start=100, end=350, fill=GD, width=2
    )
    
    phone = layout.get("phone", "9823125233")
    if not phone or phone == "N/A":
        phone = "9823125233"
    phone_lbl = layout.get("phone_label", "(WhatsApp Business)")
    
    tx = pill_x0 + int(pill_h * 1.05)
    fn_ft = _font("NotoSans-Bold.ttf", max(14, int(pill_h * 0.35)))
    fn_fl = _font("NotoSans-Regular.ttf", max(9, int(pill_h * 0.20)))
    
    draw.text((tx, pill_y0 + int(pill_h * 0.15)), phone, font=fn_ft, fill=WHT)
    lbl_color = (int(WHT[0]*0.7 + GB[0]*0.3), int(WHT[1]*0.7 + GB[1]*0.3), int(WHT[2]*0.7 + GB[2]*0.3))
    draw.text((tx, pill_y0 + int(pill_h * 0.52)), phone_lbl, font=fn_fl, fill=lbl_color)

    # 7. Circular Badge
    badge_r = int(H * (0.100 if is_square else 0.125))
    badge_cx = int(W * (0.76 if is_square else 0.86))
    badge_cy = int(H * (0.78 if is_square else 0.77))
    
    draw.ellipse([(badge_cx - badge_r - 2, badge_cy - badge_r - 2), (badge_cx + badge_r + 2, badge_cy + badge_r + 2)], fill=(0, 0, 0, 15))
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], fill=WHT)
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], outline=GB, width=6)
    
    badge_lines = layout.get("badge_text", ["Your Health", "Our Priority"])
    if not badge_lines:
        badge_lines = ["Your Health", "Our Priority"]
        
    sz_bdg = max(12, int(H * (0.018 if is_square else 0.024)))
    fn_bdg = _font("NotoSans-Bold.ttf", sz_bdg)
    bdg_total_h = len(badge_lines) * (sz_bdg + 4) - 4
    by = badge_cy - bdg_total_h / 2
    for line in badge_lines:
        l_w = draw.textbbox((0, 0), line, font=fn_bdg)[2]
        draw.text((badge_cx - l_w / 2, by), line, font=fn_bdg, fill=GD)
        by += sz_bdg + 4

    return save_and_encode(img)


# ── TEMPLATE C: CENTER STAGE ────────────────────────────────────────────────

def _layout_center_stage(layout: dict, ref_url: Optional[str] = None) -> str:
    import re
    size_match = re.match(r"(\d+)x(\d+)", layout.get("image_size", "1536x1024"))
    W, H = (int(size_match.group(1)), int(size_match.group(2))) if size_match else (1536, 1024)
        
    img  = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    GD   = tuple(layout.get("primary_color") or layout.get("green_dark") or [6, 95, 70])
    GB   = tuple(layout.get("secondary_color") or layout.get("green_bright") or [16, 185, 129])
    BG   = tuple(layout.get("background_color") or [245, 248, 246])
    BLK  = (30, 41, 59)
    GRY  = (100, 116, 139)
    WHT  = (255, 255, 255)
    
    aspect_ratio = W / H
    is_square = aspect_ratio < 1.2
    
    PAD = int(W * 0.05)

    # 1. Background Fill
    draw.rectangle([(0, 0), (W, H)], fill=(BG[0], BG[1], BG[2], 255))

    # 2. Diagonal ribbon top-left
    ribbon_w = int(W * 0.08)
    ribbon_h = int(H * 0.08)
    draw.polygon([(0, 0), (ribbon_w, 0), (0, ribbon_h)], fill=(GD[0], GD[1], GD[2], 80))
    draw.polygon([(0, 0), (int(ribbon_w * 0.7), 0), (0, int(ribbon_h * 0.7))], fill=(GB[0], GB[1], GB[2], 120))

    # 3. Large circular photo on right
    cx = int(W * 0.72)
    cy = int(H * 0.48)
    r = int(H * (0.32 if is_square else 0.38))
    
    draw.ellipse([(cx - r - 4, cy - r - 4), (cx + r + 4, cy + r + 4)], fill=(0, 0, 0, 10))
    
    photo_mask = Image.new("L", (W, H), 0)
    pm_draw = ImageDraw.Draw(photo_mask)
    pm_draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=255)
    
    photo_layer = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    pl_draw = ImageDraw.Draw(photo_layer)
    for row in range(H):
        t = row / H
        r_c = int((GB[0] * 0.2 + 200) * (1 - t) + (GD[0] * 0.15 + 210) * t)
        g_c = int((GB[1] * 0.2 + 200) * (1 - t) + (GD[1] * 0.15 + 210) * t)
        b_c = int((GB[2] * 0.2 + 200) * (1 - t) + (GD[2] * 0.15 + 210) * t)
        pl_draw.line([(0, row), (W, row)], fill=(r_c, g_c, b_c))
        
    if ref_url:
        ref_img = _download_image(ref_url)
        if ref_img:
            ref_img = ImageOps.fit(ref_img, (r * 2, r * 2), Image.Resampling.LANCZOS)
            photo_layer.paste(ref_img, (cx - r, cy - r))
            
    img.paste(photo_layer, (0, 0), photo_mask)
    draw = ImageDraw.Draw(img)
    
    draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], outline=GB, width=8)
    draw.ellipse([(cx - r + 3, cy - r + 3), (cx + r - 3, cy + r - 3)], outline=WHT, width=2)

    # 4. Header
    y_logo = int(H * 0.05)
    sz_nm = max(18, int(H * (0.035 if is_square else 0.043)))
    sz_sub_nm = max(10, int(H * (0.016 if is_square else 0.020)))
    logo_r = int(sz_nm * 0.95)
    
    logo_img_src = layout.get("logo_image")
    logo_img = _load_logo_image(logo_img_src) if logo_img_src else None
    
    if logo_img:
        max_h = logo_r * 2
        max_w = int(logo_r * 2.5)
        logo_img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        img.paste(logo_img, (PAD, y_logo), logo_img)
        nx = PAD + logo_img.width + int(W * 0.015)
    else:
        niche = layout.get("niche", "healthcare").lower()
        lcx, lcy = PAD + logo_r, y_logo + logo_r
        _draw_niche_logo(draw, niche, lcx, lcy, logo_r, GD, GB, WHT)
        nx = PAD + logo_r * 2 + int(W * 0.015)
        
    fn_nm = _font("NotoSans-Black.ttf", sz_nm)
    fn_sn = _font("NotoSans-Regular.ttf", sz_sub_nm)
    
    draw.text((nx, y_logo), layout.get("brand_name") or layout.get("hospital_name") or "BRAND", font=fn_nm, fill=GD)
    draw.text((nx, y_logo + sz_nm + 2), layout.get("brand_sub") or layout.get("hospital_sub") or "", font=fn_sn, fill=GRY)

    headlines = layout.get("headline", ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."])
    if not headlines:
        headlines = ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."]
        
    sz_h = max(28, int(H * 0.044)) if is_square else max(38, int(H * 0.072))
    y_head = y_logo + sz_nm + sz_sub_nm + int(H * (0.05 if is_square else 0.065))
    fn_h = _font("NotoSans-Black.ttf", sz_h)
    
    for idx, hl in enumerate(headlines[:3]):
        color = GD if idx == 0 else BLK
        draw.text((PAD, y_head), hl, font=fn_h, fill=color)
        y_head += sz_h + int(H * 0.008)
        
    sub = layout.get("subheadline", "Comprehensive healthcare under one roof for you & your family.")
    sz_s = max(12, int(H * (0.018 if is_square else 0.024)))
    y_sub = y_head + int(H * (0.012 if is_square else 0.018))
    fn_s = _font("NotoSans-Regular.ttf", sz_s)
    
    wrap_w = int(W * 0.48) if is_square else int(W * 0.41)
    for sl in _wrap(draw, sub, fn_s, wrap_w):
        draw.text((PAD, y_sub), sl, font=fn_s, fill=GRY)
        y_sub += sz_s + int(H * 0.006)

    # 6. Highlights Container
    sz_ic = max(10, int(H * (0.013 if is_square else 0.018)))
    y_icons = y_sub + int(H * (0.025 if is_square else 0.035))
    
    icons = layout.get("icons", ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"])
    if not icons or len(icons) < 4:
        icons = ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"]
        
    n_icons = 4
    container_x0 = PAD
    container_y0 = y_icons
    container_x1 = int(W * 0.50)
    container_h  = int(H * (0.11 if is_square else 0.14))
    container_y1 = container_y0 + container_h
    
    draw.rounded_rectangle(
        [(container_x0, container_y0), (container_x1, container_y1)],
        radius=int(container_h * 0.12),
        fill=(int(GB[0]*0.05 + 242), int(GB[1]*0.05 + 242), int(GB[2]*0.05 + 242), 255),
        outline=(int(GB[0]*0.4 + 150), int(GB[1]*0.4 + 150), int(GB[2]*0.4 + 150), 255),
        width=2
    )
    
    col_w = (container_x1 - container_x0) / n_icons
    for idx, label in enumerate(icons[:n_icons]):
        col_x0 = container_x0 + idx * col_w
        col_x1 = col_x0 + col_w
        col_cx = col_x0 + col_w / 2
        
        if idx < n_icons - 1:
            draw.line(
                [(col_x1, container_y0 + int(container_h * 0.15)), (col_x1, container_y1 - int(container_h * 0.15))],
                fill=(int(GB[0]*0.3 + 175), int(GB[1]*0.3 + 175), int(GB[2]*0.3 + 175), 255),
                width=1
            )
            
        niche = layout.get("niche", "healthcare").lower()
        ic_cy = container_y0 + int(container_h * 0.35)
        _draw_niche_icon(draw, niche, idx, col_cx, ic_cy, container_h, GD, GB, WHT)
            
        fn_ic = _font("NotoSans-Regular.ttf", sz_ic)
        lbl_lines = _wrap(draw, label, fn_ic, int(col_w - 8))
        lbl_h = len(lbl_lines) * (sz_ic + 2)
        ly = container_y1 - lbl_h - int(container_h * 0.08)
        for line in lbl_lines:
            l_w = draw.textbbox((0, 0), line, font=fn_ic)[2]
            draw.text((col_cx - l_w / 2, ly), line, font=fn_ic, fill=BLK)
            ly += sz_ic + 2

    # 7. Contact Pill
    pill_w = int(W * (0.35 if is_square else 0.28))
    pill_h = int(H * (0.070 if is_square else 0.082))
    pill_x0 = PAD
    pill_y0 = int(H * (0.83 if is_square else 0.81))
    pill_x1 = pill_x0 + pill_w
    pill_y1 = pill_y0 + pill_h
    
    draw.rounded_rectangle(
        [(pill_x0, pill_y0), (pill_x1, pill_y1)],
        radius=int(pill_h * 0.5),
        fill=GD
    )
    
    wsz = int(pill_h * 0.52)
    wcx = pill_x0 + int(pill_h * 0.5)
    wcy = pill_y0 + pill_h // 2
    draw.ellipse([(wcx - wsz//2, wcy - wsz//2), (wcx + wsz//2, wcy + wsz//2)], fill=WHT)
    tail_points = [
        (wcx - int(wsz*0.2), wcy + int(wsz*0.25)),
        (wcx - int(wsz*0.35), wcy + int(wsz*0.35)),
        (wcx - int(wsz*0.1), wcy + int(wsz*0.35))
    ]
    draw.polygon(tail_points, fill=WHT)
    rec_sz = int(wsz * 0.6)
    draw.arc(
        [(wcx - rec_sz//2, wcy - rec_sz//2), (wcx + rec_sz//2, wcy + rec_sz//2)],
        start=100, end=350, fill=GD, width=2
    )
    
    phone = layout.get("phone", "9823125233")
    if not phone or phone == "N/A":
        phone = "9823125233"
    phone_lbl = layout.get("phone_label", "(WhatsApp Business)")
    
    tx = pill_x0 + int(pill_h * 1.05)
    fn_ft = _font("NotoSans-Bold.ttf", max(14, int(pill_h * 0.35)))
    fn_fl = _font("NotoSans-Regular.ttf", max(9, int(pill_h * 0.20)))
    
    draw.text((tx, pill_y0 + int(pill_h * 0.15)), phone, font=fn_ft, fill=WHT)
    lbl_color = (int(WHT[0]*0.7 + GB[0]*0.3), int(WHT[1]*0.7 + GB[1]*0.3), int(WHT[2]*0.7 + GB[2]*0.3))
    draw.text((tx, pill_y0 + int(pill_h * 0.52)), phone_lbl, font=fn_fl, fill=lbl_color)

    # 8. Circular Badge
    badge_r = int(H * (0.100 if is_square else 0.125))
    badge_cx = cx - int(r * 0.7)
    badge_cy = cy + int(r * 0.7)
    
    draw.ellipse([(badge_cx - badge_r - 2, badge_cy - badge_r - 2), (badge_cx + badge_r + 2, badge_cy + badge_r + 2)], fill=(0, 0, 0, 15))
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], fill=WHT)
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], outline=GB, width=6)
    
    badge_lines = layout.get("badge_text", ["Your Health", "Our Priority"])
    if not badge_lines:
        badge_lines = ["Your Health", "Our Priority"]
        
    sz_bdg = max(12, int(H * (0.018 if is_square else 0.024)))
    fn_bdg = _font("NotoSans-Bold.ttf", sz_bdg)
    bdg_total_h = len(badge_lines) * (sz_bdg + 4) - 4
    by = badge_cy - bdg_total_h / 2
    for line in badge_lines:
        l_w = draw.textbbox((0, 0), line, font=fn_bdg)[2]
        draw.text((badge_cx - l_w / 2, by), line, font=fn_bdg, fill=GD)
        by += sz_bdg + 4

    return save_and_encode(img)


# ── TEMPLATE D: MINIMAL DARK ────────────────────────────────────────────────

def _layout_minimal_dark(layout: dict, ref_url: Optional[str] = None) -> str:
    import re
    size_match = re.match(r"(\d+)x(\d+)", layout.get("image_size", "1536x1024"))
    W, H = (int(size_match.group(1)), int(size_match.group(2))) if size_match else (1536, 1024)
        
    img  = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    GD   = tuple(layout.get("primary_color") or layout.get("green_dark") or [6, 95, 70])
    GB   = tuple(layout.get("secondary_color") or layout.get("green_bright") or [16, 185, 129])
    BG   = tuple(layout.get("background_color") or [245, 248, 246])
    BLK  = (24, 32, 45)
    GRY  = (160, 174, 192)
    WHT  = (255, 255, 255)
    
    aspect_ratio = W / H
    is_square = aspect_ratio < 1.2
    
    PAD = int(W * 0.05)
    W_split = int(W * 0.55)

    # 1. Background split
    draw.rectangle([(0, 0), (W_split, H)], fill=BLK)
    draw.rectangle([(W_split, 0), (W, H)], fill=(BG[0], BG[1], BG[2], 255))

    # 2. Right Side Photo
    photo_w = W - W_split
    photo_layer = Image.new("RGBA", (photo_w, H), (255, 255, 255, 255))
    pl_draw = ImageDraw.Draw(photo_layer)
    for row in range(H):
        t = row / H
        r_c = int((GB[0] * 0.2 + 200) * (1 - t) + (GD[0] * 0.15 + 210) * t)
        g_c = int((GB[1] * 0.2 + 200) * (1 - t) + (GD[1] * 0.15 + 210) * t)
        b_c = int((GB[2] * 0.2 + 200) * (1 - t) + (GD[2] * 0.15 + 210) * t)
        pl_draw.line([(0, row), (photo_w, row)], fill=(r_c, g_c, b_c))
        
    if ref_url:
        ref_img = _download_image(ref_url)
        if ref_img:
            ref_img = ImageOps.fit(ref_img, (photo_w, H), Image.Resampling.LANCZOS)
            photo_layer.paste(ref_img, (0, 0))
            
    img.paste(photo_layer, (W_split, 0))
    draw = ImageDraw.Draw(img)
    
    # Border vertical line
    draw.line([(W_split, 0), (W_split, H)], fill=GB, width=6)

    # 3. Header
    y_logo = int(H * 0.05)
    sz_nm = max(18, int(H * (0.035 if is_square else 0.043)))
    sz_sub_nm = max(10, int(H * (0.016 if is_square else 0.020)))
    logo_r = int(sz_nm * 0.95)
    
    logo_img_src = layout.get("logo_image")
    logo_img = _load_logo_image(logo_img_src) if logo_img_src else None
    
    if logo_img:
        max_h = logo_r * 2
        max_w = int(logo_r * 2.5)
        logo_img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        img.paste(logo_img, (PAD, y_logo), logo_img)
        nx = PAD + logo_img.width + int(W * 0.015)
    else:
        niche = layout.get("niche", "healthcare").lower()
        lcx, lcy = PAD + logo_r, y_logo + logo_r
        _draw_niche_logo(draw, niche, lcx, lcy, logo_r, WHT, GB, BLK)
        nx = PAD + logo_r * 2 + int(W * 0.015)
        
    fn_nm = _font("NotoSans-Black.ttf", sz_nm)
    fn_sn = _font("NotoSans-Regular.ttf", sz_sub_nm)
    
    draw.text((nx, y_logo), layout.get("brand_name") or layout.get("hospital_name") or "BRAND", font=fn_nm, fill=WHT)
    draw.text((nx, y_logo + sz_nm + 2), layout.get("brand_sub") or layout.get("hospital_sub") or "", font=fn_sn, fill=GRY)

    headlines = layout.get("headline", ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."])
    if not headlines:
        headlines = ["Trusted Care.", "Advanced Treatment.", "Better Tomorrow."]
        
    sz_h = max(28, int(H * 0.044)) if is_square else max(38, int(H * 0.072))
    y_head = y_logo + sz_nm + sz_sub_nm + int(H * (0.05 if is_square else 0.065))
    fn_h = _font("NotoSans-Black.ttf", sz_h)
    
    for idx, hl in enumerate(headlines[:3]):
        color = GB if idx == 0 else WHT
        draw.text((PAD, y_head), hl, font=fn_h, fill=color)
        y_head += sz_h + int(H * 0.008)
        
    sub = layout.get("subheadline", "Comprehensive healthcare under one roof for you & your family.")
    sz_s = max(12, int(H * (0.018 if is_square else 0.024)))
    y_sub = y_head + int(H * (0.012 if is_square else 0.018))
    fn_s = _font("NotoSans-Regular.ttf", sz_s)
    
    wrap_w = int(W_split - PAD * 2)
    for sl in _wrap(draw, sub, fn_s, wrap_w):
        draw.text((PAD, y_sub), sl, font=fn_s, fill=GRY)
        y_sub += sz_s + int(H * 0.006)

    # 5. Highlights Container
    sz_ic = max(10, int(H * (0.013 if is_square else 0.018)))
    y_icons = y_sub + int(H * (0.025 if is_square else 0.035))
    
    icons = layout.get("icons", ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"])
    if not icons or len(icons) < 4:
        icons = ["Experienced Doctors", "Advanced Technology", "24x7 Emergency Care", "Compassionate Care"]
        
    n_icons = 4
    container_x0 = PAD
    container_y0 = y_icons
    container_x1 = int(W_split - PAD)
    container_h  = int(H * (0.11 if is_square else 0.14))
    container_y1 = container_y0 + container_h
    
    draw.rounded_rectangle(
        [(container_x0, container_y0), (container_x1, container_y1)],
        radius=int(container_h * 0.12),
        fill=(GD[0], GD[1], GD[2], 50),
        outline=GB,
        width=2
    )
    
    col_w = (container_x1 - container_x0) / n_icons
    for idx, label in enumerate(icons[:n_icons]):
        col_x0 = container_x0 + idx * col_w
        col_x1 = col_x0 + col_w
        col_cx = col_x0 + col_w / 2
        
        if idx < n_icons - 1:
            draw.line(
                [(col_x1, container_y0 + int(container_h * 0.15)), (col_x1, container_y1 - int(container_h * 0.15))],
                fill=(int(GB[0]*0.5), int(GB[1]*0.5), int(GB[2]*0.5), 180),
                width=1
            )
            
        niche = layout.get("niche", "healthcare").lower()
        ic_cy = container_y0 + int(container_h * 0.35)
        _draw_niche_icon(draw, niche, idx, col_cx, ic_cy, container_h, GB, WHT, BLK)
            
        fn_ic = _font("NotoSans-Regular.ttf", sz_ic)
        lbl_lines = _wrap(draw, label, fn_ic, int(col_w - 8))
        lbl_h = len(lbl_lines) * (sz_ic + 2)
        ly = container_y1 - lbl_h - int(container_h * 0.08)
        for line in lbl_lines:
            l_w = draw.textbbox((0, 0), line, font=fn_ic)[2]
            draw.text((col_cx - l_w / 2, ly), line, font=fn_ic, fill=WHT)
            ly += sz_ic + 2

    # 6. Contact Pill
    pill_w = int(W_split * 0.70)
    pill_h = int(H * (0.070 if is_square else 0.082))
    pill_x0 = PAD
    pill_y0 = int(H * 0.85)
    pill_x1 = pill_x0 + pill_w
    pill_y1 = pill_y0 + pill_h
    
    draw.rounded_rectangle(
        [(pill_x0, pill_y0), (pill_x1, pill_y1)],
        radius=int(pill_h * 0.5),
        fill=GD
    )
    
    wsz = int(pill_h * 0.52)
    wcx = pill_x0 + int(pill_h * 0.5)
    wcy = pill_y0 + pill_h // 2
    draw.ellipse([(wcx - wsz//2, wcy - wsz//2), (wcx + wsz//2, wcy + wsz//2)], fill=WHT)
    tail_points = [
        (wcx - int(wsz*0.2), wcy + int(wsz*0.25)),
        (wcx - int(wsz*0.35), wcy + int(wsz*0.35)),
        (wcx - int(wsz*0.1), wcy + int(wsz*0.35))
    ]
    draw.polygon(tail_points, fill=WHT)
    rec_sz = int(wsz * 0.6)
    draw.arc(
        [(wcx - rec_sz//2, wcy - rec_sz//2), (wcx + rec_sz//2, wcy + rec_sz//2)],
        start=100, end=350, fill=GD, width=2
    )
    
    phone = layout.get("phone", "9823125233")
    if not phone or phone == "N/A":
        phone = "9823125233"
    phone_lbl = layout.get("phone_label", "(WhatsApp Business)")
    
    tx = pill_x0 + int(pill_h * 1.05)
    fn_ft = _font("NotoSans-Bold.ttf", max(14, int(pill_h * 0.35)))
    fn_fl = _font("NotoSans-Regular.ttf", max(9, int(pill_h * 0.20)))
    
    draw.text((tx, pill_y0 + int(pill_h * 0.15)), phone, font=fn_ft, fill=WHT)
    lbl_color = (int(WHT[0]*0.7 + GB[0]*0.3), int(WHT[1]*0.7 + GB[1]*0.3), int(WHT[2]*0.7 + GB[2]*0.3))
    draw.text((tx, pill_y0 + int(pill_h * 0.52)), phone_lbl, font=fn_fl, fill=lbl_color)

    # 7. Circular Badge
    badge_r = int(H * (0.100 if is_square else 0.125))
    badge_cx = int(W * 0.85)
    badge_cy = int(H * 0.82)
    
    draw.ellipse([(badge_cx - badge_r - 2, badge_cy - badge_r - 2), (badge_cx + badge_r + 2, badge_cy + badge_r + 2)], fill=(0, 0, 0, 15))
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], fill=WHT)
    draw.ellipse([(badge_cx - badge_r, badge_cy - badge_r), (badge_cx + badge_r, badge_cy + badge_r)], outline=GB, width=6)
    
    badge_lines = layout.get("badge_text", ["Your Health", "Our Priority"])
    if not badge_lines:
        badge_lines = ["Your Health", "Our Priority"]
        
    sz_bdg = max(12, int(H * (0.018 if is_square else 0.024)))
    fn_bdg = _font("NotoSans-Bold.ttf", sz_bdg)
    bdg_total_h = len(badge_lines) * (sz_bdg + 4) - 4
    by = badge_cy - bdg_total_h / 2
    for line in badge_lines:
        l_w = draw.textbbox((0, 0), line, font=fn_bdg)[2]
        draw.text((badge_cx - l_w / 2, by), line, font=fn_bdg, fill=GD)
        by += sz_bdg + 4

    return save_and_encode(img)


def _layout_ai_dynamic(layout: dict, ref_url: Optional[str] = None) -> str:
    # 1. Resolve size
    sz_str = layout.get("image_size", "1024x1024")
    W, H = 1024, 1024
    if "x" in sz_str:
        try:
            parts = sz_str.split("x")
            W, H = int(parts[0]), int(parts[1])
        except Exception:
            pass
    is_square = (W == H)
    PAD = int(W * 0.05)

    # 2. Colors
    GD = tuple(layout.get("primary_color", [17, 24, 39]))
    GB = tuple(layout.get("secondary_color", [59, 130, 246]))
    BG = tuple(layout.get("background_color", [248, 250, 252]))
    WHT = (255, 255, 255)
    BLK = (0, 0, 0)
    GRY = (156, 163, 175)

    # 3. Base Image
    img = None
    if ref_url:
        img = _download_image(ref_url)
        if img:
            img = ImageOps.fit(img, (W, H), Image.Resampling.LANCZOS)
    
    if not img:
        # Fallback background
        img = Image.new("RGBA", (W, H), BG)
        draw = ImageDraw.Draw(img)
        for y in range(H):
            factor = y / H
            r = int(BG[0] * (1 - factor) + GD[0] * factor * 0.1)
            g = int(BG[1] * (1 - factor) + GD[1] * factor * 0.1)
            b = int(BG[2] * (1 - factor) + GD[2] * factor * 0.1)
            draw.line([(0, y), (W, y)], fill=(r, g, b, 255))
    
    # 4. Alignment
    align = layout.get("text_align", "left").lower()
    if align not in ["left", "right"]:
        align = "left"

    # Create overlay for semi-transparent card (glassmorphism)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_ol = ImageDraw.Draw(overlay)

    card_w = int(W * 0.50)
    card_pad = int(W * 0.03)
    if align == "left":
        card_x0, card_y0 = card_pad, card_pad
        card_x1, card_y1 = card_w - card_pad, H - card_pad
        text_x = card_x0 + int(W * 0.02)
        text_w = card_w - card_pad * 2 - int(W * 0.04)
    else:
        card_x0, card_y0 = W - card_w + card_pad, card_pad
        card_x1, card_y1 = W - card_pad, H - card_pad
        text_x = card_x0 + int(W * 0.02)
        text_w = card_w - card_pad * 2 - int(W * 0.04)

    card_fill = (255, 255, 255, 225)
    card_outline = (GB[0], GB[1], GB[2], 180)
    
    draw_ol.rounded_rectangle(
        [(card_x0, card_y0), (card_x1, card_y1)],
        radius=int(W * 0.02),
        fill=card_fill,
        outline=card_outline,
        width=3
    )

    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # 5. Header
    y_logo = card_y0 + int(H * 0.04)
    sz_nm = max(18, int(H * (0.035 if is_square else 0.043)))
    sz_sub_nm = max(10, int(H * (0.016 if is_square else 0.020)))
    logo_r = int(sz_nm * 0.95)

    logo_img_src = layout.get("logo_image")
    logo_img = _load_logo_image(logo_img_src) if logo_img_src else None
    
    if logo_img:
        max_h = logo_r * 2
        max_w = int(logo_r * 2.5)
        logo_img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        img.paste(logo_img, (text_x, y_logo), logo_img)
        nx = text_x + logo_img.width + int(W * 0.015)
    else:
        niche = layout.get("niche", "healthcare").lower()
        lcx, lcy = text_x + logo_r, y_logo + logo_r
        _draw_niche_logo(draw, niche, lcx, lcy, logo_r, GD, GB, WHT)
        nx = text_x + logo_r * 2 + int(W * 0.015)

    fn_nm = _font("NotoSans-Black.ttf", sz_nm)
    fn_sn = _font("NotoSans-Regular.ttf", sz_sub_nm)

    draw.text((nx, y_logo), layout.get("brand_name") or layout.get("hospital_name") or "BRAND", font=fn_nm, fill=GD)
    draw.text((nx, y_logo + sz_nm + 2), layout.get("brand_sub") or layout.get("hospital_sub") or "", font=fn_sn, fill=GRY)

    # 6. Headlines
    headlines = layout.get("headline", ["Premium Quality.", "Reliable Service.", "Contact Us."])
    if not headlines:
        headlines = ["Premium Quality.", "Reliable Service.", "Contact Us."]

    sz_h = max(28, int(H * 0.044)) if is_square else max(38, int(H * 0.072))
    y_head = y_logo + sz_nm + sz_sub_nm + int(H * (0.05 if is_square else 0.065))
    fn_h = _font("NotoSans-Black.ttf", sz_h)

    for idx, hl in enumerate(headlines[:3]):
        color = GB if idx == 0 else BLK
        draw.text((text_x, y_head), hl, font=fn_h, fill=color)
        y_head += sz_h + int(H * 0.008)

    # 7. Subheadlines
    sub = layout.get("subheadline", "Providing exceptional service with passion and expertise.")
    sz_s = max(12, int(H * (0.018 if is_square else 0.024)))
    y_sub = y_head + int(H * (0.012 if is_square else 0.018))
    fn_s = _font("NotoSans-Regular.ttf", sz_s)

    for sl in _wrap(draw, sub, fn_s, text_w):
        draw.text((text_x, y_sub), sl, font=fn_s, fill=GD)
        y_sub += sz_s + int(H * 0.006)

    # 8. Highlights
    sz_ic = max(10, int(H * (0.013 if is_square else 0.018)))
    y_icons = y_sub + int(H * (0.025 if is_square else 0.035))
    icons = layout.get("icons", ["Expert Team", "Modern Tech", "24/7 Support", "Quality Care"])
    if not icons:
        icons = ["Expert Team", "Modern Tech", "24/7 Support", "Quality Care"]

    niche = layout.get("niche", "healthcare").lower()
    fn_ic = _font("NotoSans-Bold.ttf", sz_ic)
    
    for idx, icon_text in enumerate(icons[:4]):
        iy = y_icons + idx * (sz_ic * 2 + int(H * 0.012))
        _draw_niche_icon(draw, niche, idx, text_x + sz_ic, iy + sz_ic, int(H * 0.05), GD, GB, WHT)
        draw.text((text_x + sz_ic * 2.5, iy + int(sz_ic * 0.3)), icon_text, font=fn_ic, fill=GD)

    # 9. Contact
    phone = layout.get("phone", "")
    phone_label = layout.get("phone_label", "(WhatsApp Business)")
    if phone:
        y_phone = card_y1 - int(H * 0.09)
        pill_w = text_w
        pill_h = int(H * 0.065)
        draw.rounded_rectangle(
            [(text_x, y_phone), (text_x + pill_w, y_phone + pill_h)],
            radius=pill_h // 2,
            fill=GB
        )
        phone_icon_r = int(pill_h * 0.28)
        phone_cx = text_x + int(pill_w * 0.08)
        phone_cy = y_phone + pill_h // 2
        draw.ellipse(
            [(phone_cx - phone_icon_r, phone_cy - phone_icon_r), 
             (phone_cx + phone_icon_r, phone_cy + phone_icon_r)],
            fill=WHT
        )
        _draw_phone_receiver(draw, phone_cx, phone_cy, int(phone_icon_r * 0.5), GB)
        
        fn_p = _font("NotoSans-Black.ttf", int(pill_h * 0.38))
        fn_pl = _font("NotoSans-Regular.ttf", int(pill_h * 0.22))
        
        pt_x = phone_cx + phone_icon_r + int(W * 0.02)
        draw.text((pt_x, y_phone + int(pill_h * 0.16)), phone, font=fn_p, fill=WHT)
        draw.text((pt_x, y_phone + int(pill_h * 0.56)), phone_label, font=fn_pl, fill=WHT)

    return save_and_encode(img)


# ── DISPATCHER ENTRYPOINT ───────────────────────────────────────────────────

def generate_flyer(layout: dict, ref_url: Optional[str] = None) -> str:
    # 1. Deterministic template selection
    # Check if a specific template_id (0-4) is explicitly set in layout
    template_id = layout.get("template_id")
    if template_id is None:
        # Fallback to hashing brand name + phone to select a template
        brand = layout.get("brand_name") or layout.get("hospital_name") or "default"
        phone = layout.get("phone") or "default"
        # simple deterministic hash
        combined = f"{brand}:{phone}"
        h = sum(ord(c) for c in combined)
        template_id = h % 5  # include AI Dynamic (4) in fallback pool

    logger.info(f"[FlyerGen] Selected Template ID: {template_id}")
    
    if template_id == 0:
        return _layout_split_curve(layout, ref_url)
    elif template_id == 1:
        return _layout_bold_banner(layout, ref_url)
    elif template_id == 2:
        return _layout_center_stage(layout, ref_url)
    elif template_id == 3:
        return _layout_minimal_dark(layout, ref_url)
    else:
        return _layout_ai_dynamic(layout, ref_url)
