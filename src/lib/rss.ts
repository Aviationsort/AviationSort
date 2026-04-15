export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  source: string;
  imageUrl?: string;
}

export interface NewsSource {
  name: string;
  status: 'success' | 'failed';
  url: string;
  error?: string;
}

const AVIATION_RSS_URLS = [
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
  'https://www.airbus.com/en/rss-all-feeds/15571?tid=15571&fid=29711',
  'https://runwaygirlnetwork.com/feed/',
  'https://www.airliners.net/rss',
  'https://www.aviationpros.com/rss',
  'https://www.aviationtoday.com/feed/',
  'https://www.flightglobal.com/feed/',
];

const WORLD_NEWS_URLS = [
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
  'https://www.cbc.ca/webfeed/rss/rss-canada',
  'https://www.cbc.ca/webfeed/rss/rss-world',
  'https://www.the961.com/feed/',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.nbcnews.com/rss',
  'https://www.politicshome.com/news/rss',
  'https://www.europarl.europa.eu/rss/doc/press-releases/en.xml',
  'https://www.france24.com/en/rss',
  'https://www.euronews.com/rss?level=theme&name=news',
  'https://feeds.thelocal.com/rss',
  'https://www.albawaba.com/rss/all',
  'https://www.middleeasteye.net/rss',
  'https://www.scmp.com/rss/5/feed',
  'https://www.scmp.com/rss/318198/feed',
  'https://www.scmp.com/rss/318206/feed',
  'https://www.themoscowtimes.com/rss/news',
  'https://www.rt.com/rss/',
  'http://feeds.skynews.com/feeds/rss/world.xml',
  'http://feeds.skynews.com/feeds/rss/politics.xml',
  'https://globalnews.ca/rss/world.xml',
  'https://globalnews.ca/rss/canada.xml',
  'https://globalnews.ca/rss/politics.xml',
  'https://balkaninsight.com/feed',
  'https://globalvoices.org/feed/',
  'https://crisisgroup.org/categories.xml',
  'https://theconversation.com/articles.atom',
  'https://moxie.foxnews.com/google-publisher/world.xml',
  'https://moxie.foxnews.com/google-publisher/us.xml',
  'https://en.yenisafak.com/rss-feeds?category=/politics',
  'https://www.canberratimes.com.au/rss.xml',
  'https://www.9news.com.au/rss',
  'https://www.ft.com/rss/home',
  'https://hungarytoday.hu/feed/',
  'https://english.enabbaladi.net/rss/',
  'https://www.shafaq.com/rss/en/Iraq',
  'https://www.iraq-businessnews.com/feed/',
  'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news',
  'https://notesfrompoland.com/rss/',
  'https://api.axios.com/feed/',
  'https://www.balkaninsight.com/category/news/feed/',
  'https://www.buzzfeed.com/politics.xml'
];

interface FeedResult {
  success: boolean;
  items: NewsItem[];
  source: NewsSource;
}

