"""
social.py — Social content generation routes.

Endpoints:
  POST /api/social/generate-calendar   — REST: generate N days of post bundles
  POST /api/social/mcp                 — MCP (JSON-RPC): same pipeline exposed as MCP tools
"""

import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.services.instagram_agent import InstagramAgent

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Shared helpers ────────────────────────────────────────────────────────────

def _get_agent() -> InstagramAgent:
    return InstagramAgent()


def _create_bloom_prompt(agent: InstagramAgent, caption: str, strategy: dict, language: str = "English") -> str:
    """Ask Perplexity to write a Bloom-optimised image prompt (subject/composition only, no style words)."""
    system_prompt = (
        "You are an Art Director briefing Bloom AI, a brand-aware image generator. "
        "Bloom applies brand colors, fonts, and visual style automatically — "
        "so describe ONLY: what subject/scene to show, the composition, and the medium "
        "(photograph, illustration, mockup, etc.). "
        "Never use words like professional, stunning, high-quality, sleek, premium, clean. "
        f"If any text should appear in the image, it must be in {language}. "
        "Keep the prompt under 100 words. Return ONLY the prompt, nothing else."
    )
    user_prompt = f"Strategy: {json.dumps(strategy)}\nCaption: {caption}"
    return agent._call_perplexity(system_prompt, user_prompt)


def _build_bundles(
    agent: InstagramAgent,
    brand_config: dict,
    calendar: dict,
    days: int,
    generate_graphics: bool = False,
    generate_bloom_prompt: bool = True,
    language: str = "English",
) -> list[dict]:
    """Core pipeline: strategy → caption → hashtags → (optional graphic / bloom prompt)."""
    strategy_json_str = agent.content_planner(brand_config, calendar)
    try:
        strategies = json.loads(strategy_json_str)
    except Exception:
        strategies = [{"topic": f"Day {i + 1} Theme", "angle": "Awareness"} for i in range(days)]
    strategies = strategies[:days]

    brand_tone  = brand_config.get("brand_tone",  "Professional")
    brand_niche = brand_config.get("brand_niche", "General")

    bundles = []
    for idx, strategy in enumerate(strategies):
        strategy_str = json.dumps(strategy)

        caption  = agent.caption_generator(strategy_str, brand_tone)
        hashtags = agent.hashtag_engine(strategy_str, brand_niche)

        graphic_asset  = None
        bloom_prompt   = None

        if generate_graphics:
            graphic_asset = agent.graphic_generator(caption, strategy_str, language)

        if generate_bloom_prompt and not generate_graphics:
            try:
                bloom_prompt = _create_bloom_prompt(agent, caption, strategy, language)
            except Exception as e:
                logger.warning("[social] bloom prompt failed: %s", e)

        bundles.append({
            "day_offset":         idx + 1,
            "strategy_used":      strategy,
            "generated_caption":  caption,
            "generated_hashtags": hashtags,
            "graphic_asset":      graphic_asset,
            "bloom_image_prompt": bloom_prompt,
            "status":             "pending_review",
        })
        logger.info("[social] Day %d/%d done", idx + 1, days)

    return bundles


# ── REST endpoint (existing) ──────────────────────────────────────────────────

class GenerateCalendarRequest(BaseModel):
    brand_config: Dict[str, Any]
    calendar: Dict[str, Any]
    days: int = 3
    generate_graphics: bool = False
    language: str = "English"


