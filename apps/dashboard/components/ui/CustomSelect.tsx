import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  size = 'md',
  'aria-label': ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const formattedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedIndex = formattedOptions.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex !== -1 ? formattedOptions[selectedIndex] : undefined;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % formattedOptions.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + formattedOptions.length) % formattedOptions.length);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < formattedOptions.length) {
        onChange(formattedOptions[highlightedIndex].value);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
      return;
    }

    if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const pyClass =
    size === 'sm'
      ? 'min-h-[44px] sm:min-h-[36px] py-1.5 px-3 text-sm sm:text-xs'
      : 'min-h-[44px] sm:min-h-[40px] py-2.5 px-3.5 text-sm sm:text-xs';

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-block w-full ${className}`}
    >
      <button
        id={id}
        ref={buttonRef}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || placeholder}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium shadow-2xs hover:border-cobalt-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          pyClass,
          buttonClassName
        )}
      >
        <span className="truncate">
          {selectedOption && selectedOption.value !== '' ? (
            selectedOption.label
          ) : (
            <span className="text-slate-500 dark:text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cobalt-500 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className={cn(
            'absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl py-1 text-xs animate-in fade-in-80 zoom-in-95 duration-150',
            menuClassName
          )}
        >
          {formattedOptions.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`w-full min-h-[44px] sm:min-h-[38px] flex items-center justify-between px-3.5 py-2.5 sm:py-2 text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-300 font-bold'
                    : isHighlighted
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
