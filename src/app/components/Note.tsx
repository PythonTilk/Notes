
'use client';

import { Note as NoteType } from '@prisma/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark, coldarkLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NoteProps {
  note: NoteType;
  onEdit?: (note: NoteType) => void;
  onDelete?: (noteId: number) => void;
  onView?: (note: NoteType) => void;
  onShare?: (note: NoteType) => void;
  isOwner?: boolean;
}

export default function Note({ note, onEdit, onDelete, onView, onShare, isOwner = true }: NoteProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    // Get theme from document
    const dataTheme = document.documentElement.getAttribute('data-theme');
    setTheme(dataTheme === 'light' ? 'light' : 'dark');
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          setTheme(newTheme === 'light' ? 'light' : 'dark');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const renderContent = () => {
    if (note.type === 'RICH_TEXT') {
      return <div dangerouslySetInnerHTML={{ __html: note.content || '' }} className="note-content rich-text" />;
    } else if (note.type === 'CODE') {
      return (
        <SyntaxHighlighter 
          language="javascript" 
          style={theme === 'dark' ? coldarkDark : coldarkLight} 
          className="note-content code-note"
          customStyle={{ 
            background: 'transparent', 
            padding: '0',
            fontSize: '0.85rem',
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {note.content || ''}
        </SyntaxHighlighter>
      );
    } else {
      return <p className="note-content">{note.content}</p>;
    }
  };

  return (
    <motion.div 
      className={`note-card ${note.type === 'TEXT' ? 'text-note' : note.type === 'CODE' ? 'code-note' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)' }}
      style={{
        backgroundColor: note.type === 'CODE' ? (theme === 'dark' ? '#1e293b' : '#f8fafc') : undefined,
        borderRadius: '12px',
        padding: '20px',
        margin: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '300px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-meta">
          <div className={`note-type-indicator ${note.type === 'TEXT' ? 'text' : note.type === 'CODE' ? 'code' : ''}`}>
            {note.type === 'TEXT' && 'T'}
            {note.type === 'RICH_TEXT' && 'R'}
            {note.type === 'CODE' && 'C'}
          </div>
        </div>
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '10px 0' }}>
          {note.tags.map((tag, index) => (
            <span key={index} className="note-tag">{tag}</span>
          ))}
        </div>
      )}
      
      <div style={{ flex: 1 }}>
        {renderContent()}
      </div>
      
      {note.imageUrls && note.imageUrls.length > 0 && (
        <div className="note-images">
          {note.imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`Note Image ${index}`} className="note-image" />
          ))}
        </div>
      )}
      
      <div className="note-footer">
        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
        <span className="note-privacy-indicator">
          {note.published ? 'Public' : 'Private'}
        </span>
        <div className="note-actions">
          {onView && (
            <button className="note-action view-note" onClick={() => onView(note)} title="View note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          )}
          
          {isOwner && onEdit && (
            <button className="note-action" onClick={() => onEdit(note)} title="Edit note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
          
          {onShare && (
            <button className="note-action" onClick={() => onShare(note)} title="Share note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          )}
          
          {isOwner && onDelete && (
            <button className="note-action" onClick={() => onDelete(note.id)} title="Delete note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
