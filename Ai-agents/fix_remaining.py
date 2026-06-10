with open("app/services/blog_ai_service.py", "r") as f:
    content = f.read()

content = content.replace("The Bitlance [Topic] Maturity Model", "The {short_name} [Topic] Maturity Model")
content = content.replace("[Bitlance workflow]", "[{short_name} workflow]")
content = content.replace("[Bitlance tool/workflow]", "[{short_name} tool/workflow]")
content = content.replace("Min 3 Bitlance benchmarks", "Min 3 {short_name} benchmarks")

with open("app/services/blog_ai_service.py", "w") as f:
    f.write(content)
