'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationState, NavigationSystem, createNavigationContext } from '@/lib/navigation';
import { ParsedContent } from '@/lib/markdown';

interface NavigationContextType {
  navigationState: NavigationState | null;
  updateNavigation: (content: ParsedContent[]) => void;
  isLoading: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialContent?: ParsedContent[];
}

export function NavigationProvider({ children, initialContent = [] }: NavigationProviderProps) {
  const pathname = usePathname();
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateNavigation = (content: ParsedContent[]) => {
    setIsLoading(true);
    try {
      const newState = createNavigationContext(pathname, content);
      setNavigationState(newState);
    } catch (error) {
      console.error('Failed to update navigation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialContent.length > 0) {
      updateNavigation(initialContent);
    } else {
      setIsLoading(false);
    }
  }, [pathname, initialContent]);

  // Update navigation when pathname changes
  useEffect(() => {
    if (navigationState && navigationState.currentPath !== pathname) {
      const content: ParsedContent[] = []; // In a real implementation, you'd fetch content for the new path
      updateNavigation(content);
    }
  }, [pathname, navigationState]);

  const value: NavigationContextType = {
    navigationState,
    updateNavigation,
    isLoading
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

/**
 * Hook for getting current navigation state
 */
export function useNavigationState(): NavigationState | null {
  const { navigationState } = useNavigation();
  return navigationState;
}

/**
 * Hook for getting current breadcrumbs
 */
export function useBreadcrumbs() {
  const navigationState = useNavigationState();
  return navigationState?.breadcrumbs || { items: [], current: { title: '', href: '', isActive: true } };
}

/**
 * Hook for getting table of contents
 */
export function useTableOfContents() {
  const navigationState = useNavigationState();
  return navigationState?.toc || { sections: [], depth: 0, anchors: [] };
}

/**
 * Hook for getting cross-reference links
 */
export function useCrossReferenceLinks() {
  const navigationState = useNavigationState();
  return navigationState?.crossLinks || {};
}