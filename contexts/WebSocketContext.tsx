'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface SocketUser {
  id: string;
  username: string;
  name: string;
  image?: string;
  role: string;
  workspaceId?: string;
}

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  username: string;
  color: string;
}

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  username: string;
  userImage?: string;
  userRole: string;
  workspaceId?: string;
  createdAt: string;
}

interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentUser: SocketUser | null;
  workspaceUsers: SocketUser[];
  cursors: Map<string, CursorPosition>;
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  
  // Actions
  joinWorkspace: (workspaceId: string) => void;
  leaveWorkspace: () => void;
  updateCursor: (x: number, y: number, workspaceId: string) => void;
  updateNote: (noteData: any) => void;
  sendMessage: (content: string, workspaceId?: string) => void;
  startTyping: (workspaceId?: string) => void;
  stopTyping: (workspaceId?: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<SocketUser | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<SocketUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  const currentWorkspaceId = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:12000', {
      transports: ['websocket', 'polling'],
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Authenticate with user ID
      newSocket.emit('authenticate', session.user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setCurrentUser(null);
      setWorkspaceUsers([]);
      setCursors(new Map());
    });

    // Authentication events
    newSocket.on('authenticated', (user: SocketUser) => {
      console.log('Authenticated as:', user.username);
      setCurrentUser(user);
    });

    newSocket.on('authentication_failed', () => {
      console.error('Authentication failed');
      toast.error('Failed to authenticate with real-time server');
    });

    // Workspace events
    newSocket.on('workspace_users', (users: SocketUser[]) => {
      setWorkspaceUsers(users);
    });

    newSocket.on('user_joined', (user: { userId: string; username: string; name: string; image?: string }) => {
      setWorkspaceUsers(prev => [...prev.filter(u => u.id !== user.userId), {
        id: user.userId,
        username: user.username,
        name: user.name,
        image: user.image,
        role: 'USER', // Default role
      }]);
      toast.success(`${user.name} joined the workspace`);
    });

    newSocket.on('user_left', (user: { userId: string; username: string }) => {
      setWorkspaceUsers(prev => prev.filter(u => u.id !== user.userId));
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(user.userId);
        return newCursors;
      });
      toast(`${user.username} left the workspace`);
    });

    // Cursor events
    newSocket.on('cursor_update', (cursor: CursorPosition) => {
      setCursors(prev => new Map(prev.set(cursor.userId, cursor)));
    });

    newSocket.on('cursor_remove', (data: { userId: string }) => {
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(data.userId);
        return newCursors;
      });
    });

    // Note events
    newSocket.on('note_updated', (noteData: any) => {
      // This will be handled by the workspace component
      window.dispatchEvent(new CustomEvent('note_updated', { detail: noteData }));
    });

    newSocket.on('note_update_error', (error: { error: string }) => {
      toast.error(error.error);
    });

    // Chat events
    newSocket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      
      // Show notification if not in current workspace
      if (message.workspaceId && message.workspaceId !== currentWorkspaceId.current) {
        toast(`New message from ${message.username}`, {
          icon: '💬',
        });
      }
    });

    newSocket.on('message_error', (error: { error: string }) => {
      toast.error(error.error);
    });

    // Typing events
    newSocket.on('user_typing', (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?.id]);

  const joinWorkspace = (workspaceId: string) => {
    if (socket && isConnected) {
      currentWorkspaceId.current = workspaceId;
      socket.emit('join_workspace', workspaceId);
      
      // Clear previous workspace data
      setMessages([]);
      setTypingUsers([]);
    }
  };

  const leaveWorkspace = () => {
    currentWorkspaceId.current = null;
    setWorkspaceUsers([]);
    setCursors(new Map());
    setMessages([]);
    setTypingUsers([]);
  };

  const updateCursor = (x: number, y: number, workspaceId: string) => {
    if (socket && isConnected) {
      socket.emit('cursor_move', { x, y, workspaceId });
    }
  };

  const updateNote = (noteData: any) => {
    if (socket && isConnected) {
      socket.emit('note_update', noteData);
    }
  };

  const sendMessage = (content: string, workspaceId?: string) => {
    if (socket && isConnected) {
      socket.emit('send_message', { content, workspaceId });
    }
  };

  const startTyping = (workspaceId?: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { workspaceId });
    }
  };

  const stopTyping = (workspaceId?: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { workspaceId });
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    currentUser,
    workspaceUsers,
    cursors,
    messages,
    typingUsers,
    joinWorkspace,
    leaveWorkspace,
    updateCursor,
    updateNote,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};