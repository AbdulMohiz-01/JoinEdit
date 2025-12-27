
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDuration, extractYouTubeId } from "@/lib/video-utils";
import { MoreVertical, Share2, Trash2, MessageSquare, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ProjectCardProps {
    project: any;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const video = project.videos?.[0];
    const [isDeleting, setIsDeleting] = useState(false);

    const getThumbnailUrl = (url: string, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault') => {
        const id = extractYouTubeId(url);
        if (!id) return "";
        return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = `${window.location.origin}/r/${project.share_slug}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Share link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Project deleted successfully");
                window.location.reload();
            } else {
                toast.error("Failed to delete project");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    // Calculate relative time
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="group relative h-full">
            <Link
                href={`/projects/${project.id}`}
                className="h-full flex flex-col rounded-xl overflow-hidden border border-white/10 bg-zinc-900/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
            >
                {/* Thumbnail */}
                <div className="aspect-video w-full bg-black relative overflow-hidden shrink-0">
                    {video ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={video.thumbnail_url || getThumbnailUrl(video.video_url)}
                            alt={project.title}
                            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src.includes('maxresdefault')) {
                                    const hq = getThumbnailUrl(video.video_url, 'hqdefault');
                                    if (hq && hq !== target.src) {
                                        target.src = hq;
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                            <span className="text-zinc-500">No Video</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Duration Badge */}
                    {video?.duration_seconds && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/90 text-xs font-mono font-medium text-white border border-white/20 backdrop-blur-sm">
                            {formatDuration(video.duration_seconds)}
                        </div>
                    )}

                    {/* Comment Count Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/90 border border-white/20 backdrop-blur-sm flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 text-blue-400" />
                        <span className="text-xs font-medium text-white">{project.commentCount || 0}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {project.title}
                    </h3>

                    {/* Description + Provider Badge */}
                    <div className="mt-1 flex items-start justify-between gap-2">
                        <p className="text-sm text-zinc-400 truncate flex-1">
                            {project.description || "No description"}
                        </p>
                        {video?.provider && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 uppercase shrink-0">
                                {video.provider}
                            </span>
                        )}
                    </div>

                    {/* Bottom Row: Time + Collaborators */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Clock className="h-3 w-3" />
                            <span>{getRelativeTime(project.created_at)}</span>
                        </div>

                        {/* Collaborators - Inline Right */}
                        {project.collaborators && project.collaborators.length > 0 && (
                            <div className="flex -space-x-2">
                                {project.collaborators.slice(0, 3).map((collab: any, idx: number) => {
                                    const initials = collab.name
                                        ?.split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2) || '?';

                                    // Assign solid colors based on index
                                    const colors = [
                                        'bg-blue-600',
                                        'bg-purple-600',
                                        'bg-pink-600',
                                        'bg-green-600',
                                        'bg-orange-600',
                                    ];
                                    const color = colors[idx % colors.length];

                                    return (
                                        <div
                                            key={idx}
                                            className="relative group/avatar"
                                            title={collab.name}
                                        >
                                            <div className={`h-6 w-6 rounded-full ${color} border-2 border-zinc-900 flex items-center justify-center text-[9px] font-semibold text-white hover:scale-110 transition-transform cursor-pointer`}>
                                                {initials}
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-opacity z-20">
                                                {collab.name}
                                            </div>
                                        </div>
                                    );
                                })}
                                {project.collaborators.length > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[9px] font-semibold text-zinc-300">
                                        +{project.collaborators.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Quick Actions Menu */}
            <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg bg-black/90 border border-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                        >
                            <MoreVertical className="h-4 w-4 text-white" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                            <Share2 className="mr-2 h-4 w-4" />
                            Copy Share Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="cursor-pointer text-red-400 focus:text-red-400"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? "Deleting..." : "Delete Project"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
