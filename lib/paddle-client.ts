/**
 * Paddle.js Client Utilities
 * Handles Paddle initialization and checkout operations
 */

// Extend Window interface to include Paddle
declare global {
    interface Window {
        Paddle?: any;
    }
}

/**
 * Initialize Paddle.js with environment and token
 * Call this once when the app loads (e.g., in layout or billing page)
 */
export const initializePaddle = () => {
    if (typeof window === 'undefined') return;

    if (!window.Paddle) {
        console.warn('Paddle.js not loaded yet');
        return;
    }

    // Set environment (sandbox or production)
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    window.Paddle.Environment.set(environment);

    // Initialize with client-side token
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) {
        console.error('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not set');
        return;
    }

    window.Paddle.Initialize({
        token,
        eventCallback: (event: any) => {
            // Log all Paddle events with details
            console.log('🎯 Paddle event:', event.name || event.type);
            console.log('📄 Event data:', event);

            // Check for errors
            if (event.name === 'checkout.error' || event.error) {
                console.error('❌ Paddle Error:', event);
                console.error('Error details:', event.error || event.detail);
            }

            // Log checkout events
            if (event.name?.includes('checkout')) {
                console.log('🛒 Checkout event:', event.name, event);
            }
        }
    });

    console.log(`Paddle initialized in ${environment} mode`);
};

/**
 * Open Paddle checkout for Pro subscription
 */
export const openProCheckout = (userEmail: string, userId: string) => {
    console.log('🚀 Opening Paddle checkout...');
    console.log('User Email:', userEmail);
    console.log('User ID:', userId);

    if (!window.Paddle) {
        console.error('❌ Paddle not initialized');
        alert('Payment system not ready. Please refresh the page.');
        return;
    }

    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
    console.log('Price ID:', priceId);

    if (!priceId) {
        console.error('❌ NEXT_PUBLIC_PADDLE_PRICE_ID not set');
        alert('Payment configuration error. Please contact support.');
        return;
    }

    const checkoutConfig = {
        items: [
            {
                priceId,
                quantity: 1
            }
        ],
        customer: {
            email: userEmail
        },
        customData: {
            userId,
            email: userEmail
        },
        settings: {
            displayMode: 'overlay',
            theme: 'dark',
            locale: 'en',
            successUrl: `${window.location.origin}/billing/success`,
        }
    };

    console.log('📦 Checkout config:', checkoutConfig);

    try {
        window.Paddle.Checkout.open(checkoutConfig);
        console.log('✅ Checkout opened successfully');
    } catch (error) {
        console.error('❌ Error opening checkout:', error);
        alert('Failed to open checkout. Check console for details.');
    }
};

/**
 * Check if Paddle is loaded and ready
 */
export const isPaddleReady = (): boolean => {
    return typeof window !== 'undefined' && !!window.Paddle;
};
