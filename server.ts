import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import sqlite3 from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('AviationSort server starting...');

const PORT = 5001;
const DIRECTORY = path.join(__dirname, 'dist');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
const PEPPER = 'aviation_sort_pepper_2024';

const app = express();
app.use(cors());
app.use(express.json());

interface CacheEntry {
  value: string;
  timestamp: number;
}

class ProxyCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 200, ttl = 300000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      return entry.value;
    }
    this.cache.delete(key);
    return null;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      let oldestKey: string | null = null;
      let oldestTime = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}

class SessionManager {
  private sessions: Map<string, { username: string; created: number; lastActivity: number }> = new Map();
  private sessionTimeout = 3600 * 1000;

  createSession(username: string): string {
    const token = crypto.randomBytes(32).toString('base64url');
    this.sessions.set(token, {
      username,
      created: Date.now(),
      lastActivity: Date.now()
    });
    return token;
  }

  validateSession(token: string): string | null {
    const session = this.sessions.get(token);
    if (session && Date.now() - session.lastActivity < this.sessionTimeout) {
      session.lastActivity = Date.now();
      return session.username;
    }
    if (session) this.sessions.delete(token);
    return null;
  }

  destroySession(token: string): boolean {
    return this.sessions.delete(token);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.sessions.delete(token);
      }
    }
  }
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests = 100;
  private windowMs = 60000;

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const times = this.requests.get(identifier) || [];
    const valid = times.filter(t => now - t < this.windowMs);
    if (valid.length >= this.maxRequests) {
      this.requests.set(identifier, valid);
      return false;
    }
    valid.push(now);
    this.requests.set(identifier, valid);
    return true;
  }
}

const proxyCache = new ProxyCache();
const sessions = new SessionManager();
const rateLimiter = new RateLimiter();

console.log('Initializing database...');

const usersDb = sqlite3(path.join(__dirname, 'users.db'));
const usersCursor = usersDb.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    created_at TEXT,
    last_login TEXT,
    failed_attempts INTEGER DEFAULT 0,
    locked_until INTEGER DEFAULT 0
  )
`).run();

usersDb.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT,
    created_at TEXT,
    expires_at INTEGER,
    FOREIGN KEY (username) REFERENCES users(username)
  )
`).run();

usersDb.prepare(`
  CREATE TABLE IF NOT EXISTS profiles (
    username TEXT PRIMARY KEY,
    displayName TEXT,
    bio TEXT,
    homeAirport TEXT,
    favoriteAirline TEXT,
    equipment TEXT,
    isPrivate INTEGER
  )
`).run();

const flexpicsDb = sqlite3(path.join(__dirname, 'flexpics.db'));
const flexpicsCursor = flexpicsDb.prepare(`
  CREATE TABLE IF NOT EXISTS flexpics (
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
  )
`).run();

const playlistsDb = sqlite3(path.join(__dirname, 'playlists.db'));
playlistsDb.prepare(`
  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT,
    created_at TEXT
  )
`).run();

playlistsDb.prepare(`
  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    thumbnail TEXT,
    added_at TEXT,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
  )
`).run();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(password, Buffer.concat([salt, Buffer.from(PEPPER)]), 100000, 32, 'sha256');
  return Buffer.concat([salt, hash]).toString('base64');
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const data = Buffer.from(storedHash, 'base64');
    const salt = data.subarray(0, 32);
    const storedPwdHash = data.subarray(32);
    const pwdHash = crypto.pbkdf2Sync(password, Buffer.concat([salt, Buffer.from(PEPPER)]), 100000, 32, 'sha256');
    return crypto.timingSafeEqual(pwdHash, storedPwdHash);
  } catch {
    return false;
  }
}

