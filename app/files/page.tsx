'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Search,
  Filter,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  author: {
    id: string;
    username: string;
    name: string;
    image?: string;
  };
  workspace?: {
    id: string;
    name: string;
  };
}

export default function FilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'other'>('all');

  // Load files
  const loadFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`/api/files?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        toast.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType]);

  // Load files on mount and when filters change
  useEffect(() => {
    if (session) {
      loadFiles();
    }
  }, [session, loadFiles]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    Array.from(selectedFiles).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(prev => [...data.files, ...prev]);
        toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // Handle file deletion
  const handleFileDelete = useCallback(async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        toast.success('File deleted');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }, []);

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-green-500" />;
    } else if (mimeType.includes('text') || mimeType.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter files based on search and type
  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchQuery || 
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.author.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || 
      (filterType === 'images' && file.mimeType.startsWith('image/')) ||
      (filterType === 'documents' && (file.mimeType.includes('text') || file.mimeType.includes('document'))) ||
      (filterType === 'other' && !file.mimeType.startsWith('image/') && !file.mimeType.includes('text') && !file.mimeType.includes('document'));

    return matchesSearch && matchesType;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <File className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Files</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
                <option value="other">Other</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload your first file to get started.'
              }
            </p>
            {!searchQuery && filterType === 'all' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Upload Files
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      {getFileIcon(file.mimeType)}
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate mb-2" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{formatFileSize(file.size)}</p>
                      <p>by {file.author.username}</p>
                      <p>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</p>
                      {file.workspace && (
                        <p className="text-blue-600">in {file.workspace.name}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <a
                        href={`/api/files/${file.id}/download`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                      {session?.user?.id === file.author.id && (
                        <button
                          onClick={() => handleFileDelete(file.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4 flex-1">
                      {getFileIcon(file.mimeType)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate" title={file.originalName}>
                          {file.originalName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>by {file.author.username}</span>
                          <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                          {file.workspace && (
                            <span className="text-blue-600">in {file.workspace.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/api/files/${file.id}/download`}
                        className="p-2 text-blue-600 hover:text-blue-700 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {session?.user?.id === file.author.id && (
                        <button
                          onClick={() => handleFileDelete(file.id)}
                          className="p-2 text-red-600 hover:text-red-700 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}