#!/usr/bin/env python3
"""
Script to add Clutch widget to all HTML footers.
- Adds the Clutch widget div inside .footer-bottom, before the copyright line.
- Adds the Clutch JS script tag before </body> (if not already present).
"""

import os
import re
import glob

WORKSPACE = "/Users/paarustudio-recording/Desktop/paaru-studio-website-antigravity/paaru-studio-website-1"

CLUTCH_DIV = '                    <div class="clutch-widget" data-url="https://widget.clutch.co" data-widget-type="1" data-height="40" data-nofollow="true" data-expandifr="true" data-clutchcompany-id="2732402"></div>\n'

CLUTCH_SCRIPT = '    <script type="text/javascript" src="https://widget.clutch.co/static/js/widget.js" defer></script>\n'

SCRIPT_ALREADY_PRESENT = 'widget.clutch.co/static/js/widget.js'

html_files = glob.glob(os.path.join(WORKSPACE, "*.html"))
html_files.sort()

updated = []
skipped = []

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    already_has_script = SCRIPT_ALREADY_PRESENT in content
    already_has_div = 'data-clutchcompany-id="2732402"' in content

    if already_has_script and already_has_div:
        skipped.append(os.path.basename(filepath))
        continue

    modified = False

    # 1. Insert Clutch div inside footer-bottom, before the <p>© line
    if not already_has_div and '<div class="footer-bottom">' in content:
        # Insert the clutch widget div right after the opening footer-bottom div
        content = content.replace(
            '<div class="footer-bottom">',
            '<div class="footer-bottom">\n' + CLUTCH_DIV,
            1  # only first occurrence
        )
        modified = True

    # 2. Insert script tag before </body>
    if not already_has_script and '</body>' in content:
        content = content.replace(
            '</body>',
            CLUTCH_SCRIPT + '</body>',
            1
        )
        modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        updated.append(os.path.basename(filepath))
    else:
        skipped.append(os.path.basename(filepath))

print(f"\n✅ Updated {len(updated)} files:")
for f in updated:
    print(f"   - {f}")

print(f"\n⏭️  Skipped {len(skipped)} files (already had widget or no footer-bottom):")
for f in skipped:
    print(f"   - {f}")
