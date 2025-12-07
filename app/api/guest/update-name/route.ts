import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { sessionToken, newName } = body;

        if (!sessionToken || !newName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Update guest session name
        const { data, error } = await (supabase as any)
            .from('guest_sessions')
            .update({ guest_name: newName })
            .eq('cookie_token', sessionToken)
            .select()
            .single();

        if (error) {
            console.error('Error updating guest name:', error);
            return NextResponse.json(
                { error: 'Failed to update name' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            name: data.guest_name,
        });
    } catch (error) {
        console.error('Error in update-name API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
