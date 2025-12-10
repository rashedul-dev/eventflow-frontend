"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { ImageIcon, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    // Simulate upload - in production, upload to your backend/storage
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const url = URL.createObjectURL(file);
    onChange(url);
    setIsUploading(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  if (value) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden group", className)}>
        {/* Dark preview area with image */}
        <div className="relative aspect-video bg-background border border-foreground/10 rounded-lg overflow-hidden">
          <img src={value || "/placeholder.svg"} alt="Event preview" className="w-full h-full object-cover" />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="border-foreground/20 hover:bg-foreground/10"
            >
              <Upload className="h-4 w-4 mr-2" />
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
        <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-foreground/20 hover:border-primary/50 hover:bg-foreground/5",
        className
      )}
    >
      <label htmlFor="image-upload-input" className="block cursor-pointer">
        <div className="aspect-video flex flex-col items-center justify-center p-6 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-sm text-foreground/60">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-secondary/50 mb-4">
                <ImageIcon className="h-8 w-8 text-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Drop your image here, or click to browse</p>
              <p className="text-xs text-foreground/50">PNG, JPG up to 10MB. Recommended 1920x1080</p>
            </>
          )}
        </div>
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
