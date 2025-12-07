import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Missing token' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Find session by token
        const { data: session, error } = await supabase
            .from('guest_sessions')
            .select('*')
            .eq('cookie_token', token)
            .single() as any;

        if (error || !session) {
            return NextResponse.json({ session: null });
        }

        // Check if expired
        const expiresAt = new Date(session.expires_at);
        if (expiresAt < new Date()) {
            return NextResponse.json({ session: null });
        }

        return NextResponse.json({
            session: {
                id: session.id,
                name: session.guest_name,
                projectId: session.project_id,
            },
        });
    } catch (error) {
        console.error('Error in get-session API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
