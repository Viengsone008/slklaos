// components/DropzoneButton.tsx
"use client";
import React, { PropsWithChildren, useCallback } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";

interface DZProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  accept?: DropzoneOptions['accept'];
  className?: string;
  disabled?: boolean;
  maxSize?: number;
  onError?: (error: string) => void;
}

const DropzoneButton: React.FC<PropsWithChildren<DZProps>> = ({
  children,
  onFiles,
  multiple = false,
  accept,
  className = "",
  disabled = false,
  maxSize,
  onError,
}) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0 && onError) {
      const errors = rejectedFiles.map(file => {
        const error = file.errors[0];
        switch (error.code) {
          case 'file-too-large':
            return `File "${file.file.name}" is too large`;
          case 'file-invalid-type':
            return `File "${file.file.name}" has invalid type`;
          case 'too-many-files':
            return 'Too many files selected';
          default:
            return `Error with file "${file.file.name}": ${error.message}`;
        }
      });
      onError(errors.join(', '));
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      onFiles(acceptedFiles);
    }
  }, [onFiles, onError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple,
    accept,
    onDrop,
    disabled,
    maxSize,
    noClick: disabled,
    noKeyboard: disabled,
  });

  const getClassName = () => {
    let baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 border";
    
    if (disabled) {
      return `${baseClasses} bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed ${className}`;
    }
    
    if (isDragReject) {
      return `${baseClasses} bg-red-100 border-red-400 text-red-700 cursor-pointer ${className}`;
    }
    
    if (isDragActive) {
      return `${baseClasses} bg-blue-100 border-blue-400 text-blue-700 cursor-pointer ${className}`;
    }
    
    return `${baseClasses} bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400 text-blue-700 cursor-pointer ${className}`;
  };

  return (
    <div
      {...getRootProps()}
      className={getClassName()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={multiple ? "Upload multiple files" : "Upload file"}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

export default DropzoneButton;
