"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  text?: string;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  fullPage = false,
  text,
  className
}: LoadingProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullPage ? 'min-h-[50vh]' : 'py-8',
      className
    )}>
      <Loader2 className={cn(sizeMap[size], 'animate-spin text-brand-primary')} />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );

  return content;
}

export default Loading;