import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs font-medium text-gray-300">{label}</label>}
      <input
        className={twMerge(
          clsx(
            'px-3.5 py-2.5 bg-gray-900/80 border border-spatial-border rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-spatial-accent focus:ring-1 focus:ring-spatial-accent transition-all',
            error && 'border-red-500 focus:ring-red-500',
            className
          )
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
};
