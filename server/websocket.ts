import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    username?: string;
    name?: string;
    image?: string;
    role: string;
  };
}

interface CursorData {
  workspaceId: string;
  x: number;
  y: number;
}

interface NoteUpdateData {
  workspaceId: string;
  noteId: string;
  title?: string;
  content?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

interface ConnectionData {
  workspaceId: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  style?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, AuthenticatedSocket> = new Map();
  private workspaceUsers: Map<string, Set<string>> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:12000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/api/socket'
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = await getToken({ 
          req: { headers: { authorization: `Bearer ${token}` } } as any,
          secret: process.env.NEXTAUTH_SECRET 
        });

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
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.user?.username} connected`);
      
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket);
      }

      // Join workspace room
      socket.on('join-workspace', async (workspaceId: string) => {
        try {
          // Verify user has access to workspace
          const hasAccess = await this.verifyWorkspaceAccess(socket.userId!, workspaceId);
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to workspace' });
            return;
          }

          socket.join(`workspace:${workspaceId}`);
          
          // Track users in workspace
          if (!this.workspaceUsers.has(workspaceId)) {
            this.workspaceUsers.set(workspaceId, new Set());
          }
          this.workspaceUsers.get(workspaceId)!.add(socket.userId!);

          // Notify others about user joining
          socket.to(`workspace:${workspaceId}`).emit('user-joined', {
            user: socket.user,
            timestamp: new Date().toISOString()
          });

          // Send current workspace users
          const workspaceUserIds = Array.from(this.workspaceUsers.get(workspaceId) || []);
          const workspaceUsers = await prisma.user.findMany({
            where: { id: { in: workspaceUserIds } },
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
              role: true
            }
          });

          socket.emit('workspace-users', { users: workspaceUsers });
        } catch (error) {
          console.error('Error joining workspace:', error);
          socket.emit('error', { message: 'Failed to join workspace' });
        }
      });

      // Leave workspace room
      socket.on('leave-workspace', (workspaceId: string) => {
        socket.leave(`workspace:${workspaceId}`);
        
        // Remove from workspace users tracking
        const workspaceUserSet = this.workspaceUsers.get(workspaceId);
        if (workspaceUserSet) {
          workspaceUserSet.delete(socket.userId!);
          if (workspaceUserSet.size === 0) {
            this.workspaceUsers.delete(workspaceId);
          }
        }

        // Notify others about user leaving
        socket.to(`workspace:${workspaceId}`).emit('user-left', {
          user: socket.user,
          timestamp: new Date().toISOString()
        });
      });

      // Handle cursor movement
      socket.on('cursor-move', (data: CursorData) => {
        socket.to(`workspace:${data.workspaceId}`).emit('cursor-move', {
          userId: socket.userId,
          user: socket.user,
          x: data.x,
          y: data.y,
          timestamp: new Date().toISOString()
        });
      });

      // Handle note updates
      socket.on('note-updated', async (data: NoteUpdateData) => {
        try {
          // Verify user has edit access
          const hasAccess = await this.verifyWorkspaceEditAccess(socket.userId!, data.workspaceId);
          if (!hasAccess) {
            socket.emit('error', { message: 'No edit access to workspace' });
            return;
          }

          // Broadcast to other users in workspace
          socket.to(`workspace:${data.workspaceId}`).emit('note-updated', {
            ...data,
            userId: socket.userId,
            user: socket.user,
            timestamp: new Date().toISOString()
          });

          // Log activity
          await prisma.activity.create({
            data: {
              type: 'NOTE_UPDATED',
              title: 'Note updated in real-time',
              description: `Note "${data.noteId}" was updated`,
              userId: socket.userId!,
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

      // Handle note creation
      socket.on('note-created', async (data: { workspaceId: string; note: any }) => {
        try {
          const hasAccess = await this.verifyWorkspaceEditAccess(socket.userId!, data.workspaceId);
          if (!hasAccess) {
            socket.emit('error', { message: 'No edit access to workspace' });
            return;
          }

          socket.to(`workspace:${data.workspaceId}`).emit('note-created', {
            ...data,
            userId: socket.userId,
            user: socket.user,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling note creation:', error);
        }
      });

      // Handle note movement
      socket.on('note-moved', async (data: { workspaceId: string; noteId: string; x: number; y: number }) => {
        try {
          const hasAccess = await this.verifyWorkspaceEditAccess(socket.userId!, data.workspaceId);
          if (!hasAccess) {
            socket.emit('error', { message: 'No edit access to workspace' });
            return;
          }

          socket.to(`workspace:${data.workspaceId}`).emit('note-moved', {
            ...data,
            userId: socket.userId,
            user: socket.user,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling note movement:', error);
        }
      });

      // Handle connection creation
      socket.on('connection-created', async (data: ConnectionData) => {
        try {
          const hasAccess = await this.verifyWorkspaceEditAccess(socket.userId!, data.workspaceId);
          if (!hasAccess) {
            socket.emit('error', { message: 'No edit access to workspace' });
            return;
          }

          socket.to(`workspace:${data.workspaceId}`).emit('connection-created', {
            ...data,
            userId: socket.userId,
            user: socket.user,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling connection creation:', error);
        }
      });

      // Handle connection updates
      socket.on('connection-updated', async (data: { workspaceId: string; connectionId: string; updates: any }) => {
        try {
          const hasAccess = await this.verifyWorkspaceEditAccess(socket.userId!, data.workspaceId);
          if (!hasAccess) {
            socket.emit('error', { message: 'No edit access to workspace' });
            return;
          }

          socket.to(`workspace:${data.workspaceId}`).emit('connection-updated', {
            ...data,
            userId: socket.userId,
            user: socket.user,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling connection update:', error);
        }
      });

      // Handle chat messages
      socket.on('chat-message', async (data: { workspaceId?: string; message: string; type: 'public' | 'workspace' }) => {
        try {
          if (data.type === 'workspace' && data.workspaceId) {
            const hasAccess = await this.verifyWorkspaceAccess(socket.userId!, data.workspaceId);
            if (!hasAccess) {
              socket.emit('error', { message: 'No access to workspace chat' });
              return;
            }
          }

          // Create chat message in database
          const chatMessage = await prisma.chatMessage.create({
            data: {
              content: data.message,
              authorId: socket.userId!,
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
      socket.on('typing-start', (data: { workspaceId?: string; type: 'public' | 'workspace' }) => {
        const room = data.type === 'workspace' ? `workspace:${data.workspaceId}` : 'public-chat';
        socket.to(room).emit('typing-start', {
          userId: socket.userId,
          user: socket.user,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('typing-stop', (data: { workspaceId?: string; type: 'public' | 'workspace' }) => {
        const room = data.type === 'workspace' ? `workspace:${data.workspaceId}` : 'public-chat';
        socket.to(room).emit('typing-stop', {
          userId: socket.userId,
          user: socket.user,
          timestamp: new Date().toISOString()
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user?.username} disconnected`);
        
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          
          // Remove from all workspace user tracking
          for (const [workspaceId, userSet] of this.workspaceUsers.entries()) {
            if (userSet.has(socket.userId)) {
              userSet.delete(socket.userId);
              
              // Notify others about user leaving
              socket.to(`workspace:${workspaceId}`).emit('user-left', {
                user: socket.user,
                timestamp: new Date().toISOString()
              });
              
              if (userSet.size === 0) {
                this.workspaceUsers.delete(workspaceId);
              }
            }
          }
        }
      });
    });
  }

  private async verifyWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          OR: [
            { ownerId: userId },
            { 
              members: {
                some: { userId: userId }
              }
            },
            { isPublic: true }
          ]
        }
      });

      return !!workspace;
    } catch (error) {
      console.error('Error verifying workspace access:', error);
      return false;
    }
  }

  private async verifyWorkspaceEditAccess(userId: string, workspaceId: string): Promise<boolean> {
    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          OR: [
            { ownerId: userId },
            { 
              members: {
                some: { 
                  userId: userId,
                  role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
                }
              }
            }
          ]
        }
      });

      return !!workspace;
    } catch (error) {
      console.error('Error verifying workspace edit access:', error);
      return false;
    }
  }

  // Public methods for external use
  public async notifyWorkspace(workspaceId: string, event: string, data: any) {
    this.io.to(`workspace:${workspaceId}`).emit(event, data);
  }

  public async notifyUser(userId: string, event: string, data: any) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public getWorkspaceUsers(workspaceId: string): string[] {
    return Array.from(this.workspaceUsers.get(workspaceId) || []);
  }
}

export let wsServer: WebSocketServer | null = null;

export function initializeWebSocketServer(server: HTTPServer) {
  if (!wsServer) {
    wsServer = new WebSocketServer(server);
    console.log('WebSocket server initialized');
  }
  return wsServer;
}