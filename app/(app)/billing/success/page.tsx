'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function BillingSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Optional: Refresh billing status after successful payment
        const timer = setTimeout(() => {
            window.location.href = '/dashboard';
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to Pro! 🎉</CardTitle>
                    <CardDescription>
                        Your payment was successful and your account has been upgraded
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You now have access to all Pro features including:
                    </p>
                    <ul className="text-sm text-left space-y-2 max-w-md mx-auto">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Unlimited projects and videos
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Password-protected projects
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Custom branding
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Export to PDF/CSV/SRT
                        </li>
                    </ul>
                    <div className="pt-4 space-y-2">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/billing">View Billing</Link>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                        Redirecting to dashboard in 5 seconds...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
