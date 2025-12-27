"use client";

import dynamic from "next/dynamic";
import { useRef, forwardRef, useImperativeHandle, useState } from "react";
import { AlertCircle } from "lucide-react";

const ReactPlayerClient = dynamic(() => import("react-player"), { ssr: false });

export interface VideoPlayerRef {
    seekTo: (seconds: number) => void;
}

export const VideoPlayer = forwardRef<
    VideoPlayerRef,
    {
        url: string;
        onProgress: (state: { playedSeconds: number }) => void;
        onDuration: (duration: number) => void;
        onPause: (timestamp: number) => void;
        onPlay?: () => void;
    }
>(({ url, onProgress, onDuration, onPause, onPlay }, ref) => {
    const playerRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        seekTo: (seconds: number) => {
            playerRef.current?.seekTo(seconds);
        },
    }));

    // Cast to any to avoid React 19 + react-player prop warnings
    const Player = ReactPlayerClient as any;

    if (error) {
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10 flex items-center justify-center">
                <div className="text-center p-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Video Load Error</h3>
                    <p className="text-sm text-zinc-400 mb-4">{error}</p>
                    <p className="text-xs text-zinc-500">URL: {url}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
            <div className="absolute inset-0">
                <Player
                    ref={playerRef}
                    url={url}
                    width="100%"
                    height="100%"
                    controls
                    playing={false}
                    onProgress={onProgress}
                    onDuration={onDuration}
                    onPlay={onPlay}
                    onPause={() => {
                        const time = playerRef.current?.getCurrentTime() || 0;
                        onPause(time);
                    }}
                    onError={(e: any) => {
                        console.error("Video player error:", e);
                        setError(e?.message || "Failed to load video. This video may not be embeddable.");
                    }}
                    onReady={() => {
                        console.log("✅ Video loaded successfully:", url);
                    }}
                    config={{
                        youtube: {
                            playerVars: {
                                showinfo: 1,
                                modestbranding: 1,
                                origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                            }
                        },
                        vimeo: {
                            playerOptions: {
                                byline: false,
                                portrait: false,
                            }
                        },
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                                crossOrigin: 'anonymous',
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
});

VideoPlayer.displayName = "VideoPlayer";
