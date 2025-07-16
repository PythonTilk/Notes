'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Move, 
  Palette,
  Save,
  X,
  Maximize2,
  Minimize2,
  Brain,
  Link2,
  Code,
  Type,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConnectedNotes } from './ConnectedNotes';
import { AIInsights } from '@/components/ai/AIInsights';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'RICH_TEXT' | 'CODE' | 'MARKDOWN';
  color: string;
  tag?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username?: string;
    name?: string;
    image?: string;
  };
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color: string;
  style: 'SOLID' | 'DASHED' | 'DOTTED';
}

interface EnhancedWorkspaceCanvasProps {
  workspaceId: string;
  notes: Note[];
  connections: Connection[];
  onNoteCreate: (note: Partial<Note>) => Promise<void>;
  onNoteUpdate: (id: string, updates: Partial<Note>) => Promise<void>;
  onNoteDelete: (id: string) => Promise<void>;
  onConnectionCreate: (fromId: string, toId: string, label?: string, color?: string, style?: string) => Promise<void>;
  onConnectionUpdate: (id: string, updates: Partial<Connection>) => Promise<void>;
  onConnectionDelete: (id: string) => Promise<void>;
  canEdit: boolean;
}

interface DragState {
  isDragging: boolean;
  noteId: string | null;
  offset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

interface ResizeState {
  isResizing: boolean;
  noteId: string | null;
  startSize: { width: number; height: number };
  startPosition: { x: number; y: number };
}

export const EnhancedWorkspaceCanvas: React.FC<EnhancedWorkspaceCanvasProps> = ({
  workspaceId,
  notes,
  connections,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
  onConnectionCreate,
  onConnectionUpdate,
  onConnectionDelete,
  canEdit,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useWebSocket();
  
  // State management
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    noteId: null,
    offset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
  });
  
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    noteId: null,
    startSize: { width: 0, height: 0 },
    startPosition: { x: 0, y: 0 },
  });

  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createPosition, setCreatePosition] = useState({ x: 0, y: 0 });
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; user: any }>>({});

  // Real-time collaboration
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for cursor movements
    socket.on('cursor-move', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          user: data.user
        }
      }));
    });

    // Listen for note updates
    socket.on('note-updated', (data) => {
      // Handle real-time note updates
      console.log('Note updated:', data);
    });

    // Listen for connection updates
    socket.on('connection-updated', (data) => {
      console.log('Connection updated:', data);
    });

    return () => {
      socket.off('cursor-move');
      socket.off('note-updated');
      socket.off('connection-updated');
    };
  }, [socket, isConnected]);

  // Send cursor position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!socket || !isConnected || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit('cursor-move', {
      workspaceId,
      x,
      y
    });
  }, [socket, isConnected, workspaceId]);

  // Handle canvas double-click to create new note
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!canEdit) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCreatePosition({ x, y });
    setShowCreateMenu(true);
  }, [canEdit]);

  // Handle note creation
  const handleCreateNote = useCallback(async (type: 'TEXT' | 'CODE' | 'RICH_TEXT' | 'MARKDOWN') => {
    if (!canEdit) return;

    const newNote = {
      title: 'New Note',
      content: type === 'CODE' ? '// Start coding...' : 'Start writing...',
      type,
      positionX: createPosition.x,
      positionY: createPosition.y,
      width: 300,
      height: 200,
      workspaceId,
    };

    await onNoteCreate(newNote);

    // Emit real-time update
    if (socket && isConnected) {
      socket.emit('note-created', {
        workspaceId,
        note: newNote
      });
    }

    setShowCreateMenu(false);
  }, [canEdit, createPosition, workspaceId, onNoteCreate, socket, isConnected]);

  // Handle note drag
  const handleMouseDown = useCallback((e: React.MouseEvent, noteId: string) => {
    if (!canEdit) return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    setDragState({
      isDragging: true,
      noteId,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
      startPosition: { x: note.positionX, y: note.positionY },
    });

    setSelectedNote(noteId);
  }, [canEdit, notes]);

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.noteId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragState.offset.x;
      const newY = e.clientY - rect.top - dragState.offset.y;

      // Update note position immediately for smooth dragging
      const noteElement = document.getElementById(`note-${dragState.noteId}`);
      if (noteElement) {
        noteElement.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    };

    const handleMouseUp = async () => {
      if (!dragState.isDragging || !dragState.noteId) return;

      const noteElement = document.getElementById(`note-${dragState.noteId}`);
      if (noteElement) {
        const transform = noteElement.style.transform;
        const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
        
        if (match) {
          const newX = parseFloat(match[1]);
          const newY = parseFloat(match[2]);
          
          await onNoteUpdate(dragState.noteId, {
            positionX: newX,
            positionY: newY,
          });

          // Emit real-time update
          if (socket && isConnected) {
            socket.emit('note-moved', {
              workspaceId,
              noteId: dragState.noteId,
              x: newX,
              y: newY
            });
          }
        }
      }

      setDragState({
        isDragging: false,
        noteId: null,
        offset: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 },
      });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, onNoteUpdate, socket, isConnected, workspaceId]);

  // Handle note editing
  const startEditing = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !canEdit) return;

    setEditingNote(noteId);
    setEditTitle(note.title);
    setEditContent(note.content);
  }, [notes, canEdit]);

  const saveEdit = useCallback(async () => {
    if (!editingNote) return;

    await onNoteUpdate(editingNote, {
      title: editTitle,
      content: editContent,
    });

    // Emit real-time update
    if (socket && isConnected) {
      socket.emit('note-updated', {
        workspaceId,
        noteId: editingNote,
        title: editTitle,
        content: editContent
      });
    }

    setEditingNote(null);
    setEditTitle('');
    setEditContent('');
  }, [editingNote, editTitle, editContent, onNoteUpdate, socket, isConnected, workspaceId]);

  const cancelEdit = useCallback(() => {
    setEditingNote(null);
    setEditTitle('');
    setEditContent('');
  }, []);

  // Handle AI suggestions
  const handleApplySuggestion = useCallback(async (suggestion: any) => {
    if (!selectedNote) return;

    switch (suggestion.type) {
      case 'improvement':
        // Apply improvement suggestion
        toast.success('Improvement suggestion applied!');
        break;
      case 'tag':
        // Apply tag suggestion
        const tagMatch = suggestion.title.match(/Add tag: (.+)/);
        if (tagMatch) {
          await onNoteUpdate(selectedNote, { tag: tagMatch[1] });
          toast.success('Tag added!');
        }
        break;
      case 'structure':
        // Apply structure suggestion
        toast.success('Structure suggestion applied!');
        break;
    }
  }, [selectedNote, onNoteUpdate]);

  // Render note component
  const renderNote = (note: Note) => {
    const isEditing = editingNote === note.id;
    const isSelected = selectedNote === note.id;

    return (
      <div
        key={note.id}
        id={`note-${note.id}`}
        data-note-id={note.id}
        className={`absolute bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${
          isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{
          left: note.positionX,
          top: note.positionY,
          width: note.width,
          height: note.height,
          backgroundColor: note.color,
        }}
        onClick={() => setSelectedNote(note.id)}
      >
        {/* Note header */}
        <div
          className="flex items-center justify-between p-2 bg-gray-50 rounded-t-lg cursor-move"
          onMouseDown={(e) => handleMouseDown(e, note.id)}
        >
          <div className="flex items-center gap-2">
            {note.type === 'CODE' && <Code className="w-4 h-4" />}
            {note.type === 'TEXT' && <Type className="w-4 h-4" />}
            {note.type === 'RICH_TEXT' && <FileText className="w-4 h-4" />}
            {note.type === 'MARKDOWN' && <FileText className="w-4 h-4" />}
            
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-6 text-sm"
                autoFocus
              />
            ) : (
              <span className="text-sm font-medium truncate">{note.title}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <Button size="sm" variant="ghost" onClick={saveEdit}>
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => startEditing(note.id)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onNoteDelete(note.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Note content */}
        <div className="p-3 h-full overflow-auto">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full resize-none border-none focus:ring-0"
              placeholder="Start writing..."
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              {note.content || 'Empty note...'}
            </div>
          )}
        </div>

        {/* Note footer */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          {note.tag && (
            <Badge variant="secondary" className="text-xs">
              {note.tag}
            </Badge>
          )}
          <div className="text-xs text-gray-500">
            {note.author.username || note.author.name}
          </div>
        </div>

        {/* Resize handle */}
        {canEdit && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => {
              e.preventDefault();
              setResizeState({
                isResizing: true,
                noteId: note.id,
                startSize: { width: note.width, height: note.height },
                startPosition: { x: e.clientX, y: e.clientY },
              });
            }}
          >
            <div className="w-full h-full bg-gray-300 opacity-50 rounded-tl-lg" />
          </div>
        )}
      </div>
    );
  };

  // Render collaborative cursors
  const renderCursors = () => {
    return Object.entries(cursors).map(([userId, cursor]) => (
      <div
        key={userId}
        className="absolute pointer-events-none z-50"
        style={{
          left: cursor.x,
          top: cursor.y,
          transform: 'translate(-2px, -2px)',
        }}
      >
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        <div className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded whitespace-nowrap">
          {cursor.user.username || cursor.user.name}
        </div>
      </div>
    ));
  };

  return (
    <div className="flex h-full">
      {/* Main canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full bg-gray-50 relative cursor-crosshair"
          onDoubleClick={handleCanvasDoubleClick}
          onMouseMove={handleMouseMove}
          onClick={() => {
            setSelectedNote(null);
            setShowCreateMenu(false);
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Render notes */}
          {notes.map(renderNote)}

          {/* Render collaborative cursors */}
          {renderCursors()}

          {/* Connected notes overlay */}
          <ConnectedNotes
            notes={notes}
            connections={connections}
            onCreateConnection={onConnectionCreate}
            onUpdateConnection={onConnectionUpdate}
            onDeleteConnection={onConnectionDelete}
            selectedNoteId={selectedNote || undefined}
            canvasRef={canvasRef}
          />

          {/* Create note menu */}
          {showCreateMenu && (
            <div
              className="absolute bg-white rounded-lg shadow-lg border p-2 z-20"
              style={{
                left: createPosition.x,
                top: createPosition.y,
              }}
            >
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreateNote('TEXT')}
                  className="justify-start"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text Note
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreateNote('CODE')}
                  className="justify-start"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code Note
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreateNote('RICH_TEXT')}
                  className="justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Rich Text
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreateNote('MARKDOWN')}
                  className="justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Markdown
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 border">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowAIInsights(!showAIInsights)}
              variant={showAIInsights ? "default" : "outline"}
            >
              <Brain className="w-4 h-4 mr-1" />
              AI Insights
            </Button>
            
            {selectedNote && (
              <Badge variant="secondary">
                Note selected
              </Badge>
            )}

            {!isConnected && (
              <Badge variant="destructive">
                Offline
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights sidebar */}
      {showAIInsights && (
        <AIInsights
          workspaceId={workspaceId}
          noteId={selectedNote || undefined}
          onApplySuggestion={handleApplySuggestion}
          onCreateConnection={onConnectionCreate}
        />
      )}
    </div>
  );
};