import sys
import json
import re
import os

def validate_markdown(file_path, template_path):
    if not os.path.exists(file_path):
        return False, f"File not found: {file_path}"
    if not os.path.exists(template_path):
        return False, f"Template not found: {template_path}"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    with open(template_path, 'r', encoding='utf-8') as f:
        template = json.load(f)

    rules = template.get("rules", {})
    errors = []

    # 1. Frontmatter or Properties Validation
    fm_match = re.search(r'^---\s*(.*?)\s*---', content, re.DOTALL)
    props = {}
    if fm_match:
        fm_content = fm_match.group(1)
        for line in fm_content.split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                props[key.strip()] = val.strip()
    else:
        # Check for Logseq-style properties (key:: value)
        prop_matches = re.findall(r'^([\w-]+)::\s*(.*)$', content, re.MULTILINE)
        for key, val in prop_matches:
            props[key.strip()] = val.strip()

    required_props = rules.get("properties", {}).get("required", []) or rules.get("frontmatter", {}).get("required", [])
    for req in required_props:
        if req not in props:
            errors.append(f"Missing required property: {req}")
    
    prop_values = rules.get("properties", {}).get("values", {}) or rules.get("frontmatter", {}).get("values", {})
    for key, expected_val in prop_values.items():
        if key in props and props[key] != expected_val:
            errors.append(f"Invalid value for '{key}'. Expected '{expected_val}', got '{props[key]}'")

    if not props and (rules.get("properties", {}).get("required") or rules.get("frontmatter", {}).get("required")):
        errors.append("Metadata (Frontmatter or Properties) is missing but required.")

    # 2. Section Validation
    required_sections = rules.get("required_sections", [])
    for sec in required_sections:
        title = sec["title"]
        level = sec.get("level", 0)
        prefix = sec.get("prefix", "#" * level)
        
        # Allow optional bullet point prefix before headers
        if sec.get("exact_match"):
            pattern = rf'^(?:\s*-\s+)?{re.escape(prefix)}\s+{re.escape(title)}\s*$'
        else:
            pattern = rf'^(?:\s*-\s+)?{re.escape(prefix)}\s+.*{re.escape(title)}.*$'
        
        if not re.search(pattern, content, re.MULTILINE):
            errors.append(f"Required section '{prefix} {title}' not found.")

    # 3. Structure rules
    if rules.get("structure", {}).get("bullet_points_required_in_details"):
        # Simple check: find '## Details' and check if subsequent lines have bullets
        details_pos = content.find("## Details")
        if details_pos != -1:
            remaining = content[details_pos:]
            if not re.search(r'^\s*-\s+', remaining, re.MULTILINE):
                errors.append("Bullet points are required in the 'Details' section.")

    if not errors:
        return True, f"Success: Content matches '{template['name']}' template."
    else:
        return False, "\n".join(errors)

    # 4. Content replacement 
    

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python validate_md.py <file_path> <template_json_path>")
        sys.exit(1)

    file_to_check = sys.argv[1]
    template_to_use = sys.argv[2]
    
    is_valid, message = validate_markdown(file_to_check, template_to_use)
    
    print(message)
    if is_valid:
        sys.exit(0)
    else:
        sys.exit(1)
