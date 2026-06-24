import json
from typing import Type

from langchain.tools import BaseTool
from pydantic import BaseModel, Field

from app.services.ai_service import GraphicAIService

# Singleton instance of the service
ai_service = GraphicAIService()

# ─────────────────────────────────────────────────────────────────────────────
# TOOL 1 — PROMPT ENHANCEMENT
# ─────────────────────────────────────────────────────────────────────────────

class PromptEnhancementInput(BaseModel):
    raw_prompt: str = Field(..., description="The basic, raw user prompt to enhance into a rich image generation prompt.")

class PromptEnhancementTool(BaseTool):
    """
    Enhances a simple prompt into a highly detailed and visually stunning 
    image generation prompt using Google Gemini.
    """

    name: str = "prompt_enhancement"
    description: str = (
        "Use this tool to expand a short, basic user prompt into a highly detailed, "
        "vivid image generation prompt suitable for DALL-E 3 or similar models. "
        "Input: raw user prompt string. "
        "Output: Enhanced prompt string."
    )
    args_schema: Type[BaseModel] = PromptEnhancementInput

    def _run(self, raw_prompt: str) -> str:
        return ai_service.enhance_prompt(raw_prompt)
    
    async def _arun(self, raw_prompt: str) -> str:
        raise NotImplementedError("async not supported")


# ─────────────────────────────────────────────────────────────────────────────
# TOOL 2 — IMAGE GENERATION
# ─────────────────────────────────────────────────────────────────────────────

class ImageGenerationInput(BaseModel):
    prompt: str = Field(..., description="The highly detailed image generation prompt to generate an image from.")

class ImageGenerationTool(BaseTool):
    """
    Generates an image using OpenAI DALL-E 3 and returns the resulting file information.
    """

    name: str = "image_generation"
    description: str = (
        "Use this tool to generate an image using OpenAI DALL-E 3 based on a detailed prompt. "
        "Input: detailed image generation prompt string. "
        "Output: JSON string containing 'filename' and 'image_url'."
    )
    args_schema: Type[BaseModel] = ImageGenerationInput

    def _run(self, prompt: str) -> str:
        result = ai_service.generate_image(prompt)
        return json.dumps({
            "filename": result["filename"],
            "image_url": f"/outputs/{result['filename']}"
        })
    
    async def _arun(self, prompt: str) -> str:
        raise NotImplementedError("async not supported")

# Convenience exports
prompt_enhancement_tool = PromptEnhancementTool()
image_generation_tool = ImageGenerationTool()

ALL_GRAPHIC_TOOLS = [prompt_enhancement_tool, image_generation_tool]
