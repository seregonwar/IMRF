import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import type { Root, Heading, Text, Link } from 'mdast';
import { globalComponentRenderer, ComponentRenderResult } from './component-renderer';
import { ComponentDefinition } from './component-registry';

const DOCS_DIRECTORY = path.join(process.cwd(), 'docs');

export type DocParams = {
    slug: string[];
};

export type ContentSection = {
    id: string;
    title: string;
    content: string;
    level: number;
    parent?: string;
    children: string[];
    metadata: SectionMetadata;
};

export type SectionMetadata = {
    anchor: string;
    wordCount: number;
    estimatedReadTime: number;
    tags?: string[];
};

export type CrossReference = {
    source: string;
    target: string;
    type: 'internal' | 'external' | 'anchor';
    text: string;
    line?: number;
};

export type FrontMatterValidation = {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};

export type ParsedContent = {
    ast: Root;
    metadata: Record<string, any>;
    sections: ContentSection[];
    references: CrossReference[];
    headings: { level: number; text: string; slug: string }[];
    components?: ComponentDefinition[];
    componentRenderResult?: ComponentRenderResult;
};

export type ContentCollection = {
    files: Map<string, ParsedContent>;
    crossReferences: CrossReference[];
    globalMetadata: Record<string, any>;
};

export type DocContent = {
    slug: string;
    frontmatter: Record<string, any>;
    content: string;
    headings: { level: number; text: string; slug: string }[];
    parsedContent?: ParsedContent;
};

export type SidebarItem = {
    title: string;
    slug?: string;
    children?: SidebarItem[];
};

export type ValidationResult = {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};

export function getSidebarStructure(): SidebarItem[] {
    if (!fs.existsSync(DOCS_DIRECTORY)) return [];
    return buildSidebarTree(DOCS_DIRECTORY);
}

function buildSidebarTree(dir: string, cleanName = ''): SidebarItem[] {
    const items: SidebarItem[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const children = buildSidebarTree(fullPath, entry.name);
            if (children.length > 0) {
                items.push({
                    title: cleanTitle(entry.name),
                    children,
                });
            }
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents);
            const relativePath = path.relative(DOCS_DIRECTORY, fullPath);
            const slug = relativePath.replace(/\.mdx?$/, '');

            // Skip index files if they are handled as the parent folder link (optional strategy)
            // For now, list them.

            items.push({
                title: data.title || cleanTitle(entry.name.replace(/\.mdx?$/, '')),
                slug: `/docs/${slug === 'index' ? '' : slug}`,
            });
        }
    }

    // Sort: index first, then directories, then files alfabethically, or by frontmatter 'weight' if we add it later.
    // For MVP: Simple alphabetical sort, but ensuring index is top.
    return items.sort((a, b) => {
        if (a.slug === '/docs/') return -1;
        if (b.slug === '/docs/') return 1;
        return a.title.localeCompare(b.title);
    });
}

