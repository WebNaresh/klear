"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/avatar";
import { Button } from "../../../components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form";
import { Badge } from "../../../components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/dialog";
import { cn } from "../../../lib/utils";
import React, { useState, useCallback, useEffect } from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import {
  BiImage,
  BiX,
  BiCloudUpload,
  BiTrash,
  BiExpand,
  BiPlus,
  BiImageAlt,
  BiError,
} from "react-icons/bi";
import { BaseInputProps } from "../InputField";

interface MultiImageInputProps<T extends FieldValues>
  extends Omit<BaseInputProps<T>, "form"> {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  showPreview?: boolean;
}

const MultiImageInput = <T extends FieldValues>({
  label,
  name,
  required = false,
  description,
  maxFiles = 10,
  maxFileSize = 20,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  showPreview = true,
}: MultiImageInputProps<T>) => {
  const imageRef = React.useRef<HTMLInputElement>(null);
  const form = useFormContext<T>();
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  if (!form)
    throw new Error("MultiImageInput must be used within a FormProvider");

  // ✅ File validation
  const validateFiles = useCallback(
    (files: FileList) => {
      const validFiles: File[] = [];
      const newErrors: string[] = [];

      Array.from(files).forEach((file) => {
        if (!acceptedTypes.includes(file.type)) {
          newErrors.push(
            `${file.name}: Invalid file type. Accepted: ${acceptedTypes.join(
              ", "
            )}`
          );
          return;
        }
        if (file.size > maxFileSize * 1024 * 1024) {
          newErrors.push(`${file.name}: File too large. Max: ${maxFileSize}MB`);
          return;
        }
        validFiles.push(file);
      });

      return { validFiles, errors: newErrors };
    },
    [acceptedTypes, maxFileSize]
  );

  // ✅ Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // ✅ Drop handler
  const handleDrop = useCallback(
    (e: React.DragEvent, field: any) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = e.dataTransfer.files;
      if (!droppedFiles?.length) return;

      const { validFiles, errors: validationErrors } =
        validateFiles(droppedFiles);
      setErrors(validationErrors);

      const currentFiles = Array.isArray(field.value) ? field.value : [];
      const totalFiles = currentFiles.length + validFiles.length;

      if (totalFiles > maxFiles) {
        setErrors((prev) => [...prev, `Maximum ${maxFiles} files allowed`]);
        return;
      }

      field.onChange([...currentFiles, ...validFiles]);
    },
    [validateFiles, maxFiles]
  );

  // ✅ File input change handler
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        const { validFiles, errors: validationErrors } =
          validateFiles(selectedFiles);
        setErrors(validationErrors);

        const currentFiles = Array.isArray(field.value) ? field.value : [];
        const totalFiles = currentFiles.length + validFiles.length;

        if (totalFiles > maxFiles) {
          setErrors((prev) => [...prev, `Maximum ${maxFiles} files allowed`]);
          return;
        }

        field.onChange([...currentFiles, ...validFiles]);
      }
      e.target.value = "";
    },
    [validateFiles, maxFiles]
  );

  // ✅ Remove a file
  const removeFile = useCallback((index: number, field: any) => {
    const currentFiles = Array.isArray(field.value) ? field.value : [];
    const updatedFiles = currentFiles.filter(
      (_: any, i: number) => i !== index
    );
    field.onChange(updatedFiles);
    setErrors([]);
  }, []);

  // ✅ Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const files = Array.isArray(field.value) ? field.value : [];
        const fileCount = files.length;

        // ✅ Clean up object URLs on unmount
        useEffect(() => {
          return () => {
            files.forEach((f: any) => {
              if (f instanceof File) {
                const url = URL.createObjectURL(f);
                URL.revokeObjectURL(url);
              }
            });
          };
        }, [files]);

        return (
          <FormItem className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <FormLabel
                className={cn(
                  "text-sm font-medium flex items-center gap-2",
                  "transition-colors duration-200",
                  required &&
                    "after:content-['*'] after:ml-0.5 after:text-red-500"
                )}
              >
                <BiImageAlt className="h-4 w-4" />
                {label}
              </FormLabel>
              {fileCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {fileCount}/{maxFiles} files
                </Badge>
              )}
            </div>

            <FormControl>
              <div className="space-y-4">
                {/* Upload Area */}
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-xl",
                    "p-8 text-center cursor-pointer",
                    "transition-all duration-300 ease-in-out",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "focus-within:ring-2 focus-within:ring-primary/20",
                    isDragOver && "border-primary bg-primary/10 scale-[1.02]",
                    errors.length > 0 &&
                      "border-destructive/50 bg-destructive/5"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, field)}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={cn(
                        "p-4 rounded-full bg-primary/10 text-primary",
                        "transition-all duration-300",
                        isDragOver && "scale-110 bg-primary/20"
                      )}
                    >
                      <BiCloudUpload className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        {isDragOver ? "Drop your images here" : "Upload Images"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Drag & drop images here, or{" "}
                        <span className="text-primary font-medium underline">
                          click to browse
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports: JPG, PNG, WebP • Max {maxFileSize}MB each • Up
                        to {maxFiles} files
                      </p>
                    </div>
                  </div>
                  <input
                    ref={imageRef}
                    onChange={(e) => handleFileSelect(e, field)}
                    type="file"
                    accept={acceptedTypes.join(",")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    multiple
                  />
                </div>

                {/* ✅ Selected Images Grid */}
                {fileCount > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <BiImage className="h-4 w-4" />
                        Selected Images ({fileCount})
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange([])}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <BiTrash className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </div>

                    <div
                      className={cn(
                        "grid gap-4",
                        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                      )}
                    >
                      {files.map((file: any, index: number) => {
                        if (
                          !(file instanceof File) &&
                          typeof file !== "string" &&
                          !file?.url
                        )
                          return null;

                        const imageUrl =
                          file instanceof File
                            ? URL.createObjectURL(file)
                            : typeof file === "string"
                            ? file
                            : file.url;

                        const fileName = file?.name || `Image-${index}`;
                        const fileSize = file?.size || 0;

                        return (
                          <div
                            key={`${fileName}-${index}`}
                            className={cn(
                              "group relative bg-card rounded-lg border overflow-hidden",
                              "transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                            )}
                          >
                            <div className="aspect-square relative">
                              <Avatar className="w-full h-full rounded-lg">
                                <AvatarImage
                                  src={imageUrl}
                                  alt={fileName}
                                  className="object-cover"
                                />
                                <AvatarFallback className="rounded-lg">
                                  <BiImage className="h-8 w-8 text-muted-foreground" />
                                </AvatarFallback>
                              </Avatar>

                              {/* Overlay Controls */}
                              <div
                                className={cn(
                                  "absolute inset-0 bg-black/50 opacity-0",
                                  "group-hover:opacity-100 transition-opacity duration-200",
                                  "flex items-center justify-center gap-2"
                                )}
                              >
                                {showPreview && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewImage({
                                        url: imageUrl,
                                        name: fileName,
                                      });
                                    }}
                                  >
                                    <BiExpand className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index, field);
                                  }}
                                >
                                  <BiX className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="p-2 space-y-1">
                              <p
                                className="text-xs font-medium truncate"
                                title={fileName}
                              >
                                {fileName}
                              </p>
                              {fileSize > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(fileSize)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add More Button */}
                      {fileCount < maxFiles && (
                        <button
                          type="button"
                          onClick={() => imageRef.current?.click()}
                          className={cn(
                            "group aspect-square border-2 border-dashed rounded-lg",
                            "flex flex-col items-center justify-center gap-2",
                            "text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5",
                            "transition-all duration-200"
                          )}
                        >
                          <BiPlus className="h-8 w-8" />
                          <span className="text-xs font-medium">Add More</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="space-y-2">
                    {errors.map((error, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                      >
                        <BiError className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-destructive">{error}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>

            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            <FormMessage className="text-xs font-medium text-destructive animate-in fade-in-50" />

            {/* Image Preview Dialog */}
            <Dialog
              open={!!previewImage}
              onOpenChange={(open) => !open && setPreviewImage(null)}
            >
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-2">
                  <DialogTitle className="flex items-center gap-2">
                    <BiImage className="h-5 w-5" />
                    Image Preview
                  </DialogTitle>
                  <DialogDescription>{previewImage?.name}</DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-6">
                  <div className="relative bg-muted rounded-lg overflow-hidden">
                    {previewImage && (
                      <img
                        src={previewImage.url}
                        alt={previewImage.name}
                        className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                      />
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Click outside or press ESC to close</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewImage(null)}
                      className="ml-auto"
                    >
                      <BiX className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </FormItem>
        );
      }}
    />
  );
};

export default React.memo(MultiImageInput) as <T extends FieldValues>(
  props: MultiImageInputProps<T>
) => React.ReactNode;
