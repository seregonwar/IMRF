/**
 * Utility functions for anchor link generation and management
 */

/**
 * Generates a URL-safe anchor ID from text
 */
export function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates unique anchor IDs to avoid collisions
 */
export function generateUniqueAnchorId(text: string, existingIds: Set<string>): string {
  const baseId = generateAnchorId(text);
  let uniqueId = baseId;
  let counter = 1;

  while (existingIds.has(uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }

  existingIds.add(uniqueId);
  return uniqueId;
}

/**
 * Extracts anchor IDs from existing content to prevent duplicates
 */
export function extractExistingAnchorIds(content: string): Set<string> {
  const anchorIds = new Set<string>();
  
  // Match id attributes in HTML elements
  const idMatches = content.match(/id=["']([^"']+)["']/g);
  if (idMatches) {
    idMatches.forEach(match => {
      const id = match.match(/id=["']([^"']+)["']/)?.[1];
      if (id) {
        anchorIds.add(id);
      }
    });
  }

  // Match anchor links
  const anchorMatches = content.match(/#([a-zA-Z0-9-_]+)/g);
  if (anchorMatches) {
    anchorMatches.forEach(match => {
      const id = match.substring(1); // Remove the #
      anchorIds.add(id);
    });
  }

  return anchorIds;
}

/**
 * Adds anchor links to headings in HTML content
 */
export function addAnchorLinksToHeadings(html: string): string {
  const existingIds = extractExistingAnchorIds(html);
  
  return html.replace(
    /<(h[1-6])([^>]*)>([^<]+)<\/h[1-6]>/gi,
    (match, tag, attributes, content) => {
      // Check if heading already has an id
      const hasId = /id=["'][^"']*["']/.test(attributes);
      if (hasId) {
        return match; // Don't modify if already has id
      }

      const anchorId = generateUniqueAnchorId(content.trim(), existingIds);
      const anchorLink = `<a href="#${anchorId}" class="anchor-link" aria-hidden="true">#</a>`;
      
      return `<${tag}${attributes} id="${anchorId}">${content}${anchorLink}</${tag}>`;
    }
  );
}

/**
 * Creates a table of contents from heading elements
 */
export interface TOCHeading {
  id: string;
  text: string;
  level: number;
  children: TOCHeading[];
}

export function createTOCFromHeadings(headings: { level: number; text: string; slug: string }[]): TOCHeading[] {
  const toc: TOCHeading[] = [];
  const stack: TOCHeading[] = [];

  headings.forEach(heading => {
    const tocItem: TOCHeading = {
      id: heading.slug,
      text: heading.text,
      level: heading.level,
      children: []
    };

    // Remove items from stack that are at same or deeper level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    // Add to parent or root
    if (stack.length === 0) {
      toc.push(tocItem);
    } else {
      stack[stack.length - 1].children.push(tocItem);
    }

    stack.push(tocItem);
  });

  return toc;
}

/**
 * Validates anchor ID format
 */
export function isValidAnchorId(id: string): boolean {
  // Must start with letter, can contain letters, numbers, hyphens, underscores
  return /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(id);
}

/**
 * Sanitizes anchor ID to ensure it's valid
 */
export function sanitizeAnchorId(id: string): string {
  // Ensure it starts with a letter
  let sanitized = id.replace(/^[^a-zA-Z]+/, '');
  
  // If empty after removing non-letters, add a prefix
  if (!sanitized) {
    sanitized = 'heading';
  }
  
  // Replace invalid characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9-_]/g, '-');
  
  // Remove multiple consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-');
  
  // Remove trailing hyphens
  sanitized = sanitized.replace(/-+$/, '');
  
  return sanitized;
}

/**
 * Finds the closest heading element to a given position
 */
export function findClosestHeading(position: number, headings: { id: string; position: number }[]): string | null {
  let closest = null;
  let closestDistance = Infinity;

  headings.forEach(heading => {
    const distance = Math.abs(heading.position - position);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = heading.id;
    }
  });

  return closest;
}