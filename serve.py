import http.server
import socketserver
import os
import json
import urllib.request
import threading
import subprocess
import sqlite3
from typing import Any
from os import PathLike
from xml.etree import ElementTree

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

FEEDS: list[str] = [
    "https://simpleflying.com/feed/",
    "https://www.aeroroutes.com/?format=rss",
    "https://samchui.com/feed/",
    "https://theaviationist.com/feed/",
    "https://www.airlinereporter.com/feed/",
    "https://avgeekery.com/feed/",
    "https://australianaviation.com.au/feed/",
]

# Database setup
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
    location TEXT,
    isPrivate INTEGER
)''')
cursor.execute('''CREATE TABLE IF NOT EXISTS favorites (
    username TEXT,
    registration TEXT,
    PRIMARY KEY(username, registration)
)''')
conn.commit()
conn.close()


def fetch_rss() -> dict[str, list[dict[str, str]]]:
    results: list[dict[str, str]] = []
    sources: list[dict[str, str]] = []

    for url in FEEDS:
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            with urllib.request.urlopen(req, timeout=10) as response:
                xml_content = response.read().decode('utf-8')
                root = ElementTree.fromstring(xml_content)
                feed_title = url.split('/')[2] if len(url.split('/')) > 2 else url
                sources.append({'name': feed_title, 'status': 'working'})

                for item in root.findall('.//item')[:10]:
                    title = item.findtext('title', '')
                    link = item.findtext('link', '')
                    pub_date = item.findtext('pubDate', '')
                    desc = item.findtext('description', '')
                    results.append({
                        'title': title,
                        'link': link,
                        'pubDate': pub_date,
                        'contentSnippet': desc[:200] if desc else '',
                        'source': feed_title,
                        'isoDate': pub_date
                    })
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            feed_title = url.split('/')[2] if len(url.split('/')) > 2 else url
            sources.append({'name': feed_title, 'status': 'failed'})

    return {'articles': results[:50], 'sources': sources}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self) -> None:
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https:;")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(200)
        self.end_headers()

    def do_GET(self) -> None:
        try:
            if self.path == '/api/news':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                news_data: dict[str, list[dict[str, str]]] = fetch_rss()
                self.wfile.write(json.dumps(news_data).encode())
                return
            elif self.path in ['/api/photos', '/api/stories', '/api/friends', '/api/friend-requests']:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps([]).encode())
                return
            elif self.path in ['/favicon.svg', '/favicon.ico']:
                self.send_response(200)
                self.send_header('Content-Type', 'image/svg+xml')
                self.end_headers()
                self.wfile.write(b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#dc2626"/><path d="M50 20 L70 60 L30 60 Z" fill="white"/></svg>')
                return
            elif self.path.startswith('/api/profile'):
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                from urllib.parse import urlparse, parse_qs
                query = parse_qs(urlparse(self.path).query)
                username = query.get('username', [None])[0]
                if username:
                    cursor.execute('SELECT displayName, bio, homeAirport, favoriteAirline, equipment, location, isPrivate FROM profiles WHERE username = ?', (username,))
                    profile = cursor.fetchone()
                    if profile:
                        profile_data: dict[str, Any] = {
                            'displayName': profile[0],
                            'bio': profile[1],
                            'homeAirport': profile[2],
                            'favoriteAirline': profile[3],
                            'equipment': profile[4],
                            'location': profile[5],
                            'isPrivate': bool(profile[6])
                        }
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps(profile_data).encode())
                    else:
                        self.send_response(404)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({'error': 'Profile not found'}).encode())
                else:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Username required'}).encode())
                conn.close()
                return
            elif self.path.startswith('/api/favorites'):
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                from urllib.parse import urlparse, parse_qs
                query = parse_qs(urlparse(self.path).query)
                username = query.get('username', [None])[0]
                if username:
                    cursor.execute('SELECT registration FROM favorites WHERE username = ?', (username,))
                    favorites = [row[0] for row in cursor.fetchall()]
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(favorites).encode())
                else:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Username required'}).encode())
                conn.close()
                return
            super().do_GET()
        except ConnectionAbortedError:
            # Client disconnected, ignore silently
            return

    def do_POST(self) -> None:
        try:
            # Per-request database connection (fixes thread safety issue)
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()

            if self.path == '/api/signup':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode())
                username = data.get('username')
                password = data.get('password')
                cursor.execute('SELECT username FROM users WHERE username = ?', (username,))
                if cursor.fetchone():
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'User already exists'}).encode())
                else:
                    cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
                    cursor.execute('INSERT INTO profiles (username, displayName, bio, homeAirport, favoriteAirline, equipment, location, isPrivate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', (username, 'Aviation Enthusiast', 'Passionate plane spotter based in London. Love wide-body aircraft and special liveries.', 'EGLL / LHR', 'Emirates', 'Sony A7R IV + 200-600mm', 'London, UK', 0))
                    conn.commit()
                    self.send_response(201)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'message': 'User created', 'username': username}).encode())
                conn.close()
                return
            elif self.path == '/api/login':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode())
                username = data.get('username')
                password = data.get('password')
                cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
                user = cursor.fetchone()
                if user and user[0] == password:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'message': 'Login successful', 'username': username}).encode())
                else:
                    self.send_response(401)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Invalid credentials'}).encode())
                conn.close()
                return
            elif self.path == '/api/profile':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode())
                username = data.get('username')
                profile = data.get('profile')
                if username and profile:
                    cursor.execute('''INSERT OR REPLACE INTO profiles
                        (username, displayName, bio, homeAirport, favoriteAirline, equipment, location, isPrivate)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                        (username, profile.get('displayName'), profile.get('bio'), profile.get('homeAirport'),
                         profile.get('favoriteAirline'), profile.get('equipment'), profile.get('location'),
                         1 if profile.get('isPrivate') else 0))
                    conn.commit()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'message': 'Profile updated'}).encode())
                else:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Invalid data'}).encode())
                conn.close()
                return
            elif self.path == '/api/favorite':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode())
                username = data.get('username')
                registration = data.get('registration')
                isFavorite = data.get('isFavorite')
                if username and registration is not None:
                    if isFavorite:
                        cursor.execute('INSERT OR IGNORE INTO favorites (username, registration) VALUES (?, ?)', (username, registration))
                    else:
                        cursor.execute('DELETE FROM favorites WHERE username = ? AND registration = ?', (username, registration))
                    conn.commit()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'message': 'Favorite updated'}).encode())
                else:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Invalid data'}).encode())
                conn.close()
                return
            else:
                conn.close()
                self.send_response(404)
                self.end_headers()
        except Exception as e:
            print(f"Error in do_POST: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Internal server error'}).encode())

    def guess_type(self, path: str | PathLike[str]) -> str:
        ext = os.path.splitext(str(path))[1].lower()
        return MIME_TYPES.get(ext, 'application/octet-stream')


def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()


# Start server in background
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

if not os.path.exists(DIRECTORY) or len(os.listdir(DIRECTORY)) == 0:
    print("Building frontend...")
    result = subprocess.run(['cmd', '/c', 'npx vite build'], shell=True, cwd=os.path.dirname(os.path.abspath(__file__)))
    if result.returncode == 0:
        print("Frontend built successfully")
    else:
        print(f"Build failed with return code {result.returncode}, but continuing...")
else:
    print("Using existing build")

print("Fetching RSS feeds...")
fetch_rss()
print("RSS feeds ready")

# Keep main thread alive
server_thread.join()
