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

const RSS_CREDITS: Record<string, string> = {
  'https://www.aeroroutes.com/?format=rss': 'AeroRoutes',
  'https://www.aero-news.net/news/rssCOMANW.xml': 'Aero-News',
  'https://samchui.com/feed/': 'SamChui',
  'https://simpleflying.com/feed/': 'Simple Flying',
  'https://theaviationist.com/feed/': 'The Aviationist',
  'https://avgeekery.com/feed/': 'AvGeekery',
  'https://australianaviation.com.au/feed/': 'Australian Aviation',
  'https://feeds.feedburner.com/Ex-yuAviationNews': 'Ex-Yu Aviation News',
  'https://generalaviationnews.com/feed/': 'General Aviation News',
  'https://www.airbus.com/en/rss-all-feeds/15571?tid=15571&fid=29711': 'Airbus',
  'https://runwaygirlnetwork.com/feed/': 'Runway Girl Network',
  'https://www.aviationpros.com/rss': 'Aviation Pros',
  'https://www.aviationtoday.com/feed/': 'Aviation Today',
  'https://www.flightglobal.com/feed/': 'Flight Global',
  'https://www.thehimalayantimes.com/rssFeed/11/44': 'The Himalayan Times',
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml': 'UN News',
  'https://rss.dw.com/rdf/rss-en-all': 'DW',
  'https://feeds.abcnews.com/abcnews/politicsheadlines': 'ABC News',
  'https://feeds.abcnews.com/abcnews/usheadlines': 'ABC News',
  'https://feeds.abcnews.com/abcnews/internationalheadlines': 'ABC News',
  'https://www.washingtonpost.com/arcio/rss/category/politics/': 'Washington Post',
  'https://www.cbc.ca/webfeed/rss/rss-canada': 'CBC',
  'https://www.cbc.ca/webfeed/rss/rss-world': 'CBC',
  'https://www.cbsnews.com/latest/rss/politics': 'CBS News',
  'https://www.cbsnews.com/latest/rss/world': 'CBS News',
  'https://rthk.hk/rthk/news/rss/e_expressnews_einternational.xml': 'RTHK',
  'https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en': 'Bloomberg',
  'https://indianexpress.com/section/politics/feed/': 'Indian Express',
  'https://www.thehimalayantimes.com/rssFeed/27': 'The Himalayan Times',
  'https://vietnamnews.vn/rss/politics-laws.rss': 'Vietnam News',
  'https://vietnamnews.vn/rss/world.rss': 'Vietnam News',
  'https://feeds.feedburner.com/ndtvnews-world-news': 'NDTV',
  'https://natowatch.org/news.xml': 'NATO Watch',
  'https://www.independent.co.uk/news/world/rss': 'The Independent',
  'https://www.independent.co.uk/news/uk/rss': 'The Independent',
  'https://indianexpress.com/section/news-today/feed/': 'Indian Express',
  'https://www.lemonde.fr/en/international/rss_full.xml': 'Le Monde',
  'http://www.xinhuanet.com/english/rss/worldrss.xml': 'Xinhua',
  'https://www.the961.com/feed/': 'The 961',
  'https://www.japantimes.co.jp/feed/': 'Japan Times',
  'https://www.thenation.com/feed/?post_type=article': 'The Nation',
  'https://cpj.org/feed/atom/': 'Committee to Protect Journalists',
  'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml': 'Hindustan Times',
  'https://www.indiatoday.in/rss/1206577': 'India Today',
  'https://www.nna-leb.gov.lb/en/rss': 'NNA Lebanon',
  'https://feeds.bbci.co.uk/news/rss.xml': 'BBC News',
  'https://english.alarabiya.net/feed/rss2/en/News.xml': 'Al Arabiya',
  'https://www.nbcnews.com/rss': 'NBC News',
  'https://www.politicshome.com/rss': 'Politics Home',
  'https://www.europarl.europa.eu/rss/doc/press-releases/en.xml': 'European Parliament',
  'https://www.france24.com/en/rss': 'France 24',
  'https://www.euronews.com/rss?level=theme&name=news': 'Euronews',
  'https://feeds.thelocal.com/rss': 'The Local',
  'https://www.albawaba.com/rss/all': 'Al Bawaba',
  'https://www.middleeasteye.net/rss': 'Middle East Eye',
  'https://www.scmp.com/rss/5/feed': 'SCMP',
  'https://www.scmp.com/rss/318198/feed': 'SCMP',
  'https://www.scmp.com/rss/318206/feed': 'SCMP',
  'https://www.themoscowtimes.com/rss/news': 'Moscow Times',
  'https://www.rt.com/rss/': 'RT',
  'http://feeds.skynews.com/feeds/rss/world.xml': 'Sky News',
  'http://feeds.skynews.com/feeds/rss/politics.xml': 'Sky News',
  'https://globalnews.ca/world/feed/': 'Global News',
  'https://globalnews.ca/politics/feed/': 'Global News',
  'https://globalnews.ca/canada/feed/': 'Global News',
  'https://balkaninsight.com/feed': 'Balkan Insight',
  'https://globalvoices.org/feed/': 'Global Voices',
  'https://crisisgroup.org/categories.xml': 'International Crisis Group',
  'https://theconversation.com/articles.atom': 'The Conversation',
  'https://moxie.foxnews.com/google-publisher/world.xml': 'Fox News',
  'https://moxie.foxnews.com/google-publisher/us.xml': 'Fox News',
  'https://en.yenisafak.com/rss-feeds?category=/politics': 'Yeni Safak',
  'https://www.canberratimes.com.au/rss.xml': 'Canberra Times',
  'https://www.9news.com.au/rss': '9 News Australia',
  'https://www.ft.com/rss/home': 'Financial Times',
  'https://hungarytoday.hu/feed/': 'Hungary Today',
  'https://english.enabbaladi.net/rss/': 'Enab Baladi',
  'https://www.shafaq.com/rss/en/Iraq': 'Shafaq News',
  'https://www.iraq-businessnews.com/feed/': 'Iraq Business News',
  'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news': 'LBC',
  'https://notesfrompoland.com/rss/': 'Notes from Poland',
  'https://api.axios.com/feed/': 'Axios',
  'https://www.buzzfeed.com/politics.xml': 'BuzzFeed',
};

