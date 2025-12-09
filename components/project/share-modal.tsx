"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shareUrl: string;
    projectTitle?: string;
}

export function ShareModal({ open, onOpenChange, shareUrl, projectTitle }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-blue-400" />
                        Share This Project
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-base">
                        {projectTitle ? `Share "${projectTitle}" with others` : "Anyone with this link can view and comment"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Share Link Input */}
                    <div className="flex items-center gap-2">
                        <Input
                            value={shareUrl}
                            readOnly
                            className="flex-1 bg-zinc-950/50 border-white/10 text-zinc-300 font-mono text-sm"
                            onClick={(e) => e.currentTarget.select()}
                        />
                        <Button
                            size="icon"
                            onClick={handleCopy}
                            className={cn(
                                "h-10 w-10 transition-all duration-200",
                                copied
                                    ? "bg-green-600 hover:bg-green-500"
                                    : "bg-blue-600 hover:bg-blue-500"
                            )}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Copy Button */}
                    <Button
                        onClick={handleCopy}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied to Clipboard!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </>
                        )}
                    </Button>

                    {/* Info Text */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-blue-400 mt-0.5">💡</div>
                        <p className="text-xs text-zinc-400">
                            Anyone with this link can view the video and leave timestamped comments.
                            <span className="text-blue-400 font-medium"> Pro users</span> can add password protection.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
