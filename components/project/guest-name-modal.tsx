"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateGuestName } from "@/lib/guest-session";

interface GuestNameModalProps {
    open: boolean;
    onSubmit: (name: string) => void;
}

export function GuestNameModal({ open, onSubmit }: GuestNameModalProps) {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const finalName = name.trim() || generateGuestName();
        onSubmit(finalName);
        setIsSubmitting(false);
    };

    const handleSkip = () => {
        const guestName = generateGuestName();
        onSubmit(guestName);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        👋 Welcome to JointEdit
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-base">
                        What should we call you?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Input
                        placeholder="Your name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={30}
                        className="bg-zinc-950/50 border-white/10 focus-visible:ring-blue-500/50 text-white"
                        autoFocus
                    />

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                            className="flex-1 bg-transparent border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Continue →
                        </Button>
                    </div>

                    <p className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1">
                        💡 Your name will be visible on all comments for 24 hours
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
