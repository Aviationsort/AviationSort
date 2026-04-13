# type: ignore
from flask import Flask, send_from_directory, request, jsonify
import os
import sqlite3
import urllib.request
import xml.etree.ElementTree as ET

print("AviationSort server starting...")

# Configuration
PORT = 5001
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
RSS_URLS = [
    'https://www.aeroroutes.com/?format=rss',
    'https://www.aero-news.net/news/rssCOMANW.xml',
    'https://samchui.com/feed/',
    'https://simpleflying.com/feed/',
    'https://theaviationist.com/feed/',
    'https://www.airlinereporter.com/feed/',
    'https://avgeekery.com/feed/',
    'https://australianaviation.com.au/feed/',
    'https://feeds.feedburner.com/Ex-yuAviationNews',
    'https://www.aviationbusinessnews.com/feed/',
    'https://generalaviationnews.com/feed/',
    'https://www.airbus.com/en/rss-all-feeds/15571?tid=15571&fid=29711'
]

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

# API Routes
@app.route('/api/news')
def get_news():
    news_items = []
    for url in RSS_URLS:
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                tree = ET.parse(response)
                root = tree.getroot()
                
                for item in root.findall('.//item')[:5]:
                    news_item = {
                        'title': item.findtext('title', ''),
                        'link': item.findtext('link', ''),
                        'description': item.findtext('description', ''),
                        'pubDate': item.findtext('pubDate', ''),
                        'source': url
                    }
                    news_items.append(news_item)
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
    
    return jsonify(news_items)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    
    if user:
        return jsonify({'success': True, 'message': 'Login successful'})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    try:
        cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        cursor.execute('INSERT INTO profiles (username, displayName, bio, homeAirport, favoriteAirline, equipment, isPrivate) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      (username, 'Aviation Enthusiast', 'Passionate plane spotter', 'EGLL / LHR', 'Emirates', '', 0))
        conn.commit()
        return jsonify({'success': True, 'message': 'Signup successful'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Username already exists'}), 400

@app.route('/api/profile')
def get_profile():
    username = request.args.get('username', 'guest')
    cursor.execute('SELECT * FROM profiles WHERE username = ?', (username,))
    profile = cursor.fetchone()
    
    if profile:
        return jsonify({
            'displayName': profile[1],
            'bio': profile[2],
            'homeAirport': profile[3],
            'favoriteAirline': profile[4],
            'equipment': profile[5],
            'isPrivate': bool(profile[6])
        })
    return jsonify({
        'displayName': f'{username} Aviation Enthusiast',
        'bio': f'Passionate about aviation ({username})',
        'homeAirport': 'EGLL / LHR',
        'favoriteAirline': 'Emirates',
        'equipment': 'Sony A7R IV + 200-600mm',
        'isPrivate': False
    })

@app.route('/api/profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    username = data.get('username')
    
    cursor.execute('''INSERT OR REPLACE INTO profiles 
                     (username, displayName, bio, homeAirport, favoriteAirline, equipment, isPrivate)
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                  (username, data.get('displayName'), data.get('bio'), 
                   data.get('homeAirport'), data.get('favoriteAirline'),
                   data.get('equipment'), data.get('isPrivate', 0)))
    conn.commit()
    return jsonify({'success': True})

@app.route('/api/friends')
def get_friends():
    return jsonify([{
        'id': '1',
        'username': 'aviator1',
        'avatar': 'https://picsum.photos/100',
        'bio': 'Aviation enthusiast',
        'status': 'online'
    }])

@app.route('/api/friend-requests')
def get_friend_requests():
    return jsonify([])

@app.route('/api/favorites')
def get_favorites():
    return jsonify([])

@app.route('/api/photos')
def get_photos():
    photos = []
    for i in range(12):
        photos.append({
            'id': str(i + 1),
            'url': f'https://picsum.photos/seed/aviation{i}/800/600',
            'likes': 120 + i * 15,
            'comments': 8 + i * 2,
            'aircraft': f'Boeing 787-{i % 9 + 1}00',
            'airline': 'Emirates',
            'location': 'London Heathrow (EGLL)'
        })
    return jsonify(photos)

@app.route('/api/stories')
def get_stories():
    stories = []
    for i in range(6):
        stories.append({
            'id': str(i + 1),
            'username': f'spotter{i + 1}',
            'avatar': f'https://picsum.photos/seed/user{i}/100/100',
            'image': f'https://picsum.photos/seed/story{i}/400/600',
            'viewed': i < 2
        })
    return jsonify(stories)

# Serve static files
@app.route('/vite.svg')
def vite_svg():
    return send_from_directory(DIRECTORY, 'vite.svg')

@app.route('/')
def index():
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
