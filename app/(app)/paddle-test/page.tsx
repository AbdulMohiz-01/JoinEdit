'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initializePaddle, isPaddleReady } from '@/lib/paddle-client';
import Script from 'next/script';

export default function PaddleTestPage() {
    const [config, setConfig] = useState<any>({});
    const [paddleReady, setPaddleReady] = useState(false);

    useEffect(() => {
        setConfig({
            environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
            clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
            priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
        });
    }, []);

    const checkPaddle = () => {
        setPaddleReady(isPaddleReady());
        if (isPaddleReady()) {
            console.log('✅ Paddle is ready!');
            console.log('Paddle object:', window.Paddle);
        } else {
            console.log('❌ Paddle not ready');
        }
    };

    return (
        <>
            <Script
                src="https://cdn.paddle.com/paddle/v2/paddle.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log('Paddle.js script loaded');
                    initializePaddle();
                    checkPaddle();
                }}
            />

            <div className="container max-w-4xl mx-auto py-12 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Paddle Configuration Test</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Environment Variables:</h3>
                            <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
                                <div>
                                    <span className="text-muted-foreground">Environment:</span>{' '}
                                    <span className={config.environment ? 'text-green-500' : 'text-red-500'}>
                                        {config.environment || '❌ NOT SET'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Client Token:</span>{' '}
                                    <span className={config.clientToken ? 'text-green-500' : 'text-red-500'}>
                                        {config.clientToken ? `${config.clientToken.substring(0, 20)}...` : '❌ NOT SET'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Price ID:</span>{' '}
                                    <span className={config.priceId ? 'text-green-500' : 'text-red-500'}>
                                        {config.priceId || '❌ NOT SET'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Paddle.js Status:</h3>
                            <div className="bg-muted p-4 rounded-lg">
                                <span className={paddleReady ? 'text-green-500' : 'text-red-500'}>
                                    {paddleReady ? '✅ Paddle.js Loaded' : '❌ Paddle.js Not Loaded'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={checkPaddle}>
                                Check Paddle Status
                            </Button>

                            <Button
                                onClick={() => {
                                    if (!window.Paddle) {
                                        alert('Paddle not loaded!');
                                        return;
                                    }

                                    console.log('🧪 Testing checkout with Price ID:', config.priceId);

                                    try {
                                        window.Paddle.Checkout.open({
                                            items: [{ priceId: config.priceId, quantity: 1 }],
                                            customer: { email: 'test@example.com' }
                                        });
                                    } catch (error) {
                                        console.error('❌ Checkout error:', error);
                                        alert('Error: ' + error);
                                    }
                                }}
                                variant="default"
                            >
                                Test Checkout
                            </Button>
                        </div>

                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm">
                                <strong>Instructions:</strong>
                            </p>
                            <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
                                <li>Check that all environment variables show green checkmarks</li>
                                <li>Verify Paddle.js status shows as loaded</li>
                                <li>Open browser console (F12) for detailed logs</li>
                                <li>If any are red, update your .env file and restart the dev server</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
