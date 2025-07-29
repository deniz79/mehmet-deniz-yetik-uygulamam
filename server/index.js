const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./config/database');
const DatabaseUtils = require('./utils/database');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');

const app = express();
const server = http.createServer(app);

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3500',
    'http://localhost:3501',
    'https://ytkgroup.org', // Production domain
    'https://www.ytkgroup.org', // Production domain with www
    process.env.FRONTEND_URL // Environment variable for frontend URL
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await DatabaseUtils.healthCheck();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Database stats endpoint
app.get('/api/database/stats', async (req, res) => {
  try {
    const stats = await DatabaseUtils.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database collections stats endpoint
app.get('/api/database/collections', async (req, res) => {
  try {
    const stats = await DatabaseUtils.getAllCollectionsStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database backup info endpoint
app.get('/api/database/backup-info', async (req, res) => {
  try {
    const backupInfo = await DatabaseUtils.getBackupInfo();
    res.json(backupInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection handling
const connectedUsers = new Map();

// Make io and connectedUsers available to routes
app.set('io', io);
io.connectedUsers = connectedUsers;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_connected', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }
  });

  socket.on('send_message', (data) => {
    try {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_message', data);
      }
    } catch (error) {
      console.error('Socket send_message error:', error);
    }
  });

  socket.on('send_group_message', (data) => {
    try {
      data.groupMembers.forEach(memberId => {
        const memberSocketId = connectedUsers.get(memberId);
        if (memberSocketId && memberSocketId !== socket.id) {
          io.to(memberSocketId).emit('receive_group_message', data);
        }
      });
    } catch (error) {
      console.error('Socket send_group_message error:', error);
    }
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      connectedUsers.delete(disconnectedUserId);
      console.log(`User ${disconnectedUserId} disconnected`);
    }
  });
});

// Initialize database connection
connectDB()
  .then(async () => {
    console.log('Database initialized successfully');
    // Create indexes for better performance
    try {
      await DatabaseUtils.createIndexes();
    } catch (error) {
      console.log('Index creation error:', error);
    }
  })
  .catch(err => console.log('Database initialization error:', err));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 