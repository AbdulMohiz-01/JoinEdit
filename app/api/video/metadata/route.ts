import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/video/metadata
 * 
 * Accepts a YouTube URL and returns metadata (title, thumbnail, duration)
 * 
 * Currently supports: YouTube only
 */

export async function POST(request: NextRequest) {
    try {
        const { videoUrl } = await request.json();

        if (!videoUrl || typeof videoUrl !== 'string') {
            return NextResponse.json(
                { error: 'Video URL is required' },
                { status: 400 }
            );
        }

        // Validate it's a YouTube URL
        if (!isYouTubeUrl(videoUrl)) {
            return NextResponse.json(
                { error: 'Please provide a valid YouTube URL. Other platforms coming soon!' },
                { status: 400 }
            );
        }

        // Extract video ID
        const videoId = extractYouTubeId(videoUrl);

        if (!videoId) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL format' },
                { status: 400 }
            );
        }

        // Fetch metadata from YouTube Data API
        const metadata = await fetchYouTubeMetadata(videoId);

        return NextResponse.json({
            success: true,
            data: {
                provider: 'youtube',
                videoId,
                videoUrl,
                ...metadata,
            },
        });
    } catch (error: any) {
        console.error('Error fetching YouTube metadata:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch video metadata' },
            { status: 500 }
        );
    }
}

// Check if URL is YouTube
function isYouTubeUrl(url: string): boolean {
    const urlLower = url.toLowerCase();
    return urlLower.includes('youtube.com') || urlLower.includes('youtu.be');
}

// Extract YouTube video ID
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

// Fetch metadata from YouTube Data API v3
async function fetchYouTubeMetadata(videoId: string) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error('YouTube API key not configured. Please add YOUTUBE_API_KEY to your .env file.');
    }

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch YouTube metadata');
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
        throw new Error('Video not found. Make sure the video is public and the URL is correct.');
    }

    const video = data.items[0];

    return {
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
        duration: parseDuration(video.contentDetails.duration),
        channelTitle: video.snippet.channelTitle,
    };
}

// Parse ISO 8601 duration (e.g., PT1H2M10S -> seconds)
function parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
}
