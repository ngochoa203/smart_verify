"use client";

import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionOnClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionOnClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      className
    )}>
      {Icon && (
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      
      {description && (
        <p className="text-gray-500 max-w-md mb-6">
          {description}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && actionOnClick && (
          <Button onClick={actionOnClick}>
            {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && secondaryActionOnClick && (
          <Button variant="outline" onClick={secondaryActionOnClick}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;