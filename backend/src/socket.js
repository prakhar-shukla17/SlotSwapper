import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        
      ].filter(Boolean),
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('user:identify', ({ userId }) => {
      if (!userId) return;
      socket.data.userId = userId.toString();
      socket.join(socket.data.userId);
      socket.emit('user:identified', { userId: socket.data.userId });
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
      if (socket.data?.userId) {
        socket.leave(socket.data.userId);
      }
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialised');
  }
  return ioInstance;
};
