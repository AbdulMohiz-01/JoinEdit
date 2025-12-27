
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Fetch projects with videos
    const { data: projects } = await supabase
        .from("projects")
        .select("*, videos(*)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }) as any;

    // Fetch comment counts and unique commenters for each project
    const projectsWithData = await Promise.all(
        (projects || []).map(async (project: any) => {
            // Get comment count
            const { count } = await supabase
                .from("comments")
                .select("*", { count: "exact", head: true })
                .eq("project_id", project.id);

            // Get unique commenters (both authenticated and guests)
            const { data: comments } = await supabase
                .from("comments")
                .select("author_name, author_id")
                .eq("project_id", project.id);

            // Create unique collaborators list
            const uniqueCollaborators = new Map();

            comments?.forEach((comment: any) => {
                const key = comment.author_id || comment.author_name;
                if (key && !uniqueCollaborators.has(key)) {
                    uniqueCollaborators.set(key, {
                        name: comment.author_name,
                        id: comment.author_id,
                    });
                }
            });

            const collaborators = Array.from(uniqueCollaborators.values());

            return {
                ...project,
                commentCount: count || 0,
                collaborators,
            };
        })
    );

    // Calculate stats
    const totalComments = projectsWithData.reduce((acc, p) => acc + p.commentCount, 0);
    const stats = {
        totalProjects: projectsWithData.length,
        totalVideos: projectsWithData.reduce((acc: number, p: any) => acc + (p.videos?.length || 0), 0),
        totalComments,
    };

    // Get user display name
    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    return (
        <div className="min-h-screen bg-black text-white">
            <DashboardHeader
                userName={userName}
                userEmail={user.email || ""}
                stats={stats}
            />

            <main className="container mx-auto py-12 px-4">
                <ProjectsGrid projects={projectsWithData} />
            </main>
        </div>
    );
}
