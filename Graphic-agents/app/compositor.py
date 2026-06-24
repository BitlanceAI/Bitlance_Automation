import requests
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import logging
import os

logger = logging.getLogger(__name__)

def composite_reference_image(b64_string: str, filepath: str, ref_url: str) -> str:
    """Downloads ref_url, makes it a circle with a border, pastes it on center-right, overwrites filepath, returns new b64."""
    try:
        logger.info(f"Compositing image {ref_url} into {filepath}")
        
        # 1. Load DALL-E image
        base_img = Image.open(BytesIO(base64.b64decode(b64_string))).convert("RGBA")
        
        # 2. Download Ref image
        resp = requests.get(ref_url, timeout=15)
        resp.raise_for_status()
        ref_img = Image.open(BytesIO(resp.content)).convert("RGBA")
        
        # 3. Resize and crop ref image to a circle
        target_size = int(min(base_img.size) * 0.45) # 45% of the image size
        ref_img = ImageOps.fit(ref_img, (target_size, target_size), Image.Resampling.LANCZOS)
        
        # Create circular mask
        mask = Image.new('L', (target_size, target_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, target_size, target_size), fill=255)
        ref_img.putalpha(mask)
        
        # 4. Create a white border/backdrop for the circle
        border_size = int(target_size * 1.05)
        border_img = Image.new('RGBA', (border_size, border_size), (255, 255, 255, 0))
        border_draw = ImageDraw.Draw(border_img)
        border_draw.ellipse((0, 0, border_size, border_size), fill=(255, 255, 255, 255))
        
        # Paste ref_img into border_img
        offset = (border_size - target_size) // 2
        border_img.paste(ref_img, (offset, offset), ref_img)
        
        # 5. Paste onto base image (center right with padding)
        padding = int(min(base_img.size) * 0.05)
        paste_x = base_img.width - border_size - padding
        paste_y = (base_img.height - border_size) // 2
        
        base_img.paste(border_img, (paste_x, paste_y), border_img)
        
        # 6. Save back to b64 and disk
        final_img = base_img.convert("RGB")
        out_buffer = BytesIO()
        final_img.save(out_buffer, format="PNG")
        
        # overwrite the original file on disk so the backend serves the composite
        if filepath and os.path.exists(filepath):
            final_img.save(filepath, format="PNG")
            
        return base64.b64encode(out_buffer.getvalue()).decode('utf-8')
        
    except Exception as e:
        logger.error(f"Compositing failed: {e}")
        return b64_string

