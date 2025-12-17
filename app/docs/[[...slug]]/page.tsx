import { getDocBySlug, getDocSlugs } from '@/lib/markdown';
import { TableOfContents } from '@/components/table-of-contents';
import { EnhancedNavigation } from '@/components/navigation';
import { components } from '@/components/mdx-components';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

export async function generateStaticParams() {
    const slugs = getDocSlugs();
    return slugs;
}

export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
    const { slug } = await params;
    const slugArray = slug || ['index'];

    try {
        const doc = getDocBySlug(slugArray);
        const title = doc.frontmatter.title;
        const desc = doc.frontmatter.description || 'IMRF Documentation';

        const ogUrl = new URL('https://imrf-docs.vercel.app/og'); // Should use Env var in real app
        ogUrl.searchParams.set('title', title);
        ogUrl.searchParams.set('desc', desc);

        return {
            title,
            description: desc,
            openGraph: {
                title,
                description: desc,
                images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description: desc,
                images: [ogUrl.toString()],
            },
        };
    } catch (e) {
        return {
            title: 'Not Found',
            description: 'The page you are looking for does not exist.',
        };
    }
}

export default async function DocPage({
    params,
}: {
    params: { slug?: string[] };
}) {
    const { slug } = await params;
    const slugArray = slug || ['index'];

    let doc;
    try {
        doc = getDocBySlug(slugArray);
    } catch (e) {
        notFound();
    }



    // Prepare content for navigation system
    const navigationContent = doc.parsedContent ? [doc.parsedContent] : [];

    return (
        <EnhancedNavigation 
            content={navigationContent}
            showBreadcrumbs={true}
            showTOC={true}
            showCrossReferences={true}
        >
            <article className="prose dark:prose-invert max-w-none p-8">
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-4xl font-bold">{doc.frontmatter.title}</h1>
                    {doc.frontmatter.description && (
                        <p className="text-xl text-gray-500 mt-2">{doc.frontmatter.description}</p>
                    )}
                </header>
                <div className="mdx-content">
                    <MDXRemote source={doc.content} components={components} />
                </div>
            </article>
        </EnhancedNavigation>
    );
}
