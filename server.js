const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Allow the server to read JSON from forms
app.use(express.json());

// Serve all files (HTML, CSS, JS) from this folder
app.use(express.static(__dirname));

// Handle contact form submission
app.post('/send', (req, res) => {
  const { name, email, message } = req.body;

  // Validate — make sure all fields are filled
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Save message to a file
  const entry = { name, email, message, date: new Date().toISOString() };

  fs.readFile('messages.json', 'utf8', (err, data) => {
    const messages = err ? [] : JSON.parse(data);
    messages.push(entry);

    fs.writeFile('messages.json', JSON.stringify(messages, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Could not save message.' });
      }
      res.json({ success: true });
    });
  });
});

// Simple password for viewing messages
const ADMIN_PASSWORD = 'admin123';

// Admin page to view messages
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Messages</title>
      <style>
        body { font-family: Arial; max-width: 700px; margin: 40px auto; padding: 0 20px; }
        input, button { padding: 10px; font-size: 16px; }
        .msg { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .msg strong { color: #6c63ff; }
        .msg .date { color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <h1>Messages</h1>
      <input type="password" id="pw" placeholder="Password">
      <button onclick="load()">View</button>
      <div id="list"></div>
      <script>
        async function load() {
          const pw = document.getElementById('pw').value;
          const res = await fetch('/api/messages?pw=' + encodeURIComponent(pw));
          const data = await res.json();
          if (data.error) { document.getElementById('list').innerHTML = '<p style="color:red">' + data.error + '</p>'; return; }
          document.getElementById('list').innerHTML = data.map(m =>
            '<div class="msg"><strong>' + m.name + '</strong> (' + m.email + ')<br>' + m.message + '<br><span class="date">' + new Date(m.date).toLocaleString() + '</span></div>'
          ).join('') || '<p>No messages yet.</p>';
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoint to get messages
app.get('/api/messages', (req, res) => {
  if (req.query.pw !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password.' });
  }
  fs.readFile('messages.json', 'utf8', (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
