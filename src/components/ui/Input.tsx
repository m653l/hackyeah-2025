import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'error';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, icon, variant = 'default', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const baseClasses = 'w-full px-4 py-3 text-base border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'border-zus-gray-300 focus:border-zus-green-primary focus:ring-zus-green-pale',
      error: 'border-zus-red focus:border-zus-red focus:ring-red-100'
    };

    const currentVariant = error ? 'error' : variant;

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-semibold text-zus-gray-900"
          >
            {label}
            {props.required && <span className="text-zus-red ml-1" aria-label="wymagane">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zus-gray-600">
              {icon}
            </div>
          )}
          
          <input
            className={cn(
              baseClasses,
              variants[currentVariant],
              icon && 'pl-10',
              className
            )}
            ref={ref}
            id={inputId}
            aria-describedby={cn(helpId, errorId)}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
        </div>

        {helpText && (
          <p id={helpId} className="text-sm text-zus-gray-600">
            {helpText}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-sm text-zus-red flex items-center gap-1" role="alert">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };