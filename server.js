const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/api/socketio',
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinProject', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`User joined project-${projectId}`);
    });

    socket.on('taskUpdated', (data) => {
      console.log('Task updated:', data);
      io.to(`project-${data.projectId}`).emit('taskUpdated', data);
    });

    socket.on('taskAdded', (data) => {
      console.log('Task added:', data);
      io.to(`project-${data.projectId}`).emit('taskAdded', data);
    });

    socket.on('taskDeleted', (data) => {
      console.log('Task deleted:', data);
      io.to(`project-${data.projectId}`).emit('taskDeleted', data.taskId);
    });

    socket.on('projectUpdated', (data) => {
      console.log('Project updated:', data);
      io.to(`project-${data.projectId}`).emit('projectUpdated', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});