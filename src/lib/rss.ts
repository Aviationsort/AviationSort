export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  source: string;
  category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'Propaganda';
  imageUrl?: string;
}

export interface NewsSource {
  name: string;
  status: 'success' | 'failed';
  url: string;
  category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'Propaganda';
  error?: string;
}

export interface FeedData {
  url: string;
  category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'Propaganda';
}

export const RSS_CREDITS: Record<string, string> = {
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
  'https://rss.dw.com/atom/rss-en-all': 'DW',
  'https://feeds.abcnews.com/abcnews/politicsheadlines': 'ABC News',
  'https://feeds.abcnews.com/abcnews/usheadlines': 'ABC News',
  'https://feeds.abcnews.com/abcnews/internationalheadlines': 'ABC News',
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
  'https://en.yenisafak.com/rss-feeds?category=/politics': 'Yeni Safak',
  'https://egyptianstreets.com/feed/': 'Egyptian Streets',
  'https://www.independent.co.uk/news/world/rss': 'The Independent',
  'https://www.independent.co.uk/news/uk/rss': 'The Independent',
  'https://indianexpress.com/section/news-today/feed/': 'Indian Express',
  'https://www.lemonde.fr/en/international/rss_full.xml': 'Le Monde',
  'http://www.xinhuanet.com/english/rss/worldrss.xml': 'Xinhua',
  'https://thediplomat.com/feed/': 'The Diplomat',
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
  'https://www.canberratimes.com.au/rss.xml': 'Canberra Times',
  'https://www.9news.com.au/rss': '9 News Australia',
  'https://www.ft.com/rss/home': 'Financial Times',
  'https://eng.globalaffairs.ru/feed/': 'Global Affairs',
  'https://hungarytoday.hu/feed/': 'Hungary Today',
  'https://english.enabbaladi.net/rss/': 'Enab Baladi',
  'https://www.shafaq.com/rss/en/Iraq': 'Shafaq News',
  'https://www.iraq-businessnews.com/feed/': 'Iraq Business News',
  'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news': 'LBC',
  'https://notesfrompoland.com/rss/': 'Notes from Poland',
  'https://api.axios.com/feed/': 'Axios',
  'https://www.buzzfeed.com/politics.xml': 'BuzzFeed',
  'http://government.ru/en/all/rss/': 'Government.ru',
  'https://www.arabfinance.com/en/rss/rssbycat/6': 'Arab Finance',
  'https://sputnikglobe.com/export/rss2/archive/index.xml': 'Sputnik Globe',
  'https://www.gbnews.com/feeds/politics.rss' : 'GB News',
  'https://www.gbnews.com/feeds/news.rss' : 'GB News',
};

