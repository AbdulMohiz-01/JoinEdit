import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

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
        .order('created_at', { ascending: true });

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                    {project.description && (
                        <p className="text-zinc-400">{project.description}</p>
                    )}
                    {project.is_temp && project.expires_at && (
                        <p className="mt-2 text-sm text-yellow-400">
                            ⏰ Expires: {new Date(project.expires_at).toLocaleString()}
                        </p>
                    )}
                </div>

                {videos && videos.length > 0 ? (
                    <div className="grid gap-6">
                        {videos.map((video: any) => (
                            <div
                                key={video.id}
                                className="rounded-xl border border-white/10 bg-zinc-900/50 p-6"
                            >
                                <div className="flex gap-4">
                                    {video.thumbnail_url && (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="h-32 w-48 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                                        <p className="text-sm text-zinc-400 mb-4">
                                            Provider: {video.provider} • Duration: {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                                        </p>
                                        <a
                                            href={video.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500 transition"
                                        >
                                            Watch Video →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-12 text-center">
                        <p className="text-zinc-400">No videos in this project yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
