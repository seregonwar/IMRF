# Interactive Markdown Rendering Framework (IMRF)

![IMRF Banner](https://imrf.vercel.app/og?title=IMRF&desc=The%20Interactive%20Markdown%20Framework)

[![Status](https://imrf.vercel.app/api/badge?label=Status&status=Active&color=00ba55)](https://imrf.vercel.app/docs)
[![Docs](https://imrf.vercel.app/api/badge?label=Docs&status=Live&color=0070f3)](https://imrf.vercel.app/docs)
[![API](https://imrf.vercel.app/api/badge?label=API&status=Complete&color=purple)](https://imrf.vercel.app/docs/api)

**IMRF** transforms static Markdown into **interactive and navigable** web documentation. It keeps GitHub as the source of truth while enabling custom components, automatic navigation, and content validation.

> *"It's not a site generator. It's a **knowledge renderer**."*

---

## 🎯 What You Can Do With IMRF

### ✨ **Interactive Components in Markdown**

Write standard Markdown, but with superpowers:

```markdown
---
title: My Documentation
description: Rich and interactive content
tags: [guide, tutorial]
---

# Welcome

<Alert type="info">
This is an **interactive alert** with markdown and [links](./other-pages.md)!
</Alert>

<Card title="Key Features">
- ✅ React Components in Markdown
- ✅ Automatic Navigation
- ✅ Intelligent Cross-referencing
- ✅ Content Validation
</Card>

## Technical Section

The framework automatically generates:
- **TOC** from heading structure
- **URL-safe** anchor links
- **Cross-references** between documents
- **Reading stats** and word counts
```

### 🧭 **Automatic Navigation**

IMRF analyzes your files and creates:
- Recursive **Sidebar** from folder structure
- **Table of Contents** from document headings
- Intelligent **Cross-links** between pages
- **Breadcrumbs** for hierarchical navigation

### 🔍 **Advanced Parsing**

```typescript
// The framework automatically extracts:
const parsed = parseMarkdownContent(content);

console.log(parsed.sections);     // Hierarchical sections
console.log(parsed.references);   // Links and references
console.log(parsed.metadata);     // Validated frontmatter
console.log(parsed.headings);     // TOC data
```

## 🚀 Live Examples

**[📖 Complete Documentation →](https://imrf.vercel.app/docs)**  
**[🧩 Interactive Components →](https://imrf.vercel.app/docs/features)**  
**[📚 API Reference →](https://imrf.vercel.app/docs/api)**

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install unified remark-parse remark-gfm remark-frontmatter remark-mdx
npm install mdast-util-to-string unist-util-visit gray-matter

# 2. Create your components
# components/mdx-components.tsx
export function Alert({ type, children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

# 3. Write enhanced Markdown
# docs/example.md
```

```markdown
---
title: My Page
description: Interactive content
---

# Main Title

<Alert type="success">
This is a **React component** inside Markdown!
</Alert>

<Card title="Features">
- Automatic navigation
- Cross-referencing
- Content validation
</Card>
```

## 🛠 Tech Stack

- **Next.js 16** + App Router + Turbopack
- **Unified + Remark** for advanced parsing
- **TypeScript** full support
- **Tailwind CSS v4**

## 📁 Structure

```
docs/           # Your Markdown files
├── index.md    # Main page  
├── guide.md    # Guides and tutorials
└── api.md      # API Documentation

lib/markdown.ts # IMRF Parsing Engine
components/     # Custom components
```

---

**[🚀 Get Started Now](https://imrf.vercel.app/docs/getting-started)** • **[See Examples](https://imrf.vercel.app/docs/features)** • **[API Docs](https://imrf.vercel.app/docs/api)**