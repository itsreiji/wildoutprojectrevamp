"use client";

import * as React from "react";
import { X, ChevronDown, ChevronUp, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxVisible?: number;
  disabled?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
  loading?: boolean;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({
    options,
    value,
    onChange,
    placeholder = "Select options...",
    searchPlaceholder = "Search...",
    emptyMessage = "No options found",
    maxVisible = 3,
    disabled = false,
    className,
    onSearch,
    loading = false,
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const optionsRef = React.useRef<HTMLDivElement>(null);

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      let filtered = options;

      if (searchQuery.trim()) {
        filtered = options.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort selected options to top
      return filtered.sort((a, b) => {
        const aSelected = value.includes(a.value);
        const bSelected = value.includes(b.value);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.label.localeCompare(b.label);
      });
    }, [options, searchQuery, value]);

    // Handle option selection/deselection
    const handleOptionToggle = React.useCallback((optionValue: string) => {
      if (disabled) return;

      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];

      onChange(newValue);
    }, [value, onChange, disabled]);

    // Handle remove individual selected item
    const handleRemove = React.useCallback((optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      const newValue = value.filter(v => v !== optionValue);
      onChange(newValue);
    }, [value, onChange, disabled]);

    // Handle clear all
    const handleClearAll = React.useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      onChange([]);
    }, [onChange, disabled]);

    // Keyboard navigation
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 100);
        } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleOptionToggle(filteredOptions[focusedIndex].value);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setFocusedIndex(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
      } else if (e.key === "Tab" && !e.shiftKey && isOpen) {
        // Allow tab to move focus to search input
        if (document.activeElement !== searchInputRef.current) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    }, [isOpen, filteredOptions, focusedIndex, handleOptionToggle, disabled]);

    // Focus management for options
    React.useEffect(() => {
      if (isOpen && focusedIndex >= 0 && optionsRef.current) {
        const focusedOption = optionsRef.current.querySelector(
          `[data-index="${focusedIndex}"]`
        ) as HTMLElement;

        if (focusedOption) {
          focusedOption.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }, [focusedIndex, isOpen]);

    // Focus search input when dropdown opens
    React.useEffect(() => {
      if (isOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setFocusedIndex(-1);
        setSearchQuery("");
      }
    }, [isOpen]);

    // Handle search with debouncing
    const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);

      if (onSearch) {
        // Debounce search calls
        setTimeout(() => onSearch(query), 300);
      }
    }, [onSearch]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          optionsRef.current &&
          !optionsRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get selected options for display
    const selectedOptions = options.filter(option => value.includes(option.value));

    // Display value
    const displayValue = React.useMemo(() => {
      if (value.length === 0) return placeholder;
      if (value.length === 1) return selectedOptions[0]?.label || placeholder;
      if (value.length <= maxVisible) {
        return selectedOptions.map(o => o.label).join(", ");
      }
      return `${value.length} items selected`;
    }, [value, selectedOptions, placeholder, maxVisible]);

    // Mobile touch handlers
    const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsOpen(prev => !prev);
      }
    }, [disabled]);

    return (
      <div className={cn("relative w-full", className)} ref={ref}>
        {/* Trigger Button */}
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal relative",
            "hover:bg-accent transition-colors",
            "focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(prev => !prev)}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={placeholder}
        >
          <span className="truncate pr-8">{displayValue}</span>

          {/* Clear button (when selections exist) */}
          {value.length > 0 && !disabled && (
            <button
              type="button"
              className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/20 rounded-full transition-colors"
              onClick={handleClearAll}
              aria-label="Clear all selections"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          )}

          {/* Chevron icon */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </Button>

        {/* Selected Items Counter Badge */}
        {value.length > 0 && (
          <div className="absolute -top-2 -right-2">
            <Badge
              variant="count"
              className="bg-pink-500 text-white border-pink-600"
            >
              {value.length}
            </Badge>
          </div>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-black border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                className="h-8 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && filteredOptions.length > 0) {
                    e.preventDefault();
                    setFocusedIndex(0);
                    optionsRef.current?.querySelector('[data-index="0"]')?.scrollIntoView({ block: "nearest" });
                  }
                }}
                aria-label="Search options"
              />
              {loading && (
                <div
                  role="status"
                  aria-label="Loading"
                  className="h-3 w-3 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"
                />
              )}
            </div>

            {/* Options List */}
            <ScrollArea className="max-h-64">
              <div
                ref={optionsRef}
                className="py-1"
                role="listbox"
                aria-multiselectable="true"
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No matches found" : emptyMessage}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => {
                    const isSelected = value.includes(option.value);
                    const isFocused = index === focusedIndex;

                    return (
                      <div
                        key={option.value}
                        data-index={index}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        tabIndex={-1}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 mx-1 rounded-md cursor-pointer transition-colors",
                          "hover:bg-white/5",
                          isFocused && "bg-white/10 outline-none ring-2 ring-pink-500/50",
                          isSelected && "bg-pink-500/10 hover:bg-pink-500/20",
                          option.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => !option.disabled && handleOptionToggle(option.value)}
                        onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          if (!option.disabled) handleOptionToggle(option.value);
                        }}
                      >
                        {/* Checkbox */}
                        <div className={cn(
                          "h-4 w-4 rounded-sm border flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-pink-500 border-pink-500"
                            : "border-white/30 bg-white/5 hover:border-white/50",
                          option.disabled && "opacity-30"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>

                        {/* Label */}
                        <span className={cn(
                          "flex-1 text-sm",
                          isSelected && "font-medium text-pink-400",
                          isFocused && "font-medium"
                        )}>
                          {option.label}
                        </span>

                        {/* Disabled indicator */}
                        {option.disabled && (
                          <span className="text-xs text-muted-foreground">Disabled</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-white/10 bg-white/5">
              <span className="text-xs text-muted-foreground">
                {value.length} selected • {filteredOptions.length} available
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  Close
                </Button>
                {value.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Items Display */}
        {value.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Selected items">
            {selectedOptions.slice(0, maxVisible).map(option => (
              <Badge
                key={option.value}
                variant="category"
                className="bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30 transition-colors"
              >
                {option.label}
                <button
                  type="button"
                  className="ml-1 hover:text-white focus:outline-none"
                  onClick={(e) => handleRemove(option.value, e)}
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {value.length > maxVisible && (
              <Badge variant="outline" className="text-xs">
                +{value.length - maxVisible} more
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };