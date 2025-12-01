"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Clock, MessageSquare, X } from "lucide-react";
import { formatDuration } from "@/lib/video-utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Comment {
    id: string;
    content: string;
    timestamp_seconds: number;
    author_name: string;
    created_at: string;
}

interface CommentSidebarProps {
    projectId: string;
    videoId: string;
    currentTime: number;
    pausedAtTime: number | null;
    onCommentAdded?: () => void;
    onSeek?: (seconds: number) => void;
    initialComments: Comment[];
}

export function CommentSidebar({ projectId, videoId, currentTime, pausedAtTime, onCommentAdded, onSeek, initialComments }: CommentSidebarProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authorName, setAuthorName] = useState("");
    const [commentTimestamp, setCommentTimestamp] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const supabase = createClient();

    // Auto-set timestamp when video is paused
    useEffect(() => {
        if (pausedAtTime !== null) {
            setCommentTimestamp(pausedAtTime);
            // Focus the textarea when paused
            textareaRef.current?.focus();
        }
    }, [pausedAtTime]);

    // Scroll to bottom on new comment
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments.length]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('comments')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `video_id=eq.${videoId}`,
                },
                (payload) => {
                    setComments((prev) => {
                        if (prev.find(c => c.id === payload.new.id)) return prev;
                        return [...prev, payload.new as Comment];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [videoId, supabase]);

    // Shortcut to focus textarea
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Focus on 'c' if not already typing
            if (e.key.toLowerCase() === 'c' &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.altKey &&
                document.activeElement?.tagName !== 'INPUT' &&
                document.activeElement?.tagName !== 'TEXTAREA'
            ) {
                e.preventDefault();
                textareaRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [newComment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        const name = authorName || "Guest";

        try {
            const response = await fetch('/api/comments/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    videoId,
                    content: newComment,
                    timestamp: commentTimestamp,
                    authorName: name,
                }),
            });

            if (!response.ok) throw new Error('Failed to add comment');

            const { comment } = await response.json();

            if (comment) {
                setComments((prev) => [...prev, comment]);
            }

            setNewComment("");
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            onCommentAdded?.();
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="dark flex flex-col h-full rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-zinc-900/80 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <h3 className="font-bold text-zinc-100 text-sm">Comments</h3>
                    <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5">
                        {comments.length}
                    </span>
                </div>
            </div>

            {/* Comments List */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-6 hover-scroll min-h-0"
                ref={scrollRef}
                suppressHydrationWarning
            >
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4 opacity-60">
                        <div className="p-4 rounded-full bg-zinc-800/50">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">No comments yet</p>
                            <p className="text-sm">Press 'C' to start typing</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence initial={false}>
                            {comments.map((comment) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group relative flex gap-3"
                                >
                                    {/* Timeline Connector */}
                                    <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-zinc-800 group-last:hidden" />

                                    <Avatar className="h-8 w-8 border border-zinc-900 shadow-sm ring-1 ring-white/10 shrink-0 mt-1">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-[10px] font-bold text-white">
                                            {comment.author_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-zinc-200 truncate">
                                                    {comment.author_name}
                                                </span>
                                                <button
                                                    className="flex items-center gap-1 text-[10px] font-mono font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded hover:bg-blue-500/20 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        onSeek?.(comment.timestamp_seconds);
                                                    }}
                                                >
                                                    {formatDuration(comment.timestamp_seconds)}
                                                </button>
                                            </div>
                                            <span className="text-[10px] text-zinc-600">
                                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">
                                            {comment.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-zinc-900/90 backdrop-blur-md shrink-0">
                {/* Timestamp Badge with Action Buttons */}
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-blue-400" />
                        <span className="text-xs font-mono font-medium text-blue-400">
                            {formatDuration(commentTimestamp)}
                        </span>
                        {pausedAtTime !== null && (
                            <span className="text-[10px] text-zinc-500">(paused)</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Clear Button */}
                        {newComment.trim() && (
                            <Button
                                size="icon"
                                onClick={() => {
                                    setNewComment("");
                                    if (textareaRef.current) {
                                        textareaRef.current.style.height = 'auto';
                                    }
                                }}
                                className="h-6 w-6 bg-transparent hover:bg-transparent p-0 transition-opacity duration-200"
                            >
                                <X className="h-3.5 w-3.5 text-red-500 opacity-70 hover:opacity-100" />
                            </Button>
                        )}

                        {/* Send Button */}
                        <Button
                            size="icon"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !newComment.trim()}
                            className="h-6 w-6 bg-transparent hover:bg-transparent p-0 transition-opacity duration-200"
                        >
                            <ArrowUp className={cn(
                                "h-3.5 w-3.5 text-blue-500 transition-opacity duration-200",
                                newComment.trim() ? "opacity-100" : "opacity-30"
                            )} />
                        </Button>
                    </div>
                </div>

                {/* Full Width Textarea */}
                <Textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your comment..."
                    className="w-full min-h-[60px] max-h-[120px] bg-zinc-950/50 border-white/10 focus-visible:ring-blue-500/50 resize-none py-2.5 px-3 text-sm leading-relaxed overflow-y-auto"
                    disabled={isSubmitting}
                />

                {/* Helper Text - Compact */}
                <div className="mt-1 text-center">
                    <span className="text-[10px] text-zinc-600">
                        <kbd className="font-sans bg-zinc-800 px-1 py-0.5 rounded text-zinc-400 text-[9px]">C</kbd> to focus • <kbd className="font-sans bg-zinc-800 px-1 py-0.5 rounded text-zinc-400 text-[9px]">Enter</kbd> to send • <kbd className="font-sans bg-zinc-800 px-1 py-0.5 rounded text-zinc-400 text-[9px]">Shift+Enter</kbd> for new line
                    </span>
                </div>
            </div>
        </div>
    );
}
