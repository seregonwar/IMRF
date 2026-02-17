import { ReactNode } from 'react';

export interface CodeBlockProps {
  language?: string;
  title?: string;
  children?: ReactNode;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ 
  language = 'text', 
  title, 
  children, 
  showLineNumbers = false,
  className = ''
}: CodeBlockProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-100 px-4 py-2 border-b text-sm font-medium text-gray-700">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className={`p-4 overflow-x-auto bg-gray-50 ${showLineNumbers ? 'pl-12' : ''}`}>
          <code className={`language-${language}`}>
            {children}
          </code>
        </pre>
        {showLineNumbers && (
          <div className="absolute left-0 top-0 p-4 text-gray-400 text-sm select-none">
            {String(children)
              .split('\n')
              .map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}