const AVIATION_RSS_URLS = [
  'https://www.aeroroutes.com/?format=rss',
  'https://www.aero-news.net/news/rssCOMANW.xml',
  'https://samchui.com/feed/',
  'https://simpleflying.com/feed/',
  'https://theaviationist.com/feed/',
  'https://avgeekery.com/feed/',
  'https://australianaviation.com.au/feed/',
  'https://feeds.feedburner.com/Ex-yuAviationNews',
  'https://generalaviationnews.com/feed/',
  'https://www.airbus.com/en/rss-all-feeds/15571?tid=15571&fid=29711',
  'https://runwaygirlnetwork.com/feed/',
  'https://www.aviationpros.com/rss',
  'https://www.aviationtoday.com/feed/',
  'https://www.flightglobal.com/feed/',
  'https://www.thehimalayantimes.com/rssFeed/11/44',
];

const WORLD_NEWS_URLS = [
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
  'https://rss.dw.com/rdf/rss-en-all',
  'https://feeds.abcnews.com/abcnews/politicsheadlines',
  'https://feeds.abcnews.com/abcnews/usheadlines',
  'https://feeds.abcnews.com/abcnews/internationalheadlines',
  'https://www.washingtonpost.com/arcio/rss/category/politics/',
  'https://www.cbc.ca/webfeed/rss/rss-canada',
  'https://www.cbc.ca/webfeed/rss/rss-world',
  'https://www.cbsnews.com/latest/rss/politics',
  'https://www.cbsnews.com/latest/rss/world',
  'https://rthk.hk/rthk/news/rss/e_expressnews_einternational.xml',
  'https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en',
  'https://indianexpress.com/section/politics/feed/',
  'https://www.thehimalayantimes.com/rssFeed/27',
  'https://vietnamnews.vn/rss/politics-laws.rss',
  'https://vietnamnews.vn/rss/world.rss',
  'https://feeds.feedburner.com/ndtvnews-world-news',
  'https://natowatch.org/news.xml',
  'https://www.independent.co.uk/news/world/rss',
  'https://www.independent.co.uk/news/uk/rss',
  'https://indianexpress.com/section/news-today/feed/',
  'https://www.lemonde.fr/en/international/rss_full.xml',
  'http://www.xinhuanet.com/english/rss/worldrss.xml',
  'https://www.the961.com/feed/',
  'https://www.japantimes.co.jp/feed/',
  'https://www.thenation.com/feed/?post_type=article',
  'https://cpj.org/feed/atom/',
  'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml',
  'https://www.indiatoday.in/rss/1206577',
  'https://www.nna-leb.gov.lb/en/rss',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://english.alarabiya.net/feed/rss2/en/News.xml',
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
  'https://globalnews.ca/world/feed/',
  'https://globalnews.ca/politics/feed/',
  'https://globalnews.ca/canada/feed/',
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
  const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
  
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