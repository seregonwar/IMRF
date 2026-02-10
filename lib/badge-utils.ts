
// Genera il path SVG (Area Chart)
export function generateSparkline(data: number[], width: number, height: number) {
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
export function getTextWidth(text: string) {
  return text.length * 7 + 10; // 7px medio per carattere + padding
}
