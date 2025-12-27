
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { ReviewInterface } from "@/components/project/review-interface";
import { ShareButton } from "@/components/project/share-button";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from("projects")
        .select("*, videos(*)")
        .eq("id", id)
        .single() as any;

    if (!project) {
        notFound();
    }

    // Fetch comments for the first video
    const video = project.videos?.[0];
    let comments: any[] = [];

    if (video) {
        const { data: fetchedComments } = await supabase
            .from("comments")
            .select("*")
            .eq("video_id", video.id)
            .order("created_at", { ascending: true });

        comments = fetchedComments || [];
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="w-full h-[calc(100vh-8rem)]">
                <header className="mb-8 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-bold truncate" title={project.title}>
                            {project.title}
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1 truncate">
                            {project.description || `Project ID: ${project.id}`}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <ShareButton shareSlug={project.share_slug} />
                    </div>
                </header>

                <ReviewInterface
                    project={project}
                    video={video}
                    initialComments={comments}
                />
            </div>
        </div>
    );
}
