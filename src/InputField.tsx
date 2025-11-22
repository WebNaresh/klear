"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./shadcn/dropdown-menu";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./shadcn/form";
import { Input } from "./shadcn/input";
import { cn } from "./lib/utils";
import {
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  Clock,
  FileText,
  Hash,
  Image,
  Lock,
  LucideIcon,
  Mail,
  MapPin,
  Palette,
  Phone,
  Star,
  Type,
} from "lucide-react";
import React from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import { IconType } from "react-icons";
import InputAddress from "./components/InputAddress/input";
import InputAITextArea from "./components/InputAITextArea";
import InputCheckbox from "./components/InputCheckBox";
import InputDate from "./components/InputDate";
import ImageInput from "./components/InputImage/InputImage";
import InputMultiCheckbox from "./components/InputMultiCheckbox";
import InputMultipleDates from "./components/InputMultipleDates";
import InputMultiSelect from "./components/InputMultiSelect";
import InputBadges from "./components/InputBadges";
import InputNumber from "./components/InputNumber";
import InputOTPController from "./components/InputOTP";
import InputPassword from "./components/InputPassword";
import InputPhone from "./components/InputPhone";
import InputRadio from "./components/InputRadio";
import InputRating from "./components/InputRating";
import InputSelect from "./components/InputSelect";
import InputSwitch from "./components/InputSwitch";
import InputTextArea from "./components/InputTextArea";
import ModernImageInput from "./components/ModernImageInput";
import MultiImageInput from "./components/multiImageInput";
import dynamic from "next/dynamic";
import { Skeleton } from "./shadcn/skeleton";
const DynamicInputEditorV2 = dynamic(() => import("./components/InputEditor"), {
  ssr: false,
  loading: () => {
    return <Skeleton className="h-40 w-full rounded-md" />;
  },
});

// Base type for form values
type DefaultFormValues = Record<string, unknown>;

// Function to get default icon for each input type
const getDefaultIcon = (type: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    text: Type,
    email: Mail,
    password: Lock,
    number: Hash,
    file: FileText,
    select: ChevronDown,
    multiSelect: ChevronDown,
    badges: CheckSquare,
    multiCheckbox: CheckSquare,
    "text-area": FileText,
    "ai-text-area": FileText,
    editor: FileText,
    date: Calendar,
    "multiple-dates": Calendar,
    "datetime-local": Clock,
    checkbox: CheckSquare,
    radio: CheckSquare,
    yes_no_radio: CheckSquare,
    phone: Phone,
    places_autocomplete: MapPin,
    rating: Star,
    avatar: Image,
    "modern-image": Image,
    multiSelect_images: Image,
    "color-picker": Palette,
    switch: CheckSquare,
    OTP: Hash,
  };

  return iconMap[type] || Type;
};

export interface BaseInputProps<T extends FieldValues = DefaultFormValues> {
  label?: string;
  name: Path<T>;
  placeholder?: string;
  description?: string;
  type:
    | "text"
    | "password"
    | "email"
    | "OTP"
    | "avatar"
    | "number"
    | "file"
    | "select"
    | "multiSelect"
    | "badges"
    | "multiCheckbox"
    | "multiSelect_images"
    | "rating"
    | "places_autocomplete"
    | "text-area"
    | "ai-text-area"
    | "editor"
    | "date"
    | "multiple-dates"
    | "datetime-local"
    | "checkbox"
    | "radio"
    | "yes_no_radio"
    | "switch"
    | "phone"
    | "modern-image"
    | "color-picker";
  className?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  onComplete?: (data: any) => void;
}

export interface UIInputFieldProps<T extends FieldValues = DefaultFormValues>
  extends BaseInputProps<T> {
  options?: {
    value: string | null;
    label: string;
  }[];
  async_function?: (
    input: string
  ) => Promise<{ value: string; label: string }[]>;
  Icon: LucideIcon | IconType;
  iconClassName?: string;
  is_sorted?: true | false;
  isSearchable?: boolean;
  // AI-specific props
  generationPrompt?: string;
  context?: string;
  maxLength?: number;
  aiButtonText?: string;
  // Location-specific props
  detectLocation?: boolean;
  autoDetectLocation?: boolean;
  // Number input props
  min?: number;
  max?: number;
  step?: number;
}

