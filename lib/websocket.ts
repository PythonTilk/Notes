import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface SocketUser {
  id: string;
  username: string;
  name: string;
  image?: string;
  role: string;
  workspaceId?: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  username: string;
  color: string;
}

export interface NoteUpdate {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  userId: string;
  workspaceId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  username: string;
  userImage?: string;
  userRole: string;
  workspaceId?: string;
  createdAt: string;
}

let io: SocketIOServer;

export const initializeWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:12000",
      methods: ["GET", "POST"]
    }
  });

  // Store active users and their cursors
  const activeUsers = new Map<string, SocketUser>();
  const userCursors = new Map<string, CursorPosition>();
  const workspaceUsers = new Map<string, Set<string>>(); // workspaceId -> Set of userIds

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    // Authentication middleware
    socket.on('authenticate', async (token: string) => {
      try {
        // In a real implementation, you'd verify the JWT token
        // For now, we'll use a simplified approach
        const user = await prisma.user.findFirst({
          where: { id: token }, // Simplified - in reality, decode JWT
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
          }
        });

        if (user) {
          const socketUser: SocketUser = {
            id: user.id,
            username: user.name || user.email || 'Unknown',
            name: user.name || user.email || 'Unknown',
            image: user.image || undefined,
            role: user.role,
          };

          activeUsers.set(socket.id, socketUser);
          socket.emit('authenticated', socketUser);

          // Update user online status
          await prisma.user.update({
            where: { id: user.id },
            data: { isOnline: true, lastSeen: new Date() }
          });
        } else {
          socket.emit('authentication_failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authentication_failed');
      }
    });

    // Join workspace room
    socket.on('join_workspace', async (workspaceId: string) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      // Verify user has access to workspace
      const membership = await prisma.workspaceMember.findFirst({
        where: {
          userId: user.id,
          workspaceId: workspaceId,
        }
      });

      if (membership) {
        socket.join(`workspace:${workspaceId}`);
        user.workspaceId = workspaceId;

        // Add user to workspace users tracking
        if (!workspaceUsers.has(workspaceId)) {
          workspaceUsers.set(workspaceId, new Set());
        }
        workspaceUsers.get(workspaceId)!.add(user.id);

        // Notify others in workspace
        socket.to(`workspace:${workspaceId}`).emit('user_joined', {
          userId: user.id,
          username: user.name,
          name: user.name,
          image: user.image,
        });

        // Send current workspace users
        const currentUsers = Array.from(workspaceUsers.get(workspaceId) || [])
          .map(userId => {
            const socketId = Array.from(activeUsers.entries())
              .find(([_, u]) => u.id === userId)?.[0];
            return socketId ? activeUsers.get(socketId) : null;
          })
          .filter(Boolean);

        socket.emit('workspace_users', currentUsers);
      }
    });

    // Handle cursor movement
    socket.on('cursor_move', (data: { x: number; y: number; workspaceId: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const cursor: CursorPosition = {
        x: data.x,
        y: data.y,
        userId: user.id,
        username: user.name,
        color: `hsl(${user.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`, // Generate color from user ID
      };

      userCursors.set(user.id, cursor);
      socket.to(`workspace:${data.workspaceId}`).emit('cursor_update', cursor);
    });

    // Handle note updates
    socket.on('note_update', async (noteData: NoteUpdate) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      try {
        // Update note in database
        const updatedNote = await prisma.note.update({
          where: { id: noteData.id },
          data: {
            title: noteData.title,
            content: noteData.content,
            updatedAt: new Date(),
          },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              }
            }
          }
        });

        // Broadcast to other users in workspace
        socket.to(`workspace:${noteData.workspaceId}`).emit('note_updated', {
          ...updatedNote,
          updatedBy: user.name,
        });

        // Log activity
        await prisma.activity.create({
          data: {
            type: 'NOTE_UPDATED',
            title: 'Note updated',
            description: `Updated note "${noteData.title}"`,
            userId: user.id,
            workspaceId: noteData.workspaceId,
            metadata: {
              noteId: noteData.id,
              noteTitle: noteData.title,
            }
          }
        });
      } catch (error) {
        console.error('Error updating note:', error);
        socket.emit('note_update_error', { error: 'Failed to update note' });
      }
    });

    // Handle chat messages
    socket.on('send_message', async (data: { content: string; workspaceId?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      try {
        const message = await prisma.chatMessage.create({
          data: {
            content: data.content,
            authorId: user.id,
          },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
              }
            }
          }
        });

        const chatMessage: ChatMessage = {
          id: message.id,
          content: message.content,
          userId: message.authorId,
          username: message.author.name || message.author.email || 'Unknown',
          userImage: message.author.image || undefined,
          userRole: message.author.role,
          workspaceId: undefined, // ChatMessage doesn't have workspaceId in our schema
          createdAt: message.createdAt.toISOString(),
        };

        // Broadcast to appropriate room
        const room = data.workspaceId ? `workspace:${data.workspaceId}` : 'public_chat';
        io.to(room).emit('new_message', chatMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle user typing indicators
    socket.on('typing_start', (data: { workspaceId?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const room = data.workspaceId ? `workspace:${data.workspaceId}` : 'public_chat';
      socket.to(room).emit('user_typing', {
        userId: user.id,
        username: user.name,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data: { workspaceId?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const room = data.workspaceId ? `workspace:${data.workspaceId}` : 'public_chat';
      socket.to(room).emit('user_typing', {
        userId: user.id,
        username: user.name,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        console.log('User disconnected:', user.name);

        // Remove from workspace users
        if (user.workspaceId) {
          const workspaceUserSet = workspaceUsers.get(user.workspaceId);
          if (workspaceUserSet) {
            workspaceUserSet.delete(user.id);
            if (workspaceUserSet.size === 0) {
              workspaceUsers.delete(user.workspaceId);
            }
          }

          // Notify others in workspace
          socket.to(`workspace:${user.workspaceId}`).emit('user_left', {
            userId: user.id,
            username: user.name,
          });
        }

        // Remove cursor
        userCursors.delete(user.id);
        socket.broadcast.emit('cursor_remove', { userId: user.id });

        // Update user offline status
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { isOnline: false, lastSeen: new Date() }
          });
        } catch (error) {
          console.error('Error updating user offline status:', error);
        }

        activeUsers.delete(socket.id);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
};