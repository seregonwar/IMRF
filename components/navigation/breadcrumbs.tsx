'use client';

import Link from 'next/link';
import { BreadcrumbTrail } from '@/lib/navigation';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbTrail;
  className?: string;
}

export function Breadcrumbs({ breadcrumbs, className = '' }: BreadcrumbsProps) {
  if (!breadcrumbs.items.length && !breadcrumbs.current) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <Link
              href={item.href}
              className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              {item.title}
            </Link>
          </li>
        ))}
        
        {breadcrumbs.current && (
          <li className="flex items-center">
            {breadcrumbs.items.length > 0 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
              {breadcrumbs.current.title}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}