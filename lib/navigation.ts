import { ParsedContent, ContentSection, CrossReference } from './markdown';

export interface TableOfContents {
  sections: TOCSection[];
  depth: number;
  anchors: AnchorLink[];
}

export interface TOCSection {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children: TOCSection[];
}

export interface AnchorLink {
  id: string;
  text: string;
  href: string;
  level: number;
}

export interface RouteMap {
  [path: string]: {
    section: ContentSection;
    params: RouteParams;
    metadata: RouteMetadata;
  };
}

export interface RouteParams {
  slug: string[];
  anchor?: string;
}

export interface RouteMetadata {
  title: string;
  description?: string;
  lastModified?: string;
}

export interface BreadcrumbTrail {
  items: BreadcrumbItem[];
  current: BreadcrumbItem;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
  isActive: boolean;
}

export interface LinkMap {
  [sourceId: string]: {
    outgoing: ProcessedLink[];
    incoming: ProcessedLink[];
  };
}

export interface ProcessedLink {
  id: string;
  source: string;
  target: string;
  type: 'internal' | 'external' | 'anchor';
  text: string;
  resolved: boolean;
  href?: string;
}

export interface NavigationState {
  currentPath: string;
  currentSection?: string;
  breadcrumbs: BreadcrumbTrail;
  toc: TableOfContents;
  crossLinks: LinkMap;
}

/**
 * Navigation System - Core class for managing navigation functionality
 */
export class NavigationSystem {
  private routeMap: RouteMap = {};
  private linkMap: LinkMap = {};

  /**
   * Generates table of contents from parsed content
   */
  generateTOC(content: ParsedContent[]): TableOfContents {
    const allSections: TOCSection[] = [];
    const anchors: AnchorLink[] = [];
    let maxDepth = 0;

    content.forEach(parsedContent => {
      parsedContent.sections.forEach(section => {
        const tocSection: TOCSection = {
          id: section.id,
          title: section.title,
          level: section.level,
          anchor: section.metadata.anchor,
          children: []
        };

        // Track maximum depth
        maxDepth = Math.max(maxDepth, section.level);

        // Create anchor link
        anchors.push({
          id: section.id,
          text: section.title,
          href: `#${section.metadata.anchor}`,
          level: section.level
        });

        allSections.push(tocSection);
      });
    });

    // Build hierarchical structure
    const hierarchicalSections = this.buildHierarchy(allSections);

    return {
      sections: hierarchicalSections,
      depth: maxDepth,
      anchors
    };
  }

  /**
   * Creates section routes from content sections
   */
  createSectionRoutes(sections: ContentSection[]): RouteMap {
    const routeMap: RouteMap = {};

    sections.forEach(section => {
      const path = `#${section.metadata.anchor}`;
      
      routeMap[path] = {
        section,
        params: {
          slug: [],
          anchor: section.metadata.anchor
        },
        metadata: {
          title: section.title,
          description: this.extractDescription(section.content),
          lastModified: new Date().toISOString()
        }
      };
    });

    this.routeMap = { ...this.routeMap, ...routeMap };
    return routeMap;
  }

  /**
   * Builds cross-links from references
   */
  buildCrossLinks(references: CrossReference[]): LinkMap {
    const linkMap: LinkMap = {};

    references.forEach(ref => {
      const processedLink: ProcessedLink = {
        id: this.generateLinkId(ref),
        source: ref.source,
        target: ref.target,
        type: ref.type,
        text: ref.text,
        resolved: this.isLinkResolvable(ref),
        href: this.resolveLinkHref(ref)
      };

      // Initialize source entry if not exists
      if (!linkMap[ref.source]) {
        linkMap[ref.source] = { outgoing: [], incoming: [] };
      }

      // Add to outgoing links
      linkMap[ref.source].outgoing.push(processedLink);

      // Add to incoming links for internal references
      if (ref.type === 'internal' || ref.type === 'anchor') {
        const targetKey = ref.type === 'anchor' ? ref.source : ref.target;
        if (!linkMap[targetKey]) {
          linkMap[targetKey] = { outgoing: [], incoming: [] };
        }
        linkMap[targetKey].incoming.push(processedLink);
      }
    });

    this.linkMap = { ...this.linkMap, ...linkMap };
    return linkMap;
  }

  /**
   * Updates breadcrumbs based on current path
   */
  updateBreadcrumbs(currentPath: string): BreadcrumbTrail {
    const pathSegments = currentPath.split('/').filter(segment => segment);
    const items: BreadcrumbItem[] = [];

    // Add home/root
    items.push({
      title: 'Documentation',
      href: '/docs',
      isActive: false
    });

    // Build breadcrumb trail
    let accumulatedPath = '/docs';
    pathSegments.forEach((segment, index) => {
      if (segment === 'docs') return; // Skip docs segment as it's already added

      accumulatedPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      items.push({
        title: this.formatBreadcrumbTitle(segment),
        href: accumulatedPath,
        isActive: isLast
      });
    });

    return {
      items: items.slice(0, -1), // All items except current
      current: items[items.length - 1] || items[0]
    };
  }

