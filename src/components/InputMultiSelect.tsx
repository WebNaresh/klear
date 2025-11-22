"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form";
import { cn } from "../../../lib/utils";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { UIInputFieldProps } from "../InputField";

const InputMultiSelect: React.FC<UIInputFieldProps> = (props) => {
  const {
    label,
    name,
    options,
    className,
    placeholder,
    disabled,
    Icon,
    required,
    description,
  } = props;
  const form = useFormContext();

  if (!form) {
    throw new Error("InputMultiSelect must be used within a FormProvider");
  }

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "44px",
      border: state.isFocused
        ? "2px solid hsl(var(--primary))"
        : "2px solid hsl(var(--input))",
      borderRadius: "var(--radius)",
      backgroundColor: disabled ? "hsl(var(--muted))" : "transparent",
      boxShadow: state.isFocused
        ? "0 0 0 2px hsl(var(--primary) / 0.2)"
        : "none",
      transition: "all 200ms ease",
      "&:hover": {
        borderColor: "hsl(var(--input))",
        cursor: "pointer",
      },
      paddingLeft: "38px",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0 12px",
      paddingLeft: "0",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
      animation: "scaleIn 200ms ease",
      boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      overflow: "hidden",
      zIndex: 9999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
        ? "hsl(var(--accent))"
        : "transparent",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      cursor: "pointer",
      transition: "all 150ms ease",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "hsl(var(--primary))"
          : "hsl(var(--accent))",
        transform: "translateX(4px)",
      },
      zIndex: 9999,
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "hsl(var(--accent))",
      borderRadius: "var(--radius)",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "hsl(var(--accent-foreground))",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "hsl(var(--accent-foreground))",
      "&:hover": {
        backgroundColor: "hsl(var(--destructive))",
        color: "hsl(var(--destructive-foreground))",
      },
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      transition: "transform 200ms ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
      color: state.isFocused
        ? "hsl(var(--primary))"
        : "hsl(var(--muted-foreground))",
      "&:hover": {
        color: "hsl(var(--primary))",
      },
    }),
  };

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem
          className={cn(
            "w-full max-w-[400px]",
            "group transition-all duration-300 ease-in-out",
            className
          )}
        >
          <FormLabel
            className={cn(
              "text-sm font-medium",
              "transition-colors duration-200",
              "group-hover:text-primary",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="flex items-start relative w-full">
              {Icon && (
                <div className="absolute left-3 top-5 transform -translate-y-1/2 text-muted-foreground z-0 transition-colors group-hover:text-primary">
                  <Icon size={20} />
                </div>
              )}
              <CreatableSelect
                {...field}
                className="w-full"
                value={field.value}
                placeholder={placeholder}
                isMulti
                name={name}
                options={options}
                instanceId={`select-${name}`}
                onChange={(newValue: any) => {
                  field.onChange(newValue);
                }}
                styles={customStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                menuShouldScrollIntoView={false}
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

export default InputMultiSelect;
