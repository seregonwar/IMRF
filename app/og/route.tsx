import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'IMRF Documentation';

        // ?desc=<description>
        const hasDesc = searchParams.has('desc');
        const desc = hasDesc
            ? searchParams.get('desc')?.slice(0, 200)
            : 'Interactive Markdown Rendering Framework';

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
