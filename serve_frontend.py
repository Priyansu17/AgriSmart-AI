"""
High-performance development/production server for AgriSmart AI Frontend.
Serves frontend/dist on port 5173 and proxies /api/* and /predict requests
to the Flask backend on http://127.0.0.1:5000.
"""

import os
import sys
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'dist')
BACKEND_URL = 'http://127.0.0.1:5000'
PORT = 5173

class AgriSmartHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIST, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/') or self.path == '/predict':
            self.proxy_request('GET')
        else:
            clean_path = self.path.split('?')[0].lstrip('/')
            full_path = os.path.join(FRONTEND_DIST, clean_path)
            if not os.path.exists(full_path) or os.path.isdir(full_path):
                self.path = '/index.html'
            try:
                super().do_GET()
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
                pass

    def do_HEAD(self):
        if self.path.startswith('/api/') or self.path == '/predict':
            self.proxy_request('HEAD')
        else:
            clean_path = self.path.split('?')[0].lstrip('/')
            full_path = os.path.join(FRONTEND_DIST, clean_path)
            if not os.path.exists(full_path) or os.path.isdir(full_path):
                self.path = '/index.html'
            try:
                super().do_HEAD()
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
                pass

    def do_POST(self):
        if self.path.startswith('/api/') or self.path == '/predict':
            self.proxy_request('POST')
        else:
            self.send_error(405, 'Method Not Allowed')

    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.proxy_request('DELETE')
        else:
            self.send_error(405, 'Method Not Allowed')

    def proxy_request(self, method):
        target_url = f"{BACKEND_URL}{self.path}"
        headers = {k: v for k, v in self.headers.items() if k.lower() != 'host'}

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        req = urllib.request.Request(target_url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                self.send_response(resp.status)
                for k, v in resp.getheaders():
                    if k.lower() not in ('transfer-encoding', 'connection'):
                        self.send_header(k, v)
                self.end_headers()
                if method != 'HEAD':
                    self.wfile.write(resp.read())
        except urllib.error.HTTPError as e:
            try:
                self.send_response(e.code)
                for k, v in e.headers.items():
                    if k.lower() not in ('transfer-encoding', 'connection'):
                        self.send_header(k, v)
                self.end_headers()
                if method != 'HEAD':
                    self.wfile.write(e.read())
            except Exception:
                pass
        except Exception as e:
            try:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                if method != 'HEAD':
                    self.wfile.write(f'{{"error": "Backend communication failed: {str(e)}"}}'.encode('utf-8'))
            except Exception:
                pass

    def log_message(self, format, *args):
        # Suppress noisy logs
        pass

def run():
    print(f"Starting AgriSmart AI Server on http://localhost:{PORT}")
    print(f"Serving UI from: {FRONTEND_DIST}")
    print(f"Proxying API to: {BACKEND_URL}")
    server = ThreadingHTTPServer(('0.0.0.0', PORT), AgriSmartHandler)
    server.serve_forever()

if __name__ == '__main__':
    run()