const FEEDS_DATA: FeedData[] = [
  {"url": "https://news.un.org/feed/subscribe/en/news/all/rss.xml", "category": "Centrist"},
  {"url": "https://www.aljazeera.com/xml/rss/all.xml", "category": "Left-wing"},
  {"url": "https://www.arabfinance.com/en/rss/rssbycat/6", "category": "Centrist"},
  {"url": "https://www.gbnews.com/feeds/politics.rss", "category": "Right-wing"},
  {"url": "https://www.gbnews.com/feeds/news.rss", "category": "Right-wing"},
  {"url": "https://www.dailynewsegypt.com/feed/", "category": "Centrist"},
  {"url": "https://thediplomat.com/feed/", "category": "Centrist"},
  {"url": "http://government.ru/en/all/rss/", "category": "Propaganda"},
  {"url": "https://rss.dw.com/atom/rss-en-all", "category": "Centrist"},
  {"url": "https://feeds.abcnews.com/abcnews/politicsheadlines", "category": "Centrist"},
  {"url": "https://tass.com/rss/v2.xml", "category": "Propaganda"},
  {"url": "https://feeds.abcnews.com/abcnews/usheadlines", "category": "Centrist"},
  {"url": "https://feeds.abcnews.com/abcnews/internationalheadlines", "category": "Centrist"},
  {"url": "https://www.cbc.ca/webfeed/rss/rss-canada", "category": "Left-wing"},
  {"url": "https://www.cbc.ca/webfeed/rss/rss-world", "category": "Left-wing"},
  {"url": "https://www.cbsnews.com/latest/rss/politics", "category": "Centrist"},
  {"url": "https://www.cbsnews.com/latest/rss/world", "category": "Centrist"},
  {"url": "https://rthk.hk/rthk/news/rss/e_expressnews_einternational.xml", "category": "Propaganda"},
  {"url": "https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en", "category": "Centrist"},
  {"url": "https://indianexpress.com/section/politics/feed/", "category": "Centrist"},
  {"url": "https://www.thehimalayantimes.com/rssFeed/27", "category": "Centrist"},
  {"url": "https://vietnamnews.vn/rss/politics-laws.rss", "category": "Propaganda"},
  {"url": "https://vietnamnews.vn/rss/world.rss", "category": "Propaganda"},
  {"url": "https://feeds.feedburner.com/ndtvnews-world-news", "category": "Left-wing"},
  {"url": "https://natowatch.org/news.xml", "category": "Left-wing"},
  {"url": "https://egyptianstreets.com/feed/", "category": "Centrist"},
  {"url": "https://www.independent.co.uk/news/world/rss", "category": "Left-wing"},
  {"url": "https://www.independent.co.uk/news/uk/rss", "category": "Left-wing"},
  {"url": "https://indianexpress.com/section/news-today/feed/", "category": "Centrist"},
  {"url": "https://www.lemonde.fr/en/international/rss_full.xml", "category": "Left-wing"},
  {"url": "http://www.xinhuanet.com/english/rss/worldrss.xml", "category": "Propaganda"},
  {"url": "https://www.the961.com/feed/", "category": "Centrist"},
  {"url": "https://www.japantimes.co.jp/feed/", "category": "Centrist"},
  {"url": "https://www.thenation.com/feed/?post_type=article", "category": "Left-wing"},
  {"url": "https://cpj.org/feed/atom/", "category": "Centrist"},
  {"url": "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml", "category": "Centrist"},
  {"url": "https://www.indiatoday.in/rss/1206577", "category": "Centrist"},
  {"url": "https://www.nna-leb.gov.lb/en/rss", "category": "Centrist"},
  {"url": "https://feeds.bbci.co.uk/news/rss.xml", "category": "Centrist"},
  {"url": "https://english.alarabiya.net/feed/rss2/en/News.xml", "category": "Right-wing"},
  {"url": "https://www.nbcnews.com/rss", "category": "Left-wing"},
  {"url": "https://www.politicshome.com/news/rss", "category": "Centrist"},
  {"url": "https://www.europarl.europa.eu/rss/doc/press-releases/en.xml", "category": "Centrist"},
  {"url": "https://www.france24.com/en/rss", "category": "Centrist"},
  {"url": "https://www.euronews.com/rss?level=theme&name=news", "category": "Centrist"},
  {"url": "https://feeds.thelocal.com/rss", "category": "Centrist"},
  {"url": "https://www.albawaba.com/rss/all", "category": "Centrist"},
  {"url": "https://www.middleeasteye.net/rss", "category": "Left-wing"},
  {"url": "https://www.scmp.com/rss/5/feed", "category": "Centrist"},
  {"url": "https://www.scmp.com/rss/318198/feed", "category": "Centrist"},
  {"url": "https://www.scmp.com/rss/318206/feed", "category": "Centrist"},
  {"url": "https://www.themoscowtimes.com/rss/news", "category": "Centrist"},
  {"url": "https://www.rt.com/rss/", "category": "Propaganda"},
  {"url": "http://feeds.skynews.com/feeds/rss/world.xml", "category": "Centrist"},
  {"url": "http://feeds.skynews.com/feeds/rss/politics.xml", "category": "Centrist"},
  {"url": "https://globalnews.ca/world/feed/", "category": "Centrist"},
  {"url": "https://globalnews.ca/politics/feed/", "category": "Centrist"},
  {"url": "https://globalnews.ca/canada/feed/", "category": "Centrist"},
  {"url": "https://balkaninsight.com/feed", "category": "Centrist"},
  {"url": "https://globalvoices.org/feed/", "category": "Left-wing"},
  {"url": "https://crisisgroup.org/categories.xml", "category": "Centrist"},
  {"url": "https://theconversation.com/articles.atom", "category": "Left-wing"},
  {"url": "https://moxie.foxnews.com/google-publisher/world.xml", "category": "Right-wing"},
  {"url": "https://moxie.foxnews.com/google-publisher/us.xml", "category": "Right-wing"},
  {"url": "https://en.yenisafak.com/rss-feeds?category=/politics", "category": "Right-wing"},
  {"url": "https://www.canberratimes.com.au/rss.xml", "category": "Centrist"},
  {"url": "https://www.9news.com.au/rss", "category": "Centrist"},
  {"url": "https://www.ft.com/rss/home", "category": "Centrist"},
  {"url": "https://eng.globalaffairs.ru/feed/", "category": "Propaganda"},
  {"url": "https://hungarytoday.hu/feed/", "category": "Right-wing"},
  {"url": "https://english.enabbaladi.net/rss/", "category": "Centrist"},
  {"url": "https://www.shafaq.com/rss/en/Iraq", "category": "Centrist"},
  {"url": "https://www.iraq-businessnews.com/feed/", "category": "Centrist"},
  {"url": "https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news", "category": "Centrist"},
  {"url": "https://notesfrompoland.com/rss/", "category": "Centrist"},
  {"url": "https://api.axios.com/feed/", "category": "Centrist"},
  {"url": "https://www.buzzfeed.com/politics.xml", "category": "Left-wing"},
  {"url": "https://sputnikglobe.com/export/rss2/archive/index.xml", "category": "Propaganda"}
];

