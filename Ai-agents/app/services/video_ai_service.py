"""
Video AI Service for Universal Reel Generator Agent.
Processes YouTube links to analyze pacing, tone, hooks, structure,
and generates customized narration scripts, scene layouts,
and avatar/voice configurations matching that style.
"""

import os
import re
import urllib.parse
import requests
import json
from typing import Optional, Dict, List, Any
from bs4 import BeautifulSoup

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

def _openai_chat_call(user_prompt: str, system_msg: str = "You are an expert video strategist.", max_tokens: int = 2000) -> str:
    """Make a single call to OpenAI GPT-4o and return the text content."""
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }
    res = requests.post(OPENAI_CHAT_URL, headers=headers, json=payload, timeout=60)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]

def fetch_youtube_metadata(youtube_url: str) -> Dict[str, Any]:
    """
    Scrapes basic YouTube page metadata (title, description) from watch page
    to serve as reference context if transcript is not easily downloadable.
    """
    try:
        # Standardize URL
        if "youtu.be/" in youtube_url:
            video_id = youtube_url.split("youtu.be/")[-1].split("?")[0]
            youtube_url = f"https://www.youtube.com/watch?v={video_id}"

        # Fetch page with headers to look like a browser
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
        res = requests.get(youtube_url, headers=headers, timeout=15)
        res.raise_for_status()

        soup = BeautifulSoup(res.text, "html.parser")
        
        # Extract title
        title_tag = soup.find("meta", property="og:title")
        title = title_tag["content"] if title_tag else ""
        if not title:
            title_tag = soup.find("title")
            title = title_tag.text if title_tag else "Stunning Video Showcase"
            title = title.replace(" - YouTube", "")

        # Extract description
        desc_tag = soup.find("meta", property="og:description")
        description = desc_tag["content"] if desc_tag else ""
        if not description:
            desc_tag = soup.find("meta", {"name": "description"})
            description = desc_tag["content"] if desc_tag else "Video Walkthrough & Presentation"

        # Try to find channel name
        channel_tag = soup.find("link", itemprop="name")
        channel = channel_tag["content"] if channel_tag else "Showcase Channel"

        # Extract video ID
        parsed = urllib.parse.urlparse(youtube_url)
        q_params = urllib.parse.parse_qs(parsed.query)
        video_id = q_params.get("v", [""])[0]

        return {
            "success": True,
            "title": title,
            "description": description,
            "channel": channel,
            "video_id": video_id,
            "url": youtube_url
        }

    except Exception as e:
        print(f"Error fetching YouTube metadata: {e}")
        # Return sensible default structure
        return {
            "success": False,
            "title": "Stunning Video Showcase",
            "description": "Welcome to this exclusive presentation. In this video we highlight the key features, design elements, and core benefits.",
            "channel": "Premium Showcase Channel",
            "video_id": "dQw4w9WgXcQ",
            "url": youtube_url
        }

