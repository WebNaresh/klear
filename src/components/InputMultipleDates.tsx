"use client";

import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";
import { Calendar } from "../shadcn/calendar";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shadcn/tabs";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn/form";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { Separator } from "../shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shadcn/tooltip";
import { cn } from "../lib//utils";
import { format, getDaysInMonth } from "date-fns";
import {
  Calendar as CalendarIcon,
  X,
  Repeat,
  Trash2,
  Clock,
  Target,
  Plus,
  ChevronDown,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import * as React from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import { BaseInputProps } from "../InputField";

const InputMultipleDates = <T extends FieldValues>({
  label,
  name,
  placeholder,
  className,
  disabled = false,
  required = false,
  description,
}: Omit<BaseInputProps<T>, "form" | "type">) => {
  const form = useFormContext<T>();
  const [open, setOpen] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<number>(1);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  if (!form) {
    throw new Error("InputMultipleDates must be used within a FormProvider");
  }

  const selectedDates: string[] = form.watch(name) || [];

  // Smart suggestions for common compliance dates
  const smartSuggestions = [
    {
      day: 1,
      label: "1st of each month",
      description: "Monthly reports, invoices",
      icon: Target,
    },
    {
      day: 15,
      label: "15th of each month",
      description: "Mid-month reviews, payroll",
      icon: Clock,
    },
    {
      day: 30,
      label: "30th of each month",
      description: "Month-end closing, summaries",
      icon: Repeat,
    },
    {
      day: 5,
      label: "5th of each month",
      description: "Payment deadlines",
      icon: Target,
    },
    {
      day: 10,
      label: "10th of each month",
      description: "Tax submissions",
      icon: Clock,
    },
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Format as MM-DD (month-day only)
    const monthDay = format(date, "MM-dd");

    const currentDates: string[] = form.getValues(name) || [];

    // Check if date already exists
    if (currentDates.includes(monthDay)) {
      // Remove if already selected
      const updatedDates = currentDates.filter((d: string) => d !== monthDay);
      form.setValue(name, updatedDates as any);
    } else {
      // Add new date
      form.setValue(name, [...currentDates, monthDay] as any);
    }
  };

  const handleQuickSelection = (targetDay: number) => {
    setIsLoading(true);

    // Simulate processing time for better UX
    setTimeout(() => {
      const currentDates: string[] = form.getValues(name) || [];
      const newDates: string[] = [];

      // Generate dates for all 12 months
      for (let month = 1; month <= 12; month++) {
        let day = targetDay;

        // Handle last day of month or days that don't exist in some months
        if (
          targetDay === 31 ||
          targetDay > getDaysInMonth(new Date(2024, month - 1))
        ) {
          day = getDaysInMonth(new Date(2024, month - 1));
        }

        const monthDay = `${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`;

        // Only add if not already selected
        if (!currentDates.includes(monthDay)) {
          newDates.push(monthDay);
        }
      }

      // Add new dates to existing ones
      const updatedDates = [...currentDates, ...newDates];
      form.setValue(name, updatedDates as any);
      setIsLoading(false);

      // Auto-close dialog after adding dates
      setOpen(false);
    }, 300);
  };

  const removeDate = (dateToRemove: string) => {
    const currentDates: string[] = form.getValues(name) || [];
    const updatedDates = currentDates.filter((d: string) => d !== dateToRemove);
    form.setValue(name, updatedDates as any);
  };

  const clearAllDates = () => {
    form.setValue(name, [] as any);
  };

  const formatDisplayDate = (dateString: string) => {
    const [month, day] = dateString.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const getPresetOptions = () => [
    {
      day: 1,
      label: "1st of every month",
      icon: Target,
      color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    },
    {
      day: 15,
      label: "15th of every month",
      icon: Clock,
      color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    },
    {
      day: selectedDay,
      label: `${selectedDay}${getOrdinalSuffix(selectedDay)} of every month`,
      icon: Sparkles,
      color:
        "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
    },
  ];

  // Sort dates by month then day for better display
  const sortedDates = [...selectedDates].sort((a, b) => {
    const [monthA, dayA] = a.split("-").map(Number);
    const [monthB, dayB] = b.split("-").map(Number);
    return monthA - monthB || dayA - dayB;
  });

  // Create a date object for the current year to check if it's selected
  const isDateSelected = (date: Date) => {
    const monthDay = format(date, "MM-dd");
    return selectedDates.includes(monthDay);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={() => (
        <FormItem
          className={cn(
            "w-full",
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
            <div className="space-y-3">
              {/* Selected Dates Display */}
              {selectedDates.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-foreground">
                        {selectedDates.length} Date
                        {selectedDates.length !== 1 ? "s" : ""} Selected
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearAllDates}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove all selected dates</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2 bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg border border-border/50">
                    {sortedDates.map((date: string) => (
                      <Badge
                        key={date}
                        variant="secondary"
                        className="group flex items-center justify-between gap-1 h-6 px-2 text-xs font-medium bg-primary/5 text-primary hover:bg-primary/10 border-primary/10 transition-all duration-200"
                      >
                        <span>{formatDisplayDate(date)}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDate(date)}
                          className="h-4 w-4 p-0 ml-1 text-primary/40 hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={`Remove ${formatDisplayDate(date)}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Picker */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal group",
                      "border-2 hover:border-primary/50 focus:border-primary",
                      "transition-all duration-200",
                      "shadow-sm hover:shadow-md focus:shadow-lg",
                      "bg-gradient-to-r from-background to-muted/20",
                      "hover:from-primary/5 hover:to-primary/10",
                      selectedDates.length === 0 && "text-muted-foreground",
                      "h-11 px-4 py-2"
                    )}
                  >
                    <div className="flex items-center">
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {selectedDates.length > 0
                            ? `${selectedDates.length} date${
                                selectedDates.length > 1 ? "s" : ""
                              } selected`
                            : placeholder || "Select compliance dates"}
                        </span>
                        {selectedDates.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Click to add more or modify dates
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedDates.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {selectedDates.length}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[320px] h-[450px] p-0 z-[60] date-picker-popover"
                  align="start"
                >
                  <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 p-1 bg-muted/50">
                      <TabsTrigger
                        value="calendar"
                        className="flex items-center gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span>Calendar</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="quick"
                        className="flex items-center gap-2"
                      >
                        <Target className="h-4 w-4" />
                        <span>Quick Add</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="suggestions"
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Smart</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="date-picker-content">
                      <TabsContent value="calendar" className="m-0 p-4">
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-blue-500/5 to-blue-600/10 p-4 rounded-lg border border-blue-500/20">
                            <Calendar
                              mode="single"
                              selected={undefined}
                              onSelect={handleDateSelect}
                              initialFocus
                              className="rounded-md border-0 w-full [&_.rdp-cell]:rounded-lg [&_.rdp-day]:h-9 [&_.rdp-day]:w-9 [&_.rdp-day]:text-sm [&_.rdp-day]:font-medium"
                              modifiers={{
                                selected: isDateSelected,
                              }}
                              modifiersStyles={{
                                selected: {
                                  backgroundColor: "hsl(var(--primary))",
                                  color: "hsl(var(--primary-foreground))",
                                  fontWeight: "600",
                                },
                              }}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="quick" className="m-0 p-4">
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 space-y-3">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <Label
                                htmlFor="day-selector"
                                className="text-sm font-medium text-foreground"
                              >
                                Day of month (1-29)
                              </Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                id="day-selector"
                                type="number"
                                min="1"
                                max="29"
                                value={selectedDay}
                                onChange={(e) =>
                                  setSelectedDay(Number(e.target.value))
                                }
                                className="w-20 h-9 text-center font-medium border-primary/30 focus:border-primary focus:ring-primary"
                                placeholder="11"
                              />
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleQuickSelection(selectedDay)
                                }
                                className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={
                                  selectedDay < 1 ||
                                  selectedDay > 29 ||
                                  isLoading
                                }
                              >
                                {isLoading ? (
                                  <>
                                    <div className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Adding dates...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to all months
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-background/50 rounded-md">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                This will add the <strong>{selectedDay}</strong>
                                <strong>
                                  {selectedDay === 1
                                    ? "st"
                                    : selectedDay === 2
                                    ? "nd"
                                    : selectedDay === 3
                                    ? "rd"
                                    : "th"}
                                </strong>{" "}
                                of every month. For shorter months, it adjusts
                                to the last available day.
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="suggestions" className="m-0 p-4">
                        <div className="space-y-3">
                          {smartSuggestions.map((suggestion) => {
                            const Icon = suggestion.icon;
                            return (
                              <Button
                                key={suggestion.day}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDay(suggestion.day);
                                  handleQuickSelection(suggestion.day);
                                }}
                                className="w-full justify-start text-left h-auto p-3 bg-gradient-to-r from-orange-500/5 to-orange-600/10 border-orange-500/20 hover:from-orange-500/10 hover:to-orange-600/20"
                              >
                                <Icon className="h-4 w-4 mr-3 text-orange-600 flex-shrink-0" />
                                <div className="text-left">
                                  <div className="text-sm font-medium">
                                    {suggestion.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {suggestion.description}
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </div>

                    <div className="date-picker-footer">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-foreground">
                              {selectedDates.length}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            date{selectedDates.length !== 1 ? "s" : ""} selected
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setOpen(false)}
                          className="h-8 px-4 text-xs font-medium bg-primary hover:bg-primary/90"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Button>
                      </div>
                    </div>
                  </Tabs>
                </PopoverContent>
              </Popover>
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

export default InputMultipleDates;
