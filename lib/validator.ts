import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getDocSlugs } from './markdown';

export type ValidationError = {
    file: string;
    type: 'error' | 'warning';
    message: string;
    line?: number;
};

const DOCS_DIRECTORY = path.join(process.cwd(), 'docs');

export async function validateDocs(): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const slugs = getDocSlugs();
    const validSlugs = new Set(['/docs', ...slugs.map(s => `/docs/${s.slug.join('/')}`)]);

    // 1. Scan all files
    for (const { slug } of slugs) {
        const slugPath = slug.join('/');
        const filePath = findFilePath(slugPath);
        if (!filePath) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);

        // Check missing Frontmatter
        if (!data.title) {
            errors.push({
                file: slugPath,
                type: 'error',
                message: 'Missing "title" in frontmatter',
            });
        }

        // Check Internal Links
        const linkRegex = /\[.*?\]\((.*?)\)/g;
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
            const href = match[1];

            // Ignore external, anchors only, and assets
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('/images')) continue;

            // Normalize internal link
            const target = href.replace(/#.*$/, ''); // strip anchor
            const normalizedTarget = target.startsWith('/') ? target : path.join('/docs', slug.slice(0, -1).join('/'), target); // naive resolve

            // Very basic check - complex relative path resolution would need a real Resolver
            // For MVP, we just warn if it looks like a doc link but isn't in our valid set
            // Trying to match against known slugs

            // This part is tricky without a full URL resolver, but let's try a simple heuristic
            // IF it starts with /docs/ verify it exists
            if (normalizedTarget.startsWith('/docs') && !validSlugs.has(normalizedTarget)) {
                // Try checking if it resolves to a file on disk? 
                // For now, let's just log it if we can't find it in our validSlugs list
                // Note: this might flag correct relative links if my normalization above is too simple.
                // Let's improve:
                errors.push({
                    file: slugPath,
                    type: 'warning',
                    message: `Possible broken link: ${href} (resolved to ${normalizedTarget})`,
                });
            }
        }
    }

    return errors;
}

function findFilePath(slugPath: string): string | null {
    const mdPath = path.join(DOCS_DIRECTORY, `${slugPath}.md`);
    const mdxPath = path.join(DOCS_DIRECTORY, `${slugPath}.mdx`);
    if (fs.existsSync(mdPath)) return mdPath;
    if (fs.existsSync(mdxPath)) return mdxPath;
    return null;
}
