import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg disabled:opacity-50 cursor-pointer';

  const variants = {
    primary: 'bg-spatial-accent text-gray-950 hover:bg-cyan-300 glow-cyan font-semibold',
    secondary: 'bg-spatial-purple text-white hover:bg-purple-600 glow-purple',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white',
    outline: 'border border-spatial-border text-spatial-accent hover:bg-spatial-accent/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
};
