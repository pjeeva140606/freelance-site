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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
