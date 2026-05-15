import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: [
        'https://stedinow-new.vercel.app',
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_student', (studentId) => {
      socket.join(studentId);
      console.log(`Socket ${socket.id} joined student room: ${studentId}`);
    });

    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
