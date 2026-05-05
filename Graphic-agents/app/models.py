from pydantic import BaseModel, Field
from typing import List, Optional

class PropertyDetailsRequest(BaseModel):
    property_type: str = Field(..., example="Luxury Apartments")
    location: str = Field(..., example="Pune")
    price: Optional[str] = Field(default=None, example="₹10 Cr Onwards")
    bhk: Optional[str] = Field(default=None, example="4 & 5 BHK")
    builder: Optional[str] = Field(default=None, example="Emaar Properties")
    phone: Optional[str] = Field(default=None, example="+971 50...")
    email: Optional[str] = Field(default=None, example="contact@business.com")
    address: Optional[str] = Field(default=None, example="Downtown Dubai / www.business.com")
    amenities: Optional[List[str]] = Field(default=None, example=["Pool", "Parking", "Gym", "Clubhouse","Garden","jacuzzi","Parking"])
    extra_details: Optional[str] = Field(default=None, example="Sea facing, modern architecture",description=" any other details about the property")
    niche: Optional[str] = Field(default=None, example="luxury real estate")
    image_size: Optional[str] = Field(default="1024x1024", example="1024x1024", description="Image resolution (e.g., 512x512, 1024x1024, 1536x1024)")
    image_quality: Optional[str] = Field(default="low", example="medium", description="Image quality ('low', 'medium', 'high', 'auto')")
    num_variants: Optional[int] = Field(default=1, description="Number of variants to generate")
    theme_color: Optional[str] = Field(default=None, description="Theme color to use")

class PromptEnhanceRequest(BaseModel):
    raw_prompt: str = Field(..., example="make a poster for an apartment")
    niche: Optional[str] = Field(default=None, example="modern architecture")

class PromptEnhanceResponse(BaseModel):
    success: bool
    enhanced_prompt: str
    trending_keywords: Optional[List[str]] = Field(default=None, description="Keywords used to enhance the prompt")

class GenerateFromPromptRequest(BaseModel):
    prompt: str = Field(..., example="Premium urban Luxury Apartments in Pune, stunning high-rise residential tower...")
    image_size: Optional[str] = Field(default="1024x1024", example="1024x1024", description="Image resolution (e.g., 512x512, 1024x1024, 1536x1024)")
    image_quality: Optional[str] = Field(default="low", example="medium", description="Image quality ('low', 'medium', 'high', 'auto')")

class GenerateResponse(BaseModel):
    success: bool = Field(..., example=True)
    status: str = Field(..., example="success")
    image_url: Optional[str] = Field(default=None, example="/outputs/poster_123.png")
    image_base64: Optional[str] = Field(default=None, description="Base64 encoded image content")
    images_base64: Optional[List[str]] = Field(default=None, description="List of Base64 encoded image data variants")
    trending_keywords: Optional[List[str]] = Field(default=None, description="Keywords used to enhance the prompt")
    image_size: Optional[str] = Field(default=None, description="Image size used for generation")
    image_quality: Optional[str] = Field(default=None, description="Image quality used for generation")
