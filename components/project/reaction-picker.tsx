"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Laugh' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
    { type: 'insightful', emoji: '💡', label: 'Insightful' },
    { type: 'fire', emoji: '🔥', label: 'Fire' },
];

interface ReactionPickerProps {
    onReact: (reactionType: string) => void;
    children?: React.ReactNode;
}

export function ReactionPicker({ onReact, children }: ReactionPickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {children || (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        <Smile className="h-3.5 w-3.5 mr-1" />
                        React
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
                <div className="flex gap-1">
                    {REACTIONS.map((reaction) => (
                        <button
                            key={reaction.type}
                            onClick={() => onReact(reaction.type)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                            title={reaction.label}
                        >
                            <span className="text-2xl group-hover:scale-125 transition-transform">
                                {reaction.emoji}
                            </span>
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">
                                {reaction.label}
                            </span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export { REACTIONS };
