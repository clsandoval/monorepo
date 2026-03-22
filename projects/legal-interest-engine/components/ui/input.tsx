'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  type,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isNumber = type === 'number';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium select-none"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={[
          'w-full rounded-md border px-3 py-2 text-sm font-body text-primary bg-surface',
          'placeholder:text-muted/60',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-border',
          isNumber ? 'font-mono' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-body">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted font-body">{helperText}</p>
      )}
    </div>
  );
}