function cleanTitle(filename: string): string {
    return filename.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function getDocSlugs(): DocParams[] {
    if (!fs.existsSync(DOCS_DIRECTORY)) return [];

    const filePaths = getAllFiles(DOCS_DIRECTORY);

    return filePaths.map((filePath) => {
        const relativePath = path.relative(DOCS_DIRECTORY, filePath);
        const slug = relativePath
            .replace(/\.mdx?$/, '')
            .split(path.sep);
        return { slug };
    });
}


export function getDocBySlug(slug: string[]): DocContent {
    const realSlug = slug.join('/');
    const fullPath = findFile(realSlug);

    if (!fullPath) {
        throw new Error(`Doc not found for slug: ${realSlug}`);
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Use new advanced parsing capabilities
    const parsedContent = parseMarkdownContent(fileContents, fullPath);
    
    // Validate frontmatter
    const validation = validateFrontmatter(data);
    if (!validation.isValid) {
        console.warn(`Frontmatter validation errors in ${realSlug}:`, validation.errors);
    }
    if (validation.warnings.length > 0) {
        console.warn(`Frontmatter validation warnings in ${realSlug}:`, validation.warnings);
    }

    return {
        slug: realSlug,
        frontmatter: data,
        content,
        headings: parsedContent.headings,
        parsedContent
    };
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.md') || file.endsWith('.mdx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function findFile(slugPath: string): string | null {
    const mdPath = path.join(DOCS_DIRECTORY, `${slugPath}.md`);
    const mdxPath = path.join(DOCS_DIRECTORY, `${slugPath}.mdx`);

    // Handle index files if needed later (e.g. slug/index.md)

    if (fs.existsSync(mdPath)) return mdPath;
    if (fs.existsSync(mdxPath)) return mdxPath;

    return null;
}

// Advanced parsing capabilities

/**
 * Creates a unified processor for parsing Markdown/MDX content
 */
function createMarkdownProcessor() {
    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkFrontmatter, ['yaml', 'toml'])
        .use(remarkMdx);
}

/**
 * Parses markdown content and generates AST with extracted sections and references
 */
export function parseMarkdownContent(content: string, filePath?: string): ParsedContent {
    const { data: metadata, content: markdownContent } = matter(content);
    
    // Process custom components first
    const componentRenderResult = globalComponentRenderer.renderComponents(markdownContent);
    const processedContent = componentRenderResult.content;
    
    const processor = createMarkdownProcessor();
    const ast = processor.parse(processedContent) as Root;
    
    const sections = extractContentSections(ast, filePath || '');
    const references = extractCrossReferences(ast, filePath || '');
    const headings = extractHeadings(ast);
    const components = globalComponentRenderer.extractComponentDefinitions(markdownContent);
    
    return {
        ast,
        metadata,
        sections,
        references,
        headings,
        components,
        componentRenderResult
    };
}

/**
 * Extracts content sections from AST based on heading structure
 */
function extractContentSections(ast: Root, filePath: string): ContentSection[] {
    const sections: ContentSection[] = [];
    const headingStack: { level: number; section: ContentSection }[] = [];
    let currentContent: any[] = [];
    let sectionCounter = 0;

    visit(ast, (node, index, parent) => {
        if (node.type === 'heading') {
            const heading = node as Heading;
            
            // Process previous section if exists
            if (headingStack.length > 0 || currentContent.length > 0) {
                const currentSection = headingStack[headingStack.length - 1]?.section;
                if (currentSection) {
                    currentSection.content = toString({ type: 'root', children: currentContent });
                }
            }
            
            // Create new section
            const title = toString(heading);
            const anchor = generateAnchor(title);
            const level = heading.depth;
            
            const section: ContentSection = {
                id: `section-${++sectionCounter}`,
                title,
                content: '',
                level,
                children: [],
                metadata: {
                    anchor,
                    wordCount: 0,
                    estimatedReadTime: 0,
                    tags: []
                }
            };
            
            // Handle hierarchy
            while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
                headingStack.pop();
            }
            
            if (headingStack.length > 0) {
                const parent = headingStack[headingStack.length - 1].section;
                section.parent = parent.id;
                parent.children.push(section.id);
            }
            
            headingStack.push({ level, section });
            sections.push(section);
            currentContent = [];
        } else {
            currentContent.push(node);
        }
    });
    
    // Process final section
    if (headingStack.length > 0) {
        const finalSection = headingStack[headingStack.length - 1].section;
        finalSection.content = toString({ type: 'root', children: currentContent });
    }
    
    // Calculate metadata for each section
    sections.forEach(section => {
        const wordCount = section.content.split(/\s+/).filter(word => word.length > 0).length;
        section.metadata.wordCount = wordCount;
        section.metadata.estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute
    });
    
    return sections;
}

/**
 * Extracts cross-references (links) from the AST
 */
function extractCrossReferences(ast: Root, filePath: string): CrossReference[] {
    const references: CrossReference[] = [];
    
    visit(ast, 'link', (node: Link) => {
        const url = node.url;
        const text = toString(node);
        
        let type: CrossReference['type'] = 'external';
        if (url.startsWith('#')) {
            type = 'anchor';
        } else if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            type = 'internal';
        }
        
        references.push({
            source: filePath,
            target: url,
            type,
            text
        });
    });
    
    return references;
}

