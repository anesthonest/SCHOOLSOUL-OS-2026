import React, { useState, useId } from 'react';
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react';
import { Input, type InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'iconTrailing'> {
  showStrengthMeter?: boolean;
}

export function evaluatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: 'Too Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  meetsMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumberOrSpecial: boolean;
} {
  const meetsMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

  let score = 0;
  if (password.length >= 6) score++;
  if (meetsMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumberOrSpecial && password.length >= 8) score++;

  const labels: Array<'Too Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'> = [
    'Too Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong',
  ];
  const colors = [
    'bg-slate-300 dark:bg-slate-700',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  return {
    score,
    label: labels[score] || 'Too Weak',
    color: colors[score] || colors[0],
    meetsMinLength,
    hasUpper,
    hasLower,
    hasNumberOrSpecial,
  };
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthMeter = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const helperId = useId();

    const currentVal = typeof value === 'string' ? value : '';
    const strength = evaluatePasswordStrength(currentVal);

    return (
      <div className="w-full space-y-2">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          iconLeading={<Lock className="w-4 h-4" aria-hidden="true" />}
          iconTrailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          }
          {...props}
        />

        {showStrengthMeter && currentVal.length > 0 && (
          <div id={helperId} className="space-y-1.5 pt-1 text-xs">
            {/* Strength meter bar */}
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <span>Password Strength</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{strength.label}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-full rounded-full transition-all duration-200 ${
                    step < strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className={`flex items-center gap-1 ${strength.meetsMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                {strength.meetsMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-400" />}
                8+ characters
              </span>
              <span className={`flex items-center gap-1 ${strength.hasUpper && strength.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                {strength.hasUpper && strength.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-400" />}
                Upper & lower case
              </span>
              <span className={`flex items-center gap-1 ${strength.hasNumberOrSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                {strength.hasNumberOrSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-400" />}
                Number or symbol
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
