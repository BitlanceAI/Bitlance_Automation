from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FAQItem(BaseModel):
    question: str
    answer: str

class StandardArticleResponse(BaseModel):
    title: str
    meta_title: str
    meta_description: str
    slug: str
    content: str
    faq: List[FAQItem] = Field(default_factory=list)
    internal_links: List[str] = Field(default_factory=list)
    external_sources: List[str] = Field(default_factory=list)
    entities: List[str] = Field(default_factory=list)
    schema_markup: Dict[str, Any] = Field(default_factory=dict)
    keywords: List[str] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)
    generated_at: str

class TopicCandidate(BaseModel):
    topic: str
    keywords: List[str]
    search_intent: Optional[str] = None
    traffic_score: Optional[int] = None
    revenue_score: Optional[int] = None
    difficulty: Optional[str] = None
    scoring_breakdown: Optional[str] = None

class TopicResponse(BaseModel):
    industry: str
    topics: List[TopicCandidate]

class AuditResponse(BaseModel):
    success: bool
    audit_report: str
    score: Optional[int] = None
    action_items: List[str] = Field(default_factory=list)

class RewriteResponse(BaseModel):
    success: bool
    rewritten_content: str
    improvements_made: List[str] = Field(default_factory=list)

class AddTrackedKeywordRequest(BaseModel):
    article_url: str
    target_keyword: str
    optimization_mode: str = "SEO"

class TrackedKeywordResponse(BaseModel):
    id: str
    article_url: str
    target_keyword: str
    optimization_mode: str
    status: str = "Tracking Initiated"

class AIVisibilityCheckRequest(BaseModel):
    target_keyword: str
    expected_url: str
    
class AIVisibilityResponse(BaseModel):
    ai_engine: str
    was_cited: bool
    citation_url_found: Optional[str] = None
    engine_response_snippet: Optional[str] = None
