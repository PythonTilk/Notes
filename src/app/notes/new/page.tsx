
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function NewNote() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('TEXT'); // Default to TEXT
  const [published, setPublished] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // State to hold selected image files
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // State to hold image previews (base64)
  const [tags, setTags] = useState(''); // Comma-separated tags
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);

      const previews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          previews.push(event.target?.result as string);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, type, published, imageUrls: imagePreviews, tags: tagsArray }),
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Create a New Note</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Note Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="TEXT">Text Note</option>
              <option value="RICH_TEXT">Rich Text Note</option>
              <option value="CODE">Code Note</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            {type === 'RICH_TEXT' ? (
              <RichTextEditor content={content} onContentChange={setContent} />
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="images">Images</label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="uploaded-files">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="uploaded-file">
                  <img src={preview} alt={`Image ${index}`} />
                  {/* Add remove button later */}
                </div>
              ))}
            </div>
          </div>
          <div className="form-group flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="published">Publish Note (Public)</label>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Create Note
          </button>
        </form>
      </div>
    </div>
  );
}
