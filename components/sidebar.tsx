'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarItem } from '@/lib/markdown';

export function Sidebar({ items }: { items: SidebarItem[] }) {
    const pathname = usePathname();

    return (
        <nav className="space-y-1">
            {items.map((item, index) => (
                <SidebarNode key={index} item={item} pathname={pathname} />
            ))}
        </nav>
    );
}

function SidebarNode({ item, pathname }: { item: SidebarItem; pathname: string }) {
    const isActive = item.slug === pathname || (item.slug === '/docs' && pathname === '/docs/'); // Handle trailing slash

    if (item.children) {
        return (
            <div className="pl-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 py-1 px-2">
                    {item.title}
                </h3>
                <div className="border-l border-gray-200 dark:border-gray-800 ml-2 pl-2">
                    {item.children.map((child, idx) => (
                        <SidebarNode key={idx} item={child} pathname={pathname} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Link
            href={item.slug || '#'}
            className={`block px-2 py-1 text-sm rounded-md transition-colors ${isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
        >
            {item.title}
        </Link>
    );
}