/**
 * Extracts headings from AST for table of contents
 */
function extractHeadings(ast: Root): { level: number; text: string; slug: string }[] {
    const headings: { level: number; text: string; slug: string }[] = [];
    
    visit(ast, 'heading', (node: Heading) => {
        const text = toString(node);
        const slug = generateAnchor(text);
        
        headings.push({
            level: node.depth,
            text,
            slug
        });
    });
    
    return headings;
}

/**
 * Generates URL-safe anchor from heading text
 */
function generateAnchor(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Enhanced anchor generation with collision detection
 */
export function generateUniqueAnchor(text: string, existingAnchors: Set<string> = new Set()): string {
    let baseAnchor = generateAnchor(text);
    let anchor = baseAnchor;
    let counter = 1;
    
    while (existingAnchors.has(anchor)) {
        anchor = `${baseAnchor}-${counter}`;
        counter++;
    }
    
    existingAnchors.add(anchor);
    return anchor;
}

/**
 * Validates frontmatter metadata according to schema
 */
export function validateFrontmatter(metadata: Record<string, any>): FrontMatterValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields validation
    if (!metadata.title || typeof metadata.title !== 'string') {
        errors.push('Missing or invalid "title" field in frontmatter');
    }
    
    // Optional field type validation
    if (metadata.description && typeof metadata.description !== 'string') {
        warnings.push('Description should be a string');
    }
    
    if (metadata.author && typeof metadata.author !== 'string') {
        warnings.push('Author should be a string');
    }
    
    if (metadata.date && !isValidDate(metadata.date)) {
        warnings.push('Date should be in valid ISO format (YYYY-MM-DD)');
    }
    
    if (metadata.tags && !Array.isArray(metadata.tags)) {
        warnings.push('Tags should be an array of strings');
    } else if (metadata.tags && !metadata.tags.every((tag: any) => typeof tag === 'string')) {
        warnings.push('All tags should be strings');
    }
    
    if (metadata.visibility && !['public', 'private', 'draft'].includes(metadata.visibility)) {
        warnings.push('Visibility should be one of: public, private, draft');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validates date string format
 */
function isValidDate(dateString: any): boolean {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Processes a directory of markdown files and creates a content collection
 */
export function parseDirectory(dirPath: string): ContentCollection {
    const collection: ContentCollection = {
        files: new Map(),
        crossReferences: [],
        globalMetadata: {}
    };
    
    if (!fs.existsSync(dirPath)) {
        return collection;
    }
    
    const filePaths = getAllFiles(dirPath);
    
    filePaths.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(dirPath, filePath);
            const parsedContent = parseMarkdownContent(content, relativePath);
            
            collection.files.set(relativePath, parsedContent);
            collection.crossReferences.push(...parsedContent.references);
        } catch (error) {
            console.warn(`Failed to parse file ${filePath}:`, error);
        }
    });
    
    // Process global metadata (could include site-wide configuration)
    collection.globalMetadata = {
        totalFiles: collection.files.size,
        lastUpdated: new Date().toISOString(),
        totalSections: Array.from(collection.files.values())
            .reduce((total, parsed) => total + parsed.sections.length, 0)
    };
    
    return collection;
}

/**
 * Validates markdown syntax and structure
 */
export function validateMarkdownSyntax(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
        const processor = createMarkdownProcessor();
        const ast = processor.parse(content);
        
        // Check for common syntax issues
        visit(ast, (node) => {
            // Check for malformed links
            if (node.type === 'link' && !(node as Link).url) {
                errors.push('Found link without URL');
            }
            
            // Check for empty headings
            if (node.type === 'heading' && toString(node).trim() === '') {
                warnings.push('Found empty heading');
            }
        });
        
        // Validate custom components
        const componentValidation = globalComponentRenderer.validateComponents(content);
        errors.push(...componentValidation.errors);
        warnings.push(...componentValidation.warnings);
        
    } catch (error) {
        errors.push(`Syntax error: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
