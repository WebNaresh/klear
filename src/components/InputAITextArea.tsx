"use client";

import { Button } from "../../../components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form";
import { Textarea } from "../../../components/textarea";
import { cn } from "../../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { UIInputFieldProps } from "../InputField";

interface InputAITextAreaProps
  extends Omit<UIInputFieldProps, "form" | "type"> {
  generationPrompt?: string;
  context?: string;
  maxLength?: number;
  aiButtonText?: string;
}

const InputAITextArea = (props: InputAITextAreaProps) => {
  const {
    label,
    name,
    placeholder,
    className,
    disabled,
    Icon,
    iconClassName,
    description,
    required,
    generationPrompt = "Generate professional content for this field",
    context = "",
    maxLength = 1000,
    aiButtonText = "Generate with AI",
  } = props;

  const form = useFormContext();
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  if (!form) {
    throw new Error("InputAITextArea must be used within a FormProvider");
  }

  // Use useQuery for AI generation instead of manual state management
  const {
    data: aiResponse,
    isLoading: isGenerating,
    error,
  } = useQuery({
    queryKey: [
      "ai-generate",
      generationPrompt,
      context,
      maxLength,
      shouldGenerate,
    ],
    queryFn: async () => {
      const response = await fetch("/api/ai/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: generationPrompt,
          context: context,
          maxLength: maxLength,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      return response.json();
    },
    enabled: shouldGenerate,
    retry: 1,
    staleTime: 0, // Always fresh
  });

  // Handle successful generation and errors with useEffect
  useEffect(() => {
    if (aiResponse && !isGenerating && shouldGenerate) {
      if (aiResponse.text && aiResponse.text !== generatedText) {
        setGeneratedText(aiResponse.text);
        toast.success("Content generated successfully!");
      }
      setShouldGenerate(false);
    }
  }, [aiResponse, isGenerating, shouldGenerate, generatedText]);

  useEffect(() => {
    if (error && shouldGenerate) {
      toast.error("Failed to generate content. Please try again.");
      setShouldGenerate(false);
    }
  }, [error, shouldGenerate]);

  const generateAIContent = () => {
    setShouldGenerate(true);
  };

  const applyGeneratedText = () => {
    if (generatedText) {
      form.setValue(name, generatedText);
      setGeneratedText("");
      toast.success("Content applied!");
    }
  };

  const copyToClipboard = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText);
      toast.success("Copied to clipboard!");
    }
  };

  const regenerateContent = () => {
    setGeneratedText("");
    generateAIContent();
  };

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => {
        return (
          <FormItem
            className={cn(
              "w-full max-w-[600px]",
              "group transition-all duration-300 ease-in-out",
              className
            )}
          >
            <FormLabel
              className={cn(
                "text-sm font-medium transition-colors",
                "group-hover:text-primary",
                required &&
                  "after:content-['*'] after:ml-0.5 after:text-red-500"
              )}
            >
              {label}
            </FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="relative w-full group/textarea">
                  {Icon && (
                    <Icon
                      size={10}
                      className={cn(
                        "absolute z-10 left-3 top-3 h-4 w-4",
                        "text-muted-foreground transition-colors duration-200",
                        "group-hover:text-primary",
                        iconClassName
                      )}
                    />
                  )}

                  {/* AI Generation Button - Top Right */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateAIContent}
                    disabled={isGenerating || disabled}
                    className={cn(
                      "absolute top-2 right-2 z-20 h-8 w-8 p-0",
                      "bg-background/90 backdrop-blur-sm",
                      "border border-border/50",
                      "hover:bg-primary/10 hover:border-primary/60 hover:shadow-md",
                      "transition-all duration-300 ease-out",
                      "shadow-sm hover:shadow-primary/20",
                      "group/ai-btn",
                      isGenerating && "scale-105"
                    )}
                    title="Generate with AI"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-primary transition-transform group-hover/ai-btn:scale-110" />
                    )}
                  </Button>

                  <Textarea
                    className={cn(
                      "w-full min-h-[120px] pr-12",
                      "transition-all duration-200",
                      "border-2 focus:border-primary",
                      "hover:border-primary/50",
                      "rounded-md shadow-sm",
                      "placeholder:text-muted-foreground/50",
                      "focus:ring-2 focus:ring-primary/20",
                      "resize-none",
                      "focus:shadow-lg focus:shadow-primary/10",
                      "pl-10 pt-3 pb-3"
                    )}
                    placeholder={placeholder}
                    {...field}
                  />
                </div>

                {/* Generated Content Preview */}
                {generatedText && (
                  <div className="relative border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="flex items-center justify-between p-3 bg-primary/5 border-b border-primary/20">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-primary">
                          AI Generated Content
                        </h4>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="h-7 w-7 p-0 hover:bg-primary/10"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={regenerateContent}
                          disabled={isGenerating}
                          className="h-7 w-7 p-0 hover:bg-primary/10"
                          title="Regenerate content"
                        >
                          <RefreshCw
                            className={cn(
                              "h-3 w-3",
                              isGenerating && "animate-spin"
                            )}
                          />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-md border border-primary/10 text-sm leading-relaxed">
                        {generatedText}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setGeneratedText("")}
                          className="text-xs"
                        >
                          Dismiss
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={applyGeneratedText}
                          className="text-xs bg-primary hover:bg-primary/90"
                        >
                          Apply Content
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            <FormMessage className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50" />
          </FormItem>
        );
      }}
    />
  );
};

export default InputAITextArea;
