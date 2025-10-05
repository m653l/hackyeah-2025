import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'warning' | 'info' | 'success';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseClasses = 'bg-white rounded-xl border transition-all duration-200 hover:shadow-lg';
    
    const variants = {
      default: 'border-zus-gray-200 shadow-sm hover:shadow-zus-green-primary/10',
      accent: 'border-l-4 border-l-zus-green-primary border-zus-gray-200 shadow-sm',
      warning: 'border-l-4 border-l-zus-orange border-zus-gray-200 shadow-sm bg-orange-50/30',
      info: 'border-l-4 border-l-zus-blue border-zus-gray-200 shadow-sm bg-blue-50/30',
      success: 'border-l-4 border-l-zus-green-primary border-zus-gray-200 shadow-sm bg-green-50/30'
    };

    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('mb-4', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        className={cn('text-xl font-semibold text-zus-gray-900 leading-tight', className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('text-zus-gray-600 leading-relaxed', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };