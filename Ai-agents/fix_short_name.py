import re

with open("app/services/blog_ai_service.py", "r") as f:
    content = f.read()

# Make sure short_name is defined in generate_blog_content
if "short_name = " not in content[:content.find("def openai_generate_blog_content")]:
    content = re.sub(
        r'(def generate_blog_content\(.*?\) -> dict:\n.*?interlinks = interlinks or \[\]\n)',
        r'\1    brand_context = brand_context or {}\n    company_name = brand_context.get("company_name", "Bitlance")\n    short_name = company_name.split(" ")[0] if company_name else "Our Company"\n',
        content,
        flags=re.DOTALL | re.MULTILINE,
        count=1
    )

with open("app/services/blog_ai_service.py", "w") as f:
    f.write(content)

print("Fixed short_name.")
