
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject } from "@/lib/actions/project";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateProjectDialog({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [step, setStep] = React.useState<1 | 2>(1);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [videoUrl, setVideoUrl] = React.useState("");

    React.useEffect(() => {
        if (!open) {
            setStep(1);
            setTitle("");
            setDescription("");
            setVideoUrl("");
        }
    }, [open]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (step === 1) {
            if (!title) return;
            setStep(2);
            return;
        }

        if (!videoUrl) return;

        startTransition(async () => {
            try {
                const result = await createProject({ title, description, videoUrl });

                if (result?.error) {
                    toast.error(result.error);
                    return;
                }

                setOpen(false);
                toast.success("Project created!");

                if (result?.projectId) {
                    router.push(`/projects/${result.projectId}`);
                }
            } catch (error) {
                toast.error("Something went wrong. Please try again.");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className={cn(className)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {step === 1 ? "Create Project" : "Add Video"}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {step === 1
                                ? "Start by giving your project a title and description."
                                : "Paste the link to the video you want to review."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {step === 1 ? (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="text-white">
                                        Project Name
                                    </Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="My Awesome Video Review"
                                        className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500"
                                        disabled={isPending}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="text-white">
                                        Description (Optional)
                                    </Label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief notes about this project..."
                                        className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isPending}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="videoUrl" className="text-white">
                                    Video URL
                                </Label>
                                <Input
                                    id="videoUrl"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="bg-zinc-900 border-white/10 text-white focus-visible:ring-blue-500"
                                    disabled={isPending}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        {step === 2 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep(1)}
                                className="text-zinc-400 hover:text-white hover:bg-white/10"
                                disabled={isPending}
                            >
                                Back
                            </Button>
                        )}

                        {step === 1 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-zinc-400 hover:text-white hover:bg-white/10 sm:mr-auto"
                            >
                                Cancel
                            </Button>
                        ) : null}

                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                            disabled={isPending || (step === 1 ? !title : !videoUrl)}
                        >
                            {isPending
                                ? "Creating..."
                                : step === 1
                                    ? "Next"
                                    : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
