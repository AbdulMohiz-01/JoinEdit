// Database types
export interface User {
    id: string;
    email: string;
    display_name: string | null;
    is_pro: boolean;
    paddle_customer_id: string | null;
    created_at: string;
}

export interface Project {
    id: string;
    owner_id: string | null;
    title: string;
    description: string | null;
    is_temp: boolean;
    expires_at: string | null;
    share_slug: string;
    privacy: 'public' | 'password' | 'private';
    password_hash: string | null;
    branding: ProjectBranding;
    created_at: string;
    updated_at: string;
}

export interface ProjectBranding {
    logo_url?: string;
    accent_color?: string;
}

export interface Video {
    id: string;
    project_id: string;
    video_url: string;
    provider: VideoProvider;
    title: string | null;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    source_note: string | null;
    version_of: string | null;
    created_at: string;
    updated_at: string;
}

export type VideoProvider =
    | 'youtube'
    | 'vimeo'
    | 'tiktok'
    | 'instagram'
    | 'drive'
    | 'dropbox'
    | 'direct';

export interface Comment {
    id: string;
    project_id: string;
    video_id: string;
    author_id: string | null;
    author_name: string;
    guest_session_id: string | null;
    timestamp_seconds: number;
    content: string;
    created_at: string;
}

export interface GuestSession {
    id: string;
    project_id: string;
    guest_name: string;
    cookie_token: string;
    expires_at: string;
    created_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    paddle_subscription_id: string;
    status: 'active' | 'canceled' | 'past_due';
    plan_id: string | null;
    created_at: string;
    updated_at: string;
}

// API Response types
export interface VideoMetadata {
    provider: VideoProvider;
    title: string;
    thumbnail_url: string;
    duration_seconds: number;
    video_id?: string;
}

export interface TempProjectResponse {
    projectId: string;
    shareUrl: string;
}

export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
}
