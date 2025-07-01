
import { Note } from '@prisma/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Note({ note }: { note: Note }) {
  const renderContent = () => {
    if (note.type === 'RICH_TEXT') {
      return <div dangerouslySetInnerHTML={{ __html: note.content || '' }} className="note-content rich-text" />;
    } else if (note.type === 'CODE') {
      return (
        <SyntaxHighlighter language="javascript" style={coldarkDark} className="note-content code-note">
          {note.content || ''}
        </SyntaxHighlighter>
      );
    } else {
      return <p className="note-content">{note.content}</p>;
    }
  };

  return (
    <div className={`note ${note.type === 'TEXT' ? 'text-note' : note.type === 'CODE' ? 'code-note' : ''}`}>
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className={`note-type-indicator ${note.type === 'TEXT' ? 'text' : note.type === 'CODE' ? 'code' : ''}`}>
          {note.type === 'TEXT' && 'T'}
          {note.type === 'RICH_TEXT' && 'R'}
          {note.type === 'CODE' && 'C'}
        </div>
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, index) => (
            <span key={index} className="note-tag">{tag}</span>
          ))}
        </div>
      )}
      {renderContent()}
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
          <button className="note-action">
            {/* Share Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-share-2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
          {/* Other actions like edit/delete will go here */}
        </div>
      </div>
    </div>
  );
}
