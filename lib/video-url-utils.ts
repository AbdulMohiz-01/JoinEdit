/**
 * Detect video provider from URL
 */
export function detectVideoProvider(url: string): string {
    const urlLower = url.toLowerCase();

    // YouTube
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'youtube';
    }

    // Vimeo
    if (urlLower.includes('vimeo.com')) {
        return 'vimeo';
    }

    // TikTok
    if (urlLower.includes('tiktok.com')) {
        return 'tiktok';
    }

    // Instagram
    if (urlLower.includes('instagram.com')) {
        return 'instagram';
    }

    // Facebook
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
        return 'facebook';
    }

    // Twitch
    if (urlLower.includes('twitch.tv')) {
        return 'twitch';
    }

    // Streamable
    if (urlLower.includes('streamable.com')) {
        return 'streamable';
    }

    // Wistia
    if (urlLower.includes('wistia.com')) {
        return 'wistia';
    }

    // DailyMotion
    if (urlLower.includes('dailymotion.com')) {
        return 'dailymotion';
    }

    // Mixcloud
    if (urlLower.includes('mixcloud.com')) {
        return 'mixcloud';
    }

    // SoundCloud
    if (urlLower.includes('soundcloud.com')) {
        return 'soundcloud';
    }

    // Google Drive
    if (urlLower.includes('drive.google.com')) {
        return 'drive';
    }

    // Dropbox
    if (urlLower.includes('dropbox.com')) {
        return 'dropbox';
    }

    // HLS Stream
    if (urlLower.includes('.m3u8')) {
        return 'hls';
    }

    // DASH Stream
    if (urlLower.includes('.mpd')) {
        return 'dash';
    }

    // Direct video files
    if (urlLower.match(/\.(mp4|webm|ogv|mov|avi|mkv|flv|wmv)(\?|$)/)) {
        return 'file';
    }

    // Audio files
    if (urlLower.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/)) {
        return 'audio';
    }

    // Default to file (react-player will try to play it as a direct file)
    return 'file';
}

/**
 * Check if URL is supported by react-player
 */
export function isVideoUrlSupported(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    // Basic URL validation
    try {
        new URL(url);
    } catch {
        return false;
    }

    const provider = detectVideoProvider(url);

    // All detected providers are supported
    return true;
}

/**
 * Normalize video URL for better compatibility
 */
export function normalizeVideoUrl(url: string): string {
    let normalized = url.trim();

    // YouTube: Convert shorts to regular watch URL
    if (normalized.includes('youtube.com/shorts/')) {
        const videoId = normalized.split('/shorts/')[1]?.split('?')[0];
        if (videoId) {
            normalized = `https://www.youtube.com/watch?v=${videoId}`;
        }
    }

    // YouTube: Remove playlist and other problematic parameters
    if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) {
        try {
            const urlObj = new URL(normalized);

            // For youtu.be short links
            if (urlObj.hostname === 'youtu.be') {
                const videoId = urlObj.pathname.slice(1);
                normalized = `https://www.youtube.com/watch?v=${videoId}`;
            } else {
                // For regular youtube.com links, keep only the v parameter
                const videoId = urlObj.searchParams.get('v');
                if (videoId) {
                    normalized = `https://www.youtube.com/watch?v=${videoId}`;
                }
            }
        } catch (e) {
            // If URL parsing fails, return as-is
        }
    }

    // Dropbox: Add dl=1 for direct playback
    if (normalized.includes('dropbox.com') && !normalized.includes('dl=')) {
        normalized = normalized.replace('dl=0', 'dl=1');
        if (!normalized.includes('dl=')) {
            normalized += (normalized.includes('?') ? '&' : '?') + 'dl=1';
        }
    }

    // Google Drive: Convert to preview URL
    if (normalized.includes('drive.google.com/file/d/')) {
        const fileId = normalized.match(/\/d\/([^/]+)/)?.[1];
        if (fileId) {
            normalized = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }

    return normalized;
}
