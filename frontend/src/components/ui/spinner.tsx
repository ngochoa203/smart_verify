"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

export function Spinner({ 
  size = 'md', 
  color = 'primary',
  className,
  text
}: SpinnerProps) {
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorMap = {
    primary: 'text-brand-primary',
    secondary: 'text-brand-secondary',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <svg 
        className={cn('animate-spin', sizeMap[size], colorMap[color])} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export default Spinner;