export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    display_name: string | null
                    is_pro: boolean
                    paddle_customer_id: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    display_name?: string | null
                    is_pro?: boolean
                    paddle_customer_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    display_name?: string | null
                    is_pro?: boolean
                    paddle_customer_id?: string | null
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    owner_id: string | null
                    title: string
                    description: string | null
                    is_temp: boolean
                    expires_at: string | null
                    share_slug: string
                    privacy: 'public' | 'password' | 'private'
                    password_hash: string | null
                    branding: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    owner_id?: string | null
                    title: string
                    description?: string | null
                    is_temp?: boolean
                    expires_at?: string | null
                    share_slug: string
                    privacy?: 'public' | 'password' | 'private'
                    password_hash?: string | null
                    branding?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string | null
                    title?: string
                    description?: string | null
                    is_temp?: boolean
                    expires_at?: string | null
                    share_slug?: string
                    privacy?: 'public' | 'password' | 'private'
                    password_hash?: string | null
                    branding?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            videos: {
                Row: {
                    id: string
                    project_id: string
                    video_url: string
                    provider: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'drive' | 'dropbox' | 'direct'
                    title: string | null
                    thumbnail_url: string | null
                    duration_seconds: number | null
                    source_note: string | null
                    version_of: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    video_url: string
                    provider: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'drive' | 'dropbox' | 'direct'
                    title?: string | null
                    thumbnail_url?: string | null
                    duration_seconds?: number | null
                    source_note?: string | null
                    version_of?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    video_url?: string
                    provider?: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'drive' | 'dropbox' | 'direct'
                    title?: string | null
                    thumbnail_url?: string | null
                    duration_seconds?: number | null
                    source_note?: string | null
                    version_of?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    project_id: string
                    video_id: string
                    author_id: string | null
                    author_name: string
                    guest_session_id: string | null
                    timestamp_seconds: number
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    video_id: string
                    author_id?: string | null
                    author_name: string
                    guest_session_id?: string | null
                    timestamp_seconds: number
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    video_id?: string
                    author_id?: string | null
                    author_name?: string
                    guest_session_id?: string | null
                    timestamp_seconds?: number
                    content?: string
                    created_at?: string
                }
            }
            guest_sessions: {
                Row: {
                    id: string
                    project_id: string
                    guest_name: string
                    cookie_token: string
                    expires_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    guest_name: string
                    cookie_token: string
                    expires_at: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    guest_name?: string
                    cookie_token?: string
                    expires_at?: string
                    created_at?: string
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    paddle_subscription_id: string
                    status: 'active' | 'canceled' | 'past_due'
                    plan_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    paddle_subscription_id: string
                    status: 'active' | 'canceled' | 'past_due'
                    plan_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    paddle_subscription_id?: string
                    status?: 'active' | 'canceled' | 'past_due'
                    plan_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
