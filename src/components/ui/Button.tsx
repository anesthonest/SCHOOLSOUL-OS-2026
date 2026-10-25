import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      iconLeading,
      iconTrailing,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none cursor-pointer ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
      'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 disabled:shadow-none';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] min-w-[36px] rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2 min-h-[42px] min-w-[44px] rounded-xl gap-2',
      lg: 'text-base px-5 py-2.5 min-h-[48px] min-w-[48px] rounded-xl gap-2.5',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow ' +
        'focus-visible:ring-blue-600 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
      secondary:
        'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 ' +
        'border border-slate-200 dark:border-slate-700/80 ' +
        'focus-visible:ring-slate-400 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
      gold:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow ' +
        'focus-visible:ring-amber-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow ' +
        'focus-visible:ring-rose-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
      outline:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 ' +
        'border border-slate-300 dark:border-slate-700 ' +
        'focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 ' +
        'focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {iconLeading && <span className="shrink-0" aria-hidden="true">{iconLeading}</span>}
            <span>{children}</span>
            {iconTrailing && <span className="shrink-0" aria-hidden="true">{iconTrailing}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
