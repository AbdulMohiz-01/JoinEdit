"use client";

import { useState } from "react";
import { ProjectCard } from "./project-card";
import { CreateProjectDialog } from "./create-project-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface ProjectsGridProps {
    projects: any[];
}

type FilterTab = "all" | "recent" | "commented";
type SortOption = "newest" | "oldest" | "active";

export function ProjectsGrid({ projects }: ProjectsGridProps) {
    const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    // Filter logic
    const filteredProjects = projects.filter((project) => {
        if (activeFilter === "recent") {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return new Date(project.created_at) > dayAgo;
        }
        if (activeFilter === "commented") {
            // This would need comment count - for now just return all
            return true;
        }
        return true;
    });

    // Sort logic
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === "newest") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        // "active" would need last_activity field - for now use created_at
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (projects.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-6">
            {/* Filter & Sort Controls */}
            <div className="flex items-center justify-between">
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                    <button
                        onClick={() => setActiveFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === "all"
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveFilter("recent")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === "recent"
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => setActiveFilter("commented")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === "commented"
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        Most Commented
                    </button>
                </div>

                {/* Sort Dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="active">Most Active</option>
                </select>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                {sortedProjects.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 py-20 text-center backdrop-blur-sm">
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6 border border-white/10">
                    <Sparkles className="h-12 w-12 text-blue-400" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Ready to create magic?</h3>
            <p className="text-zinc-400 max-w-md mb-8">
                Start your first project and get timestamped feedback on your videos in minutes.
            </p>

            {/* Onboarding Checklist */}
            <div className="mb-8 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                    <div className="h-6 w-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                        <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <span className="text-zinc-300">Account created</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-zinc-500 text-xs">1</span>
                    </div>
                    <span className="text-zinc-500">Create your first project</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-zinc-500 text-xs">2</span>
                    </div>
                    <span className="text-zinc-500">Share the link with your team</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-zinc-500 text-xs">3</span>
                    </div>
                    <span className="text-zinc-500">Get precise, timestamped feedback</span>
                </div>
            </div>

            <CreateProjectDialog>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/20">
                    <Plus className="mr-2 h-5 w-5" />
                    Create First Project
                </Button>
            </CreateProjectDialog>
        </div>
    );
}
