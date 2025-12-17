'use client';

import { useEffect, useState } from 'react';
import { TableOfContents, TOCSection } from '@/lib/navigation';

interface EnhancedTOCProps {
  toc: TableOfContents;
  currentSection?: string;
  className?: string;
}

export function EnhancedTOC({ toc, currentSection, className = '' }: EnhancedTOCProps) {
  const [activeSection, setActiveSection] = useState<string>(currentSection || '');

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      let current = '';
      headings.forEach((heading) => {
        const element = heading as HTMLElement;
        if (element.offsetTop <= scrollPosition) {
          current = element.id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!toc.sections.length) {
    return null;
  }

  return (
    <nav className={`w-64 pl-8 py-4 sticky top-0 h-screen overflow-y-auto hidden xl:block border-l border-gray-200 dark:border-gray-800 ${className}`}>
      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-4">
        On This Page
      </h3>
      <div className="space-y-1">
        {toc.sections.map((section) => (
          <TOCItem
            key={section.id}
            section={section}
            activeSection={activeSection}
            depth={0}
          />
        ))}
      </div>
    </nav>
  );
}

interface TOCItemProps {
  section: TOCSection;
  activeSection: string;
  depth: number;
}

function TOCItem({ section, activeSection, depth }: TOCItemProps) {
  const isActive = activeSection === section.anchor;
  const hasChildren = section.children.length > 0;
  
  // Limit depth to prevent excessive nesting
  const maxDepth = 3;
  const shouldShowChildren = depth < maxDepth && hasChildren;

  return (
    <div>
      <a
        href={`#${section.anchor}`}
        className={`
          block py-1 px-2 text-sm rounded-md transition-colors
          ${depth > 0 ? `ml-${depth * 4}` : ''}
          ${isActive 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 font-medium' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        style={{ paddingLeft: `${(depth * 16) + 8}px` }}
      >
        {section.title}
      </a>
      
      {shouldShowChildren && (
        <div className="mt-1">
          {section.children.map((child) => (
            <TOCItem
              key={child.id}
              section={child}
              activeSection={activeSection}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}