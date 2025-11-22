import { cn } from "../../../lib/utils";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

interface ModernImageInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

const ModernImageInput = <T extends FieldValues>({
  name,
  label,
  description,
  required = false,
  className,
}: ModernImageInputProps<T>) => {
  const form = useFormContext<T>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!form)
    throw new Error("ModernImageInput must be used within a FormProvider");

  // Get form errors
  const formError = form.formState.errors[name]?.message as string | undefined;

  // Show default image if present
  useEffect(() => {
    const value = form.getValues(name);
    if (typeof value === "string" && value) {
      setImagePreview(value);
    } else if ((value as any) instanceof File) {
      setImagePreview(URL.createObjectURL(value as File));
    } else {
      setImagePreview(null);
    }
    // Listen for changes to the field value
    const subscription = form.watch(() => {
      const v = form.getValues(name);
      if (typeof v === "string" && v) {
        setImagePreview(v);
      } else if ((v as any) instanceof File) {
        setImagePreview(URL.createObjectURL(v as File));
      } else {
        setImagePreview(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, name]);

  // Validate image file
  const validateImageFile = async (file: File): Promise<boolean> => {
    // Check if file exists
    if (!file) {
      if (required) {
        setError("No file selected");
        toast.error("Please select a file to upload");
        return false;
      }
      return true;
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      toast.error(
        "Invalid file type. Only image files (JPEG, PNG, GIF, WEBP, SVG) are allowed."
      );
      return false;
    }

    // Check for specific image types
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported image format");
      toast.error(
        "Unsupported image format. Please use JPEG, PNG, GIF, WEBP, or SVG."
      );
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit");
      toast.error("File is too large. Maximum size is 5MB.");
      return false;
    }

    // Check minimum file size (to prevent empty or corrupted files)
    const minSize = 100; // 100 bytes
    if (file.size < minSize) {
      setError("File is too small or corrupted");
      toast.error("File appears to be corrupted or empty.");
      return false;
    }

    // Validate image dimensions (for non-SVG files)
    if (file.type !== "image/svg+xml") {
      try {
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.onerror = () => {
              reject(new Error("Failed to load image"));
            };
            img.src = URL.createObjectURL(file);
          }
        );

        // Check minimum dimensions
        if (dimensions.width < 10 || dimensions.height < 10) {
          setError("Image dimensions too small");
          toast.error(
            "Image dimensions are too small. Minimum size is 10x10 pixels."
          );
          return false;
        }
        // Check maximum dimensions
      } catch (error) {
        setError("Invalid image file");
        toast.error("The file appears to be corrupted or invalid.");
        return false;
      }
    }

    setError(null);
    return true;
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = await validateImageFile(file);
      if (isValid) {
        form.setValue(name, file as any);
        setImagePreview(URL.createObjectURL(file));
      } else {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (required) {
        setError("No file selected");
        toast.error("Please select a file to upload");
      } else {
        setError(null);
      }
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isValid = await validateImageFile(file);
      if (isValid) {
        form.setValue(name, file as any);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  // Handle paste
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      const isValid = await validateImageFile(file);
      if (isValid) {
        form.setValue(name, file as any);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Remove/clear image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    form.setValue(name, null as any);
    if (required) {
      setError("No file selected");
      toast.error("Please select a file to upload");
    } else {
      setError(null);
    }
  };

  return (
    <div className={cn("w-full flex flex-col items-center mb-6", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-3 w-full text-left">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={cn(
          "relative w-full max-w-sm h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 cursor-pointer group overflow-hidden",
          isDragActive && "border-blue-500 bg-blue-50",
          (error || formError) && "border-red-400 bg-red-50/50",
          imagePreview && "border-solid border-gray-200 bg-white shadow-sm"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        tabIndex={0}
        role="button"
        aria-label={label || "Upload image"}
      >
        {imagePreview ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              width={300}
              height={200}
              src={
                typeof imagePreview === "string" &&
                !imagePreview.startsWith("blob:")
                  ? `${imagePreview}?t=${Date.now()}`
                  : imagePreview
              }
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              type="button"
              aria-label="Remove image"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 z-10"
              onClick={handleRemoveImage}
              tabIndex={0}
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700">
                Click to change
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <ImagePlus className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Drag & Drop or Click to Upload
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PNG, JPG or SVG (max. 5MB)
            </p>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Choose File
            </button>
          </div>
        )}

        {description && (
          <p className="absolute bottom-2 left-2 right-2 text-xs text-gray-500 text-center bg-white/80 rounded px-2 py-1">
            {description}
          </p>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-2xl pointer-events-none z-20 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Drop image here
            </div>
          </div>
        )}
      </div>

      {(error || formError) && (
        <p className="text-sm text-red-500 mt-2 text-center font-medium">
          {error || formError}
        </p>
      )}
    </div>
  );
};

export default ModernImageInput;
