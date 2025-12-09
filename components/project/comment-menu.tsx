"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Reply, Smile, Trash2, Copy } from "lucide-react";

interface CommentMenuProps {
    canDelete: boolean;
    onReply: () => void;
    onReact: () => void;
    onDelete: () => void;
    onCopyText: () => void;
}

export function CommentMenu({ canDelete, onReply, onReact, onDelete, onCopyText }: CommentMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreVertical className="h-4 w-4 text-zinc-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onReply} className="cursor-pointer">
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReact} className="cursor-pointer">
                    <Smile className="h-4 w-4 mr-2" />
                    React
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopyText} className="cursor-pointer">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy text
                </DropdownMenuItem>
                {canDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
