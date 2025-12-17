import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const label = searchParams.get('label') || 'IMRF';
    const status = searchParams.get('status') || 'Docs';
    const color = searchParams.get('color') || '0070f3';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="20">
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <mask id="a">
        <rect width="160" height="20" rx="3" fill="#fff"/>
      </mask>
      <g mask="url(#a)">
        <path fill="#555" d="M0 0h50v20H0z"/>
        <path fill="#${color}" d="M50 0h110v20H50z"/>
        <path fill="url(#b)" d="M0 0h160v20H0z"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="25" y="15" fill="#010101" fill-opacity=".3">${label}</text>
        <text x="25" y="14">${label}</text>
        <text x="104" y="15" fill="#010101" fill-opacity=".3">${status}</text>
        <text x="104" y="14">${status}</text>
      </g>
    </svg>
  `;

    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
