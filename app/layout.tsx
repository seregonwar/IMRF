import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | IMRF',
    default: 'IMRF Documentation',
  },
  description: "Interactive Markdown Rendering Framework",
  openGraph: {
    title: 'IMRF Documentation',
    description: 'Interactive Markdown Rendering Framework',
    siteName: 'IMRF',
    url: 'https://imrf-docs.vercel.app', // Placeholder
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IMRF Documentation',
    description: 'Interactive Markdown Rendering Framework',
    images: ['/og'],
  },
};

import { getSidebarStructure } from "@/lib/markdown";
import { Sidebar } from "@/components/sidebar";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebarItems = getSidebarStructure();

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <div className="flex min-h-screen">
          <aside className="w-64 border-r bg-gray-50 dark:bg-gray-900 hidden md:block p-4 sticky top-0 h-screen overflow-y-auto">
            <h2 className="font-bold text-lg mb-4 px-2">Documentation</h2>
            <Sidebar items={sidebarItems} />
          </aside>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

