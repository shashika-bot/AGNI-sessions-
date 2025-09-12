const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

__path = process.cwd();

require('events').EventEmitter.defaultMaxListeners = 500;

// MongoDB session functions
const { saveSession, loadSession } = require('./db');
const makeWASocket = require('@whiskeysockets/baileys').default;

// ========== ROUTES ==========
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start WhatsApp bot route
app.get('/code', async (req, res) => {
  try {
    let authState = await loadSession();

    const sock = makeWASocket({
      auth: authState || {},
      printQRInTerminal: true, // first time only
    });

    sock.ev.on("creds.update", async (auth) => {
      await saveSession(auth);
    });

    res.json({
      status: "✅ Bot started",
      session: authState ? "restored" : "new"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to start bot" });
  }
});

// Default route -> serve HTML
app.use('/', async (req, res) => {
  res.sendFile(__path + '/pair.html');
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`⏩ Server running on http://localhost:${PORT}`);
});

module.exports = app;
