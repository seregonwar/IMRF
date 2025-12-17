# Interactive Markdown Rendering Framework (IMRF)

![IMRF Banner](https://imrf.vercel.app/og?title=IMRF&desc=The%20Interactive%20Markdown%20Framework)

[![Status](https://imrf.vercel.app/api/badge?label=Status&status=Active&color=00ba55)](https://imrf.vercel.app/docs)
[![Docs](https://imrf.vercel.app/api/badge?label=Docs&status=Live&color=0070f3)](https://imrf.vercel.app/docs)
[![API](https://imrf.vercel.app/api/badge?label=API&status=Complete&color=purple)](https://imrf.vercel.app/docs/api)
[![License](https://imrf.vercel.app/api/badge?label=License&status=MIT&color=black)](https://github.com/marcofranchi/IMRF)

**IMRF** is a next-generation framework that transforms static Markdown content into **interactive, modular, and highly customizable web documentation**. It addresses the fragmentation of Markdown files in modern repositories by providing a unified rendering system that maintains GitHub compatibility while enabling advanced navigation, interactivity, and customization features.

> *"Non è un generatore di siti. È un **renderer di conoscenza**."*  
> *"It's not a site generator. It's a **knowledge renderer**."*

---

## 🚀 Live Documentation & Examples

**[📖 Complete Documentation →](https://imrf.vercel.app/docs)**  
**[🎯 Getting Started Guide →](https://imrf.vercel.app/docs/getting-started)**  
**[🧩 Interactive Components →](https://imrf.vercel.app/docs/features)**  
**[⚡ Advanced Usage →](https://imrf.vercel.app/docs/advanced-usage)**  
**[📚 API Reference →](https://imrf.vercel.app/docs/api)**

---

## ✨ Framework Capabilities

### 🔍 **Advanced Content Processing**
- **AST Generation**: Complete Abstract Syntax Tree creation with `unified` and `remark`
- **Section Extraction**: Hierarchical content sections with parent-child relationships
- **Metadata Processing**: Comprehensive frontmatter validation and schema enforcement
- **Cross-Reference Detection**: Automatic link analysis and validation
- **Content Analytics**: Word count, reading time estimation, and content statistics

### 🧭 **Intelligent Navigation System**
- **Automatic TOC**: Dynamic table of contents from heading hierarchy
- **Smart Routing**: Section-based navigation with URL-safe anchors
- **Cross-Document Linking**: Intelligent inter-document reference resolution
- **Breadcrumb Support**: Hierarchical navigation context preservation
- **Deep Linking**: GitHub-compatible deep links to specific content sections

### 🎨 **Custom Component System**
- **React Integration**: Full MDX support with custom React components
- **Component Registry**: Isolated component rendering with props validation
- **Nested Composition**: Complex component nesting and content composition
- **Declarative Syntax**: Clean, Markdown-native component declarations
- **Error Handling**: Graceful degradation when components fail

### 🔗 **GitHub Integration Layer**
- **Dynamic Badges**: Server-generated SVG status badges
- **README Evolution**: Transform static README into intelligent documentation gateway
- **Platform Compatibility**: Works within GitHub's rendering limitations
- **Deep Link Resolution**: Resolve GitHub links to specific documentation sections
- **Non-Invasive**: Maintains repository compatibility while adding functionality

### 🎯 **Content Quality & Validation**
- **Schema Validation**: Frontmatter validation with detailed error reporting
- **Syntax Checking**: Markdown/MDX syntax validation and error detection
- **Link Validation**: Broken link detection and cross-reference verification
- **Content Standards**: Enforce documentation quality and consistency
- **Debug Dashboard**: Built-in tools for content validation and analysis

## 🛠 Technical Architecture

### **Core Technologies**
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- **Content Processing**: `unified`, `remark-parse`, `remark-gfm`, `remark-mdx`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- **Type Safety**: Full TypeScript integration with comprehensive type definitions
- **Testing**: Jest with property-based testing support

### **Advanced Parsing Stack**
```typescript
// Core parsing capabilities
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';

// Content analysis and extraction
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import matter from 'gray-matter';
```

### **Performance Features**
- **Stateless Architecture**: Scalable, platform-agnostic rendering
- **Intelligent Caching**: AST caching with proper invalidation
- **Streaming Processing**: Handle large documentation sets efficiently
- **Memory Management**: Optimized for large-scale documentation processing

## 📦 Framework Architecture

```bash
├── app/
│   ├── api/badge/           # Dynamic SVG badge generation
│   ├── debug/               # Content validation dashboard
│   ├── docs/[[...slug]]/    # Dynamic documentation routing
│   └── og/                  # Open Graph image generation
├── components/
│   ├── ui/                  # Custom MDX components (Alert, Card)
│   ├── navigation/          # Navigation components (TOC, Breadcrumbs)
│   └── mdx-components.tsx   # Component registry
├── docs/                    # Documentation source files
│   ├── index.md            # Framework introduction
│   ├── getting-started.md  # Implementation guide
│   ├── features.md         # Interactive component showcase
│   ├── api.md              # Complete API reference
│   ├── advanced-usage.md   # Advanced patterns & best practices
│   └── roadmap.md          # Technical roadmap & architecture
└── lib/
    ├── markdown.ts         # Core parsing & processing engine
    ├── navigation.ts       # Navigation system utilities
    ├── validator.ts        # Content validation tools
    └── anchor-utils.ts     # URL-safe anchor generation
```

## 🎯 Real-World Examples

### **Content Processing in Action**
```typescript
import { parseMarkdownContent, validateFrontmatter } from '@/lib/markdown';

// Process any Markdown/MDX content
const content = `---
title: Advanced Guide
description: Deep dive into IMRF capabilities
tags: [advanced, tutorial, components]
---

# Advanced Usage

<Alert type="info">
This alert contains **markdown** and [links](./api.md)!
</Alert>

## Section with Code

\`\`\`typescript
const result = parseMarkdownContent(content);
\`\`\`
`;

const parsed = parseMarkdownContent(content, 'guide.md');

// Access rich parsed data
console.log(parsed.sections.length);        // Hierarchical sections
console.log(parsed.references.length);      // Cross-references found
console.log(parsed.metadata.title);         // Validated frontmatter
console.log(parsed.headings);              // TOC data
```

### **Component System Example**
```markdown
<!-- Rich, nested component composition -->
<Alert type="warning">
  **Complex Content**: This alert demonstrates IMRF's advanced parsing:
  
  <Card title="Nested Component">
    - Components can contain other components
    - **Markdown formatting** is preserved
    - [Cross-references](./api.md#component-system) work seamlessly
    - Code blocks maintain syntax highlighting
    
    ```typescript
    // Even code inside nested components!
    const framework = new IMRF();
    ```
  </Card>
</Alert>
```

### **Navigation & Cross-Referencing**
```markdown
<!-- Automatic cross-reference detection and processing -->
Learn about [core concepts](./getting-started.md#core-concepts)
Explore [advanced patterns](./advanced-usage.md#content-architecture-patterns)
Reference the [complete API](./api.md#parsemarkdowncontent)

<!-- Anchor links with automatic generation -->
Jump to [component examples](#component-system-example)
```

## � RQuick Start

### **1. Installation**
```bash
npm install unified remark-parse remark-gfm remark-frontmatter remark-mdx
npm install mdast-util-to-string unist-util-visit gray-matter
```

### **2. Basic Usage**
```typescript
import { parseMarkdownContent } from '@/lib/markdown';

// Transform any Markdown into rich, structured data
const content = fs.readFileSync('docs/example.md', 'utf8');
const parsed = parseMarkdownContent(content, 'example.md');

// Access parsed structure
console.log(`${parsed.sections.length} sections found`);
console.log(`${parsed.references.length} cross-references detected`);
console.log(`Estimated reading time: ${parsed.sections.reduce(
  (total, section) => total + section.metadata.estimatedReadTime, 0
)} minutes`);
```

### **3. Create Interactive Components**
```tsx
// components/mdx-components.tsx
export function Alert({ type, children }) {
  return (
    <div className={`alert alert-${type}`}>
      {children}
    </div>
  );
}

export function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

### **4. Enhanced Documentation**
```markdown
---
title: Your Documentation
description: Rich, interactive content
tags: [guide, tutorial]
---

# Your Content

<Alert type="info">
Interactive components work seamlessly with **markdown formatting** 
and [cross-references](./other-doc.md)!
</Alert>

<Card title="Feature Highlight">
- Automatic TOC generation
- Cross-document linking
- Component composition
- Content validation
</Card>
```

## 🎯 Framework Benefits

### **For Content Creators**
- ✅ **Reduced Maintenance**: Fewer separate Markdown files to manage
- ✅ **Rich Interactivity**: Custom components beyond standard Markdown
- ✅ **Automatic Navigation**: TOC and cross-links generated automatically
- ✅ **Content Validation**: Built-in quality assurance and error detection
- ✅ **GitHub Compatibility**: Works within platform limitations

### **For Developers**
- ✅ **Type Safety**: Full TypeScript integration with comprehensive types
- ✅ **Performance**: Stateless architecture with intelligent caching
- ✅ **Extensibility**: Plugin-ready architecture for future enhancements
- ✅ **Testing**: Property-based testing support for content validation
- ✅ **Scalability**: Handle large documentation sets efficiently

### **For Organizations**
- ✅ **Consistency**: Enforce documentation standards and quality
- ✅ **Discoverability**: Intelligent cross-referencing and navigation
- ✅ **Maintainability**: Centralized content processing and validation
- ✅ **Integration**: Seamless CI/CD and deployment workflows
- ✅ **Analytics**: Content metrics and reading time estimation

## 🚦 Development Roadmap

### **✅ Completed Phases**
- **Phase 1**: Core Rendering Engine - Advanced AST processing and content extraction
- **Phase 2**: Navigation System - Automatic TOC, cross-linking, and routing
- **Phase 3**: Component System - Custom React components with MDX integration
- **Phase 4**: GitHub Integration - Dynamic badges, deep linking, platform compatibility

### **🚧 In Progress**
- **Phase 5**: Theming & Personalization - Advanced styling and customization
- **Phase 6**: Tooling & CLI - Developer experience and automation tools

### **🔮 Future Vision**
- Plugin system for extensibility
- Multi-repository documentation aggregation
- Live content embeds (API schemas, interactive demos)
- Advanced analytics and content insights

## 📊 Framework Statistics

- **📁 6 Documentation Files**: Comprehensive, interconnected content
- **🔗 50+ Cross-References**: Intelligent inter-document linking
- **🧩 Multiple Components**: Alert, Card, and extensible component system
- **⚡ 100% Type Safe**: Complete TypeScript coverage
- **✅ 16 Tests Passing**: Comprehensive test suite with property-based testing
- **📈 Performance Optimized**: Stateless architecture with caching

## 🤝 Contributing & Community

IMRF is designed to evolve with the community. Whether you're:
- **Content Creators** looking for better documentation tools
- **Developers** interested in advanced Markdown processing
- **Organizations** needing scalable documentation solutions

Your feedback and contributions help shape the future of knowledge rendering.

## 📚 Learn More

- **[📖 Complete Documentation](https://imrf.vercel.app/docs)** - Comprehensive framework guide
- **[🎯 Getting Started](https://imrf.vercel.app/docs/getting-started)** - Quick implementation tutorial
- **[🧩 Component Examples](https://imrf.vercel.app/docs/features)** - Interactive component showcase
- **[⚡ Advanced Usage](https://imrf.vercel.app/docs/advanced-usage)** - Complex patterns and best practices
- **[📚 API Reference](https://imrf.vercel.app/docs/api)** - Complete technical documentation
- **[🗺️ Technical Roadmap](https://imrf.vercel.app/docs/roadmap)** - Architecture and development phases

---

**IMRF** - *Transforming static Markdown into interactive knowledge experiences*  
*Generated by IMRF - [imrf.vercel.app](https://imrf.vercel.app)*
