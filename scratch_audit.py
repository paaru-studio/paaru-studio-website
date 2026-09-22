import glob
import json
import re

html_files = sorted(glob.glob("*.html"))

print(f"=== FULL AUDIT OF {len(html_files)} PAGES ===")

for f in html_files:
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        c = fp.read()
    
    desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', c, re.I | re.S)
    desc_val = desc.group(1).strip().replace('\n', ' ') if desc else ''
    
    ld = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', c, re.I | re.S)
    
    types = []
    for b in ld:
        try:
            d = json.loads(b.strip())
            def collect(item):
                if isinstance(item, dict):
                    if "@type" in item: types.append(item["@type"])
                    for v in item.values(): collect(v)
                elif isinstance(item, list):
                    for v in item: collect(v)
            collect(d)
        except Exception as e:
            types.append("JSON_ERROR")
    
    unique_types = list(dict.fromkeys(types))
    
    # Check if page is major
    print(f"File: {f}")
    print(f"  Desc ({len(desc_val)}): {desc_val}")
    print(f"  Schemas: {unique_types}")
    print()
