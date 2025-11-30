"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";
import { isValidYouTubeUrl } from "@/lib/video-utils";

export function HeroInput() {
    const [videoUrl, setVideoUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate URL
        if (!videoUrl.trim()) {
            setError("Please paste a YouTube link");
            return;
        }

        if (!isValidYouTubeUrl(videoUrl)) {
            setError("Please provide a valid YouTube URL");
            return;
        }

        setIsLoading(true);

        try {
            // Step 1: Fetch video metadata
            const metadataResponse = await fetch("/api/video/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoUrl }),
            });

            const metadataData = await metadataResponse.json();

            if (!metadataResponse.ok) {
                throw new Error(metadataData.error || "Failed to fetch video");
            }

            // Step 2: Create temp project
            const projectResponse = await fetch("/api/projects/temp-create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoUrl,
                    videoMetadata: metadataData.data,
                    title: metadataData.data.title,
                }),
            });

            const projectData = await projectResponse.json();

            if (!projectResponse.ok) {
                throw new Error(projectData.error || "Failed to create project");
            }

            // Step 3: Redirect to review page
            window.location.href = projectData.data.shareUrl;
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto mb-16 flex max-w-3xl flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </div>
                    <Input
                        type="url"
                        placeholder="Paste a YouTube link..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        disabled={isLoading}
                        className="h-14 border-white/10 bg-white/5 pl-12 text-lg text-white placeholder:text-zinc-500 focus-visible:ring-blue-500 focus-visible:border-blue-500/50 transition-all rounded-xl"
                    />
                </div>
                <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="h-14 px-8 bg-white text-black hover:bg-zinc-200 text-base font-bold rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        <>
                            Start Review <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
            )}
        </form>
    );
}
