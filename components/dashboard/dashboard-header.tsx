"use client";

import { useState } from "react";
import { Search, Video, MessageSquare, FolderOpen, Plus, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import Link from "next/link";

interface DashboardHeaderProps {
    userName: string;
    userEmail: string;
    stats: {
        totalProjects: number;
        totalVideos: number;
        totalComments: number;
    };
}

export function DashboardHeader({ userName, userEmail, stats }: DashboardHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-6">
                {/* Top Row: Welcome + User Info */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            Welcome back, {userName}
                        </h1>
                        <p className="text-sm text-zinc-500">{userEmail}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/billing">
                            <Button
                                variant="outline"
                                className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 border border-white/10"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Billing
                            </Button>
                        </Link>

                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 border border-white/10"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats + Search + Action Row */}
                <div className="flex items-center gap-4">
                    {/* Stats Cards - Compact & Clean */}
                    <div className="flex items-center gap-3">
                        {/* Projects */}
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
                            <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                                <FolderOpen className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-white">{stats.totalProjects}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Projects</div>
                            </div>
                        </div>

                        {/* Videos */}
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
                            <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20">
                                <Video className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-white">{stats.totalVideos}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Videos</div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
                            <div className="p-2 rounded-md bg-pink-500/10 border border-pink-500/20">
                                <MessageSquare className="h-4 w-4 text-pink-400" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-white">{stats.totalComments}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Comments</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Search + New Project Button */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        {/* Search Bar */}
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/[0.02] border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 h-10"
                            />
                        </div>

                        {/* New Project Button */}
                        <CreateProjectDialog>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/20 h-10 px-4">
                                <Plus className="h-4 w-4 mr-2" />
                                New Project
                            </Button>
                        </CreateProjectDialog>
                    </div>
                </div>
            </div>
        </header>
    );
}
