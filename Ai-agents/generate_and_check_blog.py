import os
import sys
import json

# Add parent directory to path so app package can be resolved
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
sys.path.append('/home/codebloodedsash/automation bitlance/Bitlance_Automation/Ai-agents')

from dotenv import load_dotenv
load_dotenv()
# Also load server/.env to ensure API keys are fully populated
server_env_path = '/home/codebloodedsash/automation bitlance/Bitlance_Automation/server/.env'
if os.path.exists(server_env_path):
    load_dotenv(server_env_path)

from app.services.blog_ai_service import generate_keywords, generate_blog_content, check_plagiarism
from test_human_and_plagiarism import calculate_flesch_readability

def check_emotional_and_human_tones(text):
    """
    Evaluates emotional depth and checks for standard AI clichés/over-used words.
    """
    ai_words = ['delve', 'testament', 'furthermore', 'moreover', 'in conclusion', 'tapestry', 'landscape', 'seamless']
    found_cliches = [w for w in ai_words if w in text.lower()]
    
    first_person_pronouns = ['i ', 'my ', 'we ', 'our ']
    first_person_count = sum(text.lower().count(p) for p in first_person_pronouns)
    
    analysis = []
    analysis.append(f"• First-Person Pronouns Found: {first_person_count} (indicates conversational/experience-driven tone)")
    
    if len(found_cliches) > 0:
        analysis.append(f"• AI Cliché Words Detected: {', '.join(found_cliches)} (consider replacing these for a more natural human voice)")
    else:
        analysis.append("• AI Cliché Words: None detected! Excellent vocabulary variety.")
        
    return "\n".join(analysis)

def main():
    topic = "Key Checklist for Buying Your First Flat in Electronic City, Bangalore in 2026"
    print("=" * 70)
    print(f"1. GENERATING BLOG FOR TOPIC: '{topic}'")
    print("=" * 70)
    
    print("\n[Step 1/4] Researching keywords via SerpAPI...")
    keywords = generate_keywords(topic)
    print(f"Keywords: {keywords}")
    
    print("\n[Step 2/4] Generating blog content via AI Agent...")
    blog_data = generate_blog_content(
        topic=topic,
        keywords=keywords,
        language="en",
        audience="First-time Flat Buyers",
        style="friendly, conversational, emotional experience, first-person story, real-estate tips",
        length_num=350
    )
    blog_text = blog_data.get("blogText", "")
    word_count = blog_data.get("wordCount", 0)
    
    print(f"\nSuccessfully generated article! Word count: {word_count}")
    print("-" * 50)
    # Print a snippet of the generated blog
    lines = blog_text.split('\n')
    print("\n".join(lines[:12]))
    print("...")
    print("-" * 50)
    
    print("\n[Step 3/4] Running Flesch Readability (Human-Friendliness) & Emotion Analysis...")
    score, description = calculate_flesch_readability(blog_text)
    print(f"• Flesch Readability Score: {score}")
    print(f"• Assessment: {description}")
    
    tone_report = check_emotional_and_human_tones(blog_text)
    print(tone_report)
    
    print("\n[Step 4/4] Auditing Plagiarism (Google Search via SerpAPI & LLM Fallbacks)...")
    plagiarism_report = check_plagiarism(blog_text)
    print(plagiarism_report)
    print("=" * 70)

if __name__ == "__main__":
    main()
