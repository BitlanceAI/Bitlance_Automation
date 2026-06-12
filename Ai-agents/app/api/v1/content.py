from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from app.services.blog_storage_service import validate_credits, deduct_credits
from app.api.v1.schemas import AuditResponse, RewriteResponse

router = APIRouter()

class AuditRequest(BaseModel):
    content: str = Field(..., description="The content to audit")
    target_keyword: Optional[str] = Field(None, description="Focus keyword for the audit")
    mode: Optional[str] = Field("SEO", description="Audit mode: SEO or GEO")

class RewriteRequest(BaseModel):
    content: str = Field(..., description="The content to rewrite")
    instructions: Optional[str] = Field(None, description="Specific instructions for rewriting")
    mode: Optional[str] = Field("SEO", description="Target mode for rewrite")

@router.post("/audit", response_model=AuditResponse, summary="Content Audit API")
def audit_content(request: Request, body: AuditRequest):
    """
    Audit API: 
    - SEO audit
    - GEO audit
    - EEAT audit
    - Internal link audit
    """
    auth_type = getattr(request.state, "auth_type", "jwt")
    user_id = getattr(request.state, "user_id", None)

    if auth_type == "api_key" and user_id:
        try:
            credit_check = validate_credits(user_id, "blog", 1)
            if not credit_check["hasEnough"]:
                raise HTTPException(status_code=402, detail="Payment Required: Insufficient credits.")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Credit validation failed: {str(e)}")

    try:
        from app.services.blog_ai_service import _openai_chat_call
        prompt = f"Perform a comprehensive {body.mode} audit, EEAT audit, and Internal link audit on the following content.\nFocus keyword: {body.target_keyword}\n\nContent:\n{body.content}"
        audit_result = _openai_chat_call(prompt, system_msg="You are an expert SEO/GEO content auditor. Analyze the content and return structured feedback.")
        
        return AuditResponse(
            success=True,
            audit_report=audit_result,
            action_items=["Review the generated audit report and apply suggested changes."]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rewrite", response_model=RewriteResponse, summary="Content Rewrite API")
def rewrite_content(request: Request, body: RewriteRequest):
    """
    Rewrite API: 
    - Rewrite low-performing content
    - Improve SEO/GEO structure
    - Optimize citations
    """
    auth_type = getattr(request.state, "auth_type", "jwt")
    user_id = getattr(request.state, "user_id", None)

    if auth_type == "api_key" and user_id:
        try:
            credit_check = validate_credits(user_id, "blog", 1)
            if not credit_check["hasEnough"]:
                raise HTTPException(status_code=402, detail="Payment Required: Insufficient credits.")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Credit validation failed: {str(e)}")

    try:
        from app.services.blog_ai_service import _openai_chat_call
        prompt = f"Rewrite the following content to improve {body.mode} structure, optimize citations, and fix low-performing areas.\nInstructions: {body.instructions or 'None'}\n\nContent:\n{body.content}"
        rewritten_result = _openai_chat_call(prompt, system_msg=f"You are an expert content editor and {body.mode} optimizer. Rewrite the article strictly according to the highest industry standards.")
        
        # Deduct credits if applicable
        if auth_type == "api_key" and user_id:
            try:
                import uuid
                deduct_credits(
                    user_id=user_id,
                    agent_type="blog",
                    reference_id=str(uuid.uuid4()), # We can use a random uuid for ad-hoc api calls
                    reference_table="articles", # The database requires this string 
                    usage_quantity=1,
                    metadata={"source": "api_key_public", "action": "rewrite_article"}
                )
            except Exception as e:
                print(f"Failed to deduct credits for rewrite API: {e}")

        return RewriteResponse(
            success=True,
            rewritten_content=rewritten_result,
            improvements_made=["Applied specific instructions", f"Optimized for {body.mode} structure"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
