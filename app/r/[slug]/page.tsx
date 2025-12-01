import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ReviewInterface } from '@/components/project/review-interface';

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
            .order('timestamp_seconds', { ascending: true });

        if (comments) {
            initialComments = comments;
        }
    }

    return (
        <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
            {/* Header */}
            <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md shrink-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold truncate max-w-md">{project.title}</h1>
                        {project.is_temp && project.expires_at && (
                            <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                                Expires in 24h
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-sm font-medium text-zinc-400 hover:text-white transition">Share</button>
                    </div>
                </div>
            </header>

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
