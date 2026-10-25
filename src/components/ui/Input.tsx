import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      iconLeading,
      iconTrailing,
      required,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const hintId = hint && inputId ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {label}
              {required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
            </label>
            {!required && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                Optional
              </span>
            )}
          </div>
        )}

        <div className="relative rounded-xl">
          {iconLeading && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {iconLeading}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || hintId || undefined}
            required={required}
            className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-colors duration-150 ` +
              `${iconLeading ? 'pl-10' : ''} ` +
              `${iconTrailing ? 'pr-10' : ''} ` +
              `${
                error
                  ? 'border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
              } ` +
              `${className}`}
            {...props}
          />

          {iconTrailing && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500">
              {iconTrailing}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