// Generate WORLD_NEWS_URLS from FEEDS_DATA
const WORLD_NEWS_URLS = FEEDS_DATA.map(feed => feed.url);

// Helper function to get category for a URL
function getFeedCategory(url: string): 'Centrist' | 'Left-wing' | 'Right-wing' | 'Propaganda' {
  const feedData = FEEDS_DATA.find(feed => feed.url === url);
  return feedData?.category || 'Centrist'; // Default to Centrist if not found
}

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

interface FeedResult {
  success: boolean;
  items: NewsItem[];
  source: NewsSource;
}

const feedCache = new Map<string, { data: NewsItem[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Simplified RSS parser - detects feed type and uses appropriate simple parser
class RSSParser {
  static parseFeed(text: string, url: string): { items: NewsItem[], source: NewsSource } | null {
    try {
      const feedType = this.detectFeedType(text, url);

      if (feedType === 'html') {
        return HTMLParser.parse(text, url);
      }

      // For XML feeds (RSS, Atom, RDF), use unified XML parser
      return XMLParser.parse(text, url);
    } catch (error) {
      console.error('Feed parsing failed:', error);
      return null;
    }
  }

  private static detectFeedType(text: string, url: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('<html')) {
      return 'html';
    }
    return 'xml'; // RSS, Atom, RDF are all XML-based
  }

  static cleanXMLContent(text: string): string {
    let cleaned = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/&bull;/g, '&#8226;')
      .replace(/&mdash;/g, '&#8212;')
      .replace(/&ndash;/g, '&#8211;')
      .replace(/&hellip;/g, '&#8230;')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();

    if (cleaned.includes('<html') || cleaned.includes('<!DOCTYPE html')) {
      cleaned = cleaned
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '')
        .replace(/<\/?meta[^>]*>/gi, '')
        .replace(/<\/?link[^>]*>/gi, '')
        .replace(/<\/?script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<\/?style[^>]*>[\s\S]*?<\/style>/gi, '')
        .trim();
    }

    return cleaned;
  }

  static cleanText(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Unified XML parser for RSS, Atom, and RDF feeds
class XMLParser {
  static parse(text: string, url: string): { items: NewsItem[], source: NewsSource } | null {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      if (!xml.documentElement || xml.querySelector('parsererror')) {
        return null;
      }

      const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
      const category = getFeedCategory(url);
      const items: NewsItem[] = [];

      // Try different item selectors for different feed types
      const selectors = ['item', 'entry'];
      let elements: NodeListOf<Element> | null = null;

      for (const selector of selectors) {
        elements = xml.querySelectorAll(selector);
        if (elements.length > 0) break;
      }

      if (!elements || elements.length === 0) {
        return {
          items: [],
          source: {
            name: sourceName,
            status: 'success',
            url,
            category
          }
        };
      }

      elements.forEach((element, i) => {
        const item = this.extractItem(element as Element, sourceName, category, i);
        if (item) {
          items.push(item);
        }
      });

      return {
        items,
        source: {
          name: sourceName,
          status: items.length > 0 ? 'success' : 'failed',
          url,
          category
        }
      };
    } catch (error) {
      console.error('XML parsing failed:', error);
      return null;
    }
  }

  private static extractItem(element: Element, sourceName: string, category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'Propaganda', index: number): NewsItem | null {
    // Try different title selectors
    const titleSelectors = ['title', 'atom\\:title', 'dc\\:title'];
    let title = '';
    for (const selector of titleSelectors) {
      const el = element.querySelector(selector);
      if (el?.textContent?.trim()) {
        title = RSSParser.cleanText(el.textContent);
        break;
      }
    }

    // Try different link selectors
    const linkSelectors = ['link', 'atom\\:link'];
    let link = '';
    for (const selector of linkSelectors) {
      const el = element.querySelector(selector);
      if (el) {
        link = el.textContent?.trim() || el.getAttribute('href') || '';
        if (link) break;
      }
    }

    // Try different content selectors
    const contentSelectors = ['description', 'content', 'atom\\:content', 'atom\\:summary', 'summary'];
    let summary = '';
    for (const selector of contentSelectors) {
      const el = element.querySelector(selector);
      if (el?.textContent?.trim()) {
        summary = el.textContent.trim().replace(/<[^>]*>/g, '').substring(0, 300);
        break;
      }
    }

    // Try different date selectors
    const dateSelectors = ['pubDate', 'published', 'atom\\:published', 'updated', 'atom\\:updated', 'dc\\:date'];
    let date = 'Recent';
    for (const selector of dateSelectors) {
      const el = element.querySelector(selector);
      if (el?.textContent?.trim()) {
        try {
          const parsedDate = new Date(el.textContent.trim());
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toLocaleDateString();
            break;
          }
        } catch {
          // Invalid date, continue
        }
      }
    }

    if (!title || !link) return null;

    return {
      id: `${sourceName}-${index}-${Date.now()}`,
      title: title.substring(0, 300),
      summary,
      date,
      url: link,
      source: sourceName,
      category,
      imageUrl: this.extractImage(element)
    };
  }

  private static extractImage(element: Element): string | undefined {
    // Try media content first
    const mediaContent = element.querySelector('media\\:content');
    if (mediaContent?.getAttribute('type')?.startsWith('image/')) {
      return mediaContent.getAttribute('url') || undefined;
    }

    // Try enclosure
    const enclosure = element.querySelector('enclosure');
    if (enclosure?.getAttribute('type')?.startsWith('image/')) {
      return enclosure.getAttribute('url') || undefined;
    }

    // Try extracting from content
    const content = element.querySelector('description, content, atom\\:content');
    if (content?.textContent) {
      const imgMatch = content.textContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) return imgMatch[1];
    }

    return undefined;
  }
}

