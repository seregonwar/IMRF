import { NextRequest, NextResponse } from 'next/server';
import { generateSparkline, getTextWidth } from '@/lib/badge-utils';

export const runtime = 'edge'; // Massima velocità

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pkg = searchParams.get('package');
  // Opzioni: 'monthly' (default) mostra grafico 30gg. 
  // 'weekly' mostra 7gg.
  const period = searchParams.get('period') || 'monthly'; 
  const color = searchParams.get('color') || '#0070f3'; // Blu Vercel default
  const showTrend = searchParams.get('trend') === 'true'; // Se true, colora in base al trend

  if (!pkg) {
    return new NextResponse('<svg>Error</svg>', { status: 400 });
  }

  try {
    // 1. Fetch Dati NPM (Range)
    // last-month ci dà i dati giornalieri
    const endpoint = `https://api.npmjs.org/downloads/range/last-month/${pkg}`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    
    if (!res.ok) throw new Error('Package not found');
    const data = await res.json();
    
    // Filtriamo i dati se richiesto 'weekly'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let downloads = data.downloads.map((d: any) => d.downloads);
    if (period === 'weekly') {
      downloads = downloads.slice(-7);
    }

    // 2. Calcoli Statistici
    const totalDownloads = downloads.reduce((a: number, b: number) => a + b, 0);
    
    // Formattazione numero (es. 1.2M)
    const formattedCount = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(totalDownloads);

    // Calcolo Trend (Ultima metà vs Prima metà)
    let trendColor = color;
    if (showTrend) {
      const mid = Math.floor(downloads.length / 2);
      const firstHalf = downloads.slice(0, mid).reduce((a:number, b:number)=>a+b, 0);
      const secondHalf = downloads.slice(mid).reduce((a:number, b:number)=>a+b, 0);
      // Verde se sale, Rosso se scende, Grigio se stabile
      trendColor = secondHalf >= firstHalf ? '#10b981' : '#ef4444'; 
    }

    // 3. Setup Dimensioni SVG
    const label = 'downloads';
    const labelWidth = getTextWidth(label);
    const valueWidth = getTextWidth(formattedCount) + 10; // Spazio extra per il grafico
    const totalWidth = labelWidth + valueWidth;
    const height = 20;

    // Genera la Sparkline (Area Chart)
    // La disegniamo solo nella parte destra del badge
    const sparklinePath = generateSparkline(downloads, valueWidth, height);

    // 4. Costruzione SVG Manuale
    // Usiamo una struttura a "badge piatto"
    const svg = `
      <svg width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg">
        <linearGradient id="g" x2="0" y2="100%">
          <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
          <stop offset="1" stop-color="#000" stop-opacity=".1"/>
        </linearGradient>
        
        <clipPath id="r">
          <rect width="${totalWidth}" height="${height}" rx="3" fill="#fff"/>
        </clipPath>

        <g clip-path="url(#r)">
          <rect width="${labelWidth}" height="${height}" fill="#555"/>
          
          <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${trendColor}"/>
          
          <g transform="translate(${labelWidth}, 0)">
             <path d="${sparklinePath}" fill="#000" fill-opacity="0.2" stroke="none" />
             </g>

          <rect width="${totalWidth}" height="${height}" fill="url(#g)"/>
        </g>

        <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
          <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
          <text x="${labelWidth / 2}" y="14">${label}</text>
          
          <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${formattedCount}</text>
          <text x="${labelWidth + valueWidth / 2}" y="14">${formattedCount}</text>
        </g>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=3600',
      },
    });

  } catch (e) {
    return new NextResponse('<svg width="100" height="20"><text y="15">Error</text></svg>', { status: 500 });
  }
}
