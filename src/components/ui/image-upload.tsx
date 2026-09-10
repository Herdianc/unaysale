"use client";

import { useState, useRef, useCallback, ChangeEvent, DragEvent } from "react";
import { ImagePlus, X, Star, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploadProps {
  value?: ImageFile[];
  onChange?: (files: ImageFile[]) => void;
  primaryIndex?: number;
  onPrimaryIndexChange?: (index: number) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
  label?: string;
  error?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ImageUpload({
  value = [],
  onChange,
  primaryIndex = 0,
  onPrimaryIndexChange,
  maxFiles = 5,
  accept = "image/*",
  className,
  label,
  error,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles).filter((f) =>
        f.type.startsWith("image/")
      );
      const remaining = maxFiles - value.length;
      const filesToAdd = fileArray.slice(0, remaining);

      if (filesToAdd.length === 0) return;

      const newImageFiles: ImageFile[] = filesToAdd.map((file) => ({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
      }));

      onChange?.([...value, ...newImageFiles]);
    },
    [value, maxFiles, onChange]
  );

  const removeFile = useCallback(
    (id: string) => {
      const index = value.findIndex((f) => f.id === id);
      const updated = value.filter((f) => f.id !== id);
      onChange?.(updated);

      if (index === primaryIndex && updated.length > 0) {
        onPrimaryIndexChange?.(0);
      } else if (index < primaryIndex) {
        onPrimaryIndexChange?.(primaryIndex - 1);
      }
    },
    [value, primaryIndex, onChange, onPrimaryIndexChange]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-[#222222]">
          {label}
        </label>
      )}

      {value.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
            isDragOver
              ? "border-[#1769AA] bg-[#1769AA]/5"
              : "border-gray-300 hover:border-[#1769AA]/50 hover:bg-gray-50",
            error && "border-red-500"
          )}
        >
          <Upload
            className={cn(
              "mb-2 h-8 w-8",
              isDragOver ? "text-[#1769AA]" : "text-gray-400"
            )}
          />
          <p className="text-sm font-medium text-[#222222]">
            Drop images here or click to upload
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {value.length} / {maxFiles} images
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                index === primaryIndex
                  ? "border-[#F5A623] ring-2 ring-[#F5A623]/30"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {index === primaryIndex && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-[#F5A623] px-2 py-0.5 text-xs font-medium text-white">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 transition-colors group-hover:bg-black/40">
                {index !== primaryIndex && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrimaryIndexChange?.(index);
                    }}
                    className="rounded-full bg-white/90 p-1.5 text-gray-600 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                    title="Set as primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(image.id);
                  }}
                  className="rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export { ImageUpload };
export type { ImageUploadProps, ImageFile };
