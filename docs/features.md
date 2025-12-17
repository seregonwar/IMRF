---
title: Interactive Components & Features
description: Comprehensive showcase of IMRF's custom MDX components and advanced features
author: Seregonwar
date: "2024-12-17"
tags: [components, mdx, features, examples]
visibility: public
---

# Interactive Components & Features

IMRF extends standard Markdown with powerful custom React components and advanced parsing capabilities. This document showcases the framework's interactive features and demonstrates how content can be enhanced beyond traditional Markdown limitations.

## Component System Overview

The IMRF component system provides:
- **Isolated Rendering**: Each component instance renders independently
- **Props Validation**: Automatic validation of component parameters
- **Declarative Syntax**: Clean, Markdown-native component declarations
- **Error Handling**: Graceful degradation when components fail

Learn more about the technical implementation in our [roadmap](./roadmap.md#custom-components--extended-markdown).

## Alert Components

Alerts provide contextual feedback and important information to users:

<Alert type="info">
**Information Alert**: This demonstrates how IMRF processes custom components with **markdown content** inside. The framework maintains full Markdown parsing within component boundaries.
</Alert>

<Alert type="warning">
**Warning Alert**: Components can contain complex content including [links](./index.md), lists, and formatting. This showcases the framework's ability to parse nested content structures.
</Alert>

<Alert type="error">
**Error Alert**: Critical information that requires immediate attention. The component registry ensures consistent styling across all alert types.
</Alert>

<Alert type="success">
**Success Alert**: Operation completed successfully! This demonstrates the framework's support for multiple component variants with different styling.
</Alert>

## Card Components

Cards group related content and provide structured information display:

<Card title="Framework Architecture">
IMRF follows a **stateless rendering** approach with clear separation between content and presentation:

- **Content Layer**: Markdown/MDX source files
- **Processing Layer**: AST generation and section extraction  
- **Rendering Layer**: Component-based web output
- **Navigation Layer**: Automatic TOC and cross-linking

See the [architectural overview](./roadmap.md#architectural-overview) for detailed information.
</Card>

<Card title="Development Phases">
The framework development follows a structured approach:

1. **Core Rendering Engine** - Basic parsing and rendering
2. **Navigation System** - TOC generation and routing
3. **Component Registry** - Custom component support
4. **GitHub Integration** - Platform compatibility
5. **Theming Engine** - Visual customization
6. **Tooling & CLI** - Developer experience

Track progress in our [roadmap](./roadmap.md#development-phases).
</Card>

## Advanced Code Examples

### TypeScript Integration

```typescript
// IMRF Content Processing Example
import { parseMarkdownContent, validateFrontmatter } from '@/lib/markdown';

interface DocumentProcessor {
  parseContent(content: string): ParsedContent;
  validateMetadata(frontmatter: Record<string, any>): ValidationResult;
  extractSections(ast: Root): ContentSection[];
}

class IMRFProcessor implements DocumentProcessor {
  parseContent(content: string): ParsedContent {
    return parseMarkdownContent(content);
  }
  
  validateMetadata(frontmatter: Record<string, any>): ValidationResult {
    return validateFrontmatter(frontmatter);
  }
  
  extractSections(ast: Root): ContentSection[] {
    // Implementation details in lib/markdown.ts
    return extractContentSections(ast, '');
  }
}
```

### Component Definition Example

```jsx
// Custom Alert Component Implementation
export function Alert({ type, children }) {
  const alertStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };
  
  return (
    <div className={`border-l-4 p-4 ${alertStyles[type]}`}>
      {children}
    </div>
  );
}
```

## Cross-Reference Examples

The framework automatically detects and processes various link types:

- **Internal Links**: [Back to introduction](./index.md)
- **Anchor Links**: [Jump to alerts](#alert-components)
- **External Links**: [Next.js Documentation](https://nextjs.org/docs)
- **Relative Links**: [Project roadmap](./roadmap.md)

## Metadata Processing

This document demonstrates advanced frontmatter usage:
- **Title**: Descriptive page title for navigation
- **Description**: SEO-friendly page description
- **Tags**: Categorization for content organization
- **Author**: Content attribution
- **Date**: Last modified timestamp
- **Visibility**: Content access control

## Framework Capabilities Showcase

### Automatic Section Extraction
The framework automatically extracts content sections based on heading hierarchy, enabling:
- Dynamic table of contents generation
- Section-based navigation
- Cross-document linking
- Content organization

### Intelligent Parsing
Advanced parsing capabilities include:
- **AST Generation**: Complete abstract syntax tree creation
- **Metadata Validation**: Frontmatter schema validation
- **Reference Detection**: Automatic link and reference extraction
- **Content Analysis**: Word count and reading time calculation

### Navigation Enhancement
Enhanced navigation features:
- **Hierarchical Structure**: Parent-child section relationships
- **Anchor Generation**: URL-safe anchor creation
- **Breadcrumb Support**: Navigation context preservation
- **Cross-Linking**: Intelligent inter-document references

## Next Steps

Explore more framework capabilities:
- Review the [complete roadmap](./roadmap.md) for technical details
- Understand the [framework philosophy](./index.md#framework-philosophy)
- Learn about [GitHub integration](./roadmap.md#github-integration-layer)
