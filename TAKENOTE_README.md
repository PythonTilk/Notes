# TakeNote - Modern Next.js Implementation

A modern, developer-focused note-taking app inspired by [TakeNote by Tania Rascia](https://github.com/taniarascia/takenote), built with Next.js and modern web technologies.

![TakeNote Interface](https://img.shields.io/badge/Status-Complete-green)

## 🚀 Features

### Core Features (from Original TakeNote)
- ✅ **Plain text notes** - IDE-like environment with syntax highlighting
- ✅ **Markdown preview** - Live preview pane with rendered HTML
- ✅ **Linked notes** - Use `{{note-title}}` syntax to link between notes
- ✅ **Syntax highlighting** - Support for JavaScript, Python, HTML, CSS, JSON, and Markdown
- ✅ **Keyboard shortcuts** - Full keyboard navigation and shortcuts
- ✅ **Multi-cursor editing** - Powered by CodeMirror
- ✅ **Search notes** - Search across titles and content
- ✅ **No WYSIWYG** - Developer-focused plain text editing
- ✅ **Local storage** - Notes stored in browser (no database required)
- ✅ **Export functionality** - Download all notes as ZIP file
- ✅ **No tracking** - Privacy-focused, no analytics

### Modern Enhancements
- 🎨 **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- 🌙 **Dark/Light themes** - Toggle between themes
- 📱 **Responsive design** - Works on desktop and mobile
- ✨ **Smooth animations** - Powered by Framer Motion
- 📂 **Categories** - Organize notes into categories
- ⭐ **Favorites** - Star important notes
- 🔍 **Advanced search** - Real-time search with highlighting
- 📋 **Sample content** - Pre-loaded with helpful examples

## 🎯 Quick Start

1. **Access the app**: Navigate to `/takenote` route
2. **Create a note**: Press `Ctrl+N` or click the + button
3. **Toggle preview**: Press `Ctrl+P` to show/hide markdown preview
4. **Search**: Press `Ctrl+F` to focus search bar
5. **Save**: Press `Ctrl+S` to save current note
6. **Toggle theme**: Press `Ctrl+D` to switch dark/light mode

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Create new note |
| `Ctrl+S` | Save current note |
| `Ctrl+F` | Focus search bar |
| `Ctrl+P` | Toggle preview pane |
| `Ctrl+D` | Toggle dark/light mode |

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Editor**: CodeMirror 6
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Markdown**: Marked + DOMPurify
- **Storage**: Browser localStorage
- **Export**: JSZip + FileSaver

### File Structure
```
src/
├── app/
│   ├── takenote/
│   │   └── page.tsx          # Main TakeNote interface
│   └── page.tsx              # Redirect to TakeNote
├── hooks/
│   └── useSampleData.ts      # Sample notes and categories
└── components/               # Reusable components
```

## 📝 Usage Examples

### Creating Linked Notes
```markdown
# My Project Notes

See also: {{JavaScript Cheat Sheet}} and {{Meeting Notes}}

This will create clickable links to other notes.
```

### Code Blocks with Syntax Highlighting
```javascript
// JavaScript example
const greet = (name) => `Hello, ${name}!`;
console.log(greet('World'));
```

```python
# Python example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

### Categories and Organization
- **General**: Default category for miscellaneous notes
- **Development**: Code snippets, technical documentation
- **Meetings**: Meeting notes, action items
- **Personal**: Personal thoughts, ideas

## 🔧 Customization

### Adding New Categories
Categories are stored in localStorage and can be customized through the UI or by modifying the `getSampleCategories()` function in `useSampleData.ts`.

### Extending Language Support
Add new language support by importing additional CodeMirror language packages:

```typescript
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';

// Add to getLanguageExtension function
if (content.includes('```php')) return [php()];
if (content.includes('```rust')) return [rust()];
```

### Custom Themes
The app supports custom themes through Tailwind CSS classes. Modify the theme toggle logic in the main component.

## 📊 Data Management

### Local Storage
- **Notes**: `takenote-notes`
- **Categories**: `takenote-categories`
- **Theme**: `takenote-theme`
- **Initialization**: `takenote-initialized`

### Export Format
Notes are exported as Markdown files in a ZIP archive with metadata:

```markdown
# Note Title

Note content here...

---
Created: 2024-01-01T00:00:00.000Z
Updated: 2024-01-01T00:00:00.000Z
Category: development
Tags: javascript, tutorial
Favorite: true
```

## 🚀 Deployment

The TakeNote interface is a client-side application that can be deployed anywhere Next.js is supported:

1. **Vercel**: `vercel deploy`
2. **Netlify**: Build and deploy static export
3. **Self-hosted**: `npm run build && npm start`

## 🤝 Contributing

This implementation maintains the spirit of the original TakeNote while adding modern enhancements. Key principles:

- **Developer-focused**: No WYSIWYG, plain text editing
- **Privacy-first**: Local storage only, no tracking
- **Keyboard-driven**: Full keyboard navigation
- **Minimalist**: Clean, distraction-free interface

## 📄 License

This project maintains the same MIT license as the original TakeNote project.

## 🙏 Acknowledgments

- **Tania Rascia** - Original TakeNote creator
- **CodeMirror** - Excellent code editor
- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Utility-first CSS framework

---

**Note**: This is a modern reimplementation inspired by the original TakeNote. It maintains all core features while adding contemporary web development practices and enhanced user experience.