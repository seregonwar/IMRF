'use client';

import { usePathname } from 'next/navigation';

type Heading = {
    level: number;
    text: string;
    slug: string;
};

export function TableOfContents({ headings }: { headings: Heading[] }) {
    if (!headings || headings.length === 0) return null;

    return (
        <nav className="w-64 pl-8 py-4 sticky top-0 h-screen overflow-y-auto hidden xl:block border-l border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-4">On This Page</h3>
            <ul className="space-y-2 text-sm">
                {headings.map((heading, index) => (
                    <li key={`${heading.slug}-${index}`}
                        className={heading.level === 3 ? 'pl-4' : ''}>
                        <a
                            href={`#${heading.slug}`}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
