"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Clock, MessageSquare, X, Edit2 } from "lucide-react";
import { formatDuration } from "@/lib/video-utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GuestNameModal } from "@/components/project/guest-name-modal";
import { getGuestSessionToken, setGuestSessionToken } from "@/lib/guest-session";
import { CommentItem } from "@/components/project/comment-item";

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
    const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
    const [guestSessionToken, setGuestSessionTokenState] = useState<string | null>(null);
    const [showNameModal, setShowNameModal] = useState(false);
    const [commentTimestamp, setCommentTimestamp] = useState(0);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const recentlyAddedIdsRef = useRef<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const supabase = createClient();

    // Load guest session on mount
    useEffect(() => {
        const loadGuestSession = async () => {
            const token = getGuestSessionToken();
            if (token) {
                try {
                    const response = await fetch(`/api/guest/get-session?token=${token}`);
                    const data = await response.json();
                    if (data.session && data.session.projectId === projectId) {
                        setAuthorName(data.session.name);
                        setGuestSessionId(data.session.id);
                        setGuestSessionTokenState(token);
                    }
                } catch (error) {
                    console.error('Error loading guest session:', error);
                }
            }
        };
        loadGuestSession();
    }, [projectId]);

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
        console.log('🔌 Setting up realtime subscription for video:', videoId);

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
                    console.log('📨 Received realtime comment:', payload);
                    const newComment = payload.new as Comment;

                    // Skip if this comment was recently added by us (optimistic update)
                    if (recentlyAddedIdsRef.current.has(newComment.id)) {
                        console.log('⏭️ Skipping own comment:', newComment.id);
                        return;
                    }

                    console.log('✅ Adding realtime comment to UI:', newComment);
                    setComments((prev) => {
                        // Check if comment already exists
                        if (prev.find(c => c.id === newComment.id)) {
                            console.log('⚠️ Comment already exists:', newComment.id);
                            return prev;
                        }
                        return [...prev, newComment];
                    });
                }
            )
            .subscribe((status) => {
                console.log('📡 Realtime subscription status:', status);
            });

        return () => {
            console.log('🔌 Cleaning up realtime subscription');
            supabase.removeChannel(channel);
        };
    }, [videoId, supabase]);

    // Realtime subscription for reactions
    useEffect(() => {
        console.log('🔌 Setting up realtime subscription for reactions');

        const channel = supabase
            .channel('reactions')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'comment_reactions',
                },
                async (payload) => {
                    console.log('📨 Received realtime reaction:', payload);

                    // Refetch reactions for the affected comment
                    const commentId = (payload.new as any)?.comment_id || (payload.old as any)?.comment_id;
                    if (!commentId) return;

                    try {
                        const { data: reactions } = await supabase
                            .from('comment_reactions')
                            .select('*')
                            .eq('comment_id', commentId) as any;

                        // Aggregate reactions by type
                        const reactionCounts = new Map<string, number>();
                        if (reactions) {
                            reactions.forEach((r: any) => {
                                reactionCounts.set(r.reaction_type, (reactionCounts.get(r.reaction_type) || 0) + 1);
                            });
                        }

                        const aggregatedReactions = Array.from(reactionCounts.entries()).map(([type, count]) => ({
                            type,
                            count,
                            hasReacted: false, // TODO: Check if current user reacted
                        }));

                        // Update comment reactions recursively
                        const updateReactions = (comment: Comment): Comment => {
                            if (comment.id === commentId) {
                                return { ...comment, reactions: aggregatedReactions };
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: comment.replies.map(updateReactions),
                                };
                            }
                            return comment;
                        };

                        setComments(prev => prev.map(updateReactions));
                    } catch (error) {
                        console.error('Error fetching reactions:', error);
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Reactions subscription status:', status);
            });

        return () => {
            console.log('🔌 Cleaning up reactions subscription');
            supabase.removeChannel(channel);
        };
    }, [supabase]);

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

    const handleGuestNameSubmit = async (name: string) => {
        try {
            const response = await fetch('/api/guest/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, name }),
            });

            if (response.ok) {
                const data = await response.json();
                setAuthorName(data.name);
                setGuestSessionId(data.guestSessionId);
                setGuestSessionTokenState(data.sessionToken);
                setGuestSessionToken(data.sessionToken);
            }
        } catch (error) {
            console.error('Error creating guest session:', error);
        } finally {
            setShowNameModal(false);
        }
    };

    const handleNameChange = async (newName: string) => {
        if (!guestSessionToken) return;

        try {
            const response = await fetch('/api/guest/update-name', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken: guestSessionToken, newName }),
            });

            if (response.ok) {
                const data = await response.json();
                setAuthorName(data.name);
            }
        } catch (error) {
            console.error('Error updating name:', error);
        } finally {
            setShowNameModal(false);
        }
    };

    const handleTextareaFocus = () => {
        // Show name modal if no session exists
        if (!authorName && !guestSessionId) {
            setShowNameModal(true);
        }
    };

    // Generate stable key for comments (doesn't change when temp ID becomes real ID)
    const getCommentKey = (comment: Comment): string => {
        // Use timestamp + author + created_at + first 20 chars of content as stable identifier
        // created_at ensures uniqueness even for identical comments at same video timestamp
        return `${comment.timestamp_seconds}-${comment.author_name}-${comment.created_at}-${comment.content.substring(0, 20)}`;
    };

    // Organize comments into threads
    const organizeComments = (allComments: Comment[]): Comment[] => {
        const commentMap = new Map<string, Comment>();
        const rootComments: Comment[] = [];

        // First pass: create map and initialize replies array
        allComments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: organize into threads
        commentMap.forEach((comment) => {
            if (comment.parent_comment_id) {
                // This is a reply - add it to parent's replies
                const parent = commentMap.get(comment.parent_comment_id);
                if (parent) {
                    parent.replies = parent.replies || [];
                    parent.replies.push(comment);
                } else {
                    // Parent not found, treat as root
                    rootComments.push(comment);
                }
            } else {
                // This is a root comment
                rootComments.push(comment);
            }
        });

        // Sort function helper
        const sortByDate = (a: Comment, b: Comment) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        // Sort root comments:
        // 1. Primary sort key: Video timestamp (rounded down to second)
        // 2. Secondary sort key: Date created
        // This ensures comments at "0:00" (0.1s, 0.5s, 0.9s) are all grouped together
        // and sorted chronologically by when they were posted.
        rootComments.sort((a, b) => {
            const timeA = Math.floor(a.timestamp_seconds);
            const timeB = Math.floor(b.timestamp_seconds);

            if (timeA !== timeB) {
                return timeA - timeB;
            }
            return sortByDate(a, b);
        });

        // Sort replies by created_at
        commentMap.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort(sortByDate);
            }
        });

        return rootComments;
    };

    const handleReact = async (commentId: string, reactionType: string) => {
        // Helper function to update reactions recursively
        const updateCommentReactions = (comment: Comment): Comment => {
            if (comment.id === commentId) {
                const reactions = comment.reactions || [];
                const existingReaction = reactions.find(r => r.type === reactionType);

                if (existingReaction) {
                    // Toggle off - decrease count or remove
                    if (existingReaction.count > 1) {
                        return {
                            ...comment,
                            reactions: reactions.map(r =>
                                r.type === reactionType
                                    ? { ...r, count: r.count - 1, hasReacted: false }
                                    : r
                            ),
                        };
                    } else {
                        // Remove reaction if count becomes 0
                        return {
                            ...comment,
                            reactions: reactions.filter(r => r.type !== reactionType),
                        };
                    }
                } else {
                    // Add new reaction
                    return {
                        ...comment,
                        reactions: [...reactions, { type: reactionType, count: 1, hasReacted: true }],
                    };
                }
            }

            // Check replies recursively
            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: comment.replies.map(updateCommentReactions),
                };
            }

            return comment;
        };

        // Optimistically update UI immediately
        setComments(prev => prev.map(updateCommentReactions));

        try {
            const response = await fetch(`/api/comments/${commentId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reactionType,
                    userId: null, // TODO: Add when auth is implemented
                    guestSessionId,
                }),
            });

            if (!response.ok) throw new Error('Failed to react');

            const data = await response.json();
            console.log('Reaction response:', data);
        } catch (error) {
            console.error('Error reacting to comment:', error);
            // TODO: Rollback optimistic update on error
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`/api/comments/${commentId}/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: null, // TODO: Add when auth is implemented
                    guestSessionId,
                }),
            });

            if (!response.ok) throw new Error('Failed to delete comment');

            // Optimistically update UI
            setComments(prev => prev.map(c =>
                c.id === commentId
                    ? { ...c, is_deleted: true, content: '[deleted]' }
                    : c
            ));
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    };

    const handleReply = (comment: Comment) => {
        setReplyingTo(comment);
        setCommentTimestamp(comment.timestamp_seconds);
        textareaRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const canDeleteComment = (comment: Comment): boolean => {
        return (
            (guestSessionId && comment.guest_session_id === guestSessionId) ||
            false // TODO: Add user_id check when auth is implemented
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        // If no session, show modal first
        if (!authorName && !guestSessionId) {
            setShowNameModal(true);
            return;
        }

        const name = authorName || "Guest";
        const commentContent = newComment.trim();
        const timestamp = commentTimestamp;

        // Create optimistic comment (appears instantly in UI)
        const optimisticComment = {
            id: `temp-${Date.now()}`, // Temporary ID
            content: commentContent,
            timestamp_seconds: timestamp,
            author_name: name,
            created_at: new Date().toISOString(),
            project_id: projectId,
            video_id: videoId,
            parent_comment_id: replyingTo?.id || null,
            guest_session_id: guestSessionId,
        };

        // Add to UI immediately (optimistic update)
        setComments((prev) => [...prev, optimisticComment]);

        // Clear input immediately for better UX
        setNewComment("");
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        cancelReply(); // Clear reply state
        onCommentAdded?.();

        // Sync to database in background
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/comments/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    videoId,
                    content: commentContent,
                    timestamp: timestamp,
                    authorName: name,
                    guestSessionId: guestSessionId,
                    parentCommentId: replyingTo?.id || null,
                }),
            });

            if (!response.ok) throw new Error('Failed to add comment');

            const { comment } = await response.json();

            // Replace optimistic comment with real one from server
            if (comment) {
                setComments((prev) =>
                    prev.map((c) => (c.id === optimisticComment.id ? comment : c))
                );

                // Track this ID to prevent realtime subscription from adding it again
                recentlyAddedIdsRef.current.add(comment.id);

                // Clean up after 5 seconds
                setTimeout(() => {
                    recentlyAddedIdsRef.current.delete(comment.id);
                }, 5000);
            }
        } catch (error) {
            console.error("Error adding comment:", error);

            // Rollback: Remove optimistic comment on error
            setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));

            // Restore the comment text so user can retry
            setNewComment(commentContent);

            // Show error feedback (optional - you can add a toast notification here)
            alert("Failed to post comment. Please try again.");
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
                        {organizeComments(comments).map((comment) => (
                            <CommentItem
                                key={getCommentKey(comment)}
                                comment={comment}
                                canDelete={canDeleteComment(comment)}
                                onSeek={onSeek}
                                onReply={handleReply}
                                onReact={handleReact}
                                onDelete={handleDelete}
                            />
                        ))}
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
                        {authorName && (
                            <>
                                <span className="text-[10px] text-zinc-500">•</span>
                                <button
                                    onClick={() => setShowNameModal(true)}
                                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-blue-400 transition-colors"
                                >
                                    <span>{authorName}</span>
                                    <Edit2 className="h-2.5 w-2.5" />
                                </button>
                            </>
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

                {/* Reply Indicator */}
                {replyingTo && (
                    <div className="mb-2 px-1 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs text-blue-400">Replying to</span>
                            <span className="text-xs font-bold text-blue-300 truncate">
                                {replyingTo.author_name}
                            </span>
                            <span className="text-[10px] text-blue-400/60">
                                at {formatDuration(replyingTo.timestamp_seconds)}
                            </span>
                        </div>
                        <Button
                            size="icon"
                            onClick={cancelReply}
                            className="h-5 w-5 bg-transparent hover:bg-blue-500/20 p-0"
                        >
                            <X className="h-3 w-3 text-blue-400" />
                        </Button>
                    </div>
                )}

                {/* Full Width Textarea */}
                <Textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleTextareaFocus}
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

            {/* Guest Name Modal */}
            <GuestNameModal
                open={showNameModal}
                onSubmit={authorName ? handleNameChange : handleGuestNameSubmit}
            />
        </div>
    );
}
