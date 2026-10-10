import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

export interface BroadcastSoundEvent {
  id: string;
  title: string;
  audioData: string;
  volume: number;
  timestamp: number;
  sender: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large audio base64 payloads (up to 15MB)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // In-memory real-time state
  const sseClients = new Set<Response>();
  let latestBroadcast: BroadcastSoundEvent | null = null;
  const broadcastHistory: BroadcastSoundEvent[] = [];

  // API Routes FIRST

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', onlineListeners: sseClients.size });
  });

  // Get current active broadcast state and history
  app.get('/api/broadcast/status', (req: Request, res: Response) => {
    res.json({
      onlineListeners: sseClients.size,
      latestBroadcast,
      history: broadcastHistory.slice(0, 20),
    });
  });

  // Server-Sent Events (SSE) Stream for real-time global audio distribution
  app.get('/api/broadcast/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Add this visitor to global listener set
    sseClients.add(res);

    // Send initial handshake with online count
    const welcomeMsg = JSON.stringify({
      type: 'connected',
      onlineListeners: sseClients.size,
    });
    res.write(`data: ${welcomeMsg}\n\n`);

    // Broadcast updated listener count to all clients
    broadcastListenerCount();

    // Heartbeat every 15s to keep connection alive through cloud proxies
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      sseClients.delete(res);
      broadcastListenerCount();
    });
  });

  function broadcastListenerCount() {
    const payload = `data: ${JSON.stringify({ type: 'presence', onlineListeners: sseClients.size })}\n\n`;
    sseClients.forEach((client) => {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    });
  }

  // Global Broadcast Dispatcher Endpoint
  app.post('/api/broadcast/send', (req: Request, res: Response) => {
    const { title, audioData, volume = 0.85, sender = 'Admin' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'audioData is required' });
    }

    const event: BroadcastSoundEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: title || 'Global Audio Broadcast',
      audioData,
      volume: Math.min(1, Math.max(0, parseFloat(volume) || 0.85)),
      timestamp: Date.now(),
      sender: sender || 'Admin (fastyjay)',
    };

    latestBroadcast = event;
    broadcastHistory.unshift(event);
    if (broadcastHistory.length > 50) {
      broadcastHistory.pop();
    }

    // Push event to ALL connected clients worldwide
    const sseMessage = `data: ${JSON.stringify({ type: 'sound', event })}\n\n`;
    let deliveredCount = 0;

    sseClients.forEach((client) => {
      try {
        client.write(sseMessage);
        deliveredCount++;
      } catch (err) {
        sseClients.delete(client);
      }
    });

    console.log(`[Global Broadcast] Dispatched "${event.title}" to ${deliveredCount} worldwide clients`);

    return res.json({
      success: true,
      deliveredToCount: deliveredCount,
      event,
    });
  });

  // Dedicated HTML file routes
  app.get(['/soundboard', '/soundboard.html'], (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'soundboard.html'));
  });

  app.get(['/fnf', '/FNF', '/fnf.html', '/FNF.html'], (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'FNF.html'));
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (req.path === '/fastyjay.html' || req.path === '/fastyjay') {
        res.sendFile(path.join(distPath, 'fastyjay.html'));
      } else if (req.path === '/soundboard.html' || req.path === '/soundboard') {
        res.sendFile(path.join(process.cwd(), 'soundboard.html'));
      } else if (req.path === '/FNF.html' || req.path === '/FNF' || req.path === '/fnf') {
        res.sendFile(path.join(process.cwd(), 'FNF.html'));
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CalcPlanet Global Audio Dispatch Server running on port ${PORT}`);
  });
}

startServer();
