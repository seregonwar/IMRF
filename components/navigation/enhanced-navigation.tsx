'use client';

import { ParsedContent } from '@/lib/markdown';
import { NavigationProvider, useNavigation } from './navigation-provider';
import { Breadcrumbs } from './breadcrumbs';
import { EnhancedTOC } from './enhanced-toc';
import { CrossReferenceLinks } from './cross-reference-links';

interface EnhancedNavigationProps {
  content: ParsedContent[];
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  showTOC?: boolean;
  showCrossReferences?: boolean;
}

export function EnhancedNavigation({ 
  content, 
  children, 
  showBreadcrumbs = true,
  showTOC = true,
  showCrossReferences = true
}: EnhancedNavigationProps) {
  return (
    <NavigationProvider initialContent={content}>
      <NavigationContent 
        showBreadcrumbs={showBreadcrumbs}
        showTOC={showTOC}
        showCrossReferences={showCrossReferences}
      >
        {children}
      </NavigationContent>
    </NavigationProvider>
  );
}

interface NavigationContentProps {
  children: React.ReactNode;
  showBreadcrumbs: boolean;
  showTOC: boolean;
  showCrossReferences: boolean;
}

function NavigationContent({ 
  children, 
  showBreadcrumbs, 
  showTOC, 
  showCrossReferences 
}: NavigationContentProps) {
  const { navigationState, isLoading } = useNavigation();

  if (isLoading) {
    return (
      <div className="flex">
        <div className="flex-1 min-w-0">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
        {showTOC && (
          <div className="w-64 pl-8 py-4 hidden xl:block">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {showBreadcrumbs && navigationState && (
          <Breadcrumbs 
            breadcrumbs={navigationState.breadcrumbs} 
            className="mb-6 px-8 pt-4"
          />
        )}
        
        <div className="relative">
          {children}
          
          {showCrossReferences && navigationState && (
            <CrossReferenceLinks
              linkMap={navigationState.crossLinks}
              currentPath={navigationState.currentPath}
              className="px-8 pb-8"
            />
          )}
        </div>
      </div>
      
      {showTOC && navigationState && (
        <EnhancedTOC
          toc={navigationState.toc}
          currentSection={navigationState.currentSection}
        />
      )}
    </div>
  );
}

/**
 * Simplified navigation wrapper for basic use cases
 */
export function SimpleNavigation({ 
  content, 
  children 
}: { 
  content: ParsedContent[]; 
  children: React.ReactNode; 
}) {
  return (
    <EnhancedNavigation 
      content={content}
      showBreadcrumbs={true}
      showTOC={true}
      showCrossReferences={false}
    >
      {children}
    </EnhancedNavigation>
  );
}