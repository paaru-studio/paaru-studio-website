#!/usr/bin/env python3
"""
Clean-URL local server for Netlify-style static sites.
- Serves /foo → /foo.html automatically
- Serves / → /index.html
- Handles _redirects file for 301/302 redirect rules
- Port: 3000
"""
import http.server
import socketserver
import os
import re
import urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 3000

# Parse _redirects file once at startup
def load_redirects(root):
    rules = []
    redirects_path = os.path.join(root, "_redirects")
    if not os.path.exists(redirects_path):
        return rules
    with open(redirects_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) < 2:
                continue
            from_path = parts[0]
            to_path   = parts[1]
            code      = 301
            if len(parts) >= 3:
                try:
                    code = int(parts[2].replace("!", "").replace("?", ""))
                except ValueError:
                    pass
            # Only handle simple path-to-path rules (no host-level rules)
            if from_path.startswith("/") and (to_path.startswith("/") or to_path.startswith("http")):
                rules.append((from_path, to_path, code))
    return rules

REDIRECT_RULES = load_redirects(ROOT)

def match_redirect(path, rules):
    """Return (to_path, code) if a redirect rule matches, else None."""
    for from_path, to_path, code in rules:
        # Support :splat wildcard
        if from_path.endswith("/*"):
            prefix = from_path[:-2]
            if path == prefix or path.startswith(prefix + "/"):
                splat = path[len(prefix):].lstrip("/")
                resolved = to_path.replace(":splat", splat)
                return resolved, code
        # Exact match
        elif from_path == path:
            return to_path, code
    return None

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path   = urllib.parse.unquote(parsed.path)

        # 1. Check _redirects
        redir = match_redirect(path, REDIRECT_RULES)
        if redir:
            target, code = redir
            # Skip cross-origin redirects in local preview (e.g. https://www. → /)
            if target.startswith("http"):
                # Just serve the local equivalent instead
                local_path = "/" + urllib.parse.urlparse(target).path.lstrip("/")
                redir2 = match_redirect(local_path, REDIRECT_RULES)
                if not redir2:
                    path = local_path
                    self.path = local_path
            else:
                self.send_response(code)
                self.send_header("Location", target)
                self.end_headers()
                return

        # 2. Try exact file match
        fs_path = os.path.join(ROOT, path.lstrip("/"))
        if os.path.isdir(fs_path):
            index = os.path.join(fs_path, "index.html")
            if os.path.isfile(index):
                self.path = path.rstrip("/") + "/index.html"
                return super().do_GET()

        if os.path.isfile(fs_path):
            return super().do_GET()

        # 3. Try appending .html (clean URL)
        html_path = fs_path.rstrip("/") + ".html"
        if os.path.isfile(html_path):
            self.path = path.rstrip("/") + ".html"
            return super().do_GET()

        # 4. 404
        return super().do_GET()

    def log_message(self, fmt, *args):
        # Cleaner log output
        print(f"  {self.address_string()} {fmt % args}")

with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
    httpd.allow_reuse_address = True
    print(f"\n  🚀  Local server running at  http://localhost:{PORT}")
    print(f"  📁  Serving:  {ROOT}")
    print(f"  ✅  Clean URLs, _redirects & index.html all supported\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