def analyze_video_style(youtube_url: str) -> Dict[str, Any]:
    """
    Parses metadata and utilizes LLM to deduce pacing, tone, hooks, structure,
    transitions, and key scenes in the style of the reference video.
    """
    meta = fetch_youtube_metadata(youtube_url)
    
    prompt = f"""
    You are an AI video producer and style analyzer.
    Analyze the following YouTube video details and dissect its video marketing style, hook technique, pacing, narration tone, and scene structure.

    VIDEO TITLE: {meta.get('title')}
    VIDEO CHANNEL: {meta.get('channel')}
    VIDEO DESCRIPTION: {meta.get('description')}

    Please analyze this style thoroughly and return a valid JSON object matching this exact structure:
    {{
        "hook_style": "Describe the hook category (e.g. curiosity-driven question, brand promise, immediate benefit reveal) and how it starts.",
        "pacing": "Explain the pacing (e.g. Fast cuts, Slow cinematic, Upbeat, Steady) and visual editing rhythm.",
        "tone": "Describe the vocal narration tone (e.g. Professional, Energetic, Informative, Warm, Aspirational).",
        "transitions": "Detail the video transitions detected (e.g. Speed ramp, Zoom-ins, Smooth cuts, Text overlays).",
        "script_structure": [
            "Section 1: Hook / Attention Grabber",
            "Section 2: Introduction of Topic/Product",
            "Section 3: Key Features / Content Body",
            "Section 4: Core Value / Demonstration",
            "Section 5: Summary / Proof",
            "Section 6: Call-to-action"
        ],
        "engagement_techniques": [
            "Highlighting key metrics or features",
            "Bold text overlays",
            "Direct address to target audience"
        ],
        "summary": "Summarize the style profile in 2 sentences."
    }}

    Rules:
    - Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Just return the raw JSON string.
    - Ensure all properties and string values are properly enclosed in double quotes.
    """

    try:
        raw_res = _openai_chat_call(prompt, "You are a professional video media analyst.")
        # Cleanup if LLM ignored rules and added markdown wrapping
        cleaned = raw_res.replace("```json", "").replace("```", "").strip()
        analysis = json.loads(cleaned)
        analysis["meta"] = meta
        return analysis
    except Exception as e:
        print(f"Error analyzing video style: {e}")
        # Standard fallback style analysis
        return {
            "success": False,
            "hook_style": "Curiosity-driven hook (e.g. 'What if I told you...')",
            "pacing": "Upbeat lifestyle, smooth cuts, and transitions timed to beats",
            "tone": "Conversational, premium, polished, with warm and aspirational undertones",
            "transitions": "Elegant minimal typography overlays, zoom transitions",
            "script_structure": [
                "Hook: Grab attention and state the big promise/problem",
                "Introduction: Introduce the core topic or product",
                "Key Value: Showcase main features and specs",
                "Benefits: Demonstrate how it improves life or solves problems",
                "Closing: Offer, pricing, and Contact CTA"
            ],
            "engagement_techniques": [
                "Text popups highlighting prime dimensions/features",
                "Focus on experiential benefits (saving time, premium feel)",
                "Actionable price-value comparison or limited-time offer"
            ],
            "summary": "An engaging cinematic style that balances stunning visual sweep shots with precise benefits to appeal to modern viewers.",
            "meta": meta
        }

