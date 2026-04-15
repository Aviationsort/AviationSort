# type: ignore
from flask import Flask, send_from_directory, request, jsonify
import os
import sqlite3
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

print("AviationSort server starting...")

# Configuration
PORT = 5001
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

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

conn.commit()

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
    import urllib.request
    import gzip
    
    url = request.args.get('url', '')
    use_cache = request.args.get('cache', 'true').lower() == 'true'
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    # Check cache first
    if use_cache:
        cached = proxy_cache.get(url)
        if cached:
            return cached, 200, {'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'HIT'}
    
    USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': USER_AGENT,
            'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
            'Accept-Encoding': 'gzip, deflate',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
        
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        response = urllib.request.urlopen(req, timeout=15, context=ctx)
        content = response.read()
        
        if response.info().get('Content-Encoding') == 'gzip':
            content = gzip.decompress(content)
        
        try:
            text = content.decode('utf-8')
        except:
            text = content.decode('latin-1', errors='ignore')
        
        # Cache the response
        if use_cache:
            proxy_cache.set(url, text)
        
        return text, 200, {'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'MISS'}
            
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"Proxy error for {url}: {error_msg}")
        
        if 'CERTIFICATE' in error_msg or 'SSL' in error_msg:
            return jsonify({'error': 'SSL certificate error'}), 502
        elif 'timed out' in error_msg.lower():
            return jsonify({'error': 'Request timed out'}), 504
        elif 'name or service not known' in error_msg.lower():
            return jsonify({'error': 'Host not found'}), 502
        elif '403' in error_msg or 'Forbidden' in error_msg:
            return jsonify({'error': 'Access forbidden'}), 403
        elif '404' in error_msg or 'Not Found' in error_msg:
            return jsonify({'error': 'Resource not found'}), 404
        else:
            return jsonify({'error': error_msg}), 500

# Batch proxy for multiple URLs at once
@app.route('/api/proxy/batch', methods=['POST'])
def cors_proxy_batch():
    import urllib.request
    import gzip
    
    data = request.json
    urls = data.get('urls', [])
    
    if not urls:
        return jsonify({'error': 'No URLs provided'}), 400
    
    results = {}
    
    def fetch_url(url):
        USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        
        try:
            # Check cache
            cached = proxy_cache.get(url)
            if cached:
                return url, cached, None
            
            req = urllib.request.Request(url, headers={
                'User-Agent': USER_AGENT,
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Encoding': 'gzip, deflate'
            })
            
            import ssl
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            resp = urllib.request.urlopen(req, timeout=12, context=ctx)
            content = resp.read()
            
            if resp.info().get('Content-Encoding') == 'gzip':
                content = gzip.decompress(content)
            
            try:
                text = content.decode('utf-8')
            except:
                text = content.decode('latin-1', errors='ignore')
            
            proxy_cache.set(url, text)
            return url, text, None
            
        except Exception as e:
            error_msg = str(e)
            print(f"Batch proxy error for {url}: {error_msg}")
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
    return jsonify([])

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

@app.route('/api/favorites')
def get_favorites():
    username = request.args.get('username', '')
    return jsonify([])

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    data = request.json
    return jsonify({'success': True})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '')
    password = data.get('password', '')
    
    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    if cursor.fetchone():
        return jsonify({'success': True, 'username': username})
    
    cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    conn.commit()
    return jsonify({'success': True, 'username': username})

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