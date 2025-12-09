import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { userId, guestSessionId } = body;

        const supabase = createAdminClient();

        // Get the comment to verify ownership
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('*')
            .eq('id', id)
            .single() as any;

        if (fetchError || !comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Check ownership
        const isOwner =
            (userId && comment.author_id === userId) ||
            (guestSessionId && comment.guest_session_id === guestSessionId);

        if (!isOwner) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Soft delete
        const { error: deleteError } = await (supabase as any)
            .from('comments')
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                content: '[deleted]'
            })
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting comment:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete comment' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in delete comment API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
