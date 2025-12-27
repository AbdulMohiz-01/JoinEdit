
"use client";

import { useState } from "react";
import { VideoPlayer } from "./video-player";
import { Database } from "@/types/supabase";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Video = Database["public"]["Tables"]["videos"]["Row"];

export function VideoWorkspace({
    project,
    video,
}: {
    project: Project & { videos: Video[] };
    video?: Video;
}) {
    const [playedSeconds, setPlayedSeconds] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // If no video, show empty state (though this shouldn't happen with our new flow)
    if (!video) {
        return (
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-12 text-center">
                <p className="text-zinc-400">No video found for this project.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Video Area */}
            <div className="lg:col-span-2 space-y-4">
                <VideoPlayer
                    url={video.video_url}
                    onProgress={(state) => setPlayedSeconds(state.playedSeconds)}
                    onDuration={setDuration}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {/* Playback info - temporary for debugging */}
                <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>{playedSeconds.toFixed(2)}s / {duration.toFixed(2)}s</span>
                    <span>{isPlaying ? "Playing" : "Paused"}</span>
                </div>
            </div>

            {/* Sidebar (Comments) */}
            <div className="h-[600px] rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                <div className="flex flex-col h-full">
                    <div className="mb-4 pb-4 border-b border-white/10">
                        <h3 className="font-semibold text-white">Comments</h3>
                        <p className="text-xs text-zinc-400">Click video to add a comment</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                        No comments yet
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
