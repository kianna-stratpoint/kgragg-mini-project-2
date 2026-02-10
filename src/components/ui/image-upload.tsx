"use client";

import { X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  previewUrl: string;
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  previewUrl,
  onFileSelect,
  onClear,
  disabled,
}: ImageUploadProps) => {
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (previewUrl) {
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden border">
        <Image
          fill
          src={previewUrl}
          alt="Upload preview"
          className="object-cover"
        />
        <Button
          onClick={onClear}
          variant="destructive"
          size="icon"
          type="button"
          className="absolute top-2 right-2 z-10"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-md hover:bg-slate-100 transition-colors relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
      />
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <UploadCloud className="h-10 w-10 text-gray-400 mb-4" />
        <p className="text-sm font-semibold text-gray-700">
          Click or drag image to upload
        </p>
        <p className="text-xs text-gray-500 mt-1">
          SVG, PNG, JPG or GIF (max. 4MB)
        </p>
      </div>
    </div>
  );
};
