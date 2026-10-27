import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      options,
      children,
      required,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
    const errorId = error && selectId ? `${selectId}-error` : undefined;
    const hintId = hint && selectId ? `${selectId}-hint` : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || hintId || undefined}
            required={required}
            className={`w-full appearance-none no-custom-arrow text-sm font-medium rounded-xl min-h-[48px] px-3.5 py-3 pr-11 transition-all duration-150 cursor-pointer ` +
              `bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ` +
              `${
                error
                  ? 'border-2 border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                  : 'border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              } ` +
              `${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''} ` +
              `${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1.5"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300">
            <ChevronDown className="w-5 h-5 stroke-[2.2] shrink-0" aria-hidden="true" />
          </div>
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

Select.displayName = 'Select';
