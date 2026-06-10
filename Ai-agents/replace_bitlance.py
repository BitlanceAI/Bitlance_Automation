import re

with open("app/services/blog_ai_service.py", "r") as f:
    content = f.read()

# 1. Inject short_name logic in generate_blog_content
# Find where company_name is extracted
# Around line 430
content = re.sub(
    r'(company_name = brand_context\.get\("company_name", "Bitlance.*?"\))',
    r'\1\n    short_name = company_name.split(" ")[0] if company_name else "Our Company"',
    content
)

# 2. Inject short_name logic in openai_generate_blog_content
# Around line 905
content = re.sub(
    r'(brand_context: dict = None,\n\) -> dict:\n    """Fallback blog content generation via OpenAI GPT-4o\."""\n    interlinks = interlinks or \[\])',
    r'\1\n    brand_context = brand_context or {}\n    company_name = brand_context.get("company_name", "Bitlance")\n    short_name = company_name.split(" ")[0] if company_name else "Our Company"',
    content
)

# 3. Replace all hardcoded "Bitlance" strings within the prompt text with {short_name}
# But only the ones in the prompt string, not the variables.
# The occurrences are:
# 12. ## How Bitlance Implements This -> 12. ## How {short_name} Implements This
# Include EXACTLY 3 Bitlance proprietary benchmarks -> Include EXACTLY 3 {short_name} proprietary benchmarks
# • [Bitlance finding with specific number -> • [{short_name} finding with specific number
# *Source: Bitlance Internal Benchmark, 2025* -> *Source: {short_name} Internal Benchmark, 2025*
# Name it after Bitlance: e.g., "Bitlance [Topic] Maturity Model" or "Bitlance [Topic] Framework" or "Bitlance [Topic] Playbook". -> Name it after {short_name}: e.g., "{short_name} [Topic] Maturity Model" or "{short_name} [Topic] Framework" or "{short_name} [Topic] Playbook".
# ## The Bitlance Automation Maturity Model -> ## The {short_name} Maturity Model
# 14. ## How Bitlance Implements This -> 14. ## How {short_name} Implements This
# Solution:** [Exact Bitlance workflow/tool used] -> Solution:** [Exact {short_name} workflow/tool used]
# Minimum 3 Bitlance proprietary benchmarks with -> Minimum 3 {short_name} proprietary benchmarks with

# Let's just do a series of exact replacements.
replacements = [
    ("How Bitlance Implements This", "How {short_name} Implements This"),
    ("3 Bitlance proprietary", "3 {short_name} proprietary"),
    ("[Bitlance finding", "[{short_name} finding"),
    ("Source: Bitlance Internal Benchmark", "Source: {short_name} Internal Benchmark"),
    ("Name it after Bitlance:", "Name it after {short_name}:"),
    ("\"Bitlance [Topic]", "\"{short_name} [Topic]"),
    ("## The Bitlance Automation Maturity Model", "## The {short_name} Automation Maturity Model"),
    ("Exact Bitlance workflow", "Exact {short_name} workflow"),
    ("original Bitlance-named framework", "original {short_name}-named framework")
]

for old, new in replacements:
    content = content.replace(old, new)

with open("app/services/blog_ai_service.py", "w") as f:
    f.write(content)

print("Replacements applied successfully.")
