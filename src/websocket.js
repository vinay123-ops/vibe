import { Server } from 'socket.io';

export const initializeSocket = (httpServer) => {
  // Bind Socket.io to the raw HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // You can lock this down to your app's origin later
      methods: ["GET", "POST"]
    }
  });

  // A dedicated room just for your two devices
  const COUPLE_ROOM = "orbit_room_1";

  io.on('connection', (socket) => {
    console.log(`🟢 Device Connected: ${socket.id}`);

    // Automatically join the shared couple's room
    socket.join(COUPLE_ROOM);
    console.log(`Device ${socket.id} joined ${COUPLE_ROOM}`);

    // ==========================================
    // 1. VIBE ENGINE
    // ==========================================
    socket.on('send_vibe', () => {
      console.log(`❤️ Vibe triggered by ${socket.id}`);
      
      // Broadcast the vibe to the OTHER person in the room
      socket.to(COUPLE_ROOM).emit('receive_vibe', {
        timestamp: new Date(),
        message: "Thinking of you"
      });
    });

    // ==========================================
    // 2. CONTEXT AWARENESS (Location + Battery)
    // ==========================================
    socket.on('update_status', (statusData) => {
      // statusData contains { coords, batteryLevel, isCharging }
      // Bounce this complete payload to the other person
      socket.to(COUPLE_ROOM).emit('partner_status', statusData);
    });

    // ==========================================
    // 3. LISTEN TOGETHER ENGINE
    // ==========================================
    // When you tap a song, tell her phone to load the same song
    socket.on('sync_track', (trackData) => {
      console.log(`🎵 Syncing track from ${socket.id}: ${trackData.title}`);
      socket.to(COUPLE_ROOM).emit('partner_sync_track', trackData);
    });

    // When you hit play, tell her phone to play
    socket.on('play_music', (position) => {
      socket.to(COUPLE_ROOM).emit('partner_play_music', position);
    });

    // When you hit pause, tell her phone to pause
    socket.on('pause_music', (position) => {
      socket.to(COUPLE_ROOM).emit('partner_pause_music', position);
    });

    // When someone drags the slider, tell the partner's phone to jump to that exact millisecond
    socket.on('seek_music', (position) => {
      socket.to(COUPLE_ROOM).emit('partner_seek_music', position);
    });

    // ==========================================
    // 4. THE SHARED QUEUE
    // ==========================================
    // When someone adds a song to the queue
    socket.on('add_to_queue', (trackData) => {
      console.log(`🎶 Track added to queue by ${socket.id}: ${trackData.title}`);
      socket.to(COUPLE_ROOM).emit('partner_add_to_queue', trackData);
    });

    // When the queue moves to the next song, we need to sync the shift
    socket.on('shift_queue', () => {
      socket.to(COUPLE_ROOM).emit('partner_shift_queue');
    });

    // ==========================================
    // DISCONNECT
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`🔴 Device Disconnected: ${socket.id}`);
    });
  });

  return io;
};