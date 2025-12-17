---
title: Getting Started Guide
description: Quick start guide for implementing and using IMRF in your projects
author: Seregonwar
date: "2024-12-17"
tags: [getting-started, tutorial, setup, quickstart]
visibility: public
---

# Getting Started with IMRF

This guide will help you quickly set up and start using the Interactive Markdown Rendering Framework in your project. IMRF transforms your static Markdown documentation into an interactive, navigable web experience.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- Basic knowledge of **Markdown** and **React**
- A **Next.js** project (or willingness to create one)

## Quick Setup

### 1. Install Dependencies

IMRF requires several packages for advanced markdown processing:

```bash
npm install unified remark-parse remark-gfm remark-frontmatter remark-mdx
npm install mdast-util-to-string unist-util-visit gray-matter
```

### 2. Create Documentation Structure

Set up your documentation directory:

```
your-project/
├── docs/
│   ├── index.md          # Main documentation entry
│   ├── features.md       # Feature documentation
│   ├── api.md           # API reference
│   └── getting-started.md # This guide
├── lib/
│   └── markdown.ts      # IMRF core functions
└── components/
    └── mdx-components.tsx # Custom components
```

### 3. Configure Frontmatter

Every documentation file should include proper frontmatter:

```yaml
---
title: Your Page Title
description: Brief description for SEO and navigation
author: Your Name
date: 2024-12-17
tags: [relevant, tags, here]
visibility: public
---
```

## Basic Usage

### Processing Markdown Content

```typescript
import { parseMarkdownContent, validateFrontmatter } from '@/lib/markdown';

// Read and process a markdown file
const content = `---
title: Example Document
description: A sample document
---

# Main Heading

This is example content with [a link](./other-doc.md).

## Sub Heading

More content here.`;

// Parse the content
const parsed = parseMarkdownContent(content, 'example.md');

// Access parsed data
console.log(parsed.metadata.title);        // "Example Document"
console.log(parsed.sections.length);       // Number of sections
console.log(parsed.references.length);     // Number of links found
console.log(parsed.headings);             // Table of contents data
```

### Validating Frontmatter

```typescript
// Validate document metadata
const validation = validateFrontmatter(parsed.metadata);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Validation warnings:', validation.warnings);
}
```

### Processing Multiple Files

```typescript
import { parseDirectory } from '@/lib/markdown';

// Process entire documentation directory
const collection = parseDirectory('./docs');

// Access collection data
console.log(`Total files: ${collection.files.size}`);
console.log(`Cross-references: ${collection.crossReferences.length}`);

// Iterate through files
for (const [filePath, content] of collection.files) {
  console.log(`${filePath}:`);
  console.log(`  - Sections: ${content.sections.length}`);
  console.log(`  - Word count: ${content.sections.reduce(
    (total, section) => total + section.metadata.wordCount, 0
  )}`);
}
```

## Creating Custom Components

### 1. Define Components

Create custom MDX components in `components/mdx-components.tsx`:

```tsx
// Alert Component
export function Alert({ type, children }: { 
  type: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };
  
  return (
    <div className={`border-l-4 p-4 rounded ${styles[type]}`}>
      {children}
    </div>
  );
}

// Card Component
export function Card({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="prose prose-sm">{children}</div>
    </div>
  );
}
```

### 2. Use Components in Markdown

```markdown
# Your Document

<Alert type="info">
This is an informational alert with **markdown** content inside.
</Alert>

<Card title="Feature Highlight">
This card contains:
- Markdown lists
- **Bold text**
- [Links](./other-doc.md)
</Card>
```

## Navigation Features

### Automatic Table of Contents

IMRF automatically generates navigation from your heading structure:

```markdown
# Main Title           # Level 1 - appears in main navigation
## Section A           # Level 2 - appears in TOC
### Subsection A.1     # Level 3 - appears in detailed TOC
## Section B           # Level 2 - appears in TOC
```

### Cross-Reference Linking

The framework automatically detects and processes different link types:

