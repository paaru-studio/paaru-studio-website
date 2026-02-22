import os
import glob
import re

html_files = glob.glob('*.html')

mega_dropdown_template = '''<div class="nav-dropdown">
                        <a href="services.html" class="{cls}">Services <span class="dropdown-arrow">▾</span></a>
                        <div class="nav-dropdown-menu mega-menu">
                            <a href="services.html" class="mega-menu-item">
                                <img src="video_pro.jpg" alt="Video Production">
                                <div class="mega-item-content">
                                    <h4>Video Production</h4>
                                    <p>TVCs, Digital Ads, Corporate films. End-to-end video solutions.</p>
                                </div>
                            </a>
                            <a href="ecommerce.html" class="mega-menu-item">
                                <img src="shopify_img.png" alt="E-commerce Solutions">
                                <div class="mega-item-content">
                                    <h4>E-commerce Solutions</h4>
                                    <p>Boost your online sales with tailored e-commerce strategies.</p>
                                </div>
                            </a>
                            <a href="performance-marketing.html" class="mega-menu-item">
                                <img src="pm_1.jpg" alt="Digital Marketing">
                                <div class="mega-item-content">
                                    <h4>Digital Marketing</h4>
                                    <p>Data-driven performance and social media campaigns.</p>
                                </div>
                            </a>
                            <a href="media-offerings.html" class="mega-menu-item">
                                <img src="OOH_banner.jpg" alt="Offline Marketing (OOH/DOOH)">
                                <div class="mega-item-content">
                                    <h4>Offline Marketing</h4>
                                    <p>High-impact outdoor and digital out-of-home advertising.</p>
                                </div>
                            </a>
                        </div>
                    </div>'''

# We need to replace the exiting <div class="nav-dropdown"> ... Services ... </div> block.
# Since we just added it, it looks like:
# <div class="nav-dropdown">
#                         <a href="services.html" class="nav-dropdown-toggle">Services <span class="dropdown-arrow">▾</span></a>
#                         <div class="nav-dropdown-menu">
#                             <a href="services.html">Video Production</a>
#                             <a href="ecommerce.html">E-commerce Solutions</a>
#                             <a href="performance-marketing.html">Digital Marketing</a>
#                             <a href="media-offerings.html">Offline Marketing (OOH/DOOH)</a>
#                         </div>
#                     </div>

# Wait, let's use a regex that captures the whole thing.
pattern = re.compile(
    r'<div class="nav-dropdown">\s*<a href="services\.html" class="([^"]*)">Services <span class="dropdown-arrow">.*?</div>\s*</div>',
    re.DOTALL
)

def replace_mega(match):
    cls = match.group(1)
    return mega_dropdown_template.format(cls=cls)

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content, count = pattern.subn(replace_mega, content)
        
        if count > 0:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file}")
        else:
            print(f"No match found in {file}")
    except Exception as e:
        print(f"Error processing {file}: {e}")
