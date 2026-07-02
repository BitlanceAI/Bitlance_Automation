"""
instagram_agent.py — The AI Agent Core for Instagram using Perplexity API.

Implements the orchestration flow:
Brand Config + Calendar -> Content Planner -> Caption Generator -> Hashtag Engine -> Graphic Mapper
"""

import json
import logging
from typing import Any, Dict, List
from openai import OpenAI
from app.config import APIKeys
from app.services.image_service import ImageService

logger = logging.getLogger(__name__)

class InstagramAgent:
    def __init__(self):
        if not APIKeys.PERPLEXITY:
            logger.warning("PERPLEXITY_API_KEY is missing in env.")
        
        # Initialize Perplexity API client (OpenAI compatible)
        self.client = OpenAI(
            api_key=APIKeys.PERPLEXITY or "missing_key",
            base_url="https://api.perplexity.ai"
        )
        # Using the recommended online model for trend awareness
        self.model = "sonar-pro"

    def _call_perplexity(self, system_prompt: str, user_prompt: str) -> str:
        """Helper to call Perplexity API."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"[InstagramAgent] Perplexity API Error: {e}")
            raise

    def content_planner(self, brand_config: Dict, calendar: Dict) -> str:
        """Node 1: Generates a day-wise post strategy with deep research."""
        logger.info("[InstagramAgent] Running Content Planner with Perplexity Research...")
        campaign_topic = calendar.get("campaign_topic", "General Social Media Content")
        brand_url = brand_config.get("brand_website_url", "No URL provided")
        
        system_prompt = (
            "You are an expert Social Media Strategist and AI Researcher. "
            "First, research the provided Brand Website URL (if any) to understand their products, tone, and audience. "
            "Next, research current trends related to the Campaign Topic / Goals provided. "
            "Then, create a highly engaging day-wise content strategy based on your research, the brand's config, and the 30-day calendar events. "
            "Your output MUST be ONLY a valid JSON array of objects with 'day' (integer), 'topic' (string), and 'angle' (string) keys. Do not use markdown blocks."
        )
        user_prompt = f"Brand Config: {json.dumps(brand_config)}\nBrand URL: {brand_url}\nCampaign Topic: {campaign_topic}\nCalendar Events: {json.dumps(calendar)}"
        
        response = self._call_perplexity(system_prompt, user_prompt)
        # Strip markdown fences if present
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        return response

    def caption_generator(self, strategy: str, brand_tone: str) -> str:
        """Node 2: Generates captions matching the brand tone."""
        logger.info("[InstagramAgent] Running Caption Generator...")
        system_prompt = (
            f"You are a world-class copywriter writing for Instagram. Tone: {brand_tone}. "
            "Generate an engaging, converting caption for the provided post strategy. "
            "Focus on a strong hook, readable formatting (line breaks), and a clear CTA. "
            "Return ONLY the caption text."
        )
        user_prompt = f"Post Strategy:\n{strategy}"
        return self._call_perplexity(system_prompt, user_prompt)

    def hashtag_engine(self, strategy: str, niche: str) -> List[str]:
        """Node 3: Derives niche and trending tags."""
        logger.info("[InstagramAgent] Running Hashtag Engine...")
        system_prompt = (
            f"You are an Instagram SEO expert specializing in the {niche} niche. "
            "Based on the post strategy, generate a mix of 10-15 trending and niche-specific hashtags. "
            "Return ONLY a valid JSON array of strings, without the '#' symbol. No markdown blocks."
        )
        user_prompt = f"Post Strategy:\n{strategy}"
        
        response = self._call_perplexity(system_prompt, user_prompt)
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        
        try:
            tags = json.loads(response)
            return tags if isinstance(tags, list) else []
        except:
            return []

    def graphic_generator(self, caption: str, strategy: str, language: str = "English") -> Dict:
        """Node 4: Automatically generates a graphic tailored to the post using the Graphic Agent."""
        logger.info("[InstagramAgent] Running Graphic Generator...")
        
        # Build prompt for the image generator
        system_prompt = (
            "You are an Art Director. Read the following post strategy and caption, and write a highly detailed, "
            "vivid prompt for an AI image generator. The image should perfectly capture the post's vibe. "
            f"If there is any text in the image, it MUST be written in {language}. "
            "Return ONLY the image generation prompt, nothing else."
        )
        user_prompt = f"Strategy: {strategy}\nCaption: {caption}"
        
        image_prompt = self._call_perplexity(system_prompt, user_prompt)
        
        try:
            image_svc = ImageService()
            images = image_svc.generate(
                prompt=image_prompt,
                quality="low",
                size="1024x1024",
                num_variants=1
            )
            
            # Use the first generated image
            if images:
                return {
                    "file_url": images[0].get("image_url") or images[0].get("filepath"),
                    "generated_prompt": image_prompt,
                    "is_ai_generated": True
                }
        except Exception as e:
            logger.error(f"[InstagramAgent] Failed to generate image: {e}")
            
        return {"file_url": None, "generated_prompt": image_prompt, "is_ai_generated": True, "error": "Generation failed"}

    def generate_post_bundle(self, brand_config: Dict, calendar: Dict) -> Dict:
        """Orchestrator: Runs the full pipeline to generate the final Post Bundle."""
        logger.info("[InstagramAgent] Starting orchestration pipeline...")
        
        # 1. Plan content
        strategy_json_str = self.content_planner(brand_config, calendar)
        try:
            strategies = json.loads(strategy_json_str)
            target_strategy = strategies[0] if strategies else {"topic": "General Brand Post", "angle": "Awareness"}
        except:
            target_strategy = {"topic": "General Brand Post", "angle": "Awareness"}
            
        strategy_str = json.dumps(target_strategy)
        
        # 2. Generate Caption
        caption = self.caption_generator(strategy_str, brand_config.get("brand_tone", "Professional"))
        
        # 3. Generate Hashtags
        hashtags = self.hashtag_engine(strategy_str, brand_config.get("brand_niche", "General"))
        
        # 4. Generate Graphic Automatically
        mapped_graphic = self.graphic_generator(caption, strategy_str)
        
        # Assemble Final Bundle
        bundle = {
            "strategy_used": target_strategy,
            "generated_caption": caption,
            "generated_hashtags": hashtags,
            "graphic_asset": mapped_graphic,
            "status": "pending_review"
        }
        
        logger.info("[InstagramAgent] Pipeline complete. Bundle generated.")
        return bundle
