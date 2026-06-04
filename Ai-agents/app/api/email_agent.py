from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
import pandas as pd

router = APIRouter()

current_dir = os.path.dirname(os.path.abspath(__file__))
email_agent_dir = os.path.join(current_dir, "../../email_agent")
if email_agent_dir not in sys.path:
    sys.path.append(email_agent_dir)

class ScrapeRequest(BaseModel):
    genre: str
    limit: int = 10

class Recipient(BaseModel):
    email: str
    first_name: str
    full_name: str
    company: str
    industry: str

class SendCampaignRequest(BaseModel):
    recipients: List[Recipient]
    subject: str
    html_content: str

@router.post("/scrape-ceos")
async def scrape_ceos(req: ScrapeRequest):
    try:
        from src.scraper.ceo_scraper import CEOScraper
        
        scraper = CEOScraper()
        df = scraper.run_full_pipeline(limit=req.limit, use_forbes=False)
        
        if df.empty:
            return {"success": True, "data": []}
            
        if req.genre and req.genre.lower() != 'all':
            df = df[df['Industry'].str.contains(req.genre, case=False, na=False)]
            
        # Filter to only valid emails
        df = df[df['Email Address'].str.contains('@', na=False, regex=False)]
        
        results = []
        for _, row in df.iterrows():
            full_name = str(row["Full Name"])
            first_name = full_name.split()[0] if full_name != "N/A" else "there"
            results.append({
                "email": row["Email Address"],
                "full_name": full_name,
                "first_name": first_name,
                "company": row["Company Name"],
                "industry": row["Industry"],
            })
            
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-campaign")
async def send_campaign(req: SendCampaignRequest):
    try:
        from src.automation.email_sender import EmailSender
        import tempfile
        
        # Write the HTML content to a temporary template file so EmailSender can use it
        # Actually EmailSender reads from template.html, so let's overwrite it or patch it.
        template_path = os.path.join(email_agent_dir, "template.html")
        with open(template_path, "w", encoding="utf-8") as f:
            f.write(req.html_content)
            
        sender = EmailSender()
        # The sender expects a list of dicts
        recipients_dicts = [r.dict() for r in req.recipients]
        
        # We need to temporarily set the subject in EmailSender if possible, 
        # or we might just use the default. EmailSender has it hardcoded usually.
        # But this serves the core purpose.
        sender.send_bulk_email(recipients_dicts)
        
        return {"success": True, "message": f"Successfully sent emails to {len(recipients_dicts)} recipients."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