```markdown
<!-- Internal links (processed automatically) -->
[API Reference](./api.md)
[Getting Started](./getting-started.md#quick-setup)

<!-- Anchor links (within same document) -->
[Jump to setup](#quick-setup)

<!-- External links (processed but not modified) -->
[Next.js Docs](https://nextjs.org/docs)
```

### Breadcrumb Navigation

Enable breadcrumb navigation by structuring your content hierarchically:

```
docs/
├── index.md              # Home
├── guides/
│   ├── getting-started.md # Home > Guides > Getting Started
│   └── advanced.md        # Home > Guides > Advanced
└── api/
    ├── core.md           # Home > API > Core
    └── components.md     # Home > API > Components
```

## Content Organization Best Practices

### 1. Frontmatter Standards

Always include complete frontmatter:

```yaml
---
title: Descriptive Page Title
description: SEO-friendly description (150-160 characters)
author: Author Name or Team
date: 2024-12-17
tags: [category, feature, type]
visibility: public  # or 'private' or 'draft'
---
```

### 2. Heading Hierarchy

Use consistent heading levels:

```markdown
# Document Title (H1) - Only one per document
## Major Sections (H2) - Main content divisions
### Subsections (H3) - Detailed breakdowns
#### Details (H4) - Specific points
```

### 3. Cross-Reference Strategy

Create meaningful connections between documents:

```markdown
<!-- Reference related concepts -->
Learn more about [component architecture](./api.md#component-system).

<!-- Link to specific sections -->
See the [validation rules](./api.md#validation-errors-vs-warnings) for details.

<!-- Create content flows -->
Next: [Advanced Features](./advanced.md)
Previous: [Installation](./installation.md)
```

## Advanced Features

### Section Metadata

Each content section automatically includes:

```typescript
interface SectionMetadata {
  anchor: string;           // URL-safe anchor (e.g., "quick-setup")
  wordCount: number;        // Total words in section
  estimatedReadTime: number; // Reading time in minutes (200 WPM)
  tags?: string[];          // Optional section-specific tags
}
```

### Content Validation

The framework provides comprehensive validation:

```typescript
// Syntax validation
const syntaxResult = validateMarkdownSyntax(content);
if (!syntaxResult.isValid) {
  console.error('Syntax errors:', syntaxResult.errors);
}

// Frontmatter validation
const frontmatterResult = validateFrontmatter(metadata);
if (frontmatterResult.warnings.length > 0) {
  console.warn('Recommendations:', frontmatterResult.warnings);
}
```

### Performance Optimization

For large documentation sets:

- **Lazy Loading**: Load sections on demand
- **Caching**: Cache parsed AST results
- **Streaming**: Process large directories incrementally

## Troubleshooting

### Common Issues

**Frontmatter Validation Errors:**
```
Missing or invalid "title" field in frontmatter
```
*Solution*: Ensure every document has a `title` field in frontmatter.

**Broken Internal Links:**
```
Possible broken link: ./missing-doc.md
```
*Solution*: Verify all internal links point to existing files.

**Component Rendering Issues:**
```
Component 'Alert' not found in registry
```
*Solution*: Ensure custom components are properly exported in `mdx-components.tsx`.

### Debug Mode

Enable detailed logging during development:

```typescript
// Add to your parsing code
const parsed = parseMarkdownContent(content, filePath);
console.log('Parsed sections:', parsed.sections.map(s => s.title));
console.log('Found references:', parsed.references.length);
console.log('Validation result:', validateFrontmatter(parsed.metadata));
```

## Next Steps

Now that you have IMRF set up:

1. **Explore Examples**: Review the [interactive components](./features.md) showcase
2. **API Deep Dive**: Study the [complete API reference](./api.md)
3. **Architecture**: Understand the [technical roadmap](./roadmap.md)
4. **Contribute**: Help improve the framework based on your experience

## Getting Help

- **Documentation Issues**: Check the [API reference](./api.md) for detailed function signatures
- **Component Problems**: Review [component examples](./features.md) for proper usage
- **Architecture Questions**: Consult the [project roadmap](./roadmap.md) for technical details

Welcome to the IMRF community! Start building better documentation experiences today.