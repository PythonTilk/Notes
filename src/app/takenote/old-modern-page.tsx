'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  TrashIcon,
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  HeartIcon,
  XMarkIcon,
  Bars3Icon,
  FolderIcon,
  BookOpenIcon,
  TagIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
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
import prettier from 'prettier/standalone';
import parserMarkdown from 'prettier/parser-markdown';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

export default function ModernTakeNote() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const editorRef = useRef<any>(null);

  const defaultCategories: Category[] = [
    { id: 'all', name: 'All Notes', color: 'from-blue-500 to-purple-600', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { id: 'favorites', name: 'Favorites', color: 'from-pink-500 to-rose-500', icon: <HeartIcon className="w-4 h-4" /> },
    { id: 'trash', name: 'Trash', color: 'from-gray-500 to-gray-600', icon: <TrashIcon className="w-4 h-4" /> },
  ];

  const [categories, setCategories] = useState<Category[]>(defaultCategories);

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
      const sampleNotes = getSampleNotes();
      setNotes(sampleNotes);
      localStorage.setItem('takenote-notes', JSON.stringify(sampleNotes));
      localStorage.setItem('takenote-initialized', 'true');
    }
    
    if (savedCategories) {
      setCategories([...defaultCategories, ...JSON.parse(savedCategories)]);
    } else if (!hasInitialized) {
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
    localStorage.setItem('takenote-categories', JSON.stringify(categories.slice(3)));
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

    Mousetrap.bind('ctrl+shift+f', (e) => {
      e.preventDefault();
      if (selectedNote) {
        formatNote();
      }
    });

    return () => {
      Mousetrap.unbind(['ctrl+n', 'ctrl+s', 'ctrl+f', 'ctrl+p', 'ctrl+d', 'ctrl+shift+f']);
    };
  }, [selectedNote, showPreview, darkMode]);

  const createNewNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      category: 'general',
      tags: [],
      favorite: false,
    };
    
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    toast.success('New note created');
  };

  const saveNote = () => {
    if (!selectedNote) return;
    
    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id
        ? { ...selectedNote, updatedAt: new Date() }
        : note
    );
    
    setNotes(updatedNotes);
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
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, favorite: !note.favorite } : note
    );
    setNotes(updatedNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, favorite: !selectedNote.favorite });
    }
  };

  const getLanguageExtension = (content: string) => {
    if (content.includes('```javascript') || content.includes('```js')) return [javascript()];
    if (content.includes('```python')) return [python()];
    if (content.includes('```html')) return [html()];
    if (content.includes('```css')) return [css()];
    if (content.includes('```json')) return [json()];
    return [markdown()];
  };

  const processLinkedNotes = (content: string) => {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, noteTitle) => {
      const linkedNote = notes.find(note => 
        note.title.toLowerCase() === noteTitle.toLowerCase()
      );
      return linkedNote 
        ? `[${noteTitle}](#note-${linkedNote.id})`
        : match;
    });
  };

  const formatNote = async () => {
    if (!selectedNote) return;
    
    try {
      let formattedContent = selectedNote.content;
      
      if (selectedNote.content.includes('```javascript') || selectedNote.content.includes('```js')) {
        formattedContent = selectedNote.content.replace(
          /```(?:javascript|js)\n([\s\S]*?)\n```/g,
          (match, code) => {
            try {
              const formatted = prettier.format(code, {
                parser: 'babel',
                plugins: [parserBabel],
                semi: true,
                singleQuote: true,
                tabWidth: 2,
              });
              return `\`\`\`javascript\n${formatted.trim()}\n\`\`\``;
            } catch {
              return match;
            }
          }
        );
      } else if (selectedNote.content.includes('```html')) {
        formattedContent = selectedNote.content.replace(
          /```html\n([\s\S]*?)\n```/g,
          (match, code) => {
            try {
              const formatted = prettier.format(code, {
                parser: 'html',
                plugins: [parserHtml],
                tabWidth: 2,
              });
              return `\`\`\`html\n${formatted.trim()}\n\`\`\``;
            } catch {
              return match;
            }
          }
        );
      } else if (selectedNote.content.includes('```css')) {
        formattedContent = selectedNote.content.replace(
          /```css\n([\s\S]*?)\n```/g,
          (match, code) => {
            try {
              const formatted = prettier.format(code, {
                parser: 'css',
                plugins: [parserCss],
                tabWidth: 2,
              });
              return `\`\`\`css\n${formatted.trim()}\n\`\`\``;
            } catch {
              return match;
            }
          }
        );
      } else {
        try {
          formattedContent = prettier.format(selectedNote.content, {
            parser: 'markdown',
            plugins: [parserMarkdown],
            tabWidth: 2,
            proseWrap: 'preserve',
          });
        } catch {
          // If markdown formatting fails, keep original content
        }
      }
      
      setSelectedNote({ ...selectedNote, content: formattedContent });
      toast.success('Note formatted with Prettier');
    } catch (error) {
      console.error('Error formatting note:', error);
      toast.error('Failed to format note');
    }
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
    if (selectedCategory === 'trash') return false; // Implement trash later
    
    return matchesSearch && note.category === selectedCategory;
  });

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return notes.length;
    if (categoryId === 'favorites') return notes.filter(note => note.favorite).length;
    if (categoryId === 'trash') return 0;
    return notes.filter(note => note.category === categoryId).length;
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#374151' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
            border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />

      <div className="flex h-screen">
        {/* Modern Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 0 : 320 }}
          className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-xl border-r ${
            darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
          } flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200/10">
            <div className="flex items-center justify-between mb-6">
              <motion.h1 
                className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                TakeNote
              </motion.h1>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewNote}
                  className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <Bars3Icon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                id="search-input"
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200`}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-6">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 uppercase tracking-wider`}>
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : darkMode
                      ? 'hover:bg-gray-700/50 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-lg ${
                    selectedCategory === category.id
                      ? 'bg-white/20'
                      : darkMode
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {getCategoryCount(category.id)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-hidden">
            <div className="px-6 pb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 uppercase tracking-wider`}>
                Notes ({filteredNotes.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedNote(note)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedNote?.id === note.id
                          ? darkMode
                            ? 'bg-blue-600/20 border-blue-500/50 border'
                            : 'bg-blue-50 border-blue-200 border'
                          : darkMode
                          ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30'
                          : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold truncate ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {note.title}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(note.id);
                            }}
                            className={`p-1 rounded-lg transition-colors ${
                              note.favorite
                                ? 'text-pink-500 hover:text-pink-600'
                                : darkMode
                                ? 'text-gray-400 hover:text-pink-400'
                                : 'text-gray-400 hover:text-pink-500'
                            }`}
                          >
                            {note.favorite ? (
                              <HeartIconSolid className="w-4 h-4" />
                            ) : (
                              <HeartIcon className="w-4 h-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {note.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {note.updatedAt.toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className={`text-xs px-2 py-1 rounded-lg ${
                                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Editor Header */}
              <div className={`px-8 py-6 border-b ${
                darkMode ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-200/50 bg-white/30'
              } backdrop-blur-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={selectedNote.title}
                      onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                      className={`text-2xl font-bold bg-transparent border-none outline-none ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      } placeholder-gray-400`}
                      placeholder="Note title..."
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(selectedNote.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        selectedNote.favorite
                          ? 'text-pink-500 hover:text-pink-600'
                          : darkMode
                          ? 'text-gray-400 hover:text-pink-400'
                          : 'text-gray-400 hover:text-pink-500'
                      }`}
                    >
                      {selectedNote.favorite ? (
                        <HeartIconSolid className="w-5 h-5" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={formatNote}
                      className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      title="Format with Prettier (Ctrl+Shift+F)"
                    >
                      <SparklesIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPreview(!showPreview)}
                      className={`p-3 rounded-xl ${
                        showPreview 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-all duration-200`}
                      title="Toggle Preview (Ctrl+P)"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDarkMode(!darkMode)}
                      className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      title="Toggle Theme (Ctrl+D)"
                    >
                      {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportNotes}
                      className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      title="Export All Notes"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 flex">
                {/* Editor */}
                <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
                  <CodeMirror
                    value={selectedNote.content}
                    onChange={(value) => setSelectedNote({ ...selectedNote, content: value })}
                    extensions={[
                      ...getLanguageExtension(selectedNote.content),
                      EditorView.theme({
                        '&': {
                          fontSize: '14px',
                          height: '100%',
                        },
                        '.cm-content': {
                          padding: '24px',
                          minHeight: '100%',
                          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        },
                        '.cm-focused': {
                          outline: 'none',
                        },
                        '.cm-editor': {
                          height: '100%',
                        },
                        '.cm-scroller': {
                          height: '100%',
                        },
                      }),
                    ]}
                    theme={darkMode ? oneDark : undefined}
                    className="h-full"
                  />
                </div>

                {/* Preview */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '50%', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className={`border-l ${
                        darkMode ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-200/50 bg-white/30'
                      } backdrop-blur-xl overflow-y-auto`}
                    >
                      <div className="p-8">
                        <div
                          className={`prose max-w-none ${
                            darkMode ? 'prose-invert' : ''
                          } prose-headings:font-bold prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded`}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              marked(processLinkedNotes(selectedNote.content))
                            ),
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md mx-auto px-8"
              >
                <div className={`w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center`}>
                  <DocumentTextIcon className={`w-12 h-12 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Ready to create?
                </h2>
                <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select a note from the sidebar or create a new one to get started with your modern note-taking experience.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewNote}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Create Your First Note
                </motion.button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}