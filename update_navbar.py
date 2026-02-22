import os
import glob
import re

html_files = glob.glob('*.html')

dropdown_template = '''<div class="nav-dropdown">
                        <a href="services.html" class="{cls}">Services <span class="dropdown-arrow">▾</span></a>
                        <div class="nav-dropdown-menu">
                            <a href="services.html">Video Production</a>
                            <a href="ecommerce.html">E-commerce Solutions</a>
                            <a href="performance-marketing.html">Digital Marketing</a>
                            <a href="media-offerings.html">Offline Marketing (OOH/DOOH)</a>
                        </div>
                    </div>'''

# Regex to match the Services link, handling optional class attributes
pattern = re.compile(r'<a\s+href="services\.html"(?:\s+class="([^"]*)")?\s*>Services</a>')

def replace_services(match):
    # Extract existing classes (like "active")
    existing_classes = match.group(1)
    
    # Combine existing classes with nav-dropdown-toggle
    if existing_classes:
        new_classes = f"nav-dropdown-toggle {existing_classes}".strip()
    else:
        new_classes = "nav-dropdown-toggle"
        
    return dropdown_template.format(cls=new_classes)

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace only the exact services link avoiding accidental replaces elsewhere
        # To be safe, look for it inside the <div class="nav-links"> context
        # A simpler approach: just replace the exact A tag, since a "Services" link to "services.html" is likely only the nav.
        
        new_content, count = pattern.subn(replace_services, content)
        
        if count > 0:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file}")
    except Exception as e:
        print(f"Error processing {file}: {e}")
