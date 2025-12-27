"use client";

import { useState, useCallback, useRef } from "react";
import { VideoPlayer, VideoPlayerRef } from "@/components/project/video-player";
import { CommentSidebar } from "@/components/project/comment-sidebar";
import { AlertCircle } from "lucide-react";

interface ReviewInterfaceProps {
    project: any;
    video: any;
    initialComments?: any[];
}

export function ReviewInterface({ project, video, initialComments = [] }: ReviewInterfaceProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [pausedAtTime, setPausedAtTime] = useState<number | null>(null);
    const videoPlayerRef = useRef<VideoPlayerRef>(null);

    const handleProgress = useCallback((state: { playedSeconds: number }) => {
        setCurrentTime(state.playedSeconds);
    }, []);

    const handleDuration = useCallback((d: number) => {
        setDuration(d);
    }, []);

    const handlePause = useCallback((time: number) => {
        console.log("Video paused, setting timestamp to:", time);
        setPausedAtTime(time);
    }, []);

    const handleSeek = useCallback((seconds: number) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.seekTo(seconds);
        }
    }, []);

    // Handle missing video
    if (!video || !video.video_url) {
        return (
            <div className="flex items-center justify-center h-96 rounded-xl border border-white/10 bg-zinc-900/30">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Video Found</h3>
                    <p className="text-sm text-zinc-400">
                        This project doesn't have any videos yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Main Content: Video Player */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="w-full">
                    <VideoPlayer
                        ref={videoPlayerRef}
                        url={video.video_url}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        onPause={handlePause}
                    />
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/30">
                    <h2 className="text-xl font-bold mb-1">{video.title || "Untitled Video"}</h2>
                    <p className="text-sm text-zinc-500">
                        {video.provider || "Unknown"} • {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
                    </p>
                </div>
            </div>

            {/* Sidebar: Comments */}
            <div className="lg:col-span-1 h-full min-h-0">
                <CommentSidebar
                    projectId={project.id}
                    videoId={video.id}
                    currentTime={currentTime}
                    pausedAtTime={pausedAtTime}
                    onCommentAdded={() => setPausedAtTime(null)}
                    onSeek={handleSeek}
                    initialComments={initialComments}
                />
            </div>
        </div>
    );
}
