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
  ChevronDownIcon,
  HomeIcon,
  BriefcaseIcon,
  TrophyIcon,
  ChartBarIcon
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

export default function RugplayTakeNote() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const editorRef = useRef<any>(null);

  const defaultCategories: Category[] = [
    { id: 'all', name: 'All Notes', color: 'text-blue-600', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { id: 'favorites', name: 'Favorites', color: 'text-pink-600', icon: <HeartIcon className="w-4 h-4" /> },
    { id: 'recent', name: 'Recent', color: 'text-green-600', icon: <ClockIcon className="w-4 h-4" /> },
    { id: 'work', name: 'Work', color: 'text-purple-600', icon: <BriefcaseIcon className="w-4 h-4" /> },
    { id: 'personal', name: 'Personal', color: 'text-orange-600', icon: <HomeIcon className="w-4 h-4" /> },
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
    localStorage.setItem('takenote-categories', JSON.stringify(categories.slice(5)));
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
      category: 'personal',
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
    if (selectedCategory === 'recent') {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return matchesSearch && note.updatedAt > threeDaysAgo;
    }
    
    return matchesSearch && note.category === selectedCategory;
  });

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return notes.length;
    if (categoryId === 'favorites') return notes.filter(note => note.favorite).length;
    if (categoryId === 'recent') {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return notes.filter(note => note.updatedAt > threeDaysAgo).length;
    }
    return notes.filter(note => note.category === categoryId).length;
  };

  return (
    <div className={`min-h-screen font-['Inter',sans-serif] ${
      darkMode 
        ? 'bg-[oklch(0.141_0.005_285.823)] text-[oklch(0.985_0_0)]' 
        : 'bg-[oklch(1_0_0)] text-[oklch(0.141_0.005_285.823)]'
    }`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? 'oklch(0.21 0.006 285.885)' : 'oklch(1 0 0)',
            color: darkMode ? 'oklch(0.985 0 0)' : 'oklch(0.141 0.005 285.823)',
            border: `1px solid ${darkMode ? 'oklch(1 0 0 / 10%)' : 'oklch(0.92 0.004 286.32)'}`,
            borderRadius: '0.5rem',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      <div className="flex h-screen">
        {/* Rugplay-style Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 0 : 280 }}
          className={`${
            darkMode 
              ? 'bg-[oklch(0.21_0.006_285.885)] border-[oklch(1_0_0_/_10%)]' 
              : 'bg-[oklch(0.985_0_0)] border-[oklch(0.92_0.004_286.32)]'
          } border-r flex flex-col overflow-hidden`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[oklch(1_0_0_/_10%)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[oklch(0.637_0.237_25.331)] rounded-sm flex items-center justify-center">
                  <DocumentTextIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-base font-semibold">TakeNote</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewNote}
                  className="p-1.5 rounded-md bg-[oklch(0.637_0.237_25.331)] text-white hover:bg-[oklch(0.6_0.22_25.331)] transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`p-1.5 rounded-md transition-colors ${
                    darkMode 
                      ? 'hover:bg-[oklch(0.274_0.006_286.033)]' 
                      : 'hover:bg-[oklch(0.967_0.001_286.375)]'
                  }`}
                >
                  <Bars3Icon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-[oklch(0.705_0.015_286.067)]' : 'text-[oklch(0.552_0.016_285.938)]'
              }`} />
              <input
                id="search-input"
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border text-sm ${
                  darkMode 
                    ? 'bg-[oklch(1_0_0_/_15%)] border-[oklch(1_0_0_/_10%)] text-[oklch(0.985_0_0)] placeholder-[oklch(0.705_0.015_286.067)]' 
                    : 'bg-[oklch(0.967_0.001_286.375)] border-[oklch(0.92_0.004_286.32)] text-[oklch(0.141_0.005_285.823)] placeholder-[oklch(0.552_0.016_285.938)]'
                } focus:outline-none focus:ring-2 focus:ring-[oklch(0.637_0.237_25.331)] transition-all`}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-4">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              darkMode ? 'text-[oklch(0.705_0.015_286.067)]' : 'text-[oklch(0.552_0.016_285.938)]'
            }`}>
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-all ${
                    selectedCategory === category.id
                      ? 'bg-[oklch(0.637_0.237_25.331)] text-white'
                      : darkMode
                      ? 'hover:bg-[oklch(0.274_0.006_286.033)] text-[oklch(0.985_0_0)]'
                      : 'hover:bg-[oklch(0.967_0.001_286.375)] text-[oklch(0.141_0.005_285.823)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={selectedCategory === category.id ? 'text-white' : category.color}>
                      {category.icon}
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : darkMode
                      ? 'bg-[oklch(0.274_0.006_286.033)] text-[oklch(0.705_0.015_286.067)]'
                      : 'bg-[oklch(0.967_0.001_286.375)] text-[oklch(0.552_0.016_285.938)]'
                  }`}>
                    {getCategoryCount(category.id)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-hidden">
            <div className="px-4 pb-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                darkMode ? 'text-[oklch(0.705_0.015_286.067)]' : 'text-[oklch(0.552_0.016_285.938)]'
              }`}>
                Notes ({filteredNotes.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedNote(note)}
                      className={`p-3 rounded-md cursor-pointer transition-all ${
                        selectedNote?.id === note.id
                          ? darkMode
                            ? 'bg-[oklch(0.637_0.237_25.331)]/20 border border-[oklch(0.637_0.237_25.331)]/50'
                            : 'bg-[oklch(0.637_0.237_25.331)]/10 border border-[oklch(0.637_0.237_25.331)]/30'
                          : darkMode
                          ? 'bg-[oklch(0.274_0.006_286.033)] hover:bg-[oklch(0.274_0.006_286.033)]/80 border border-[oklch(1_0_0_/_10%)]'
                          : 'bg-[oklch(1_0_0)] hover:bg-[oklch(0.967_0.001_286.375)] border border-[oklch(0.92_0.004_286.32)] shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm truncate flex-1">
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
                            className={`p-1 rounded transition-colors ${
                              note.favorite
                                ? 'text-pink-500 hover:text-pink-600'
                                : darkMode
                                ? 'text-[oklch(0.705_0.015_286.067)] hover:text-pink-400'
                                : 'text-[oklch(0.552_0.016_285.938)] hover:text-pink-500'
                            }`}
                          >
                            {note.favorite ? (
                              <HeartIconSolid className="w-3 h-3" />
                            ) : (
                              <HeartIcon className="w-3 h-3" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                      <p className={`text-xs ${
                        darkMode ? 'text-[oklch(0.705_0.015_286.067)]' : 'text-[oklch(0.552_0.016_285.938)]'
                      } line-clamp-2 mb-2`}>
                        {note.content.substring(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${
                          darkMode ? 'text-[oklch(0.705_0.015_286.067)]' : 'text-[oklch(0.552_0.016_285.938)]'
                        }`}>
                          {note.updatedAt.toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                darkMode 
                                  ? 'bg-[oklch(0.274_0.006_286.033)] text-[oklch(0.705_0.015_286.067)]' 
                                  : 'bg-[oklch(0.967_0.001_286.375)] text-[oklch(0.552_0.016_285.938)]'
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
              {/* Header */}
              <div className={`px-6 py-4 border-b ${
                darkMode 
                  ? 'border-[oklch(1_0_0_/_10%)] bg-[oklch(0.21_0.006_285.885)]' 
                  : 'border-[oklch(0.92_0.004_286.32)] bg-[oklch(0.985_0_0)]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={selectedNote.title}
                      onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                      className="text-xl font-bold bg-transparent border-none outline-none placeholder-gray-400"
                      placeholder="Note title..."
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(selectedNote.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        selectedNote.favorite
                          ? 'text-pink-500 hover:text-pink-600'
                          : darkMode
                          ? 'text-[oklch(0.705_0.015_286.067)] hover:text-pink-400'
                          : 'text-[oklch(0.552_0.016_285.938)] hover:text-pink-500'
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
                      className={`p-2 rounded-md transition-colors ${
                        darkMode 
                          ? 'hover:bg-[oklch(0.274_0.006_286.033)]' 
                          : 'hover:bg-[oklch(0.967_0.001_286.375)]'
                      }`}
                      title="Format with Prettier (Ctrl+Shift+F)"
                    >
                      <SparklesIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPreview(!showPreview)}
                      className={`p-2 rounded-md transition-colors ${
                        showPreview 
                          ? 'bg-[oklch(0.637_0.237_25.331)] text-white' 
                          : darkMode 
                          ? 'hover:bg-[oklch(0.274_0.006_286.033)]' 
                          : 'hover:bg-[oklch(0.967_0.001_286.375)]'
                      }`}
                      title="Toggle Preview (Ctrl+P)"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDarkMode(!darkMode)}
                      className={`p-2 rounded-md transition-colors ${
                        darkMode 
                          ? 'hover:bg-[oklch(0.274_0.006_286.033)]' 
                          : 'hover:bg-[oklch(0.967_0.001_286.375)]'
                      }`}
                      title="Toggle Theme (Ctrl+D)"
                    >
                      {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportNotes}
                      className={`p-2 rounded-md transition-colors ${
                        darkMode 
                          ? 'hover:bg-[oklch(0.274_0.006_286.033)]' 
                          : 'hover:bg-[oklch(0.967_0.001_286.375)]'
                      }`}
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
                          fontFamily: 'Inter, sans-serif',
                        },
                        '.cm-content': {
                          padding: '20px',
                          minHeight: '100%',
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
                      className={`border-l overflow-y-auto ${
                        darkMode 
                          ? 'border-[oklch(1_0_0_/_10%)] bg-[oklch(0.21_0.006_285.885)]' 
                          : 'border-[oklch(0.92_0.004_286.32)] bg-[oklch(0.985_0_0)]'
                      }`}
                    >
                      <div className="p-6">
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
                <div className={`w-20 h-20 mx-auto mb-6 rounded-xl flex items-center justify-center ${
                  darkMode 
                    ? 'bg-[oklch(0.637_0.237_25.331)]/20' 
                    : 'bg-[oklch(0.637_0.237_25.331)]/10'
                }`}>
                  <DocumentTextIcon className="w-10 h-10 text-[oklch(0.637_0.237_25.331)]" />
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  Ready to create?
                </h2>
                <p className={`text-base mb-6 ${
                  darkMode ? 'text-[oklch(0.705_0.015_286.067)]' : 'text-[oklch(0.552_0.016_285.938)]'
                }`}>
                  Select a note from the sidebar or create a new one to get started.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewNote}
                  className="px-6 py-3 bg-[oklch(0.637_0.237_25.331)] text-white font-semibold rounded-md hover:bg-[oklch(0.6_0.22_25.331)] transition-colors"
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