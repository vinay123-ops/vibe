import { Server } from 'socket.io';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  const COUPLE_ROOM = "orbit_room_1";

  // Keep a lightweight state in memory on the server
  let currentRoomState = {
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    lastUpdateTimestamp: Date.now()
  };

  io.on('connection', (socket) => {
    console.log(`🟢 Device Connected: ${socket.id}`);
    socket.join(COUPLE_ROOM);

    // ==========================================
    // LATE JOINER SYNC
    // ==========================================
    // When a phone connects, it asks for the current state
    socket.on('request_sync', () => {
      console.log(`🔄 Sending current state to late joiner: ${socket.id}`);
      socket.emit('initial_sync', currentRoomState);
    });

    // ==========================================
    // VIBE & CONTEXT ENGINE
    // ==========================================
    socket.on('send_vibe', () => {
      socket.to(COUPLE_ROOM).emit('receive_vibe', {
        timestamp: new Date(),
        message: "Thinking of you"
      });
    });

    socket.on('update_status', (statusData) => {
      socket.to(COUPLE_ROOM).emit('partner_status', statusData);
    });

    // ==========================================
    // LISTEN TOGETHER ENGINE
    // ==========================================
    socket.on('sync_track', (trackData) => {
      // Update server state
      currentRoomState.currentTrack = trackData;
      currentRoomState.currentTime = 0;
      currentRoomState.isPlaying = true;
      currentRoomState.lastUpdateTimestamp = Date.now();

      socket.to(COUPLE_ROOM).emit('partner_sync_track', trackData);
    });

    socket.on('play_music', (position) => {
      currentRoomState.isPlaying = true;
      currentRoomState.currentTime = position;
      currentRoomState.lastUpdateTimestamp = Date.now();

      // Send the timestamp so the receiving phone can calculate network latency!
      socket.to(COUPLE_ROOM).emit('partner_play_music', { position, timestamp: Date.now() });
    });

    socket.on('pause_music', (position) => {
      currentRoomState.isPlaying = false;
      currentRoomState.currentTime = position;

      socket.to(COUPLE_ROOM).emit('partner_pause_music', { position });
    });

    socket.on('seek_music', (position) => {
      currentRoomState.currentTime = position;
      currentRoomState.lastUpdateTimestamp = Date.now();

      socket.to(COUPLE_ROOM).emit('partner_seek_music', { position, timestamp: Date.now() });
    });

    // ==========================================
    // THE SHARED QUEUE
    // ==========================================
    socket.on('add_to_queue', (trackData) => {
      socket.to(COUPLE_ROOM).emit('partner_add_to_queue', trackData);
    });

    socket.on('shift_queue', () => {
      socket.to(COUPLE_ROOM).emit('partner_shift_queue');
    });

    socket.on('send_reaction', (emoji) => {
      // User taps a ❤️ or 🔥 on the album art
      socket.to(COUPLE_ROOM).emit('receive_reaction', emoji);
    });

    socket.on('ping_time', (clientTime) => {
      // Bounce the client's time back to them, along with the exact server time
      socket.emit('pong_time', {
        clientTime: clientTime,
        serverTime: Date.now()
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Device Disconnected: ${socket.id}`);
    });
  });

  return io;
};