const feedCache = new Map<string, { data: NewsItem[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchSingleFeed(url: string): Promise<FeedResult> {
  const sourceName = new URL(url).hostname.replace('www.', '').split('.')[0];
  
  // Check cache
  const cached = feedCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      success: true,
      items: cached.data,
      source: { name: sourceName, status: 'success', url }
    };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}&cache=true`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    
    if (!xml) {
      throw new Error('Failed to parse XML');
    }
    
    const parseError = xml.querySelector('parsererror');
    if (parseError) {
      throw new Error('XML parse error');
    }
    
    const items: NewsItem[] = [];
    let entries = xml.querySelectorAll('item, entry');
    
    if (entries.length === 0) {
      entries = xml.querySelectorAll('item, entry, rss\\:item, atom\\:entry');
    }
    
    if (entries.length === 0) {
      const channel = xml.querySelector('channel');
      if (channel) {
        entries = channel.querySelectorAll('item, entry');
      }
    }
    
    if (entries.length === 0 && xml.querySelector('feed')) {
      entries = xml.querySelectorAll('feed > entry, entry');
    }
    
    if (entries.length === 0) {
      return {
        success: true,
        items: [],
        source: { name: sourceName, status: 'success', url }
      };
    }
    
    entries.forEach((entry, i) => {
      const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled';
      let link = entry.querySelector('link')?.textContent?.trim() || '';
      if (!link) {
        link = entry.querySelector('link')?.getAttribute('href') || '';
      }
      const description = entry.querySelector('description, content\\:encoded, summary')?.textContent?.trim() || '';
      const pubDate = entry.querySelector('pubDate, published, updated')?.textContent || '';
      
      let imageUrl = '';
      
      const mediaThumbnail = entry.querySelector('media\\:thumbnail, thumbnail');
      if (mediaThumbnail) {
        imageUrl = mediaThumbnail.getAttribute('url') || '';
      }
      
      if (!imageUrl) {
        const mediaContent = entry.querySelector('media\\:content, content');
        if (mediaContent) {
          imageUrl = mediaContent.getAttribute('url') || '';
        }
      }
      
      if (!imageUrl) {
        const enclosure = entry.querySelector('enclosure');
        if (enclosure) {
          const type = enclosure.getAttribute('type') || '';
          if (type.startsWith('image/')) {
            imageUrl = enclosure.getAttribute('url') || '';
          }
        }
      }
      
      if (!imageUrl && description) {
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }
      
      if (!imageUrl) {
        const atomContent = entry.querySelector('content');
        if (atomContent) {
          const html = atomContent.textContent || '';
          const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }
      }
      
      if (title && title !== 'Untitled' && link) {
        items.push({
          id: `${sourceName}-${i}-${Date.now()}`,
          title: title.substring(0, 300),
          summary: description.replace(/<[^>]*>/g, '').substring(0, 300),
          date: pubDate ? new Date(pubDate).toLocaleDateString() : 'Recent',
          url: link,
          source: sourceName,
          imageUrl: imageUrl || undefined
        });
      }
    });
    
    // Cache the results
    if (items.length > 0) {
      feedCache.set(url, { data: items, timestamp: Date.now() });
    }
    
    return {
      success: true,
      items,
      source: { name: sourceName, status: 'success', url }
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        items: [],
        source: { name: sourceName, status: 'failed', url, error: 'Timeout' }
      };
    }
    return {
      success: false,
      items: [],
      source: { name: sourceName, status: 'failed', url, error: String(error) }
    };
  }
}

export async function fetchAviationNews(onProgress?: (source: string, count: number) => void): Promise<{ articles: NewsItem[], sources: NewsSource[] }> {
  const newsItems: NewsItem[] = [];
  const sourcesInfo: NewsSource[] = [];
  
  const results = await Promise.allSettled(
    AVIATION_RSS_URLS.map(async (url) => {
      const result = await fetchSingleFeed(url);
      if (onProgress) {
        onProgress(result.source.name, result.items.length);
      }
      return result;
    })
  );
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      newsItems.push(...result.value.items);
      sourcesInfo.push(result.value.source);
    }
  });
  
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const filteredItems = newsItems.filter(item => {
    try {
      const itemDate = new Date(item.date);
      return itemDate >= twoDaysAgo;
    } catch {
      return true;
    }
  });
  
  filteredItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return { articles: filteredItems, sources: sourcesInfo };
}

export async function fetchWorldNews(onProgress?: (progress: number, source: string) => void): Promise<{ articles: NewsItem[], sources: NewsSource[] }> {
  const newsItems: NewsItem[] = [];
  const sourcesInfo: NewsSource[] = [];
  const total = WORLD_NEWS_URLS.length;
  
  const batchSize = 8;
  for (let i = 0; i < WORLD_NEWS_URLS.length; i += batchSize) {
    const batch = WORLD_NEWS_URLS.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const result = await fetchSingleFeed(url);
        return result;
      })
    );
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          newsItems.push(...result.value.items);
        }
        sourcesInfo.push(result.value.source);
        
        if (onProgress) {
          const completed = Math.min(i + batchSize, total);
          onProgress(Math.round((completed / total) * 100), result.value.source.name);
        }
      }
    });
  }
  
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const filteredItems = newsItems.filter(item => {
    try {
      const itemDate = new Date(item.date);
      return itemDate >= twoDaysAgo;
    } catch {
      return true;
    }
  });
  
  filteredItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return { articles: filteredItems, sources: sourcesInfo };
}

export { AVIATION_RSS_URLS, WORLD_NEWS_URLS };