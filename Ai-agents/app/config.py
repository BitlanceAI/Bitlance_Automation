"""
config.py — Centralized configuration for the Graphic Agent system.

Architecture note:
  All model names, system prompts, style maps, and tunable constants live here.
  This means zero hardcoding elsewhere; swapping a model or tweaking a prompt
  is a one-line change without touching business logic.
"""

import os
from dotenv import load_dotenv

load_dotenv()


# ─── API Keys ─────────────────────────────────────────────────────────────────

class APIKeys:
    OPENAI:  str = os.getenv("OPENAI_API_KEY", "")
    SERPAPI: str = os.getenv("SERPAPI_API_KEY", "")
    GEMINI:  str = os.getenv("GEMINI_API_KEY", "")
    PERPLEXITY: str = os.getenv("PERPLEXITY_API_KEY", "")


# ─── Model Settings ───────────────────────────────────────────────────────────

class ModelConfig:
    # LLM used for keyword extraction, prompt enhancement, and agent reasoning
    LLM_MODEL:   str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    LLM_TEMP:    float = float(os.getenv("LLM_TEMP", "0.7"))

    # Image generation model
    IMAGE_MODEL: str = os.getenv("IMAGE_MODEL", "gpt-image-2-2026-04-21")

    # Default image generation settings
    IMAGE_DEFAULT_SIZE:    str = os.getenv("IMAGE_DEFAULT_SIZE", "1024x1024")
    IMAGE_DEFAULT_QUALITY: str = os.getenv("IMAGE_DEFAULT_QUALITY", "low")

    # Agent executor limits
    AGENT_MAX_ITERATIONS: int = int(os.getenv("AGENT_MAX_ITERATIONS", "8"))
    AGENT_VERBOSE:        bool = os.getenv("AGENT_VERBOSE", "true").lower() == "true"


# ─── Storage ──────────────────────────────────────────────────────────────────

class StorageConfig:
    OUTPUT_FOLDER: str = os.getenv("OUTPUT_FOLDER", "outputs")


# ─── System Prompts ───────────────────────────────────────────────────────────

class SystemPrompts:
    """
    All LLM system/instruction prompts are centralized here.
    Change once → affects all callers.
    """

    AGENT_SYSTEM = (
        "You are an expert AI Graphic Design Agent specializing in generating "
        "high-end promotional graphics, real estate flyers, and marketing visuals. "
        "You have access to the following tools:\n\n"
        "  • fetch_trending_keywords  — fetches trending design keywords for a niche\n"
        "  • enhance_raw_prompt       — rewrites a short user prompt into a rich image prompt\n"
        "  • build_prompt_from_details — builds a detailed image prompt from structured property data\n"
        "  • generate_image           — generates the final image(s) using the OpenAI image API\n\n"
        "Decision rules:\n"
        "  1. If the user supplies raw text only → use enhance_raw_prompt, then generate_image.\n"
        "  2. If the user supplies structured details (property_type, price, etc.) → use "
        "build_prompt_from_details, then generate_image.\n"
        "  3. Only call fetch_trending_keywords when niche information is available AND the user "
        "has not already supplied a fully formed prompt.\n"
        "  4. Never call fetch_trending_keywords more than once per request.\n"
        "  5. Always end with generate_image — do not return until the image has been produced.\n"
        "  6. CRITICAL LANGUAGE RULE: If the target language is 'hindi_marathi' (as specified in your current instructions or details), "
        "you MUST explicitly pass the parameter language='hindi_marathi' to both enhance_raw_prompt and build_prompt_from_details. "
        "For build_prompt_from_details, ensure you pass the language key in the details dict.\n\n"
        "Be concise in your reasoning. Use tools efficiently."
    )

    PROMPT_ENHANCER_SYSTEM = (
        "You are an expert prompt engineer for gpt-image-2. "
        "Your job is to take a simple user prompt and expand it into a highly detailed, "
        "vivid, and visually stunning image generation prompt suitable for high-end promotional graphics "
        "for any business, including real estate. "
        "CRITICAL RULE: If the user mentions business/property details (like BHK, size, location, "
        "amenities, etc.) or explicitly asks for text in the prompt, you MUST ensure your enhanced "
        "prompt explicitly instructs the image generator to write those details as beautiful, "
        "legible text overlay in the generated image. "
        "Otherwise, if no details or text are mentioned, ensure it specifies "
        "'no text, no logos, no watermarks'. "
        "CRITICAL BRANDING & LAYOUT RULE: You must NEVER instruct the image generator to draw or write the business name, company name, hospital name, website URL, or brand logo anywhere on the image, especially NOT in the footer or bottom corners. "
        "All branding and logos are overlaid programmatically. "
        "Furthermore, you MUST explicitly instruct the generator to push all headlines, text, and main subjects DOWN, leaving the ENTIRE top-left quadrant completely empty "
        "(use solid colors, soft gradients, or plain sky). Absolutely NO text or important context should be in the top 20% of the image, to prevent overlap with the programmatic branding. "
        "Return ONLY the enhanced prompt, nothing else."
    )

    DETAILS_PROMPT_BUILDER_SYSTEM = (
        "You are an expert prompt engineer for gpt-image-2. "
        "Your job is to take a JSON object containing business/property details and write a single, "
        "highly detailed, vivid, and visually stunning image generation prompt suitable for high-end "
        "promotional graphics. "
        "CRITICAL RULE: The image MUST contain beautiful, legible text overlay displaying ALL the core "
        "details. Explicitly instruct the image generator to write these details exactly as text in the "
        "image: title, price, location, AND critically, any contact information (phone, email, "
        "address/website). "
        "CRITICAL BRANDING & LAYOUT RULE: Do NOT ask the generator to write the brand name, builder name, hospital name, website URL, "
        "or draw any logos anywhere on the image, especially NOT in the footer or bottom corners, as they are overlaid programmatically. "
        "Furthermore, you MUST explicitly instruct the generator to push all headlines, text, and main subjects DOWN, leaving the ENTIRE top-left quadrant completely empty "
        "(use solid colors, soft gradients, or plain sky). Absolutely NO text or important context should be in the top 20% of the image, to prevent overlap with the programmatic branding. "
        "The contact details MUST be clearly visible at the bottom of the flyer, but NO brand name or website URL. "
        "No logos or watermarks. Return ONLY the image generation prompt, nothing else."
    )

    KEYWORD_EXTRACTOR = (
        "You are an expert graphic design trend analyzer. "
        "Extract exactly 5 current trending design keywords, visual motifs, or styles for the niche. "
        "Return ONLY a valid JSON array of strings. Do not include any markdown or code blocks."
    )


# ─── Design Style Map ─────────────────────────────────────────────────────────

STYLE_DESCRIPTIONS: dict[str, str] = {
    "classic":  "Timeless and elegant design, sophisticated gradient overlays, classic architectural photography style.",
    "modern":   "Contemporary and bold layout, sharp lines, modern architectural design, vibrant and high-contrast colors.",
    "minimal":  "Clean and minimalist aesthetic, lots of white space, simple yet powerful architectural focus, soft lighting.",
    "luxury":   "High-end luxury aesthetic, golden hour lighting, premium materials like marble and gold accents, exclusive development feel.",
    "random":   "Creative and unique architectural visualization, dynamic perspective, stunning lighting and composition.",
}

CREATIVE_ADJECTIVES: list[str] = [
    "cinematic", "vibrant", "dramatic", "hyper-realistic",
    "moody", "bright and airy", "avant-garde", "neon-lit", "soft pastel",
]