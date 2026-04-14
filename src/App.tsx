/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

import {
  Plane,
  Newspaper,
  Calculator,
  Activity,
  User,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Minus,
  Square,
  Settings,
  Cpu,
  Database,
  Globe,
  Clock,
  LayoutGrid,
  List,
  MessageSquare,
  Camera,
  Send,
  Users,
  Image as ImageIcon,
  FolderOpen,
  UserPlus,
  Check,
  MoreHorizontal,
  Share2,
  Bell,
  Filter,
  ArrowUp,
  ArrowDown,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Navigation,
  MapPin,
  Droplets,
  Thermometer,
  LogOut
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- Types ---

interface Photo {
  id: string;
  url: string;
  registration: string;
  airline: string;
  aircraftType: string;
  date: string;
  isFavorite: boolean;
  hashtags?: string[];
  isVideo?: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  source: string;
}

interface NewsSource {
  name: string;
  status: 'working' | 'failed';
}

interface Story {
  id: string;
  username: string;
  avatar: string;
  imageUrl: string;
  isUnread: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
}

interface Chat {
  id: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: Message[];
}

interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline';
  bio: string;
}

interface FriendRequest {
  id: string;
  username: string;
  avatar: string;
  time: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  wind: number;
  visibility: number;
  humidity: number;
  pressure: number;
  aqi: number;
  city: string;
  icon: string;
  description: string;
}

interface ProfileData {
  displayName: string;
  bio: string;
  homeAirport: string;
  favoriteAirline: string;
  equipment: string;
  isPrivate: boolean;
}

const MOCK_FACTS = [
  "The world's oldest airline is KLM, established in 1919.",
  "The Boeing 747 is made up of six million parts.",
];

const RSS_URLS = [
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
];

const POLITICAL_RSS_URLS = [
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
  'https://www.cbc.ca/webfeed/rss/rss-politics',
  'https://www.cbc.ca/webfeed/rss/rss-canada',
  'https://www.cbc.ca/webfeed/rss/rss-world',
  'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news',
  'https://www.the961.com/feed/',
  'https://rss.politico.com/politics-news.xml',
  'https://apnews.com/politics.rss',
  'https://www.bbc.com/news/politics',
  'https://www.bloomberg.com/politics',
  'https://www.nbcnews.com/politics',
  'https://edition.cnn.com/politics',
  'https://www.axios.com/politics-policy/',
  'https://www.theatlantic.com/politics/',
  'https://time.com/section/politics/',
  'https://www.politicshome.com/news/rss',
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
  'https://ria.ru/export/rss2/index.xml?page_type=google_newsstand',
  'https://notesfrompoland.com/feed/'
];

// --- Components ---

const SkyDropModal = ({ isOpen, onClose, nearbyUsers, isScanning }: { isOpen: boolean, onClose: () => void, nearbyUsers: Friend[], isScanning: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="w-full max-w-md aero-container p-8 flex flex-col items-center gap-8 relative overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="aero-gloss-overlay" />
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black italic glossy-text uppercase tracking-tighter">SkyDrop</h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Nearby Aviators</p>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Radar Rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border border-red-500/30 rounded-full"
                initial={{ width: 0, height: 0, opacity: 0.5 }}
                animate={{ width: '100%', height: '100%', opacity: 0 }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: i * 1,
                  ease: "easeOut" 
                }}
              />
            ))}
            
            <div className="relative z-10 w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.5)] border-2 border-white/20">
              <Plane className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
            </div>

            {/* Nearby User Bubbles */}
            {!isScanning && nearbyUsers.map((user, i) => (
              <motion.button
                key={user.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: Math.cos((i * 120) * (Math.PI / 180)) * 100,
                  y: Math.sin((i * 120) * (Math.PI / 180)) * 100
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  alert(`Profile shared with ${user.username}!`);
                  onClose();
                }}
                className="absolute z-20 flex flex-col items-center gap-1 group"
              >
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-red-500 to-black shadow-xl">
                  <img src={user.avatar} alt={`${user.username} avatar`} className="w-full h-full rounded-full object-cover border-2 border-white/10" />
                </div>
                <span className="text-[10px] font-black text-white/80 group-hover:text-red-500 transition-colors">{user.username}</span>
              </motion.button>
            ))}
          </div>

          {isScanning ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-red-500 rounded-full"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Scanning...</span>
            </div>
          ) : (
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Tap an aviator to share profile</p>
          )}

          <AeroButton variant="black" className="w-full" onClick={onClose}>Cancel</AeroButton>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PhotoCard = React.memo(({ photo, onClick, toggleFavorite }: { photo: Photo, onClick: () => void, toggleFavorite: (id: string) => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="aero-card group relative overflow-hidden flex flex-col gap-3 aero-hover-lift"
    onClick={onClick}
  >
    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-inner border border-white/10 bg-black">
      {photo.isVideo ? (
        <video
          src={photo.url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
        />
      ) : (
        <img
          src={photo.url}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(photo.id);
        }}
        className={cn(
          "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all active:scale-90",
          photo.isFavorite 
            ? "bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]" 
            : "bg-black/40 border-white/20 text-white/60 hover:text-white hover:bg-red-500/20"
        )}
      >
        <Heart className={cn("w-4 h-4", photo.isFavorite && "fill-current")} />
      </button>
    </div>
    <div className="space-y-1 px-1">
      <div className="flex justify-between items-start">
        <h4 className="font-black italic text-red-500 uppercase tracking-tighter text-lg">{photo.registration}</h4>
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{photo.date}</span>
      </div>
      <p className="text-xs font-bold text-white/80 truncate">{photo.airline}</p>
      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold truncate">{photo.aircraftType}</p>
    </div>
  </motion.div>
));

const GlassCard = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("aero-container p-6 aero-hover-lift", className)} {...props}>
    {children}
  </div>
);

const AeroButton = ({ 
  children, 
  variant = 'red', 
  onClick, 
  className,
  disabled
}: { 
  children: React.ReactNode; 
  variant?: 'red' | 'black' | 'grey'; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <motion.button 
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { 
      scale: 1.05,
      boxShadow: variant === 'red' 
        ? "0 0 20px rgba(239, 68, 68, 0.4)" 
        : "0 0 20px rgba(255, 255, 255, 0.1)"
    } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    className={cn(
      variant === 'red' ? 'aero-button-red' : 
      variant === 'black' ? 'aero-button-black' : 'aero-button-grey',
      "aero-shimmer-btn relative overflow-hidden",
      disabled && "opacity-50 cursor-not-allowed grayscale",
      className
    )}
  >
    <div className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </div>
    {!disabled && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    )}
  </motion.button>
);

