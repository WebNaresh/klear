"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn/form";
import { cn } from "../../../lib/utils";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { UIInputFieldProps } from "../InputField";
import { Check, X, Badge as BadgeIcon } from "lucide-react";

const InputBadges: React.FC<UIInputFieldProps> = (props) => {
  const {
    label,
    name,
    options = [],
    className,
    disabled,
    Icon,
    required,
    description,
  } = props;
  const form = useFormContext();
  const [selectedCount, setSelectedCount] = React.useState(0);

  if (!form) {
    throw new Error("InputBadges must be used within a FormProvider");
  }

  // Update selected count when field value changes
  React.useEffect(() => {
    const fieldValue = form.watch(name);
    setSelectedCount(Array.isArray(fieldValue) ? fieldValue.length : 0);
  }, [form, name]);

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem
          className={cn(
            "w-full space-y-4",
            "group transition-all duration-300 ease-in-out",
            className
          )}
        >
          <div className="flex items-center justify-between">
            <FormLabel
              className={cn(
                "text-base font-semibold flex items-center gap-2",
                "transition-colors duration-200",
                "group-hover:text-primary",
                required &&
                  "after:content-['*'] after:ml-0.5 after:text-destructive"
              )}
            >
              {Icon ? (
                <Icon size={18} className="text-muted-foreground" />
              ) : (
                <BadgeIcon size={18} className="text-muted-foreground" />
              )}
              {label}
            </FormLabel>

            {/* Selected Count Badge */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCount} selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    field.onChange([]);
                    setSelectedCount(0);
                  }}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                  disabled={disabled}
                >
                  <X size={12} />
                  Clear all
                </button>
              </div>
            )}
          </div>

          <FormControl>
            <div className="space-y-4">
              {/* Description */}
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}

              {/* Badge Grid - Enhanced Responsive Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {options.map((option) => {
                  const isSelected = Array.isArray(field.value)
                    ? field.value.includes(option.value)
                    : false;

                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "group/badge relative cursor-pointer transition-all duration-300 ease-out",
                        "border-2 rounded-xl p-4 min-h-[80px]",
                        "flex items-center justify-center text-center",
                        "hover:scale-[1.02] hover:shadow-lg hover:-translate-y-0.5",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isSelected
                          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md ring-1 ring-primary/20"
                          : "border-border/60 bg-card hover:border-primary/40 hover:bg-accent/50",
                        disabled &&
                          "opacity-50 cursor-not-allowed pointer-events-none hover:scale-100 hover:shadow-none hover:translate-y-0"
                      )}
                      onClick={() => {
                        if (disabled) return;

                        // Always handle as multi-select for badges
                        const currentValues = Array.isArray(field.value)
                          ? field.value
                          : [];
                        const newValues = isSelected
                          ? currentValues.filter(
                              (val: string) => val !== option.value
                            )
                          : [...currentValues, option.value];
                        field.onChange(newValues);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!disabled) {
                            const currentValues = Array.isArray(field.value)
                              ? field.value
                              : [];
                            const newValues = isSelected
                              ? currentValues.filter(
                                  (val: string) => val !== option.value
                                )
                              : [...currentValues, option.value];
                            field.onChange(newValues);
                          }
                        }
                      }}
                      tabIndex={disabled ? -1 : 0}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`${isSelected ? "Unselect" : "Select"} ${
                        option.label
                      } badge`}
                    >
                      {/* Selection Indicator */}
                      <div
                        className={cn(
                          "absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
                          "border-2 shadow-sm",
                          isSelected
                            ? "bg-primary border-primary scale-100 opacity-100"
                            : "bg-background border-border scale-0 opacity-0 group-hover/badge:scale-75 group-hover/badge:opacity-50"
                        )}
                      >
                        <Check
                          size={14}
                          className={cn(
                            "transition-all duration-200",
                            isSelected
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>

                      {/* Badge Content */}
                      <div className="flex flex-col items-center justify-center space-y-1">
                        {/* Badge Label */}
                        <div
                          className={cn(
                            "text-sm font-medium transition-all duration-200 leading-tight",
                            "group-hover/badge:scale-105",
                            isSelected
                              ? "text-primary font-semibold"
                              : "text-foreground group-hover/badge:text-primary"
                          )}
                        >
                          {option.label}
                        </div>

                        {/* Subtle indicator */}
                        <div
                          className={cn(
                            "w-8 h-0.5 rounded-full transition-all duration-200",
                            isSelected
                              ? "bg-primary"
                              : "bg-transparent group-hover/badge:bg-primary/30"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FormControl>

          <FormMessage className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50" />
        </FormItem>
      )}
    />
  );
};

// Sample badge options - you can use these as default options
export const DEFAULT_BADGE_OPTIONS = [
  { value: "1-year-warranty", label: "1 Year Warranty" },
  { value: "7-day-return", label: "7 Day Return" },
  { value: "free-installation", label: "Free Installation" },
  { value: "certified-refurbished", label: "Certified Refurbished" },
  { value: "eco-friendly", label: "Eco-Friendly" },
  { value: "fast-shipping", label: "Fast Shipping" },
  { value: "premium-quality", label: "Premium Quality" },
  { value: "best-seller", label: "Best Seller" },
];

export default InputBadges;
