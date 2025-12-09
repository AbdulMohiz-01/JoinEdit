"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { ShareModal } from "@/components/project/share-modal";

interface ProjectHeaderProps {
    project: {
        title: string;
        share_slug: string;
        is_temp: boolean;
        expires_at?: string;
    };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const [showShareModal, setShowShareModal] = useState(false);

    // Construct the share URL
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/r/${project.share_slug}`
        : `https://www.jointedit.com/r/${project.share_slug}`;

    return (
        <>
            <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md shrink-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold truncate max-w-md">{project.title}</h1>
                        {project.is_temp && project.expires_at && (
                            <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                                Expires in 24h
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowShareModal(true)}
                            className="bg-transparent border-white/10 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </header>

            <ShareModal
                open={showShareModal}
                onOpenChange={setShowShareModal}
                shareUrl={shareUrl}
                projectTitle={project.title}
            />
        </>
    );
}
