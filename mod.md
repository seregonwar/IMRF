
L'obiettivo è creare un **"Trend Badge"**: non solo un numero statico, ma un badge che mostra l'andamento dei download nell'ultimo mese con uno **sparkline (mini grafico)** integrato nello sfondo. È una feature che *Shields.io* standard non offre nativamente in questo modo.

Ecco l'architettura della modifica.

### 1. La Logica (Il "Cervello")

Dobbiamo fare tre cose nella funzione serverless:

1. **Chiamare l'API NPM `range**` (non `point`) per ottenere i dati giorno per giorno.
2. **Calcolare il path SVG** per disegnare la linea del grafico.
3. **Calcolare il Trend** (i download stanno salendo o scendendo?) per colorare il badge dinamicamente (verde/rosso) se l'utente lo desidera.

### 2. Il Codice

Crea (o aggiorna) il file `app/api/badge/downloads/route.ts`. Useremo TypeScript nativo per generare l'SVG senza librerie pesanti, così rimane velocissimo.

#### A. Utility per il Grafico (puoi metterlo nello stesso file o in `lib/badge-utils.ts`)

Questa funzione trasforma un array di numeri in comandi SVG (`M 0 10 L 5 2...`).

```typescript
// Genera il path SVG (Area Chart)
function generateSparkline(data: number[], width: number, height: number) {
  if (data.length < 2) return '';

  const max = Math.max(...data);
  const min = 0; // Partiamo da 0 per mostrare il volume reale
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  // Costruiamo la linea superiore
  const points = data.map((val, i) => {
    const x = i * stepX;
    // Invertiamo Y perché in SVG 0 è in alto
    const y = height - ((val - min) / range) * height; 
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  // Chiudiamo il path per creare l'area riempita (fill)
  const pathData = `
    M ${points[0]} 
    L ${points.join(' L ')} 
    L ${width},${height} 
    L 0,${height} 
    Z
  `;
  
  return pathData;
}

// Stima larghezza testo (approssimazione font Verdana 11px)
function getTextWidth(text: string) {
  return text.length * 7 + 10; // 7px medio per carattere + padding
}

```

#### B. La Route Handler Completa (`app/api/badge/downloads/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

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

```

### 3. Come usarlo (Showcase)

Ecco come presentarlo nel tuo README aggiornato di IMRF. Copia questo markdown:

```markdown
## 📈 Live Analytics

Monitor your project health with **IMRF Sparkline Badges**.
These aren't static images; they visualize the last 30 days of data directly from the registry.

| Badge Type | Preview | Code |
| :--- | :--- | :--- |
| **Standard** <br> *(Monthly)* | ![React Downloads](https://imrf.vercel.app/api/badge/downloads?package=react) | `?package=react` |
| **Trend Aware** <br> *(Auto Green/Red)* | ![Trend](https://imrf.vercel.app/api/badge/downloads?package=jquery&trend=true) | `?package=jquery&trend=true` |
| **Custom Color** <br> *(Brand Identity)* | ![Custom](https://imrf.vercel.app/api/badge/downloads?package=vue&color=8A2BE2) | `?package=vue&color=8A2BE2` |
| **Weekly** <br> *(Short Term)* | ![Weekly](https://imrf.vercel.app/api/badge/downloads?package=next&period=weekly&color=black) | `?package=next&period=weekly` |

```

### Perché questa soluzione è "Fighissima" (Technical Selling Points)

1. **Sparkline Integrata:** La maggior parte dei badge generator (anche shields.io) usa servizi esterni o grafici separati per le sparkline. Qui l'hai "ingannata" disegnando il grafico come un livello semitrasparente (`fill-opacity="0.2"`) *sopra* il colore di sfondo del badge. Risultato: un effetto "texture" molto moderno e pulito.
2. **Zero Dipendenze Pesanti:** Non stiamo usando `canvas` o librerie di chart enormi. È pura matematica vettoriale + stringhe. Veloce ed economico in termini di memoria serverless.
3. **Trend Awareness:** L'opzione `trend=true` dà un valore semantico immediato. Se vedo un badge rosso, so che i download stanno calando senza dover leggere i numeri.

