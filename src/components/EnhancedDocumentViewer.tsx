'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { documentAPI, Document } from '@/lib/api';
import {
  File,
  FileText,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Eye,
  X,
  Image as ImageIcon,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  MoreHorizontal,
  Calendar,
  Clock,
  Tag,
  Info
} from 'lucide-react';

interface EnhancedDocumentViewerProps {
  visitorId: string;
  onDocumentDeleted?: () => void;
}

export default function EnhancedDocumentViewer({ visitorId, onDocumentDeleted }: EnhancedDocumentViewerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, [visitorId, token]);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...documents];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.fileName.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'type':
          comparison = a.documentType.localeCompare(b.documentType);
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, filterType, sortBy, sortDirection]);

  const fetchDocuments = async () => {
    if (!token || !visitorId) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const docs = await documentAPI.getVisitorDocuments(visitorId, token);
      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!token) return;

    setDeletingId(documentId);
    setError(null);
    setSuccessMessage(null);

    try {
      await documentAPI.deleteDocument(documentId, token);
      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
      setSuccessMessage('Document deleted successfully');

      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'id':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'nda':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'training':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-5 w-5 text-purple-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-5 w-5 text-pink-600" />;
      case 'mp3':
      case 'wav':
        return <FileAudio className="h-5 w-5 text-yellow-600" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="h-5 w-5 text-gray-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (newSortBy: 'date' | 'name' | 'type' | 'size') => {
    if (sortBy === newSortBy) {
      toggleSortDirection();
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  const isPreviewable = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
    return previewableExtensions.includes(extension);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                {getFileTypeIcon(previewDocument.fileName)}
                <span className="ml-2">{previewDocument.fileName}</span>
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto min-h-0 bg-gray-100 rounded-lg p-4">
              {isPreviewable(previewDocument.fileName) ? (
                <iframe
                  src={`${process.env.NEXT_PUBLIC_API_URL}/documents/${previewDocument._id}?token=${token}`}
                  className="w-full h-full min-h-[500px] border-0 rounded"
                  title={previewDocument.fileName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px]">
                  <div className="bg-gray-200 p-8 rounded-lg mb-4">
                    {getFileTypeIcon(previewDocument.fileName)}
                  </div>
                  <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${previewDocument._id}?token=${token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download to View
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Uploaded
                  </p>
                  <p className="font-medium">{formatDate(previewDocument.uploadedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Type
                  </p>
                  <p className="font-medium capitalize">{previewDocument.documentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Size
                  </p>
                  <p className="font-medium">{formatFileSize(previewDocument.fileSize)}</p>
                </div>
              </div>
              {previewDocument.description && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{previewDocument.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            Documents
          </h2>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="id">Identification</option>
                <option value="nda">NDA</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
            <div>
              <p className="font-medium text-green-800">Success</p>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
          <p className="text-gray-500">
            {documents.length === 0
              ? 'No documents have been uploaded for this visitor yet.'
              : 'No documents match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('name')}
                >
                  <div className="flex items-center">
                    Document
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortBy === 'type' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('size')}
                >
                  <div className="flex items-center">
                    Size
                    {sortBy === 'size' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('date')}
                >
                  <div className="flex items-center">
                    Uploaded
                    {sortBy === 'date' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileTypeIcon(doc.fileName)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                        <div className="text-sm text-gray-500">
                          {doc.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.uploadedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                        onClick={() => handlePreviewDocument(doc)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc._id}?token=${token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                      <button
                        className="text-red-600 hover:text-red-900 disabled:text-red-300"
                        title="Delete"
                        onClick={() => handleDeleteDocument(doc._id)}
                        disabled={deletingId === doc._id}
                      >
                        {deletingId === doc._id ? (
                          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-red-600 rounded-full"></div>
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
