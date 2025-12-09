"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Reply as ReplyIcon } from "lucide-react";
import { formatDuration } from "@/lib/video-utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CommentMenu } from "./comment-menu";
import { ReactionPicker } from "./reaction-picker";
import { ReactionSummary } from "./reaction-summary";

interface Reaction {
    type: string;
    count: number;
    hasReacted: boolean;
}

interface Comment {
    id: string;
    content: string;
    timestamp_seconds: number;
    author_name: string;
    created_at: string;
    parent_comment_id?: string | null;
    is_deleted?: boolean;
    is_edited?: boolean;
    guest_session_id?: string | null;
    author_id?: string | null;
    reactions?: Reaction[];
    replies?: Comment[];
}

interface CommentItemProps {
    comment: Comment;
    isReply?: boolean;
    canDelete: boolean;
    onSeek?: (seconds: number) => void;
    onReply: (comment: Comment) => void;
    onReact: (commentId: string, reactionType: string) => void;
    onDelete: (commentId: string) => void;
}

export function CommentItem({
    comment,
    isReply = false,
    canDelete,
    onSeek,
    onReply,
    onReact,
    onDelete,
}: CommentItemProps) {
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    if (comment.is_deleted) {
        return (
            <div className={cn(
                "flex gap-3 opacity-50",
                isReply && "ml-12 border-l-2 border-zinc-800 pl-4"
            )}>
                <div className="flex-1">
                    <p className="text-sm text-zinc-500 italic">[Comment deleted]</p>
                </div>
            </div>
        );
    }

    const handleCopyText = () => {
        navigator.clipboard.writeText(comment.content);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group relative flex gap-3",
                isReply && "ml-12 border-l-2 border-blue-500/20 pl-4"
            )}
        >
            {/* Timeline Connector */}
            {!isReply && (
                <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-zinc-800 group-last:hidden" />
            )}

            <Avatar className="h-8 w-8 border border-zinc-900 shadow-sm ring-1 ring-white/10 shrink-0 mt-1">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-[10px] font-bold text-white">
                    {comment.author_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-zinc-200 truncate">
                            {comment.author_name}
                        </span>
                        <button
                            className="flex items-center gap-1 text-[10px] font-mono font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded hover:bg-blue-500/20 transition-colors cursor-pointer"
                            onClick={() => onSeek?.(comment.timestamp_seconds)}
                        >
                            {formatDuration(comment.timestamp_seconds)}
                        </button>
                        <span className="text-[10px] text-zinc-600">
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {comment.is_edited && (
                            <span className="text-[10px] text-zinc-600 italic">(edited)</span>
                        )}
                    </div>
                    <CommentMenu
                        canDelete={canDelete}
                        onReply={() => onReply(comment)}
                        onReact={() => setShowReactionPicker(true)}
                        onDelete={() => onDelete(comment.id)}
                        onCopyText={handleCopyText}
                    />
                </div>

                {/* Content */}
                <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full mb-2">
                    {comment.content}
                </div>

                {/* Reactions */}
                {comment.reactions && comment.reactions.length > 0 && (
                    <ReactionSummary
                        reactions={comment.reactions}
                        onReactionClick={(type) => onReact(comment.id, type)}
                        className="mb-2"
                    />
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReply(comment)}
                        className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        <ReplyIcon className="h-3.5 w-3.5 mr-1" />
                        Reply
                    </Button>
                    <ReactionPicker onReact={(type) => onReact(comment.id, type)} />
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={`${reply.timestamp_seconds}-${reply.author_name}-${reply.created_at}-${reply.content.substring(0, 20)}`}
                                comment={reply}
                                isReply={true}
                                canDelete={canDelete}
                                onSeek={onSeek}
                                onReply={onReply}
                                onReact={onReact}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
