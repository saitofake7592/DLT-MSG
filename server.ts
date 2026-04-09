import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(process.cwd(), 'armi_logs.json');

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/logs', (req, res) => {
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

app.post('/api/logs', (req, res) => {
  try {
    const { sender, message, app: appName } = req.body;
    if (!sender || !message) {
      return res.status(400).json({ error: 'Sender and message are required' });
    }

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    const newLog = {
      id: Date.now().toString(),
      sender,
      message,
      app: appName || 'Unknown',
      timestamp: new Date().toISOString(),
    };

    logs.unshift(newLog); // Add to beginning
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save log' });
  }
});

app.delete('/api/logs', (req, res) => {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify([]));
    res.json({ message: 'All logs cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
