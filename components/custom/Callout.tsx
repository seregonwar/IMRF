import { ReactNode } from 'react';

export interface CalloutProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children?: ReactNode;
  icon?: boolean;
  className?: string;
}

const typeStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800'
};

const typeIcons = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅'
};

export function Callout({ 
  type = 'info', 
  title, 
  children, 
  icon = true,
  className = ''
}: CalloutProps) {
  const styles = typeStyles[type];
  const iconSymbol = typeIcons[type];
  
  return (
    <div className={`border rounded-lg p-4 ${styles} ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="text-lg flex-shrink-0 mt-0.5">
            {iconSymbol}
          </span>
        )}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-2">
              {title}
            </h4>
          )}
          <div className="prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}