import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ReviewInterface } from '@/components/project/review-interface';
import { ProjectHeader } from '@/components/project/project-header';

interface ReviewPageProps {
    params: {
        slug: string;
    };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch project by slug
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('share_slug', slug)
        .single() as any;

    if (projectError || !project) {
        notFound();
    }

    // Check if project has expired
    if (project.is_temp && project.expires_at) {
        const expiresAt = new Date(project.expires_at);
        if (expiresAt < new Date()) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-black text-white">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Project Expired</h1>
                        <p className="text-zinc-400 mb-8">
                            This temporary project has expired. Temporary projects last for 24 hours.
                        </p>
                        <a
                            href="/"
                            className="inline-block rounded-lg bg-white px-6 py-3 text-black font-bold hover:bg-zinc-200 transition"
                        >
                            Create New Project
                        </a>
                    </div>
                </div>
            );
        }
    }

    // Fetch videos for this project
    const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true }) as any;

    const activeVideo = videos && videos.length > 0 ? videos[0] : null;

    // Fetch initial comments for the active video
    let initialComments: any[] = [];
    if (activeVideo) {
        const { data: comments } = await supabase
            .from('comments')
            .select('*')
            .eq('video_id', activeVideo.id)
            .order('timestamp_seconds', { ascending: true })
            .order('created_at', { ascending: true });

        if (comments) {
            // Fetch reactions for all comments
            const commentIds = (comments as any[]).map((c: any) => c.id);
            const { data: reactions } = await supabase
                .from('comment_reactions')
                .select('*')
                .in('comment_id', commentIds) as any;

            // Aggregate reactions by comment
            const reactionsByComment = new Map<string, any[]>();
            if (reactions) {
                reactions.forEach((reaction: any) => {
                    if (!reactionsByComment.has(reaction.comment_id)) {
                        reactionsByComment.set(reaction.comment_id, []);
                    }
                    reactionsByComment.get(reaction.comment_id)!.push(reaction);
                });
            }

            // Add reactions to comments
            initialComments = (comments as any[]).map((comment: any) => {
                const commentReactions = reactionsByComment.get(comment.id) || [];

                // Aggregate reactions by type
                const reactionCounts = new Map<string, number>();
                commentReactions.forEach((r: any) => {
                    reactionCounts.set(r.reaction_type, (reactionCounts.get(r.reaction_type) || 0) + 1);
                });

                const reactions = Array.from(reactionCounts.entries()).map(([type, count]) => ({
                    type,
                    count,
                    hasReacted: false, // TODO: Check if current user has reacted
                }));

                return {
                    ...comment,
                    reactions,
                };
            });
        }
    }

    return (
        <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
            {/* Header */}
            <ProjectHeader project={project} />

            <div className="flex-1 overflow-hidden">
                <div className="container mx-auto px-4 py-6 h-full">
                    {activeVideo ? (
                        <ReviewInterface
                            project={project}
                            video={activeVideo}
                            initialComments={initialComments}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-white/10 bg-zinc-900/50">
                            <p className="text-zinc-400">No videos found in this project.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
