"use client";

import { REACTIONS } from "./reaction-picker";
import { cn } from "@/lib/utils";

interface Reaction {
    type: string;
    count: number;
    hasReacted?: boolean;
}

interface ReactionSummaryProps {
    reactions: Reaction[];
    onReactionClick: (reactionType: string) => void;
    className?: string;
}

export function ReactionSummary({ reactions, onReactionClick, className }: ReactionSummaryProps) {
    if (!reactions || reactions.length === 0) return null;

    return (
        <div className={cn("flex flex-wrap gap-1", className)}>
            {reactions.map((reaction) => {
                const reactionConfig = REACTIONS.find(r => r.type === reaction.type);
                if (!reactionConfig) return null;

                return (
                    <button
                        key={reaction.type}
                        onClick={() => onReactionClick(reaction.type)}
                        className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
                            reaction.hasReacted
                                ? "bg-blue-500/20 border border-blue-500/40 text-blue-300"
                                : "bg-zinc-800/50 border border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10"
                        )}
                        title={`${reaction.count} ${reactionConfig.label}${reaction.count > 1 ? 's' : ''}`}
                    >
                        <span className="text-sm">{reactionConfig.emoji}</span>
                        <span className="font-medium">{reaction.count}</span>
                    </button>
                );
            })}
        </div>
    );
}
