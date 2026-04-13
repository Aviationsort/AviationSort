import http.server
import socketserver
import os
from typing import Any
from os import PathLike

PORT = 3000
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

MIME_TYPES: dict[str, str] = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self) -> None:
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(200)
        self.end_headers()

    def guess_type(self, path: str | PathLike[str]) -> str:
        ext = os.path.splitext(str(path))[1].lower()
        return MIME_TYPES.get(ext, 'application/octet-stream')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()