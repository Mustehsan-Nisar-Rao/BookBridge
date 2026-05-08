const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a room based on userId if provided
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined room user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper functions for broadcasting events
const emitTransactionUpdate = (userId, data) => {
  if (io) {
    // Emit to specific user room if userId provided
    if (userId) {
      io.to(`user_${userId}`).emit('transaction_updated', data);
    }
    // Also emit to all for general admin updates if needed
    io.emit('global_transaction_update', data);
  }
};

const emitAdminDataUpdate = () => {
  if (io) {
    io.emit('admin_data_updated');
  }
};

const emitBookStatusChange = (bookId, data) => {
  if (io) {
    io.emit(`book_status_changed_${bookId}`, data);
    io.emit('general_book_update', { bookId, ...data });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitTransactionUpdate,
  emitAdminDataUpdate,
  emitBookStatusChange
};
