#!/usr/bin/env python3
from jsmin import jsmin

# Read the original JavaScript file
with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Minify the JavaScript
minified_js = jsmin(js_content)

# Write the minified JavaScript
with open('script.min.js', 'w', encoding='utf-8') as f:
    f.write(minified_js)

print(f"JavaScript minified successfully!")
print(f"Original size: {len(js_content)} bytes")
print(f"Minified size: {len(minified_js)} bytes")
print(f"Reduction: {100 - (len(minified_js) / len(js_content) * 100):.1f}%")
