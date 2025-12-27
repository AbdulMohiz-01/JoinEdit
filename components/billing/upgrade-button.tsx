'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { openProCheckout, initializePaddle, isPaddleReady } from '@/lib/paddle-client';
import { toast } from 'sonner';

interface UpgradeButtonProps {
    userEmail: string;
    userId: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export function UpgradeButton({
    userEmail,
    userId,
    variant = 'default',
    size = 'default',
    className
}: UpgradeButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);

        try {
            // Initialize Paddle if not already done
            if (!isPaddleReady()) {
                // Wait a bit for Paddle.js to load
                await new Promise(resolve => setTimeout(resolve, 1000));
                initializePaddle();
            }

            // Check if Paddle is ready
            if (!isPaddleReady()) {
                toast.error('Payment system not ready. Please refresh the page.');
                setIsLoading(false);
                return;
            }

            // Open checkout
            openProCheckout(userEmail, userId);

        } catch (error) {
            console.error('Upgrade error:', error);
            toast.error('Failed to open checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            variant={variant}
            size={size}
            className={className}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                </>
            )}
        </Button>
    );
}
