'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Edit3, Trash2, Move, Code, Type, FileText } from 'lucide-react';
import { Note, User } from '@prisma/client';

interface NoteWithAuthor extends Note {
  author: Pick<User, 'id' | 'username' | 'name' | 'image'>;
}

interface WorkspaceCanvasProps {
  workspaceId: string;
  notes: NoteWithAuthor[];
  onNoteCreate: (note: Partial<Note>) => Promise<void>;
  onNoteUpdate: (id: string, updates: Partial<Note>) => Promise<void>;
  onNoteDelete: (id: string) => Promise<void>;
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

export default function WorkspaceCanvas({
  workspaceId,
  notes,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
  canEdit,
}: WorkspaceCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
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
  const handleCreateNote = useCallback(async (type: 'TEXT' | 'CODE' | 'RICH_TEXT') => {
    if (!canEdit) return;

    await onNoteCreate({
      title: 'New Note',
      content: type === 'CODE' ? '// Start coding...' : 'Start writing...',
      type,
      positionX: createPosition.x,
      positionY: createPosition.y,
      width: 300,
      height: 200,
      workspaceId,
    });

    setShowCreateMenu(false);
  }, [canEdit, createPosition, workspaceId, onNoteCreate]);

  // Handle note drag start
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
      startPosition: {
        x: note.positionX,
        y: note.positionY,
      },
    });

    setSelectedNote(noteId);
  }, [canEdit, notes]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, noteId: string) => {
    if (!canEdit) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    setResizeState({
      isResizing: true,
      noteId,
      startSize: {
        width: note.width,
        height: note.height,
      },
      startPosition: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  }, [canEdit, notes]);

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging && dragState.noteId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX = Math.max(0, e.clientX - rect.left - dragState.offset.x);
      const newY = Math.max(0, e.clientY - rect.top - dragState.offset.y);

      // Update note position immediately for smooth dragging
      const noteElement = document.getElementById(`note-${dragState.noteId}`);
      if (noteElement) {
        noteElement.style.left = `${newX}px`;
        noteElement.style.top = `${newY}px`;
      }
    }

    if (resizeState.isResizing && resizeState.noteId) {
      const deltaX = e.clientX - resizeState.startPosition.x;
      const deltaY = e.clientY - resizeState.startPosition.y;

      const newWidth = Math.max(200, resizeState.startSize.width + deltaX);
      const newHeight = Math.max(150, resizeState.startSize.height + deltaY);

      // Update note size immediately for smooth resizing
      const noteElement = document.getElementById(`note-${resizeState.noteId}`);
      if (noteElement) {
        noteElement.style.width = `${newWidth}px`;
        noteElement.style.height = `${newHeight}px`;
      }
    }
  }, [dragState, resizeState]);

  // Handle mouse up for dragging and resizing
  const handleMouseUp = useCallback(async () => {
    if (dragState.isDragging && dragState.noteId) {
      const noteElement = document.getElementById(`note-${dragState.noteId}`);
      if (noteElement) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const newX = parseInt(noteElement.style.left);
          const newY = parseInt(noteElement.style.top);
          
          await onNoteUpdate(dragState.noteId, {
            positionX: newX,
            positionY: newY,
          });
        }
      }
    }

    if (resizeState.isResizing && resizeState.noteId) {
      const noteElement = document.getElementById(`note-${resizeState.noteId}`);
      if (noteElement) {
        const newWidth = parseInt(noteElement.style.width);
        const newHeight = parseInt(noteElement.style.height);
        
        await onNoteUpdate(resizeState.noteId, {
          width: newWidth,
          height: newHeight,
        });
      }
    }

    setDragState({
      isDragging: false,
      noteId: null,
      offset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
    });

    setResizeState({
      isResizing: false,
      noteId: null,
      startSize: { width: 0, height: 0 },
      startPosition: { x: 0, y: 0 },
    });
  }, [dragState, resizeState, onNoteUpdate]);

  // Add event listeners
  useEffect(() => {
    if (dragState.isDragging || resizeState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, resizeState.isResizing, handleMouseMove, handleMouseUp]);

  // Handle note editing
  const startEditing = useCallback((note: NoteWithAuthor) => {
    if (!canEdit) return;
    
    setEditingNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }, [canEdit]);

  const saveEdit = useCallback(async () => {
    if (!editingNote) return;

    await onNoteUpdate(editingNote, {
      title: editTitle,
      content: editContent,
    });

    setEditingNote(null);
    setEditTitle('');
    setEditContent('');
  }, [editingNote, editTitle, editContent, onNoteUpdate]);

  const cancelEdit = useCallback(() => {
    setEditingNote(null);
    setEditTitle('');
    setEditContent('');
  }, []);

  // Handle note deletion
  const handleDelete = useCallback(async (noteId: string) => {
    if (!canEdit) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
      await onNoteDelete(noteId);
    }
  }, [canEdit, onNoteDelete]);

  // Get note type icon
  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'CODE':
        return <Code className="w-4 h-4" />;
      case 'RICH_TEXT':
        return <FileText className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-crosshair"
        onDoubleClick={handleCanvasDoubleClick}
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

        {/* Notes */}
        {notes.map((note) => (
          <div
            key={note.id}
            id={`note-${note.id}`}
            className={`absolute bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
              selectedNote === note.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            } ${dragState.isDragging && dragState.noteId === note.id ? 'z-50' : 'z-10'}`}
            style={{
              left: note.positionX,
              top: note.positionY,
              width: note.width,
              height: note.height,
              backgroundColor: note.color,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNote(note.id);
            }}
          >
            {/* Note header */}
            <div
              className="flex items-center justify-between p-3 border-b border-gray-200 cursor-move bg-white bg-opacity-90 rounded-t-lg"
              onMouseDown={(e) => handleMouseDown(e, note.id)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getNoteIcon(note.type)}
                {editingNote === note.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-sm font-medium truncate">{note.title}</h3>
                )}
              </div>
              
              {canEdit && selectedNote === note.id && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(note);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Note content */}
            <div className="p-3 h-full overflow-auto">
              {editingNote === note.id ? (
                <div className="h-full flex flex-col">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 text-sm resize-none border-none outline-none bg-transparent"
                    placeholder="Write your note..."
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {note.type === 'CODE' ? (
                    <pre className="font-mono text-xs">{note.content}</pre>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                  )}
                </div>
              )}
            </div>

            {/* Author info */}
            <div className="absolute bottom-1 right-1 text-xs text-gray-500">
              {note.author.username}
            </div>

            {/* Resize handle */}
            {canEdit && selectedNote === note.id && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 cursor-se-resize"
                onMouseDown={(e) => handleResizeStart(e, note.id)}
              />
            )}
          </div>
        ))}

        {/* Create note menu */}
        {showCreateMenu && (
          <div
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50"
            style={{
              left: createPosition.x,
              top: createPosition.y,
            }}
          >
            <div className="text-xs text-gray-600 mb-2 px-2">Create Note</div>
            <div className="space-y-1">
              <button
                onClick={() => handleCreateNote('TEXT')}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded"
              >
                <Type className="w-4 h-4" />
                <span>Text Note</span>
              </button>
              <button
                onClick={() => handleCreateNote('CODE')}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded"
              >
                <Code className="w-4 h-4" />
                <span>Code Note</span>
              </button>
              <button
                onClick={() => handleCreateNote('RICH_TEXT')}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded"
              >
                <FileText className="w-4 h-4" />
                <span>Rich Text</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating add button */}
      {canEdit && (
        <button
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              setCreatePosition({
                x: rect.width / 2 - 100,
                y: rect.height / 2 - 100,
              });
              setShowCreateMenu(true);
            }
          }}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}