require('dotenv').config()
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, '../dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"))
})

const options = {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT)
};

// Create a secure HTTPS server
const server = https.createServer(options, app);

// Start the server
server.listen(process.env.SERVE_PORT, () => {
  console.log(`Server listening on port ${process.env.SERVE_PORT}`);
});
