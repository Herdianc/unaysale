"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

function Select({
  label,
  error,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const selectedOption = options.find((o) => o.value === selectedValue);

  function handleSelect(optionValue: string) {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-[#222222]"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
              : "border-gray-300",
            isOpen && "ring-2 ring-[#1769AA]/30 border-[#1769AA]",
            className
          )}
        >
          <span
            className={cn(
              "truncate",
              selectedOption ? "text-[#222222]" : "text-gray-400"
            )}
          >
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                  "hover:bg-[#F7F8FA]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  option.value === selectedValue &&
                    "bg-[#1769AA]/10 text-[#1769AA] font-medium",
                  option.value !== selectedValue && "text-[#222222]"
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === selectedValue && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))}
            {options.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">No options available</p>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export { Select };
export type { SelectProps, SelectOption };
