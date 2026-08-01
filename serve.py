#!/usr/bin/env python3
"""Local dev server with clean URL support (no .html extension needed)."""
import http.server, os, sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Strip query string for path resolution
        path = self.path.split('?')[0].split('#')[0]

        # Try exact file first (handles /index.html, assets, etc.)
        full = os.path.join(DIRECTORY, path.lstrip('/'))
        if os.path.isfile(full):
            return super().do_GET()

        # Try appending .html  (e.g. /video-production → video-production.html)
        html_path = full.rstrip('/') + '.html'
        if os.path.isfile(html_path):
            # Rewrite internal path so SimpleHTTPRequestHandler serves the file
            self.path = '/' + os.path.relpath(html_path, DIRECTORY)
            return super().do_GET()

        # Directory → serve index.html inside it
        if os.path.isdir(full):
            index = os.path.join(full, 'index.html')
            if os.path.isfile(index):
                self.path = '/' + os.path.relpath(index, DIRECTORY)
                return super().do_GET()

        # Root / → index.html
        if path in ('', '/'):
            self.path = '/index.html'
            return super().do_GET()

        return super().do_GET()

    def log_message(self, fmt, *args):
        print(fmt % args)

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    with http.server.ThreadingHTTPServer(('', PORT), CleanURLHandler) as httpd:
        print(f'Serving at http://localhost:{PORT}  (clean URLs enabled)')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nStopped.')
