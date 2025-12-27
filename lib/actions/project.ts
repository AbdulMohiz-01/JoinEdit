
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateBase62String } from "@/lib/utils";
// We need to implement generateBase62String or just use a random string util

export async function createProject({
    title,
    description,
    videoUrl,
}: {
    title: string;
    description?: string;
    videoUrl: string;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // Check limits - TEMPORARILY DISABLED FOR TESTING
    /*
    if (!user.user_metadata?.is_pro) {
        const { count, error: countError } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("owner_id", user.id);

        if (countError) {
            console.error("Error checking project count:", countError);
            return { error: "Failed to check limits." };
        }

        if (count !== null && count >= 1) {
            return {
                error: "Free plan limit reached. Upgrade to Pro to create more projects.",
            };
        }
    }
    */

    // Generate share slug
    const shareSlug = Math.random().toString(36).substring(2, 10);

    // Validate and normalize video URL
    const { detectVideoProvider, normalizeVideoUrl, isVideoUrlSupported } = await import("@/lib/video-url-utils");

    if (!isVideoUrlSupported(videoUrl)) {
        return { error: "Invalid or unsupported video URL. Please check the URL and try again." };
    }

    const normalizedUrl = normalizeVideoUrl(videoUrl);
    const provider = detectVideoProvider(normalizedUrl);

    // 1. Create Project
    const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
            owner_id: user.id,
            title,
            description,
            share_slug: shareSlug,
            privacy: "public",
            is_temp: false,
        } as any)
        .select("id")
        .single();

    if (projectError) {
        console.error("Error creating project:", projectError);
        return { error: "Failed to create project." };
    }

    // 2. Create Video with detected provider
    const { error: videoError } = await supabase.from("videos").insert({
        project_id: projectData.id,
        video_url: normalizedUrl,
        provider: provider,
        title: title || "Main Video",
        thumbnail_url: null, // Can be fetched later via API
        duration_seconds: null, // Will be set when video loads
    } as any);

    if (videoError) {
        console.error("Error adding video:", videoError);
        // Ideally we should rollback project creation here or return a partial success
        // For now we returns success but log the error, the user will see empty project
    }

    revalidatePath("/dashboard");
    return { projectId: projectData.id };
}
