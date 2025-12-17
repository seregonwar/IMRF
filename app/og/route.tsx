import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'default'; // 'default' | 'alert' | 'card'

        // Common styles
        const flexCenter = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent', // Transparent background for components to blend? OG images usually need solid. Let's use white.
            padding: '40px',
        };

        if (mode === 'alert') {
            const type = searchParams.get('type') || 'info';
            const text = searchParams.get('text') || 'Alert content';

            const styles: Record<string, any> = {
                info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }, // blue-50, blue-200, blue-800
                warning: { bg: '#fefce8', border: '#fde047', text: '#854d0e' }, // yellow-50, yellow-200, yellow-800
                error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' }, // red-50, red-200, red-800
                success: { bg: '#f0fdf4', border: '#bcf0da', text: '#166534' }, // green-50, green-200, green-800
            };

            const style = styles[type] || styles.info;

            return new ImageResponse(
                (
                    <div style={{ ...flexCenter, backgroundColor: 'white' }}>
                        <div style={{
                            display: 'flex',
                            padding: '24px',
                            width: '100%',
                            borderRadius: '8px',
                            backgroundColor: style.bg,
                            border: `2px solid ${style.border}`,
                            color: style.text,
                            fontSize: 24,
                            fontFamily: 'sans-serif',
                        }}>
                            {text}
                        </div>
                    </div>
                ),
                { width: 800, height: 200 } // Smaller size for component strips
            );
        }

        if (mode === 'card') {
            const title = searchParams.get('title') || 'Card Title';
            const text = searchParams.get('text') || 'Card content...';

            return new ImageResponse(
                (
                    <div style={{ ...flexCenter, backgroundColor: 'white' }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '32px',
                            width: '100%',
                            borderRadius: '12px',
                            backgroundColor: 'white',
                            border: '2px solid #e5e7eb', // gray-200
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontFamily: 'sans-serif',
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: '12px', color: '#111' }}>{title}</div>
                            <div style={{ fontSize: 20, color: '#374151' }}>{text}</div>
                        </div>
                    </div>
                ),
                { width: 800, height: 300 }
            );
        }

        // Default OG Card
        const title = searchParams.get('title')?.slice(0, 100) || 'IMRF Documentation';
        const desc = searchParams.get('desc')?.slice(0, 200) || 'Interactive Markdown Rendering Framework';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            padding: '40px 80px',
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            border: '1px solid #eee',
                            textAlign: 'center',
                        }}
                    >
                        <h1
                            style={{
                                fontSize: 60,
                                fontWeight: 'bold',
                                background: 'linear-gradient(to right, #0070f3, #00c6ff)',
                                backgroundClip: 'text',
                                color: 'transparent',
                                marginBottom: 20,
                            }}
                        >
                            {title}
                        </h1>
                        <p
                            style={{
                                fontSize: 30,
                                color: '#666',
                                maxWidth: 800,
                            }}
                        >
                            {desc}
                        </p>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
