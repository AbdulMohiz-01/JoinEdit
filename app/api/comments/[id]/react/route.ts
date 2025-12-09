import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: commentId } = await context.params;
        const body = await request.json();
        const { reactionType, userId, guestSessionId } = body;

        if (!reactionType) {
            return NextResponse.json(
                { error: 'Reaction type is required' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Check if reaction already exists
        const { data: existing } = await supabase
            .from('comment_reactions')
            .select('*')
            .eq('comment_id', commentId)
            .eq(userId ? 'user_id' : 'guest_session_id', userId || guestSessionId)
            .single() as any;

        if (existing) {
            // If same reaction, remove it (toggle off)
            if (existing.reaction_type === reactionType) {
                const { error } = await supabase
                    .from('comment_reactions')
                    .delete()
                    .eq('id', existing.id);

                if (error) {
                    console.error('Error removing reaction:', error);
                    return NextResponse.json(
                        { error: 'Failed to remove reaction' },
                        { status: 500 }
                    );
                }

                return NextResponse.json({ success: true, action: 'removed' });
            } else {
                // Different reaction, update it
                const { error } = await (supabase as any)
                    .from('comment_reactions')
                    .update({ reaction_type: reactionType })
                    .eq('id', existing.id);

                if (error) {
                    console.error('Error updating reaction:', error);
                    return NextResponse.json(
                        { error: 'Failed to update reaction' },
                        { status: 500 }
                    );
                }

                return NextResponse.json({ success: true, action: 'updated' });
            }
        }

        // Add new reaction
        const { error } = await (supabase as any)
            .from('comment_reactions')
            .insert({
                comment_id: commentId,
                user_id: userId || null,
                guest_session_id: guestSessionId || null,
                reaction_type: reactionType,
            });

        if (error) {
            console.error('Error adding reaction:', error);
            return NextResponse.json(
                { error: 'Failed to add reaction' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, action: 'added' });
    } catch (error) {
        console.error('Error in react API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
