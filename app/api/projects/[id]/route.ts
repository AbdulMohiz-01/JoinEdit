import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const { data: project } = await supabase
            .from("projects")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (!project || project.owner_id !== user.id) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        // Delete project (cascade will handle videos, comments, etc.)
        const { error } = await supabase.from("projects").delete().eq("id", id);

        if (error) {
            console.error("Delete error:", error);
            return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete project error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
