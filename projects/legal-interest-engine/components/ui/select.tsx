'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={[
            'w-full appearance-none rounded-md border px-3 py-2 text-sm font-body text-primary bg-surface',
            'pr-8 cursor-pointer',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-border',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          <svg
            className="h-4 w-4 text-muted"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-body">{error}</p>
      )}
    </div>
  );
}
