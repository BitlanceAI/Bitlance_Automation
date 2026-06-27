from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import logging
from app.services.instagram_agent import InstagramAgent

logger = logging.getLogger(__name__)
router = APIRouter()

class GenerateCalendarRequest(BaseModel):
    brand_config: Dict[str, Any]
    calendar: Dict[str, Any]
    days: int = 3

@router.post("/generate-calendar")
async def generate_calendar(request: GenerateCalendarRequest):
    """
    Generates N days of post bundles using the InstagramAgent.
    Returns the bundles as an array of JSON objects.
    """
    logger.info(f"Generating {request.days}-day calendar...")
    try:
        agent = InstagramAgent()
        bundles = []
        
        # We call the generator loop. We will fake the calendar passing 
        # so it generates unique ones. We just pass the same config.
        # Ideally, content_planner generates an array of strategies, 
        # and we loop through them.
        
        # Let's get the master strategy list
        strategy_json_str = agent.content_planner(request.brand_config, request.calendar)
        import json
        try:
            strategies = json.loads(strategy_json_str)
        except:
            strategies = [{"topic": f"Day {i+1} Theme", "angle": "Awareness"} for i in range(request.days)]
            
        # Limit to requested days
        strategies = strategies[:request.days]
        
        # Generate the rest for each strategy
        for idx, target_strategy in enumerate(strategies):
            strategy_str = json.dumps(target_strategy)
            
            # Caption
            caption = agent.caption_generator(strategy_str, request.brand_config.get("brand_tone", "Professional"))
            
            # Hashtags
            hashtags = agent.hashtag_engine(strategy_str, request.brand_config.get("brand_niche", "General"))
            
            # Graphic
            mapped_graphic = agent.graphic_generator(caption, strategy_str)
            
            bundle = {
                "strategy_used": target_strategy,
                "generated_caption": caption,
                "generated_hashtags": hashtags,
                "graphic_asset": mapped_graphic,
                "status": "pending_review",
                "day_offset": idx + 1 # Use this to schedule in Node.js
            }
            bundles.append(bundle)
            logger.info(f"Generated day {idx+1}/{request.days}")

        return {"success": True, "bundles": bundles}

    except Exception as e:
        logger.error(f"Error generating calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))
