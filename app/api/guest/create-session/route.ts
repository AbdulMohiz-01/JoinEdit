import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectId, name } = body;

        if (!projectId || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Get project expiry time
        const { data: project } = await supabase
            .from('projects')
            .select('expires_at')
            .eq('id', projectId)
            .single() as any;

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Generate session token
        const sessionToken = randomUUID();

        // Create guest session
        const { data: session, error } = await supabase
            .from('guest_sessions')
            .insert({
                project_id: projectId,
                guest_name: name,
                cookie_token: sessionToken,
                expires_at: project.expires_at,
            } as any)
            .select()
            .single() as any;

        if (error) {
            console.error('Error creating guest session:', error);
            return NextResponse.json(
                { error: 'Failed to create session' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            sessionToken,
            guestSessionId: session.id,
            name: session.guest_name,
        });
    } catch (error) {
        console.error('Error in create-session API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