const WeatherModal = ({ isOpen, onClose, t, lang }: { isOpen: boolean, onClose: () => void, t: any, lang: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F' | 'K'>('C');
  const [visUnit, setVisUnit] = useState<'km' | 'miles'>('km');
  const apiKey = "1e3e8f230b6064d27976e41163a82b77";

  const fetchWeather = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${lang === 'arz' ? 'ar' : lang}`);
      const data = await response.json();
      
      if (data.cod !== 200) throw new Error(data.message);

      const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`);
      const aqiData = await aqiResponse.json();

      setWeatherData({
        temp: data.main.temp,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        wind: data.wind.speed,
        visibility: data.visibility,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        aqi: aqiData.list[0].main.aqi,
        city: data.name,
        icon: data.weather[0].icon
      });
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchByLocation = () => {
    setError(null);
    navigator.geolocation.getCurrentPosition(async (position) => {
      setLoading(true);
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=${lang === 'arz' ? 'ar' : lang}`);
        const data = await response.json();
        
        if (data.cod !== 200) throw new Error(data.message);

        const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
        const aqiData = await aqiResponse.json();

        setWeatherData({
          temp: data.main.temp,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          wind: data.wind.speed,
          visibility: data.visibility,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          aqi: aqiData.list[0].main.aqi,
          city: data.name,
          icon: data.weather[0].icon
        });
      } catch (err: any) {
        console.error("Error fetching by location:", err);
        setError(err.message);
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isOpen && !weatherData) {
      fetchByLocation();
    }
  }, [isOpen]);

  const convertTemp = (temp: number) => {
    if (unit === 'F') return (temp * 9/5) + 32;
    if (unit === 'K') return temp + 273.15;
    return temp;
  };

  const convertVis = (vis: number) => {
    if (visUnit === 'miles') return vis * 0.000621371;
    return vis / 1000;
  };

  const getAQIDescription = (aqi: number) => {
    const keys = ['aqiGood', 'aqiFair', 'aqiModerate', 'aqiPoor', 'aqiVeryPoor'];
    return t[keys[aqi - 1]] || "Unknown";
  };

  const getWeatherIcon = (condition: string) => {
    const safeCondition = condition?.toLowerCase() || '';
    switch (safeCondition) {
      case 'clear': return <Sun className="w-12 h-12 text-yellow-400" />;
      case 'clouds': return <Cloud className="w-12 h-12 text-gray-400" />;
      case 'rain':
      case 'drizzle': return <CloudRain className="w-12 h-12 text-blue-400" />;
      default: return <Globe className="w-12 h-12 text-red-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg aero-glass overflow-hidden rounded-[2rem] shadow-2xl border border-white/20"
          >
            <div className="aero-card-highlight" />
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic glossy-text uppercase tracking-tighter flex items-center gap-2">
                  <Globe className="w-6 h-6 text-red-500" />
                  {t.weatherDetails}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchWeather(searchQuery)}
                    placeholder={t.searchCity}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <AeroButton onClick={() => fetchWeather(searchQuery)} className="px-4 py-2">
                  <Search className="w-4 h-4" />
                </AeroButton>
                <AeroButton onClick={fetchByLocation} className="px-4 py-2">
                  <Navigation className="w-4 h-4" />
                </AeroButton>
              </div>

              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-widest">{t.processing}</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                      {error}
                    </div>
                  )}
                  {weatherData ? (
                    <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {weatherData.city}
                      </p>
                      <h3 className="text-5xl font-black italic">
                        {convertTemp(weatherData.temp).toFixed(1)}°{unit}
                      </h3>
                      <p className="text-sm font-bold text-red-500 uppercase tracking-widest">{weatherData.description}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {getWeatherIcon(weatherData.condition)}
                      <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        {(['C', 'F', 'K'] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => setUnit(u)}
                            className={cn(
                              "px-2 py-1 text-[10px] font-bold rounded transition-colors",
                              unit === u ? "bg-red-500 text-white" : "text-white/40 hover:text-white"
                            )}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Wind className="w-3 h-3 text-red-500" /> {t.windSpeed}
                      </p>
                      <p className="text-lg font-black italic">{weatherData.wind} m/s</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Droplets className="w-3 h-3 text-red-500" /> {t.humidity}
                      </p>
                      <p className="text-lg font-black italic">{weatherData.humidity}%</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3 text-red-500" /> {t.pressure}
                      </p>
                      <p className="text-lg font-black italic">{weatherData.pressure} hPa</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Eye className="w-3 h-3 text-red-500" /> {t.visibility}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black italic">{convertVis(weatherData.visibility).toFixed(1)} {visUnit}</p>
                        <button 
                          onClick={() => setVisUnit(visUnit === 'km' ? 'miles' : 'km')}
                          className="text-[8px] font-bold text-red-500 hover:underline"
                        >
                          {visUnit === 'km' ? 'MILES' : 'KM'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500/20 to-transparent p-4 rounded-2xl border border-red-500/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.aqi}</p>
                        <p className="text-lg font-black italic text-red-500">{getAQIDescription(weatherData.aqi)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">API KEY</p>
                        <p className="text-[8px] font-mono text-white/40">{apiKey.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-white/20">
                  <Globe className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">{t.searchCity}</p>
                </div>
              )}
            </>
          )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (username: string) => void }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? '/api/signup' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(username);
        onClose();
      } else {
        setError(data.message || data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md aero-container p-8 flex flex-col gap-6 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="aero-gloss-overlay" />

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black italic glossy-text uppercase tracking-tighter">
                {isSignup ? 'Join AviationSort' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                {isSignup ? 'Create your account' : 'Sign in to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="aero-input w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="aero-input w-full"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <AeroButton
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
              </AeroButton>
            </form>

            <div className="text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-xs text-white/60 hover:text-red-500 transition-colors uppercase tracking-widest font-bold"
              >
                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            <AeroButton variant="black" className="w-full" onClick={onClose}>
              Cancel
            </AeroButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "News",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetry",
    profile: "Profile",
    welcome: "Welcome, Spotter",
    welcomeSub: "Your all-in-one aviation management suite. Track your collection, stay updated with news, and perform complex calculations.",
    photoCollection: "Photo Collection",
    photoAlbum: "Photo Album",
    weather: "Weather",
    friendsOnline: "Friends Online",
    reelsSub: "Algorithm-driven aviation feed",
    adjustAlgorithm: "Adjust Algorithm",
    addHashtag: "Add hashtag...",
    noReels: "No Reels Found",
    noReelsSub: "Try adjusting your algorithm hashtags to find more content.",
    aviationNews: "Aviation News",
    readFull: "Read Full Article",
    newsCredit: "News provided by Simple Flying, Sam Chui, AeroRoutes, and Aero-News Network.",
    calcTitle: "Aviation Scientific v2.0",
    show: "Show",
    scientificTools: "Scientific Tools",
    scientificSub: "Advanced flight planning and technical conversion utilities.",
    unitConverter: "Unit Converter",
    recentHistory: "Recent History",
    noCalculations: "No calculations yet",
    telemetryRealtime: "Real-time Telemetry",
    cpuLoad: "CPU Load",
    memoryUsage: "Memory Usage",
    process: "Process",
    status: "Status",
    memory: "Memory",
    favorites: "Favorites",
    noFlexPics: "No FlexPics Yet",
    noFlexPicsSub: "Start favoriting photos in your album to build your elite collection.",
    goToAlbum: "Go to Album",
    mySnap: "My Snap",
    messages: "Messages",
    friendsLabel: "Friends",
    online: "Online",
    homeAirport: "Home Airport",
    favoriteAirline: "Favorite Airline",
    equipment: "Equipment",
    privacySettings: "Privacy Settings",
    privateProfile: "Private Profile",
    privacySub: "Hide your online status and bio from others in SkyChat.",
    statusHidden: "Status Hidden",
    statusVisible: "Status Visible",
    bioLocked: "Bio Locked",
    bioPublic: "Bio Public",
    friendRequests: "Friend Requests",
    pending: "Pending",
    accept: "Accept",
    reject: "Reject",
    noPending: "No pending requests",
    total: "Total",
    source: "Source",
    ready: "Ready",
    parsing: "PARSING COLLECTION...",
    selectFolder: "Select Folder",
    selectFolderSub: "Select a local folder to parse aviation photos using the standard naming convention.",
    search: "Search collection...",
    addFolder: "Add Folder",
    indexingHangar: "Indexing Hangar",
    processing: "Processing",
    complete: "Complete",
    aviationPreferences: "Aviation Preferences",
    local: "Local",
    utc: "UTC",
    aeroTime: "AeroTime Precision",
    globalStandard: "Global Aviation Standard",
    input: "Input Value",
    output: "Output Result",
    friends: "Friends",
    requests: "Requests",
    offline: "Offline",
    private: "Private Profile",
    personalInfo: "Personal Info",
    bio: "Bio",
    location: "Location",
    displayName: "Display Name",
    shareProfile: "Share Profile",
    skydrop: "SkyDrop",
    saveProfile: "Save Profile",
    saving: "Saving...",
    memberSince: "Member since",
    scanToAdd: "Scan to Add",
    knots: "Knots",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Feet",
    meters: "Meters",
    sortByDate: "Date",
    sortByReg: "Registration",
    sortByAirline: "Airline",
    running: "Running",
    idle: "Idle",
    listening: "Listening",
    searchCity: "Search city...",
    humidity: "Humidity",
    pressure: "Pressure",
    aqi: "Air Quality",
    visibility: "Visibility",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "miles",
    useLocation: "Use My Location",
    weatherDetails: "Weather Details",
    windSpeed: "Wind Speed",
    matching: "Matching",
    matchFound: "Match Found!",
    noMoreMatches: "No more matches",
    keepSwiping: "Keep swiping to find more friends",
    aqiGood: "Good",
    aqiFair: "Fair",
    aqiModerate: "Moderate",
    aqiPoor: "Poor",
    aqiVeryPoor: "Very Poor",
    clock: "Clock",
    articlesPerPage: "Articles per page",
    swipeFriends: "Swipe to find friends or like-minded people",
    startChat: "Start Chat",
    hangarDoors: "Please do not close the hangar doors...",
    shareProfileTitle: "Share Profile",
    scanToConnect: "Scan to connect on SkyChat",
    copyLink: "Copy Profile Link",
    close: "Close",
    date: "Date",
    locationLabel: "Location",
    resetRadar: "Reset Radar",
    worldNews: "World News",
    loadingSources: "Loading Sources",
    fetchingLatest: "Fetching latest world news...",
    articlesLoaded: "articles loaded from sources",
    rssEnglishOnly: "RSS feeds are only available in English"
  },
  fr: {
    dashboard: "Tableau de bord",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Actualités",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Télémétrie",
    profile: "Profil",
    welcome: "Bienvenue, Spotter",
    welcomeSub: "Votre suite de gestion aéronautique tout-en-un. Suivez votre collection, restez informé des actualités et effectuez des calculs complexes.",
    photoCollection: "Collection de photos",
    photoAlbum: "Album Photo",
    weather: "Météo",
    friendsOnline: "Amis en ligne",
    reelsSub: "Flux d'aviation piloté par algorithme",
    adjustAlgorithm: "Ajuster l'algorithme",
    addHashtag: "Ajouter un hashtag...",
    noReels: "Aucun Reel trouvé",
    noReelsSub: "Essayez d'ajuster vos hashtags d'algorithme pour trouver plus de contenu.",
    aviationNews: "Actualités Aéronautiques",
    readFull: "Lire l'article complet",
    newsCredit: "Actualités fournies par Simple Flying, Sam Chui, AeroRoutes et Aero-News Network.",
    calcTitle: "Scientifique Aéronautique v2.0",
    show: "Afficher",
    scientificTools: "Outils Scientifiques",
    scientificSub: "Utilitaires avancés de planification de vol et de conversion technique.",
    unitConverter: "Convertisseur d'unités",
    recentHistory: "Historique Récent",
    noCalculations: "Pas encore de calculs",
    telemetryRealtime: "Télémétrie en temps réel",
    cpuLoad: "Charge CPU",
    memoryUsage: "Utilisation de la mémoire",
    process: "Processus",
    status: "Statut",
    memory: "Mémoire",
    favorites: "Favoris",
    noFlexPics: "Pas encore de FlexPics",
    noFlexPicsSub: "Commencez à mettre des photos en favoris dans votre album pour construire votre collection d'élite.",
    goToAlbum: "Aller à l'album",
    mySnap: "Mon Snap",
    messages: "Messages",
    friendsLabel: "Amis",
    online: "En ligne",
    homeAirport: "Aéroport de base",
    favoriteAirline: "Compagnie aérienne préférée",
    equipment: "Équipement",
    privacySettings: "Paramètres de confidentialité",
    privateProfile: "Profil privé",
    privacySub: "Masquez votre statut en ligne et votre bio des autres dans SkyChat.",
    statusHidden: "Statut masqué",
    statusVisible: "Statut visible",
    bioLocked: "Bio verrouillée",
    bioPublic: "Bio publique",
    friendRequests: "Demandes d'amis",
    pending: "En attente",
    accept: "Accepter",
    reject: "Refuser",
    noPending: "Aucune demande en attente",
    total: "Total",
    source: "Source",
    ready: "Prêt",
    parsing: "ANALYSE DE LA COLLECTION...",
    selectFolder: "Sélectionner un dossier",
    selectFolderSub: "Sélectionnez un dossier local pour analyser les photos d'aviation en utilisant la convention de nommage standard.",
    search: "Rechercher dans la collection...",
    addFolder: "Ajouter un dossier",
    indexingHangar: "Hangar d'indexation",
    processing: "Traitement",
    complete: "Terminé",
    aviationPreferences: "Préférences aéronautiques",
    local: "Local",
    utc: "UTC",
    aeroTime: "Précision AeroTime",
    globalStandard: "Standard aéronautique mondial",
    input: "Valeur d'entrée",
    output: "Résultat de sortie",
    friends: "Amis",
    requests: "Demandes",
    offline: "Hors ligne",
    private: "Profil privé",
    personalInfo: "Infos personnelles",
    bio: "Biographie",
    location: "Localisation",
    displayName: "Nom d'affichage",
    shareProfile: "Partager le profil",
    skydrop: "SkyDrop",
    saveProfile: "Enregistrer le profil",
    saving: "Enregistrement...",
    memberSince: "Membre depuis",
    scanToAdd: "Scanner pour ajouter",
    knots: "Nœuds",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Pieds",
    meters: "Mètres",
    sortByDate: "Date",
    sortByReg: "Immatriculation",
    sortByAirline: "Compagnie",
    running: "En cours",
    idle: "Inactif",
    listening: "À l'écoute",
    searchCity: "Rechercher une ville...",
    humidity: "Humidité",
    pressure: "Pression",
    aqi: "Qualité de l'air",
    visibility: "Visibilité",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "milles",
    useLocation: "Ma position",
    weatherDetails: "Détails météo",
    windSpeed: "Vitesse du vent",
    matching: "Matching",
    matchFound: "Match trouvé !",
    noMoreMatches: "Plus de matchs",
    aqiGood: "Bonne",
    aqiFair: "Acceptable",
    aqiModerate: "Moyenne",
    aqiPoor: "Médiocre",
    aqiVeryPoor: "Très mauvaise",
    clock: "Horloge",
    articlesPerPage: "Articles par page",
    swipeFriends: "Swiper pour trouver des amis",
    startChat: "Démarrer le chat",
    hangarDoors: "Veuillez ne pas fermer les portes du hangar...",
    shareProfileTitle: "Partager le profil",
    scanToConnect: "Scannez pour vous connecter sur SkyChat",
    copyLink: "Copier le lien du profil",
    close: "Fermer",
    date: "Date",
    locationLabel: "Emplacement",
    resetRadar: "Réinitialiser le radar",
    worldNews: "Actualités Politiques",
    loadingSources: "Chargement des sources",
    fetchingLatest: "Récupération des dernières actualités...",
    articlesLoaded: "articles chargés depuis les sources",
    rssEnglishOnly: "Les flux RSS sont uniquement disponibles en anglais"
  },
  nl: {
    dashboard: "Dashboard",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Nieuws",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetrie",
    profile: "Profiel",
    welcome: "Welkom, Spotter",
    welcomeSub: "Uw alles-in-één luchtvaartbeheersuite. Volg uw collectie, blijf op de hoogte van nieuws en voer complexe berekeningen uit.",
    photoCollection: "Fotocollectie",
    photoAlbum: "Fotoalbum",
    weather: "Weer",
    friendsOnline: "Vrienden online",
    reelsSub: "Algoritme-gestuurde luchtvaartfeed",
    adjustAlgorithm: "Algoritme aanpassen",
    addHashtag: "Hashtag toevoegen...",
    noReels: "Geen Reels gevonden",
    noReelsSub: "Probeer uw algoritme-hashtags aan te passen om meer inhoud te vinden.",
    aviationNews: "Luchtvaartnieuws",
    readFull: "Lees het volledige artikel",
    newsCredit: "Nieuws geleverd door Simple Flying, Sam Chui, AeroRoutes en Aero-News Network.",
    calcTitle: "Luchtvaart Wetenschappelijk v2.0",
    show: "Tonen",
    scientificTools: "Wetenschappelijke Hulpmiddelen",
    scientificSub: "Geavanceerde vluchtplanning en technische conversiehulpmiddelen.",
    unitConverter: "Eenhedenomzetter",
    recentHistory: "Recente Geschiedenis",
    noCalculations: "Nog geen berekeningen",
    telemetryRealtime: "Real-time Telemetrie",
    cpuLoad: "CPU-belasting",
    memoryUsage: "Geheugengebruik",
    process: "Proces",
    status: "Status",
    memory: "Geheugen",
    favorites: "Favorieten",
    noFlexPics: "Nog geen FlexPics",
    noFlexPicsSub: "Begin met het markeren van foto's in uw album als favoriet om uw elite-collectie op te bouwen.",
    goToAlbum: "Ga naar album",
    mySnap: "Mijn Snap",
    messages: "Berichten",
    friendsLabel: "Vrienden",
    online: "Online",
    homeAirport: "Thuisbasis Luchthaven",
    favoriteAirline: "Favoriete Luchtvaartmaatschappij",
    equipment: "Uitrusting",
    privacySettings: "Privacyinstellingen",
    privateProfile: "Privéprofiel",
    privacySub: "Verberg uw online status en bio voor anderen in SkyChat.",
    statusHidden: "Status verborgen",
    statusVisible: "Status zichtbaar",
    bioLocked: "Bio vergrendeld",
    bioPublic: "Bio openbaar",
    friendRequests: "Vriendschapsverzoeken",
    pending: "In afwachting",
    accept: "Accepteren",
    reject: "Weigeren",
    noPending: "Geen openstaande verzoeken",
    total: "Totaal",
    source: "Bron",
    ready: "Gereed",
    parsing: "COLLECTIE INDEXEREN...",
    selectFolder: "Map selecteren",
    selectFolderSub: "Selecteer een lokale map om luchtvaartfoto's te indexeren met de standaard naamgevingsconventie.",
    search: "Collectie doorzoeken...",
    addFolder: "Map toevoegen",
    indexingHangar: "Indexeringshangar",
    processing: "Verwerken",
    complete: "Voltooid",
    aviationPreferences: "Luchtvaartvoorkeuren",
    local: "Lokaal",
    utc: "UTC",
    aeroTime: "AeroTime Precisie",
    globalStandard: "Wereldwijde luchtvaartstandaard",
    input: "Invoerwaarde",
    output: "Uitvoerresultaat",
    friends: "Vrienden",
    requests: "Verzoeken",
    offline: "Offline",
    private: "Privéprofiel",
    personalInfo: "Persoonlijke info",
    bio: "Bio",
    location: "Locatie",
    displayName: "Weergavenaam",
    shareProfile: "Profiel delen",
    skydrop: "SkyDrop",
    saveProfile: "Profiel opslaan",
    saving: "Opslaan...",
    memberSince: "Lid sinds",
    scanToAdd: "Scannen om toe te voegen",
    knots: "Knopen",
    kmh: "Km/u",
    mph: "Mph",
    feet: "Voet",
    meters: "Meter",
    sortByDate: "Datum",
    sortByReg: "Registratie",
    sortByAirline: "Luchtvaartmaatschappij",
    running: "Actief",
    idle: "Inactief",
    listening: "Luisteren",
    searchCity: "Zoek stad...",
    humidity: "Luchtvochtigheid",
    pressure: "Druk",
    aqi: "Luchtkwaliteit",
    visibility: "Zichtbaarheid",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "mijl",
    useLocation: "Gebruik mijn locatie",
    weatherDetails: "Weerdetails",
    windSpeed: "Windsnelheid",
    matching: "Matching",
    matchFound: "Match gevonden!",
    noMoreMatches: "Geen matches meer",
    aqiGood: "Goed",
    aqiFair: "Redelijk",
    aqiModerate: "Matig",
    aqiPoor: "Slecht",
    aqiVeryPoor: "Zeer slecht",
    clock: "Klok",
    articlesPerPage: "Artikelen per pagina",
    swipeFriends: "Swipe om vrienden te vinden",
    startChat: "Chat starten",
    hangarDoors: "Sluit de hangardeuren niet...",
    shareProfileTitle: "Profiel delen",
    scanToConnect: "Scan om verbinding te maken op SkyChat",
    copyLink: "Profielkoppeling kopiëren",
    close: "Sluiten",
    date: "Datum",
    locationLabel: "Locatie",
    resetRadar: "Radar resetten"
  },
  arz: {
    dashboard: "Dashboard",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Akhbar",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetry",
    profile: "Profile",
    welcome: "Ahlan, Spotter",
    welcomeSub: "Majmoo3at e3dadat el-tayar el-kamla. Taba3 majmoo3tak, khallik mtabe3 el-akhbar, w e3mel hesabatak.",
    photoCollection: "Majmoo3at el-suwar",
    photoAlbum: "Album el-suwar",
    weather: "El-jaw",
    friendsOnline: "As7ab Online",
    reelsSub: "Khulaset el-tayar bel-khawarezmiya",
    adjustAlgorithm: "E3del el-khawarezmiya",
    addHashtag: "Def hashtag...",
    noReels: "Mafeesh Reels",
    noReelsSub: "Jarreb e3del el-hashtags 3ashan tela2i mo7tawa aktar.",
    aviationNews: "Akhbar el-tayar",
    readFull: "E2ra el-maqal kamel",
    newsCredit: "Akhbar men Simple Flying, Sam Chui, AeroRoutes, w Aero-News Network.",
    calcTitle: "El-7asba el-3elmiya v2.0",
    show: "Ard",
    scientificTools: "Adawat 3elmiya",
    scientificSub: "Adawat takhtit el-tayar w el-ta7wil el-fanni.",
    unitConverter: "Mo7awel el-we7dat",
    recentHistory: "El-tareekh el-2areeb",
    noCalculations: "Mafeesh 7asbat",
    telemetryRealtime: "Telemetry fawriya",
    cpuLoad: "7eml el-CPU",
    memoryUsage: "Estekhdam el-zakira",
    process: "3amaliya",
    status: "El-7ala",
    memory: "Zakira",
    favorites: "El-mofaddala",
    noFlexPics: "Mafeesh FlexPics",
    noFlexPicsSub: "Ebda2 7ott suwar fel-mofaddala 3ashan tebni majmoo3tak.",
    goToAlbum: "Ro7 lel-album",
    mySnap: "Snap bta3i",
    messages: "Rasa2el",
    friendsLabel: "As7ab",
    online: "Online",
    homeAirport: "Matar el-bet",
    favoriteAirline: "Sherket el-tayar el-mofaddala",
    equipment: "Mo3eddat",
    privacySettings: "E3dadat el-khosoosiya",
    privateProfile: "Profile khass",
    privacySub: "Khabbey 7altak w el-bio bta3tak 3an el-nas fel-SkyChat.",
    statusHidden: "El-7ala makhfeya",
    statusVisible: "El-7ala bayna",
    bioLocked: "El-bio ma2fool",
    bioPublic: "El-bio 3amm",
    friendRequests: "Talabat sadaqa",
    pending: "Mustanni",
    accept: "Muwafeq",
    reject: "Rafd",
    noPending: "Mafeesh talabat",
    total: "El-majmoo3",
    source: "El-masdar",
    ready: "Jahiz",
    parsing: "JARI EL-BA7TH...",
    selectFolder: "Ekhtar Folder",
    selectFolderSub: "Ekhtar folder ma7alli la-tahlil suwar el-tayarat.",
    search: "Ba7th...",
    addFolder: "Add Folder",
    indexingHangar: "Indexing Hangar",
    processing: "Processing",
    complete: "Khalas",
    aviationPreferences: "Tafdilat el-tayar",
    local: "Ma7alli",
    utc: "UTC",
    aeroTime: "De2at AeroTime",
    globalStandard: "El-me3yar el-alami",
    input: "Input",
    output: "Output",
    friends: "As7ab",
    requests: "Talabat",
    offline: "Offline",
    private: "Profile Khass",
    personalInfo: "Ma3loomat Shakhsiya",
    bio: "Bio",
    location: "Makan",
    displayName: "Esm el-ard",
    shareProfile: "Share Profile",
    skydrop: "SkyDrop",
    saveProfile: "Save Profile",
    saving: "Saving...",
    memberSince: "Member men",
    scanToAdd: "Scan la-tadeef",
    searchCity: "Dawwar 3ala madina...",
    humidity: "Rotouba",
    pressure: "Daght",
    aqi: "Jawda el-hawa",
    visibility: "Ro2ya",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "meel",
    useLocation: "Estakhdem makani",
    weatherDetails: "Tafaseel el-jaw",
    windSpeed: "Sor3et el-reye7",
    matching: "Matching",
    matchFound: "La2eina match!",
    noMoreMatches: "Mafeesh matches tanya",
    aqiGood: "Kwayyes",
    aqiFair: "Ma32oul",
    aqiModerate: "Motawasset",
    aqiPoor: "Wehesh",
    aqiVeryPoor: "Wehesh awi",
    clock: "Sa3a",
    articlesPerPage: "Maqalat fel-saf7a",
    swipeFriends: "E3mel swipe 3ashan tela2i as7ab",
    startChat: "Ebda2 chat",
    hangarDoors: "Ma-te2felsh bab el-hangar...",
    shareProfileTitle: "Share el-profile",
    scanToConnect: "E3mel scan 3ashan tewsal 3ala SkyChat",
    copyLink: "E3mel copy le-link el-profile",
    close: "E2fel",
    date: "Tareekh",
    locationLabel: "Makan",
    resetRadar: "Reset el-radar",
    worldNews: "Akhbar",
    loadingSources: "Ryadel el-masader",
    fetchingLatest: "Gayeb el-akhbar el-akhir...",
    articlesLoaded: "maqal mashrooh men el-masader",
    rssEnglishOnly: "el-RSS mafrood ykon English bas"
  },
  de: {
    dashboard: "Dashboard",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Nachrichten",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetrie",
    profile: "Profil",
    welcome: "Willkommen, Spotter",
    welcomeSub: "Ihre All-in-One-Luftfahrt-Management-Suite. Verfolgen Sie Ihre Sammlung, bleiben Sie über Neuigkeiten auf dem Laufenden und führen Sie komplexe Berechnungen durch.",
    photoCollection: "Fotosammlung",
    photoAlbum: "Fotoalbum",
    weather: "Wetter",
    friendsOnline: "Freunde online",
    reelsSub: "Algorithmus-gesteuerter Luftfahrt-Feed",
    adjustAlgorithm: "Algorithmus anpassen",
    addHashtag: "Hashtag hinzufügen...",
    noReels: "Keine Reels gefunden",
    noReelsSub: "Versuchen Sie, Ihre Algorithmus-Hashtags anzupassen, um mehr Inhalte zu finden.",
    aviationNews: "Luftfahrt-Nachrichten",
    readFull: "Vollständigen Artikel lesen",
    newsCredit: "Nachrichten bereitgestellt von Simple Flying, Sam Chui, AeroRoutes und Aero-News Network.",
    calcTitle: "Luftfahrt Wissenschaftlich v2.0",
    show: "Anzeigen",
    scientificTools: "Wissenschaftliche Werkzeuge",
    scientificSub: "Erweiterte Flugplanung und technische Umrechnungsdienstprogramme.",
    unitConverter: "Einheitenumrechner",
    recentHistory: "Letzte Historie",
    noCalculations: "Noch keine Berechnungen",
    telemetryRealtime: "Echtzeit-Telemetrie",
    cpuLoad: "CPU-Auslastung",
    memoryUsage: "Speichernutzung",
    process: "Prozess",
    status: "Status",
    memory: "Speicher",
    favorites: "Favoriten",
    noFlexPics: "Noch keine FlexPics",
    noFlexPicsSub: "Beginnen Sie damit, Fotos in Ihrem Album zu favorisieren, um Ihre Elite-Sammlung aufzubauen.",
    goToAlbum: "Zum Album gehen",
    mySnap: "Mein Snap",
    messages: "Nachrichten",
    friendsLabel: "Freunde",
    online: "Online",
    homeAirport: "Heimatflughafen",
    favoriteAirline: "Bevorzugte Fluggesellschaft",
    equipment: "Ausrüstung",
    privacySettings: "Privatsphäre-Einstellungen",
    privateProfile: "Privates Profil",
    privacySub: "Verbergen Sie Ihren Online-Status und Ihre Bio vor anderen in SkyChat.",
    statusHidden: "Status verborgen",
    statusVisible: "Status sichtbar",
    bioLocked: "Bio gesperrt",
    bioPublic: "Bio öffentlich",
    friendRequests: "Freundschaftsanfragen",
    pending: "Ausstehend",
    accept: "Akzeptieren",
    reject: "Ablehnen",
    noPending: "Keine ausstehenden Anfragen",
    total: "Gesamt",
    source: "Quelle",
    ready: "Bereit",
    parsing: "SAMMLUNG WIRD ANALYSIERT...",
    selectFolder: "Ordner auswählen",
    selectFolderSub: "Wählen Sie einen lokalen Ordner aus, um Luftfahrtfotos nach der Standard-Namenskonvention zu analysieren.",
    search: "Sammlung durchsuchen...",
    addFolder: "Ordner hinzufügen",
    indexingHangar: "Indizierungshangar",
    processing: "Verarbeitung",
    complete: "Abgeschlossen",
    aviationPreferences: "Luftfahrt-Präferenzen",
    local: "Lokal",
    utc: "UTC",
    aeroTime: "AeroTime Präzision",
    globalStandard: "Globaler Luftfahrtstandard",
    input: "Eingabewert",
    output: "Ausgabeergebnis",
    friends: "Freunde",
    requests: "Anfragen",
    offline: "Offline",
    private: "Privates Profil",
    personalInfo: "Persönliche Infos",
    bio: "Bio",
    location: "Standort",
    displayName: "Anzeigename",
    shareProfile: "Profil teilen",
    skydrop: "SkyDrop",
    saveProfile: "Profil speichern",
    saving: "Speichern...",
    memberSince: "Mitglied seit",
    scanToAdd: "Zum Hinzufügen scannen",
    searchCity: "Stadt suchen...",
    humidity: "Luftfeuchtigkeit",
    pressure: "Luftdruck",
    aqi: "Luftqualität",
    visibility: "Sichtweite",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "Meilen",
    useLocation: "Meinen Standort verwenden",
    weatherDetails: "Wetterdetails",
    windSpeed: "Windgeschwindigkeit",
    matching: "Matching",
    matchFound: "Match gefunden!",
    noMoreMatches: "Keine weiteren Matches",
    keepSwiping: "Wischen Sie weiter, um mehr Freunde zu finden",
    aqiGood: "Gut",
    aqiFair: "Mäßig",
    aqiModerate: "Mittel",
    aqiPoor: "Schlecht",
    aqiVeryPoor: "Sehr schlecht",
    clock: "Uhr",
    articlesPerPage: "Artikel pro Seite",
    swipeFriends: "Wischen Sie, um Freunde zu finden",
    startChat: "Chat starten",
    hangarDoors: "Bitte schließen Sie die Hangartüren nicht...",
    shareProfileTitle: "Profil teilen",
    scanToConnect: "Scannen, um sich auf SkyChat zu verbinden",
    copyLink: "Profillink kopieren",
    close: "Schließen",
    date: "Datum",
    locationLabel: "Ort",
    resetRadar: "Radar zurücksetzen",
    worldNews: "Weltnachrichten",
    loadingSources: "Quellen werden geladen",
    fetchingLatest: "Neueste Nachrichten werden abgerufen...",
    articlesLoaded: "Artikel aus Quellen geladen",
    rssEnglishOnly: "RSS-Feeds sind nur auf Englisch verfügbar"
  },
  it: {
    dashboard: "Dashboard",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Notizie",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Profilo",
    welcome: "Benvenuto, Spotter",
    welcomeSub: "La tua suite completa per la gestione dell'aviazione. Segui la tua collezione, resta aggiornato sulle notizie ed esegui calcoli complessi.",
    photoCollection: "Collezione Foto",
    photoAlbum: "Album Foto",
    weather: "Meteo",
    friendsOnline: "Amici Online",
    reelsSub: "Feed aeronautico guidato dall'algoritmo",
    adjustAlgorithm: "Regola Algoritmo",
    addHashtag: "Aggiungi hashtag...",
    noReels: "Nessun Reel Trovato",
    noReelsSub: "Prova a regolare i tuoi hashtag dell'algoritmo per trovare più contenuti.",
    aviationNews: "Notizie Aviazione",
    readFull: "Leggi l'Articolo Completo",
    newsCredit: "Notizie fornite da Simple Flying, Sam Chui, AeroRoutes e Aero-News Network.",
    calcTitle: "Scientifico Aeronautico v2.0",
    show: "Mostra",
    scientificTools: "Strumenti Scientifici",
    scientificSub: "Utilità avanzate di pianificazione del volo e conversione tecnica.",
    unitConverter: "Convertitore di Unità",
    recentHistory: "Cronologia Recente",
    noCalculations: "Ancora nessun calcolo",
    telemetryRealtime: "Telemetria in tempo reale",
    cpuLoad: "Carico CPU",
    memoryUsage: "Utilizzo Memoria",
    process: "Processo",
    status: "Stato",
    memory: "Memoria",
    favorites: "Preferiti",
    noFlexPics: "Ancora nessun FlexPics",
    noFlexPicsSub: "Inizia a mettere le foto nei preferiti del tuo album per costruire la tua collezione d'élite.",
    goToAlbum: "Vai all'album",
    mySnap: "Il mio Snap",
    messages: "Messaggi",
    friendsLabel: "Amici",
    online: "Online",
    homeAirport: "Aeroporto di Base",
    favoriteAirline: "Compagnia Aerea Preferita",
    equipment: "Equipaggiamento",
    privacySettings: "Impostazioni Privacy",
    privateProfile: "Profilo Privato",
    privacySub: "Nascondi il tuo stato online e la tua bio dagli altri in SkyChat.",
    statusHidden: "Stato Nascosto",
    statusVisible: "Stato Visibile",
    bioLocked: "Bio Bloccata",
    bioPublic: "Bio Pubblica",
    friendRequests: "Richieste di Amicizia",
    pending: "In attesa",
    accept: "Accetta",
    reject: "Rifiuta",
    noPending: "Nessuna richiesta in attesa",
    total: "Totale",
    source: "Fonte",
    ready: "Pronto",
    parsing: "ANALISI COLLEZIONE...",
    selectFolder: "Seleziona Cartella",
    selectFolderSub: "Seleziona una cartella locale per analizzare le foto di aviazione usando la convenzione di denominazione standard.",
    search: "Cerca nella collezione...",
    addFolder: "Aggiungi Cartella",
    indexingHangar: "Hangar di Indicizzazione",
    processing: "Elaborazione",
    complete: "Completato",
    aviationPreferences: "Preferenze Aviazione",
    local: "Locale",
    utc: "UTC",
    aeroTime: "Precisione AeroTime",
    globalStandard: "Standard Aeronautico Globale",
    input: "Valore Input",
    output: "Risultato Output",
    friends: "Amici",
    requests: "Richieste",
    offline: "Offline",
    private: "Profilo Privato",
    personalInfo: "Info Personali",
    bio: "Bio",
    location: "Posizione",
    displayName: "Nome Visualizzato",
    shareProfile: "Condividi Profilo",
    skydrop: "SkyDrop",
    saveProfile: "Salva Profilo",
    saving: "Salvataggio...",
    memberSince: "Membro dal",
    scanToAdd: "Scansiona per Aggiungere",
    searchCity: "Cerca città...",
    humidity: "Umidità",
    pressure: "Pressione",
    aqi: "Qualità dell'aria",
    visibility: "Visibilità",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "miglia",
    useLocation: "Usa la mia posizione",
    weatherDetails: "Dettagli meteo",
    windSpeed: "Velocità del vento",
    matching: "Matching",
    matchFound: "Match trovato!",
    noMoreMatches: "Nessun altro match",
    keepSwiping: "Continua a scorrere per trovare altri amici",
    aqiGood: "Buona",
    aqiFair: "Discreta",
    aqiModerate: "Moderata",
    aqiPoor: "Scarsa",
    aqiVeryPoor: "Molto scarsa",
    clock: "Orologio",
    articlesPerPage: "Articoli per pagina",
    swipeFriends: "Scorri per trovare amici",
    startChat: "Inizia chat",
    hangarDoors: "Per favore non chiudere le porte dell'hangar...",
    shareProfileTitle: "Condividi profilo",
    scanToConnect: "Scansiona per connetterti su SkyChat",
    copyLink: "Copia link profilo",
    close: "Chiudi",
    date: "Data",
    locationLabel: "Posizione",
    resetRadar: "Ripristina radar"
  },
  el: {
    dashboard: "Πίνακας Ελέγχου",
    album: "Άλμπουμ",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Νέα",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Τηλεμετρία",
    profile: "Προφίλ",
    welcome: "Καλώς ήρθες, Spotter",
    welcomeSub: "Η ολοκληρωμένη σου σουίτα διαχείρισης αεροπορίας. Παρακολούθησε τη συλλογή σου, μείνε ενημερωμένος με τα νέα και κάνε σύνθετους υπολογισμούς.",
    photoCollection: "Συλλογή Φωτογραφιών",
    photoAlbum: "Άλμπουμ Φωτογραφιών",
    weather: "Καιρός",
    friendsOnline: "Φίλοι Online",
    reelsSub: "Ροή αεροπορίας βάσει αλγορίθμου",
    adjustAlgorithm: "Προσαρμογή Αλγορίθμου",
    addHashtag: "Προσθήκη hashtag...",
    noReels: "Δεν βρέθηκαν Reels",
    noReelsSub: "Δοκιμάστε να προσαρμόσετε τα hashtags του αλγορίθμου σας για να βρείτε περισσότερο περιεχόμενο.",
    aviationNews: "Αεροπορικά Νέα",
    readFull: "Διαβάστε το πλήρες άρθρο",
    newsCredit: "Τα νέα παρέχονται από τα Simple Flying, Sam Chui, AeroRoutes και Aero-News Network.",
    calcTitle: "Αεροπορικό Επιστημονικό v2.0",
    show: "Εμφάνιση",
    scientificTools: "Επιστημονικά Εργαλεία",
    scientificSub: "Προηγμένος σχεδιασμός πτήσεων και τεχνικά βοηθήματα μετατροπής.",
    unitConverter: "Μετατροπέας Μονάδων",
    recentHistory: "Πρόσφατο Ιστορικό",
    noCalculations: "Δεν υπάρχουν ακόμα υπολογισμοί",
    telemetryRealtime: "Τηλεμετρία σε πραγματικό χρόνο",
    cpuLoad: "Φορτίο CPU",
    memoryUsage: "Χρήση Μνήμης",
    process: "Διεργασία",
    status: "Κατάσταση",
    memory: "Μνήμη",
    favorites: "Αγαπημένα",
    noFlexPics: "Δεν υπάρχουν ακόμα FlexPics",
    noFlexPicsSub: "Ξεκινήστε να προσθέτετε φωτογραφίες στα αγαπημένα σας για να δημιουργήσετε την ελίτ συλλογή σας.",
    goToAlbum: "Μετάβαση στο Άλμπουμ",
    mySnap: "Το Snap μου",
    messages: "Μηνύματα",
    friendsLabel: "Φίλοι",
    online: "Σε σύνδεση",
    homeAirport: "Αεροδρόμιο Βάσης",
    favoriteAirline: "Αγαπημένη Αεροπορική Εταιρεία",
    equipment: "Εξοπλισμός",
    privacySettings: "Ρυθμίσεις Απορρήτου",
    privateProfile: "Ιδιωτικό Προφίλ",
    privacySub: "Αποκρύψτε την κατάσταση σύνδεσης και το βιογραφικό σας από άλλους στο SkyChat.",
    statusHidden: "Κατάσταση Κρυφή",
    statusVisible: "Κατάσταση Ορατή",
    bioLocked: "Βιογραφικό Κλειδωμένο",
    bioPublic: "Βιογραφικό Δημόσιο",
    friendRequests: "Αιτήματα Φιλίας",
    pending: "Σε εκκρεμότητα",
    accept: "Αποδοχή",
    reject: "Απόρριψη",
    noPending: "Δεν υπάρχουν εκκρεμή αιτήματα",
    total: "Σύνολο",
    source: "Πηγή",
    ready: "Έτοιμο",
    parsing: "ΑΝΑΛΥΣΗ ΣΥΛΛΟΓΗΣ...",
    selectFolder: "Επιλογή Φακέλου",
    selectFolderSub: "Επίλεξε έναν τοπικό φάκελο για την ανάλυση αεροπορικών φωτογραφιών χρησιμοποιώντας την τυπική σύμβαση ονομασίας.",
    search: "Αναζήτηση στη συλλογή...",
    addFolder: "Προσθήκη Φακέλου",
    indexingHangar: "Υπόστεγο Ευρετηρίασης",
    processing: "Επεξεργασία",
    complete: "Ολοκληρώθηκε",
    aviationPreferences: "Προτιμήσεις Αεροπορίας",
    local: "Τοπική",
    utc: "UTC",
    aeroTime: "Ακρίβεια AeroTime",
    globalStandard: "Παγκόσμιο Αεροπορικό Πρότυπο",
    input: "Τιμή Εισόδου",
    output: "Αποτέλεσμα Εξόδου",
    friends: "Φίλοι",
    requests: "Αιτήματα",
    offline: "Εκτός σύνδεσης",
    private: "Ιδιωτικό Προφίλ",
    personalInfo: "Προσωπικές Πληροφορίες",
    bio: "Βιογραφικό",
    location: "Τοποθεσία",
    displayName: "Όνομα Εμφάνισης",
    shareProfile: "Κοινοποίηση Προφίλ",
    skydrop: "SkyDrop",
    saveProfile: "Αποθήκευση Προφίλ",
    saving: "Αποθήκευση...",
    memberSince: "Μέλος από",
    scanToAdd: "Σάρωση για Προσθήκη",
    searchCity: "Αναζήτηση πόλης...",
    humidity: "Υγρασία",
    pressure: "Πίεση",
    aqi: "Ποιότητα Αέρα",
    visibility: "Ορατότητα",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "μίλια",
    useLocation: "Χρήση της τοποθεσίας μου",
    weatherDetails: "Λεπτομέρειες Καιρού",
    windSpeed: "Ταχύτητα Ανέμου",
    matching: "Matching",
    matchFound: "Βρέθηκε Match!",
    noMoreMatches: "Δεν υπάρχουν άλλα matches",
    keepSwiping: "Συνεχίστε να σαρώνετε για να βρείτε περισσότερους φίλους",
    aqiGood: "Καλή",
    aqiFair: "Μέτρια",
    aqiModerate: "Μέτρια",
    aqiPoor: "Κακή",
    aqiVeryPoor: "Πολύ Κακή",
    clock: "Ρολόι",
    articlesPerPage: "Άρθρα ανά σελίδα",
    swipeFriends: "Σύρετε για να βρείτε φίλους",
    startChat: "Έναρξη συνομιλίας",
    hangarDoors: "Παρακαλώ μην κλείνετε τις πόρτες του υπόστεγου...",
    shareProfileTitle: "Κοινοποίηση προφίλ",
    scanToConnect: "Σαρώστε για να συνδεθείτε στο SkyChat",
    copyLink: "Αντιγραφή συνδέσμου προφίλ",
    close: "Κλείσιμο",
    date: "Ημερομηνία",
    locationLabel: "Τοποθεσία",
    resetRadar: "Επαναφορά ραντάρ"
  },
  ab: {
    dashboard: "Ихадаратә дашборд",
    album: "Альбом",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Ажәабжьқәа",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Телеметриа",
    profile: "Апрофиль",
    welcome: "Бзиала шәаабеит, Споттер",
    welcomeSub: "Шәара шәавиациатә менеџьменттә суита. Шәколлекциа шәашьклашәаԥш, ажәабжьқәа шәрышьклашәаԥш, иуадаҩу аԥхьаӡарақәа ҟашәҵа.",
    photoCollection: "Афотоколлекциа",
    photoAlbum: "Афотоальбом",
    weather: "Амш",
    friendsOnline: "Аҩызцәа онлаин",
    reelsSub: "Авиациатә лента алгоритмла",
    adjustAlgorithm: "Алгоритм аиҭакра",
    addHashtag: "Ахэштег ацҵара...",
    noReels: "Reels аԥшаара залымшеит",
    noReelsSub: "Шәхэштегқәа шәрышьклашәаԥш еиҳаны аматериал аԥшааразы.",
    aviationNews: "Аавиациатә ажәабжьқәα",
    readFull: "Астатиа аԥхьара",
    newsCredit: "Ажәабжьқәа рҭоуп: Simple Flying, Sam Chui, AeroRoutes, Aero-News Network.",
    calcTitle: "Аавиациатә наука v2.0",
    show: "Ахәаԥшра",
    scientificTools: "Аҭҵааратә мацурақәа",
    scientificSub: "Аԥыррақәа рпланирразы еиҳа иуадаҩу амацурақәеи атехникатә аиҭакрақәеи.",
    unitConverter: "Ахәҭақәа рыиҭакга",
    recentHistory: "Аҵыхәтәантәи аҭоурых",
    noCalculations: "Аԥхьаӡарақәа макьана иҟам",
    telemetryRealtime: "Ателеметриа онлаин",
    cpuLoad: "CPU азаҟәра",
    memoryUsage: "Агәынкылара ахархәара",
    process: "Апроцесс",
    status: "Астатус",
    memory: "Агәынкылара",
    favorites: "Иалху",
    noFlexPics: "FlexPics макьана иҟам",
    noFlexPicsSub: "Шәальбом аҟны афотоқәа иалху рыцҵара шәалагьеи шәколлекциа аиҿкааразы.",
    goToAlbum: "Альбом ахь аиасра",
    mySnap: "Сара сы-Snap",
    messages: "Ацҳамҭақәа",
    friendsLabel: "Аҩызцәа",
    online: "Онлаин",
    homeAirport: "Аҩнытәи аеропорт",
    favoriteAirline: "Иалху аавиакомпаниа",
    equipment: "Аиқәыршәара",
    privacySettings: "Аконфиденциалтә рхиарақәа",
    privateProfile: "Ахатәы профиль",
    privacySub: "Онлаин шәа статуси шәбиографиеи егьырҭ рҟынтәи иаашәх SkyChat аҟны.",
    statusHidden: "Астатус иаахоуп",
    statusVisible: "Астатус иаартуп",
    bioLocked: "Абиографиа иаркуп",
    bioPublic: "Абиографиа иаартуп",
    friendRequests: "Аҩызаратә ҳәарақәа",
    pending: "Иԥшу",
    accept: "Адара",
    reject: "Амап ацәкра",
    noPending: "Иԥшу аҳәарақәа иҟам",
    total: "Зегьы",
    source: "Ахыҵхырҭа",
    ready: "Ихиоуп",
    parsing: "АКОЛЛЕКЦИА АНАЛИЗ ИАҴОУП...",
    selectFolder: "Аԥшьы алышәх",
    selectFolderSub: "Иалышәх алокалтә ԥшьы а авиациатә фотоқәа рыхәаԥшразы.",
    search: "Аколлекциа аҟны аԥшаара...",
    addFolder: "Аԥшьы ацҵара",
    indexingHangar: "Аиндексациатә ангар",
    processing: "Апроцесс иаҵоуп",
    complete: "Ихиоуп",
    aviationPreferences: "Аавиациатә рхиарақәа",
    local: "Алокалтә",
    utc: "UTC",
    aeroTime: "AeroTime аиашара",
    globalStandard: "Адунеизегьтәи авиациатә стандарт",
    input: "Алагаларатә хәы",
    output: "Алҵшәа",
    friends: "Аҩызцәа",
    requests: "Аҳәарақәа",
    offline: "Оффлаин",
    private: "Ахатәы профиль",
    personalInfo: "Ахатәы информациа",
    bio: "Абиографиа",
    location: "Аҭыԥ",
    displayName: "Ахьӡ",
    shareProfile: "Апрофиль ашара",
    skydrop: "SkyDrop",
    saveProfile: "Апрофиль аиқәырхара",
    saving: "Аиқәырхара иаҵоуп...",
    memberSince: "Алахәыла инаркны",
    scanToAdd: "Асканирра ацҵаразы",
    searchCity: "Ақалақь аԥшаара...",
    humidity: "Аҳауа аиҩыра",
    pressure: "Аҳауа азаҟәра",
    aqi: "Аҳауа арыцхә",
    visibility: "Абара",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "миль",
    useLocation: "Сара сыҭыԥ ахархәара",
    weatherDetails: "Амш ахәаԥшра",
    windSpeed: "Амш ахы",
    matching: "Matching",
    matchFound: "Аибадыра аԥшаауп!",
    noMoreMatches: "Аибадырақәа иҟам",
    keepSwiping: "Иацшәҵа аибадыра аԥшааразы",
    aqiGood: "Ибзиоуп",
    aqiFair: "Иааиуеит",
    aqiModerate: "Ибжьаратәуп",
    aqiPoor: "Ицәгьоуп",
    aqiVeryPoor: "Иуадаҩуп",
    clock: "Асааҭ",
    articlesPerPage: "Астатиақәа адаҟьаҿ",
    swipeFriends: "Ииага, аҩызцәа рацәашьаразы",
    startChat: "Аицәажәара иалаге",
    hangarDoors: "Пожалуйста, не закрывайте двери ангара...",
    shareProfileTitle: "Апрофиль аларҵәара",
    scanToConnect: "Исканируйте, чтобы подключиться в SkyChat",
    copyLink: "Апрофиль алинк акопиа азура",
    close: "Ахкра",
    date: "Арыцхә",
    locationLabel: "Аҭыӡҭыԥ",
    resetRadar: "Арадар аиҭაшьақәыргыλαра"
  },
  tr: {
    dashboard: "Panel",
    album: "Albüm",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Haberler",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetri",
    profile: "Profil",
    welcome: "Hoş Geldin, Spotter",
    welcomeSub: "Hepsi bir arada havacılık yönetim paketiniz. Koleksiyonunuzu takip edin, haberlerden haberdar olun ve karmaşık hesaplamalar yapın.",
    photoCollection: "Fotoğraf Koleksiyonu",
    photoAlbum: "Fotoğraf Albümü",
    weather: "Hava Durumu",
    friendsOnline: "Çevrimiçi Arkadaşlar",
    reelsSub: "Algoritma odaklı havacılık akışı",
    adjustAlgorithm: "Algoritmayı Düzenle",
    addHashtag: "Hashtag ekle...",
    noReels: "Reel Bulunamadı",
    noReelsSub: "Daha fazla içerik bulmak için algoritma hashtag'lerinizi düzenlemeyi deneyin.",
    aviationNews: "Havacılık Haberleri",
    readFull: "Tam Makaleyi Oku",
    newsCredit: "Haberler Simple Flying, Sam Chui, AeroRoutes ve Aero-News Network tarafından sağlanmaktadır.",
    calcTitle: "Havacılık Bilimsel v2.0",
    show: "Göster",
    scientificTools: "Bilimsel Araçlar",
    scientificSub: "Gelişmiş uçuş planlama ve teknik dönüştürme yardımcı programları.",
    unitConverter: "Birim Dönüştürücü",
    recentHistory: "Son Geçmiş",
    noCalculations: "Henüz hesaplama yok",
    telemetryRealtime: "Gerçek Zamanlı Telemetri",
    cpuLoad: "İşlemci Yükü",
    memoryUsage: "Bellek Kullanımı",
    process: "İşlem",
    status: "Durum",
    memory: "Bellek",
    favorites: "Favoriler",
    noFlexPics: "Henüz FlexPics Yok",
    noFlexPicsSub: "Seçkin koleksiyonunuzu oluşturmak için albümünüzdeki fotoğrafları favorilere eklemeye başlayın.",
    goToAlbum: "Albüme Git",
    mySnap: "Benim Snap'im",
    messages: "Mesajlar",
    friendsLabel: "Arkadaşlar",
    online: "Çevrimiçi",
    homeAirport: "Ana Havalimanı",
    favoriteAirline: "Favori Havayolu",
    equipment: "Ekipman",
    privacySettings: "Gizlilik Ayarları",
    privateProfile: "Gizli Profil",
    privacySub: "SkyChat'teki diğer kişilerden çevrimiçi durumunuzu ve biyografinizi gizleyin.",
    statusHidden: "Durum Gizli",
    statusVisible: "Durum Görünür",
    bioLocked: "Biyografi Kilitli",
    bioPublic: "Biyografi Herkese Açık",
    friendRequests: "Arkadaşlık İstekleri",
    pending: "Beklemede",
    accept: "Kabul Et",
    reject: "Reddet",
    noPending: "Bekleyen istek yok",
    total: "Toplam",
    source: "Kaynak",
    ready: "Hazır",
    parsing: "KOLEKSİYON ANALİZ EDİLİYOR...",
    selectFolder: "Klasör Seç",
    selectFolderSub: "Standart adlandırma kuralını kullanarak havacılık fotoğraflarını analiz etmek için yerel bir klasör seçin.",
    search: "Koleksiyonda ara...",
    addFolder: "Klasör Ekle",
    indexingHangar: "İndeksleme Hangarı",
    processing: "İşleniyor",
    complete: "Tamamlandı",
    aviationPreferences: "Havacılık Tercihleri",
    local: "Yerel",
    utc: "UTC",
    aeroTime: "AeroTime Hassasiyeti",
    globalStandard: "Küresel Havacılık Standardı",
    input: "Giriş Değeri",
    output: "Çıkış Sonucu",
    friends: "Arkadaşlar",
    requests: "İstekler",
    offline: "Çevrimdışı",
    private: "Özel Profil",
    personalInfo: "Kişisel Bilgiler",
    bio: "Biyografi",
    location: "Konum",
    displayName: "Görünen Ad",
    shareProfile: "Profili Paylaş",
    skydrop: "SkyDrop",
    saveProfile: "Profili Kaydet",
    saving: "Kaydediliyor...",
    memberSince: "Üyelik tarihi",
    scanToAdd: "Ekleme için Tara",
    searchCity: "Şehir ara...",
    humidity: "Nem",
    pressure: "Basınç",
    aqi: "Hava Kalitesi",
    visibility: "Görünürlük",
    celsius: "Santigrat",
    fahrenheit: "Fahrenhayt",
    kelvin: "Kelvin",
    km: "km",
    miles: "mil",
    useLocation: "Konumumu Kullan",
    weatherDetails: "Hava Durumu Detayları",
    windSpeed: "Rüzgar Hızı",
    matching: "Eşleşme",
    matchFound: "Eşleşme Bulundu!",
    noMoreMatches: "Daha fazla eşleşme yok",
    keepSwiping: "Daha fazla arkadaş bulmak için kaydırmaya devam et",
    aqiGood: "İyi",
    aqiFair: "Orta",
    aqiModerate: "Hassas",
    aqiPoor: "Kötü",
    aqiVeryPoor: "Çok Kötü",
    clock: "Saat",
    articlesPerPage: "Sayfa başına makale",
    swipeFriends: "Arkadaş bulmak için kaydır",
    startChat: "Sohbeti Başlat",
    hangarDoors: "Lütfen hangar kapılarını kapatmayın...",
    shareProfileTitle: "Profili Paylaş",
    scanToConnect: "SkyChat'te bağlanmak için tara",
    copyLink: "Profil Bağlantısını Kopyala",
    close: "Kapat",
    date: "Tarih",
    locationLabel: "Konum",
    resetRadar: "Radarı Sıfırla"
  },
  hy: {
    dashboard: "Կառավարման վահանակ",
    album: "Ալբոմ",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Լուրեր",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Տելեմետրիա",
    profile: "Պրոֆիլ",
    welcome: "Բարի գալուստ, Spotter",
    welcomeSub: "Ձեր ավիացիոն կառավարման համակարգը: Հետևեք ձեր հավաքածուին, տեղեկացված եղեք լուրերից և կատարեք բարդ հաշվարկներ:",
    photoCollection: "Լուսանկարների հավաքածու",
    photoAlbum: "Լուսանկարների ալբոմ",
    weather: "Եղանակ",
    friendsOnline: "Ընկերներ առցանց",
    reelsSub: "Ալգորիթմի վրա հիմնված ավիացիոն լրահոս",
    adjustAlgorithm: "Կարգավորել ալգորիթմը",
    addHashtag: "Ավելացնել հեշթեգ...",
    noReels: "Reels չեն գտնվել",
    noReelsSub: "Փորձեք կարգավորել ձեր ալգորիթմի հեշթեգները՝ ավելի շատ բովանդակություն գտնելու համար:",
    aviationNews: "Ավիացիոն լուրեր",
    readFull: "Կարդալ ամբողջական հոդվածը",
    newsCredit: "Լուրերը տրամադրվում են Simple Flying, Sam Chui, AeroRoutes և Aero-News Network-ի կողմից:",
    calcTitle: "Ավիացիոն գիտական v2.0",
    show: "Ցուցադրել",
    scientificTools: "Գիտական գործիքներ",
    scientificSub: "Թռիչքների պլանավորման և տեխնիկական փոխակերպման առաջադեմ կոմունալ ծառայություններ:",
    unitConverter: "Միավորների փոխարկիչ",
    recentHistory: "Վերջին պատմությունը",
    noCalculations: "Դեռևս հաշվարկներ չկան",
    telemetryRealtime: "Իրական ժամանակի տելեմետրիա",
    cpuLoad: "CPU բեռնվածություն",
    memoryUsage: "Հիշողության օգտագործում",
    process: "Գործընթաց",
    status: "Կարգավիճակ",
    memory: "Հիշողություն",
    favorites: "Ֆավորիտներ",
    noFlexPics: "Դեռևս FlexPics չկան",
    noFlexPicsSub: "Սկսեք նախընտրել լուսանկարները ձեր ալբոմում՝ ձեր էլիտար հավաքածուն ստեղծելու համար:",
    goToAlbum: "Գնալ ալբոմ",
    mySnap: "Իմ Snap-ը",
    messages: "Հաղորդագրություններ",
    friendsLabel: "Ընկերներ",
    online: "Առցանց",
    homeAirport: "Տնային օդանավակայան",
    favoriteAirline: "Սիրելի ավիաընկերություն",
    equipment: "Սարքավորումներ",
    privacySettings: "Գաղտնիության կարգավորումներ",
    privateProfile: "Մասնավոր պրոֆիլ",
    privacySub: "Թաքցրեք ձեր առցանց կարգավիճակը և կենսագրությունը ուրիշներից SkyChat-ում:",
    statusHidden: "Կարգավիճակը թաքցված է",
    statusVisible: "Կարգավիճակը տեսանելի է",
    bioLocked: "Կենսագրությունը փակ է",
    bioPublic: "Կենսագրությունը հանրային է",
    friendRequests: "Ընկերության հարցումներ",
    pending: "Սպասման մեջ",
    accept: "Ընդունել",
    reject: "Մերժել",
    noPending: "Սպասող հարցումներ չկαν",
    total: "Ընդհանուր",
    source: "Աղբյուր",
    ready: "Պատրաստ է",
    parsing: "ՀԱՎԱՔԱԾՈՒԻ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ...",
    selectFolder: "Ընտրել թղթապանակ",
    selectFolderSub: "Ընտրեք տեղական թղթապանակ ավիացիոն լուսանկարները վերլուծելու համար:",
    search: "Փնտրել հավաքածուում...",
    addFolder: "Ավելացնել թղթապանակ",
    indexingHangar: "Ինդեքսավորման հանգար",
    processing: "Մշակվում է",
    complete: "Ավարտված է",
    aviationPreferences: "Ավիացիոն նախապատվություններ",
    local: "Տեղական",
    utc: "UTC",
    aeroTime: "AeroTime ճշգրտություն",
    globalStandard: "Համաշխարհային ավիացիոն ստանդարտ",
    input: "Մուտքային արժեք",
    output: "Ելքային արդյունք",
    friends: "Ընկերներ",
    requests: "Հարցումներ",
    offline: "Անցանց",
    private: "Մասնավոր պրոֆիլ",
    personalInfo: "Անձնական տվյալներ",
    bio: "Կենսագրություն",
    location: "Գտնվելու վայրը",
    displayName: "Ցուցադրվող անուն",
    shareProfile: "Կիսվել պրոֆիլով",
    skydrop: "SkyDrop",
    saveProfile: "Պահպանել պրոֆիլը",
    saving: "Պահպանվում է...",
    memberSince: "Անդամ սկսած",
    scanToAdd: "Սկանավորել ավելացնելու համար",
    searchCity: "Փնտրել քաղաք...",
    humidity: "Խոնավություն",
    pressure: "Ճնշում",
    aqi: "Օդի որակ",
    visibility: "Տեսանելիություն",
    celsius: "Ցելսիուս",
    fahrenheit: "Ֆարենհայտ",
    kelvin: "Կելվին",
    km: "կմ",
    miles: "մղոն",
    useLocation: "Օգտագործել իմ գտնվելու վայրը",
    weatherDetails: "Եղանակի մանրամասները",
    windSpeed: "Քամու արագություն",
    matching: "Համապատասխանություն",
    matchFound: "Համընկնում է գտնվել:",
    noMoreMatches: "Այլևս համընկնումներ չկαν",
    keepSwiping: "Շարունակեք սահեցնել ավելի շատ ընկերներ գտնելու համար",
    aqiGood: "Լավ",
    aqiFair: "Բավարար",
    aqiModerate: "Միջին",
    aqiPoor: "Վատ",
    aqiVeryPoor: "Շատ վատ",
    clock: "Ժամացույց",
    articlesPerPage: "Հոդվածներ մեկ էջում",
    swipeFriends: "Սահեցրեք ընկերներ գտնելու համար",
    startChat: "Սկսել զրույցը",
    hangarDoors: "Խնդրում ենք չփակել հանգարի դռները...",
    shareProfileTitle: "Կիսվել պրոֆիլով",
    scanToConnect: "Սկանավորեք SkyChat-ում միանալու համար",
    copyLink: "Պատճենել պրոֆիლის հղումը",
    close: "Փակել",
    date: "Ամսաթիվ",
    locationLabel: "Գտնվելու վայրը",
    resetRadar: "Վերակայել ռադարը"
  },
  hu: {
    dashboard: "Vezérlőpult",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Hírek",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Profil",
    welcome: "Üdvözöljük, Spotter",
    welcomeSub: "Az Ön minden-az-egyben repülési menedzsment csomagja. Kövesse gyűjteményét, értesüljön a hírekről és végezzen komplex számításokat.",
    photoCollection: "Fotógyűjtemény",
    photoAlbum: "Fotóalbum",
    weather: "Időjárás",
    friendsOnline: "Barátok online",
    reelsSub: "Algoritmus-alapú repülési hírfolyam",
    adjustAlgorithm: "Algoritmus beállítása",
    addHashtag: "Hashtag hozzáadása...",
    noReels: "Nem találhatók Reels",
    noReelsSub: "Próbálja meg módosítani az algoritmus hashtagjeit több tartalomért.",
    aviationNews: "Repülési hírek",
    readFull: "Teljes cikk elolvasása",
    newsCredit: "Hírek forrása: Simple Flying, Sam Chui, AeroRoutes és Aero-News Network.",
    calcTitle: "Repülési tudományos v2.0",
    show: "Mutat",
    scientificTools: "Tudományos Eszközök",
    scientificSub: "Fejlett repüléstervezési és műszaki átváltási segédprogramok.",
    unitConverter: "Mértékegység-átváltó",
    recentHistory: "Legutóbbi Előzmények",
    noCalculations: "Még nincsenek számítások",
    telemetryRealtime: "Valós idejű Telemetria",
    cpuLoad: "CPU terhelés",
    memoryUsage: "Memóriahasználat",
    process: "Folyamat",
    status: "Állapot",
    memory: "Memória",
    favorites: "Kedvencek",
    noFlexPics: "Még nincsenek FlexPics képek",
    noFlexPicsSub: "Kezdje el kedvencnek jelölni a fotókat az albumában, hogy felépítse elit gyűjteményét.",
    goToAlbum: "Ugrás az albumhoz",
    mySnap: "Saját Snap",
    messages: "Üzenetek",
    friendsLabel: "Barátok",
    online: "Online",
    homeAirport: "Bázisrepülőtér",
    favoriteAirline: "Kedvenc Légitársaság",
    equipment: "Felszerelés",
    privacySettings: "Adatvédelmi Beállítások",
    privateProfile: "Privát Profil",
    privacySub: "Rejtse el online állapotát és életrajzát mások elől a SkyChatben.",
    statusHidden: "Állapot Rejtett",
    statusVisible: "Állapot Látható",
    bioLocked: "Életrajz Zárolva",
    bioPublic: "Életrajz Nyilvános",
    friendRequests: "Barátfelkérések",
    pending: "Függőben",
    accept: "Elfogadás",
    reject: "Elutasítás",
    noPending: "Nincsenek függőben lévő felkérések",
    total: "Összesen",
    source: "Forrás",
    ready: "Kész",
    parsing: "GYŰJTEMÉNY ELEMZÉSE...",
    selectFolder: "Mappa kiválasztása",
    selectFolderSub: "Válasszon egy helyi mappát a repülési fotók elemzéséhez a szabványos elnevezési konvenció szerint.",
    search: "Keresés a gyűjteményben...",
    addFolder: "Mappa hozzáadása",
    indexingHangar: "Indexelő hangár",
    processing: "Feldolgozás",
    complete: "Kész",
    aviationPreferences: "Repülési preferenciák",
    local: "Helyi",
    utc: "UTC",
    aeroTime: "AeroTime precizitás",
    globalStandard: "Globális repülési szabvány",
    input: "Bemeneti érték",
    output: "Kimeneti eredmény",
    friends: "Barátok",
    requests: "Kérések",
    offline: "Offline",
    private: "Privát profil",
    personalInfo: "Személyes infó",
    bio: "Bio",
    location: "Helyszín",
    displayName: "Megjelenített név",
    shareProfile: "Profil megosztása",
    skydrop: "SkyDrop",
    saveProfile: "Profil mentése",
    saving: "Mentés...",
    memberSince: "Tag ekkortól",
    scanToAdd: "Beolvasás a hozzáadáshoz",
    searchCity: "Város keresése...",
    humidity: "Páratartalom",
    pressure: "Légnyomás",
    aqi: "Légszennyezettség",
    visibility: "Látótávolság",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "mérföld",
    useLocation: "Saját helyzet használata",
    weatherDetails: "Időjárás részletei",
    windSpeed: "Szélsebesség",
    matching: "Párosítás",
    matchFound: "Találat!",
    noMoreMatches: "Nincs több találat",
    keepSwiping: "Folytassa a böngészést több barátért",
    aqiGood: "Jó",
    aqiFair: "Megfelelő",
    aqiModerate: "Közepes",
    aqiPoor: "Rossz",
    aqiVeryPoor: "Nagyon rossz",
    clock: "Óra",
    articlesPerPage: "Cikkek oldalanként",
    swipeFriends: "Húzza el barátok kereséséhez",
    startChat: "Csevegés indítása",
    hangarDoors: "Kérjük, ne zárja be a hangár ajtóit...",
    shareProfileTitle: "Profil megosztása",
    scanToConnect: "Beolvasás a SkyChat-hez való csatlakozáshoz",
    copyLink: "Profil link másolása",
    close: "Bezárás",
    date: "Dátum",
    locationLabel: "Helyszín",
    resetRadar: "Radar alaphelyzetbe állítása"
  },
  lv: {
    dashboard: "Informācijas panelis",
    album: "Albums",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Ziņas",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetrija",
    profile: "Profils",
    welcome: "Laipni lūdzam, Spotter",
    welcomeSub: "Jūsu viss-vienā aviācijas pārvaldības komplekts. Sekojiet savai kolekcijai, saņemiet jaunākās ziņas un veiciet sarežģītus aprēķinus.",
    photoCollection: "Foto kolekcija",
    photoAlbum: "Fotoalbums",
    weather: "Laikapstākļi",
    friendsOnline: "Draugi tiešsaistē",
    reelsSub: "Algoritma vadīta aviācijas plūsma",
    adjustAlgorithm: "Pielāgot algoritmu",
    addHashtag: "Pievienot tēmturi...",
    noReels: "Reels nav atrasti",
    noReelsSub: "Mēģiniet pielāgot algoritma tēmturus, lai atrastu vairāk satura.",
    aviationNews: "Aviācijas ziņas",
    readFull: "Lasīt pilnu rakstu",
    newsCredit: "Ziņas nodrošina Simple Flying, Sam Chui, AeroRoutes un Aero-News Network.",
    calcTitle: "Aviācijas zinātniskais v2.0",
    show: "Rādīt",
    scientificTools: "Zinātniskie rīki",
    scientificSub: "Uzlabota lidojumu plānošana un tehniskās konvertēšanas utilītas.",
    unitConverter: "Vienību pārveidotājs",
    recentHistory: "Nesenā vēsture",
    noCalculations: "Vēl nav aprēķinu",
    telemetryRealtime: "Reāllaika telemetrija",
    cpuLoad: "CPU slodze",
    memoryUsage: "Atmiņas lietojums",
    process: "Process",
    status: "Statuss",
    memory: "Atmiņa",
    favorites: "Izlase",
    noFlexPics: "Vēl nav FlexPics",
    noFlexPicsSub: "Sāciet pievienot fotoattēlus izlasei savā albumā, lai izveidotu savu elites kolekciju.",
    goToAlbum: "Doties uz albumu",
    mySnap: "Mans Snap",
    messages: "Ziņojumi",
    friendsLabel: "Draugi",
    online: "Tiešsaistē",
    homeAirport: "Mājas lidosta",
    favoriteAirline: "Iecienītākā aviokompānija",
    equipment: "Aprīkojums",
    privacySettings: "Privātuma iestatījumi",
    privateProfile: "Privāts profils",
    privacySub: "Paslēpiet savu tiešsaistes statusu un biogrāfiju no citiem SkyChat.",
    statusHidden: "Statuss paslēpts",
    statusVisible: "Statuss redzams",
    bioLocked: "Bio bloķēts",
    bioPublic: "Bio publisks",
    friendRequests: "Draugu pieprasījumi",
    pending: "Gaida",
    accept: "Apstiprināt",
    reject: "Noraidīt",
    noPending: "Nav gaidošu pieprasījumu",
    total: "Kopā",
    source: "Avots",
    ready: "Gatavs",
    parsing: "KOLEKCIJAS ANALĪZE...",
    selectFolder: "Izvēlēties mapi",
    selectFolderSub: "Izvēlieties vietējo mapi, lai analizētu aviācijas fotoattēlus, izmantojot standarta nosaukumu piešķiršanas konvenciju.",
    search: "Meklēt kolekcijā...",
    addFolder: "Pievienot mapi",
    indexingHangar: "Indeksēšanas angārs",
    processing: "Apstrāde",
    complete: "Pabeigts",
    aviationPreferences: "Aviācijas preferences",
    local: "Vietējais",
    utc: "UTC",
    aeroTime: "AeroTime precizitāte",
    globalStandard: "Globālais aviācijas standarts",
    input: "Ievades vērtība",
    output: "Izvades rezultāts",
    friends: "Draugi",
    requests: "Pieprasījumi",
    offline: "Bezsaistē",
    private: "Privāts profils",
    personalInfo: "Personīgā informācija",
    bio: "Bio",
    location: "Atrašanās vieta",
    displayName: "Redzamais vārds",
    shareProfile: "Kopīgot profilu",
    skydrop: "SkyDrop",
    saveProfile: "Saglabāt profilu",
    saving: "Saglabā...",
    memberSince: "Biedrs kopš",
    scanToAdd: "Skenēt, lai pievienotu",
    searchCity: "Meklēt pilsētu...",
    humidity: "Mitrums",
    pressure: "Spiediens",
    aqi: "Gaisa kvalitāte",
    visibility: "Redzamība",
    celsius: "Celsijs",
    fahrenheit: "Fārenheits",
    kelvin: "Kelvins",
    km: "km",
    miles: "jūdzes",
    useLocation: "Izmantot manu atrašanās vietu",
    weatherDetails: "Laikapstākļu informācija",
    windSpeed: "Vēja ātrums",
    matching: "Atbilstība",
    matchFound: "Atrasta atbilstība!",
    noMoreMatches: "Vairāk atbilstību nav",
    keepSwiping: "Turpiniet meklēt, lai atrastu vairāk draugu",
    aqiGood: "Laba",
    aqiFair: "Vidēja",
    aqiModerate: "Mērena",
    aqiPoor: "Slikta",
    aqiVeryPoor: "Ļoti slikta",
    clock: "Pulkstenis",
    articlesPerPage: "Raksti lapā",
    swipeFriends: "Velciet, lai atrastu draugus",
    startChat: "Sākt tērzēšanu",
    hangarDoors: "Lūdzu, neaizveriet angāra durvis...",
    shareProfileTitle: "Kopīgot profilu",
    scanToConnect: "Skenējiet, lai izveidotu savienojumu SkyChat",
    copyLink: "Kopēt profila saiti",
    close: "Aizvērt",
    date: "Datums",
    locationLabel: "Atrašanās vieta",
    resetRadar: "Atiestatīt radaru"
  },
  iu: {
    dashboard: "ᐊᐅᓚᑦᑎᔾᔪᑎ",
    album: "ᐊᔾᔨᙳᐊᑦ",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "ᑐᓴᒐᒃᓴᑦ",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "ᖃᓄᐃᓕᖓᓂᖅ",
    welcome: "ᑐᙵᓱᒋᑦ, Spotter",
    welcomeSub: "ᖃᖓᑕᓲᓕᕆᓂᕐᒧᑦ ᐊᐅᓚᑦᑎᔾᔪᑎᑎᑦ. ᖃᐅᔨᓴᕐᓗᒋᑦ ᐊᔾᔨᖁᑎᑎᑦ, ᑐᓴᒐᒃᓴᓂᒃ ᖃᐅᔨᒪᓗᑎᑦ, ᐊᒻᒪ ᓈᓴᐅᓯᕆᓗᑎᑦ.",
    photoCollection: "ᐊᔾᔨᙳᐊᑦ ᑲᑎᖅᓱᖅᑕᐅᓯᒪᔪᑦ",
    photoAlbum: "ᐊᔾᔨᙳᐊᑦ ᑲᑎᖅᓱᖅᑕᐅᔪᑦ",
    weather: "ᓯᓚ",
    friendsOnline: "ᐃᓚᓐᓇᕆᔭᑦ ᖃᕆᑕᐅᔭᒃᑯᑦ",
    reelsSub: "ᖃᖓᑕᓲᓕᕆᓂᕐᒧᑦ ᑐᓴᒐᒃᓴᑦ",
    adjustAlgorithm: "ᖃᐅᔨᓴᕐᓂᖅ ᐋᖅᑭᒋᐊᕐᓗᒍ",
    addHashtag: "Hashtag ᐃᓚᓗᒍ...",
    noReels: "Reels ᐱᑕᖃᙱᑦᑐᖅ",
    noReelsSub: "Hashtag-ᑎᑦ ᐋᖅᑭᒋᐊᕐᓗᒋᑦ ᕿᓂᒃᑲᓐᓂᕐᓂᐊᕐᓗᑎᑦ.",
    aviationNews: "ᖃᖓᑕᓲᓕᕆᓂᕐᒧᑦ ᑐᓴᒐᒃᓴᑦ",
    readFull: "ᑐᓴᒐᒃᓴᖅ ᐅᖃᓕᒫᕐᓗᒍ",
    newsCredit: "ᑐᓴᒐᒃᓴᑦ ᐅᕙᙵᑦ Simple Flying, Sam Chui, AeroRoutes, ᐊᒻᒪ Aero-News Network.",
    calcTitle: "ᖃᖓᑕᓲᓕᕆᓂᕐᒧᑦ ᓈᓴᐅᓯᕆᔾᔪᑎ v2.0",
    show: "ᑕᑯᒃᓴᐅᑎᓪᓗᒍ",
    scientificTools: "ᖃᐅᔨᓴᕐᓂᕐᒧᑦ ᐊᑐᖅᑕᐅᕙᒃᑐᑦ",
    scientificSub: "ᖃᖓᑕᓂᕐᒧᑦ ᐸᕐᓇᐃᓂᖅ ᐊᒻᒪ ᖃᐅᔨᓴᕐᓂᖅ.",
    unitConverter: "ᓈᓴᐅᓯᕆᔾᔪᑎ",
    recentHistory: "ᖃᐅᔨᓴᖅᑕᐅᓵᖅᑐᑦ",
    noCalculations: "ᓈᓴᐅᓯᕆᓯᒪᔪᖃᙱᑦᑐᖅ",
    telemetryRealtime: "ᖃᐅᔨᓴᖅᑕᐅᔪᑦ ᒫᓐᓇ",
    cpuLoad: "CPU ᐊᑐᖅᑕᐅᓂᖓ",
    memoryUsage: "Memory ᐊᑐᖅᑕᐅᓂᖓ",
    process: "ᐱᓕᕆᐊᖅ",
    status: "ᖃᓄᐃᓕᖓᓂᖓ",
    memory: "Memory",
    favorites: "ᐱᐅᒋᔭᑦ",
    noFlexPics: "FlexPics ᐱᑕᖃᙱᑦᑐᖅ",
    noFlexPicsSub: "ᐊᔾᔨᙳᐊᓂᒃ ᓂᕈᐊᕐᓗᑎᑦ ᑲᑎᖅᓱᐃᓂᐊᕐᓗᑎᑦ.",
    goToAlbum: "ᐊᔾᔨᙳᐊᓄᑦ ᐊᐃᓗᑎᑦ",
    mySnap: "Snap-ᒐ",
    messages: "ᑐᓴᒐᒃᓴᑦ",
    friendsLabel: "ᐃᓚᓐᓇᕆᔭᑦ",
    online: "ᖃᕆᑕᐅᔭᒃᑯᑦ",
    homeAirport: "ᒥᑦᑕᕐᕕᒃ",
    favoriteAirline: "ᖃᖓᑕᓲᖅ ᐱᐅᒋᔭᖅ",
    equipment: "ᐊᑐᖅᑕᐅᕙᒃᑐᑦ",
    privacySettings: "ᖃᐅᔨᔭᐅᔭᕆᐊᖃᙱᑦᑐᑦ",
    privateProfile: "ᖃᐅᔨᔭᐅᔭᕆᐊᖃᙱᑦᑐᖅ",
    privacySub: "ᖃᕆᑕᐅᔭᒃᑯᑦ ᖃᓄᐃᓕᖓᓂᕐᓂᒃ ᖃᐅᔨᔭᐅᑎᑦᑎᙱᓪᓗᑎᑦ.",
    statusHidden: "ᖃᐅᔨᔭᐅᙱᑦᑐᖅ",
    statusVisible: "ᑕᑯᒃᓴᐅᔪᖅ",
    bioLocked: "Bio ᒪᑐᓯᒪᔪᖅ",
    bioPublic: "Bio ᑕᑯᒃᓴᐅᔪᖅ",
    friendRequests: "ᐃᓚᓐᓇᕆᔭᐅᔪᒪᔪᑦ",
    pending: "ᐅᑕᖅᑭᔪᑦ",
    accept: "ᐊᖏᕐᓗᒍ",
    reject: "ᐃᒋᓪᓗᒍ",
    noPending: "ᐅᑕᖅᑭᔪᖃᙱᑦᑐᖅ",
    total: "ᑲᑎᓪᓗᒋᑦ",
    source: "ᓇᑭᙶᕐᓂᖓ",
    ready: "ᐊᑐᐃᓐᓇᖅ",
    parsing: "ᑲᑎᖅᓱᖅᑕᐅᔪᑦ ᖃᐅᔨᓴᖅᑕᐅᔪᑦ...",
    selectFolder: "ᖃᕆᑕᐅᔭᒃᑯᑦ ᐊᔾᔨᖃᕐᕕᒃ ᓂᕈᐊᕐᓗᒍ",
    selectFolderSub: "ᖃᕆᑕᐅᔭᒃᑯᑦ ᐊᔾᔨᖃᕐᕕᒃ ᓂᕈᐊᕐᓗᒍ ᖃᖓᑕᓲᑦ ᐊᔾᔨᖏᓐᓂᒃ ᖃᐅᔨᓴᕐᓂᐊᕐᓗᑎᑦ.",
    search: "ᕿᓂᕐᓗᒋᑦ ᑲᑎᖅᓱᖅᑕᐅᓯᒪᔪᑦ...",
    addFolder: "ᐊᔾᔨᖃᕐᕕᒃ ᐃᓚᓗᒍ",
    indexingHangar: "ᖃᐅᔨᓴᕐᕕᒃ",
    processing: "ᐱᓕᕆᐊᖑᔪᖅ",
    complete: "ᐱᔭᕇᖅᑐᖅ",
    aviationPreferences: "ᖃᖓᑕᓲᓕᕆᓂᕐᒧᑦ ᓂᕈᐊᖅᑕᐅᔪᑦ",
    local: "ᓄᓇᓕᖕᓂ",
    utc: "UTC",
    aeroTime: "AeroTime ᖃᐅᔨᓴᑦᑎᐊᕐᓂᖅ",
    globalStandard: "ᓯᓚᕐᔪᐊᕐᒥ ᖃᖓᑕᓲᓕᕆᓂᕐᒧᑦ ᐊᑐᖅᑕᐅᕙᒃᑐᑦ",
    input: "ᐃᓯᖅᑐᖅ",
    output: "ᐊᓂᔪᖅ",
    friends: "ᐃᓚᓐᓇᕆᔭᑦ",
    requests: "ᑐᒃᓯᕋᐅᑎᑦ",
    offline: "ᖃᕆᑕᐅᔭᒃᑯᙱᑦᑐᖅ",
    private: "ᖃᐅᔨᔭᐅᔭᕆᐊᖃᙱᑦᑐᖅ",
    personalInfo: "ᐃᒻᒥᓄᑦ ᑐᓴᒐᒃᓴᑦ",
    bio: "Bio",
    location: "ᓇᓂᓐᓂᖓ",
    displayName: "ᐊᑎᖓ",
    shareProfile: "ᖃᓄᐃᓕᖓᓂᖓ ᐊᒥᖅᑲᐅᑎᒋᓗᒍ",
    skydrop: "SkyDrop",
    saveProfile: "ᖃᓄᐃᓕᖓᓂᖓ ᐸᐸᓪᓗᒍ",
    saving: "ᐸᐸᑦᑎᔪᖅ...",
    memberSince: "ᐃᓚᒋᔭᐅᔪᖅ ᐅᕙᙵᑦ",
    scanToAdd: "ᖃᐅᔨᓴᕐᓗᒍ ᐃᓚᓂᐊᕐᓗᒍ",
    searchCity: "ᕿᓂᕐᓗᒍ ᓄᓇᓕᒃ...",
    humidity: "Humidity",
    pressure: "Pressure",
    aqi: "Air Quality",
    visibility: "Visibility",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "miles",
    useLocation: "Use My Location",
    weatherDetails: "Weather Details",
    windSpeed: "ᐊᓄᕆ",
    matching: "Matching",
    matchFound: "Match Found!",
    noMoreMatches: "No more matches",
    keepSwiping: "Keep swiping to find more friends",
    aqiGood: "Good",
    aqiFair: "Fair",
    aqiModerate: "Moderate",
    aqiPoor: "Poor",
    aqiVeryPoor: "Very Poor",
    clock: "Clock",
    articlesPerPage: "Articles per page",
    swipeFriends: "Swipe to find friends",
    startChat: "Start Chat",
    hangarDoors: "Please do not close the hangar doors...",
    shareProfileTitle: "Share Profile",
    scanToConnect: "Scan to connect on SkyChat",
    copyLink: "Copy Profile Link",
    close: "Close",
    date: "Date",
    locationLabel: "Location",
    resetRadar: "Reset Radar"
  },
  es: {
    dashboard: "Panel de Control",
    album: "Álbum",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Noticias",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetría",
    profile: "Perfil",
    welcome: "Bienvenido, Spotter",
    welcomeSub: "Tu suite integral de gestión aeronáutica. Sigue tu colección, mantente al día con las noticias y realiza cálculos complejos.",
    photoCollection: "Colección de Fotos",
    photoAlbum: "Álbum de Fotos",
    weather: "Clima",
    friendsOnline: "Amigos en línea",
    reelsSub: "Feed de aviación impulsado por algoritmos",
    adjustAlgorithm: "Ajustar Algoritmo",
    addHashtag: "Añadir hashtag...",
    noReels: "No se encontraron Reels",
    noReelsSub: "Intenta ajustar tus hashtags de algoritmo para encontrar más contenido.",
    aviationNews: "Noticias de Aviación",
    readFull: "Leer Artículo Completo",
    newsCredit: "Noticias proporcionadas por Simple Flying, Sam Chui, AeroRoutes y Aero-News Network.",
    calcTitle: "Científico de Aviación v2.0",
    show: "Mostrar",
    scientificTools: "Herramientas Científicas",
    scientificSub: "Utilidades avanzadas de planificación de vuelo y conversión técnica.",
    unitConverter: "Convertidor de Unidades",
    recentHistory: "Historial Reciente",
    noCalculations: "Aún no hay cálculos",
    telemetryRealtime: "Telemetría en Tiempo Real",
    cpuLoad: "Carga de CPU",
    memoryUsage: "Uso de Memoria",
    process: "Proceso",
    status: "Estado",
    memory: "Memoria",
    favorites: "Favoritos",
    noFlexPics: "Aún no hay FlexPics",
    noFlexPicsSub: "Comienza a marcar fotos como favoritas en tu álbum para construir tu colección de élite.",
    goToAlbum: "Ir al Álbum",
    mySnap: "Mi Snap",
    messages: "Mensajes",
    friendsLabel: "Amigos",
    online: "En línea",
    homeAirport: "Aeropuerto Base",
    favoriteAirline: "Aerolínea Favorita",
    equipment: "Equipo",
    privacySettings: "Ajustes de Privacidad",
    privateProfile: "Perfil Privado",
    privacySub: "Oculta tu estado en línea y biografía de otros en SkyChat.",
    statusHidden: "Estado Oculto",
    statusVisible: "Estado Visible",
    bioLocked: "Bio Bloqueada",
    bioPublic: "Bio Pública",
    friendRequests: "Solicitudes de Amistad",
    pending: "Pendiente",
    accept: "Aceptar",
    reject: "Rechazar",
    noPending: "No hay solicitudes pendientes",
    total: "Total",
    source: "Fuente",
    ready: "Listo",
    parsing: "ANALIZANDO COLECCIÓN...",
    selectFolder: "Seleccionar Carpeta",
    selectFolderSub: "Selecciona una carpeta local para analizar fotos de aviación usando la convención de nomenclatura estándar.",
    search: "Buscar en la colección...",
    addFolder: "Añadir Carpeta",
    indexingHangar: "Hangar de Indexación",
    processing: "Procesando",
    complete: "Completado",
    aviationPreferences: "Preferencias de Aviación",
    local: "Local",
    utc: "UTC",
    aeroTime: "Precisión AeroTime",
    globalStandard: "Estándar Aviación Global",
    input: "Valor de Entrada",
    output: "Resultado de Salida",
    friends: "Amigos",
    requests: "Solicitudes",
    offline: "Desconectado",
    private: "Perfil Privado",
    personalInfo: "Información Personal",
    bio: "Biografía",
    location: "Ubicación",
    displayName: "Nombre a Mostrar",
    shareProfile: "Compartir Perfil",
    skydrop: "SkyDrop",
    saveProfile: "Guardar Perfil",
    saving: "Guardando...",
    memberSince: "Miembro desde",
    scanToAdd: "Escanear para Añadir",
    searchCity: "Buscar ciudad...",
    humidity: "Humedad",
    pressure: "Presión",
    aqi: "Calidad del Aire",
    visibility: "Visibilidad",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "millas",
    useLocation: "Usar mi ubicación",
    weatherDetails: "Detalles del Clima",
    windSpeed: "Velocidad del Viento",
    matching: "Matching",
    matchFound: "¡Match Encontrado!",
    noMoreMatches: "No hay más matches",
    keepSwiping: "Sigue deslizando para encontrar más amigos",
    aqiGood: "Buena",
    aqiFair: "Aceptable",
    aqiModerate: "Moderada",
    aqiPoor: "Mala",
    aqiVeryPoor: "Muy mala",
    clock: "Reloj",
    articlesPerPage: "Artículos por página",
    swipeFriends: "Desliza para encontrar amigos",
    startChat: "Iniciar Chat",
    hangarDoors: "Por favor, no cierres las puertas del hangar...",
    shareProfileTitle: "Compartir Perfil",
    scanToConnect: "Escanea para conectar en SkyChat",
    copyLink: "Copiar Enlace del Perfil",
    close: "Cerrar",
    date: "Fecha",
    locationLabel: "Ubicación",
    resetRadar: "Reiniciar Radar",
    worldNews: "Noticias del Mundo",
    loadingSources: "Cargando Fuentes",
    fetchingLatest: "Obteniendo las últimas noticias...",
    articlesLoaded: "artículos cargados de fuentes",
    rssEnglishOnly: "Los feeds RSS solo están disponibles en inglés"
  },
  pt: {
    dashboard: "Painel",
    album: "Álbum",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Notícias",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Perfil",
    welcome: "Bem-vindo, Spotter",
    welcomeSub: "Sua suíte completa de gestão aeronáutica. Acompanhe sua coleção, mantenha-se atualizado com as notícias e realize cálculos complexos.",
    photoCollection: "Coleção de Fotos",
    photoAlbum: "Álbum de Fotos",
    weather: "Clima",
    friendsOnline: "Amigos Online",
    reelsSub: "Feed de aviação impulsionado por algoritmo",
    adjustAlgorithm: "Ajustar Algoritmo",
    addHashtag: "Adicionar hashtag...",
    noReels: "Nenhum Reel Encontrado",
    noReelsSub: "Tente ajustar suas hashtags de algoritmo para encontrar mais conteúdo.",
    aviationNews: "Notícias de Aviação",
    readFull: "Ler Artigo Completo",
    newsCredit: "Notícias fornecidas por Simple Flying, Sam Chui, AeroRoutes e Aero-News Network.",
    calcTitle: "Científico de Aviação v2.0",
    show: "Mostrar",
    scientificTools: "Ferramentas Científicas",
    scientificSub: "Utilitários avançados de planejamento de voo e conversão técnica.",
    unitConverter: "Conversor de Unidades",
    recentHistory: "Histórico Recente",
    noCalculations: "Ainda não há cálculos",
    telemetryRealtime: "Telemetria em Tempo Real",
    cpuLoad: "Carga de CPU",
    memoryUsage: "Uso de Memória",
    process: "Processo",
    status: "Status",
    memory: "Memória",
    favorites: "Favoritos",
    noFlexPics: "Ainda não há FlexPics",
    noFlexPicsSub: "Comece a favoritar fotos no seu álbum para construir sua coleção de elite.",
    goToAlbum: "Ir para o Álbum",
    mySnap: "Meu Snap",
    messages: "Mensagens",
    friendsLabel: "Amigos",
    online: "Online",
    homeAirport: "Aeroporto Base",
    favoriteAirline: "Companhia Aérea Favorita",
    equipment: "Equipamento",
    privacySettings: "Configurações de Privacidade",
    privateProfile: "Perfil Privado",
    privacySub: "Oculte seu status online e bio de outras pessoas no SkyChat.",
    statusHidden: "Status Oculto",
    statusVisible: "Status Visível",
    bioLocked: "Bio Bloqueada",
    bioPublic: "Bio Pública",
    friendRequests: "Pedidos de Amizade",
    pending: "Pendente",
    accept: "Aceitar",
    reject: "Rejeitar",
    noPending: "Nenhum pedido pendente",
    total: "Total",
    source: "Fonte",
    ready: "Pronto",
    parsing: "ANALISANDO COLEÇÃO...",
    selectFolder: "Selecionar Pasta",
    selectFolderSub: "Selecione uma pasta local para analisar fotos de aviação usando a convenção de nomenclatura padrão.",
    search: "Pesquisar na coleção...",
    addFolder: "Adicionar Pasta",
    indexingHangar: "Hangar de Indexação",
    processing: "Processando",
    complete: "Concluído",
    aviationPreferences: "Preferências de Aviação",
    local: "Local",
    utc: "UTC",
    aeroTime: "Precisão AeroTime",
    globalStandard: "Padrão Global de Aviação",
    input: "Valor de Entrada",
    output: "Resultado de Saída",
    friends: "Amigos",
    requests: "Pedidos",
    offline: "Offline",
    private: "Perfil Privado",
    personalInfo: "Informações Pessoais",
    bio: "Biografia",
    location: "Localização",
    displayName: "Nome de Exibição",
    shareProfile: "Compartilhar Perfil",
    skydrop: "SkyDrop",
    saveProfile: "Salvar Perfil",
    saving: "Salvando...",
    memberSince: "Membro desde",
    scanToAdd: "Escanear para Adicionar",
    searchCity: "Buscar cidade...",
    humidity: "Umidade",
    pressure: "Pressão",
    aqi: "Qualidade do Ar",
    visibility: "Visibilidade",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "milhas",
    useLocation: "Usar minha localização",
    weatherDetails: "Detalhes do Clima",
    windSpeed: "Velocidade do Vento",
    matching: "Matching",
    matchFound: "Match Encontrado!",
    noMoreMatches: "Não há mais matches",
    keepSwiping: "Continue deslizando para encontrar mais amigos",
    aqiGood: "Boa",
    aqiFair: "Regular",
    aqiModerate: "Moderada",
    aqiPoor: "Ruim",
    aqiVeryPoor: "Muito ruim",
    clock: "Relógio",
    articlesPerPage: "Artigos por página",
    swipeFriends: "Deslize para encontrar amigos",
    startChat: "Iniciar Chat",
    hangarDoors: "Por favor, não feche as portas do hangar...",
    shareProfileTitle: "Compartilhar Perfil",
    scanToConnect: "Escanear para conectar no SkyChat",
    copyLink: "Copiar Link do Perfil",
    close: "Fechar",
    date: "Data",
    locationLabel: "Localização",
    resetRadar: "Redefinir Radar"
  },
  pl: {
    dashboard: "Panel",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Wiadomości",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Profil",
    welcome: "Witaj, Spotterze",
    welcomeSub: "Twój kompleksowy pakiet do zarządzania lotnictwem. Śledź swoją kolekcję, bądź na bieżąco z wiadomościami i wykonuj złożone obliczenia.",
    photoCollection: "Kolekcja Zdjęć",
    photoAlbum: "Album Zdjęć",
    weather: "Pogoda",
    friendsOnline: "Znajomi Online",
    reelsSub: "Kanał lotniczy sterowany algorytmem",
    adjustAlgorithm: "Dostosuj Algorytm",
    addHashtag: "Dodaj hashtag...",
    noReels: "Nie znaleziono Reels",
    noReelsSub: "Spróbuj dostosować hashtagi algorytmu, aby znaleźć więcej treści.",
    aviationNews: "Wiadomości Lotnicze",
    readFull: "Przeczytaj Pełny Artykul",
    newsCredit: "Wiadomości dostarczane przez Simple Flying, Sam Chui, AeroRoutes i Aero-News Network.",
    calcTitle: "Naukowy Lotniczy v2.0",
    show: "Pokaż",
    scientificTools: "Narzędzia Naukowe",
    scientificSub: "Zaawansowane planowanie lotów i techniczne narzędzia do konwersji.",
    unitConverter: "Konwerter Jednostek",
    recentHistory: "Ostatnia Historia",
    noCalculations: "Brak obliczeń",
    telemetryRealtime: "Telemetria w czasie rzeczywistym",
    cpuLoad: "Obciążenie CPU",
    memoryUsage: "Zużycie Pamięci",
    process: "Proces",
    status: "Status",
    memory: "Pamięć",
    favorites: "Ulubione",
    noFlexPics: "Brak FlexPics",
    noFlexPicsSub: "Zacznij dodawać zdjęcia do ulubionych w swoim albumie, aby zbudować swoją elitarną kolekcję.",
    goToAlbum: "Idź do albumu",
    mySnap: "Mój Snap",
    messages: "Wiadomości",
    friendsLabel: "Znajomi",
    online: "Online",
    homeAirport: "Lotnisko Macierzyste",
    favoriteAirline: "Ulubiona Linia Lotnicza",
    equipment: "Sprzęt",
    privacySettings: "Ustawienia Prywatności",
    privateProfile: "Profil Prywatny",
    privacySub: "Ukryj swój status online i biografię przed innymi w SkyChat.",
    statusHidden: "Status Ukryty",
    statusVisible: "Status Widoczny",
    bioLocked: "Bio Zablokowane",
    bioPublic: "Bio Publiczne",
    friendRequests: "Zaproszenia do Znajomych",
    pending: "Oczekujące",
    accept: "Akceptuj",
    reject: "Odrzuć",
    noPending: "Brak oczekujących zaproszeń",
    total: "Suma",
    source: "Źródło",
    ready: "Gotowy",
    parsing: "ANALIZOWANIE KOLEKCJI...",
    selectFolder: "Wybierz Folder",
    selectFolderSub: "Wybierz lokalny folder, aby przeanalizować zdjęcia lotnicze przy użyciu standardowej konwencji nazewnictwa.",
    search: "Szukaj w kolekcji...",
    addFolder: "Dodaj Folder",
    indexingHangar: "Hangar Indeksowania",
    processing: "Przetwarzanie",
    complete: "Zakończono",
    aviationPreferences: "Preferencje Lotnicze",
    local: "Lokalny",
    utc: "UTC",
    aeroTime: "Precyzja AeroTime",
    globalStandard: "Globalny Standard Lotniczy",
    input: "Wartość Wejściowa",
    output: "Wynik Wyjściowy",
    friends: "Znajomi",
    requests: "Zaproszenia",
    offline: "Offline",
    private: "Profil Prywatny",
    personalInfo: "Dane Osobowe",
    bio: "Bio",
    location: "Lokalizacja",
    displayName: "Nazwa Wyświetlana",
    shareProfile: "Udostępnij Profil",
    skydrop: "SkyDrop",
    saveProfile: "Zapisz Profil",
    saving: "Zapisywanie...",
    memberSince: "Członek od",
    scanToAdd: "Zeskanuj, aby Dodać",
    searchCity: "Szukaj miasta...",
    humidity: "Wilgotność",
    pressure: "Ciśnienie",
    aqi: "Jakość Powietrza",
    visibility: "Widoczność",
    celsius: "Celsjusz",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelwin",
    km: "km",
    miles: "mile",
    useLocation: "Użyj mojej lokalizacji",
    weatherDetails: "Szczegóły Pogody",
    windSpeed: "Prędkość Wiatru",
    matching: "Dopasowanie",
    matchFound: "Znaleziono Dopasowanie!",
    noMoreMatches: "Brak więcej dopasowań",
    keepSwiping: "Przesuwaj dalej, aby znaleźć więcej znajomych",
    aqiGood: "Dobra",
    aqiFair: "Umiarkowana",
    aqiModerate: "Średnia",
    aqiPoor: "Zła",
    aqiVeryPoor: "Bardzo zła"
  },
  ru: {
    dashboard: "Панель",
    album: "Альбом",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Новости",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Телеметрия",
    profile: "Профиль",
    clock: "Часы",
    welcome: "Добро пожаловать, Споттер",
    welcomeSub: "Ваш универсальный пакет управления авиацией. Отслеживайте свою коллекцию, будьте в курсе новостей и выполняйте сложные расчеты.",
    photoCollection: "Коллекция фото",
    photoAlbum: "Фотоальбом",
    weather: "Погода",
    friendsOnline: "Друзья онлайн",
    reelsSub: "Авиационная лента на основе алгоритмов",
    adjustAlgorithm: "Настроить алгоритм",
    addHashtag: "Добавить хэштег...",
    noReels: "Reels не найдены",
    noReelsSub: "Попробуйте изменить хэштеги алгоритма, чтобы найти больше контента.",
    aviationNews: "Авиационные новости",
    readFull: "Читать статью полностью",
    newsCredit: "Новости предоставлены Simple Flying, Sam Chui, AeroRoutes и Aero-News Network.",
    calcTitle: "Авиационный научный v2.0",
    show: "Показать",
    scientificTools: "Научные инструменты",
    scientificSub: "Расширенные утилиты для планирования полетов и технической конвертации.",
    recentHistory: "Недавняя история",
    noCalculations: "Расчетов пока нет",
    telemetryRealtime: "Телеметрия в реальном времени",
    cpuLoad: "Загрузка ЦП",
    memoryUsage: "Использование памяти",
    process: "Процесс",
    status: "Статус",
    memory: "Память",
    favorites: "Избранное",
    noFlexPics: "FlexPics пока нет",
    noFlexPicsSub: "Начните добавлять фото в избранное в своем альбоме, чтобы создать элитную коллекцию.",
    goToAlbum: "Перейти в альбом",
    mySnap: "Мой Snap",
    messages: "Сообщения",
    friendsLabel: "Друзья",
    online: "В сети",
    homeAirport: "Базовый аэропорт",
    favoriteAirline: "Любимая авиакомпания",
    equipment: "Оборудование",
    privacySettings: "Настройки приватности",
    privateProfile: "Приватный профиль",
    privacySub: "Скройте свой онлайн-статус и биографию от других в SkyChat.",
    statusHidden: "Статус скрыт",
    statusVisible: "Статус виден",
    bioLocked: "Биография заблокирована",
    bioPublic: "Биография публична",
    friendRequests: "Запросы в друзья",
    pending: "В ожидании",
    accept: "Принять",
    reject: "Отклонить",
    noPending: "Нет ожидающих запросов",
    total: "Всего",
    source: "Источник",
    ready: "Готово",
    parsing: "АНАЛИЗ КОЛЛЕКЦИИ...",
    selectFolder: "Выбрать папку",
    selectFolderSub: "Выберите локальную папку для анализа авиационных фотографий с использованием стандартного соглашения об именовании.",
    search: "Поиск в коллекции...",
    addFolder: "Добавить папку",
    indexingHangar: "Ангар индексации",
    processing: "Обработка",
    complete: "Завершено",
    aviationPreferences: "Авиационные предпочтения",
    local: "Локальное",
    utc: "UTC",
    aeroTime: "Точность AeroTime",
    globalStandard: "Глобальный авиационный стандарт",
    input: "Входное значение",
    output: "Результат",
    friends: "Друзья",
    requests: "Запросы",
    offline: "Вне сети",
    private: "Приватный профиль",
    personalInfo: "Личная информация",
    bio: "Биография",
    location: "Местоположение",
    displayName: "Отображаемое имя",
    shareProfile: "Поделиться профилем",
    skydrop: "SkyDrop",
    saveProfile: "Сохранить профиль",
    saving: "Сохранение...",
    memberSince: "Участник с",
    scanToAdd: "Сканировать для добавления",
    searchCity: "Поиск города...",
    humidity: "Влажность",
    pressure: "Давление",
    aqi: "Качество воздуха",
    visibility: "Видимость",
    celsius: "Цельсий",
    fahrenheit: "Фаренгейт",
    kelvin: "Кельвин",
    km: "км",
    miles: "мили",
    useLocation: "Мое местоположение",
    weatherDetails: "Детали погоды",
    windSpeed: "Скорость ветра",
    knots: "Узлы",
    kmh: "Км/ч",
    mph: "Миль/ч",
    feet: "Футы",
    meters: "Метры",
    sortByDate: "Дата",
    sortByReg: "Регистрация",
    sortByAirline: "Авиакомпания",
    running: "Запущено",
    idle: "Ожидание",
    listening: "Прослушивание",
    matching: "Матчинг",
    swipeFriends: "Листайте, чтобы найти друзей или единомышленников",
    noMoreMatches: "Больше нет подходящих профилей",
    matchFound: "Есть матч!",
    startChat: "Начать чат",
    keepSwiping: "Продолжить",
    articlesPerPage: "Статей на странице",
    aqiGood: "Хорошее",
    aqiFair: "Удовлетворительное",
    aqiModerate: "Среднее",
    aqiPoor: "Плохое",
    aqiVeryPoor: "Очень плохое",
    hangarDoors: "Пожалуйста, не закрывайте двери ангара...",
    shareProfileTitle: "Поделиться профилем",
    scanToConnect: "Сканируйте, чтобы подключиться в SkyChat",
    copyLink: "Копировать ссылку",
    close: "Закрыть",
    date: "Дата",
    locationLabel: "Местоположение",
    resetRadar: "Сбросить радар",
    worldNews: "Мировые новости",
    loadingSources: "Загрузка источников",
    fetchingLatest: "Получение последних новостей...",
    articlesLoaded: "статей загружено из источников",
    rssEnglishOnly: "RSS-ленты доступны только на английском"
  },
  mo: {
    dashboard: "Tabulu d'u bordu",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Nuvità",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Profilu",
    welcome: "Benvegnü, Spotter",
    welcomeSub: "A vostra suite de gestion de l'aviaçiun tuttu-in-ün. Seguiti a vostra coleçiun, restati infurmai d'e nuvità e fati càlculi cumplessi.",
    photoCollection: "Coleçiun de foti",
    photoAlbum: "Album de foti",
    weather: "Meteu",
    friendsOnline: "Amighi en ligna",
    reelsSub: "Flussu d'aviaçiun guidau da l'alguritmu",
    adjustAlgorithm: "Ajustà l'alguritmu",
    addHashtag: "Agiunze un hashtag...",
    noReels: "Nisciün Reel truvau",
    noReelsSub: "Pruvati d'ajustà i vostri hashtag d'alguritmu per truvà ciü cuntignü.",
    aviationNews: "Nuvità d'Aviaçiun",
    readFull: "Lese l'articulu cumpletu",
    newsCredit: "Nuvità furnie da Simple Flying, Sam Chui, AeroRoutes e Aero-News Network.",
    calcTitle: "Sçientificu d'Aviaçiun v2.0",
    show: "Mustrà",
    scientificTools: "Strumenti Sçientifici",
    scientificSub: "Utilità avançae de pianificaçiun de volu e cunversciun tècnica.",
    unitConverter: "Cunvertidù d'Unità",
    recentHistory: "Crunulugia Reçente",
    noCalculations: "Ancura nisciün càlculu",
    telemetryRealtime: "Telemetria en tempu reale",
    cpuLoad: "Càricu CPU",
    memoryUsage: "Üsu Memoria",
    process: "Pruçessu",
    status: "Statu",
    memory: "Memoria",
    favorites: "Preferiti",
    noFlexPics: "Ancura nisciün FlexPics",
    noFlexPicsSub: "Inçiati a preferì e foti d'u vostru album per custruì a vostra coleçiun d'élite.",
    goToAlbum: "Andà a l'album",
    mySnap: "U miu Snap",
    messages: "Messagi",
    friendsLabel: "Amighi",
    online: "En ligna",
    homeAirport: "Aeroportu de Base",
    favoriteAirline: "Cumpagnia Aerea Preferita",
    equipment: "Equipagiamentu",
    privacySettings: "Impostassiun de Privacy",
    privateProfile: "Profilu Privau",
    privacySub: "Mascari u vostru statu en ligna e a vostra bio da i autri en SkyChat.",
    statusHidden: "Statu Mascarau",
    statusVisible: "Statu Visibile",
    bioLocked: "Bio Serrada",
    bioPublic: "Bio Pùblica",
    friendRequests: "Dumande d'Amighi",
    pending: "En speta",
    accept: "Açetà",
    reject: "Refüdà",
    noPending: "Nisciüna dumanda en speta",
    total: "Tutale",
    source: "Surgente",
    ready: "Prestu",
    parsing: "ANALISI D'A COLEÇIUN...",
    selectFolder: "Seleşiunà Cartela",
    selectFolderSub: "Seleşiunà üna cartela lucale per analisà e foti d'aviaçiun üsandu a cunvençiun de numenclatüra standard.",
    search: "Çercà n'a coleçiun...",
    addFolder: "Agiunze Cartela",
    indexingHangar: "Hangar d'Indessaçiun",
    processing: "Pruçessamentu",
    complete: "Cumpletu",
    aviationPreferences: "Preferençe d'Aviaçiun",
    local: "Lucale",
    utc: "UTC",
    aeroTime: "Preçisiun AeroTime",
    globalStandard: "Standard d'Aviaçiun Globale",
    input: "Valure d'Entrada",
    output: "Risultau de Sciurtia",
    friends: "Amighi",
    requests: "Dumande",
    offline: "Fora de ligna",
    private: "Profilu Privau",
    personalInfo: "Infurmassiun Persunale",
    bio: "Bio",
    location: "Lucaliçaçiun",
    displayName: "Nume Visualisau",
    shareProfile: "Cunpartì Profilu",
    skydrop: "SkyDrop",
    saveProfile: "Salvà Profilu",
    saving: "Salvamentu...",
    memberSince: "Membru da",
    scanToAdd: "Scansionà per Agiunze",
    knots: "Nodi",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Pedi",
    meters: "Metri",
    sortByDate: "Data",
    sortByReg: "Registrassiun",
    sortByAirline: "Cumpagnia",
    running: "En corsu",
    idle: "Inativu",
    listening: "En ascoltu",
    searchCity: "Çerca cità...",
    humidity: "Ümidità",
    pressure: "Presciun",
    aqi: "Qualità de l'aria",
    visibility: "Visibilità",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "miggia",
    useLocation: "Ütilizà a mæ puscissiun",
    weatherDetails: "Detagli meteu",
    windSpeed: "Veluçità d'u ventu",
    matching: "Matching",
    matchFound: "Match truvau!",
    noMoreMatches: "Nisciün match ciü",
    keepSwiping: "Cuntinuati a scurre per truvà ciü amighi",
    aqiGood: "Buna",
    aqiFair: "Discreta",
    aqiModerate: "Moderata",
    aqiPoor: "Scarsa",
    aqiVeryPoor: "Malu awi",
    clock: "Reloiu",
    articlesPerPage: "Articuli per pàgina",
    swipeFriends: "Scurre per truvà amighi",
    startChat: "Inçià a chat",
    hangarDoors: "Per piacè nun serrà e porte de l'hangar...",
    shareProfileTitle: "Cunpartì u profilu",
    scanToConnect: "Scansionà per cunetise en SkyChat",
    copyLink: "Cupià u ligame d'u profilu",
    close: "Serrà",
    date: "Data",
    locationLabel: "Lucaliçaçiun",
    resetRadar: "Reiniscialisà u radar"
  },
  cs: {
    dashboard: "Nástěnka",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Novinky",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetrie",
    profile: "Profil",
    welcome: "Vítejte, Spottere",
    welcomeSub: "Vaše vše-v-jednom letecká sada. Sledujte svou sbírku, buďte v obraze s novinkami a provádějte složité výpočty.",
    photoCollection: "Sbírka fotografií",
    photoAlbum: "Fotoalbum",
    weather: "Počasí",
    friendsOnline: "Přátelé online",
    reelsSub: "Letecký kanál řízený algoritmem",
    adjustAlgorithm: "Upravit algoritmus",
    addHashtag: "Přidat hashtag...",
    noReels: "Nenalezena žádná Reels",
    noReelsSub: "Zkuste upravit hashtagy algoritmu, abyste našli více obsahu.",
    aviationNews: "Letecké novinky",
    readFull: "Číst celý článek",
    newsCredit: "Novinky poskytují Simple Flying, Sam Chui, AeroRoutes a Aero-News Network.",
    calcTitle: "Letecký vědecký v2.0",
    show: "Zobrazit",
    scientificTools: "Vědecké nástroje",
    scientificSub: "Pokročilé plánování letů a technické převody.",
    unitConverter: "Převodník jednotek",
    recentHistory: "Nedávná historie",
    noCalculations: "Zatím žádné výpočty",
    telemetryRealtime: "Telemetrie v reálném čase",
    cpuLoad: "Zatížení CPU",
    memoryUsage: "Využití paměti",
    process: "Proces",
    status: "Stav",
    memory: "Paměť",
    favorites: "Oblíbené",
    noFlexPics: "Zatím žádné FlexPics",
    noFlexPicsSub: "Začněte přidávat fotky do oblíbených ve svém albu a vybudujte si elitní sbírku.",
    goToAlbum: "Přejít do alba",
    mySnap: "Můj Snap",
    messages: "Zprávy",
    friendsLabel: "Přátelé",
    online: "Online",
    homeAirport: "Domovské letiště",
    favoriteAirline: "Oblíbená letecká společnost",
    equipment: "Vybavení",
    privacySettings: "Nastavení soukromí",
    privateProfile: "Soukromý profil",
    privacySub: "Skryjte svůj online stav a bio před ostatními v SkyChat.",
    statusHidden: "Stav skrytý",
    statusVisible: "Stav viditelný",
    bioLocked: "Bio uzamčeno",
    bioPublic: "Bio veřejné",
    friendRequests: "Žádosti o přátelství",
    pending: "Čekající",
    accept: "Přijmout",
    reject: "Odmítnout",
    noPending: "Žádné čekající žádosti",
    total: "Celkem",
    source: "Zdroj",
    ready: "Připraveno",
    parsing: "ANALÝZA SBÍRKY...",
    selectFolder: "Vybrat složku",
    selectFolderSub: "Vyberte místní složku pro analýzu leteckých fotografií pomocí standardní konvence pojmenování.",
    search: "Hledat ve sbírce...",
    addFolder: "Přidat složku",
    indexingHangar: "Indexování hangáru",
    processing: "Zpracování",
    complete: "Dokončeno",
    aviationPreferences: "Letecké preference",
    local: "Místní",
    utc: "UTC",
    aeroTime: "Přesnost AeroTime",
    globalStandard: "Globální letecký standard",
    input: "Vstupní hodnota",
    output: "Výstupní výsledek",
    friends: "Přátelé",
    requests: "Žádosti",
    offline: "Offline",
    private: "Soukromý profil",
    personalInfo: "Osobní info",
    bio: "Bio",
    location: "Lokalita",
    displayName: "Zobrazované jméno",
    shareProfile: "Sdílet profil",
    skydrop: "SkyDrop",
    saveProfile: "Uložit profil",
    saving: "Ukládání...",
    memberSince: "Členem od",
    scanToAdd: "Naskenovat pro přidání",
    knots: "Uzly",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Stopy",
    meters: "Metry",
    sortByDate: "Datum",
    sortByReg: "Registrace",
    sortByAirline: "Letecká společnost",
    running: "Běží",
    idle: "Nečinný",
    listening: "Poslouchá",
    searchCity: "Hledat město...",
    humidity: "Vlhkost",
    pressure: "Tlak",
    aqi: "Kvalita vzduchu",
    visibility: "Viditelnost",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "míle",
    useLocation: "Použít mou polohu",
    weatherDetails: "Detaily počasí",
    windSpeed: "Rychlost větru",
    matching: "Matching",
    matchFound: "Shoda nalezena!",
    noMoreMatches: "Žádné další shody",
    keepSwiping: "Pokračujte v swipování pro nalezení dalších přátel",
    aqiGood: "Dobrá",
    aqiFair: "Ušlá",
    aqiModerate: "Průměrná",
    aqiPoor: "Špatná",
    aqiVeryPoor: "Velmi špatná",
    clock: "Hodiny",
    articlesPerPage: "Článků na stránku",
    swipeFriends: "Swipujte pro nalezení přátel",
    startChat: "Zahájit chat",
    hangarDoors: "Prosím, nezavírejte dveře hangáru...",
    shareProfileTitle: "Sdílet profil",
    scanToConnect: "Naskenujte pro připojení na SkyChat",
    copyLink: "Kopírovat odkaz na profil",
    close: "Zavřít",
    date: "Datum",
    locationLabel: "Lokalita",
    resetRadar: "Resetovat radar"
  },
  eu: {
    dashboard: "Arbel",
    album: "Albuma",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Berriak",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Profila",
    welcome: "Ongi etorri, Spotter",
    welcomeSub: "Zure hegazkintza kudeatzeko suite osoa. Jarraitu zure bilduma, egon berrien berri eta egin kalkulu konplexuak.",
    photoCollection: "Argazki bilduma",
    photoAlbum: "Argazki albuma",
    weather: "Eguraldia",
    friendsOnline: "Lagunak online",
    reelsSub: "Algoritmo bidezko hegazkintza jarioa",
    adjustAlgorithm: "Doitu algoritmoa",
    addHashtag: "Gehitu hashtaga...",
    noReels: "Ez da Reel-ik aurkitu",
    noReelsSub: "Saiatu algoritmoaren hashtag-ak doitzen eduki gehiago aurkitzeko.",
    aviationNews: "Hegazkintza berriak",
    readFull: "Irakurri artikulu osoa",
    newsCredit: "Simple Flying, Sam Chui, AeroRoutes eta Aero-News Network-ek emandako berriak.",
    calcTitle: "Hegazkintza Zientifikoa v2.0",
    show: "Erakutsi",
    scientificTools: "Tresna zientifikoak",
    scientificSub: "Hegaldi plangintza aurreratua eta bihurketa teknikoak.",
    unitConverter: "Unitate bihurtzailea",
    recentHistory: "Azken historia",
    noCalculations: "Oraindik ez dago kalkulurik",
    telemetryRealtime: "Denbora errealeko telemetria",
    cpuLoad: "CPU karga",
    memoryUsage: "Memoria erabilera",
    process: "Prozesua",
    status: "Egoera",
    memory: "Memoria",
    favorites: "Gogokoak",
    noFlexPics: "Oraindik ez dago FlexPics-ik",
    noFlexPicsSub: "Hasi argazkiak gogoko gisa markatzen zure albumean zure eliteko bilduma osatzeko.",
    goToAlbum: "Joan albumera",
    mySnap: "Nire Snapa",
    messages: "Mezuak",
    friendsLabel: "Lagunak",
    online: "Online",
    homeAirport: "Etxeko aireportua",
    favoriteAirline: "Airelinea gogokoena",
    equipment: "Ekipamendua",
    privacySettings: "Pribatutasun ezarpenak",
    privateProfile: "Profil pribatua",
    privacySub: "Ezkutatu zure online egoera eta bio SkyChat-en besteengandik.",
    statusHidden: "Egoera ezkutatuta",
    statusVisible: "Egoera ikusgai",
    bioLocked: "Bio blokeatuta",
    bioPublic: "Bio publikoa",
    friendRequests: "Lagun eskaerak",
    pending: "Zain",
    accept: "Onartu",
    reject: "Ukatu",
    noPending: "Ez dago zain dagoen eskaerak",
    total: "Guztira",
    source: "Iturria",
    ready: "Prest",
    parsing: "BILDUMA AZTERTZEN...",
    selectFolder: "Hautatu karpeta",
    selectFolderSub: "Hautatu tokiko karpeta bat hegazkintza argazkiak aztertzeko izendapen konbentzio estandarra erabiliz.",
    search: "Bilatu bilduman...",
    addFolder: "Gehitu karpeta",
    indexingHangar: "Hangara indexatzen",
    processing: "Prozesatzen",
    complete: "Osatua",
    aviationPreferences: "Hegazkintza hobespenak",
    local: "Tokikoa",
    utc: "UTC",
    aeroTime: "AeroTime doitasuna",
    globalStandard: "Hegazkintza estandar globala",
    input: "Sarrerako balioa",
    output: "Irteerako emaitza",
    friends: "Lagunak",
    requests: "Eskaerak",
    offline: "Offline",
    private: "Profil pribatua",
    personalInfo: "Informazio pertsonala",
    bio: "Bio",
    location: "Kokapena",
    displayName: "Bistaratzeko izena",
    shareProfile: "Partekatu profila",
    skydrop: "SkyDrop",
    saveProfile: "Gorde profila",
    saving: "Gordetzen...",
    memberSince: "Kide honetatik",
    scanToAdd: "Eskaneatu gehitzeko",
    knots: "Korapiloak",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Oinak",
    meters: "Metroak",
    sortByDate: "Data",
    sortByReg: "Erregistroa",
    sortByAirline: "Airelinea",
    running: "Martxan",
    idle: "Inaktibo",
    listening: "Entzuten",
    searchCity: "Bilatu hiria...",
    humidity: "Hezetasuna",
    pressure: "Presioa",
    aqi: "Airearen kalitatea",
    visibility: "Ikusgarritasuna",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "miliak",
    useLocation: "Použít mou polohu",
    weatherDetails: "Eguraldiaren xehetasunak",
    windSpeed: "Haizearen abiadura",
    matching: "Matching",
    matchFound: "Laguna aurkitu da!",
    noMoreMatches: "Ez dago lagun gehiagorik",
    keepSwiping: "Jarraitu swipatzen lagun gehiago aurkitzeko",
    aqiGood: "Ona",
    aqiFair: "Nahikoa",
    aqiModerate: "Moderatua",
    aqiPoor: "Txarra",
    aqiVeryPoor: "Oso txarra",
    clock: "Erlojua",
    articlesPerPage: "Artikuluak orrialdeko",
    swipeFriends: "Swipatu lagunak aurkitzeko",
    startChat: "Hasi txata",
    hangarDoors: "Mesedez, ez itxi hangar ateak...",
    shareProfileTitle: "Partekatu profila",
    scanToConnect: "Eskaneatu SkyChat-en konektatzeko",
    copyLink: "Kopiatu profilaren esteka",
    close: "Itxi",
    date: "Data",
    locationLabel: "Kokapena",
    resetRadar: "Berrezarri radarra"
  },
  ku: {
    dashboard: "Dêşbord",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Nûçe",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetrî",
    profile: "Profîl",
    welcome: "Bi xêr hatî, Spotter",
    welcomeSub: "Sûîta weya rêveberiya hewavaniyê ya hemî-yek-yek. Koleksiyona xwe bişopînin, bi nûçeyan re agahdar bimînin û hesabên tevlihev bikin.",
    photoCollection: "Koleksiyona wêneyan",
    photoAlbum: "Albuma wêneyan",
    weather: "Hewa",
    friendsOnline: "Hevalên online",
    reelsSub: "Fîda hewavaniyê ya bi algorîtmayê",
    adjustAlgorithm: "Algorîtmayê eyar bike",
    addHashtag: "Hashtag lê zêde bike...",
    noReels: "Reels nehatin dîtin",
    noReelsSub: "Ji bo dîtina naverokek bêtir hashtagên algorîtmayê eyar bikin.",
    aviationNews: "Nûçeyên hewavaniyê",
    readFull: "Gotara tevahî bixwîne",
    newsCredit: "Nûçe ji hêla Simple Flying, Sam Chui, AeroRoutes, û Aero-News Network ve têne peyda kirin.",
    calcTitle: "Hewavaniya Zanistî v2.0",
    show: "Nîşan bide",
    scientificTools: "Amûrên zanistî",
    scientificSub: "Plansaziya firînê ya pêşkeftî û veguheztina teknîkî.",
    unitConverter: "Veguherînerê yekîneyan",
    recentHistory: "Dîroka dawî",
    noCalculations: "Hîn hesab tune",
    telemetryRealtime: "Telemetrî di dema rast de",
    cpuLoad: "Barkirina CPU",
    memoryUsage: "Bikaranîna bîrê",
    process: "Pêvajo",
    status: "Rewş",
    memory: "Bîr",
    favorites: "Bijare",
    noFlexPics: "Hîn FlexPics tune",
    noFlexPicsSub: "Ji bo avakirina koleksiyona xweya elît di albuma xwe de dest bi bijartina wêneyan bikin.",
    goToAlbum: "Herin albumê",
    mySnap: "Snapa min",
    messages: "Peyam",
    friendsLabel: "Heval",
    online: "Online",
    homeAirport: "Balafirgeha malê",
    favoriteAirline: "Rêhewaya bijare",
    equipment: "Amûr",
    privacySettings: "Eyarên nepeniyê",
    privateProfile: "Profîla taybet",
    privacySub: "Rewşa xweya online û bio ji kesên din re di SkyChat de veşêrin.",
    statusHidden: "Rewş veşartî",
    statusVisible: "Rewş xuya",
    bioLocked: "Bio girtî",
    bioPublic: "Bio giştî",
    friendRequests: "Daxwazên hevaltiyê",
    pending: "Li bendê",
    accept: "Qebûl bike",
    reject: "Red bike",
    noPending: "Daxwazên li bendê tune",
    total: "Giştî",
    source: "Çavkanî",
    ready: "Amade",
    parsing: "KOLEKSIYON TÊ ANALÎZKIRIN...",
    selectFolder: "Peldankê hilbijêre",
    selectFolderSub: "Peldankek herêmî hilbijêrin da ku wêneyên hewavaniyê bi karanîna peymana navdêriya standard analîz bikin.",
    search: "Di koleksiyonê de bigerin...",
    addFolder: "Peldankê lê zêde bike",
    indexingHangar: "Hangar tê îndekskirin",
    processing: "Tê pêvajoyê",
    complete: "Temam",
    aviationPreferences: "Vebijarkên hewavaniyê",
    local: "Herêmî",
    utc: "UTC",
    aeroTime: "Rastiya AeroTime",
    globalStandard: "Standarda hewavaniyê ya gerdûnî",
    input: "Nirxa têketinê",
    output: "Encama derketinê",
    friends: "Heval",
    requests: "Daxwaz",
    offline: "Offline",
    private: "Profîla taybet",
    personalInfo: "Agahiyên kesane",
    bio: "Bio",
    location: "Cîh",
    displayName: "Navê nîşandanê",
    shareProfile: "Profîlê parve bike",
    skydrop: "SkyDrop",
    saveProfile: "Profîlê tomar bike",
    saving: "Tê tomarkirin...",
    memberSince: "Endam ji",
    scanToAdd: "Ji bo lêzêdekirinê sken bike",
    knots: "Girêk",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Pê",
    meters: "Metre",
    sortByDate: "Dîrok",
    sortByReg: "Qeydkirin",
    sortByAirline: "Rêhewa",
    running: "Dixebite",
    idle: "Betal",
    listening: "Guhdarî dike",
    searchCity: "Li bajêr bigere...",
    humidity: "Nîm",
    pressure: "Zext",
    aqi: "Kalîteya hewayê",
    visibility: "Dîtinî",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "mîl",
    useLocation: "Cîhê min bikar bîne",
    weatherDetails: "Agahiyên hewayê",
    windSpeed: "Leza bayê",
    matching: "Hevberdan",
    matchFound: "Heval hat dîtin!",
    noMoreMatches: "Hevalên din tune",
    keepSwiping: "Ji bo dîtina hevalên bêtir swipê bidomînin",
    aqiGood: "Baş",
    aqiFair: "Baş e",
    aqiModerate: "Navîn",
    aqiPoor: "Xirab",
    aqiVeryPoor: "Gelek xirab",
    clock: "Saet",
    articlesPerPage: "Gotar di rûpelê de",
    swipeFriends: "Ji bo dîtina hevalan swipê bike",
    startChat: "Dest bi chatê bike",
    hangarDoors: "Ji kerema xwe deriyên hangarê negirin...",
    shareProfileTitle: "Profîlê parve bike",
    scanToConnect: "Ji bo girêdana li ser SkyChat sken bike",
    copyLink: "Lînka profîlê kopî bike",
    close: "Bigire",
    date: "Dîrok",
    locationLabel: "Cîh",
    resetRadar: "Radara nû bike"
  },
  ca: {
    dashboard: "Tauler de control",
    album: "Àlbum",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Notícies",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Perfil",
    welcome: "Benvingut, Spotter",
    welcomeSub: "La teva suite de gestió aeronàutica tot en un. Segueix la teva col·lecció, estigues al dia de les notícies i fes càlculs complexos.",
    photoCollection: "Col·lecció de fotos",
    photoAlbum: "Àlbum de fotos",
    weather: "Temps",
    friendsOnline: "Amics en línia",
    reelsSub: "Flux d'aviació basat en algorisme",
    adjustAlgorithm: "Ajustar algorisme",
    addHashtag: "Afegir hashtag...",
    noReels: "No s'han trobat Reels",
    noReelsSub: "Prova d'ajustar els hashtags de l'algorisme per trobar més contingut.",
    aviationNews: "Notícies d'aviació",
    readFull: "Llegir article complet",
    newsCredit: "Notícies proporcionades per Simple Flying, Sam Chui, AeroRoutes i Aero-News Network.",
    calcTitle: "Aviació Científica v2.0",
    show: "Mostrar",
    scientificTools: "Eines científiques",
    scientificSub: "Planificació de vol avançada i utilitats de conversió tècnica.",
    unitConverter: "Convertidor d'unitats",
    recentHistory: "Historial recent",
    noCalculations: "Encara no hi ha càlculs",
    telemetryRealtime: "Telemetria en temps real",
    cpuLoad: "Càrrega de CPU",
    memoryUsage: "Ús de memòria",
    process: "Procés",
    status: "Estat",
    memory: "Memòria",
    favorites: "Preferits",
    noFlexPics: "Encara no hi ha FlexPics",
    noFlexPicsSub: "Comença a marcar fotos com a preferides al teu àlbum per construir la teva col·lecció d'elit.",
    goToAlbum: "Anar a l'àlbum",
    mySnap: "El meu Snap",
    messages: "Missatges",
    friendsLabel: "Amics",
    online: "En línia",
    homeAirport: "Aeroport base",
    favoriteAirline: "Aerolínia preferida",
    equipment: "Equipament",
    privacySettings: "Configuració de privadesa",
    privateProfile: "Perfil privat",
    privacySub: "Amaga el teu estat en línia i la teva biografia dels altres a SkyChat.",
    statusHidden: "Estat amagat",
    statusVisible: "Estat visible",
    bioLocked: "Biografia bloquejada",
    bioPublic: "Biografia pública",
    friendRequests: "Sol·licituds d'amistat",
    pending: "Pendent",
    accept: "Acceptar",
    reject: "Rebutjar",
    noPending: "No hi ha sol·licituds pendents",
    total: "Total",
    source: "Font",
    ready: "Llest",
    parsing: "ANALITZANT COL·LECCIÓ...",
    selectFolder: "Seleccionar carpeta",
    selectFolderSub: "Selecciona una carpeta local per analitzar fotos d'aviació utilitzant la convenció de noms estàndard.",
    search: "Cercar a la col·lecció...",
    addFolder: "Afegir carpeta",
    indexingHangar: "Indexant hangar",
    processing: "Processant",
    complete: "Completat",
    aviationPreferences: "Preferències d'aviació",
    local: "Local",
    utc: "UTC",
    aeroTime: "Precisió AeroTime",
    globalStandard: "Estàndard d'aviació global",
    input: "Valor d'entrada",
    output: "Resultat de sortida",
    friends: "Amics",
    requests: "Sol·licituds",
    offline: "Fora de línia",
    private: "Perfil privat",
    personalInfo: "Informació personal",
    bio: "Bio",
    location: "Ubicació",
    displayName: "Nom de visualització",
    shareProfile: "Compartir perfil",
    skydrop: "SkyDrop",
    saveProfile: "Desar perfil",
    saving: "Desant...",
    memberSince: "Membre des de",
    scanToAdd: "Escanejar per afegir",
    knots: "Nusos",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Peus",
    meters: "Metres",
    sortByDate: "Data",
    sortByReg: "Registre",
    sortByAirline: "Aerolínia",
    running: "En execució",
    idle: "Inactiu",
    listening: "Escoltant",
    searchCity: "Cercar ciutat...",
    humidity: "Humitat",
    pressure: "Pressió",
    aqi: "Qualitat de l'aire",
    visibility: "Visibilitat",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "milles",
    useLocation: "Utilitzar la meva ubicació",
    weatherDetails: "Detalls del temps",
    windSpeed: "Velocitat del vent",
    matching: "Matching",
    matchFound: "S'ha trobat un match!",
    noMoreMatches: "No hi ha més matches",
    keepSwiping: "Continua lliscant per trobar més amics",
    aqiGood: "Bona",
    aqiFair: "Acceptable",
    aqiModerate: "Moderada",
    aqiPoor: "Pobra",
    aqiVeryPoor: "Molt pobra",
    clock: "Rellotge",
    articlesPerPage: "Articles per pàgina",
    swipeFriends: "Llisca per trobar amics",
    startChat: "Iniciar xat",
    hangarDoors: "Si us plau, no tanquis les portes de l'hangar...",
    shareProfileTitle: "Compartir perfil",
    scanToConnect: "Escaneja per connectar-te a SkyChat",
    copyLink: "Copiar enllaç del perfil",
    close: "Tancar",
    date: "Data",
    locationLabel: "Ubicació",
    resetRadar: "Restablir radar"
  },
  fi: {
    dashboard: "Ohjauspaneeli",
    album: "Albumi",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Uutiset",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetria",
    profile: "Profiili",
    welcome: "Tervetuloa, Spotter",
    welcomeSub: "Kaikki-yhdessä ilmailun hallintapakettisi. Seuraa kokoelmaasi, pysy ajan tasalla uutisista ja tee monimutkaisia laskelmia.",
    photoCollection: "Valokuvakokoelma",
    photoAlbum: "Valokuva-albumi",
    weather: "Sää",
    friendsOnline: "Ystävät linjoilla",
    reelsSub: "Algoritmiperusteinen ilmailusyöte",
    adjustAlgorithm: "Säädä algoritmia",
    addHashtag: "Lisää hashtag...",
    noReels: "Reelsejä ei löytynyt",
    noReelsSub: "Yritä säätää algoritmin hashtageja löytääksesi lisää sisältöä.",
    aviationNews: "Ilmailu-uutiset",
    readFull: "Lue koko artikkeli",
    newsCredit: "Uutiset tarjoavat Simple Flying, Sam Chui, AeroRoutes ja Aero-News Network.",
    calcTitle: "Ilmailutiede v2.0",
    show: "Näytä",
    scientificTools: "Tieteelliset työkalut",
    scientificSub: "Edistynyt lennonsuunnittelu ja tekniset muunnokset.",
    unitConverter: "Yksikkömuunnin",
    recentHistory: "Viimeaikainen historia",
    noCalculations: "Ei vielä laskelmia",
    telemetryRealtime: "Reaaliaikainen telemetria",
    cpuLoad: "CPU-kuormitus",
    memoryUsage: "Muistin käyttö",
    process: "Prosessi",
    status: "Tila",
    memory: "Muisti",
    favorites: "Suosikit",
    noFlexPics: "Ei vielä FlexPics-kuvia",
    noFlexPicsSub: "Aloita kuvien merkitseminen suosikeiksi albumissasi rakentaaksesi eliittikokoelmasi.",
    goToAlbum: "Siirry albumiin",
    mySnap: "Oma Snap",
    messages: "Viestit",
    friendsLabel: "Ystävät",
    online: "Linjoilla",
    homeAirport: "Kotilentoasema",
    favoriteAirline: "Suosikkilentoyhtiö",
    equipment: "Varusteet",
    privacySettings: "Tietosuoja-asetukset",
    privateProfile: "Yksityinen profiili",
    privacySub: "Piilota online-tilasi ja biosi muilta SkyChatissa.",
    statusHidden: "Tila piilotettu",
    statusVisible: "Tila näkyvissä",
    bioLocked: "Bio lukittu",
    bioPublic: "Bio julkinen",
    friendRequests: "Kaveripyynnöt",
    pending: "Odottaa",
    accept: "Hyväksy",
    reject: "Hylkää",
    noPending: "Ei odottavia pyyntöjä",
    total: "Yhteensä",
    source: "Lähde",
    ready: "Valmis",
    parsing: "ANALUISOIDAAN KOKOELMAA...",
    selectFolder: "Valitse kansio",
    selectFolderSub: "Valitse paikallinen kansio ilmailukuvien analysoimiseksi käyttäen standardia nimeämiskäytäntöä.",
    search: "Hae kokoelmasta...",
    addFolder: "Lisää kansio",
    indexingHangar: "Indeksoidaan hangaaria",
    processing: "Käsitellään",
    complete: "Valmis",
    aviationPreferences: "Ilmailuasetukset",
    local: "Paikallinen",
    utc: "UTC",
    aeroTime: "AeroTime-tarkkuus",
    globalStandard: "Globaali ilmailustandardi",
    input: "Syöttöarvo",
    output: "Tuloste",
    friends: "Ystävät",
    requests: "Pyynnöt",
    offline: "Offline",
    private: "Yksityinen profiili",
    personalInfo: "Henkilötiedot",
    bio: "Bio",
    location: "Sijainti",
    displayName: "Näyttönimi",
    shareProfile: "Jaa profiili",
    skydrop: "SkyDrop",
    saveProfile: "Tallenna profiili",
    saving: "Tallennetaan...",
    memberSince: "Jäsen alkaen",
    scanToAdd: "Skannaa lisätäksesi",
    knots: "Solmua",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Jalkaa",
    meters: "Metriä",
    sortByDate: "Päivämäärä",
    sortByReg: "Rekisteröinti",
    sortByAirline: "Lentoyhtiö",
    running: "Käynnissä",
    idle: "Joutokäynti",
    listening: "Kuuntelee",
    searchCity: "Hae kaupunkia...",
    humidity: "Kosteus",
    pressure: "Paine",
    aqi: "Ilmanlaatu",
    visibility: "Näkyvyys",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "mailia",
    useLocation: "Käytä sijaintiani",
    weatherDetails: "Säätiedot",
    windSpeed: "Tuulen nopeus",
    matching: "Matching",
    matchFound: "Match löytyi!",
    noMoreMatches: "Ei enempää matcheja",
    keepSwiping: "Jatka swippaamista löytääksesi lisää ystäviä",
    aqiGood: "Hyvä",
    aqiFair: "Tyydyttävä",
    aqiModerate: "Kohtalainen",
    aqiPoor: "Huono",
    aqiVeryPoor: "Erittäin huono",
    clock: "Kello",
    articlesPerPage: "Artikkelia sivulla",
    swipeFriends: "Swippaa löytääksesi ystäviä",
    startChat: "Aloita chatti",
    hangarDoors: "Älä sulje hangaarin ovia...",
    shareProfileTitle: "Jaa profiili",
    scanToConnect: "Skannaa yhdistääksesi SkyChatissa",
    copyLink: "Kopioi profiililinkki",
    close: "Sulje",
    date: "Päivämäärä",
    locationLabel: "Sijainti",
    resetRadar: "Nollaa tutka"
  },
  no: {
    dashboard: "Dashbord",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Nyheter",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetri",
    profile: "Profil",
    welcome: "Velkommen, Spotter",
    welcomeSub: "Din alt-i-ett luftfartsadministrasjonspakke. Følg samlingen din, hold deg oppdatert på nyheter og gjør komplekse beregninger.",
    photoCollection: "Fotosamling",
    photoAlbum: "Fotoalbum",
    weather: "Vær",
    friendsOnline: "Venner online",
    reelsSub: "Algoritmedrevet luftfartsfeed",
    adjustAlgorithm: "Juster algoritme",
    addHashtag: "Legg til hashtag...",
    noReels: "Ingen Reels funnet",
    noReelsSub: "Prøv å justere algoritme-hashtags for å finne mer innhold.",
    aviationNews: "Luftfartsnyheter",
    readFull: "Les hele artikkelen",
    newsCredit: "Nyheter levert av Simple Flying, Sam Chui, AeroRoutes og Aero-News Network.",
    calcTitle: "Luftfartsvitenskapelig v2.0",
    show: "Vis",
    scientificTools: "Vitenskapelige verktøy",
    scientificSub: "Avansert flyplanlegging og tekniske konverteringsverktøy.",
    unitConverter: "Enhetsomformer",
    recentHistory: "Nylig historikk",
    noCalculations: "Ingen beregninger ennå",
    telemetryRealtime: "Sanntids telemetri",
    cpuLoad: "CPU-belastning",
    memoryUsage: "Minnebruk",
    process: "Prosess",
    status: "Status",
    memory: "Minne",
    favorites: "Favoritter",
    noFlexPics: "Ingen FlexPics ennå",
    noFlexPicsSub: "Begynn å markere bilder som favoritter i albumet ditt for å bygge din elite-samling.",
    goToAlbum: "Gå til album",
    mySnap: "Min Snap",
    messages: "Meldinger",
    friendsLabel: "Venner",
    online: "Online",
    homeAirport: "Hjemmeflyplass",
    favoriteAirline: "Favorittflyselskap",
    equipment: "Utstyr",
    privacySettings: "Personverninnstillinger",
    privateProfile: "Privat profil",
    privacySub: "Skjul din online-status og bio fra andre i SkyChat.",
    statusHidden: "Status skjult",
    statusVisible: "Status synlig",
    bioLocked: "Bio låst",
    bioPublic: "Bio offentlig",
    friendRequests: "Venneforespørsler",
    pending: "Venter",
    accept: "Aksepter",
    reject: "Avvis",
    noPending: "Ingen ventende forespørsler",
    total: "Total",
    source: "Kilde",
    ready: "Klar",
    parsing: "ANALYSERER SAMLING...",
    selectFolder: "Velg mappe",
    selectFolderSub: "Velg en lokal mappe for å analysere luftfartsbilder ved hjelp av standard navnekonvensjon.",
    search: "Søk i samlingen...",
    addFolder: "Legg til mappe",
    indexingHangar: "Indekserer hangar",
    processing: "Behandler",
    complete: "Fullført",
    aviationPreferences: "Luftfartspreferanser",
    local: "Lokal",
    utc: "UTC",
    aeroTime: "AeroTime-presisjon",
    globalStandard: "Global luftfartsstandard",
    input: "Inngangsverdi",
    output: "Utgangsresultat",
    friends: "Venner",
    requests: "Forespørsler",
    offline: "Offline",
    private: "Privat profil",
    personalInfo: "Personlig info",
    bio: "Bio",
    location: "Sted",
    displayName: "Visningsnavn",
    shareProfile: "Del profil",
    skydrop: "SkyDrop",
    saveProfile: "Lagre profil",
    saving: "Lagrer...",
    memberSince: "Medlem siden",
    scanToAdd: "Skann for å legge til",
    knots: "Knop",
    kmh: "Km/t",
    mph: "Mph",
    feet: "Fot",
    meters: "Meter",
    sortByDate: "Dato",
    sortByReg: "Registrering",
    sortByAirline: "Flyselskap",
    running: "Kjører",
    idle: "Inaktiv",
    listening: "Lytter",
    searchCity: "Søk by...",
    humidity: "Fuktighet",
    pressure: "Trykk",
    aqi: "Luftkvalitet",
    visibility: "Sikt",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "miles",
    useLocation: "Bruk min posisjon",
    weatherDetails: "Værdetaljer",
    windSpeed: "Vindhastighet",
    matching: "Matching",
    matchFound: "Match funnet!",
    noMoreMatches: "Ingen flere matcher",
    keepSwiping: "Fortsett å swipe for å finne flere venner",
    aqiGood: "God",
    aqiFair: "Grei",
    aqiModerate: "Moderat",
    aqiPoor: "Dårlig",
    aqiVeryPoor: "Veldig dårlig",
    clock: "Klokke",
    articlesPerPage: "Artikler per side",
    swipeFriends: "Swipe for å finne venner",
    startChat: "Start chat",
    hangarDoors: "Vennligst ikke lukk hangardørene...",
    shareProfileTitle: "Del profil",
    scanToConnect: "Skann for å koble til på SkyChat",
    copyLink: "Kopier profillenke",
    close: "Lukk",
    date: "Dato",
    locationLabel: "Sted",
    resetRadar: "Nullstill radar"
  },
  hr: {
    dashboard: "Kontrolna ploča",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Vijesti",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetrija",
    profile: "Profil",
    welcome: "Dobrodošli, Spotteru",
    welcomeSub: "Vaš sve-u-jednom paket za upravljanje zrakoplovstvom. Pratite svoju kolekciju, budite u tijeku s vijestima i radite složene izračune.",
    photoCollection: "Zbirka fotografija",
    photoAlbum: "Foto album",
    weather: "Vrijeme",
    friendsOnline: "Prijatelji online",
    reelsSub: "Zrakoplovni feed vođen algoritmom",
    adjustAlgorithm: "Prilagodi algoritam",
    addHashtag: "Dodaj hashtag...",
    noReels: "Nema pronađenih Reels",
    noReelsSub: "Pokušajte prilagoditi hashtagove algoritma kako biste pronašli više sadržaja.",
    aviationNews: "Zrakoplovne vijesti",
    readFull: "Pročitaj cijeli članak",
    newsCredit: "Vijesti omogućuju Simple Flying, Sam Chui, AeroRoutes i Aero-News Network.",
    calcTitle: "Zrakoplovna znanost v2.0",
    show: "Prikaži",
    scientificTools: "Znanstveni alati",
    scientificSub: "Napredno planiranje leta i tehničke pretvorbe.",
    unitConverter: "Pretvarač jedinica",
    recentHistory: "Nedavna povijest",
    noCalculations: "Još nema izračuna",
    telemetryRealtime: "Telemetrija u stvarnom vremenu",
    cpuLoad: "Opterećenje CPU-a",
    memoryUsage: "Upotreba memorije",
    process: "Proces",
    status: "Status",
    memory: "Memorija",
    favorites: "Favoriti",
    noFlexPics: "Još nema FlexPics",
    noFlexPicsSub: "Počnite označavati fotografije kao favorite u svom albumu kako biste izgradili svoju elitnu kolekciju.",
    goToAlbum: "Idi u album",
    mySnap: "Moj Snap",
    messages: "Poruke",
    friendsLabel: "Prijatelji",
    online: "Online",
    homeAirport: "Matična zračna luka",
    favoriteAirline: "Omiljena zrakoplovna tvrtka",
    equipment: "Oprema",
    privacySettings: "Postavke privatnosti",
    privateProfile: "Privatni profil",
    privacySub: "Sakrijte svoj online status i biografiju od drugih u SkyChatu.",
    statusHidden: "Status skriven",
    statusVisible: "Status vidljiv",
    bioLocked: "Biografija zaključana",
    bioPublic: "Biografija javna",
    friendRequests: "Zahtjevi za prijateljstvo",
    pending: "Na čekanju",
    accept: "Prihvati",
    reject: "Odbij",
    noPending: "Nema zahtjeva na čekanju",
    total: "Ukupno",
    source: "Izvor",
    ready: "Spreman",
    parsing: "ANALIZA KOLEKCIJE...",
    selectFolder: "Odaberi mapu",
    selectFolderSub: "Odaberite lokalnu mapu za analizu zrakoplovnih fotografija pomoću standardne konvencije imenovanja.",
    search: "Traži u kolekciji...",
    addFolder: "Dodaj mapu",
    indexingHangar: "Indeksiranje hangara",
    processing: "Obrada",
    complete: "Završeno",
    aviationPreferences: "Zrakoplovne postavke",
    local: "Lokalno",
    utc: "UTC",
    aeroTime: "AeroTime preciznost",
    globalStandard: "Globalni zrakoplovni standard",
    input: "Ulazna vrijednost",
    output: "Izlazni rezultat",
    friends: "Prijatelji",
    requests: "Zahtjevi",
    offline: "Offline",
    private: "Privatni profil",
    personalInfo: "Osobni podaci",
    bio: "Bio",
    location: "Lokacija",
    displayName: "Ime za prikaz",
    shareProfile: "Podijeli profil",
    skydrop: "SkyDrop",
    saveProfile: "Spremi profil",
    saving: "Spremanje...",
    memberSince: "Član od",
    scanToAdd: "Skeniraj za dodavanje",
    knots: "Čvorovi",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Stope",
    meters: "Metri",
    sortByDate: "Datum",
    sortByReg: "Registracija",
    sortByAirline: "Zrakoplovna tvrtka",
    running: "Radi",
    idle: "Mirovanje",
    listening: "Sluša",
    searchCity: "Traži grad...",
    humidity: "Vlažnost",
    pressure: "Tlak",
    aqi: "Kvaliteta zraka",
    visibility: "Vidljivost",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "milje",
    useLocation: "Koristi moju lokaciju",
    weatherDetails: "Detalji vremena",
    windSpeed: "Brzina vjetra",
    matching: "Matching",
    matchFound: "Pronađeno podudaranje!",
    noMoreMatches: "Nema više podudaranja",
    keepSwiping: "Nastavite povlačiti kako biste pronašli više prijatelja",
    aqiGood: "Dobra",
    aqiFair: "Zadovoljavajuća",
    aqiModerate: "Umjerena",
    aqiPoor: "Loša",
    aqiVeryPoor: "Vrlo loša",
    clock: "Sat",
    articlesPerPage: "Članaka po stranici",
    swipeFriends: "Povucite za pronalaženje prijatelja",
    startChat: "Započni chat",
    hangarDoors: "Molimo ne zatvarajte vrata hangara...",
    shareProfileTitle: "Podijeli profil",
    scanToConnect: "Skeniraj za povezivanje na SkyChatu",
    copyLink: "Kopiraj poveznicu profila",
    close: "Zatvori",
    date: "Datum",
    locationLabel: "Lokacija",
    resetRadar: "Resetiraj radar"
  },
  sr: {
    dashboard: "Kontrolna tabla",
    album: "Album",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "Vesti",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "Telemetrija",
    profile: "Profil",
    welcome: "Dobrodošli, Spotteru",
    welcomeSub: "Vaš sve-u-jednom paket za upravljanje vazduhoplovstvom. Pratite svoju kolekciju, budite u toku sa vestima i radite složene proračune.",
    photoCollection: "Zbirka fotografija",
    photoAlbum: "Foto album",
    weather: "Vreme",
    friendsOnline: "Prijatelji na mreži",
    reelsSub: "Vazduhoplovni feed vođen algoritmom",
    adjustAlgorithm: "Prilagodi algoritam",
    addHashtag: "Dodaj hashtag...",
    noReels: "Nema pronađenih Reels",
    noReelsSub: "Pokušajte da prilagodite hashtagove algoritma kako biste pronašli više sadržaja.",
    aviationNews: "Vazduhoplovne vesti",
    readFull: "Pročitaj ceo članak",
    newsCredit: "Vesti omogućavaju Simple Flying, Sam Chui, AeroRoutes i Aero-News Network.",
    calcTitle: "Vazduhoplovna nauka v2.0",
    show: "Prikaži",
    scientificTools: "Naučni alati",
    scientificSub: "Napredno planiranje leta i tehničke pretvorbe.",
    unitConverter: "Pretvarač jedinica",
    recentHistory: "Nedavna istorija",
    noCalculations: "Još nema proračuna",
    telemetryRealtime: "Telemetrija u stvarnom vremenu",
    cpuLoad: "Opterećenje CPU-a",
    memoryUsage: "Upotreba memorije",
    process: "Proces",
    status: "Status",
    memory: "Memorija",
    favorites: "Favoriti",
    noFlexPics: "Još nema FlexPics",
    noFlexPicsSub: "Počnite da označavate fotografije kao favorite u svom albumu kako biste izgradili svoju elitnu kolekciju.",
    goToAlbum: "Idi u album",
    mySnap: "Moj Snap",
    messages: "Poruke",
    friendsLabel: "Prijatelji",
    online: "Na mreži",
    homeAirport: "Matični aerodrom",
    favoriteAirline: "Omiljena avio-kompanija",
    equipment: "Oprema",
    privacySettings: "Postavke privatnosti",
    privateProfile: "Privatni profil",
    privacySub: "Sakrijte svoj status na mreži i biografiju od drugih u SkyChat-u.",
    statusHidden: "Status skriven",
    statusVisible: "Status vidljiv",
    bioLocked: "Biografija zaključana",
    bioPublic: "Biografija javna",
    friendRequests: "Zahtevi za prijateljstvo",
    pending: "Na čekanju",
    accept: "Prihvati",
    reject: "Odbij",
    noPending: "Nema zahteva na čekanju",
    total: "Ukupno",
    source: "Izvor",
    ready: "Spreman",
    parsing: "ANALIZA KOLEKCIJE...",
    selectFolder: "Odaberi fasciklu",
    selectFolderSub: "Odaberite lokalnu fasciklu za analizu vazduhoplovnih fotografija pomoću standardne konvencije imenovanja.",
    search: "Traži u kolekciji...",
    addFolder: "Dodaj fasciklu",
    indexingHangar: "Indeksiranje hangara",
    processing: "Obrada",
    complete: "Završeno",
    aviationPreferences: "Vazduhoplovne postavke",
    local: "Lokalno",
    utc: "UTC",
    aeroTime: "AeroTime preciznost",
    globalStandard: "Globalni vazduhoplovni standard",
    input: "Ulazna vrednost",
    output: "Izlazni rezultat",
    friends: "Prijatelji",
    requests: "Zahtevi",
    offline: "Van mreže",
    private: "Privatni profil",
    personalInfo: "Lični podaci",
    bio: "Bio",
    location: "Lokacija",
    displayName: "Ime za prikaz",
    shareProfile: "Podeli profil",
    skydrop: "SkyDrop",
    saveProfile: "Sačuvaj profil",
    saving: "Čuvanje...",
    memberSince: "Član od",
    scanToAdd: "Skeniraj za dodavanje",
    knots: "Čvorovi",
    kmh: "Km/h",
    mph: "Mph",
    feet: "Stope",
    meters: "Metri",
    sortByDate: "Datum",
    sortByReg: "Registracija",
    sortByAirline: "Avio-kompanija",
    running: "Radi",
    idle: "Mirovanje",
    listening: "Sluša",
    searchCity: "Traži grad...",
    humidity: "Vlažnost",
    pressure: "Pritisak",
    aqi: "Kvalitet vazduha",
    visibility: "Vidljivost",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "km",
    miles: "milje",
    useLocation: "Koristi moju lokaciju",
    weatherDetails: "Detalji vremena",
    windSpeed: "Brzina vetra",
    matching: "Matching",
    matchFound: "Pronađeno podudaranje!",
    noMoreMatches: "Nema više podudaranja",
    keepSwiping: "Nastavite da prevlačite kako biste pronašli više prijatelja",
    aqiGood: "Dobra",
    aqiFair: "Zadovoljavajuća",
    aqiModerate: "Umerena",
    aqiPoor: "Loša",
    aqiVeryPoor: "Veoma loša",
    clock: "Sat",
    articlesPerPage: "Članaka po stranici",
    swipeFriends: "Prevucite za pronalaženje prijatelja",
    startChat: "Započni čet",
    hangarDoors: "Molimo ne zatvarajte vrata hangara...",
    shareProfileTitle: "Podeli profil",
    scanToConnect: "Skeniraj za povezivanje na SkyChat-u",
    copyLink: "Kopiraj vezu profila",
    close: "Zatvori",
    date: "Datum",
    locationLabel: "Lokacija",
    resetRadar: "Resetuj radar"
  },
  ka: {
    dashboard: "მართვის პანელი",
    album: "ალბომი",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "სიახლეები",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "ტელემეტრია",
    profile: "პროფილი",
    welcome: "მოგესალმებით, Spotter",
    welcomeSub: "თქვენი ყოვლისმომცველი საავიაციო მართვის პაკეტი. თვალი ადევნეთ თქვენს კოლექციას, იყავით სიახლეების კურსში და შეასრულეთ რთული გამოთვლები.",
    photoCollection: "ფოტო კოლექცია",
    photoAlbum: "ფოტო ალბომი",
    weather: "ამინდი",
    friendsOnline: "მეგობრები ონლაინში",
    reelsSub: "ალგორითმზე დაფუძნებული საავიაციო ფიდი",
    adjustAlgorithm: "ალგორითმის მორგება",
    addHashtag: "ჰეშთეგის დამატება...",
    noReels: "Reels ვერ მოიძებნა",
    noReelsSub: "სცადეთ ალგორითმის ჰეშთეგების მორგება მეტი კონტენტის მოსაძებნად.",
    aviationNews: "საავიაციო სიახლეები",
    readFull: "სრული სტატიის წაკითხვა",
    newsCredit: "სიახლეებს მოგაწვდით Simple Flying, Sam Chui, AeroRoutes და Aero-News Network.",
    calcTitle: "საავიაციო მეცნიერება v2.0",
    show: "ჩვენება",
    scientificTools: "სამეცნიერო ინსტრუმენტები",
    scientificSub: "ფრენის მოწინავე დაგეგმვა და ტექნიკური კონვერტაციის საშუალებები.",
    unitConverter: "ერთეულების გადამყვანი",
    recentHistory: "ბოლო ისტორია",
    noCalculations: "გამოთვლები ჯერ არ არის",
    telemetryRealtime: "რეალურ დროში ტელემეტრია",
    cpuLoad: "CPU დატვირთვა",
    memoryUsage: "მეხსიერების გამოყენება",
    process: "პროცესი",
    status: "სტატუსი",
    memory: "მეხსიერება",
    favorites: "ფავორიტები",
    noFlexPics: "FlexPics ჯერ არ არის",
    noFlexPicsSub: "დაიწყეთ ფოტოების ფავორიტებად მონიშვნა თქვენს ალბომში თქვენი ელიტური კოლექციის შესაქმნელად.",
    goToAlbum: "ალბომზე გადასვლა",
    mySnap: "ჩემი Snap",
    messages: "შეტყობინებები",
    friendsLabel: "მეგობრები",
    online: "ონლაინში",
    homeAirport: "ბაზირების აეროპორტი",
    favoriteAirline: "საყვარელი ავიაკომპანია",
    equipment: "აღჭურვილობა",
    privacySettings: "კონფიდენციალურობის პარამეტრები",
    privateProfile: "პირადი პროფილი",
    privacySub: "დამალეთ თქვენი ონლაინ სტატუსი და ბიო სხვებისგან SkyChat-ში.",
    statusHidden: "სტატუსი დამალულია",
    statusVisible: "სტატუსი ხილულია",
    bioLocked: "ბიო დაბლოკილია",
    bioPublic: "ბიო საჯაროა",
    friendRequests: "მეგობრობის თხოვნები",
    pending: "მოლოდინში",
    accept: "მიღება",
    reject: "უარყოფა",
    noPending: "მოლოდინში მყოფი თხოვნები არ არის",
    total: "ჯამი",
    source: "წყარო",
    ready: "მზად არის",
    parsing: "კოლექციის ანალიზი...",
    selectFolder: "საქაღალდის არჩევა",
    selectFolderSub: "აირჩიეთ ლოკალური საქაღალდე საავიაციო ფოტოების ანალიზისთვის სტანდარტული დასახელების კონვენციის გამოყენებით.",
    search: "ძებნა კოლექციაში...",
    addFolder: "საქაღალდის დამატება",
    indexingHangar: "ანგარის ინდექსაცია",
    processing: "მუშავდება",
    complete: "დასრულებულია",
    aviationPreferences: "საავიაციო პარამეტრები",
    local: "ლოკალური",
    utc: "UTC",
    aeroTime: "AeroTime სიზუსტე",
    globalStandard: "გლობალური საავიაციო სტანდარტი",
    input: "შემავალი მნიშვნელობა",
    output: "გამომავალი შედეგი",
    friends: "მეგობრები",
    requests: "თხოვნები",
    offline: "ხაზგარეშე",
    private: "პირადი პროფილი",
    personalInfo: "პირადი ინფორმაცია",
    bio: "ბიო",
    location: "მდებარეობა",
    displayName: "საჩვენებელი სახელი",
    shareProfile: "პროფილის გაზიარება",
    skydrop: "SkyDrop",
    saveProfile: "პროფილის შენახვა",
    saving: "ინახება...",
    memberSince: "წევრია",
    scanToAdd: "დასკანერება დასამატებლად",
    knots: "კვანძები",
    kmh: "კმ/სთ",
    mph: "მილ/სთ",
    feet: "ფუტი",
    meters: "მეტრი",
    sortByDate: "თარიღი",
    sortByReg: "რეგისტრაცია",
    sortByAirline: "ავიაკომპანია",
    running: "მუშაობს",
    idle: "უმოქმედოა",
    listening: "უსმენს",
    searchCity: "ქალაქის ძებნა...",
    humidity: "ტენიანობა",
    pressure: "წნევა",
    aqi: "ჰაერის ხარისხი",
    visibility: "ხილვადობა",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    km: "კმ",
    miles: "მილი",
    useLocation: "ჩემი მდებარეობის გამოყენება",
    weatherDetails: "ამინდის დეტალები",
    windSpeed: "ქარის სიჩქარე",
    matching: "Matching",
    matchFound: "შესაბამისობა ნაპოვნია!",
    noMoreMatches: "მეტი შესაბამისობა არ არის",
    keepSwiping: "გააგრძელეთ სვაიპი მეტი მეგობრის მოსაძებნად",
    aqiGood: "კარგი",
    aqiFair: "მისაღები",
    aqiModerate: "ზომიერი",
    aqiPoor: "ცუდი",
    aqiVeryPoor: "ძალიან ცუდი",
    clock: "საათი",
    articlesPerPage: "სტატია გვერდზე",
    swipeFriends: "სვაიპი მეგობრების მოსაძებნად",
    startChat: "ჩატის დაწყება",
    hangarDoors: "გთხოვთ, ნუ დაკეტავთ ანგარის კარებს...",
    shareProfileTitle: "პროფილის გაზიარება",
    scanToConnect: "დასკანერება SkyChat-ში დასაკავშირებლად",
    copyLink: "პროფილის ლინკის კოპირება",
    close: "დახურვა",
    date: "თარიღი",
    locationLabel: "მდებარეობა",
    resetRadar: "რადარის რესეტი"
  },
  ja: {
    dashboard: "ダッシュボード",
    album: "アルバム",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "ニュース",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "テレメトリ",
    profile: "プロフィール",
    welcome: "ようこそ、スポッター",
    welcomeSub: "オールインワンの航空管理スイート。コレクションの追跡、ニュースの確認、複雑な計算が可能です。",
    photoCollection: "写真コレクション",
    photoAlbum: "フォトアルバム",
    weather: "天気",
    friendsOnline: "オンラインの友達",
    reelsSub: "アルゴリズムによる航空フィード",
    adjustAlgorithm: "アルゴリズムを調整",
    addHashtag: "ハッシュタグを追加...",
    noReels: "Reelsが見つかりません",
    noReelsSub: "アルゴリズムのハッシュタグを調整して、より多くのコンテンツを見つけてください。",
    aviationNews: "航空ニュース",
    readFull: "記事全文を読む",
    newsCredit: "ニュース提供：Simple Flying, Sam Chui, AeroRoutes, Aero-News Network",
    calcTitle: "航空科学 v2.0",
    show: "表示",
    scientificTools: "科学ツール",
    scientificSub: "高度な飛行計画と技術的な変換ユーティリティ。",
    unitConverter: "単位変換器",
    recentHistory: "最近の履歴",
    noCalculations: "計算履歴はありません",
    telemetryRealtime: "リアルタイムテレメトリ",
    cpuLoad: "CPU負荷",
    memoryUsage: "メモリ使用量",
    process: "プロセス",
    status: "ステータス",
    memory: "メモリ",
    favorites: "お気に入り",
    noFlexPics: "FlexPicsはありません",
    noFlexPicsSub: "アルバムで写真を「お気に入り」に登録して、エリートコレクションを構築しましょう。",
    goToAlbum: "アルバムへ移動",
    mySnap: "マイスナップ",
    messages: "メッセージ",
    friendsLabel: "友達",
    online: "オンライン",
    homeAirport: "ホーム空港",
    favoriteAirline: "お気に入りの航空会社",
    equipment: "機材",
    privacySettings: "プライバシー設定",
    privateProfile: "非公開プロフィール",
    privacySub: "SkyChatでオンラインステータスと自己紹介を非表示にします。",
    statusHidden: "ステータス非表示",
    statusVisible: "ステータス表示",
    bioLocked: "自己紹介ロック",
    bioPublic: "自己紹介公開",
    friendRequests: "友達リクエスト",
    pending: "保留中",
    accept: "承認",
    reject: "拒否",
    noPending: "保留中のリクエストはありません",
    total: "合計",
    source: "ソース",
    ready: "準備完了",
    parsing: "コレクションを解析中...",
    selectFolder: "フォルダを選択",
    selectFolderSub: "標準の命名規則を使用して航空写真を解析するためのローカルフォルダを選択してください。",
    search: "コレクションを検索...",
    addFolder: "フォルダを追加",
    indexingHangar: "ハンガーをインデックス中",
    processing: "処理中",
    complete: "完了",
    aviationPreferences: "航空設定",
    local: "ローカル",
    utc: "UTC",
    aeroTime: "AeroTime精度",
    globalStandard: "グローバル航空標準",
    input: "入力値",
    output: "出力結果",
    friends: "友達",
    requests: "リクエスト",
    offline: "オフライン",
    private: "非公開プロフィール",
    personalInfo: "個人情報",
    bio: "自己紹介",
    location: "場所",
    displayName: "表示名",
    shareProfile: "プロフィールを共有",
    skydrop: "SkyDrop",
    saveProfile: "プロフィールを保存",
    saving: "保存中...",
    memberSince: "登録日",
    scanToAdd: "スキャンして追加",
    knots: "ノット",
    kmh: "km/h",
    mph: "mph",
    feet: "フィート",
    meters: "メートル",
    sortByDate: "日付",
    sortByReg: "登録番号",
    sortByAirline: "航空会社",
    running: "実行中",
    idle: "アイドル",
    listening: "待機中",
    searchCity: "都市を検索...",
    humidity: "湿度",
    pressure: "気圧",
    aqi: "空気質",
    visibility: "視程",
    celsius: "摂氏",
    fahrenheit: "華氏",
    kelvin: "ケルビン",
    km: "km",
    miles: "マイル",
    useLocation: "現在地を使用",
    weatherDetails: "天気の詳細",
    windSpeed: "風速",
    matching: "マッチング",
    matchFound: "マッチしました！",
    noMoreMatches: "これ以上のマッチはありません",
    keepSwiping: "スワイプを続けて友達を見つけましょう",
    aqiGood: "良い",
    aqiFair: "普通",
    aqiModerate: "敏感なグループに影響",
    aqiPoor: "悪い",
    aqiVeryPoor: "非常に悪い",
    clock: "時計",
    articlesPerPage: "ページあたりの記事数",
    swipeFriends: "スワイプして友達を見つける",
    startChat: "チャットを開始",
    hangarDoors: "ハンガードアを閉めないでください...",
    shareProfileTitle: "プロファイルを共有",
    scanToConnect: "スキャンしてSkyChatで接続",
    copyLink: "プロファイルリンクをコピー",
    close: "閉じる",
    date: "日付",
    locationLabel: "場所",
    resetRadar: "レーダーをリセット"
  },
  ko: {
    dashboard: "대시보드",
    album: "앨범",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "뉴스",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "텔레메트리",
    profile: "프로필",
    welcome: "환영합니다, 스포터님",
    welcomeSub: "올인원 항공 관리 제품군. 컬렉션을 추적하고, 뉴스를 확인하고, 복잡한 계산을 수행하세요.",
    photoCollection: "사진 컬렉션",
    photoAlbum: "사진 앨범",
    weather: "날씨",
    friendsOnline: "온라인 친구",
    reelsSub: "알고리즘 기반 항공 피드",
    adjustAlgorithm: "알고리즘 조정",
    addHashtag: "해시태그 추가...",
    noReels: "Reels를 찾을 수 없습니다",
    noReelsSub: "알고리즘 해시태그를 조정하여 더 많은 콘텐츠를 찾아보세요.",
    aviationNews: "항공 뉴스",
    readFull: "기사 전문 읽기",
    newsCredit: "뉴스 제공: Simple Flying, Sam Chui, AeroRoutes, Aero-News Network",
    calcTitle: "항공 과학 v2.0",
    show: "표시",
    scientificTools: "과학 도구",
    scientificSub: "고급 비행 계획 및 기술 변환 유틸리티.",
    unitConverter: "단위 변환기",
    recentHistory: "최근 기록",
    noCalculations: "계산 기록이 없습니다",
    telemetryRealtime: "실시간 텔레메트리",
    cpuLoad: "CPU 부하",
    memoryUsage: "메모리 사용량",
    process: "프로세스",
    status: "상태",
    memory: "메모리",
    favorites: "즐겨찾기",
    noFlexPics: "FlexPics가 없습니다",
    noFlexPicsSub: "앨범에서 사진을 즐겨찾기로 등록하여 엘리트 컬렉션을 구축하세요.",
    goToAlbum: "앨범으로 이동",
    mySnap: "마이 스냅",
    messages: "메시지",
    friendsLabel: "친구",
    online: "온라인",
    homeAirport: "홈 공항",
    favoriteAirline: "선호 항공사",
    equipment: "장비",
    privacySettings: "개인정보 설정",
    privateProfile: "비공개 프로필",
    privacySub: "SkyChat에서 온라인 상태와 프로필을 숨깁니다.",
    statusHidden: "상태 숨김",
    statusVisible: "상태 표시",
    bioLocked: "프로필 잠금",
    bioPublic: "프로필 공개",
    friendRequests: "친구 요청",
    pending: "대기 중",
    accept: "수락",
    reject: "거절",
    noPending: "대기 중인 요청이 없습니다",
    total: "합계",
    source: "출처",
    ready: "준비 완료",
    parsing: "컬렉션 분석 중...",
    selectFolder: "폴더 선택",
    selectFolderSub: "표준 명명 규칙을 사용하여 항공 사진을 분석할 로컬 폴더를 선택하세요.",
    search: "컬렉션 검색...",
    addFolder: "폴더 추가",
    indexingHangar: "격납고 인덱싱 중",
    processing: "처리 중",
    complete: "완료",
    aviationPreferences: "항공 설정",
    local: "로컬",
    utc: "UTC",
    aeroTime: "AeroTime 정밀도",
    globalStandard: "글로벌 항공 표준",
    input: "입력값",
    output: "출력 결과",
    friends: "친구",
    requests: "요청",
    offline: "오프라인",
    private: "비공개 프로필",
    personalInfo: "개인 정보",
    bio: "소개",
    location: "위치",
    displayName: "표시 이름",
    shareProfile: "프로필 공유",
    skydrop: "SkyDrop",
    saveProfile: "프로필 저장",
    saving: "저장 중...",
    memberSince: "가입일",
    scanToAdd: "스캔하여 추가",
    knots: "노트",
    kmh: "km/h",
    mph: "mph",
    feet: "피트",
    meters: "미터",
    sortByDate: "날짜",
    sortByReg: "등록 번호",
    sortByAirline: "항공사",
    running: "실행 중",
    idle: "대기",
    listening: "대기 중",
    searchCity: "도시 검색...",
    humidity: "습도",
    pressure: "기압",
    aqi: "대기질",
    visibility: "시정",
    celsius: "섭씨",
    fahrenheit: "화씨",
    kelvin: "켈빈",
    km: "km",
    miles: "마일",
    useLocation: "현재 위치 사용",
    weatherDetails: "날씨 상세 정보",
    windSpeed: "풍속",
    matching: "매칭",
    matchFound: "매칭되었습니다!",
    noMoreMatches: "더 이상 매칭이 없습니다",
    keepSwiping: "계속 스와이프하여 친구를 찾아보세요",
    aqiGood: "좋음",
    aqiFair: "보통",
    aqiModerate: "민감군 영향",
    aqiPoor: "나쁨",
    aqiVeryPoor: "매우 나쁨",
    clock: "시계",
    articlesPerPage: "페이지당 기사 수",
    swipeFriends: "스와이프하여 친구 찾기",
    startChat: "채팅 시작",
    hangarDoors: "격납고 문을 닫지 마세요...",
    shareProfileTitle: "프로필 공유",
    scanToConnect: "스캔하여 SkyChat에서 연결",
    copyLink: "프로필 링크 복사",
    close: "닫기",
    date: "날짜",
    locationLabel: "위치",
    resetRadar: "레이더 초기화"
  },
  zh: {
    dashboard: "仪表板",
    album: "相册",
    reels: "Reels",
    flexpics: "FlexPics",
    news: "新闻",
    skychat: "SkyChat",
    aerocalc: "AeroCalc",
    telemetry: "遥测",
    profile: "个人资料",
    welcome: "欢迎，Spotter",
    welcomeSub: "您的全方位航空管理套件。跟踪您的收藏，了解最新新闻，并进行复杂的计算。",
    photoCollection: "照片收藏",
    photoAlbum: "相册",
    weather: "天气",
    friendsOnline: "在线好友",
    reelsSub: "算法驱动的航空动态",
    adjustAlgorithm: "调整算法",
    addHashtag: "添加标签...",
    noReels: "未找到 Reels",
    noReelsSub: "尝试调整算法标签以查找更多内容。",
    aviationNews: "航空新闻",
    readFull: "阅读全文",
    newsCredit: "新闻由 Simple Flying, Sam Chui, AeroRoutes 和 Aero-News Network 提供。",
    calcTitle: "航空科学 v2.0",
    show: "显示",
    scientificTools: "科学工具",
    scientificSub: "高级飞行计划和技术转换工具。",
    unitConverter: "单位转换器",
    recentHistory: "最近历史",
    noCalculations: "暂无计算记录",
    telemetryRealtime: "实时遥测",
    cpuLoad: "CPU 负载",
    memoryUsage: "内存使用",
    process: "进程",
    status: "状态",
    memory: "内存",
    favorites: "收藏",
    noFlexPics: "暂无 FlexPics",
    noFlexPicsSub: "开始在相册中收藏照片，建立您的精英收藏。",
    goToAlbum: "前往相册",
    mySnap: "我的 Snap",
    messages: "消息",
    friendsLabel: "好友",
    online: "在线",
    homeAirport: "基地机场",
    favoriteAirline: "最喜欢的航空公司",
    equipment: "器材",
    privacySettings: "隐私设置",
    privateProfile: "私密资料",
    privacySub: "在 SkyChat 中隐藏您的在线状态和简介。",
    statusHidden: "状态已隐藏",
    statusVisible: "状态可见",
    bioLocked: "简介已锁定",
    bioPublic: "简介公开",
    friendRequests: "好友请求",
    pending: "待处理",
    accept: "接受",
    reject: "拒绝",
    noPending: "暂无待处理请求",
    total: "总计",
    source: "来源",
    ready: "就绪",
    parsing: "正在解析收藏...",
    selectFolder: "选择文件夹",
    selectFolderSub: "选择本地文件夹以使用标准命名约定解析航空照片。",
    search: "搜索收藏...",
    addFolder: "添加文件夹",
    indexingHangar: "正在索引机库",
    processing: "处理中",
    complete: "完成",
    aviationPreferences: "航空偏好",
    local: "本地",
    utc: "UTC",
    aeroTime: "AeroTime 精度",
    globalStandard: "全球航空标准",
    input: "输入值",
    output: "输出结果",
    friends: "好友",
    requests: "请求",
    offline: "离线",
    private: "私密资料",
    personalInfo: "个人信息",
    bio: "简介",
    location: "位置",
    displayName: "显示名称",
    shareProfile: "分享资料",
    skydrop: "SkyDrop",
    saveProfile: "保存资料",
    saving: "保存中...",
    memberSince: "成员自",
    scanToAdd: "扫描以添加",
    knots: "节",
    kmh: "km/h",
    mph: "mph",
    feet: "英尺",
    meters: "米",
    sortByDate: "日期",
    sortByReg: "注册号",
    sortByAirline: "航空公司",
    running: "运行中",
    idle: "空闲",
    listening: "监听中",
    searchCity: "搜索城市...",
    humidity: "湿度",
    pressure: "气压",
    aqi: "空气质量",
    visibility: "能见度",
    celsius: "摄氏度",
    fahrenheit: "华氏度",
    kelvin: "开尔文",
    km: "km",
    miles: "英里",
    useLocation: "使用我的位置",
    weatherDetails: "天气详情",
    windSpeed: "风速",
    matching: "匹配",
    matchFound: "找到匹配！",
    noMoreMatches: "没有更多匹配",
    keepSwiping: "继续滑动以寻找更多朋友",
    aqiGood: "优",
    aqiFair: "良",
    aqiModerate: "轻度污染",
    aqiPoor: "中度污染",
    aqiVeryPoor: "重度污染",
    clock: "时钟",
    articlesPerPage: "每页文章数",
    swipeFriends: "滑动以寻找朋友",
    startChat: "开始聊天",
    hangarDoors: "请不要关闭机库门...",
    shareProfileTitle: "分享个人资料",
    scanToConnect: "扫描以在 SkyChat 上连接",
    copyLink: "复制个人资料链接",
    close: "关闭",
    date: "日期",
    locationLabel: "位置",
    resetRadar: "重置雷达"
  }
};

const AeroWatch = ({ className, lang = 'en', style = 'analog', background = null }: { className?: string, lang?: string, style?: 'analog' | 'chronograph' | 'digital' | 'aviator' | 'military' | 'racing' | 'luxury' | 'smart', background?: string | null }) => {
  const [time, setTime] = useState(new Date());
  const t = (TRANSLATIONS as any)[lang] || TRANSLATIONS.en;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();
  const utcTime = new Date(time.getTime() + time.getTimezoneOffset() * 60000);
  const utcHours = utcTime.getHours();
  const utcMinutes = utcTime.getMinutes();

  if (style === 'digital') {
    const isVideo = background?.startsWith('blob:') || background?.endsWith('.mp4') || background?.endsWith('.webm');
    return (
      <div className={cn("relative w-64 h-32 md:w-96 md:h-48 bg-black border-[6px] md:border-[8px] border-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden", className)}>
        {background && (
          <div className="absolute inset-0">
            {isVideo ? (
              <video src={background} className="w-full h-full object-cover opacity-30" autoPlay loop muted />
            ) : (
              <img src={background} className="w-full h-full object-cover opacity-30" alt="background" />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        <div className="relative z-10 text-center space-y-2">
          <div className="text-2xl md:text-4xl font-mono font-bold text-green-400">
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-sm md:text-lg font-mono text-green-400/60">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-32 h-32 md:w-44 md:h-44 rounded-full bg-black border-[6px] md:border-[8px] border-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_2px_15px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden", className)}>
      {/* Glossy Bezel */}
      <div className="absolute inset-0 rounded-full border-[1px] border-white/10 pointer-events-none z-30" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-30" />
      
      {/* Bezel Markers */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className={cn("absolute w-0.5 h-1.5 md:h-2 bg-white/20", i % 3 === 0 && "w-1 h-2 md:h-3 bg-white/40")} 
          style={{ 
            transform: `rotate(${i * 30}deg) translateY(${window.innerWidth < 768 ? '-52px' : '-72px'})` 
          }} 
        />
      ))}

      {/* Watch Face */}
      <div className="relative w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
        {/* Digital UTC Window at 6 o'clock */}
        <div className="absolute bottom-6 md:bottom-10 px-2 md:px-3 py-0.5 md:py-1 rounded bg-black/90 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] z-10 flex items-baseline gap-1">
          <span className="text-[10px] md:text-[14px] font-mono text-red-500 font-bold tracking-tighter">
            {utcHours.toString().padStart(2, '0')}:{utcMinutes.toString().padStart(2, '0')}
          </span>
          <span className="text-[4px] md:text-[6px] font-black text-white/30 uppercase">{t.utc}</span>
        </div>

        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "absolute w-0.5 md:w-1 h-2 md:h-3",
              i % 3 === 0 ? "bg-white h-3 md:h-4 w-1 md:w-1.5" : "bg-white/30"
            )} 
            style={{ 
              transform: `rotate(${i * 30}deg) translateY(${window.innerWidth < 768 ? '-42px' : '-54px'})` 
            }} 
          />
        ))}

        {/* Brand */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-6 md:-translate-y-8 text-center opacity-40">
          <span className="text-[5px] md:text-[7px] font-black italic text-white uppercase tracking-widest">AviationSort</span>
        </div>

        {/* Hands */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Hour Hand */}
          <div 
            className="absolute w-1 md:w-1.5 h-8 md:h-12 bg-white rounded-full origin-bottom shadow-lg z-10"
            style={{ bottom: '50%', transform: `rotate(${(hours % 12) * 30 + minutes * 0.5}deg)` }}
          />
          {/* Minute Hand */}
          <div 
            className="absolute w-0.5 md:w-1 h-12 md:h-18 bg-white/80 rounded-full origin-bottom shadow-lg z-10"
            style={{ bottom: '50%', transform: `rotate(${minutes * 6}deg)` }}
          />
          {/* Second Hand */}
          <div 
            className="absolute w-[1px] h-14 md:h-20 bg-red-500 rounded-full origin-bottom shadow-[0_0_8px_rgba(255,0,0,0.5)] z-20"
            style={{ bottom: '50%', transform: `rotate(${seconds * 6}deg)` }}
          />
          {/* Center Pin */}
          <div className="absolute w-2 md:w-2.5 h-2 md:h-2.5 bg-black border border-white/20 rounded-full z-30" />
        </div>
      </div>

      {/* Glass Reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-full z-40" />
    </div>
  );
};

const DynamicAtmosphere = () => (
  <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-black">
    {/* Deep Background Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-black to-black" />

    {/* Aurora Curtains */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={`aurora-${i}`}
        className="absolute w-[150%] h-[150%] opacity-[0.12]"
        style={{
          background: `radial-gradient(ellipse at center, ${
            i % 3 === 0 ? 'rgba(255, 0, 0, 0.4)' : 
            i % 3 === 1 ? 'rgba(128, 0, 128, 0.2)' : 
            'rgba(74, 74, 74, 0.3)'
          } 0%, transparent 70%)`,
          left: `${-25 + (i * 10)}%`,
          top: '-25%',
          filter: 'blur(100px)',
          transform: `skewX(${i % 2 === 0 ? '20deg' : '-20deg'})`,
        }}
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -50, 50, 0],
          scaleY: [1, 1.2, 0.9, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 30 + i * 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}

    {/* Light Refractions / Lens Flares */}
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={`refraction-${i}`}
        className="absolute w-[2px] h-[300%] bg-gradient-to-b from-transparent via-red-500/15 to-transparent"
        style={{
          left: `${15 + i * 25}%`,
          top: '-100%',
          rotate: '40deg',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [-300, 500],
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 20 + i * 8,
          repeat: Infinity,
          ease: "linear",
          delay: i * 4,
        }}
      />
    ))}

    {/* Drifting Clouds */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`cloud-${i}`}
        className="absolute bg-white/5 rounded-full blur-[100px]"
        style={{
          width: 600 + Math.random() * 600,
          height: 400 + Math.random() * 400,
          top: `${Math.random() * 100}%`,
        }}
        initial={{ x: '-150%' }}
        animate={{ x: '250%' }}
        transition={{
          duration: 120 + Math.random() * 120,
          repeat: Infinity,
          ease: "linear",
          delay: -Math.random() * 240,
        }}
      />
    ))}

    {/* Subtle Scanlines */}
    <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
         style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 3px)' }} />
    
    {/* Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
  </div>
);

const AeroBubbles = () => (
  <div className="aero-bubbles">
    <DynamicAtmosphere />
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className={cn(
          "bubble shadow-[inset_0_4px_12px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.3)]",
          i % 2 === 0 && "animate-aero-rotate",
          i % 4 === 0 ? "bg-red-500/10 border-red-500/20" : 
          i % 4 === 1 ? "bg-grey-500/10 border-grey-500/20" : 
          i % 4 === 2 ? "bg-red-900/10 border-red-900/20" :
          "bg-white/5 border-white/10"
        )}
        initial={{ 
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
          y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 200,
          scale: Math.random() * 0.4 + 0.3,
          opacity: Math.random() * 0.4 + 0.1
        }}
        animate={{ 
          y: -400,
          x: (Math.random() - 0.5) * 200 + (typeof window !== 'undefined' ? Math.random() * window.innerWidth : 500),
          rotate: [0, 360]
        }}
        transition={{ 
          duration: Math.random() * 30 + 30, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * -30
        }}
        style={{
          width: Math.random() * 120 + 40,
          height: Math.random() * 120 + 40,
          left: `${Math.random() * 100}vw`,
        }}
      />
    ))}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [weather, setWeather] = useState<WeatherData>({ 
    temp: 15, 
    condition: 'Loading...', 
    wind: 0, 
    visibility: 0,
    humidity: 0,
    pressure: 0,
    aqi: 0,
    city: 'London',
    icon: '01d',
    description: 'clear sky'
  });
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  const [notifications, setNotifications] = useState<string[]>([]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [calcMode, setCalcMode] = useState<'standard' | 'scientific' | 'analytical'>('standard');
  
  // SkyChat State
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId) || null, [chats, activeChatId]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<Record<string, any>>({});

  // Social State
  const [showQR, setShowQR] = useState(false);
  const [isSkyDropping, setIsSkyDropping] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<Friend[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'registration' | 'airline'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [reelHashtags, setReelHashtags] = useState<string[]>(['lhr', 'a380']);
  const [newHashtag, setNewHashtag] = useState('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'fr' | 'arz' | 'de' | 'ru' | 'es'>('en');
  const t = (TRANSLATIONS as any)[lang] || TRANSLATIONS.en;

  // Profile State
  const [profile, setProfile] = useState<ProfileData>({
    displayName: 'Aviation Enthusiast',
    bio: 'Passionate plane spotter based in London. Love wide-body aircraft and special liveries.',
    homeAirport: 'EGLL / LHR',
    favoriteAirline: 'Emirates',
    equipment: 'Sony A7R IV + 200-600mm',
    isPrivate: false
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // RSS Pagination State
  const [newsPage, setNewsPage] = useState(1);
  const [aviationPage, setAviationPage] = useState(1);
  const [worldPage, setWorldPage] = useState(1);
  const [newsPerPage, setNewsPerPage] = useState(10);
  const [newsTab, setNewsTab] = useState<'aviation' | 'world' | 'status'>('aviation');
  const [worldNews, setPoliticalNews] = useState<NewsItem[]>([]);
  const [worldSources, setPoliticalSources] = useState<NewsSource[]>([]);
  const [worldNewsLoading, setWorldNewsLoading] = useState(false);
  const [worldNewsProgress, setWorldNewsProgress] = useState(0);
  const [aviationSources, setAviationSources] = useState<NewsSource[]>([]);
  const [feedStatus, setFeedStatus] = useState<{url: string, status: 'loading' | 'success' | 'failed', message: string, time: string}[]>([]);
  const [watchStyle, setWatchStyle] = useState<'analog' | 'chronograph' | 'digital' | 'aviator' | 'military' | 'racing' | 'luxury' | 'smart'>('analog');
  const [watchBackground, setWatchBackground] = useState<string | null>(null);
  const watchBgInputRef = useRef<HTMLInputElement>(null);
  const [clockMode, setClockMode] = useState<'clock' | 'stopwatch' | 'timer' | 'world'>('clock');
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(300);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerRemaining]);

  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 0.01);
      }, 10);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [stopwatchRunning]);
  const [worldClocks, setWorldClocks] = useState([
    { city: 'New York', timezone: 'America/New_York' },
    { city: 'London', timezone: 'Europe/London' },
    { city: 'Dubai', timezone: 'Asia/Dubai' },
    { city: 'Tokyo', timezone: 'Asia/Tokyo' }
  ]);

  // SkyChat Matching State
  const [showMatching, setShowMatching] = useState(false);
  const [matchingIndex, setMatchingIndex] = useState(0);
  const [matches, setMatches] = useState<Friend[]>([]);

  // Authentication Functions
  const handleLogin = async (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);

    // Load user profile
    try {
      const profileRes = await fetch(`/api/profile?username=${username}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile({
          displayName: profileData.displayName || 'Aviation Enthusiast',
          bio: profileData.bio || 'Passionate plane spotter',
          homeAirport: profileData.homeAirport || 'EGLL / LHR',
          favoriteAirline: profileData.favoriteAirline || 'Emirates',
          equipment: profileData.equipment || 'Sony A7R IV + 200-600mm',
          isPrivate: profileData.isPrivate || false
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }

    // Load favorites
    try {
      const favoritesRes = await fetch(`/api/favorites?username=${username}`);
      if (favoritesRes.ok) {
        const favorites = await favoritesRes.json();
        setPhotos(prev => prev.map(p => ({
          ...p,
          isFavorite: favorites.includes(p.registration)
        })));
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setProfile({
      displayName: 'Aviation Enthusiast',
      bio: 'Passionate plane spotter based in London. Love wide-body aircraft and special liveries.',
      homeAirport: 'EGLL / LHR',
      favoriteAirline: 'Emirates',
      equipment: 'Sony A7R IV + 200-600mm',
      isPrivate: false
    });
    setPhotos(prev => prev.map(p => ({ ...p, isFavorite: false })));
  };

  // Check authentication on startup
  useEffect(() => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
    }
  }, [isLoggedIn]);

  // Initial Weather Fetch
  useEffect(() => {
    const fetchInitialWeather = async () => {
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "";
      try {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=${lang === 'ar' ? 'ar' : lang}`);
          const data = await response.json();
          
          const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
          const aqiData = await aqiResponse.json();

          setWeather({
            temp: data.main.temp,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            wind: data.wind.speed,
            visibility: data.main.visibility,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            aqi: aqiData.list[0].main.aqi,
            city: data.name,
            icon: data.weather[0].icon
          });
        }, async () => {
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric&lang=${lang === 'ar' ? 'ar' : lang}`);
          const data = await response.json();
          const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`);
          const aqiData = await aqiResponse.json();
          setWeather({
            temp: data.main.temp,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            wind: data.wind.speed,
            visibility: data.main.visibility,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            aqi: aqiData.list[0].main.aqi,
            city: data.name,
            icon: data.weather[0].icon
          });
        });
      } catch (error) {
        console.error("Initial weather fetch failed:", error);
      }
    };
    fetchInitialWeather();
  }, []);

  // Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const startTime = new Date().toLocaleTimeString();
        
        // Initialize feed status
        const initStatus = [
          ...(RSS_URLS || []).map((url: string) => ({ url, status: 'loading' as const, message: 'Fetching...', time: startTime })),
          ...(POLITICAL_RSS_URLS || []).map((url: string) => ({ url, status: 'loading' as const, message: 'Fetching...', time: startTime }))
        ];
        setFeedStatus(initStatus);
        
        const [photosRes, newsRes, storiesRes, friendsRes, requestsRes] = await Promise.all([
          fetch('/api/photos'),
          fetch('/api/news'),
          fetch('/api/stories'),
          fetch('/api/friends'),
          fetch('/api/friend-requests')
        ]);

        const photosData = await photosRes.json();
        const newsData = await newsRes.json();
        const storiesData = await storiesRes.json();
        const friendsData = await friendsRes.json();
        const requestsData = await requestsRes.json();

        setPhotos(photosData.map((p: any) => ({
          id: p.id,
          url: p.url,
          registration: p.aircraft || 'Unknown',
          airline: p.airline || 'Unknown',
          aircraftType: p.aircraft || 'Unknown',
          date: new Date().toLocaleDateString(),
          isFavorite: false
        })));
        
        if (newsData.articles) {
          setNews(newsData.articles.map((a: any, i: number) => ({
            id: String(i),
            title: a.title,
            summary: a.contentSnippet || '',
            date: a.pubDate ? new Date(a.pubDate).toLocaleDateString() : 'Recent',
            url: a.link,
            source: a.source
          })));
          setNewsSources(newsData.sources || []);
          
          // Update feed status with aviation sources
          if (newsData.sources) {
            setAviationSources(newsData.sources);
            setFeedStatus(prev => {
              const updated = [...prev];
              newsData.sources.forEach((s: any) => {
                const idx = updated.findIndex(f => f.url === s.url);
                if (idx >= 0) {
                  updated[idx] = {
                    url: s.url,
                    status: s.status === 'working' ? 'success' : 'failed',
                    message: s.status === 'working' ? `Fetched ${newsData.articles?.filter((a: any) => a.source === s.name).length || 0} articles` : s.status,
                    time: new Date().toLocaleTimeString()
                  };
                }
              });
              return updated;
            });
          }
        } else {
          setNews(newsData);
        }

        setStories(storiesData);
        setFriends(friendsData);
        setRequests(requestsData);

        // Fetch Political/World News with real-time progress
        try {
          setWorldNewsLoading(true);
          setWorldNewsProgress(0);
          
          const eventSource = new EventSource('/api/news/world/stream');
          
          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'start') {
                setWorldNewsProgress(0);
              } else if (data.type === 'progress') {
                setWorldNewsProgress(data.progress);
                // Update feed status with source info
                if (data.source && data.success !== undefined) {
                  setFeedStatus(prev => {
                    const sourceUrl = POLITICAL_RSS_URLS.find((url: string) => url.includes(data.source?.toLowerCase().replace(/\s/g, ''))) || '';
                    if (!sourceUrl) return prev;
                    const updated = [...prev];
                    const idx = updated.findIndex(f => f.url === sourceUrl);
                    if (idx >= 0) {
                      updated[idx] = {
                        url: sourceUrl,
                        status: data.success ? 'success' : 'failed',
                        message: data.success ? `Fetched ${data.itemsCount} articles` : 'Failed',
                        time: new Date().toLocaleTimeString()
                      };
                    }
                    return updated;
                  });
                }
              } else if (data.type === 'complete') {
                setWorldNewsProgress(100);
                setWorldNewsLoading(false);
                
                if (data.articles) {
                  setPoliticalNews(data.articles.map((a: any, i: number) => ({
                    id: String(i),
                    title: a.title,
                    summary: a.contentSnippet || '',
                    date: a.pubDate ? new Date(a.pubDate).toLocaleDateString() : 'Recent',
                    url: a.link,
                    source: a.source
                  })));
                  setPoliticalSources(data.sources || []);
                }
                eventSource.close();
              } else if (data.type === 'error') {
                console.error('Stream error:', data.error);
              }
            } catch (err) {
              console.error('Failed to parse SSE data:', err);
            }
          };
          
          eventSource.onerror = () => {
            setWorldNewsLoading(false);
            eventSource.close();
          };
        } catch (err) {
          console.error("Failed to fetch political news:", err);
        }

        // Fetch Weather (Open-Meteo)
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.4700&longitude=-0.4543&current_weather=true');
        const weatherData = await weatherRes.json();
        if (weatherData.current_weather) {
          setWeather({
            temp: Math.round(weatherData.current_weather.temperature),
            condition: 'Clear Sky',
            wind: Number(weatherData.current_weather.windspeed),
            visibility: 10,
            humidity: 50,
            pressure: 1013,
            aqi: 1,
            city: 'London',
            icon: '01d',
            description: 'Clear sky'
          });
        }

        // Initialize chats from friends
        setChats(friendsData.map((f: any) => ({
          id: f.id,
          username: f.username,
          avatar: f.avatar,
          lastMessage: 'Start a conversation...',
          time: '',
          unreadCount: 0,
          messages: []
        })));

      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };

    fetchData();
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Folder Parsing
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);

  // Reels Logic
  const reelsPhotos = useMemo(() => {
    if (reelHashtags.length === 0) {
      return [...photos].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }
    
    return photos
      .map(p => {
        const matches = (p.hashtags || []).filter((tag: string) => tag && reelHashtags.includes(tag.toLowerCase())).length || 0;
        return { ...p, score: matches };
      })
      .filter(p => p.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });
  }, [photos, reelHashtags]);

  const addHashtag = () => {
    const trimmed = newHashtag?.trim() || '';
    if (trimmed && !reelHashtags.includes(trimmed.toLowerCase())) {
      setReelHashtags(prev => [...prev, trimmed.toLowerCase()]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (tag: string) => {
    setReelHashtags(prev => prev.filter(t => t !== tag));
  };

  // FlexPics (Derived)
  const flexPics = useMemo(() => photos.filter(p => p.isFavorite), [photos]);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsing(true);
    setParseProgress(0);
    setCurrentFactIndex(0);
    
    const totalFiles = files.length;
    const chunkSize = 15; 

    // Fact rotation interval
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % MOCK_FACTS.length);
    }, 3000);

    const processBatch = async (startIndex: number) => {
      if (startIndex >= totalFiles) {
        clearInterval(factInterval);
        setIsParsing(false);
        setActiveTab('photos');
        return;
      }

      const chunk = Array.from(files).slice(startIndex, startIndex + chunkSize);
      const batch: Photo[] = [];
      
      for (let i = 0; i < chunk.length; i++) {
        const file = chunk[i] as File;
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          const name = file.name.replace(/\.[^/.]+$/, "");
          let registration = 'Unknown';
          let date = 'Unknown';
          let airline = 'Unknown';

          const regMatch = name.match(/^([A-Z0-9-]+)/);
          if (regMatch) registration = regMatch[1];

          const dateMatch = name.match(/\((\d{2}\.\d{2}\.\d{2})\)/);
          if (dateMatch) date = dateMatch[1];

          const airlineMatch = name.match(/\[(.*?)\]/);
          if (airlineMatch) airline = airlineMatch[1];

          batch.push({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file as any),
            registration,
            airline,
            aircraftType: 'Parsed Aircraft',
            date,
            isFavorite: false,
            isVideo: file.type.startsWith('video/')
          });
        }
      }

      if (batch.length > 0) {
        setPhotos(prev => [...batch, ...prev]);
      }
      
      const currentProgress = ((startIndex + chunk.length) / totalFiles) * 100;
      setParseProgress(Math.round(currentProgress));
      setCurrentFileName((chunk[chunk.length - 1] as any)?.name || '');
      
      // Process next batch with a minimal delay to keep UI responsive but fast
      setTimeout(() => processBatch(startIndex + chunkSize), 0);
    };

    processBatch(0);
  };



  const filteredPhotos = useMemo(() => {
    const safeSearch = searchQuery?.toLowerCase() || '';
    const filtered = photos.filter(p => 
      (p.registration || '').toLowerCase().includes(safeSearch) ||
      (p.airline || '').toLowerCase().includes(safeSearch) ||
      (p.aircraftType || '').toLowerCase().includes(safeSearch)
    );

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.date.localeCompare(b.date);
      if (sortBy === 'registration') comparison = a.registration.localeCompare(b.registration);
      if (sortBy === 'airline') comparison = a.airline.localeCompare(b.airline);
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [photos, searchQuery, sortBy, sortOrder]);

  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPhotos.slice(start, start + itemsPerPage);
  }, [filteredPhotos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);

  const paginatedFlexPics = useMemo(() => {
    const safeSearch = searchQuery?.toLowerCase() || '';
    const filtered = flexPics.filter(p => 
      (p.registration || '').toLowerCase().includes(safeSearch) ||
      (p.airline || '').toLowerCase().includes(safeSearch) ||
      (p.aircraftType || '').toLowerCase().includes(safeSearch)
    );

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.date.localeCompare(b.date);
      if (sortBy === 'registration') comparison = a.registration.localeCompare(b.registration);
      if (sortBy === 'airline') comparison = a.airline.localeCompare(b.airline);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [flexPics, searchQuery, sortBy, sortOrder, currentPage, itemsPerPage]);

  const totalFlexPages = Math.ceil(flexPics.length / itemsPerPage);

  const toggleFavorite = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    const newFavoriteStatus = !photo.isFavorite;
    
    if (!currentUser) return;

    try {
      await fetch('/api/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          registration: photo.registration,
          isFavorite: newFavoriteStatus
        })
      });

      setPhotos(prev => prev.map(p =>
        p.id === id ? { ...p, isFavorite: newFavoriteStatus } : p
      ));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const acceptRequest = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    try {
      // Add to friends
      const newFriend: Friend = {
        id: request.id,
        username: request.username,
        avatar: request.avatar,
        status: 'online',
        bio: 'New Friend'
      };

      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFriend)
      });

      // Remove from requests
      await fetch(`/api/friend-requests/${id}`, { method: 'DELETE' });

      setFriends(prev => [...prev, newFriend]);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      await fetch(`/api/friend-requests/${id}`, { method: 'DELETE' });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

  const activeChatRef = useRef<Chat | null>(null);
  useEffect(() => {
    activeChatRef.current = activeChat;
    if (activeChat) {
      // Mark messages as read locally
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            messages: chat.messages.map(m => ({ ...m, isRead: true }))
          };
        }
        return chat;
      }));
    }
  }, [activeChat]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!activeChat) return;
    
    if (typingTimeoutRef.current[activeChat.id]) {
      clearTimeout(typingTimeoutRef.current[activeChat.id]);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;
    
const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isRead: true
    };

    // Add message locally
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          lastMessage: newMessage.text,
          time: newMessage.time,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));
    
    setMessageInput('');

    // Simulation: Friend replying
    const chatId = activeChat.id;
    setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [activeChat.username]: true }));
      setTimeout(() => {
        setIsTyping(prev => ({ ...prev, [activeChat.username]: false }));
        const reply = {
          id: (Date.now() + 1).toString(),
          chatId: chatId,
          senderId: chatId,
          text: "That's awesome! I'm heading to the airport now to catch some more shots. ✈️",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          isRead: true
        };
        setChats(prev => prev.map(chat => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              lastMessage: reply.text,
              time: reply.time,
              messages: [...chat.messages, reply]
            };
          }
          return chat;
        }));
      }, 3000);
    }, 1500);
  };

  const handleSkyDrop = () => {
    setIsSkyDropping(true);
    setNearbyUsers([]);
    // Simulate finding users from friends list
    setTimeout(() => {
      setNearbyUsers(friends.slice(0, 3));
    }, 2000);
  };

  const [isSlideshow, setIsSlideshow] = useState(false);

  const saveProfile = async () => {
    if (!currentUser) return;

    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          profile: profile
        })
      });

      if (response.ok) {
        setNotifications(prev => [...prev, "Profile updated successfully!"]);
        setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
      } else {
        setNotifications(prev => [...prev, "Failed to update profile"]);
        setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setNotifications(prev => [...prev, "Failed to update profile"]);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isSlideshow && selectedPhoto) {
      interval = setInterval(() => {
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
        const nextIndex = (currentIndex + 1) % filteredPhotos.length;
        setSelectedPhoto(filteredPhotos[nextIndex]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSlideshow, selectedPhoto, filteredPhotos]);

  const handleCalcInput = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === '=') {
      try {
        // Simple eval for demo, in production use a math library
        const result = new Function('return ' + calcDisplay.replace('×', '*').replace('÷', '/'))();
        setCalcHistory(prev => [`${calcDisplay} = ${result}`, ...prev].slice(0, 5));
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay(prev => prev === '0' ? val : prev + val);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 md:p-8 relative overflow-hidden">
      <AeroBubbles />
      {/* Background Overlay for Frutiger Aero feel */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-red-600/10 via-grey-500/5 to-black/60 z-0" />

      {/* Main App Window */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-6xl h-[95vh] md:h-[80vh] vista-window flex flex-col z-10"
      >
        {/* Header / Title Bar */}
        <div className="vista-titlebar flex-col md:flex-row gap-4 md:gap-0 h-auto md:h-16 py-4 md:py-0">
          <div className="flex items-center gap-3 relative z-10 group cursor-pointer">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-800 p-0.5 shadow-[0_4px_15px_rgba(255,0,0,0.4)] group-hover:scale-110 transition-all duration-500">
              <div className="w-full h-full rounded-[9px] bg-black flex items-center justify-center relative overflow-hidden">
                <Plane className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500/20 blur-md rounded-full" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full blur-[2px] opacity-60" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-black tracking-tighter glossy-text uppercase italic leading-none">AviationSort</h1>
              <span className="text-[8px] md:text-[9px] font-bold text-red-500 uppercase tracking-[0.4em] leading-none mt-0.5">Enterprise</span>
            </div>
          </div>

            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-between md:justify-end overflow-x-auto no-scrollbar">
              <button
                onClick={() => setLang(lang === 'en' ? 'fr' : lang === 'fr' ? 'arz' : lang === 'arz' ? 'de' : lang === 'de' ? 'ru' : lang === 'ru' ? 'es' : 'en')}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-full px-3 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_2px_10px_rgba(255,255,255,0.1)] shrink-0 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm font-bold">{lang === 'en' ? '🇬🇧' : lang === 'fr' ? '🇫🇷' : lang === 'arz' ? '🇪🇬' : lang === 'de' ? '🇩🇪' : lang === 'ru' ? '🇷🇺' : '🇪🇸'}</span>
                <span className="text-xs font-bold uppercase tracking-widest">{lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : lang === 'arz' ? 'ARZ' : lang === 'de' ? 'DE' : lang === 'ru' ? 'RU' : 'ES'}</span>
              </button>
            <div className="aero-window-controls shrink-0">
              <button className="aero-control-btn"><Minus className="w-4 h-4" /></button>
              <button className="aero-control-btn"><Square className="w-3 h-3" /></button>
              <button className="aero-control-btn aero-control-btn-close"><X className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
          <div className="w-full md:w-20 lg:w-64 border-t md:border-t-0 md:border-r border-red-500/10 bg-red-950/40 backdrop-blur-3xl flex flex-row md:flex-col py-2 md:py-6 gap-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-[10px_0_30px_rgba(0,0,0,0.5)] order-2 md:order-1 overflow-x-auto md:overflow-y-auto">
            {[
              { id: 'dashboard', icon: LayoutGrid, label: t.dashboard },
              { id: 'photos', icon: Plane, label: t.album },
              { id: 'reels', icon: ImageIcon, label: t.reels },
              { id: 'flexpics', icon: Heart, label: t.flexpics },
              { id: 'news', icon: Newspaper, label: t.news },
              { id: 'skychat', icon: MessageSquare, label: t.skychat },
              { id: 'clock', icon: Clock, label: t.clock },
              { id: 'calculator', icon: Calculator, label: t.aerocalc },
              { id: 'profile', icon: User, label: t.profile },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "aero-sidebar-item group relative flex-1 md:flex-none py-3 md:py-4",
                  activeTab === tab.id && "text-red-500"
                )}
              >
                {activeTab === tab.id && (
                  <>
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-red-500 rounded-r-full shadow-[0_0_15px_rgba(255,0,0,0.8)] z-10 hidden md:block"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                      layoutId="active-tab-indicator-mobile"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-red-500 rounded-t-full shadow-[0_0_15px_rgba(255,0,0,0.8)] z-10 md:hidden"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  </>
                )}
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-1 md:gap-4">
                  <motion.div
                    variants={{
                      hover: {
                        scale: [1, 1.15, 1],
                        filter: [
                          "drop-shadow(0 0 0px rgba(255,0,0,0))",
                          "drop-shadow(0 0 12px rgba(255,0,0,0.6))",
                          "drop-shadow(0 0 0px rgba(255,0,0,0))"
                        ],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }
                    }}
                    animate={activeTab === tab.id ? {
                      scale: 1.1,
                      filter: "drop-shadow(0 0 8px rgba(255,0,0,0.5))"
                    } : {
                      scale: 1,
                      filter: "drop-shadow(0 0 0px rgba(255,0,0,0))"
                    }}
                    whileHover="hover"
                  >
                    <tab.icon className={cn(
                      "w-5 h-5 md:w-6 md:h-6 transition-colors duration-500", 
                      activeTab === tab.id ? "text-red-500" : "text-white/60 group-hover:text-white"
                    )} />
                  </motion.div>
                  <span className="md:block font-black italic uppercase text-[8px] md:text-[10px] tracking-widest">{tab.label}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
                
                {/* Glossy highlight effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.button>
            ))}
            
            <div className="hidden md:flex mt-auto px-6 py-8 flex-col items-center gap-6">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{t.aeroTime}</p>
                <p className="text-[8px] font-bold text-red-500/40 uppercase tracking-widest">{t.globalStandard}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-black/40 to-transparent order-1 md:order-2">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black italic glossy-text uppercase">{t.welcome}</h2>
                    <p className="text-white/60 max-w-xl">{t.welcomeSub}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="col-span-1 md:col-span-2 flex flex-col gap-6 relative">
                      <div className="aero-card-highlight" />
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2 text-lg"><FolderOpen className="text-red-500 w-6 h-6" /> {t.photoCollection}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-1 rounded-full font-bold uppercase tracking-wider">{t.ready}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-8 bg-black/20 group hover:border-red-500/30 transition-all">
                        {isParsing ? (
                          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${parseProgress}%` }}
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                              />
                            </div>
                            <span className="text-xs font-black italic text-red-500 animate-pulse">{t.parsing} {parseProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,0,0,0.1)]">
                              <Plane className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-sm text-white/60 mb-6 text-center">{t.selectFolderSub}</p>
                            <label className="aero-button-red cursor-pointer">
                              <FolderOpen className="w-5 h-5" />
                              <span>{t.selectFolder}</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                {...({ webkitdirectory: "" } as any)} 
                                onChange={handleFolderSelect} 
                              />
                            </label>
                          </>
                        )}
                      </div>
                    </GlassCard>

                    <div className="space-y-6">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsWeatherModalOpen(true)}
                          className="vista-gadget flex flex-col gap-4 relative overflow-hidden cursor-pointer group"
                        >
                          <div className="aero-card-highlight" />
                          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-red-500 group-hover:text-red-400 transition-colors"><Globe className="w-4 h-4" /> {t.weather}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-500/30 transition-colors">
                                <Activity className="w-6 h-6 text-red-500" />
                              </div>
                              <div>
                                <p className="text-xl font-black italic">{weather.temp.toFixed(1)}°C</p>
                                <p className="text-[8px] text-white/40 uppercase font-bold">{weather.condition}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-red-500 uppercase">{t.windSpeed}: {weather.wind}m/s</p>
                              <p className="text-[10px] font-bold text-white/40 uppercase">{t.visibility}: {(weather.visibility / 1000).toFixed(1)}km</p>
                            </div>
                          </div>
                        </motion.div>

                        <div className="vista-gadget flex flex-col gap-4">
                          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-red-500"><Users className="w-4 h-4" /> {t.friendsOnline}</h3>
                          <div className="flex -space-x-3 overflow-hidden p-1">
                            {friends.filter(f => f.status === 'online').map(f => (
                              <img key={f.id} src={f.avatar} className="inline-block h-10 w-10 rounded-full ring-2 ring-black shadow-lg border border-white/20" />
                            ))}
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-2 ring-black hover:bg-white/20 transition-colors border border-white/10">
                              <UserPlus className="h-5 w-5 text-white/40" />
                            </button>
                          </div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{friends.filter(f => f.status === 'online').length} {t.friendsOnline}</p>
                        </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'photos' && (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-black italic glossy-text uppercase tracking-tighter">{t.photoAlbum}</h2>
                      <label className="aero-button-black text-[10px] px-4 py-1.5 cursor-pointer">
                        <FolderOpen className="w-4 h-4" />
                        <span>{t.addFolder}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          {...({ webkitdirectory: "" } as any)} 
                          onChange={handleFolderSelect} 
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                      <div className="flex items-center gap-4 aero-glass px-4 py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.show}: {itemsPerPage}</span>
                        <input 
                          type="range" 
                          min="20" 
                          max="100" 
                          step="10"
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="aero-slider w-24 md:w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2 aero-glass px-3 py-1">
                        <Filter className="w-3 h-3 text-red-500" />
                        <select 
                          value={sortBy} 
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                        >
                          <option value="date" className="bg-black">Date</option>
                          <option value="registration" className="bg-black">Registration</option>
                          <option value="airline" className="bg-black">Airline</option>
                        </select>
                        <button 
                          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                          {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input 
                          type="text" 
                          placeholder={t.search}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedPhotos.map(photo => (
                        <PhotoCard 
                          key={photo.id} 
                          photo={photo} 
                          onClick={() => setSelectedPhoto(photo)} 
                          toggleFavorite={toggleFavorite} 
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 pt-8">
                        <AeroButton 
                          variant="black" 
                          className="px-4 py-2" 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </AeroButton>
                        <div className="flex items-center gap-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={cn(
                                "w-8 h-8 rounded-lg font-black text-xs transition-all",
                                currentPage === i + 1 
                                  ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.5)]" 
                                  : "bg-white/5 text-white/40 hover:bg-white/10"
                              )}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <AeroButton 
                          variant="black" 
                          className="px-4 py-2" 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </AeroButton>
                      </div>
                    )}
                </motion.div>
              )}

              {activeTab === 'reels' && (
                <motion.div
                  key="reels"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 h-full flex flex-col"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black italic glossy-text uppercase tracking-tighter">AeroReels</h2>
                      <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{t.reelsSub}</p>
                    </div>
                    
                    <GlassCard className="w-full md:w-auto p-4 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.adjustAlgorithm}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t.addHashtag}
                          value={newHashtag}
                          onChange={(e) => setNewHashtag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                          className="aero-input text-xs w-32"
                        />
                        <AeroButton variant="red" className="px-3 py-1 text-[10px]" onClick={addHashtag}>Add</AeroButton>
                      </div>
                      <div className="flex gap-2">
                        <AeroButton variant="black" className="px-3 py-1 text-[10px]" onClick={() => {
                          const tags = photos.flatMap(p => p.hashtags || []).filter((tag, i, arr) => arr.indexOf(tag) === i);
                          setReelHashtags(prev => [...new Set([...prev, ...tags])]);
                        }}>
                          From Album
                        </AeroButton>
                        <AeroButton variant="black" className="px-3 py-1 text-[10px]" onClick={() => {
                          const tags = flexPics.flatMap(p => p.hashtags || []).filter((tag, i, arr) => arr.indexOf(tag) === i);
                          setReelHashtags(prev => [...new Set([...prev, ...tags])]);
                        }}>
                          From FlexPics
                        </AeroButton>
                      </div>
                      <div className="flex flex-wrap gap-2 max-w-xs">
                        {reelHashtags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-500 flex items-center gap-1 group cursor-pointer hover:bg-red-500/30 transition-colors"
                            onClick={() => removeHashtag(tag)}
                          >
                            #{tag}
                            <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    {reelsPhotos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reelsPhotos.map((photo, idx) => (
                          <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="aero-card group relative aspect-[9/16] overflow-hidden rounded-[2rem]"
                          >
                            <img src={photo.url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-800 p-0.5 shadow-lg">
                                  <div className="w-full h-full rounded-full bg-black overflow-hidden border border-white/20">
                                    <img src={`https://picsum.photos/seed/${photo.airline}/100`} className="w-full h-full object-cover" />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-black text-sm italic uppercase tracking-tighter">{photo.airline}</h4>
                                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{photo.aircraftType}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {photo.hashtags?.map(tag => (
                                  <span key={tag} className="text-[10px] font-bold text-red-500">#{tag}</span>
                                ))}
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-4">
                                  <button onClick={() => toggleFavorite(photo.id)} className="group/btn">
                                    <Heart className={cn("w-6 h-6 transition-transform group-hover/btn:scale-125", photo.isFavorite ? "fill-red-500 text-red-500" : "text-white/60")} />
                                  </button>
                                  <button className="group/btn">
                                    <MessageSquare className="w-6 h-6 text-white/60 transition-transform group-hover/btn:scale-125" />
                                  </button>
                                  <button className="group/btn">
                                    <Share2 className="w-6 h-6 text-white/60 transition-transform group-hover/btn:scale-125" />
                                  </button>
                                </div>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{photo.registration}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <ImageIcon className="w-8 h-8 text-white/20" />
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-black italic uppercase glossy-text">{t.noReels}</h3>
                          <p className="text-sm text-white/40">{t.noReelsSub}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'news' && (
                <motion.div
                  key="news"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black italic glossy-text uppercase tracking-tighter">
                        {newsTab === 'aviation' ? t.aviationNews : t.worldNews}
                      </h2>
                      <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                        {newsTab === 'aviation' ? t.newsCredit : 'Coming Soon'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                      <div className="aero-glass px-6 py-3 flex flex-col gap-2 w-full md:w-64">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.articlesPerPage}</span>
                          <span className="text-xs font-black text-red-500">{newsPerPage}</span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="30" 
                          step="1"
                          value={newsPerPage}
                          onChange={(e) => {
                            setNewsPerPage(parseInt(e.target.value));
                            setNewsPage(1);
                          }}
                          className="aero-slider"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <AeroButton
                      variant={newsTab === 'aviation' ? 'red' : 'black'}
                      className="px-6 py-2"
                      onClick={() => { setNewsTab('aviation'); setAviationPage(1); }}
                    >
                      Aviation News
                    </AeroButton>
                    <AeroButton
                      variant={newsTab === 'world' ? 'red' : 'black'}
                      className="px-6 py-2"
                      onClick={() => { setNewsTab('world'); setWorldPage(1); }}
                    >
                      World News
                    </AeroButton>
                    <AeroButton
                      variant={newsTab === 'status' ? 'red' : 'black'}
                      className="px-6 py-2"
                      onClick={() => setNewsTab('status')}
                    >
                      Status
                    </AeroButton>
                  </div>

                  <motion.div 
                      layout 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                    {/* World News Progress Bar */}
                    {newsTab === 'world' && (
                      <motion.div 
                        className="space-y-3 p-4 bg-blue-950/20 border border-blue-500/20 rounded-2xl"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <motion.span 
                            className="text-white/60 font-bold uppercase tracking-widest"
                            layout
                          >
                            {t.loadingSources}
                          </motion.span>
                          <motion.span 
                            className="text-blue-400 font-black"
                            key={worldNewsProgress}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                          >
                            {worldNewsProgress}%
                          </motion.span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${worldNewsProgress}%` }}
                            transition={{ 
                              type: "spring",
                              stiffness: 60,
                              damping: 15,
                              mass: 0.5
                            }}
                          />
                          <motion.div 
                            className="absolute top-0 right-0 h-full w-2 bg-white/50 blur-sm"
                            animate={{ opacity: worldNewsLoading ? [0, 1, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <motion.span 
                            className="text-[10px] text-white/30 font-medium"
                            key={worldNewsLoading ? 'loading' : 'loaded'}
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                          >
                            {worldNewsLoading ? t.fetchingLatest : `${worldNews.length} ${t.articlesLoaded}`}
                          </motion.span>
                          <motion.span 
                            className="text-[9px] text-amber-400/70 font-medium bg-amber-500/10 px-2 py-0.5 rounded"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            {t.rssEnglishOnly}
                          </motion.span>
                        </div>
                      </motion.div>
                    )}
                    
                    {newsTab === 'aviation' ? (
                      news.slice((aviationPage - 1) * newsPerPage, aviationPage * newsPerPage).map(item => (
                      <GlassCard 
                        key={item.id} 
                        className="hover:border-red-500/30 transition-colors group cursor-pointer"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-red-900/20 flex items-center justify-center border border-white/5 relative">
                            <Newspaper className="w-12 h-12 text-red-500/40 group-hover:scale-110 transition-transform" />
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-black text-white/60 uppercase tracking-widest">
                              {item.source}
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{item.date}</span>
                              <Globe className="w-4 h-4 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors">{item.title}</h3>
                            <p className="text-sm text-white/60 line-clamp-2">{item.summary}</p>
                            <div className="pt-2 flex items-center justify-between">
                              <AeroButton variant="black" className="text-[10px] px-4 py-1">{t.readFull}</AeroButton>
                              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{t.source}: {item.source}</span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                      ))
                    ) : (
                      worldNews.length > 0 ? (
                        worldNews.slice((worldPage - 1) * newsPerPage, worldPage * newsPerPage).map(item => (
                        <GlassCard 
                          key={item.id} 
                          className="hover:border-blue-500/30 transition-colors group cursor-pointer"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-blue-900/20 flex items-center justify-center border border-white/5 relative">
                              <Newspaper className="w-12 h-12 text-blue-500/40 group-hover:scale-110 transition-transform" />
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-black text-white/60 uppercase tracking-widest">
                                {item.source}
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{item.date}</span>
                                <Globe className="w-4 h-4 text-white/20" />
                              </div>
                              <h3 className="text-xl font-bold group-hover:text-blue-500 transition-colors">{item.title}</h3>
                              <p className="text-sm text-white/60 line-clamp-2">{item.summary}</p>
                              <div className="pt-2 flex items-center justify-between">
                                <AeroButton variant="black" className="text-[10px] px-4 py-1">{t.readFull}</AeroButton>
                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{t.source}: {item.source}</span>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                            <Newspaper className="w-12 h-12 text-white/20" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-black italic uppercase glossy-text">No World News Today</h3>
                            <p className="text-sm text-white/40 max-w-xs">No news from the last 24 hours found.</p>
                          </div>
                        </div>
                      )
                    )}
                    
                    {/* Status Tab */}
                    {newsTab === 'status' && (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-black italic uppercase glossy-text">
                          {t.status}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {feedStatus.slice(-30).map((feed, idx) => (
                            <GlassCard 
                              key={idx} 
                              className={`p-3 border ${feed.status === 'success' ? 'border-green-500/20 bg-green-950/10' : feed.status === 'failed' ? 'border-red-500/20 bg-red-950/10' : 'border-yellow-500/20 bg-yellow-950/10'}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${feed.status === 'success' ? 'bg-green-500' : feed.status === 'failed' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
                                <span className="text-xs font-bold truncate flex-1">{feed.url.split('//')[1]?.split('/')[0] || feed.url}</span>
                              </div>
                              <p className="text-[10px] text-white/50 mt-1">{feed.message}</p>
                              <span className="text-[8px] text-white/30">{feed.time}</span>
                            </GlassCard>
                          ))}
                        </div>
                      </motion.div>
)}
                    </motion.div>

                  {newsTab === 'aviation' && Math.ceil(news.length / newsPerPage) > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-8">
                      <AeroButton 
                        variant="black" 
                        className="px-4 py-2" 
                        onClick={() => setAviationPage(prev => Math.max(1, prev - 1))}
                        disabled={aviationPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </AeroButton>
                      <span className="text-xs font-black italic text-white/40 uppercase tracking-widest">
                        Page {aviationPage} of {Math.ceil(news.length / newsPerPage)}
                      </span>
                      <AeroButton 
                        variant="black" 
                        className="px-4 py-2" 
                        onClick={() => setAviationPage(prev => Math.min(Math.ceil(news.length / newsPerPage), prev + 1))}
                        disabled={aviationPage === Math.ceil(news.length / newsPerPage)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </AeroButton>
                    </div>
                  )}

                  {newsTab === 'world' && worldNews.length > 0 && Math.ceil(worldNews.length / newsPerPage) > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-8">
                      <AeroButton 
                        variant="black" 
                        className="px-4 py-2" 
                        onClick={() => setWorldPage(prev => Math.max(1, prev - 1))}
                        disabled={worldPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </AeroButton>
                      <span className="text-xs font-black italic text-white/40 uppercase tracking-widest">
                        Page {worldPage} of {Math.ceil(worldNews.length / newsPerPage)}
                      </span>
                      <AeroButton 
                        variant="black" 
                        className="px-4 py-2" 
                        onClick={() => setWorldPage(prev => Math.min(Math.ceil(worldNews.length / newsPerPage), prev + 1))}
                        disabled={worldPage === Math.ceil(worldNews.length / newsPerPage)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </AeroButton>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'calculator' && (
                <motion.div
                  key="calculator"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col lg:flex-row gap-8 items-start h-full"
                >
                  <div className="w-full lg:w-96 aero-container p-8 space-y-6 relative">
                    <div className="aero-card-highlight" />

                    <div className="flex gap-2 justify-center">
                      {[
                        { id: 'standard', label: 'Standard' },
                        { id: 'scientific', label: 'Scientific' },
                        { id: 'analytical', label: 'Analytical' }
                      ].map((mode) => (
                        <AeroButton
                          key={mode.id}
                          variant={calcMode === mode.id ? 'red' : 'black'}
                          className="px-3 py-1 text-xs"
                          onClick={() => setCalcMode(mode.id as any)}
                        >
                          {mode.label}
                        </AeroButton>
                      ))}
                    </div>

                    <div className="bg-black/80 rounded-[2rem] p-6 text-right border border-white/20 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                      <div className="text-xs text-white/30 font-mono h-6 overflow-hidden truncate mb-1">
                        {calcHistory[0]?.split('=')[0] || t.calcTitle}
                      </div>
                      <div className="text-4xl font-mono font-black text-red-500 truncate drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]">
                        {calcDisplay}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {(calcMode === 'scientific' ? [
                        { label: 'sin', type: 'func' }, { label: 'cos', type: 'func' }, { label: 'tan', type: 'func' }, { label: 'C', type: 'clear' },
                        { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '÷', type: 'op' },
                        { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '×', type: 'op' },
                        { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '-', type: 'op' },
                        { label: '0', type: 'num' }, { label: '.', type: 'num' }, { label: 'lbs>kg', type: 'func' }, { label: '+', type: 'op' }
                      ] : calcMode === 'analytical' ? [
                        { label: 'C', type: 'clear' }, { label: '(', type: 'op' }, { label: ')', type: 'op' }, { label: '÷', type: 'op' },
                        { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '×', type: 'op' },
                        { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '-', type: 'op' },
                        { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '+', type: 'op' },
                        { label: '0', type: 'num' }, { label: '.', type: 'num' }, { label: 'lbs>kg', type: 'func' }, { label: '=', type: 'equal' }
                      ] : [
                        { label: 'C', type: 'clear' }, { label: '(', type: 'op' }, { label: ')', type: 'op' }, { label: '÷', type: 'op' },
                        { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '×', type: 'op' },
                        { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '-', type: 'op' },
                        { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '+', type: 'op' },
                        { label: '0', type: 'num' }, { label: '.', type: 'num' }, { label: 'lbs>kg', type: 'func' }, { label: '=', type: 'equal' }
                      ]).map(btn => (
                        <button
                          key={btn.label}
                          onClick={() => {
                            if (btn.label === 'lbs>kg') {
                              const val = parseFloat(calcDisplay);
                              if (!isNaN(val)) setCalcDisplay(String((val * 0.453592).toFixed(2)));
                            } else if (btn.label === 'sin') {
                              const val = parseFloat(calcDisplay);
                              if (!isNaN(val)) setCalcDisplay(String(Math.sin(val * Math.PI / 180).toFixed(4)));
                            } else if (btn.label === 'cos') {
                              const val = parseFloat(calcDisplay);
                              if (!isNaN(val)) setCalcDisplay(String(Math.cos(val * Math.PI / 180).toFixed(4)));
                            } else if (btn.label === 'tan') {
                              const val = parseFloat(calcDisplay);
                              if (!isNaN(val)) setCalcDisplay(String(Math.tan(val * Math.PI / 180).toFixed(4)));
                            } else {
                              handleCalcInput(btn.label);
                            }
                          }}
                          className={cn(
                            "h-14 rounded-2xl font-black transition-all active:scale-90 flex items-center justify-center relative overflow-hidden group shadow-lg border",
                            btn.type === 'equal' ? "bg-gradient-to-b from-red-500 to-red-800 border-red-400 text-white shadow-[0_4px_15px_rgba(255,0,0,0.4)]" : 
                            btn.type === 'op' ? "bg-white/10 border-white/10 text-red-500 hover:bg-white/20" : 
                            btn.type === 'clear' ? "bg-white/5 border-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-500" :
                            btn.type === 'func' ? "bg-red-500/10 border-red-500/20 text-red-500 text-[10px]" :
                            "bg-white/5 border-white/10 text-white hover:bg-white/10"
                          )}
                        >
                          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                          <span className="relative z-10">{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black italic glossy-text uppercase">{t.scientificTools}</h2>
                      <p className="text-white/40 text-sm">{t.scientificSub}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GlassCard className="space-y-4 relative">
                        <div className="aero-card-highlight" />
                        <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {t.recentHistory}
                        </h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                          {calcHistory.map((h, i) => (
                            <div key={i} className="p-3 aero-glass text-xs font-mono flex justify-between items-center group">
                              <span className="text-white/60">{h.split('=')[0]}</span>
                              <span className="text-red-500 font-black">= {h.split('=')[1]}</span>
                            </div>
                          ))}
                          {calcHistory.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-white/20 gap-2">
                              <Calculator className="w-8 h-8 opacity-20" />
                              <p className="text-[10px] uppercase font-bold tracking-widest">{t.noCalculations}</p>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </motion.div>
              )}



              {activeTab === 'flexpics' && (
                <motion.div
                  key="flexpics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-black italic glossy-text uppercase tracking-tighter">FlexPics</h2>
                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-black text-red-500 uppercase tracking-widest">
                          {flexPics.length} {t.favorites}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-4 aero-glass px-4 py-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.show}: {itemsPerPage}</span>
                          <input 
                            type="range" 
                            min="20" 
                            max="100" 
                            step="10"
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(parseInt(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="aero-slider w-24 md:w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2 aero-glass px-3 py-1">
                          <Filter className="w-3 h-3 text-red-500" />
                          <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                          >
                            <option value="date" className="bg-black">{t.sortByDate}</option>
                            <option value="registration" className="bg-black">{t.sortByReg}</option>
                            <option value="airline" className="bg-black">{t.sortByAirline}</option>
                          </select>
                          <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          >
                            {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {flexPics.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                          {paginatedFlexPics.map((photo) => (
                            <PhotoCard 
                              key={photo.id} 
                              photo={photo} 
                              onClick={() => setSelectedPhoto(photo)} 
                              toggleFavorite={toggleFavorite} 
                            />
                          ))}
                        </div>
                        {totalFlexPages > 1 && (
                          <div className="flex items-center justify-center gap-4 pt-8">
                            <AeroButton 
                              variant="black" 
                              className="px-4 py-2" 
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </AeroButton>
                            <div className="flex items-center gap-2">
                              {[...Array(totalFlexPages)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(i + 1)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg font-black text-xs transition-all",
                                    currentPage === i + 1 
                                      ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.5)]" 
                                      : "bg-white/5 text-white/40 hover:bg-white/10"
                                  )}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>
                            <AeroButton 
                              variant="black" 
                              className="px-4 py-2" 
                              onClick={() => setCurrentPage(prev => Math.min(totalFlexPages, prev + 1))}
                              disabled={currentPage === totalFlexPages}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </AeroButton>
                          </div>
                        )}
                      </>
                    ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6">
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        <Heart className="w-10 h-10 text-white/20" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-black italic uppercase glossy-text">{t.noFlexPics}</h3>
                        <p className="text-sm text-white/40 max-w-xs">{t.noFlexPicsSub}</p>
                      </div>
                      <AeroButton onClick={() => setActiveTab('photos')}>{t.goToAlbum}</AeroButton>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-5xl mx-auto space-y-8"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8 vista-glass p-8 rounded-[3rem]">
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-black p-1 shadow-[0_0_40px_rgba(255,0,0,0.4)] relative">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden border-4 border-white/10">
                          <img src="https://picsum.photos/seed/user/200" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                      </div>
                      <button className="absolute bottom-2 right-2 p-3 bg-red-600 rounded-full shadow-xl border border-white/20 hover:scale-110 transition-transform z-10">
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-4">
                      <div>
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <h2 className="text-4xl font-black italic glossy-text uppercase tracking-tighter">{profile.displayName}</h2>
                          {profile.isPrivate && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-red-500/20 p-1.5 rounded-full border border-red-500/30"
                            >
                              <Lock className="w-4 h-4 text-red-500" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-white/40 font-bold tracking-widest uppercase text-xs">{t.memberSince} April 2024</p>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <AeroButton onClick={() => setShowQR(true)} variant="red" className="text-xs">
                          <Share2 className="w-4 h-4" /> {t.shareProfile}
                        </AeroButton>
                        <AeroButton variant="black" className="text-xs" onClick={handleSkyDrop}>
                          <Plane className="w-4 h-4" /> {t.skydrop}
                        </AeroButton>
                        <AeroButton
                          variant="red"
                          className="text-xs"
                          onClick={saveProfile}
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              <Settings className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          {isSavingProfile ? t.saving : t.saveProfile}
                        </AeroButton>
                        <AeroButton
                          variant="black"
                          className="text-xs"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </AeroButton>
                      </div>
                    </div>

                    <GlassCard className="p-4 flex flex-col items-center gap-2 bg-white/5 border-white/20">
                      <div className="bg-white p-2 rounded-xl shadow-inner">
                        <QRCodeSVG value={window.location.href} size={80} />
                      </div>
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{t.scanToAdd}</span>
                    </GlassCard>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard className="space-y-4 relative vista-glass">
                          <div className="vista-header -mx-6 -mt-6 px-6 py-3 mb-4">
                            <h3 className="font-black italic text-red-500 uppercase tracking-widest text-sm">{t.personalInfo}</h3>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/40 uppercase font-bold">{t.displayName}</label>
                              <input 
                                type="text" 
                                value={profile.displayName} 
                                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                                className="aero-input w-full" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/40 uppercase font-bold">{t.bio}</label>
                              <textarea 
                                value={profile.bio} 
                                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                className="aero-input w-full h-24 resize-none" 
                              />
                            </div>

                          </div>
                        </GlassCard>

                        <GlassCard className="space-y-4 relative vista-glass">
                          <div className="vista-header -mx-6 -mt-6 px-6 py-3 mb-4">
                            <h3 className="font-black italic text-red-500 uppercase tracking-widest text-sm">{t.aviationPreferences}</h3>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/40 uppercase font-bold">{t.homeAirport}</label>
                              <input 
                                type="text" 
                                value={profile.homeAirport} 
                                onChange={(e) => setProfile(prev => ({ ...prev, homeAirport: e.target.value }))}
                                className="aero-input w-full" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/40 uppercase font-bold">{t.favoriteAirline}</label>
                              <input 
                                type="text" 
                                value={profile.favoriteAirline} 
                                onChange={(e) => setProfile(prev => ({ ...prev, favoriteAirline: e.target.value }))}
                                className="aero-input w-full" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/40 uppercase font-bold">{t.equipment}</label>
                              <input 
                                type="text" 
                                value={profile.equipment} 
                                onChange={(e) => setProfile(prev => ({ ...prev, equipment: e.target.value }))}
                                className="aero-input w-full" 
                              />
                            </div>
                          </div>
                        </GlassCard>

                        <GlassCard className="space-y-4 relative vista-glass">
                          <div className="vista-header -mx-6 -mt-6 px-6 py-3 mb-4 flex justify-between items-center">
                            <h3 className="font-black italic text-red-500 uppercase tracking-widest text-sm">{t.privacySettings}</h3>
                            <Shield className="w-4 h-4 text-red-500/50" />
                          </div>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 aero-glass rounded-2xl">
                              <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-tight">{t.privateProfile}</p>
                                <p className="text-[10px] text-white/40 font-medium">{t.privacySub}</p>
                              </div>
                              <button 
                                onClick={() => setProfile(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-all duration-300 relative p-1",
                                  profile.isPrivate ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "bg-white/10"
                                )}
                              >
                                <motion.div 
                                  animate={{ x: profile.isPrivate ? 24 : 0 }}
                                  className="w-4 h-4 bg-white rounded-full shadow-lg"
                                />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 aero-glass rounded-xl flex flex-col items-center gap-2 text-center">
                                {profile.isPrivate ? <EyeOff className="w-5 h-5 text-red-500" /> : <Eye className="w-5 h-5 text-red-500" />}
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                                  {profile.isPrivate ? t.statusHidden : t.statusVisible}
                                </span>
                              </div>
                              <div className="p-3 aero-glass rounded-xl flex flex-col items-center gap-2 text-center">
                                <Lock className={cn("w-5 h-5", profile.isPrivate ? "text-red-500" : "text-white/20")} />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                                  {profile.isPrivate ? t.bioLocked : t.bioPublic}
                                </span>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </div>

                      {/* Friend Requests Management Section */}
                      <GlassCard className="space-y-4 relative vista-glass">
                        <div className="vista-header -mx-6 -mt-6 px-6 py-3 mb-4 flex justify-between items-center">
                          <h3 className="font-black italic text-red-500 uppercase tracking-widest text-sm">{t.friendRequests}</h3>
                          <span className="text-[10px] font-bold text-white/40">{requests.length} {t.pending}</span>
                        </div>
                        {requests.length > 0 ? (
                          <div className="space-y-4">
                            {requests.map(req => (
                              <div key={req.id} className="flex items-center gap-4 p-4 aero-glass group hover:bg-white/10 transition-all">
                                <img src={req.avatar} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black italic uppercase tracking-tight">{req.username}</p>
                                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{req.time}</p>
                                </div>
                                <div className="flex gap-2">
                                  <AeroButton 
                                    variant="red" 
                                    className="px-4 py-2 text-[10px]"
                                    onClick={() => acceptRequest(req.id)}
                                  >
                                    <Check className="w-3 h-3" /> {t.accept}
                                  </AeroButton>
                                  <AeroButton 
                                    variant="black" 
                                    className="px-4 py-2 text-[10px]"
                                    onClick={() => rejectRequest(req.id)}
                                  >
                                    <X className="w-3 h-3" /> {t.reject}
                                  </AeroButton>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-10 text-center space-y-2">
                            <Bell className="w-8 h-8 text-white/10 mx-auto" />
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t.noPending}</p>
                          </div>
                        )}
                      </GlassCard>
                    </div>

                    <div className="space-y-6">
                      <GlassCard className="space-y-4 relative vista-glass">
                        <div className="vista-header -mx-6 -mt-6 px-6 py-3 mb-4 flex justify-between items-center">
                          <h3 className="font-black italic text-red-500 uppercase tracking-widest text-sm">{t.friendsLabel}</h3>
                          <span className="text-[10px] font-bold text-white/40">{friends.length} {t.total}</span>
                        </div>
                        <div className="space-y-3">
                          {friends.map(friend => (
                            <div key={friend.id} className="flex items-center gap-3 p-2 aero-glass hover:bg-white/10 transition-all cursor-pointer group">
                              <div className="relative">
                                <img src={friend.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                                <div className={cn(
                                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black",
                                  friend.status === 'online' ? "bg-green-500" : "bg-white/20"
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate group-hover:text-red-500 transition-colors">{friend.username}</p>
                                <p className="text-[10px] text-white/40 truncate">{friend.bio}</p>
                              </div>
                              <MoreHorizontal className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'skychat' && (
                <motion.div
                  key="skychat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col gap-6"
                >
                  {/* Stories Bar */}
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                        <Camera className="w-6 h-6 text-white/40" />
                      </div>
                      <span className="text-[10px] font-bold text-white/40">{t.mySnap}</span>
                    </div>
                    {stories.map(story => (
                      <button 
                        key={story.id} 
                        onClick={() => setSelectedStory(story)}
                        className="flex flex-col items-center gap-1 shrink-0 group"
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-full p-0.5 transition-transform group-hover:scale-105",
                          story.isUnread ? "bg-gradient-to-br from-red-500 to-red-800 shadow-[0_0_15px_rgba(255,0,0,0.3)]" : "bg-white/10"
                        )}>
                          <div className="w-full h-full rounded-full bg-black overflow-hidden border-2 border-black">
                            <img src={story.avatar} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-white/60 truncate w-16 text-center">{story.username}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
                    {/* Chat List / Matching */}
                    <div className="w-full md:w-80 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{showMatching ? t.matching : t.messages}</h3>
                          <button 
                            onClick={() => setShowMatching(!showMatching)}
                            className={cn(
                              "p-1.5 rounded-lg transition-all",
                              showMatching ? "bg-red-500 text-white shadow-lg" : "bg-white/5 text-white/40 hover:bg-white/10"
                            )}
                            title={t.matching}
                          >
                            <Heart className={cn("w-4 h-4", showMatching && "fill-current")} />
                          </button>
                        </div>

                        {showMatching ? (
                          <div className="space-y-4">
                            <div className="aero-container p-6 relative overflow-hidden flex flex-col gap-6 min-h-[400px]">
                              <div className="aero-card-highlight" />
                              {matchingIndex < friends.length ? (
                                <motion.div 
                                  key={friends[matchingIndex].id}
                                  initial={{ x: 300, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  exit={{ x: -300, opacity: 0 }}
                                  className="flex-1 flex flex-col gap-6"
                                >
                                  <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden relative group shadow-2xl">
                                    <img src={friends[matchingIndex].avatar} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter">{friends[matchingIndex].username}</h4>
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                      </div>
                                      <p className="text-xs text-white/60 font-bold leading-relaxed line-clamp-3">{friends[matchingIndex].bio}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-4">
                                    <button 
                                      onClick={() => setMatchingIndex(prev => prev + 1)}
                                      className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group"
                                    >
                                      <X className="w-8 h-8 text-white/20 group-hover:text-white transition-colors" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setNotifications(prev => [...prev, `${t.matchFound} ${friends[matchingIndex].username}`]);
                                        setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
                                        setMatchingIndex(prev => prev + 1);
                                      }}
                                      className="flex-1 h-14 rounded-2xl bg-gradient-to-b from-red-500 to-red-800 border border-red-400 flex items-center justify-center shadow-[0_8px_20px_rgba(255,0,0,0.3)] hover:scale-105 active:scale-95 transition-all group"
                                    >
                                      <Heart className="w-8 h-8 text-white fill-current group-hover:scale-110 transition-transform" />
                                    </button>
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Users className="w-10 h-10 text-white/20" />
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="text-xl font-black italic uppercase glossy-text">{t.noMoreMatches}</h3>
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{t.keepSwiping}</p>
                                  </div>
                                  <AeroButton variant="red" onClick={() => setMatchingIndex(0)} className="px-8">Reset Radar</AeroButton>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {chats.map(chat => (
                              <button
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={cn(
                                  "w-full flex items-center gap-4 p-4 aero-glass transition-all text-left group relative overflow-hidden",
                                  activeChatId === chat.id ? "border-red-500/50 bg-red-500/5" : "hover:bg-white/5"
                                )}
                              >
                                <div className="aero-card-highlight" />
                                <div className="relative">
                                  <img src={chat.avatar} className="w-12 h-12 rounded-full border border-white/10 group-hover:scale-105 transition-transform" />
                                  {chat.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-black">
                                      {chat.unreadCount}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center">
                                    <span className="font-black text-sm truncate group-hover:text-red-500 transition-colors">{chat.username}</span>
                                    <span className="text-[10px] text-white/40 font-bold">{chat.time}</span>
                                  </div>
                                  <p className="text-xs text-white/60 truncate italic">{chat.lastMessage}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {!showMatching && (
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">{t.friendsLabel}</h3>
                          <div className="space-y-2">
                            {friends.map(friend => (
                              <div key={friend.id} className="flex items-center gap-3 p-3 aero-glass hover:bg-white/5 transition-all cursor-pointer group">
                                <div className="relative">
                                  <img src={friend.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                                  <div className={cn(
                                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black",
                                    friend.status === 'online' ? "bg-green-500" : "bg-white/20"
                                  )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{friend.username}</p>
                                  <p className="text-[10px] text-white/40 truncate uppercase tracking-widest">{friend.status}</p>
                                </div>
                                <MessageSquare className="w-4 h-4 text-white/20 group-hover:text-red-500 transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Chat */}
                    <div className="hidden md:flex flex-1 flex-col vista-window overflow-hidden">
                      {activeChat ? (
                        <>
                          {/* Chat Header */}
                          <div className="vista-titlebar">
                            <div className="flex items-center gap-3">
                              <img src={activeChat.avatar} className="w-8 h-8 rounded-full border border-white/10" />
                              <div>
                                <h4 className="font-bold text-xs">{activeChat.username}</h4>
                                <span className="text-[8px] text-green-500 font-bold uppercase">{t.online}</span>
                              </div>
                            </div>
                            <div className="aero-window-controls">
                              <button className="aero-control-btn"><Camera className="w-4 h-4" /></button>
                              <button className="aero-control-btn"><Settings className="w-4 h-4" /></button>
                              <button className="aero-control-btn aero-control-btn-close"><X className="w-4 h-4" /></button>
                            </div>
                          </div>

                          {/* Chat Messages */}
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
                            {activeChat.messages.map(msg => (
                              <div key={msg.id} className={cn("flex", msg.isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                  "max-w-[70%] p-3 rounded-2xl text-sm shadow-lg relative",
                                  msg.isMe 
                                    ? "bg-red-600 text-white rounded-tr-none" 
                                    : "bg-white/10 text-white rounded-tl-none border border-white/5"
                                )}>
                                  {msg.text}
                                  <div className={cn("text-[8px] mt-1 opacity-50 flex items-center gap-1", msg.isMe ? "justify-end" : "justify-start")}>
                                    {msg.time}
                                    {msg.isMe && (
                                      <Check className={cn("w-2 h-2", msg.isRead ? "text-blue-400" : "text-white/40")} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {isTyping[activeChat.username] && (
                              <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-2 rounded-full px-4 flex gap-1 items-center">
                                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-red-500 rounded-full" />
                                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-red-500 rounded-full" />
                                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-red-500 rounded-full" />
                                  <span className="text-[8px] font-black uppercase tracking-widest ml-1 text-white/40">Typing...</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Chat Input */}
                          <div className="p-4 bg-black/40 border-t border-white/10 flex items-center gap-4">
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><ImageIcon className="w-5 h-5 text-white/40" /></button>
                            <div className="flex-1 relative">
                              <input 
                                type="text" 
                                placeholder="Send a snap..." 
                                value={messageInput}
                                onChange={handleTyping}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                              />
                            </div>
                            <button 
                              onClick={sendMessage}
                              className="p-2 bg-red-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                            <MessageSquare className="w-10 h-10 text-white/20" />
                          </div>
                          <div>
                            <h4 className="font-bold">Select a conversation</h4>
                            <p className="text-xs text-white/40">Connect with other aviators around the world.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'clock' && (
                <motion.div
                  key="clock"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col items-center justify-center gap-8 overflow-auto py-4"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black italic glossy-text uppercase tracking-tighter">{t.clock}</h2>
                    <p className="text-white/40 font-bold uppercase tracking-[0.4em]">{t.aeroTime}</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                    {[
                      { id: 'clock', label: 'Clock' },
                      { id: 'stopwatch', label: 'Stopwatch' },
                      { id: 'timer', label: 'Timer' },
                      { id: 'world', label: 'World Clock' }
                    ].map((mode) => (
                      <AeroButton
                        key={mode.id}
                        variant={clockMode === mode.id ? 'red' : 'black'}
                        className="px-4 py-2 text-xs"
                        onClick={() => setClockMode(mode.id as any)}
                      >
                        {mode.label}
                      </AeroButton>
                    ))}
                  </div>

                  {clockMode === 'clock' && (
                    <>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {[
                          { id: 'analog', label: 'Analog' },
                          { id: 'digital', label: 'Digital' }
                        ].map((style) => (
                          <AeroButton
                            key={style.id}
                            variant={watchStyle === style.id ? 'red' : 'black'}
                            className="px-3 py-1 text-xs"
                            onClick={() => setWatchStyle(style.id as any)}
                          >
                            {style.label}
                          </AeroButton>
                        ))}
                        {watchStyle === 'digital' && (
                          <>
                            <input
                              ref={watchBgInputRef}
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  setWatchBackground(url);
                                }
                              }}
                            />
                            <AeroButton
                              variant={watchBackground ? 'red' : 'black'}
                              className="px-3 py-1 text-xs"
                              onClick={() => watchBgInputRef.current?.click()}
                            >
                              {watchBackground ? 'Change BG' : 'Add BG'}
                            </AeroButton>
                            {watchBackground && (
                              <AeroButton
                                variant="grey"
                                className="px-3 py-1 text-xs"
                                onClick={() => {
                                  setWatchBackground(null);
                                }}
                              >
                                Remove
                              </AeroButton>
                            )}
                          </>
                        )}
                      </div>

                      <div className="relative group">
                        <div className="absolute -inset-10 bg-red-600/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <AeroWatch style={watchStyle} lang={lang} background={watchBackground} className="w-56 h-56 md:w-80 md:h-80 border-[10px] md:border-[14px]" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                        <GlassCard className="text-center space-y-1">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Local</p>
                          <p className="text-xl font-black italic">{new Date().toLocaleTimeString()}</p>
                        </GlassCard>
                        <GlassCard className="text-center space-y-1">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">UTC / Zulu</p>
                          <p className="text-xl font-black italic">{new Date().toISOString().slice(11, 19)}</p>
                        </GlassCard>
                        <GlassCard className="text-center space-y-1">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Timezone</p>
                          <p className="text-xl font-black italic">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
                        </GlassCard>
                      </div>
                    </>
                  )}

                  {clockMode === 'stopwatch' && (
                    <div className="flex flex-col items-center gap-8 w-full max-w-md">
                      <div className="w-64 h-64 rounded-full bg-black border-[8px] border-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center relative">
                        <div className="text-center">
                          <div className="text-4xl md:text-5xl font-mono font-bold text-red-500">
                            {Math.floor(stopwatchTime / 60).toString().padStart(2, '0')}:{(stopwatchTime % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-lg font-mono text-red-500/60">
                            .{Math.floor((stopwatchTime % 1) * 100).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <AeroButton
                          variant={stopwatchRunning ? 'red' : 'grey'}
                          className="w-24"
                          onClick={() => {
                            if (stopwatchRunning) {
                              setStopwatchRunning(false);
                            } else {
                              setStopwatchRunning(true);
                            }
                          }}
                        >
                          {stopwatchRunning ? 'Stop' : 'Start'}
                        </AeroButton>
                        <AeroButton
                          variant="black"
                          className="w-24"
                          onClick={() => {
                            setStopwatchTime(0);
                            setStopwatchRunning(false);
                          }}
                        >
                          Reset
                        </AeroButton>
                      </div>
                      {stopwatchRunning && (
                        <GlassCard className="w-full text-center">
                          <p className="text-xs text-white/40">Running...</p>
                        </GlassCard>
                      )}
                    </div>
                  )}

                  {clockMode === 'timer' && (
                    <div className="flex flex-col items-center gap-8 w-full max-w-md">
                      <div className="w-64 h-64 rounded-full bg-black border-[8px] border-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center relative">
                        <div className="text-center">
                          <div className="text-4xl md:text-5xl font-mono font-bold text-red-500">
                            {Math.floor(timerRemaining / 60).toString().padStart(2, '0')}:{(timerRemaining % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {[60, 120, 300, 600, 900, 1800].map((sec) => (
                          <AeroButton
                            key={sec}
                            variant={timerRemaining === sec && !timerRunning ? 'red' : 'black'}
                            className="px-3 py-1 text-xs"
                            onClick={() => {
                              setTimerRemaining(sec);
                              setTimerSeconds(sec);
                              setTimerRunning(false);
                            }}
                          >
                            {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                          </AeroButton>
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <AeroButton
                          variant={timerRunning ? 'red' : 'grey'}
                          className="w-24"
                          onClick={() => setTimerRunning(!timerRunning)}
                        >
                          {timerRunning ? 'Pause' : 'Start'}
                        </AeroButton>
                        <AeroButton
                          variant="black"
                          className="w-24"
                          onClick={() => {
                            setTimerRemaining(timerSeconds);
                            setTimerRunning(false);
                          }}
                        >
                          Reset
                        </AeroButton>
                      </div>
                    </div>
                  )}

                  {clockMode === 'world' && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {worldClocks.map((clock, idx) => (
                          <GlassCard key={idx} className="flex justify-between items-center">
                            <div className="text-center">
                              <p className="text-xs font-black text-red-500 uppercase tracking-widest">{clock.city}</p>
                              <p className="text-xs text-white/40">{clock.timezone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black italic">
                                {new Date().toLocaleTimeString('en-US', { timeZone: clock.timezone, hour: '2-digit', minute: '2-digit', hour12: false })}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {new Date().toLocaleDateString('en-US', { timeZone: clock.timezone, weekday: 'short' })}
                              </p>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer / Status Bar */}
        <div className="p-2 px-6 border-t border-white/10 bg-black/60 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-white/40">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Database Connected</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> PlaneDrop Active</span>
          </div>
          <div className="flex gap-4">
            <span>{photos.length} Photos Indexed</span>
            <span className="text-red-500/60">AviationSort Engine v1.0.42-web</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isParsing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full space-y-12 text-center relative">
              <div className="aero-bubbles">
                <div className="bubble w-32 h-32 top-0 left-0 animate-pulse" />
                <div className="bubble w-20 h-20 bottom-0 right-0 animate-bounce" />
              </div>

              <div className="space-y-4 relative z-10">
                <h2 className="text-5xl font-black italic glossy-text uppercase tracking-tighter animate-pulse">Indexing Hangar</h2>
                <p className="text-white/40 font-bold tracking-[0.3em] uppercase text-xs">AviationSort Engine v1.0.42</p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="aero-progress-bg h-4">
                  <motion.div 
                    className="aero-progress-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${parseProgress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <div className="aero-progress-shimmer" />
                  </motion.div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-black italic uppercase tracking-widest text-red-500 truncate max-w-[200px]">
                      {t.processing}: {currentFileName || 'Flight Data'}
                    </span>
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">AeroEngine Cluster Active</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black italic text-red-500">{parseProgress}%</span>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{t.complete}</p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFactIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="aero-glass p-8 min-h-[160px] flex flex-col items-center justify-center gap-4 relative"
                >
                  <div className="aero-card-highlight" />
                  <Plane className="w-8 h-8 text-red-500 animate-bounce" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Aviation Fact #{currentFactIndex + 1}</p>
                    <p className="text-lg font-bold italic leading-tight max-w-md mx-auto">{MOCK_FACTS[currentFactIndex]}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest animate-pulse">Please do not close the hangar doors...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SkyDropModal 
        isOpen={isSkyDropping} 
        onClose={() => setIsSkyDropping(false)} 
        nearbyUsers={nearbyUsers}
        isScanning={nearbyUsers.length === 0}
      />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="aero-container p-8 max-w-sm w-full text-center space-y-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aero-card-highlight" />
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic glossy-text uppercase">Share Profile</h3>
                <p className="text-xs text-white/40 font-bold tracking-widest uppercase">Scan to connect on SkyChat</p>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] flex justify-center">
                <QRCodeSVG 
                  value={`https://aviationsort.web/profile/${(profile.displayName || '').toLowerCase().replace(/\s+/g, '-')}`} 
                  size={200} 
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="flex flex-col gap-3">
                <AeroButton variant="red" className="w-full">Copy Profile Link</AeroButton>
                <AeroButton variant="black" className="w-full" onClick={() => setShowQR(false)}>Close</AeroButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-5xl w-full aero-container overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 bg-black flex items-center justify-center relative">
                <img src={selectedPhoto.url} className="max-w-full max-h-[70vh] object-contain" />
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-600 rounded-full transition-colors border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="w-full md:w-80 p-6 space-y-6 bg-black/40">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic text-red-500">{selectedPhoto.registration}</h3>
                  <p className="text-lg font-bold">{selectedPhoto.airline}</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">{selectedPhoto.aircraftType}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 aero-glass space-y-1">
                    <span className="text-[10px] text-white/40 uppercase font-bold">Date</span>
                    <p className="text-xs font-bold">{selectedPhoto.date}</p>
                  </div>
                  <div className="p-3 aero-glass space-y-1">
                    <span className="text-[10px] text-white/40 uppercase font-bold">Location</span>
                    <p className="text-xs font-bold">LHR / EGLL</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <AeroButton 
                    variant="red" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setIsSlideshow(!isSlideshow)}
                  >
                    {isSlideshow ? <X className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                    {isSlideshow ? 'Stop Slideshow' : 'Start Slideshow'}
                  </AeroButton>
                  <AeroButton 
                    variant={selectedPhoto.isFavorite ? 'red' : 'black'} 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => toggleFavorite(selectedPhoto.id)}
                  >
                    <Heart className={cn("w-4 h-4", selectedPhoto.isFavorite && "fill-current")} />
                    {selectedPhoto.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                  </AeroButton>
                  <AeroButton variant="black" className="w-full flex items-center justify-center gap-2">
                    <Maximize2 className="w-4 h-4" /> View Original
                  </AeroButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Viewer */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={() => setSelectedStory(null)}
          >
            <div className="relative h-full max-h-[90vh] aspect-[9/16] aero-container overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.2)]">
              <img src={selectedStory.imageUrl} className="w-full h-full object-cover" />
              
              {/* Story Header */}
              <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-red-500 p-0.5">
                  <img src={selectedStory.avatar} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{selectedStory.username}</h4>
                  <span className="text-[10px] text-white/40">2h ago</span>
                </div>
                <button 
                  onClick={() => setSelectedStory(null)}
                  className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Story Progress Bar */}
              <div className="absolute top-2 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  onAnimationComplete={() => setSelectedStory(null)}
                  className="h-full bg-red-500"
                />
              </div>

              {/* Story Footer */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Reply..." 
                    className="flex-1 bg-white/10 border border-white/20 rounded-full py-2 px-4 text-sm focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button className="p-2 bg-red-600 rounded-full"><Send className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aero Taskbar */}
      <div className="aero-taskbar">
        <button className="vista-start-button">
          <Plane className="w-5 h-5 text-white drop-shadow-md" />
        </button>
        <div className="flex-1 flex items-center gap-2 px-4">
          <div className="aero-task-item aero-task-item-active">
            <Plane className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">AviationSort</span>
          </div>
          <div className="aero-task-item opacity-50">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Photos</span>
          </div>
        </div>
        <div className="flex items-center gap-4 px-4 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[8px] text-white/40 font-bold uppercase">{new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
          </div>
          <div className="w-1 h-8 bg-white/10 rounded-full" />
        </div>
      </div>
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        t={t}
        lang={lang}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