function findSimilarFlexpics(registration?: string, airline?: string, aircraftType?: string) {
  let results: any[] = [];
  
  if (registration) {
    const stmt = flexpicsDb.prepare('SELECT * FROM flexpics WHERE photo_registration LIKE ? OR photo_registration LIKE ?');
    results = stmt.all(`%${registration}%`, `%${registration.slice(-3)}%`);
  }
  
  if (airline && !results.length) {
    const stmt = flexpicsDb.prepare('SELECT * FROM flexpics WHERE photo_airline LIKE ?');
    results = stmt.all(`%${airline}%`);
  }
  
  if (aircraftType && !results.length) {
    const stmt = flexpicsDb.prepare('SELECT * FROM flexpics WHERE photo_aircraft_type LIKE ?');
    results = stmt.all(`%${aircraftType}%`);
  }
  
  return results;
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/proxy', async (req: Request, res: Response) => {
  const url = req.query.url as string;
  const useCache = (req.query.cache as string || 'true').toLowerCase() === 'true';

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  if (useCache) {
    const cached = proxyCache.get(url);
    if (cached) {
      return res.set({ 'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'HIT' }).send(cached);
    }
  }

  try {
    const cloudscraper = (await import('cloudscraper')).default;
    let referer = 'https://www.google.com/';
    if (url.includes('lbcgroup.tv')) referer = 'https://www.lbcgroup.tv/';
    else if (url.includes('runwaygirlnetwork')) referer = 'https://runwaygirlnetwork.com/';

    const response = await cloudscraper.get(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/xml, text/xml, */*', 'Referer': referer },
      timeout: 15000
    });

    let text = typeof response === 'string' ? response : response.body;
    
    if (useCache) proxyCache.set(url, text);
    
    return res.set({ 'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'MISS' }).send(text);
  } catch (e: any) {
    // Try fallback with native fetch
    try {
      const fallbackResponse = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' }
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback fetch failed: ${fallbackResponse.status}`);
      }
      
      const text = await fallbackResponse.text();
      
      if (useCache) proxyCache.set(url, text);
      
      return res.set({ 'Content-Type': 'text/xml; charset=utf-8', 'X-Cache': 'MISS-FALLBACK' }).send(text);
    } catch (fallbackError: any) {
      const errorMsg = String(e);
      const fallbackMsg = String(fallbackError);
      console.error(`Proxy error for ${url}:`, errorMsg);
      console.error(`Fallback also failed:`, fallbackMsg);
      
      if (errorMsg.includes('CERTIFICATE') || errorMsg.includes('SSL') || fallbackMsg.includes('CERTIFICATE')) {
        return res.status(502).json({ error: 'SSL certificate error' });
      }
      if (errorMsg.toLowerCase().includes('timed out') || fallbackMsg.toLowerCase().includes('timed out')) {
        return res.status(504).json({ error: 'Request timed out' });
      }
      if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
        return res.status(403).json({ error: 'Access forbidden' });
      }
      if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      res.status(500).json({ error: `Proxy error: ${errorMsg.slice(0, 100)}` });
    }
  }
});

app.post('/api/proxy/batch', async (req: Request, res: Response) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const cloudscraper = (await import('cloudscraper')).default;
  const results: Record<string, { content: string | null; error: string | null }> = {};

  const fetchPromises = urls.map(async (url: string) => {
    try {
      let referer = 'https://www.google.com/';
      if (url.includes('lbcgroup.tv')) referer = 'https://www.lbcgroup.tv/';
      else if (url.includes('runwaygirlnetwork')) referer = 'https://runwaygirlnetwork.com/';

      const response = await cloudscraper.get(url, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/xml, text/xml, */*', 'Referer': referer },
        timeout: 12000
      });

      const text = typeof response === 'string' ? response : response.body;
      proxyCache.set(url, text);
      results[url] = { content: text, error: null };
    } catch (e: any) {
      // Try fallback with native fetch
      try {
        const fallbackResponse = await fetch(url, {
          headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' }
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback failed: ${fallbackResponse.status}`);
        }
        
        const text = await fallbackResponse.text();
        proxyCache.set(url, text);
        results[url] = { content: text, error: null };
      } catch (fallbackError: any) {
        console.error(`Batch proxy error for ${url}:`, String(e));
        console.error(`Batch fallback also failed:`, String(fallbackError));
        results[url] = { content: null, error: String(e) };
      }
    }
  });

  await Promise.all(fetchPromises);

  const hasErrors = Object.values(results).some(r => r.error);
  res.status(hasErrors ? 207 : 200).json(results);
});

app.get('/api/photos', (_req: Request, res: Response) => {
  res.json([]);
});

app.get('/api/profile', (req: Request, res: Response) => {
  const { username } = req.query;
  if (!username) return res.json({});
  
  const stmt = usersDb.prepare('SELECT * FROM profiles WHERE username = ?');
  const row = stmt.get(username as string) as any;
  
  if (row) {
    res.json({
      username: row.username,
      displayName: row.displayName,
      bio: row.bio,
      homeAirport: row.homeAirport,
      favoriteAirline: row.favoriteAirline,
      equipment: row.equipment,
      isPrivate: Boolean(row.isPrivate)
    });
  } else {
    res.json({});
  }
});

app.post('/api/profile', (req: Request, res: Response) => {
  const { username, displayName, bio, homeAirport, favoriteAirline, equipment, isPrivate } = req.body;
  
  usersDb.prepare(`
    INSERT OR REPLACE INTO profiles (username, displayName, bio, homeAirport, favoriteAirline, equipment, isPrivate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(username, displayName || '', bio || '', homeAirport || '', favoriteAirline || '', equipment || '', isPrivate ? 1 : 0);
  
  res.json({ success: true });
});

app.get('/api/flexpics', (req: Request, res: Response) => {
  const { username } = req.query;
  console.log(`Fetching flexpics for username: '${username}'`);
  
  let rows: any[];
  if (username) {
    const stmt = flexpicsDb.prepare('SELECT * FROM flexpics WHERE LOWER(username) = LOWER(?)');
    rows = stmt.all(username);
  } else {
    rows = flexpicsDb.prepare('SELECT * FROM flexpics').all();
  }
  
  console.log(`Found ${rows.length} flexpics`);
  
  const flexpics = rows.map((row: any) => ({
    id: row.id,
    username: row.username,
    photo_url: row.photo_url,
    photo_thumbnail_url: row.photo_thumbnail_url,
    photo_registration: row.photo_registration,
    photo_airline: row.photo_airline,
    photo_aircraft_type: row.photo_aircraft_type,
    photo_date: row.photo_date,
    file_directory: row.file_directory,
    date_added: row.date_added,
    hashtags: row.hashtags,
    is_video: Boolean(row.is_video),
    width: row.width,
    height: row.height,
    file_size: row.file_size
  }));
  
  res.json(flexpics);
});

app.get('/api/flexpics/similar', (req: Request, res: Response) => {
  const { registration, airline, aircraft_type } = req.query;
  
  const similar = findSimilarFlexpics(registration as string, airline as string, aircraft_type as string);
  
  const flexpics = similar.map((row: any) => ({
    id: row.id,
    username: row.username,
    photo_url: row.photo_url,
    photo_registration: row.photo_registration,
    photo_airline: row.photo_airline,
    photo_aircraft_type: row.photo_aircraft_type,
    photo_date: row.photo_date,
    file_directory: row.file_directory,
    date_added: row.date_added
  }));
  
  res.json(flexpics);
});

app.post('/api/flexpics', (req: Request, res: Response) => {
  const { username, photo_url, photo_thumbnail_url, photo_registration, photo_airline, photo_aircraft_type, photo_date, file_directory, date_added, hashtags, is_video, width, height, file_size } = req.body;
  
  flexpicsDb.prepare(`
    INSERT INTO flexpics (username, photo_url, photo_thumbnail_url, photo_registration, photo_airline, photo_aircraft_type, photo_date, file_directory, date_added, hashtags, is_video, width, height, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(username, photo_url, photo_thumbnail_url, photo_registration, photo_airline, photo_aircraft_type, photo_date, file_directory, date_added, hashtags, is_video ? 1 : 0, width || 0, height || 0, file_size || 0);
  
  res.json({ success: true });
});

app.delete('/api/flexpics', (req: Request, res: Response) => {
  const { id } = req.body;
  flexpicsDb.prepare('DELETE FROM flexpics WHERE id = ?').run(id);
  res.json({ success: true });
});

app.post('/api/login', (req: Request, res: Response) => {
  if (!rateLimiter.isAllowed(req.ip || 'unknown')) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  const { username, password } = req.body;
  const safeUsername = (username || '').trim();
  
  if (!safeUsername || !password) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const stmt = usersDb.prepare('SELECT password FROM users WHERE username = ?');
  const row = stmt.get(safeUsername) as { password: string } | undefined;
  
  if (row) {
    const storedHash = row.password;
    // Try hashed password verification first
    if (verifyPassword(password, storedHash)) {
      const token = sessions.createSession(safeUsername);
      return res.json({ success: true, username: safeUsername, token });
    }
    // Fallback: plain text password (legacy support)
    if (storedHash === password) {
      // Migrate to hashed password
      const newHash = hashPassword(password);
      usersDb.prepare('UPDATE users SET password = ? WHERE username = ?').run(newHash, safeUsername);
      const token = sessions.createSession(safeUsername);
      return res.json({ success: true, username: safeUsername, token });
    }
    // Wrong password
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // New user - create account
  const passwordHash = hashPassword(password);
  usersDb.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(safeUsername, passwordHash);
  const token = sessions.createSession(safeUsername);
  return res.json({ success: true, username: safeUsername, token });
});

app.post('/api/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  sessions.destroySession(token);
  res.json({ success: true });
});

app.get('/api/session', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  const username = sessions.validateSession(token);
  
  if (username) {
    res.json({ valid: true, username });
  } else {
    res.status(401).json({ valid: false });
  }
});

app.get('/api/playlists', (req: Request, res: Response) => {
  const { username } = req.query;
  let rows: any[];
  
  if (username) {
    rows = playlistsDb.prepare('SELECT * FROM playlists WHERE username = ? ORDER BY created_at DESC').all(username);
  } else {
    rows = playlistsDb.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all();
  }
  
  const playlists = rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    username: row.username,
    created_at: row.created_at
  }));
  
  res.json(playlists);
});

app.post('/api/playlists', (req: Request, res: Response) => {
  const { name, username } = req.body;
  const createdAt = new Date().toISOString();
  
  const result = playlistsDb.prepare('INSERT INTO playlists (name, username, created_at) VALUES (?, ?, ?)').run(name || 'Untitled Playlist', username || 'anonymous', createdAt);
  
  res.json({ success: true, id: result.lastInsertRowid });
});

app.delete('/api/playlists/:playlist_id', (req: Request, res: Response) => {
  const { playlist_id } = req.params;
  playlistsDb.prepare('DELETE FROM playlists WHERE id = ?').run(playlist_id);
  res.json({ success: true });
});

app.get('/api/playlists/:playlist_id/tracks', (req: Request, res: Response) => {
  const { playlist_id } = req.params;
  
  const rows = playlistsDb.prepare('SELECT * FROM tracks WHERE playlist_id = ? ORDER BY added_at DESC').all(playlist_id);
  
  const tracks = rows.map((row: any) => ({
    id: row.id,
    playlist_id: row.playlist_id,
    title: row.title,
    url: row.url,
    source: row.source,
    duration: row.duration,
    thumbnail: row.thumbnail,
    added_at: row.added_at
  }));
  
  res.json(tracks);
});

app.post('/api/playlists/:playlist_id/tracks', (req: Request, res: Response) => {
  const { playlist_id } = req.params;
  const { title, url, source, duration, thumbnail } = req.body;
  const addedAt = new Date().toISOString();
  
  const result = playlistsDb.prepare('INSERT INTO tracks (playlist_id, title, url, source, duration, thumbnail, added_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    playlist_id,
    title || 'Unknown',
    url || '',
    source || 'local',
    duration || 0,
    thumbnail || '',
    addedAt
  );
  
  res.json({ success: true, id: result.lastInsertRowid });
});

app.delete('/api/playlists/:playlist_id/tracks/:track_id', (req: Request, res: Response) => {
  const { track_id } = req.params;
  playlistsDb.prepare('DELETE FROM tracks WHERE id = ?').run(track_id);
  res.json({ success: true });
});

app.get('/api/flexpics/export', (req: Request, res: Response) => {
  const { username, format } = req.query;
  
  let rows: any[];
  if (username) {
    rows = flexpicsDb.prepare('SELECT * FROM flexpics WHERE LOWER(username) = LOWER(?)').all(username);
  } else {
    rows = flexpicsDb.prepare('SELECT * FROM flexpics').all();
  }
  
  if (format === 'csv') {
    const csvHeader = 'id,username,photo_url,registration,airline,aircraft_type,date,hashtags\n';
    const csvRows = rows.map((row: any) => 
      `${row.id},${row.username},${row.photo_url},${row.photo_registration},${row.photo_airline},${row.photo_aircraft_type},${row.photo_date},${row.hashtags}`
    ).join('\n');
    
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=flexpics.csv' }).send(csvHeader + csvRows);
    return;
  }
  
  const flexpics = rows.map((row: any) => ({
    id: row.id,
    username: row.username,
    photo_url: row.photo_url,
    photo_registration: row.photo_registration,
    photo_airline: row.photo_airline,
    photo_aircraft_type: row.photo_aircraft_type,
    photo_date: row.photo_date,
    hashtags: row.hashtags
  }));
  
  res.json(flexpics);
});

app.use(express.static(DIRECTORY));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(DIRECTORY, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Starting server on port ${PORT}...`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});

setInterval(() => sessions.cleanup(), 60000);