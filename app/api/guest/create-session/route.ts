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

        // Get project expiry time and temp status
        const { data: project } = await supabase
            .from('projects')
            .select('expires_at, is_temp')
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

        // For pro projects (is_temp = false), set expiry to 1 year from now
        // For temp projects, use the project's expires_at
        const sessionExpiresAt = project.is_temp && project.expires_at
            ? project.expires_at
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

        // Create guest session
        const { data: session, error } = await supabase
            .from('guest_sessions')
            .insert({
                project_id: projectId,
                guest_name: name,
                cookie_token: sessionToken,
                expires_at: sessionExpiresAt,
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
