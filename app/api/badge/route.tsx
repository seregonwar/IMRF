import { NextRequest, NextResponse } from 'next/server';
import { fetchGithubReleaseDownloads } from '@/lib/github-release-downloads';

export const runtime = 'edge';

function clampInteger(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    const rounded = Math.trunc(value);
    if (rounded < min) return min;
    if (rounded > max) return max;
    return rounded;
}

function parseCacheSeconds(raw: string | null, fallback: number): number {
    if (raw === null) return fallback;
    const parsed = Number(raw);
    return clampInteger(parsed, 60, 3600);
}

function isHexColor(raw: string): boolean {
    return /^[0-9a-fA-F]{6}$/.test(raw) || /^[0-9a-fA-F]{3}$/.test(raw);
}

function escapeXml(input: string): string {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function formatCompactInteger(value: number): string {
    if (!Number.isFinite(value) || value < 0) return '0';
    if (value < 1000) return String(Math.trunc(value));
    if (value < 1_000_000) return `${(value / 1000).toFixed(value < 10_000 ? 1 : 0)}k`;
    if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(value < 10_000_000 ? 1 : 0)}M`;
    return `${(value / 1_000_000_000).toFixed(value < 10_000_000_000 ? 1 : 0)}B`;
}

function renderBadgeSvg(labelRaw: string, statusRaw: string, colorRaw: string): string {
    const label = escapeXml(labelRaw);
    const status = escapeXml(statusRaw);

    const leftWidth = Math.max(50, labelRaw.length * 7 + 14);
    const rightWidth = Math.max(110, statusRaw.length * 7 + 14);
    const width = leftWidth + rightWidth;
    const leftCenter = leftWidth / 2;
    const rightCenter = leftWidth + rightWidth / 2;

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <mask id="a">
        <rect width="${width}" height="20" rx="3" fill="#fff"/>
      </mask>
      <g mask="url(#a)">
        <path fill="#555" d="M0 0h${leftWidth}v20H0z"/>
        <path fill="#${colorRaw}" d="M${leftWidth} 0h${rightWidth}v20H${leftWidth}z"/>
        <path fill="url(#b)" d="M0 0h${width}v20H0z"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="${leftCenter}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
        <text x="${leftCenter}" y="14">${label}</text>
        <text x="${rightCenter}" y="15" fill="#010101" fill-opacity=".3">${status}</text>
        <text x="${rightCenter}" y="14">${status}</text>
      </g>
    </svg>
  `;
}

function parseOwnerRepo(value: string): { owner: string; repo: string } | null {
    const trimmed = value.trim();
    const parts = trimmed.split('/');
    if (parts.length !== 2) return null;
    const [owner, repo] = parts;
    const ownerOk = owner.length > 0 && owner.length <= 100 && /^[A-Za-z0-9_.-]+$/.test(owner);
    const repoOk = repo.length > 0 && repo.length <= 100 && /^[A-Za-z0-9_.-]+$/.test(repo);
    if (!ownerOk || !repoOk) return null;
    return { owner, repo };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get('metric');

    const colorCandidate = searchParams.get('color') ?? '0070f3';
    const color = isHexColor(colorCandidate) ? colorCandidate : '0070f3';

    const githubParam = searchParams.get('github');
    const defaultRepoOwner = process.env.VERCEL_GIT_REPO_OWNER;
    const defaultRepoSlug = process.env.VERCEL_GIT_REPO_SLUG;
    const defaultRepo =
        defaultRepoOwner && defaultRepoSlug ? `${defaultRepoOwner}/${defaultRepoSlug}` : null;

    if (metric === 'release_downloads_total' || metric === 'release_downloads_latest') {
        const ownerRepo = parseOwnerRepo(githubParam ?? defaultRepo ?? '');
        const label = searchParams.get('label') || 'Downloads';
        const cacheSeconds = parseCacheSeconds(searchParams.get('cacheSeconds'), 300);

        if (ownerRepo === null) {
            const svg = renderBadgeSvg(label, 'n/a', color);
            return new NextResponse(svg, {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
                },
            });
        }

        const result = await fetchGithubReleaseDownloads({
            owner: ownerRepo.owner,
            repo: ownerRepo.repo,
            metric: metric === 'release_downloads_latest' ? 'latest' : 'total',
            token: process.env.GITHUB_TOKEN,
            maxPages: 10,
            perPage: 100,
        });

        const status = result.ok ? formatCompactInteger(result.downloads) : 'n/a';
        const svg = renderBadgeSvg(label, status, color);

        return new NextResponse(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
            },
        });
    }

    const label = searchParams.get('label') || 'IMRF';
    const status = searchParams.get('status') || 'Docs';
    const cacheSeconds = parseCacheSeconds(searchParams.get('cacheSeconds'), 3600);
    const svg = renderBadgeSvg(label, status, color);

    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
        },
    });
}