// HTML parser for sites that return HTML instead of XML
class HTMLParser {
  static parse(text: string, url: string): { items: NewsItem[], source: NewsSource } | null {
    try {
      const parser = new DOMParser();
      const html = parser.parseFromString(text, 'text/html');

      if (!html.documentElement) {
        return null;
      }

      const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
      const category = getFeedCategory(url);
      const items: NewsItem[] = [];

      // Look for common article/post selectors
      const selectors = ['.post', '.entry', '.article', '.news-item', '[class*="post"]', '[class*="entry"]'];

      for (const selector of selectors) {
        const elements = html.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach((element, i) => {
            const item = this.extractItem(element as Element, sourceName, category, i, url);
            if (item) {
              items.push(item);
            }
          });
          break; // Use first selector that finds items
        }
      }

      return {
        items,
        source: {
          name: sourceName,
          status: items.length > 0 ? 'success' : 'failed',
          url,
          category
        }
      };
    } catch (error) {
      console.error('HTML parsing failed:', error);
      return null;
    }
  }

  private static extractItem(element: Element, sourceName: string, category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'Propaganda', index: number, baseUrl: string): NewsItem | null {
    const titleSelectors = ['h1', 'h2', 'h3', '.title', '[class*="title"]'];
    const linkSelectors = ['a', '[href]'];
    const contentSelectors = ['p', '.content', '.summary', '[class*="content"]'];

    let title = '';
    let link = '';
    let summary = '';

    // Find title
    for (const selector of titleSelectors) {
      const el = element.querySelector(selector);
      if (el?.textContent?.trim()) {
        title = RSSParser.cleanText(el.textContent);
        break;
      }
    }

    // Find link
    for (const selector of linkSelectors) {
      const el = element.querySelector(selector);
      if (el) {
        link = el.getAttribute('href') || '';
        if (link && !link.startsWith('http')) {
          try {
            link = new URL(link, baseUrl).href;
          } catch {
            // Invalid URL, skip
          }
        }
        break;
      }
    }

    // Find content
    for (const selector of contentSelectors) {
      const el = element.querySelector(selector);
      if (el?.textContent?.trim()) {
        summary = el.textContent.trim().replace(/<[^>]*>/g, '').substring(0, 300);
        break;
      }
    }

    if (!title || !link) return null;

    return {
      id: `${sourceName}-${index}-${Date.now()}`,
      title: title.substring(0, 300),
      summary,
      date: 'Recent',
      url: link,
      source: sourceName,
      category,
      imageUrl: this.extractImage(element)
    };
  }

  private static extractImage(element: Element): string | undefined {
    const img = element.querySelector('img');
    return img?.getAttribute('src') || undefined;
  }
}

