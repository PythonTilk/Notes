const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class WebSocketServer {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : ["http://localhost:3000", "http://localhost:53313", "http://localhost:59704"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('No token provided'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        
        if (!decoded || !decoded.sub) {
          return next(new Error('Invalid token'));
        }

        // Get user from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            isActive: true
          }
        });

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = user.id;
        socket.user = {
          id: user.id,
          username: user.name || user.email || 'Unknown',
          name: user.name || undefined,
          image: user.image || undefined,
          role: user.role
        };
        
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.username} connected`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        user: socket.user,
        lastSeen: new Date()
      });

      // Update user online status
      this.updateUserOnlineStatus(socket.userId, true);

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Handle workspace joining
      socket.on('join-workspace', async (data) => {
        try {
          const { workspaceId } = data;
          
          // Verify user has access to workspace
          const membership = await prisma.workspaceMember.findFirst({
            where: {
              workspaceId,
              userId: socket.userId
            }
          });

          if (!membership) {
            socket.emit('error', { message: 'Access denied to workspace' });
            return;
          }

          socket.join(`workspace:${workspaceId}`);
          socket.currentWorkspace = workspaceId;
          
          // Notify others in workspace
          socket.to(`workspace:${workspaceId}`).emit('user-joined', {
            user: socket.user,
            timestamp: new Date().toISOString()
          });

          socket.emit('workspace-joined', { workspaceId });
        } catch (error) {
          console.error('Error joining workspace:', error);
          socket.emit('error', { message: 'Failed to join workspace' });
        }
      });

      // Handle leaving workspace
      socket.on('leave-workspace', (data) => {
        const { workspaceId } = data;
        socket.leave(`workspace:${workspaceId}`);
        
        // Notify others in workspace
        socket.to(`workspace:${workspaceId}`).emit('user-left', {
          user: socket.user,
          timestamp: new Date().toISOString()
        });
      });

      // Handle note updates
      socket.on('note-update', async (data) => {
        try {
          const { noteId, workspaceId, title, content, type } = data;

          // Verify user has access to the note
          const note = await prisma.note.findFirst({
            where: {
              id: noteId,
              OR: [
                { authorId: socket.userId },
                { 
                  workspace: {
                    members: {
                      some: { userId: socket.userId }
                    }
                  }
                }
              ]
            }
          });

          if (!note) {
            socket.emit('error', { message: 'Access denied to note' });
            return;
          }

          // Update note in database
          const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
              title: title || note.title,
              content: content || note.content,
              type: type || note.type,
              updatedAt: new Date()
            }
          });

          // Broadcast update to workspace members
          const room = workspaceId ? `workspace:${workspaceId}` : 'public';
          socket.to(room).emit('note-updated', {
            noteId,
            title: updatedNote.title,
            content: updatedNote.content,
            type: updatedNote.type,
            updatedBy: socket.user,
            timestamp: updatedNote.updatedAt.toISOString()
          });

          // Log activity
          await prisma.activity.create({
            data: {
              type: 'NOTE_UPDATED',
              title: 'Note updated in real-time',
              description: `Note "${data.noteId}" was updated`,
              userId: socket.userId,
              workspaceId: data.workspaceId,
              metadata: {
                noteId: data.noteId,
                updates: JSON.parse(JSON.stringify(data)),
                realTime: true
              }
            }
          });
        } catch (error) {
          console.error('Error handling note update:', error);
          socket.emit('error', { message: 'Failed to update note' });
        }
      });

      // Handle cursor position updates
      socket.on('cursor-update', (data) => {
        const { noteId, position, selection } = data;
        
        if (socket.currentWorkspace) {
          socket.to(`workspace:${socket.currentWorkspace}`).emit('cursor-updated', {
            noteId,
            user: socket.user,
            position,
            selection,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle chat messages
      socket.on('chat-message', async (data) => {
        try {
          const { message, workspaceId, type } = data;

          if (!message || message.trim().length === 0) {
            socket.emit('error', { message: 'Message cannot be empty' });
            return;
          }

          // Create chat message in database
          const chatMessage = await prisma.chatMessage.create({
            data: {
              content: data.message,
              authorId: socket.userId,
              type: 'TEXT'
            },
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  image: true,
                  role: true
                }
              }
            }
          });

          // Broadcast message
          const room = data.type === 'workspace' ? `workspace:${data.workspaceId}` : 'public-chat';
          this.io.to(room).emit('chat-message', {
            id: chatMessage.id,
            content: chatMessage.content,
            user: {
              id: chatMessage.author.id,
              username: chatMessage.author.name || chatMessage.author.email || 'Unknown',
              name: chatMessage.author.name,
              image: chatMessage.author.image,
              role: chatMessage.author.role
            },
            timestamp: chatMessage.createdAt.toISOString(),
            type: data.type
          });
        } catch (error) {
          console.error('Error handling chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        const { workspaceId, type } = data;
        const room = type === 'workspace' ? `workspace:${workspaceId}` : 'public-chat';
        socket.to(room).emit('user-typing', {
          user: socket.user,
          isTyping: true
        });
      });

      socket.on('typing-stop', (data) => {
        const { workspaceId, type } = data;
        const room = type === 'workspace' ? `workspace:${workspaceId}` : 'public-chat';
        socket.to(room).emit('user-typing', {
          user: socket.user,
          isTyping: false
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.username} disconnected`);
        
        // Remove from connected users
        this.connectedUsers.delete(socket.userId);
        
        // Update user online status
        this.updateUserOnlineStatus(socket.userId, false);
        
        // Notify workspace members
        if (socket.currentWorkspace) {
          socket.to(`workspace:${socket.currentWorkspace}`).emit('user-left', {
            user: socket.user,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    console.log('WebSocket server initialized');
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastSeen: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  getUserSocket(userId) {
    const userConnection = this.connectedUsers.get(userId);
    return userConnection ? this.io.sockets.sockets.get(userConnection.socketId) : null;
  }

  broadcastToWorkspace(workspaceId, event, data) {
    this.io.to(`workspace:${workspaceId}`).emit(event, data);
  }

  broadcastToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}

const webSocketServer = new WebSocketServer();

function initializeWebSocketServer(server) {
  webSocketServer.initialize(server);
  return webSocketServer;
}

module.exports = {
  initializeWebSocketServer,
  webSocketServer
};