export { NavigationProvider, useNavigation, useNavigationState, useBreadcrumbs, useTableOfContents, useCrossReferenceLinks } from './navigation-provider';
export { Breadcrumbs } from './breadcrumbs';
export { EnhancedTOC } from './enhanced-toc';
export { CrossReferenceLinks } from './cross-reference-links';
export { EnhancedNavigation, SimpleNavigation } from './enhanced-navigation';

// Re-export navigation types for convenience
export type {
  NavigationState,
  TableOfContents,
  TOCSection,
  AnchorLink,
  RouteMap,
  RouteParams,
  RouteMetadata,
  BreadcrumbTrail,
  BreadcrumbItem,
  LinkMap,
  ProcessedLink
} from '@/lib/navigation';