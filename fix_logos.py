import os
import re

directory = "/Users/paarustudio-recording/Desktop/paaru-studio-website/D2D UPDATES/paaru-studio-website"

# Regex to find the logo anchor and its content
# We want to replace the content of <a ... class="logo">...</a>
# specifically focusing on the image part.

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace <picture>...<img ... class="logo-image" ...>...</picture> 
        # with <img loading="lazy" decoding="async" src="logo.webp" alt="Paaru Studio Logo" class="logo-image">
        
        # Pattern to match the logo image part inside the anchor
        pattern = r'(<a\s+[^>]*class="logo"[^>]*>)\s*(?:<picture>.*?</picture>|<img[^>]*class="logo-image"[^>]*>)\s*(<span class="logo-text">)'
        
        replacement = r'\1\n                    <img loading="lazy" decoding="async" src="logo.webp" alt="Paaru Studio Logo" class="logo-image">\n                    \2'
        
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
