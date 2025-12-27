
"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareButtonProps {
    shareSlug: string;
}

export function ShareButton({ shareSlug }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    // Construct the public sharing URL
    // We use window.location.origin on client, but for SSR safety we might strictly need it in useEffect
    // For now, simpler construction is fine, or we assume it's run in browser
    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/r/${shareSlug}`
        : `/${shareSlug}`; // Fallback

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Project</DialogTitle>
                    <DialogDescription>
                        Anyone with this link can view and comment on this video.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            defaultValue={shareUrl}
                            readOnly
                            className="bg-zinc-950 text-white border-white/10"
                        />
                    </div>
                    <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
