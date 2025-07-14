'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FolderIcon,
  DocumentTextIcon,
  TrashIcon,
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Mousetrap from 'mousetrap';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getSampleNotes, getSampleCategories, Note } from '@/hooks/useSampleData';

interface Category {
  id: string;
  name: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: 'all', name: 'All Notes', color: '#6366f1' },
  { id: 'favorites', name: 'Favorites', color: '#f59e0b' },
  { id: 'trash', name: 'Trash', color: '#ef4444' },
];

export default function TakeNote() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const editorRef = useRef<any>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('takenote-notes');
    const savedCategories = localStorage.getItem('takenote-categories');
    const savedTheme = localStorage.getItem('takenote-theme');
    const hasInitialized = localStorage.getItem('takenote-initialized');
    
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(parsedNotes);
    } else if (!hasInitialized) {
      // First time user - load sample data
      const sampleNotes = getSampleNotes();
      setNotes(sampleNotes);
      localStorage.setItem('takenote-notes', JSON.stringify(sampleNotes));
      localStorage.setItem('takenote-initialized', 'true');
    }
    
    if (savedCategories) {
      setCategories([...defaultCategories, ...JSON.parse(savedCategories)]);
    } else if (!hasInitialized) {
      // First time user - load sample categories
      const sampleCategories = getSampleCategories();
      setCategories([...defaultCategories, ...sampleCategories]);
      localStorage.setItem('takenote-categories', JSON.stringify(sampleCategories));
    }
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('takenote-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const customCategories = categories.filter(cat => !defaultCategories.find(def => def.id === cat.id));
    localStorage.setItem('takenote-categories', JSON.stringify(customCategories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('takenote-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    Mousetrap.bind('ctrl+n', (e) => {
      e.preventDefault();
      createNewNote();
    });
    
    Mousetrap.bind('ctrl+s', (e) => {
      e.preventDefault();
      if (selectedNote) {
        saveNote();
      }
    });
    
    Mousetrap.bind('ctrl+f', (e) => {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    });
    
    Mousetrap.bind('ctrl+p', (e) => {
      e.preventDefault();
      setShowPreview(!showPreview);
    });
    
    Mousetrap.bind('ctrl+d', (e) => {
      e.preventDefault();
      setDarkMode(!darkMode);
    });

    return () => {
      Mousetrap.unbind(['ctrl+n', 'ctrl+s', 'ctrl+f', 'ctrl+p', 'ctrl+d']);
    };
  }, [selectedNote, showPreview, darkMode]);

  const createNewNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      category: selectedCategory === 'all' || selectedCategory === 'favorites' || selectedCategory === 'trash' ? 'general' : selectedCategory,
      tags: [],
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    toast.success('New note created');
  };

  const saveNote = () => {
    if (!selectedNote) return;
    
    setNotes(notes.map(note => 
      note.id === selectedNote.id 
        ? { ...selectedNote, updatedAt: new Date() }
        : note
    ));
    toast.success('Note saved');
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    toast.success('Note deleted');
  };

  const toggleFavorite = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, favorite: !note.favorite }
        : note
    ));
  };

  const exportNotes = async () => {
    const zip = new JSZip();
    
    notes.forEach(note => {
      const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      const content = `# ${note.title}\n\n${note.content}\n\n---\nCreated: ${note.createdAt.toISOString()}\nUpdated: ${note.updatedAt.toISOString()}\nCategory: ${note.category}\nTags: ${note.tags.join(', ')}\nFavorite: ${note.favorite}`;
      zip.file(filename, content);
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'takenote-export.zip');
    toast.success('Notes exported successfully');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'favorites') return matchesSearch && note.favorite;
    if (selectedCategory === 'trash') return false; // We don't have trash functionality yet
    
    return matchesSearch && note.category === selectedCategory;
  });

  const renderMarkdown = (content: string) => {
    // Process linked notes {{uuid}} syntax
    const processedContent = content.replace(/\{\{([^}]+)\}\}/g, (match, noteId) => {
      const linkedNote = notes.find(n => n.id === noteId || n.title === noteId);
      if (linkedNote) {
        return `[${linkedNote.title}](#note-${linkedNote.id})`;
      }
      return match;
    });
    
    const html = marked(processedContent);
    return DOMPurify.sanitize(html);
  };

  const getLanguageExtension = (content: string) => {
    if (content.includes('```javascript') || content.includes('```js')) return [javascript()];
    if (content.includes('```python') || content.includes('```py')) return [python()];
    if (content.includes('```html')) return [html()];
    if (content.includes('```css')) return [css()];
    if (content.includes('```json')) return [json()];
    return [markdown()];
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                TakeNote
              </h1>
            )}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <CommandLineIcon className="w-5 h-5" />
              </motion.button>
              {!sidebarCollapsed && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createNewNote}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
          
          {!sidebarCollapsed && (
            <div className="mt-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Categories */}
            <div className="p-4">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'
                        : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1">{category.name}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {category.id === 'all' ? notes.length : 
                       category.id === 'favorites' ? notes.filter(n => n.favorite).length :
                       category.id === 'trash' ? 0 :
                       notes.filter(n => n.category === category.id).length}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Notes ({filteredNotes.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedNote(note)}
                      className={`group p-3 rounded-lg cursor-pointer border transition-all ${
                        selectedNote?.id === note.id
                          ? darkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-100 border-blue-300 text-blue-900'
                          : darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm line-clamp-1">{note.title}</h4>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {note.favorite ? (
                              <StarIconSolid className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs ${selectedNote?.id === note.id ? 'text-blue-200' : darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                        {note.content || 'No content'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${selectedNote?.id === note.id ? 'text-blue-200' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {note.updatedAt.toLocaleDateString()}
                        </span>
                        {note.favorite && (
                          <StarIconSolid className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                  className={`text-lg font-semibold bg-transparent border-none outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
                />
                <div className="flex items-center gap-2">
                  {selectedNote.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(!showPreview)}
                  className={`p-2 rounded-lg ${showPreview ? 'bg-blue-600 text-white' : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <EyeIcon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportNotes}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex">
              {/* Code Editor */}
              <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
                <CodeMirror
                  ref={editorRef}
                  value={selectedNote.content}
                  onChange={(value) => setSelectedNote({ ...selectedNote, content: value })}
                  theme={darkMode ? oneDark : undefined}
                  extensions={[
                    ...getLanguageExtension(selectedNote.content),
                    EditorView.theme({
                      '&': {
                        fontSize: '14px',
                        height: '100%',
                      },
                      '.cm-content': {
                        padding: '16px',
                        minHeight: '100%',
                      },
                      '.cm-focused': {
                        outline: 'none',
                      },
                    }),
                  ]}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    highlightSelectionMatches: true,
                    searchKeymap: true,
                  }}
                />
              </div>

              {/* Preview Pane */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '50%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`border-l ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} overflow-hidden`}
                  >
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Preview
                      </h3>
                    </div>
                    <div className={`p-4 overflow-y-auto h-full prose ${darkMode ? 'prose-invert' : ''} max-w-none`}>
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: renderMarkdown(selectedNote.content) 
                        }} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="text-center">
              <DocumentTextIcon className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No note selected
              </h3>
              <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-4`}>
                Select a note from the sidebar or create a new one
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createNewNote}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Note
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 w-full max-w-md border`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dark Mode
                  </span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Keyboard Shortcuts
                  </h3>
                  <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>Ctrl+N - New note</div>
                    <div>Ctrl+S - Save note</div>
                    <div>Ctrl+F - Search</div>
                    <div>Ctrl+P - Toggle preview</div>
                    <div>Ctrl+D - Toggle dark mode</div>
                  </div>
                </div>
                
                <div>
                  <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Storage
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Notes are stored locally in your browser
                  </p>
                  <button
                    onClick={exportNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Export All Notes
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}