@router.post("/generate-calendar")
async def generate_calendar(request: GenerateCalendarRequest):
    logger.info("[social] Generating %d-day calendar (REST)", request.days)
    try:
        agent   = _get_agent()
        bundles = _build_bundles(
            agent,
            request.brand_config,
            request.calendar,
            request.days,
            generate_graphics=request.generate_graphics,
            generate_bloom_prompt=True,
            language=request.language,
        )
        return {"success": True, "bundles": bundles}
    except Exception as e:
        logger.error("[social] generate_calendar error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


# ── Single image generation endpoint ─────────────────────────────────────────

class GenerateImageRequest(BaseModel):
    prompt: str
    caption: str = ""
    strategy: str = ""
    language: str = "English"


@router.post("/generate-image")
async def generate_image(request: GenerateImageRequest):
    """Generate a single image via OpenAI and return the local file URL."""
    logger.info("[social] Generating single image via OpenAI")
    try:
        agent = _get_agent()
        # If a raw prompt is provided, use it directly; otherwise build one from caption+strategy
        if request.prompt and len(request.prompt) > 20:
            image_prompt = request.prompt
        else:
            image_prompt = agent._call_perplexity(
                "You are an Art Director. Write a highly detailed, vivid prompt for an AI image generator "
                "based on the following post strategy and caption. Return ONLY the prompt, nothing else.",
                f"Strategy: {request.strategy}\nCaption: {request.caption}"
            )

        from app.services.image_service import ImageService
        image_svc = ImageService()
        images = image_svc.generate(
            prompt=image_prompt,
            quality="low",
            size="1024x1024",
            num_variants=1
        )

        if images:
            file_url = images[0].get("filepath", "")
            # Convert absolute path to a relative URL that can be served via /outputs/
            if file_url:
                import os
                file_url = "outputs/" + os.path.basename(file_url)
            return {"success": True, "file_url": file_url, "prompt_used": image_prompt}

        return {"success": False, "file_url": None, "error": "No image generated"}
    except Exception as e:
        logger.error("[social] generate_image error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


# ── MCP endpoint (JSON-RPC 2.0, Streamable HTTP) ──────────────────────────────
#
# Mounted at: POST /api/social/mcp
# Node.js calls this instead of a separate MCP process.

MCP_PROTOCOL_VERSION = "2024-11-05"
SERVER_INFO = {
    "name":    "bitlance-social-agent",
    "version": "1.0.0",
    "title":   "Bitlance Social Agent",
}
INSTRUCTIONS = (
    "AI-powered social media content pipeline built on Perplexity. "
    "Call generate_full_bundle to get captions, hashtags, and Bloom image prompts for N days. "
    "Or use the individual tools: plan_content_strategy → write_caption → generate_hashtags → create_bloom_image_prompt."
)

TOOLS = [
    {
        "name":  "plan_content_strategy",
        "title": "Plan Content Strategy",
        "description": (
            "Generate a day-wise content strategy from brand config and monthly calendar. "
            "Returns a JSON array: [{ day, topic, angle }, ...]"
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "brand_config": {"type": "object", "description": "{ brand_name, brand_tone, brand_niche }"},
                "calendar":     {"type": "object", "description": "{ month, year, themes, festivals }"},
            },
            "required": ["brand_config", "calendar"],
        },
    },
    {
        "name":  "write_caption",
        "title": "Write Caption",
        "description": "Write an engaging Instagram caption for a post strategy.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "strategy":   {"type": "object",  "description": "Single strategy object { day, topic, angle }"},
                "brand_tone": {"type": "string",  "description": "e.g. Professional, Casual, Inspirational"},
            },
            "required": ["strategy"],
        },
    },
    {
        "name":  "generate_hashtags",
        "title": "Generate Hashtags",
        "description": "Generate 10-15 trending + niche hashtags for a post strategy.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "strategy":    {"type": "object", "description": "Single strategy object"},
                "brand_niche": {"type": "string", "description": "e.g. Real Estate, Fitness, Fashion"},
            },
            "required": ["strategy"],
        },
    },
    {
        "name":  "create_bloom_image_prompt",
        "title": "Create Bloom Image Prompt",
        "description": (
            "Generate a concise image prompt optimised for Bloom AI. "
            "Describes subject and composition only — Bloom adds brand style automatically."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "caption":  {"type": "string", "description": "Post caption for context"},
                "strategy": {"type": "object", "description": "Post strategy { topic, angle }"},
                "language": {"type": "string", "description": "Language for in-image text (default English)"},
            },
            "required": ["caption", "strategy"],
        },
    },
    {
        "name":  "generate_full_bundle",
        "title": "Generate Full Bundle",
        "description": (
            "Run the full pipeline for N days: strategy → caption → hashtags → Bloom image prompt. "
            "Returns list of bundle dicts ready for MongoDB insertion."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "brand_config": {"type": "object"},
                "calendar":     {"type": "object"},
                "days":         {"type": "integer", "default": 7},
                "language":     {"type": "string",  "default": "English"},
            },
            "required": ["brand_config", "calendar"],
        },
    },
]


def _text_result(value) -> dict:
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)
    return {"content": [{"type": "text", "text": text}]}


def _mcp_error(req_id, code: int, message: str) -> dict:
    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}


def _handle_tool_call(name: str, args: dict) -> dict:
    agent = _get_agent()

    if name == "plan_content_strategy":
        result = agent.content_planner(args["brand_config"], args["calendar"])
        return _text_result(result)

    if name == "write_caption":
        tone   = args.get("brand_tone", "Professional")
        result = agent.caption_generator(json.dumps(args["strategy"]), tone)
        return _text_result(result)

    if name == "generate_hashtags":
        niche  = args.get("brand_niche", "General")
        result = agent.hashtag_engine(json.dumps(args["strategy"]), niche)
        return _text_result(result)

    if name == "create_bloom_image_prompt":
        result = _create_bloom_prompt(
            agent,
            args["caption"],
            args["strategy"],
            args.get("language", "English"),
        )
        return _text_result(result)

    if name == "generate_full_bundle":
        bundles = _build_bundles(
            agent,
            args["brand_config"],
            args["calendar"],
            args.get("days", 7),
            generate_graphics=False,
            generate_bloom_prompt=True,
            language=args.get("language", "English"),
        )
        return _text_result(bundles)

    raise ValueError(f"Unknown tool: {name}")


@router.post("/mcp")
async def mcp_endpoint(request: Request):
    """
    JSON-RPC 2.0 MCP endpoint (Streamable HTTP transport).
    Supports: initialize, tools/list, tools/call
    """
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}},
            status_code=200,
        )

    req_id = body.get("id")
    method = body.get("method", "")
    params = body.get("params", {})

    try:
        if method == "initialize":
            result = {
                "protocolVersion": MCP_PROTOCOL_VERSION,
                "capabilities":    {"tools": {"listChanged": False}},
                "serverInfo":      SERVER_INFO,
                "instructions":    INSTRUCTIONS,
            }

        elif method == "tools/list":
            result = {"tools": TOOLS}

        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            if not tool_name:
                return JSONResponse(_mcp_error(req_id, -32602, "Missing tool name"))
            logger.info("[MCP] tools/call → %s", tool_name)
            result = _handle_tool_call(tool_name, tool_args)

        else:
            return JSONResponse(_mcp_error(req_id, -32601, f"Method not found: {method}"))

        return JSONResponse({"jsonrpc": "2.0", "id": req_id, "result": result})

    except ValueError as e:
        return JSONResponse(_mcp_error(req_id, -32602, str(e)))
    except Exception as e:
        logger.error("[MCP] Internal error: %s", e)
        return JSONResponse(_mcp_error(req_id, -32603, f"Internal error: {e}"))
