'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { initializePaddle } from '@/lib/paddle-client';
import { UpgradeButton } from '@/components/billing/upgrade-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Crown, Zap, Shield, Users } from 'lucide-react';
import Script from 'next/script';

interface BillingStatus {
    isPro: boolean;
    paddleCustomerId: string | null;
    subscription: any | null;
}

export default function BillingPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/signin');
                return;
            }
            setUser(user);
            await fetchBillingStatus();
        }
        loadUser();
    }, []);

    async function fetchBillingStatus() {
        try {
            const response = await fetch('/api/billing/status');
            if (response.ok) {
                const data = await response.json();
                setBillingStatus(data);
            }
        } catch (error) {
            console.error('Failed to fetch billing status:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const isPro = billingStatus?.isPro || false;

    return (
        <>
            {/* Load Paddle.js */}
            <Script
                src="https://cdn.paddle.com/paddle/v2/paddle.js"
                strategy="afterInteractive"
                onLoad={() => {
                    initializePaddle();
                }}
            />

            <div className="container max-w-6xl mx-auto py-12 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Billing & Subscription</h1>
                    <p className="text-muted-foreground">
                        Manage your JoinEdit subscription and billing
                    </p>
                </div>

                {/* Current Plan Status */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isPro ? (
                                <>
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                    Pro Plan
                                </>
                            ) : (
                                'Free Plan'
                            )}
                        </CardTitle>
                        <CardDescription>
                            {isPro
                                ? 'You have access to all Pro features'
                                : 'Upgrade to unlock unlimited projects and advanced features'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isPro ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="text-sm font-medium capitalize">
                                        {billingStatus?.subscription?.status || 'Active'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Plan</span>
                                    <span className="text-sm font-medium">Pro</span>
                                </div>
                                <Button variant="outline" className="w-full" disabled>
                                    Manage Subscription (Coming Soon)
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Currently on the Free plan with limited features
                                </p>
                                {user && (
                                    <UpgradeButton
                                        userEmail={user.email!}
                                        userId={user.id}
                                        size="lg"
                                        className="w-full"
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pricing Comparison */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Free Plan */}
                    <Card className={!isPro ? 'border-2 border-primary' : ''}>
                        <CardHeader>
                            <CardTitle>Free</CardTitle>
                            <CardDescription>Perfect for trying out JoinEdit</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span className="text-sm">1 project</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span className="text-sm">Up to 10 videos per project</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span className="text-sm">Unlimited comments</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span className="text-sm">Basic sharing</span>
                                </li>
                            </ul>
                            {!isPro && (
                                <Button variant="outline" className="w-full mt-6" disabled>
                                    Current Plan
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className={isPro ? 'border-2 border-yellow-500' : 'border-2 border-primary'}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                    Pro
                                </CardTitle>
                                {isPro && (
                                    <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                                        Active
                                    </span>
                                )}
                            </div>
                            <CardDescription>For professionals and teams</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$19</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <span className="text-sm font-medium">Unlimited projects</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <span className="text-sm font-medium">Unlimited videos</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <span className="text-sm font-medium">Password-protected projects</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <span className="text-sm font-medium">Custom branding</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Users className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <span className="text-sm font-medium">Version control</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <span className="text-sm font-medium">Export to PDF/CSV/SRT</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <span className="text-sm font-medium">Priority support</span>
                                </li>
                            </ul>
                            {!isPro && user && (
                                <UpgradeButton
                                    userEmail={user.email!}
                                    userId={user.id}
                                    size="lg"
                                    className="w-full mt-6"
                                />
                            )}
                            {isPro && (
                                <Button variant="outline" className="w-full mt-6" disabled>
                                    Current Plan
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
