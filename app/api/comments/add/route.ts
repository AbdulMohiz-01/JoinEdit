import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectId, videoId, content, timestamp, authorName, guestSessionId } = body;

        if (!projectId || !videoId || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Insert comment
        const { data, error } = await supabase
            .from('comments')
            .insert({
                project_id: projectId,
                video_id: videoId,
                content,
                timestamp_seconds: timestamp,
                author_name: authorName || 'Guest',
                guest_session_id: guestSessionId || null,
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error inserting comment:', error);
            return NextResponse.json(
                { error: 'Failed to add comment' },
                { status: 500 }
            );
        }

        return NextResponse.json({ comment: data });
    } catch (error) {
        console.error('Error in comment API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