const UIInputField = <T extends FieldValues>({
  label,
  name,
  placeholder,
  type,
  className,
  disabled = false,
  autoComplete = "off",
  Icon,
  iconClassName,
  required = false,
  options,
  description,
  isSearchable,
  is_sorted = false,
  onComplete,
  generationPrompt,
  context,
  maxLength,
  aiButtonText,
  detectLocation = false,
  autoDetectLocation = false,
  min,
  max,
  step,
}: UIInputFieldProps<T>) => {
  const form = useFormContext<T>();

  if (!form) {
    throw new Error("UIInputField must be used within a FormProvider");
  }

  // Use provided icon or get default icon for the input type
  const ComponentIcon = Icon || getDefaultIcon(type);

  if (type === "OTP") {
    return (
      <InputOTPController
        label={label}
        name={name}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        onComplete={onComplete}
        placeholder={placeholder}
      />
    );
  }

  if (type === "modern-image") {
    return (
      <ModernImageInput
        label={label}
        name={name}
        className={className}
        required={required}
        description={description}
      />
    );
  }

  if (type === "avatar") {
    return (
      <ImageInput
        label={label}
        name={name}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        placeholder={placeholder}
      />
    );
  }

  if (type === "select" && options) {
    return (
      <InputSelect
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        Icon={ComponentIcon}
        options={options}
        required={required}
        type={type}
        description={description}
        isSearchable={isSearchable}
        is_sorted={is_sorted}
      />
    );
  }

  if (type === "multiSelect" && options) {
    return (
      <InputMultiSelect
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        Icon={ComponentIcon}
        options={options}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "badges" && options) {
    return (
      <InputBadges
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        Icon={ComponentIcon}
        options={options}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "multiCheckbox" && options) {
    return (
      <InputMultiCheckbox
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        options={options}
        required={required}
        type={type}
        description={description}
        Icon={Icon}
      />
    );
  }

  if (type === "multiSelect_images") {
    return (
      <MultiImageInput
        label={label}
        name={name}
        required={required}
        type={type}
        placeholder={placeholder}
        description={description}
      />
    );
  }

  if (type === "rating") {
    return (
      <InputRating
        label={label}
        name={name}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        placeholder={placeholder}
      />
    );
  }

  if (type === "places_autocomplete") {
    return (
      <InputAddress
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        detectLocation={detectLocation}
        autoDetectLocation={autoDetectLocation}
      />
    );
  }

  if (type === "checkbox") {
    return (
      <InputCheckbox
        label={label}
        name={name}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        placeholder={placeholder}
      />
    );
  }

  if (type === "radio" && options) {
    return (
      <InputRadio
        label={label}
        name={name}
        options={options}
        className={className}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        required={required}
        type={type}
        description={description}
        placeholder={placeholder}
      />
    );
  }

  if (type === "yes_no_radio") {
    return (
      <InputRadio
        label={label}
        name={name}
        options={[
          { label: "Yes", value: "Yes" },
          { label: "No", value: "No" },
        ]}
        className={className}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        required={required}
        type="radio"
        description={description}
        placeholder={placeholder}
      />
    );
  }

  if (type === "password") {
    return (
      <InputPassword
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "date") {
    return (
      <InputDate
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "multiple-dates") {
    return (
      <InputMultipleDates
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
      />
    );
  }

  if (type === "number") {
    return (
      <InputNumber
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        min={min}
        max={max}
        step={step}
      />
    );
  }

  if (type === "switch") {
    return (
      <InputSwitch
        label={label || ""}
        name={name}
        description={description}
        className={className}
        disabled={disabled}
        required={required}
        Icon={ComponentIcon}
      />
    );
  }

  if (type === "phone") {
    return (
      <InputPhone
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
      />
    );
  }

  if (type === "text-area") {
    return (
      <InputTextArea
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
      />
    );
  }

  if (type === "editor") {
    return (
      <DynamicInputEditorV2
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
        Icon={ComponentIcon as LucideIcon}
        iconClassName={iconClassName}
        context={context}
      />
    );
  }

  if (type === "ai-text-area") {
    return (
      <InputAITextArea
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        generationPrompt={generationPrompt}
        context={context}
        maxLength={maxLength}
        aiButtonText={aiButtonText}
      />
    );
  }

  if (type === "color-picker") {
    return (
      <FormField
        control={form.control}
        name={name}
        disabled={disabled}
        render={({ field }) => (
          <FormItem
            className={cn(
              "w-full max-w-[400px] relative",
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                      "w-full h-11 px-3 py-2 text-left",
                      "border-2 border-input bg-background",
                      "rounded-md shadow-sm transition-colors",
                      "hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "flex items-center gap-2"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: field.value || "#3B82F6" }}
                    />
                    <span className="text-sm flex-1 truncate">
                      {field.value || "#3B82F6"}
                    </span>
                    <svg
                      className="w-4 h-4 text-muted-foreground flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-3" align="start">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Choose a color</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#F97316",
                        "#06B6D4",
                        "#84CC16",
                        "#EC4899",
                        "#6B7280",
                        "#14B8A6",
                        "#A855F7",
                        "#DC2626",
                        "#059669",
                        "#D97706",
                        "#7C3AED",
                        "#0891B2",
                        "#65A30D",
                        "#BE185D",
                        "#374151",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded-md border-2 transition-all duration-200",
                            "hover:scale-110 hover:shadow-md",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50",
                            field.value === color
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                          disabled={disabled}
                        >
                          {field.value === color && (
                            <Check className="w-4 h-4 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Custom color input */}
                    <div className="pt-2 border-t">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Custom color (hex):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="#3B82F6"
                          className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          disabled={disabled}
                        />
                        <input
                          type="color"
                          value={field.value || "#3B82F6"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-8 h-6 border rounded cursor-pointer"
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </FormControl>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            <FormMessage className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50" />
          </FormItem>
        )}
      />
    );
  }

  if (type === "datetime-local") {
    return (
      <FormField
        control={form.control}
        name={name}
        disabled={disabled}
        render={({ field }) => (
          <FormItem className={cn("w-full max-w-[400px]", className)}>
            <FormLabel
              className={cn(
                "text-sm font-medium",
                required &&
                  "after:content-['*'] after:ml-0.5 after:text-red-500"
              )}
            >
              {label}
            </FormLabel>
            <FormControl>
              <input
                type="datetime-local"
                className="w-full h-11 border-2 rounded-md shadow-sm px-3 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
                {...field}
              />
            </FormControl>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            <FormMessage className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50" />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem
          className={cn(
            "w-full max-w-[400px] min-w-0",
            "group transition-all duration-300 ease-in-out",
            className
          )}
        >
          <FormLabel
            className={cn(
              "text-sm font-medium transition-colors",
              "group-hover:text-primary",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative w-full min-w-0">
              <ComponentIcon
                size={10}
                className={cn(
                  "absolute z-0 left-3 top-6 h-4 w-4 -translate-y-1/2",
                  "text-muted-foreground transition-colors duration-200",
                  "group-hover:text-primary",
                  iconClassName
                )}
              />
              <Input
                autoComplete={autoComplete}
                size={6}
                onWheel={(e) => e.currentTarget.blur()}
                className={cn(
                  "w-full h-11 min-w-0",
                  "transition-all duration-200",
                  "border-2 focus:border-primary",
                  "hover:border-primary/50",
                  "rounded-md shadow-sm",
                  "placeholder:text-muted-foreground/50",
                  "focus:ring-2 focus:ring-primary/20",
                  "pl-10"
                )}
                type={type}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ""} // Ensure value is always a string
              />
            </div>
          </FormControl>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          <FormMessage className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50" />
        </FormItem>
      )}
    />
  );
};

export default React.memo(UIInputField) as <T extends FieldValues>(
  props: UIInputFieldProps<T>
) => React.ReactNode;
