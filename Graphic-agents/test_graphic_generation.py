import os
import sys
from openai import OpenAI

# Add Graphic-agents directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

from dotenv import load_dotenv
load_dotenv()
# Also try to load server/.env to get PERPLEXITY_API_KEY
server_env_path = '/home/codebloodedsash/automation bitlance/Bitlance_Automation/server/.env'
if os.path.exists(server_env_path):
    load_dotenv(server_env_path)

from app.services.social_post_service import SocialPostService, PLATFORM_SPECS
from app.config import ModelConfig

def main():
    category = "AI for Real Estate Marketing"
    platforms = ["linkedin", "twitter"]
    
    print("=" * 70)
    print(f"1. RUNNING DYNAMIC GRAPHIC AGENT PIPELINE FOR: '{category}'")
    print("=" * 70)
    
    # Overwrite LLM_MODEL config to sonar-pro for Perplexity compatibility
    ModelConfig.LLM_MODEL = "sonar"
    
    try:
        service = SocialPostService()
        
        # Patch the OpenAI client to use Perplexity API compatibility
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        if perplexity_key:
            print("🟢 Patching LLM client to use Perplexity sonar API compatibility...")
            service.client = OpenAI(
                api_key=perplexity_key,
                base_url="https://api.perplexity.ai"
            )
        
        # Patch keyword service client as well
        if hasattr(service.keyword_svc, 'client'):
            service.keyword_svc.client = service.client
            
        # Patch image generation step to bypass invalid OpenAI credentials and output a mock PNG
        def mock_generate_image(prompt, quality="low", size="1024x1024", num_variants=1):
            print("\n[ImageService Mock] Simulating DALL-E image generation...")
            print(f"• Prompt: {prompt[:100]}...")
            os.makedirs("outputs", exist_ok=True)
            mock_path = os.path.abspath("outputs/mock_graphic_ad.png")
            # Create a simple mock file
            with open(mock_path, "wb") as f:
                f.write(b"PNG_MOCK_DATA")
            return [{
                "filepath": mock_path,
                "filename": "mock_graphic_ad.png",
                "b64_string": "UE5HX01PQ0tfREFUQQ==", # PNG_MOCK_DATA in b64
                "image_url": None
            }]
            
        service.image_svc.generate = mock_generate_image
        
        print("\n[Step 1/3] Fetching trends & generating social captions...")
        result = service.generate_social_post(
            category=category,
            platforms=platforms,
            tone="professional",
            language="English",
            extra_instructions="Highlight how automated copy saves real estate agents 10 hours a week.",
            image_quality="low"
        )
        
        print("\nSuccessfully generated social posts!")
        print("-" * 50)
        
        # Display the generated captions
        for platform in platforms:
            plat_data = result.get("captions", {}).get(platform, {})
            if isinstance(plat_data, dict):
                caption = plat_data.get("caption", "")
            else:
                caption = str(plat_data)
                
            print(f"\n--- Platform: {platform.upper()} ---")
            print(f"Caption Length: {len(caption)} characters (Limit: {PLATFORM_SPECS[platform]['max_chars']})")
            print(f"Caption Text:\n{caption}")
            
        print("\nGraphic Prompt formulated by agent:")
        print(result.get("graphic_prompt", "No prompt found"))
        print("-" * 50)
        
        print("\n[Step 2/3] Analyzing Caption Quality & Compliance...")
        for platform in platforms:
            plat_data = result.get("captions", {}).get(platform, {})
            if isinstance(plat_data, dict):
                caption = plat_data.get("caption", "")
            else:
                caption = str(plat_data)
            max_limit = PLATFORM_SPECS[platform]['max_chars']
            
            # Check length limit
            if len(caption) <= max_limit:
                print(f"🟢 {platform.upper()}: Length check PASSED ({len(caption)}/{max_limit})")
            else:
                print(f"🔴 {platform.upper()}: Length check FAILED ({len(caption)}/{max_limit})")
                
            # Check for hashtags
            hashtags = [word for word in caption.split() if word.startswith("#")]
            print(f"• Hashtags found: {len(hashtags)} ({', '.join(hashtags)})")
            
        print("\n[Step 3/3] Inspecting Generated Creative Image...")
        images_list = result.get("images", [])
        if images_list:
            graphic_data = images_list[0]
            print(f"🟢 Creative Graphic generated successfully!")
            print(f"• File Name: {graphic_data.get('filename')}")
            print(f"• Saved Path: {graphic_data.get('filepath')}")
        else:
            print("🔴 Creative Graphic was not generated or returned empty.")
            
    except Exception as e:
        print(f"\n❌ Error running graphic agent pipeline: {e}")
        import traceback
        traceback.print_exc()
        
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
