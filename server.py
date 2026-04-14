# type: ignore
from flask import Flask, send_from_directory, request, jsonify
import json
import os
import sqlite3
import urllib.request
import xml.etree.ElementTree as ET
import re
from io import StringIO
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta

# User-Agent to bypass 403 blocks
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

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
WORLD_NEWS_URLS = list(dict.fromkeys([
    'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    'https://www.cbc.ca/news/rss/rss.xml',
    'https://www.cbc.ca/news/world/rss.xml',
    'https://www.the961.com/feed/',
    'https://www.politico.com/rssPolitics',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.nbcnews.com/rss',
    'https://www.theatlantic.com/feed/rss/index.xml',
    'https://www.politicshome.com/feed/rss',
    'https://www.europarl.europa.eu/rss/doc/press-releases/en.xml',
    'https://www.france24.com/en/rss',
    'https://feeds.euronews.com/rss.xml',
    'https://feeds.thelocal.com/rss',
    'https://www.albawaba.com/rss/all',
    'https://www.middleeasteye.net/rss',
    'https://www.scmp.com/rss/318198/feed.xml',
    'https://www.themoscowtimes.com/rss/news',
    'https://www.rt.com/rss/all',
    'https://travel.state.gov/content/ris/810.xml',
    'http://feeds.skynews.com/feeds/rss/world.xml',
    'http://feeds.skynews.com/feeds/rss/politics.xml',
    'https://globalnews.ca/rss/world.xml',
    'https://globalnews.ca/rss/canada.xml',
    'https://globalnews.ca/rss/politics.xml',
    'https://balkaninsight.com/feed',
    'https://globalvoices.org/feed/',
    'https://crisisgroup.org/categories.xml',
    'https://theconversation.com/articles.atom',
    'https://www.foxnews.com/about/rss',
    'https://en.yenisafak.com/rss',
    'https://www.sbs.com.au/news/rss',
    'https://www.canberratimes.com.au/rss.xml',
    'https://www.9news.com.au/rss',
    'https://www.ft.com/rss/home',
    'https://hungarytoday.hu/rss/',
    'https://english.enabbaladi.net/rss/',
    'https://www.shafaq.com/rss/en/Iraq',
    'https://www.iraq-businessnews.com/feed/',
    'https://www.lbcgroup.tv/rss/news/en/8',
    'https://notesfrompoland.com/rss/',
    'https://api.axios.com/feed/',
    'https://www.balkaninsight.com/category/news/feed/',
    'https://www.usatoday.com/news/rssfeed/',
    'https://www.csmonitor.com/rss/',
    'https://www.csis.org/rss.xml',
    'https://www.reutersagency.com/rss/',
    'https://www.podcast.co.uk/rss/rss-politics'
]))

POLITICAL_RSS_URLS = [
    'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    'https://www.cbc.ca/webfeed/rss/rss-politics',
    'https://www.cbc.ca/webfeed/rss/rss-canada',
    'https://www.cbc.ca/webfeed/rss/rss-world',
    'https://www.the961.com/feed/',
    'https://rss.politico.com/politics-news.xml',
    'https://www.bbc.com/news/politics',
    'https://www.nbcnews.com/politics',
    'https://edition.cnn.com/politics',
    'https://api.axios.com/feed/',
    'https://www.theatlantic.com/politics/',
    'https://time.com/section/politics/',
    'https://www.politicshome.com/news/rss',
    'https://www.politicshome.com/opinion/rss',
    'https://www.europarl.europa.eu/rss/doc/press-releases/en.xml',
    'https://www.france24.com/en/europe/rss',
    'https://feeds.feedburner.com/euronews/en/home/',
    'https://brusselsmorning.com/feed/',
    'https://feeds.thelocal.com/rss/es',
    'https://feeds.feedburner.com/TheBalticTimesNews',
    'https://www.albawaba.com/rss/all',
    'https://www.middleeasteye.net/rss',
    'https://www.scmp.com/rss/318198/feed/',
    'https://www.scmp.com/rss/5/feed/',
    'https://www.xinhuanet.com/english/rss/worldrss.xml',
    'https://www.themoscowtimes.com/rss/news',
    'http://government.ru/en/all/rss/',
    'https://www.rt.com/rss/',
    'https://travel.state.gov/_res/rss/TAsTWs.xml',
    'http://feeds.skynews.com/feeds/rss/world.xml',
    'http://feeds.skynews.com/feeds/rss/politics.xml',
    'https://globalnews.ca/world/feed/',
    'https://globalnews.ca/canada/feed/',
    'https://globalnews.ca/politics/feed/',
    'https://globalnews.ca/us-news/feed/',
    'https://balkaninsight.com/feed',
    'https://www.iraq-businessnews.com/feed/',
    'https://globalvoices.org/feed/',
    'https://www.crisisgroup.org/rss',
    'https://www.observercyprus.com/feed/',
    'https://theconversation.com/articles.atom?language=en',
    'https://www.foxnews.com/world',
    'https://en.yenisafak.com/rss-feeds?category=/politics',
    'https://www.sbs.com.au/news/feed',
    'https://www.canberratimes.com.au/rss.xml',
    'https://www.9news.com.au/rss',
    'https://www.ft.com/rss/home',
    'https://hungarytoday.hu/feed/',
    'https://english.enabbaladi.net/feed/',
    'https://www.shafaq.com/rss/en/Iraq',
    'https://www.vox.com/rss/index.xml',
    'https://www.arabnews.com/cat/3/rss.xml',
    'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news',
    'https://english.alarabiya.net/feed/rss2/en/News.xml',
    'https://www.news18.com/commonfeeds/v1/eng/rss/world.xml',
    'https://notesfrompoland.com/feed/',
    'https://t.me/s/tollabn'
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

# Feed fetching functions - optimized
import gzip
import time

def fetch_single_feed(url):
    """Fetch a single RSS feed - optimized with caching"""
    cache_key = url.split('?')[0]
    current_time = time.time()
    
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': USER_AGENT,
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Encoding': 'gzip, deflate'
        })
        
        if 't.me' in url.lower():
            return fetch_telegram(url)
        else:
            return fetch_rss(url, req)
    except Exception as e:
        source_name = url.split('//')[1].split('/')[0] if '//' in url else url
        return {'items': [], 'source': {'name': source_name, 'status': 'failed', 'url': url}, 'success': False}