  /**
   * Gets navigation state for current path
   */
  getNavigationState(currentPath: string, content: ParsedContent[]): NavigationState {
    const toc = this.generateTOC(content);
    const breadcrumbs = this.updateBreadcrumbs(currentPath);
    
    // Extract current section from path anchor
    const anchorMatch = currentPath.match(/#(.+)$/);
    const currentSection = anchorMatch ? anchorMatch[1] : undefined;

    return {
      currentPath,
      currentSection,
      breadcrumbs,
      toc,
      crossLinks: this.linkMap
    };
  }

  /**
   * Resolves internal links to proper hrefs
   */
  resolveInternalLink(target: string, basePath: string = ''): string {
    // Handle anchor links
    if (target.startsWith('#')) {
      return target;
    }

    // Handle relative paths
    if (target.startsWith('./') || target.startsWith('../')) {
      return this.resolveRelativePath(target, basePath);
    }

    // Handle absolute internal paths
    if (target.startsWith('/')) {
      return target;
    }

    // Default to treating as relative to docs
    return `/docs/${target}`;
  }

  /**
   * Validates that a link target exists and is accessible
   */
  validateLink(target: string, type: CrossReference['type']): boolean {
    switch (type) {
      case 'anchor':
        return target.startsWith('#') && target.length > 1;
      case 'internal':
        return this.routeExists(target);
      case 'external':
        return this.isValidUrl(target);
      default:
        return false;
    }
  }

  // Private helper methods

  private buildHierarchy(sections: TOCSection[]): TOCSection[] {
    const result: TOCSection[] = [];
    const stack: TOCSection[] = [];

    sections.forEach(section => {
      // Remove sections from stack that are at same or deeper level
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      // If stack is empty, this is a top-level section
      if (stack.length === 0) {
        result.push(section);
      } else {
        // Add as child to the last section in stack
        stack[stack.length - 1].children.push(section);
      }

      stack.push(section);
    });

    return result;
  }

  private extractDescription(content: string): string {
    // Extract first sentence or first 150 characters
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length <= 150) {
      return firstSentence;
    }
    
    return content.substring(0, 150).trim() + (content.length > 150 ? '...' : '');
  }

  private generateLinkId(ref: CrossReference): string {
    return `${ref.source}-${ref.target}-${ref.type}`.replace(/[^a-zA-Z0-9-]/g, '-');
  }

  private isLinkResolvable(ref: CrossReference): boolean {
    return this.validateLink(ref.target, ref.type);
  }

  private resolveLinkHref(ref: CrossReference): string | undefined {
    if (!this.isLinkResolvable(ref)) {
      return undefined;
    }

    switch (ref.type) {
      case 'anchor':
        return ref.target;
      case 'internal':
        return this.resolveInternalLink(ref.target);
      case 'external':
        return ref.target;
      default:
        return undefined;
    }
  }

  private formatBreadcrumbTitle(segment: string): string {
    return segment
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private resolveRelativePath(target: string, basePath: string): string {
    // Simple relative path resolution
    const baseSegments = basePath.split('/').filter(s => s);
    const targetSegments = target.split('/').filter(s => s);

    targetSegments.forEach(segment => {
      if (segment === '..') {
        baseSegments.pop();
      } else if (segment !== '.') {
        baseSegments.push(segment);
      }
    });

    return '/' + baseSegments.join('/');
  }

  private routeExists(target: string): boolean {
    // Check if route exists in our route map
    return Object.keys(this.routeMap).includes(target) || 
           Object.keys(this.routeMap).some(route => route.includes(target));
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Utility functions for navigation
 */

/**
 * Generates anchor ID from heading text
 */
export function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Creates anchor link element attributes
 */
export function createAnchorLink(heading: { text: string; level: number }): AnchorLink {
  const anchor = generateAnchorId(heading.text);
  
  return {
    id: `anchor-${anchor}`,
    text: heading.text,
    href: `#${anchor}`,
    level: heading.level
  };
}

/**
 * Processes cross-references to resolve and validate links
 */
export function processCrossReferences(
  references: CrossReference[],
  navigationSystem: NavigationSystem
): ProcessedLink[] {
  return references.map(ref => ({
    id: `${ref.source}-${ref.target}`.replace(/[^a-zA-Z0-9-]/g, '-'),
    source: ref.source,
    target: ref.target,
    type: ref.type,
    text: ref.text,
    resolved: navigationSystem.validateLink(ref.target, ref.type),
    href: navigationSystem.resolveInternalLink(ref.target)
  }));
}

/**
 * Creates navigation context for React components
 */
export function createNavigationContext(
  currentPath: string,
  content: ParsedContent[]
): NavigationState {
  const navigationSystem = new NavigationSystem();
  
  // Build routes and links from content
  content.forEach(parsedContent => {
    navigationSystem.createSectionRoutes(parsedContent.sections);
    navigationSystem.buildCrossLinks(parsedContent.references);
  });

  return navigationSystem.getNavigationState(currentPath, content);
}