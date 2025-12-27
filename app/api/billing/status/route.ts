/**
 * Billing Status API
 * Returns current user's subscription status
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_pro, paddle_customer_id')
            .eq('id', user.id)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            return NextResponse.json(
                { error: 'Failed to fetch user data' },
                { status: 500 }
            );
        }

        // Get subscription data (if exists)
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return NextResponse.json({
            isPro: userData?.is_pro ?? false,
            paddleCustomerId: userData?.paddle_customer_id ?? null,
            subscription: subscription ?? null
        });

    } catch (error) {
        console.error('Billing status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
