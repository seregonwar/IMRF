'use client';

import Link from 'next/link';
import { LinkMap, ProcessedLink } from '@/lib/navigation';

interface CrossReferenceLinksProps {
  linkMap: LinkMap;
  currentPath: string;
  className?: string;
}

export function CrossReferenceLinks({ linkMap, currentPath, className = '' }: CrossReferenceLinksProps) {
  const currentLinks = linkMap[currentPath];
  
  if (!currentLinks || (!currentLinks.incoming.length && !currentLinks.outgoing.length)) {
    return null;
  }

  return (
    <div className={`border-t border-gray-200 dark:border-gray-800 pt-6 mt-8 ${className}`}>
      {currentLinks.incoming.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Referenced by
          </h3>
          <div className="space-y-2">
            {currentLinks.incoming.map((link) => (
              <CrossReferenceItem key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {currentLinks.outgoing.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            References
          </h3>
          <div className="space-y-2">
            {currentLinks.outgoing.map((link) => (
              <CrossReferenceItem key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CrossReferenceItemProps {
  link: ProcessedLink;
}

function CrossReferenceItem({ link }: CrossReferenceItemProps) {
  const isExternal = link.type === 'external';
  const isResolved = link.resolved && link.href;

  if (!isResolved) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <BrokenLinkIcon />
        <span className="line-through">{link.text}</span>
        <span className="text-xs text-red-500">(broken link)</span>
      </div>
    );
  }

  const LinkComponent = isExternal ? 'a' : Link;
  const linkProps = isExternal 
    ? { href: link.href!, target: '_blank', rel: 'noopener noreferrer' }
    : { href: link.href! };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <LinkTypeIcon type={link.type} />
      <LinkComponent
        {...linkProps}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
      >
        {link.text}
      </LinkComponent>
      {isExternal && <ExternalLinkIcon />}
    </div>
  );
}

function LinkTypeIcon({ type }: { type: ProcessedLink['type'] }) {
  switch (type) {
    case 'anchor':
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'internal':
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'external':
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    default:
      return null;
  }
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function BrokenLinkIcon() {
  return (
    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}