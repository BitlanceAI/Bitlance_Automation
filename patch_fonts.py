import sys

with open("Ai-agents/app/flyer_generator.py", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Check if the line has `_font("` and assigns to a variable
    if '_font("' in line and '=' in line and not line.strip().startswith('#'):
        parts = line.split('_font("')
        if len(parts) == 2:
            prefix = parts[0]
            rest = parts[1]
            quote_idx = rest.find('"')
            if quote_idx != -1:
                font_name = rest[:quote_idx]
                after_quote = rest[quote_idx+1:]
                comma_idx = after_quote.find(',')
                if comma_idx != -1:
                    size_and_paren = after_quote[comma_idx+1:].strip()
                    if size_and_paren.endswith(')'):
                        size_expr = size_and_paren[:-1].strip()
                        new_line = f'{prefix}(_devanagari_font({size_expr}) if layout.get("_use_devanagari_font", False) else _font("{font_name}", {size_expr}))\n'
                        new_lines.append(new_line)
                        continue
    new_lines.append(line)

with open("Ai-agents/app/flyer_generator.py", "w") as f:
    f.writelines(new_lines)
