require('dotenv').config()
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, '../dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"))
})

// Create a secure HTTP server
const server = http.createServer(app);

// Start the server
server.listen(process.env.SERVE_PORT, () => {
  console.log(`Server listening on port ${process.env.SERVE_PORT}`);
});
