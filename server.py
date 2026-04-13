import http.server
import socketserver
import os
import json
import sqlite3
from typing import Any
from urllib.parse import urlparse, parse_qs

print("AviationSort server starting...")

# Configuration
PORT = 5001
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

# Initialize database
print("Initializing database...")
conn = sqlite3.connect('users.db')
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS profiles (
    username TEXT PRIMARY KEY,
    displayName TEXT,
    bio TEXT,
    homeAirport TEXT,
    favoriteAirline TEXT,
    equipment TEXT,
    isPrivate INTEGER
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS favorites (
    username TEXT,
    registration TEXT,
    PRIMARY KEY (username, registration)
)''')

conn.commit()
print("Database ready")

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path.startswith('/api/'):
            self.handle_api(path, query, 'GET')
        elif path.startswith('/socket.io/'):
            self.send_error(404, 'Real-time features not implemented')
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/'):
            self.handle_api(path, {}, 'POST')
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_cors_headers()
        self.end_headers()

    def send_cors_headers(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def handle_api(self, path: str, query: dict, method: str):
        self.send_cors_headers()
        self.end_headers()

        # Mock API responses
        if path == '/api/photos':
            response = [{
                'id': '1',
                'url': '/placeholder.jpg',
                'registration': 'G-EZOA',
                'airline': 'EasyJet',
                'aircraftType': 'A320',
                'date': '2024-01-15',
                'isFavorite': False,
                'hashtags': ['lhr', 'a320']
            }]

        elif path == '/api/news':
            response = {
                'articles': [{
                    'id': '1',
                    'title': 'Aviation News Update',
                    'summary': 'Latest developments in aviation industry.',
                    'date': '2024-01-15',
                    'url': 'https://example.com',
                    'source': 'Aviation News'
                }],
                'sources': ['Aviation News']
            }

        elif path == '/api/stories':
            response = [{
                'id': '1',
                'username': 'pilot123',
                'avatar': 'https://picsum.photos/100',
                'imageUrl': 'https://picsum.photos/300',
                'isUnread': True
            }]

        elif path == '/api/friends':
            response = [{
                'id': '1',
                'username': 'aviator1',
                'avatar': 'https://picsum.photos/100',
                'bio': 'Aviation enthusiast',
                'status': 'online'
            }]

        elif path == '/api/friend-requests':
            response = []

        elif path == '/api/profile':
            username = query.get('username', ['guest'])[0]
            response = {
                'displayName': f'{username} Aviation Enthusiast',
                'bio': f'Passionate about aviation ({username})',
                'homeAirport': 'EGLL / LHR',
                'favoriteAirline': 'Emirates',
                'equipment': 'Sony A7R IV + 200-600mm',
                'isPrivate': False
            }

        elif path == '/api/favorites':
            response = []

        elif path in ['/api/login', '/api/signup', '/api/profile', '/api/favorite', '/api/friends', '/api/friend-requests']:
            response = {'message': 'Success'}

        else:
            response = {'error': 'Unknown endpoint'}

        self.wfile.write(json.dumps(response).encode())

    def log_message(self, format: str, *args: Any) -> None:
        # Suppress log messages
        pass

print(f"Starting server on port {PORT}...")
try:
    with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()
except Exception as e:
    print(f"Server error: {e}")