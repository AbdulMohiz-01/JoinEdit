import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateUniqueSlug } from '@/lib/slug';

/**
 * POST /api/projects/temp-create
 * 
 * Creates a temporary project (expires in 24 hours) with a video
 * Used for guest users who don't want to sign up
 */

export async function POST(request: NextRequest) {
    try {
        const { videoUrl, videoMetadata, title } = await request.json();

        if (!videoUrl || !videoMetadata) {
            return NextResponse.json(
                { error: 'Video URL and metadata are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Generate unique slug
        const slug = await generateUniqueSlug(async (slug) => {
            const { data } = await supabase
                .from('projects')
                .select('id')
                .eq('share_slug', slug)
                .single();

            return !!data;
        });

        // Calculate expiry (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Create temp project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                title: title || videoMetadata.title || 'Untitled Project',
                description: 'Temporary project - expires in 24 hours',
                is_temp: true,
                expires_at: expiresAt.toISOString(),
                share_slug: slug,
                privacy: 'public' as const,
                owner_id: null, // No owner for temp projects
            } as any)
            .select()
            .single() as any;

        if (projectError) {
            console.error('Error creating project:', projectError);
            return NextResponse.json(
                { error: 'Failed to create project' },
                { status: 500 }
            );
        }

        // Add video to project
        const { error: videoError } = await supabase
            .from('videos')
            .insert({
                project_id: project.id,
                video_url: videoUrl,
                provider: videoMetadata.provider || 'youtube',
                title: videoMetadata.title,
                thumbnail_url: videoMetadata.thumbnail,
                duration_seconds: videoMetadata.duration,
                source_note: 'Added via guest flow',
            } as any);

        if (videoError) {
            console.error('Error adding video:', videoError);
            // Clean up project if video creation fails
            await supabase.from('projects').delete().eq('id', project.id);

            return NextResponse.json(
                { error: 'Failed to add video to project' },
                { status: 500 }
            );
        }

        // Return success with share URL
        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${slug}`;

        return NextResponse.json({
            success: true,
            data: {
                projectId: project.id,
                slug,
                shareUrl,
                expiresAt: expiresAt.toISOString(),
            },
        });
    } catch (error: any) {
        console.error('Error in temp-create:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
