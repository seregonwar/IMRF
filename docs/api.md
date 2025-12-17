---
title: API Reference
description: Complete API documentation for IMRF core functions and types
author: Seregonwar
date: "2024-12-17"
tags: [api, reference, documentation, typescript]
visibility: public
---

# API Reference

This document provides comprehensive API documentation for the Interactive Markdown Rendering Framework. All functions and types are implemented in `lib/markdown.ts` and related modules.

## Core Parsing Functions

### parseMarkdownContent()

Parses markdown content and generates AST with extracted sections and references.

```typescript
function parseMarkdownContent(content: string, filePath?: string): ParsedContent
```

**Parameters:**
- `content` (string): Raw markdown/MDX content to parse
- `filePath` (string, optional): File path for reference tracking

**Returns:** `ParsedContent` object containing:
- `ast`: Complete Abstract Syntax Tree
- `metadata`: Extracted frontmatter data
- `sections`: Hierarchical content sections
- `references`: Cross-references and links
- `headings`: Table of contents data

**Example:**
```typescript
const content = `---
title: Example Document
---
# Main Heading
Content here.`;

const parsed = parseMarkdownContent(content, 'example.md');
console.log(parsed.sections.length); // Number of sections
console.log(parsed.metadata.title); // "Example Document"
```

### validateFrontmatter()

Validates frontmatter metadata according to IMRF schema requirements.

```typescript
function validateFrontmatter(metadata: Record<string, any>): FrontMatterValidation
```

**Parameters:**
- `metadata` (Record<string, any>): Frontmatter object to validate

**Returns:** `FrontMatterValidation` object with:
- `isValid` (boolean): Whether validation passed
- `errors` (string[]): Critical validation errors
- `warnings` (string[]): Non-critical validation warnings

**Validation Rules:**
- **Required**: `title` (string)
- **Optional**: `description` (string), `author` (string), `date` (ISO date), `tags` (string[]), `visibility` ('public'|'private'|'draft')

### parseDirectory()

Processes a directory of markdown files and creates a content collection.

```typescript
function parseDirectory(dirPath: string): ContentCollection
```

**Parameters:**
- `dirPath` (string): Path to directory containing markdown files

**Returns:** `ContentCollection` with:
- `files` (Map<string, ParsedContent>): Parsed content by file path
- `crossReferences` (CrossReference[]): All cross-references found
- `globalMetadata` (Record<string, any>): Collection-wide metadata

## Content Processing Functions

### validateMarkdownSyntax()

Validates markdown syntax and structure for common issues.

```typescript
function validateMarkdownSyntax(content: string): ValidationResult
```

**Parameters:**
- `content` (string): Markdown content to validate

**Returns:** `ValidationResult` with validation status and messages.

**Detects:**
- Malformed links (missing URLs)
- Empty headings
- Syntax parsing errors

## Type Definitions

### ContentSection

Represents a hierarchical content section extracted from markdown.

```typescript
interface ContentSection {
  id: string;                    // Unique section identifier
  title: string;                 // Section heading text
  content: string;               // Section content (markdown)
  level: number;                 // Heading level (1-6)
  parent?: string;               // Parent section ID
  children: string[];            // Child section IDs
  metadata: SectionMetadata;     // Section-specific metadata
}
```

### SectionMetadata

Metadata automatically calculated for each content section.

```typescript
interface SectionMetadata {
  anchor: string;                // URL-safe anchor link
  wordCount: number;             // Total words in section
  estimatedReadTime: number;     // Reading time in minutes
  tags?: string[];               // Optional section tags
}
```

### CrossReference

Represents a link or reference between content pieces.

```typescript
interface CrossReference {
  source: string;                // Source file path
  target: string;                // Target URL or path
  type: 'internal' | 'external' | 'anchor';  // Reference type
  text: string;                  // Link text
  line?: number;                 // Optional line number
}
```

### ParsedContent

Complete parsed content structure with all extracted information.

```typescript
interface ParsedContent {
  ast: Root;                     // Markdown AST
  metadata: Record<string, any>; // Frontmatter data
  sections: ContentSection[];    // Content sections
  references: CrossReference[];  // Cross-references
  headings: HeadingInfo[];       // TOC headings
}
```

## Navigation System

### Automatic TOC Generation

The framework automatically generates table of contents from heading structure:

```typescript
// Headings are extracted during parsing
interface HeadingInfo {
  level: number;    // Heading depth (1-6)
  text: string;     // Heading text
  slug: string;     // URL-safe slug
}
```

### Cross-Reference Processing

Links are automatically categorized and processed:

- **Internal Links**: `./other-doc.md`, `/docs/api`
- **External Links**: `https://example.com`
- **Anchor Links**: `#section-heading`

## Error Handling

### Validation Errors vs Warnings

The framework distinguishes between critical errors and warnings:

**Errors** (prevent processing):
- Missing required frontmatter fields
- Malformed markdown syntax
- Invalid file structure

**Warnings** (allow processing with notifications):
- Invalid optional field types
- Missing recommended metadata
- Broken internal links

### Graceful Degradation

When components or parsing fails:
- Individual component failures don't crash the system
- Malformed content is logged but processing continues
- Fallback rendering maintains basic functionality

## Integration Examples

### Basic Document Processing

```typescript
import { parseMarkdownContent, validateFrontmatter } from '@/lib/markdown';

// Process a single document
const content = fs.readFileSync('docs/example.md', 'utf8');
const parsed = parseMarkdownContent(content, 'example.md');

// Validate frontmatter
const validation = validateFrontmatter(parsed.metadata);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Access parsed data
console.log(`Document has ${parsed.sections.length} sections`);
console.log(`Estimated reading time: ${parsed.sections.reduce((total, section) => 
  total + section.metadata.estimatedReadTime, 0)} minutes`);
```

### Directory Processing

```typescript
import { parseDirectory } from '@/lib/markdown';

// Process entire documentation directory
const collection = parseDirectory('./docs');

console.log(`Processed ${collection.files.size} files`);
console.log(`Found ${collection.crossReferences.length} cross-references`);

// Access individual files
for (const [filePath, content] of collection.files) {
  console.log(`${filePath}: ${content.sections.length} sections`);
}
```

## Performance Considerations

### Caching Strategy

The framework implements intelligent caching:
- AST generation results are cached per file
- Cross-reference maps are cached per collection
- Metadata validation results are memoized

### Memory Management

For large documentation sets:
- Streaming processing for directory parsing
- Lazy loading of content sections
- Automatic cleanup of unused AST nodes

## Related Documentation

- [Framework Overview](./index.md) - Introduction and core concepts
- [Interactive Components](./features.md) - Component system examples
- [Development Roadmap](./roadmap.md) - Technical architecture details