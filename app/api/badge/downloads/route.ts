import { NextRequest, NextResponse } from 'next/server';
import { generateSparkline, getTextWidth } from '@/lib/badge-utils';

export const runtime = 'edge'; // Massima velocità

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'npm';
  const pkg = searchParams.get('package');
  
  // Opzioni comuni
  const period = searchParams.get('period') || 'monthly'; 
  const color = searchParams.get('color') || '#0070f3'; // Blu Vercel default
  const showTrend = searchParams.get('trend') === 'true'; // Se true, colora in base al trend

  try {
    let totalDownloads = 0;
    let downloads: number[] = [];

    if (source === 'github') {
      const user = searchParams.get('user');
      const repo = searchParams.get('repo');

      if (!user || !repo) {
        throw new Error('Missing user or repo params for GitHub source');
      }

      // Fetch GitHub Releases
      const endpoint = `https://api.github.com/repos/${user}/${repo}/releases`;
      const headers: HeadersInit = {
        'User-Agent': 'IMRF-Badge-Generator'
      };
      
      // Use token if available to avoid rate limits
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const res = await fetch(endpoint, { 
        headers,
        next: { revalidate: 3600 } 
      });

      if (!res.ok) throw new Error('GitHub Repo not found');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const releases = await res.json();
      
      // Sum all assets download counts from all releases
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalDownloads = releases.reduce((acc: number, release: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assetsCount = release.assets.reduce((a: number, asset: any) => a + asset.download_count, 0);
        return acc + assetsCount;
      }, 0);

      // GitHub API doesn't give daily history easily, so no sparkline data
      downloads = []; 

    } else {
      // Default: NPM
      if (!pkg) {
        return new NextResponse('<svg>Error</svg>', { status: 400 });
      }

      // Fetch Dati NPM (Range)
      // last-month ci dà i dati giornalieri
      const endpoint = `https://api.npmjs.org/downloads/range/last-month/${pkg}`;
      const res = await fetch(endpoint, { next: { revalidate: 3600 } });
      
      if (!res.ok) throw new Error('Package not found');
      const data = await res.json();
      
      // Filtriamo i dati se richiesto 'weekly'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      downloads = data.downloads.map((d: any) => d.downloads);
      if (period === 'weekly') {
        downloads = downloads.slice(-7);
      }

      // Calcoli Statistici
      totalDownloads = downloads.reduce((a: number, b: number) => a + b, 0);
    }
    
    // Formattazione numero (es. 1.2M)
    const formattedCount = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(totalDownloads);

    // Calcolo Trend (Solo se abbiamo dati storici, quindi NPM)
    let trendColor = color;
    if (showTrend && downloads.length > 1) {
      const mid = Math.floor(downloads.length / 2);
      const firstHalf = downloads.slice(0, mid).reduce((a:number, b:number)=>a+b, 0);
      const secondHalf = downloads.slice(mid).reduce((a:number, b:number)=>a+b, 0);
      // Verde se sale, Rosso se scende
      trendColor = secondHalf >= firstHalf ? '#10b981' : '#ef4444'; 
    }

    // 3. Setup Dimensioni SVG
    const label = 'downloads';
    const labelWidth = getTextWidth(label);
    const valueWidth = getTextWidth(formattedCount) + 10; // Spazio extra per il grafico
    const totalWidth = labelWidth + valueWidth;
    const height = 20;

    // Genera la Sparkline (Area Chart)
    // Se downloads è vuoto (GitHub), ritorna stringa vuota
    const sparklinePath = generateSparkline(downloads, valueWidth, height);

    // 4. Costruzione SVG Manuale
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
             ${sparklinePath ? `<path d="${sparklinePath}" fill="#000" fill-opacity="0.2" stroke="none" />` : ''}
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
    console.error(e);
    return new NextResponse('<svg width="100" height="20"><text x="10" y="15" font-family="sans-serif" font-size="11">Error</text></svg>', { status: 500 });
  }
}
