#!/usr/bin/env python3
import csscompressor

# Read the original CSS file
with open('styles.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Minify the CSS
minified_css = csscompressor.compress(css_content)

# Write the minified CSS
with open('styles.min.css', 'w', encoding='utf-8') as f:
    f.write(minified_css)

print(f"CSS minified successfully!")
print(f"Original size: {len(css_content)} bytes")
print(f"Minified size: {len(minified_css)} bytes")
print(f"Reduction: {100 - (len(minified_css) / len(css_content) * 100):.1f}%")
