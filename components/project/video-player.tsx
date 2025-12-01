"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { extractYouTubeId } from "@/lib/video-utils";

interface VideoPlayerProps {
    url: string;
    onProgress?: (state: { playedSeconds: number }) => void;
    onDuration?: (duration: number) => void;
    onReady?: () => void;
    onPause?: (currentTime: number) => void;
}

export interface VideoPlayerRef {
    seekTo: (seconds: number) => void;
}

// Declare YouTube IFrame API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
        YTReady: boolean;
    }
}

let apiLoadingPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
    if (apiLoadingPromise) return apiLoadingPromise;

    if (window.YT && window.YT.Player) {
        return Promise.resolve();
    }

    apiLoadingPromise = new Promise((resolve) => {
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');

        if (existingScript) {
            if (window.YT && window.YT.Player) {
                resolve();
            } else {
                window.onYouTubeIframeAPIReady = () => {
                    window.YTReady = true;
                    resolve();
                };
            }
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            window.YTReady = true;
            resolve();
        };
    });

    return apiLoadingPromise;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
    function VideoPlayer({ url, onProgress, onDuration, onReady, onPause }, ref) {
        const [isReady, setIsReady] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [hasMounted, setHasMounted] = useState(false);
        const playerRef = useRef<any>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
        const previousStateRef = useRef<number>(-1);
        const isInitializingRef = useRef(false);

        // Use refs for callbacks to avoid re-initialization
        const onProgressRef = useRef(onProgress);
        const onDurationRef = useRef(onDuration);
        const onReadyRef = useRef(onReady);
        const onPauseRef = useRef(onPause);

        // Expose seekTo method to parent
        useImperativeHandle(ref, () => ({
            seekTo: (seconds: number) => {
                if (playerRef.current && playerRef.current.seekTo) {
                    playerRef.current.seekTo(seconds, true);
                    // Pause the video after seeking
                    playerRef.current.pauseVideo();
                }
            },
        }));

        useEffect(() => {
            onProgressRef.current = onProgress;
            onDurationRef.current = onDuration;
            onReadyRef.current = onReady;
            onPauseRef.current = onPause;
        }, [onProgress, onDuration, onReady, onPause]);

        useEffect(() => {
            setHasMounted(true);
        }, []);

        const videoId = extractYouTubeId(url);

        useEffect(() => {
            if (!videoId || !hasMounted || !containerRef.current || isInitializingRef.current) return;

            let isMounted = true;

            const initPlayer = async () => {
                try {
                    isInitializingRef.current = true;
                    await loadYouTubeAPI();

                    if (!isMounted || !containerRef.current) {
                        isInitializingRef.current = false;
                        return;
                    }

                    // Clear the container first
                    containerRef.current.innerHTML = '';

                    playerRef.current = new window.YT.Player(containerRef.current, {
                        videoId: videoId,
                        width: '100%',
                        height: '100%',
                        playerVars: {
                            enablejsapi: 1,
                            origin: window.location.origin,
                            modestbranding: 1,
                        },
                        events: {
                            onReady: (event: any) => {
                                if (!isMounted) return;
                                setIsReady(true);
                                onReadyRef.current?.();

                                const duration = event.target.getDuration();
                                if (duration && onDurationRef.current) {
                                    onDurationRef.current(duration);
                                }

                                // Start progress tracking
                                progressIntervalRef.current = setInterval(() => {
                                    if (playerRef.current && playerRef.current.getCurrentTime && onProgressRef.current) {
                                        try {
                                            const currentTime = playerRef.current.getCurrentTime();
                                            onProgressRef.current({ playedSeconds: currentTime });
                                        } catch (e) {
                                            console.error("Error getting current time:", e);
                                        }
                                    }
                                }, 500);
                            },
                            onStateChange: (event: any) => {
                                if (!isMounted) return;

                                const currentState = event.data;
                                const previousState = previousStateRef.current;

                                // YT.PlayerState: UNSTARTED = -1, ENDED = 0, PLAYING = 1, PAUSED = 2, BUFFERING = 3, CUED = 5
                                // Only trigger onPause if transitioning from PLAYING (1) to PAUSED (2)
                                if (currentState === 2 && previousState === 1 && onPauseRef.current && playerRef.current) {
                                    try {
                                        const currentTime = playerRef.current.getCurrentTime();
                                        onPauseRef.current(currentTime);
                                    } catch (e) {
                                        console.error("Error getting pause time:", e);
                                    }
                                }

                                previousStateRef.current = currentState;
                            },
                            onError: (event: any) => {
                                if (!isMounted) return;
                                console.error("YouTube player error:", event);
                                setError("Failed to load video");
                            },
                        },
                    });

                    isInitializingRef.current = false;
                } catch (err) {
                    isInitializingRef.current = false;
                    console.error("Error initializing YouTube player:", err);
                    if (isMounted) {
                        setError("Failed to initialize player");
                    }
                }
            };

            initPlayer();

            return () => {
                isMounted = false;
                isInitializingRef.current = false;
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                }
                if (playerRef.current && playerRef.current.destroy) {
                    try {
                        playerRef.current.destroy();
                    } catch (e) {
                        console.error("Error destroying player:", e);
                    }
                }
                playerRef.current = null;
            };
        }, [videoId, hasMounted]); // Only depend on videoId and hasMounted

        if (!hasMounted) {
            return (
                <div className="aspect-video w-full bg-zinc-900 flex items-center justify-center rounded-xl border border-white/10">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                </div>
            );
        }

        if (!videoId || error) {
            return (
                <div className="aspect-video w-full bg-zinc-900 flex flex-col items-center justify-center rounded-xl border border-white/10 text-red-400 gap-2">
                    <AlertCircle className="h-8 w-8" />
                    <p className="text-sm font-medium">{error || "Invalid video URL"}</p>
                </div>
            );
        }

        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
                {!isReady && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                    </div>
                )}

                <div ref={containerRef} className="w-full h-full" />
            </div>
        );
    }
);
