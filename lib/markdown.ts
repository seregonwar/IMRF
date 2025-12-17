import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_DIRECTORY = path.join(process.cwd(), 'docs');

export type DocParams = {
    slug: string[];
};

export type DocContent = {
    slug: string;
    frontmatter: Record<string, any>;
    content: string;
    headings: { level: number; text: string; slug: string }[];
};

export type SidebarItem = {
    title: string;
    slug?: string;
    children?: SidebarItem[];
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

    // Simple regex for headers (level 2 and 3)
    const headings: { level: number; text: string; slug: string }[] = [];
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2];
        const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        headings.push({ level, text, slug });
    }

    return {
        slug: realSlug,
        frontmatter: data,
        content,
        headings,
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
