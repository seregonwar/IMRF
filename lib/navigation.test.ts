import { NavigationSystem, generateAnchorId, createAnchorLink } from './navigation';
import { ParsedContent, ContentSection, CrossReference } from './markdown';

describe('NavigationSystem', () => {
  let navigationSystem: NavigationSystem;

  beforeEach(() => {
    navigationSystem = new NavigationSystem();
  });

  describe('generateTOC', () => {
    it('should generate table of contents from parsed content', () => {
      const mockSections: ContentSection[] = [
        {
          id: 'section-1',
          title: 'Introduction',
          content: 'This is the introduction',
          level: 1,
          children: [],
          metadata: {
            anchor: 'introduction',
            wordCount: 4,
            estimatedReadTime: 1
          }
        },
        {
          id: 'section-2',
          title: 'Getting Started',
          content: 'How to get started',
          level: 2,
          children: [],
          metadata: {
            anchor: 'getting-started',
            wordCount: 4,
            estimatedReadTime: 1
          }
        }
      ];

      const mockContent: ParsedContent[] = [{
        ast: {} as any,
        metadata: {},
        sections: mockSections,
        references: [],
        headings: []
      }];

      const toc = navigationSystem.generateTOC(mockContent);

      // Level 2 heading should be nested under level 1
      expect(toc.sections).toHaveLength(1);
      expect(toc.sections[0].title).toBe('Introduction');
      expect(toc.sections[0].children).toHaveLength(1);
      expect(toc.sections[0].children[0].title).toBe('Getting Started');
      expect(toc.anchors).toHaveLength(2);
      expect(toc.depth).toBe(2);
    });

    it('should build hierarchical structure correctly', () => {
      const mockSections: ContentSection[] = [
        {
          id: 'section-1',
          title: 'Chapter 1',
          content: 'Chapter content',
          level: 1,
          children: [],
          metadata: { anchor: 'chapter-1', wordCount: 2, estimatedReadTime: 1 }
        },
        {
          id: 'section-2',
          title: 'Section 1.1',
          content: 'Section content',
          level: 2,
          children: [],
          metadata: { anchor: 'section-1-1', wordCount: 2, estimatedReadTime: 1 }
        },
        {
          id: 'section-3',
          title: 'Section 1.2',
          content: 'Section content',
          level: 2,
          children: [],
          metadata: { anchor: 'section-1-2', wordCount: 2, estimatedReadTime: 1 }
        }
      ];

      const mockContent: ParsedContent[] = [{
        ast: {} as any,
        metadata: {},
        sections: mockSections,
        references: [],
        headings: []
      }];

      const toc = navigationSystem.generateTOC(mockContent);

      expect(toc.sections).toHaveLength(1); // Only one top-level section
      expect(toc.sections[0].children).toHaveLength(2); // Two child sections
      expect(toc.sections[0].children[0].title).toBe('Section 1.1');
      expect(toc.sections[0].children[1].title).toBe('Section 1.2');
    });
  });

  describe('buildCrossLinks', () => {
    it('should process cross-references correctly', () => {
      const mockReferences: CrossReference[] = [
        {
          source: 'page1.md',
          target: '#introduction',
          type: 'anchor',
          text: 'See introduction'
        },
        {
          source: 'page1.md',
          target: '/docs/guide',
          type: 'internal',
          text: 'User guide'
        },
        {
          source: 'page1.md',
          target: 'https://example.com',
          type: 'external',
          text: 'External link'
        }
      ];

      const linkMap = navigationSystem.buildCrossLinks(mockReferences);

      expect(linkMap['page1.md']).toBeDefined();
      expect(linkMap['page1.md'].outgoing).toHaveLength(3);
      
      const anchorLink = linkMap['page1.md'].outgoing.find(link => link.type === 'anchor');
      expect(anchorLink?.target).toBe('#introduction');
      expect(anchorLink?.resolved).toBe(true);
    });
  });

  describe('updateBreadcrumbs', () => {
    it('should generate breadcrumbs from path', () => {
      const breadcrumbs = navigationSystem.updateBreadcrumbs('/docs/guide/getting-started');

      expect(breadcrumbs.items).toHaveLength(2); // Documentation + Guide
      expect(breadcrumbs.current.title).toBe('Getting Started');
      expect(breadcrumbs.items[0].title).toBe('Documentation');
      expect(breadcrumbs.items[1].title).toBe('Guide');
    });

    it('should handle root path correctly', () => {
      const breadcrumbs = navigationSystem.updateBreadcrumbs('/docs');

      expect(breadcrumbs.items).toHaveLength(0);
      expect(breadcrumbs.current.title).toBe('Documentation');
    });
  });

  describe('validateLink', () => {
    it('should validate anchor links', () => {
      expect(navigationSystem.validateLink('#valid-anchor', 'anchor')).toBe(true);
      expect(navigationSystem.validateLink('#', 'anchor')).toBe(false);
      expect(navigationSystem.validateLink('invalid', 'anchor')).toBe(false);
    });

    it('should validate external links', () => {
      expect(navigationSystem.validateLink('https://example.com', 'external')).toBe(true);
      expect(navigationSystem.validateLink('http://example.com', 'external')).toBe(true);
      expect(navigationSystem.validateLink('invalid-url', 'external')).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  describe('generateAnchorId', () => {
    it('should generate valid anchor IDs', () => {
      expect(generateAnchorId('Hello World')).toBe('hello-world');
      expect(generateAnchorId('Getting Started!')).toBe('getting-started');
      expect(generateAnchorId('API Reference & Examples')).toBe('api-reference-examples');
    });

    it('should handle edge cases', () => {
      expect(generateAnchorId('')).toBe('');
      expect(generateAnchorId('   ')).toBe('');
      expect(generateAnchorId('123 Numbers')).toBe('123-numbers');
    });
  });

  describe('createAnchorLink', () => {
    it('should create anchor link objects', () => {
      const heading = { text: 'Introduction', level: 1 };
      const anchorLink = createAnchorLink(heading);

      expect(anchorLink.text).toBe('Introduction');
      expect(anchorLink.href).toBe('#introduction');
      expect(anchorLink.level).toBe(1);
      expect(anchorLink.id).toBe('anchor-introduction');
    });
  });
});