def generate_reel_script(style_analysis: Dict[str, Any], property_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates a customized, scene-by-scene script matching the pacing, tone, and structure
    derived from the style analysis, populated with the new topic/property details.
    """
    # Dynamic inputs support both real estate and universal topics
    title = property_details.get("topic", property_details.get("title", "New Product / Topic"))
    location = property_details.get("location", "")
    price = property_details.get("price", "")
    bhk = property_details.get("bhk", "")
    
    amenities = property_details.get("amenities", [])
    if isinstance(amenities, list):
        amenities_str = ", ".join(amenities)
    else:
        amenities_str = str(amenities)
        
    extra_details = property_details.get("details", property_details.get("extra_details", ""))
    cta = property_details.get("cta", "Tap link in bio to learn more!")

    # Build detailed topic string
    topic_info = f"- Subject/Title: {title}\n"
    if bhk:
        topic_info += f"- Type/Configuration: {bhk}\n"
    if location:
        topic_info += f"- Location/Context: {location}\n"
    if price:
        topic_info += f"- Pricing/Offer: {price}\n"
    if amenities_str:
        topic_info += f"- Key Features/Amenities: {amenities_str}\n"
    if cta:
        topic_info += f"- Call to Action: {cta}\n"
    if extra_details:
        topic_info += f"- Specifications/Description: {extra_details}\n"

    prompt = f"""
    Create a narration script for a short video reel (under 60 seconds).
    You must adopt the pacing, tone, and script structure determined by the style analysis profile.
    
    STYLE ANALYSIS PROFILE:
    - Narration Tone: {style_analysis.get('tone')}
    - Pacing: {style_analysis.get('pacing')}
    - Hook Style: {style_analysis.get('hook_style')}
    - Visual Transitions: {style_analysis.get('transitions')}
    - Script Structure: {', '.join(style_analysis.get('script_structure', []))}

    TOPIC DETAILS:
    {topic_info}

    Break down the final script into 5-6 scenes. Each scene should represent a specific visual cut.
    Return a valid JSON object matching this exact structure:
    {{
        "total_estimated_duration": 45,
        "background_music_vibe": "Upbeat, energetic and modern background track with clean transitions matching the video style",
        "scenes": [
            {{
                "scene_id": 1,
                "narration": "Exact text that the presenter avatar will speak out loud. Make it highly engaging, matching the Hook Style and Narration Tone.",
                "visual_cue": "Specific description of the video clip (e.g. Drone sweep shot zooming towards a modern skyscraper exterior, or close up of product)",
                "overlay_text": "Bold capitalization text to overlay on the screen (e.g. UP TO 10X FASTER)",
                "duration": 7,
                "transition": "Transition style name (e.g. Zoom Rush)"
            }},
            ...
        ]
    }}

    Rules:
    - Every scene must have a duration (suggested: 6-9 seconds per scene, total should sum to 40-50s).
    - Maintain a cohesive storyline: Hook -> Introduce Niche/Product -> Highlight Key Specs -> Show Core Value/Experience -> Call to Action.
    - Do NOT replicate the reference video's text word-for-word. Adapt the *storytelling mechanics*.
    - Return ONLY the raw JSON string. Do NOT include ```json or any other markdown symbols.
    """

    try:
        raw_res = _openai_chat_call(prompt, "You are an expert video copywriter.")
        cleaned = raw_res.replace("```json", "").replace("```", "").strip()
        script_data = json.loads(cleaned)
        return script_data
    except Exception as e:
        print(f"Error generating reel script: {e}")
        # Universal fallback script
        return {
            "total_estimated_duration": 45,
            "background_music_vibe": "Modern ambient house, uplifting and sophisticated",
            "scenes": [
                {
                    "scene_id": 1,
                    "narration": f"What if you could completely transform the way you experience efficiency? Meet {title}.",
                    "visual_cue": f"Slow cinematic close-up or push-in shot showcasing {title}.",
                    "overlay_text": f"WELCOME TO {title.upper()}",
                    "duration": 8,
                    "transition": "Smooth zoom"
                },
                {
                    "scene_id": 2,
                    "narration": f"Presenting a game changer. Designed to deliver peak performance without compromising on style.",
                    "visual_cue": f"Dynamic tracking shot showcasing key design features of {title}.",
                    "overlay_text": "PREMIUM PERFORMANCE",
                    "duration": 9,
                    "transition": "Speed ramp"
                },
                {
                    "scene_id": 3,
                    "narration": f"Built with state-of-the-art materials and loaded with features to keep you ahead.",
                    "visual_cue": "Macro shot focusing on build quality and premium aesthetics.",
                    "overlay_text": "STATE OF THE ART",
                    "duration": 8,
                    "transition": "Cross dissolve"
                },
                {
                    "scene_id": 4,
                    "narration": "Experience seamless integration and unmatched reliability, making it the perfect choice for your daily routine.",
                    "visual_cue": "Animated diagram or demonstration showing the ease of use and user interface.",
                    "overlay_text": "SEAMLESS INTEGRATION",
                    "duration": 8,
                    "transition": "Quick slide"
                },
                {
                    "scene_id": 5,
                    "narration": f"Available now {f'at {price}' if price else ''}. {cta}",
                    "visual_cue": "Beautiful final shot finishing with a call to action graphic.",
                    "overlay_text": "TAP LINK BELOW | SECURE YOURS",
                    "duration": 12,
                    "transition": "Fade to black"
                }
            ]
        }
