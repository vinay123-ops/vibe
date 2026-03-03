import mongoose from 'mongoose';
import http from 'http'; // <-- Import Node's native HTTP module
import app from './app.js';
import './config/db.js';
import { initializeSocket } from './websocket.js'; // <-- Import your new socket logic

const PORT = process.env.PORT || 5000;

// 1. Create the raw HTTP server using your Express app
const server = http.createServer(app);

// 2. Attach Socket.io to that HTTP server
initializeSocket(server);

// 3. Call .listen() on the SERVER, not the app!
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