def fetch_telegram(url):
    """Simplified Telegram fetcher"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            source_name = 'Telegram'
            channel_match = re.search(r'<title>([^<]+)</title>', html)
            if channel_match:
                source_name = channel_match.group(1)
            
            items = []
            posts = re.findall(r'<a[^>]*href="(https://t\.me/[^"]+)"[^>]*>([^<]+)</a>', html)
            for link, title in posts[:5]:
                items.append({
                    'title': title[:200],
                    'link': link,
                    'description': 'From Telegram',
                    'pubDate': '',
                    'source': source_name
                })
            return {'items': items, 'source': {'name': source_name, 'status': 'working', 'url': url}, 'success': True}
    except Exception as e:
        return {'items': [], 'source': {'name': 'Telegram', 'status': 'failed', 'url': url}, 'success': False}

def fetch_rss(url, req):
    """Optimized RSS fetcher with comprehensive handling"""
    try:
        # Enhanced headers to mimic browser
        req.add_header('Accept-Language', 'en-US,en;q=0.9,ar;q=0.8')
        req.add_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        req.add_header('Pragma', 'no-cache')
        req.add_header('Upgrade-Insecure-Requests', '1')
        req.add_header('Sec-Fetch-Dest', 'document')
        req.add_header('Sec-Fetch-Mode', 'navigate')
        req.add_header('Sec-Fetch-Site', 'none')
        req.add_header('Sec-Fetch-User', '?1')
        
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        try:
            response = urllib.request.urlopen(req, timeout=8, context=ctx)
        except urllib.error.HTTPError as e:
            # Try following redirect manually
            if e.code in [301, 302, 303, 307, 308]:
                location = e.headers.get('Location')
                if location:
                    req = urllib.request.Request(location, headers={
                        'User-Agent': USER_AGENT,
                        'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': url.split('//')[1].split('/')[0]
                    })
                    response = urllib.request.urlopen(req, timeout=8, context=ctx)
                else:
                    raise
            else:
                raise
        
        content = response.read()
        if response.info().get('Content-Encoding') == 'gzip':
            content = gzip.decompress(content)
        
        try:
            content = content.decode('utf-8')
        except UnicodeDecodeError:
            content = content.decode('latin-1', errors='ignore')
        
        # Handle HTML redirect pages
        if '<!DOCTYPE html' in content.lower() or '<html' in content.lower():
            # Try to find RSS link in HTML
            rss_link = re.search(r'href=["\']([^"\']*\.rss[^"\']*)["\']', content, re.I)
            if not rss_link:
                rss_link = re.search(r'href=["\']([^"\']*feed[^"\']*)["\']', content, re.I)
            if rss_link:
                rss_url = rss_link.group(1)
                if not rss_url.startswith('http'):
                    from urllib.parse import urljoin
                    rss_url = urljoin(url, rss_url)
                return fetch_single_feed(rss_url)
            
            source_name = url.split('//')[1].split('/')[0]
            return {'items': [], 'source': {'name': source_name, 'status': 'failed', 'url': url}, 'success': True}
        
        # Handle Atom feeds too
        root = None
        try:
            tree = ET.parse(StringIO(content))
            root = tree.getroot()
        except ET.ParseError:
            # Try parsing as Atom
            if '<feed' in content:
                root = ET.fromstring(content)
        
        if root is None:
            source_name = url.split('//')[1].split('/')[0]
            return {'items': [], 'source': {'name': source_name, 'status': 'failed', 'url': url}, 'success': True}
        
        source_name = url.split('//')[1].split('/')[0]
        if 'lbc' in url.lower(): source_name = 'LBCI'
        elif 'the961' in url.lower(): source_name = 'The961'
        elif 'politico' in url.lower(): source_name = 'Politico'
        elif 'scmp' in url.lower(): source_name = 'SCMP'
        elif 'moscowtimes' in url.lower(): source_name = 'Moscow Times'
        elif 'fox' in url.lower(): source_name = 'Fox News'
        elif 'ft' in url.lower(): source_name = 'FT'
        elif 'hungary' in url.lower(): source_name = 'Hungary Today'
        elif 'enabbaladi' in url.lower(): source_name = 'Enab Baladi'
        elif 'shafaq' in url.lower(): source_name = 'Shafaaq'
        elif 'vox' in url.lower(): source_name = 'Vox'
        elif 'alarab' in url.lower(): source_name = 'Al Arabiya'
        elif 'news18' in url.lower(): source_name = 'News18'
        elif 'notesfrompoland' in url.lower(): source_name = 'Notes from Poland'
        
        items = []
        
        # Try different entry patterns
        for path in ['.//item', './/entry', './/article']:
            entries = root.findall(path)
            if entries:
                break
        
        if not entries:
            entries = root.findall('.//*')
            entries = [e for e in entries if e.tag.lower() in ['item', 'entry', 'article']]
        
        for entry in entries:
            title = entry.findtext('title') or entry.get('title') or ''
            if not title:
                title_elem = entry.find('.//title')
                title = title_elem.text if title_elem is not None else ''
            
            link = entry.findtext('link') or ''
            if not link:
                link_elem = entry.find('.//link')
                link = link_elem.get('href') if link_elem is not None else ''
            
            desc = entry.findtext('description') or entry.findtext('summary') or entry.findtext('content') or ''
            if not desc:
                desc_elem = entry.find('.//description')
                desc = desc_elem.text if desc_elem is not None else ''
            
            pubDate = entry.findtext('pubDate') or entry.findtext('published') or entry.findtext('updated') or ''
            
            if desc:
                desc = re.sub('<[^<]+?>', '', desc)[:250]
            
            if title and link:
                items.append({
                    'title': title[:300],
                    'link': link,
                    'description': desc,
                    'pubDate': pubDate,
                    'source': source_name
                })
        
        return {'items': items, 'source': {'name': source_name, 'status': 'working', 'url': url}, 'success': True}
    except Exception as e:
        source_name = url.split('//')[1].split('/')[0] if '//' in url else url
        return {'items': [], 'source': {'name': source_name, 'status': 'failed', 'url': url}, 'success': False}

# API Routes
@app.route('/api/news')
def get_news():
    news_items = []
    sources_info = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_single_feed, url): url for url in RSS_URLS}
        
        for future in as_completed(futures):
            try:
                result = future.result()
                if result['success']:
                    news_items.extend(result['items'])
                    sources_info.append(result['source'])
            except Exception as e:
                print(f"News fetch error: {e}")
    
    return jsonify({'articles': news_items, 'sources': sources_info})

@app.route('/api/news/world/stream')
def stream_world_news():
    """Server-Sent Events endpoint for real-time world news loading progress"""
    from flask import Response, stream_with_context
    
    try:
        news_items = []
        sources_info = []
        urls_to_fetch = WORLD_NEWS_URLS
        total = len(urls_to_fetch)
        completed = 0
        
        def generate():
            nonlocal news_items, sources_info, completed
            
            # Yield initial state
            yield f"data: {json.dumps({'type': 'start', 'total': total, 'completed': 0})}\n\n"
            
            with ThreadPoolExecutor(max_workers=30) as executor:
                futures = {executor.submit(fetch_single_feed, url): url for url in urls_to_fetch}
                
                for future in as_completed(futures):
                    try:
                        result = future.result()
                        source_status = result.get('source', {})
                        print(f"Fetched {source_status.get('name')}: {len(result.get('items', []))} items, success={result.get('success')}")
                        
                        completed += 1
                        progress = round((completed / total) * 100)
                        
                        if result['success'] and result.get('items'):
                            news_items.extend(result['items'])
                            sources_info.append(result['source'])
                        
                        # Send progress update
                        yield f"data: {json.dumps({
                            'type': 'progress',
                            'source': source_status.get('name'),
                            'completed': completed,
                            'total': total,
                            'progress': progress,
                            'success': result.get('success'),
                            'itemsCount': len(result.get('items', []))
                        })}\n\n"
                    except Exception as e:
                        print(f"Future error: {e}")
                        completed += 1
                        yield f"data: {json.dumps({'type': 'error', 'error': str(e), 'completed': completed, 'total': total})}\n\n"
            
            # Process and deduplicate
            news_items.sort(key=lambda x: parse_date(x.get('pubDate', '')), reverse=True)
            deduped = deduplicate_articles(news_items)
            
            print(f"Total items after dedup: {len(deduped)}")
            
            # Send final result
            yield f"data: {json.dumps({
                'type': 'complete',
                'articles': deduped,
                'sources': sources_info,
                'totalSources': len(urls_to_fetch)
            })}\n\n"
        
        return Response(stream_with_context(generate()), mimetype='text/event-stream')
    except Exception as e:
        print(f"World news stream error: {e}")
        return Response(f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n", mimetype='text/event-stream')

@app.route('/api/news/world')
def get_world_news():
    try:
        news_items = []
        sources_info = []
        
        yesterday = datetime.now().date() - timedelta(days=1)
        
        # Use optimized workers with all sources
        urls_to_fetch = WORLD_NEWS_URLS
        with ThreadPoolExecutor(max_workers=30) as executor:
            futures = {executor.submit(fetch_single_feed, url): url for url in urls_to_fetch}
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                    source_status = result.get('source', {})
                    print(f"Fetched {source_status.get('name')}: {len(result.get('items', []))} items, success={result.get('success')}")
                    
                    if result['success'] and result.get('items'):
                        news_items.extend(result['items'])
                        sources_info.append(result['source'])
                except Exception as e:
                    print(f"Future error: {e}")
        
        print(f"Total items before filter: {len(news_items)}")
        
        # Keep all items - no date filter for now
        filtered = news_items
        
        # Sort by date
        filtered.sort(key=lambda x: parse_date(x.get('pubDate', '')), reverse=True)
        
        # Deduplicate similar articles
        deduped = deduplicate_articles(filtered)
        
        print(f"Total items after dedup: {len(deduped)}")
        
        return jsonify({'articles': deduped, 'sources': sources_info, 'totalSources': len(urls_to_fetch)})
    except Exception as e:
        print(f"World news error: {e}")
        return jsonify({'articles': [], 'sources': [], 'error': str(e)})

def deduplicate_articles(articles):
    """Remove duplicate/similar articles based on title similarity"""
    if not articles:
        return []
    
    seen_titles = []
    deduped = []
    
    for article in articles:
        title = article.get('title', '').lower().strip()
        if not title:
            continue
            
        # Check if similar title already exists
        is_duplicate = False
        for seen in seen_titles:
            # Simple similarity check - if titles overlap significantly
            if similarity(title, seen) > 0.7:
                is_duplicate = True
                break
        
        if not is_duplicate:
            seen_titles.append(title)
            deduped.append(article)
    
    return deduped

def similarity(s1, s2):
    """Calculate simple similarity between two strings"""
    if not s1 or not s2:
        return 0
    
    # Remove common words for better comparison
    common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'}
    
    words1 = set(s1.split()) - common_words
    words2 = set(s2.split()) - common_words
    
    if not words1 or not words2:
        return 0
    
    intersection = len(words1 & words2)
    union = len(words1 | words2)
    
    return intersection / union if union > 0 else 0

def is_recent(pub_date, yesterday):
    if not pub_date:
        return True
    try:
        for fmt in ['%a, %d %b %Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d']:
            try:
                parsed = datetime.strptime(pub_date[:25].strip(), fmt)
                return parsed.date() >= yesterday
            except:
                continue
        return True
    except:
        return True

def parse_date(pub_date):
    if not pub_date:
        return datetime.min
    try:
        for fmt in ['%a, %d %b %Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d']:
            try:
                return datetime.strptime(pub_date[:25].strip(), fmt)
            except:
                continue
        return datetime.min
    except:
        return datetime.min

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
