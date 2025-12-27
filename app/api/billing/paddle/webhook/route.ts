/**
 * Paddle Webhook Handler
 * Processes subscription lifecycle events from Paddle
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Verify Paddle webhook signature
 * https://developer.paddle.com/webhooks/signature-verification
 */
function verifyWebhookSignature(
    body: string,
    signature: string,
    secretKey: string
): boolean {
    try {
        // Extract timestamp (ts) and signature hash (h1) from header
        const parts = signature.split(';');
        const tsPrefix = 'ts=';
        const h1Prefix = 'h1=';

        let ts = '';
        let h1 = '';

        for (const part of parts) {
            if (part.startsWith(tsPrefix)) {
                ts = part.substring(tsPrefix.length);
            } else if (part.startsWith(h1Prefix)) {
                h1 = part.substring(h1Prefix.length);
            }
        }

        if (!ts || !h1) {
            console.error('Missing ts or h1 in signature');
            return false;
        }

        // Build signed payload: timestamp:body
        const signedPayload = `${ts}:${body}`;

        // Compute expected signature
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(signedPayload)
            .digest('hex');

        // Compare signatures (timing-safe)
        return crypto.timingSafeEqual(
            Buffer.from(h1),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(data: any, supabase: any) {
    const userId = data.custom_data?.userId;

    if (!userId) {
        console.error('No userId in custom_data for subscription:', data.id);
        return;
    }

    console.log(`Creating subscription for user ${userId}`);

    // Create subscription record
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            paddle_subscription_id: data.id,
            status: data.status,
            plan_id: data.items?.[0]?.price?.id || null
        });

    if (subError) {
        console.error('Error creating subscription:', subError);
        return;
    }

    // Update user to Pro
    const { error: userError } = await supabase
        .from('users')
        .update({
            is_pro: true,
            paddle_customer_id: data.customer_id
        })
        .eq('id', userId);

    if (userError) {
        console.error('Error updating user to Pro:', userError);
    } else {
        console.log(`User ${userId} upgraded to Pro`);
    }
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(data: any, supabase: any) {
    console.log(`Updating subscription ${data.id}`);

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: data.status,
            updated_at: new Date().toISOString()
        })
        .eq('paddle_subscription_id', data.id);

    if (error) {
        console.error('Error updating subscription:', error);
    }
}

/**
 * Handle subscription.canceled event
 */
async function handleSubscriptionCanceled(data: any, supabase: any) {
    console.log(`Canceling subscription ${data.id}`);

    // Update subscription status
    const { error: subError } = await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
        })
        .eq('paddle_subscription_id', data.id);

    if (subError) {
        console.error('Error updating subscription:', subError);
        return;
    }

    // Get user ID from subscription
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('paddle_subscription_id', data.id)
        .single();

    if (!subscription) {
        console.error('Subscription not found:', data.id);
        return;
    }

    // Revoke Pro access
    const { error: userError } = await supabase
        .from('users')
        .update({ is_pro: false })
        .eq('id', subscription.user_id);

    if (userError) {
        console.error('Error revoking Pro access:', userError);
    } else {
        console.log(`User ${subscription.user_id} Pro access revoked`);
    }
}

/**
 * Handle transaction.completed event
 */
async function handleTransactionCompleted(data: any, supabase: any) {
    console.log(`Transaction completed: ${data.id}`);
    // Optional: Log payment, send confirmation email, etc.
}

/**
 * Handle transaction.paid event
 */
async function handleTransactionPaid(data: any, supabase: any) {
    console.log(`Transaction paid: ${data.id}`);
    // Optional: Early provisioning if needed
}

/**
 * Main webhook handler
 */
export async function POST(request: Request) {
    try {
        // Get raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('paddle-signature');

        // Verify webhook signature
        const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

        console.log('🔐 Webhook Secret (first 20 chars):', webhookSecret?.substring(0, 20));
        console.log('📝 Signature header:', signature?.substring(0, 50));

        if (!webhookSecret) {
            console.error('PADDLE_WEBHOOK_SECRET not configured');
            return NextResponse.json(
                { error: 'Webhook secret not configured' },
                { status: 500 }
            );
        }

        if (!signature) {
            console.error('No signature in webhook request');
            return NextResponse.json(
                { error: 'No signature provided' },
                { status: 401 }
            );
        }

        const isValid = verifyWebhookSignature(body, signature, webhookSecret);

        if (!isValid) {
            console.error('❌ Invalid webhook signature');
            console.error('Expected secret starts with:', webhookSecret.substring(0, 15));
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse event
        const event = JSON.parse(body);
        console.log(`Received Paddle webhook: ${event.event_type}`);

        // Create Supabase admin client (bypasses RLS for webhook operations)
        const supabase = createAdminClient();

        // Handle different event types
        switch (event.event_type) {
            case 'subscription.created':
                await handleSubscriptionCreated(event.data, supabase);
                break;

            case 'subscription.updated':
                await handleSubscriptionUpdated(event.data, supabase);
                break;

            case 'subscription.canceled':
                await handleSubscriptionCanceled(event.data, supabase);
                break;

            case 'transaction.completed':
                await handleTransactionCompleted(event.data, supabase);
                break;

            case 'transaction.paid':
                await handleTransactionPaid(event.data, supabase);
                break;

            default:
                console.log(`Unhandled event type: ${event.event_type}`);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