async function fetchSingleFeed(url: string): Promise<FeedResult> {
  // Check cache first
  const cached = feedCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
    const category = getFeedCategory(url);
    return {
      success: true,
      items: cached.data,
      source: { name: sourceName, status: 'success', url, category }
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}&cache=true`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();

    // Use the multi-format parser
    const result = RSSParser.parseFeed(text, url);

    if (!result) {
      const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
      const category = getFeedCategory(url);
      return {
        success: false,
        items: [],
        source: { name: sourceName, status: 'failed', url, category, error: 'Failed to parse feed content' }
      };
    }

    // Cache the results
    if (result.items.length > 0) {
      feedCache.set(url, { data: result.items, timestamp: Date.now() });
    }

    return {
      success: result.source.status === 'success',
      items: result.items,
      source: result.source
    };
  } catch (error) {
    const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
    const category = getFeedCategory(url);
    let errorMessage = 'Unknown error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout (15s)';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - feed unavailable';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS policy blocks feed access';
      } else {
        errorMessage = error.message.substring(0, 100);
      }
    }

    console.warn(`Feed fetch failed for ${sourceName}: ${errorMessage}`);

    return {
      success: false,
      items: [],
      source: { name: sourceName, status: 'failed', url, category, error: errorMessage }
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
          sourcesInfo.push(result.value.source);
        }
        sourcesInfo.push(result.value.source);
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