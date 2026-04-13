import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Parser from "rss-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

const PORT = 3000;
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  },
});

const FEEDS = [
  { name: "Simple Flying", url: "https://simpleflying.com/feed/" },
  { name: "Sam Chui", url: "https://samchui.com/feed/" },
  { name: "AeroRoutes", url: "https://www.aeroroutes.com/?format=rss" },
  { name: "Aero-News Network", url: "https://www.aero-news.net/news/rssCOMANW.xml" }
];

app.use(cors());
app.use(express.json());

// Mock Data for missing routes
app.get("/api/photos", (req, res) => res.json([]));
app.get("/api/stories", (req, res) => res.json([]));
app.get("/api/friends", (req, res) => res.json([]));
app.get("/api/friend-requests", (req, res) => res.json([]));

app.get("/api/news", async (req, res) => {
  const results = [];
  const sourceStatus = [];

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      sourceStatus.push({ name: feed.name, status: "working" });
      
      const items = feedData.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet,
        source: feed.name,
        isoDate: item.isoDate
      }));
      results.push(...items);
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
      sourceStatus.push({ name: feed.name, status: "failed" });
    }
  }

  results.sort((a, b) => {
    const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
    const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
    return dateB - dateA;
  });

  res.json({
    articles: results.slice(0, 50),
    sources: sourceStatus
  });
});

// Socket.io Telemetry
io.on("connection", (socket) => {
  console.log("Client connected to telemetry");
  
  const interval = setInterval(() => {
    socket.emit("telemetry", {
      time: new Date().toISOString(),
      cpu: Math.floor(Math.random() * 30) + 10,
      ram: Math.floor(Math.random() * 20) + 40
    });
  }, 2000);

  socket.on("disconnect", () => {
    clearInterval(interval);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
