'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

interface Note {
  id: number;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  tags: string[];
  author: {
    id: number;
    name: string;
    email: string;
  };
  workspace: {
    id: number;
    name: string;
    color: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface Workspace {
  id: number;
  name: string;
  description: string;
  color: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  members: Array<{
    id: number;
    role: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  notes: Note[];
}

export default function WorkspaceCanvas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    x: 0,
    y: 0
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchWorkspace();
  }, [session, status, router, workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data);
        setNotes(data.notes);
      } else if (response.status === 404) {
        toast.error('Workspace not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
      toast.error('Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim()) {
      toast.error('Note title is required');
      return;
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newNote,
          workspaceId: parseInt(workspaceId),
          type: 'TEXT',
          tags: [],
        }),
      });

      if (response.ok) {
        const note = await response.json();
        setNotes([...notes, note]);
        setShowCreateModal(false);
        setNewNote({ title: '', content: '', x: 0, y: 0 });
        toast.success('Note created successfully!');
      } else {
        toast.error('Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNotePosition = async (noteId: number, x: number, y: number) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: noteId,
          x,
          y,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to update note position');
      }
    } catch (error) {
      console.error('Error updating note position:', error);
    }
  };

  const handleNoteMouseDown = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    setSelectedNote(note);
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedNote || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === selectedNote.id
          ? { ...note, x: newX, y: newY }
          : note
      )
    );
  }, [isDragging, selectedNote, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && selectedNote) {
      const updatedNote = notes.find(n => n.id === selectedNote.id);
      if (updatedNote) {
        updateNotePosition(selectedNote.id, updatedNote.x, updatedNote.y);
      }
    }
    setIsDragging(false);
    setSelectedNote(null);
  }, [isDragging, selectedNote, notes]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    setNewNote({ ...newNote, x, y });
    setShowCreateModal(true);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session || !workspace) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                style={{ backgroundColor: workspace.color }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{workspace.name}</h1>
                <p className="text-purple-200 text-sm">{workspace.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-purple-200 text-sm">
              <UsersIcon className="w-4 h-4" />
              {workspace.members.length} members
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Note
            </motion.button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="pt-20 h-full">
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          panning={{ disabled: isDragging }}
        >
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="w-full h-full"
          >
            <div
              ref={canvasRef}
              className="relative w-[5000px] h-[5000px] bg-gradient-to-br from-slate-800/20 to-purple-800/20"
              onDoubleClick={handleCanvasDoubleClick}
              style={{
                backgroundImage: `
                  radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)
                `,
                backgroundSize: '50px 50px',
              }}
            >
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Notes */}
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  className={`absolute bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 cursor-move select-none ${
                    selectedNote?.id === note.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{
                    left: note.x,
                    top: note.y,
                    width: note.width,
                    height: note.height,
                  }}
                  onMouseDown={(e) => handleNoteMouseDown(e, note)}
                >
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                        {note.title}
                      </h3>
                      <div 
                        className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
                        style={{ backgroundColor: workspace.color }}
                      />
                    </div>
                    
                    <p className="text-gray-600 text-xs flex-1 overflow-hidden">
                      {note.content}
                    </p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {note.author.name || note.author.email}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Welcome message for empty workspace */}
              {notes.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                >
                  <div className="text-purple-300 text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-white mb-2">Empty Canvas</h3>
                  <p className="text-purple-200 mb-4">Double-click anywhere to create your first note</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Create First Note
                  </motion.button>
                </motion.div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Create Note Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Note</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter note title"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                    placeholder="Enter note content"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNote}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}