"use client";

import type React from "react";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, File } from "lucide-react";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  error?: string;
}

export function FileDropzone({
  onFilesSelected,
  accept = "image/*",
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  className,
  error,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of fileArray) {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          setFileError(`File "${file.name}" exceeds ${maxSize}MB limit`);
          continue;
        }

        // Check max files
        if (files.length + validFiles.length >= maxFiles) {
          setFileError(`Maximum ${maxFiles} files allowed`);
          break;
        }

        validFiles.push(file);

        // Generate preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviews((prev) => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }

      if (validFiles.length > 0) {
        setFileError(null);
        const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
      }
    },
    [files, maxFiles, maxSize, multiple, onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesSelected(newFiles);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
          "bg-black/50 hover:bg-secondary/10",
          isDragging && "border-primary bg-primary/5",
          error || fileError ? "border-red-500" : "border-secondary hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />

        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors",
            isDragging ? "bg-primary/20" : "bg-secondary/20"
          )}
        >
          <Upload className={cn("h-8 w-8 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
        </div>

        <p className="text-foreground font-medium mb-1">
          {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
        </p>
        <p className="text-sm text-muted-foreground">
          {accept === "image/*" ? "PNG, JPG, GIF" : accept} up to {maxSize}MB
        </p>
        {multiple && <p className="text-xs text-muted-foreground mt-1">Maximum {maxFiles} files</p>}
      </div>

      {/* Error Message */}
      {(error || fileError) && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error || fileError}
        </p>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-secondary bg-black">
              {file.type.startsWith("image/") && previews[index] ? (
                <img src={previews[index] || "/placeholder.svg"} alt={file.name} className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-secondary/10">
                  <File className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <p className="absolute bottom-0 left-0 right-0 bg-black/80 text-xs text-foreground p-2 truncate">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
