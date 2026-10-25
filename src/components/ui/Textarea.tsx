import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      required,
      id,
      className = '',
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
    const errorId = error && textareaId ? `${textareaId}-error` : undefined;
    const hintId = hint && textareaId ? `${textareaId}-hint` : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
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
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            rows={rows}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || hintId || undefined}
            required={required}
            className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-colors duration-150 resize-y ` +
              `${
                error
                  ? 'border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
              } ` +
              `${className}`}
            {...props}
          />
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

Textarea.displayName = 'Textarea';
