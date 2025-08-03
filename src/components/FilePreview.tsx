// components/FilePreview.tsx
"use client";
import React, { useState, useEffect } from "react";
import { X, FileText, Image, File } from "lucide-react";

interface PreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<PreviewProps> = ({ file, onRemove }) => {
  const [objectUrl, setObjectUrl] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Create and cleanup object URL
  useEffect(() => {
    if (isClient && file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);

      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, isClient]);

  // Don't render on server side
  if (!isClient) {
    return (
      <div className="relative flex flex-col items-start mr-3 mt-2">
        <div className="h-16 w-16 flex items-center justify-center rounded bg-gray-100 shadow animate-pulse">
          <File className="w-6 h-6 text-gray-400" />
        </div>
        <span className="mt-1 text-xs text-gray-700 truncate max-w-[64px]">
          Loading...
        </span>
      </div>
    );
  }

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const isDocument = file.type.includes("document") || file.type.includes("text");

  // Get file extension for display
  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  // Get appropriate icon based on file type
  const getFileIcon = () => {
    if (isImage) return <Image className="w-6 h-6 text-blue-500" />;
    if (isPDF) return <FileText className="w-6 h-6 text-red-500" />;
    if (isDocument) return <FileText className="w-6 h-6 text-green-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Truncate filename if too long
  const truncateFileName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - 3 - (extension?.length || 0));
    return `${truncated}...${extension ? `.${extension}` : ''}`;
  };

  return (
    <div className="relative flex flex-col items-start mr-3 mt-2 group">
      {/* Thumbnail or icon */}
      <div className="relative">
        {isImage && objectUrl ? (
          <img
            src={objectUrl}
            alt={file.name}
            className="h-16 w-16 object-cover rounded shadow border border-gray-200 group-hover:shadow-md transition-shadow"
            onError={() => {
              // Fallback if image fails to load
              console.warn('Failed to load image preview for:', file.name);
            }}
          />
        ) : (
          <div className="h-16 w-16 flex flex-col items-center justify-center rounded bg-gray-100 shadow border border-gray-200 group-hover:shadow-md transition-shadow">
            {getFileIcon()}
            <span className="text-xs text-gray-500 font-medium mt-1">
              {getFileExtension(file.name)}
            </span>
          </div>
        )}
        
        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 rounded-full bg-white text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm border border-gray-200 p-1 transition-colors opacity-0 group-hover:opacity-100"
          aria-label={`Remove ${file.name}`}
        >
          <X size={12} />
        </button>
      </div>

      {/* File info */}
      <div className="mt-1 flex flex-col items-center w-16">
        <span
          title={file.name}
          className="text-xs text-gray-700 text-center leading-tight break-words w-full"
        >
          {truncateFileName(file.name)}
        </span>
        <span className="text-xs text-gray-500 mt-0.5">
          {formatFileSize(file.size)}
        </span>
      </div>
    </div>
  );
};

export default FilePreview;
