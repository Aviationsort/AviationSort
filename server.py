# type: ignore
from flask import Flask, send_from_directory, request, jsonify
import os
import sqlite3
import time
import secrets
import hashlib
import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import secrets as sec

print("AviationSort server starting...")

# Configuration
PORT = 5001
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

# ============== SIMPLE CRYPTO (No secrets - just basic operations) ==============
PEPPER = b'aviation_sort_pepper_2024'

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(32)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt + PEPPER, 100000)
    return base64.b64encode(salt + pwd_hash).decode('utf-8')

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        data = base64.b64decode(stored_hash.encode('utf-8'))
        salt = data[:32]
        stored_pwd_hash = data[32:]
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt + PEPPER, 100000)
        return sec.compare_digest(pwd_hash, stored_pwd_hash)
    except:
        return False

def generate_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)

def hash_data(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8') + PEPPER).hexdigest()

# ============== SESSION MANAGEMENT ==============
class SessionManager:
    def __init__(self):
        self._sessions = {}
        self._lock = threading.Lock()
        self._session_timeout = 3600
    
    def create_session(self, username: str) -> str:
        token = generate_token()
        with self._lock:
            self._sessions[token] = {
                'username': username,
                'created': time.time(),
                'last_activity': time.time()
            }
        return token
    
    def validate_session(self, token: str) -> str | None:
        with self._lock:
            if token in self._sessions:
                session = self._sessions[token]
                if time.time() - session['last_activity'] < self._session_timeout:
                    session['last_activity'] = time.time()
                    return session['username']
                else:
                    del self._sessions[token]
        return None
    
    def destroy_session(self, token: str) -> bool:
        with self._lock:
            if token in self._sessions:
                del self._sessions[token]
                return True
        return False
    
    def cleanup_sessions(self):
        with self._lock:
            now = time.time()
            expired = [t for t, s in self._sessions.items() if now - s['last_activity'] > self._session_timeout]
            for t in expired:
                del self._sessions[t]

sessions = SessionManager()

# ============== RATE LIMITING ==============
class RateLimiter:
    def __init__(self):
        self._requests = {}
        self._lock = threading.Lock()
        self._max_requests = 100
        self._window = 60
    
    def is_allowed(self, identifier: str) -> bool:
        with self._lock:
            now = time.time()
            if identifier not in self._requests:
                self._requests[identifier] = []
            self._requests[identifier] = [t for t in self._requests[identifier] if now - t < self._window]
            if len(self._requests[identifier]) >= self._max_requests:
                return False
            self._requests[identifier].append(now)
            return True

rate_limiter = RateLimiter()

# Simple in-memory cache with thread safety
class ProxyCache:
    def __init__(self, max_size=100, ttl=300):
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl
        self.lock = threading.Lock()
    
    def get(self, key):
        with self.lock:
            if key in self.cache:
                value, timestamp = self.cache[key]
                if time.time() - timestamp < self.ttl:
                    return value
                else:
                    del self.cache[key]
        return None
    
    def set(self, key, value):
        with self.lock:
            if len(self.cache) >= self.max_size:
                oldest = min(self.cache.items(), key=lambda x: x[1][1])
                del self.cache[oldest[0]]
            self.cache[key] = (value, time.time())

proxy_cache = ProxyCache(max_size=200, ttl=300)

# Initialize database
print("Initializing database...")
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    created_at TEXT,
    last_login TEXT,
    failed_attempts INTEGER DEFAULT 0,
    locked_until INTEGER DEFAULT 0
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT,
    created_at TEXT,
    expires_at INTEGER,
    FOREIGN KEY (username) REFERENCES users(username)
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

conn.commit()

# Connect to flexpics.db
flexpics_conn = sqlite3.connect('flexpics.db', check_same_thread=False)

# Connect to playlists.db
playlists_conn = sqlite3.connect('playlists.db', check_same_thread=False)
playlists_cursor = playlists_conn.cursor()

playlists_cursor.execute('''CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT,
    created_at TEXT
)''')

playlists_cursor.execute('''CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    thumbnail TEXT,
    added_at TEXT,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
)''')

playlists_conn.commit()
flexpics_cursor = flexpics_conn.cursor()

flexpics_cursor.execute('''CREATE TABLE IF NOT EXISTS flexpics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    photo_url TEXT,
    photo_thumbnail_url TEXT,
    photo_registration TEXT,
    photo_airline TEXT,
    photo_aircraft_type TEXT,
    photo_date TEXT,
    file_directory TEXT,
    date_added TEXT,
    hashtags TEXT,
    is_video INTEGER DEFAULT 0,
    width INTEGER,
    height INTEGER,
    file_size INTEGER
)''')

flexpics_conn.commit()

def find_similar_flexpics(registration=None, airline=None, aircraft_type=None):
    """Find similar flexpics in flexpics.db based on content similarity"""
    similar = []
    
    if registration:
        flexpics_cursor.execute(
            'SELECT * FROM flexpics WHERE photo_registration LIKE ? OR photo_registration LIKE ?',
            (f'%{registration}%', f'%{registration[-3:]}%')
        )
        similar.extend(flexpics_cursor.fetchall())
    
    if airline and not similar:
        flexpics_cursor.execute(
            'SELECT * FROM flexpics WHERE photo_airline LIKE ?',
            (f'%{airline}%',)
        )
        similar.extend(flexpics_cursor.fetchall())
    
    if aircraft_type and not similar:
        flexpics_cursor.execute(
            'SELECT * FROM flexpics WHERE photo_aircraft_type LIKE ?',
            (f'%{aircraft_type}%',)
        )
        similar.extend(flexpics_cursor.fetchall())
    
    return similar

def get_user_flexpics_from_db(username):
    """Get all flexpics for a user from flexpics.db"""
    flexpics_cursor.execute('SELECT * FROM flexpics WHERE username = ?', (username,))
    return flexpics_cursor.fetchall()

# Initialize Flask app
app = Flask(__name__, static_folder=DIRECTORY)

# CORS headers for all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Optimized proxy with caching
@app.route('/api/proxy')
def cors_proxy():
    import cloudscraper
    import gzip
    import requests
    
    url = request.args.get('url', '')
    use_cache = request.args.get('cache', 'true').lower() == 'true'
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    # Check cache first
    if use_cache:
        cached = proxy_cache.get(url)
        if cached:
            return cached, 200, {'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'HIT'}
    
    try:
        scraper = cloudscraper.create_scraper()
        
        if 'lbcgroup.tv' in url:
            referer = 'https://www.lbcgroup.tv/'
        elif 'runwaygirlnetwork' in url:
            referer = 'https://runwaygirlnetwork.com/'
        else:
            referer = 'https://www.google.com/'
        
        scraper.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Referer': referer
        })
        
        response = scraper.get(url, timeout=15)
        content = response.content
        
        if response.headers.get('Content-Encoding') == 'gzip':
            try:
                content = gzip.decompress(content)
            except:
                pass
        
        try:
            text = content.decode('utf-8')
        except:
            text = content.decode('latin-1', errors='ignore')
        
        # Cache the response
        if use_cache:
            proxy_cache.set(url, text)
        
        return text, 200, {'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'MISS'}
            
    except Exception as e:
        # Try fallback with requests
        try:
            fallback_headers = {
                'User-Agent': USER_AGENT,
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
            fallback_response = requests.get(url, headers=fallback_headers, timeout=10)
            fallback_response.raise_for_status()
            text = fallback_response.text
            
            if use_cache:
                proxy_cache.set(url, text)
            
            return text, 200, {'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'MISS-FALLBACK'}
        except Exception as fallback_error:
            import traceback
            error_msg = str(e)
            fallback_msg = str(fallback_error)
            print(f"Proxy error for {url}: {error_msg}")
            print(f"Fallback also failed: {fallback_msg}")
            
            if 'CERTIFICATE' in error_msg or 'SSL' in error_msg or 'CERTIFICATE' in fallback_msg:
                return jsonify({'error': 'SSL certificate error'}), 502
            elif 'timed out' in error_msg.lower() or 'timed out' in fallback_msg.lower():
                return jsonify({'error': 'Request timed out'}), 504
            elif 'name or service not known' in error_msg.lower() or 'name or service not known' in fallback_msg.lower():
                return jsonify({'error': 'Host not found'}), 502
            elif '403' in error_msg or 'Forbidden' in error_msg:
                return jsonify({'error': 'Access forbidden'}), 403
            elif '404' in error_msg or 'Not Found' in error_msg:
                return jsonify({'error': 'Resource not found'}), 404
            else:
                return jsonify({'error': f'Proxy error: {error_msg[:100]}'}), 500

# Batch proxy for multiple URLs at once
@app.route('/api/proxy/batch', methods=['POST'])
def cors_proxy_batch():
    import cloudscraper
    import gzip
    
    data = request.json
    urls = data.get('urls', [])
    
    if not urls:
        return jsonify({'error': 'No URLs provided'}), 400
    
    results = {}
    
    def fetch_url(url):
        try:
            import requests
            scraper = cloudscraper.create_scraper()
            
            if 'lbcgroup.tv' in url:
                referer = 'https://www.lbcgroup.tv/'
            elif 'runwaygirlnetwork' in url:
                referer = 'https://runwaygirlnetwork.com/'
            else:
                referer = 'https://www.google.com/'
            
            scraper.headers.update({
                'User-Agent': USER_AGENT,
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Referer': referer
            })
            
            resp = scraper.get(url, timeout=12)
            content = resp.content
            
            if resp.headers.get('Content-Encoding') == 'gzip':
                try:
                    content = gzip.decompress(content)
                except:
                    pass
            
            try:
                text = content.decode('utf-8')
            except:
                text = content.decode('latin-1', errors='ignore')
            
            proxy_cache.set(url, text)
            return url, text, None
            
        except Exception as e:
            # Try fallback with requests
            try:
                import requests
                fallback_resp = requests.get(url, headers={'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/xml, text/xml, */*'}, timeout=8)
                fallback_resp.raise_for_status()
                text = fallback_resp.text
                proxy_cache.set(url, text)
                return url, text, None
            except Exception as fallback_error:
                error_msg = str(e)
                fallback_msg = str(fallback_error)
                print(f"Batch proxy error for {url}: {error_msg}")
                print(f"Batch fallback also failed: {fallback_msg}")
                return url, None, error_msg
    
    # Fetch all URLs in parallel
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(fetch_url, url): url for url in urls}
        for future in as_completed(futures):
            url, content, error = future.result()
            results[url] = {'content': content, 'error': error}
    
    status = 200
    if any(r.get('error') for r in results.values()):
        status = 207
    
    return jsonify(results), status

# API Routes

@app.route('/api/photos')
def get_photos():
    try:
        return jsonify([])
    except Exception as e:
        print(f"Error in /api/photos: {e}")
        return jsonify([]), 200

@app.route('/api/profile')
def get_profile():
    username = request.args.get('username', '')
    cursor.execute('SELECT * FROM profiles WHERE username = ?', (username,))
    row = cursor.fetchone()
    if row:
        return jsonify({
            'username': row[0],
            'displayName': row[1],
            'bio': row[2],
            'homeAirport': row[3],
            'favoriteAirline': row[4],
            'equipment': row[5],
            'isPrivate': bool(row[6])
        })
    return jsonify({})

@app.route('/api/profile', methods=['POST'])
def save_profile():
    data = request.json
    cursor.execute('''INSERT OR REPLACE INTO profiles (username, displayName, bio, homeAirport, favoriteAirline, equipment, isPrivate)
        VALUES (?, ?, ?, ?, ?, ?, ?)''', (
        data.get('username', ''),
        data.get('displayName', ''),
        data.get('bio', ''),
        data.get('homeAirport', ''),
        data.get('favoriteAirline', ''),
        data.get('equipment', ''),
        1 if data.get('isPrivate') else 0
    ))
    conn.commit()
    return jsonify({'success': True})

@app.route('/api/flexpics')
def get_flexpics():
    username = request.args.get('username', '').lower()
    print(f"Fetching flexpics for username: '{username}'")
    if username:
        flexpics_cursor.execute('SELECT * FROM flexpics WHERE LOWER(username) = ?', (username,))
    else:
        flexpics_cursor.execute('SELECT * FROM flexpics')
    rows = flexpics_cursor.fetchall()
    print(f"Found {len(rows)} flexpics")
    flexpics = []
    for row in rows:
        flexpics.append({
            'id': row[0],
            'username': row[1],
            'photo_url': row[2],
            'photo_thumbnail_url': row[3] if len(row) > 3 else '',
            'photo_registration': row[4] if len(row) > 4 else '',
            'photo_airline': row[5] if len(row) > 5 else '',
            'photo_aircraft_type': row[6] if len(row) > 6 else '',
            'photo_date': row[7] if len(row) > 7 else '',
            'file_directory': row[8] if len(row) > 8 else '',
            'date_added': row[9] if len(row) > 9 else '',
            'hashtags': row[10] if len(row) > 10 else '',
            'is_video': bool(row[11]) if len(row) > 11 else False,
            'width': row[12] if len(row) > 12 else 0,
            'height': row[13] if len(row) > 13 else 0,
            'file_size': row[14] if len(row) > 14 else 0
        })
    return jsonify(flexpics)

@app.route('/api/flexpics/similar')
def get_similar_flexpics():
    registration = request.args.get('registration', '')
    airline = request.args.get('airline', '')
    aircraft_type = request.args.get('aircraft_type', '')
    
    similar = find_similar_flexpics(registration, airline, aircraft_type)
    
    flexpics = []
    for row in similar:
        flexpics.append({
            'id': row[0],
            'username': row[1],
            'photo_url': row[2],
            'photo_registration': row[3],
            'photo_airline': row[4],
            'photo_aircraft_type': row[5],
            'photo_date': row[6],
            'file_directory': row[7],
            'date_added': row[8]
        })
    return jsonify(flexpics)

@app.route('/api/flexpics', methods=['POST'])
def add_flexpic():
    data = request.json
    flexpics_cursor.execute('''INSERT INTO flexpics (username, photo_url, photo_thumbnail_url, photo_registration, photo_airline, photo_aircraft_type, photo_date, file_directory, date_added, hashtags, is_video, width, height, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
        data.get('username', ''),
        data.get('photo_url', ''),
        data.get('photo_thumbnail_url', ''),
        data.get('photo_registration', ''),
        data.get('photo_airline', ''),
        data.get('photo_aircraft_type', ''),
        data.get('photo_date', ''),
        data.get('file_directory', ''),
        data.get('date_added', ''),
        data.get('hashtags', ''),
        1 if data.get('is_video') else 0,
        data.get('width', 0),
        data.get('height', 0),
        data.get('file_size', 0)
    ))
    flexpics_conn.commit()
    return jsonify({'success': True})

@app.route('/api/flexpics', methods=['DELETE'])
def delete_flexpic():
    data = request.json
    photo_id = data.get('id', 0)
    flexpics_cursor.execute('DELETE FROM flexpics WHERE id = ?', (photo_id,))
    flexpics_conn.commit()
    return jsonify({'success': True})

@app.route('/api/login', methods=['POST'])
def login():
    try:
        if not rate_limiter.is_allowed(request.remote_addr):
            return jsonify({'error': 'Too many requests'}), 429
        
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Invalid credentials'}), 400
        
        cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
        row = cursor.fetchone()
        
        # Check if user exists and verify password
        if row:
            stored_hash = row[0]
            # Try hashed password verification first
            if verify_password(password, stored_hash):
                token = sessions.create_session(username)
                return jsonify({'success': True, 'username': username, 'token': token})
            # Fallback: plain text password (legacy support)
            if stored_hash == password:
                # Migrate to hashed password
                new_hash = hash_password(password)
                cursor.execute('UPDATE users SET password = ? WHERE username = ?', (new_hash, username))
                conn.commit()
                token = sessions.create_session(username)
                return jsonify({'success': True, 'username': username, 'token': token})
            # Wrong password
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # New user - create account
        password_hash = hash_password(password)
        cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password_hash))
        conn.commit()
        token = sessions.create_session(username)
        return jsonify({'success': True, 'username': username, 'token': token})
    except Exception as e:
        print(f"Error in /api/login: {e}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    sessions.destroy_session(token)
    return jsonify({'success': True})

@app.route('/api/session', methods=['GET'])
def check_session():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    username = sessions.validate_session(token)
    if username:
        return jsonify({'valid': True, 'username': username})
    return jsonify({'valid': False}), 401

# Playlist API Routes
@app.route('/api/playlists')
def get_playlists():
    username = request.args.get('username', '')
    if username:
        playlists_cursor.execute('SELECT * FROM playlists WHERE username = ? ORDER BY created_at DESC', (username,))
    else:
        playlists_cursor.execute('SELECT * FROM playlists ORDER BY created_at DESC')
    rows = playlists_cursor.fetchall()
    playlists = []
    for row in rows:
        playlists.append({
            'id': row[0],
            'name': row[1],
            'username': row[2],
            'created_at': row[3]
        })
    return jsonify(playlists)

@app.route('/api/playlists', methods=['POST'])
def create_playlist():
    data = request.json
    name = data.get('name', 'Untitled Playlist')
    username = data.get('username', 'anonymous')
    import datetime
    created_at = datetime.datetime.now().isoformat()
    playlists_cursor.execute('INSERT INTO playlists (name, username, created_at) VALUES (?, ?, ?)', (name, username, created_at))
    playlists_conn.commit()
    return jsonify({'success': True, 'id': playlists_cursor.lastrowid})

@app.route('/api/playlists/<int:playlist_id>', methods=['DELETE'])
def delete_playlist(playlist_id):
    playlists_cursor.execute('DELETE FROM playlists WHERE id = ?', (playlist_id,))
    playlists_conn.commit()
    return jsonify({'success': True})

@app.route('/api/playlists/<int:playlist_id>/tracks')
def get_playlist_tracks(playlist_id):
    playlists_cursor.execute('SELECT * FROM tracks WHERE playlist_id = ? ORDER BY added_at DESC', (playlist_id,))
    rows = playlists_cursor.fetchall()
    tracks = []
    for row in rows:
        tracks.append({
            'id': row[0],
            'playlist_id': row[1],
            'title': row[2],
            'url': row[3],
            'source': row[4],
            'duration': row[5],
            'thumbnail': row[6],
            'added_at': row[7]
        })
    return jsonify(tracks)

@app.route('/api/playlists/<int:playlist_id>/tracks', methods=['POST'])
def add_track_to_playlist(playlist_id):
    data = request.json
    import datetime
    playlists_cursor.execute('INSERT INTO tracks (playlist_id, title, url, source, duration, thumbnail, added_at) VALUES (?, ?, ?, ?, ?, ?, ?)', (
        playlist_id,
        data.get('title', 'Unknown'),
        data.get('url', ''),
        data.get('source', 'local'),
        data.get('duration', 0),
        data.get('thumbnail', ''),
        datetime.datetime.now().isoformat()
    ))
    playlists_conn.commit()
    return jsonify({'success': True, 'id': playlists_cursor.lastrowid})

@app.route('/api/playlists/<int:playlist_id>/tracks/<int:track_id>', methods=['DELETE'])
def remove_track_from_playlist(playlist_id, track_id):
    playlists_cursor.execute('DELETE FROM tracks WHERE id = ?', (track_id,))
    playlists_conn.commit()
    return jsonify({'success': True})

@app.route('/api/flexpics/export')
def export_flexpics():
    username = request.args.get('username', '').lower()
    format = request.args.get('format', 'json')
    
    if username:
        flexpics_cursor.execute('SELECT * FROM flexpics WHERE LOWER(username) = ?', (username,))
    else:
        flexpics_cursor.execute('SELECT * FROM flexpics')
    
    rows = flexpics_cursor.fetchall()
    
    if format == 'csv':
        import csv
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['id', 'username', 'photo_url', 'registration', 'airline', 'aircraft_type', 'date', 'hashtags'])
        for row in rows:
            writer.writerow([
                row[0], row[1], row[2], row[4], row[5], row[6], row[7], row[10]
            ])
        return output.getvalue(), 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=flexpics.csv'}
    
    flexpics = []
    for row in rows:
        flexpics.append({
            'id': row[0],
            'username': row[1],
            'photo_url': row[2],
            'photo_registration': row[4],
            'photo_airline': row[5],
            'photo_aircraft_type': row[6],
            'photo_date': row[7],
            'hashtags': row[10]
        })
    return jsonify(flexpics)

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory(DIRECTORY, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory(DIRECTORY, path)
    except:
        return send_from_directory(DIRECTORY, 'index.html')

if __name__ == '__main__':
    print(f"Starting server on port {PORT}...")
    print(f"Server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    
    app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)