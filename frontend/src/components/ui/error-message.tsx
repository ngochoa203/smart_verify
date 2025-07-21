"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  retryAction?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Đã xảy ra lỗi',
  message,
  retryAction,
  className
}: ErrorMessageProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-8',
      className
    )}>
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {retryAction && (
        <Button onClick={retryAction}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

export default ErrorMessage;