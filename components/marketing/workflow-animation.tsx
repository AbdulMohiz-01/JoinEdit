"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MousePointer2, Play, Pause } from "lucide-react";

export function WorkflowAnimation() {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 2500); // Much faster cycle (2.5s per step)
        return () => clearInterval(interval);
    }, []);

    // Toggle play state based on step (pause when commenting)
    useEffect(() => {
        if (step === 1 || step === 3) {
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
        }
    }, [step]);

    return (
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-sm ring-1 ring-white/10">
            {/* Browser Chrome */}
            <div className="flex h-9 items-center gap-2 border-b border-white/10 bg-zinc-900/50 px-3 backdrop-blur-md">
                <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 ring-1 ring-red-500/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20 ring-1 ring-yellow-500/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/20 ring-1 ring-green-500/30" />
                </div>
                <div className="mx-auto flex h-5 w-1/2 items-center justify-center rounded bg-zinc-800/50 text-[10px] text-zinc-500 font-mono">
                    jointedit.com/r/demo
                </div>
            </div>

            <div className="flex aspect-[16/9] md:aspect-[21/9]">
                {/* Left: Video Player Mock */}
                <div className="relative flex-1 bg-zinc-900/30 p-4 md:p-6">
                    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-inner ring-1 ring-white/5">
                        {/* Abstract Video Content */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <motion.div
                                animate={{
                                    scale: isPlaying ? [1, 1.1, 1] : 1,
                                    rotate: isPlaying ? [0, 5, -5, 0] : 0
                                }}
                                transition={{ duration: 10, repeat: Infinity }}
                                className="h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"
                            />
                            <motion.div
                                animate={{
                                    scale: isPlaying ? [1, 1.2, 1] : 1,
                                    x: isPlaying ? [0, 20, -20, 0] : 0
                                }}
                                transition={{ duration: 8, repeat: Infinity }}
                                className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl"
                            />
                        </div>

                        {/* Play/Pause Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                initial={false}
                                animate={{ opacity: isPlaying ? 0 : 1, scale: isPlaying ? 1.5 : 1 }}
                                transition={{ duration: 0.2 }}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
                            >
                                {isPlaying ? <Play className="h-5 w-5 fill-white text-white" /> : <Pause className="h-5 w-5 fill-white text-white" />}
                            </motion.div>
                        </div>

                        {/* Timeline */}
                        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                            <div className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/10 hover:h-2 transition-all">
                                {/* Progress Bar */}
                                <motion.div
                                    className="absolute h-full rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    animate={{ width: ["0%", "35%", "35%", "65%", "65%", "100%"] }}
                                    transition={{
                                        duration: 10, // Sped up from 20s
                                        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />

                                {/* Timeline Markers */}
                                <AnimatePresence>
                                    {step >= 1 && (
                                        <motion.div
                                            key="marker-1"
                                            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow-lg z-10"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            style={{ left: "35%" }}
                                        />
                                    )}
                                    {step >= 3 && (
                                        <motion.div
                                            key="marker-2"
                                            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-purple-500 shadow-lg z-10"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            style={{ left: "65%" }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="mt-1.5 flex justify-between text-[9px] font-medium text-zinc-500 font-mono">
                                <span>0:00</span>
                                <span>2:30</span>
                            </div>
                        </div>

                        {/* Simulated Cursor */}
                        <motion.div
                            className="absolute z-50 text-white drop-shadow-md pointer-events-none"
                            animate={{
                                top: ["60%", "85%", "85%", "60%", "85%", "85%", "90%"],
                                left: ["60%", "35%", "35%", "70%", "65%", "65%", "90%"],
                                scale: [1, 0.9, 1, 1, 0.9, 1, 1]
                            }}
                            transition={{
                                duration: 10, // Sped up from 20s
                                times: [0, 0.19, 0.21, 0.5, 0.59, 0.61, 1],
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <MousePointer2 className="h-5 w-5 fill-black stroke-white" />
                        </motion.div>
                    </div>
                </div>

                {/* Right: Comments Sidebar */}
                <div className="hidden w-64 border-l border-white/10 bg-zinc-950/50 p-3 backdrop-blur-sm md:block">
                    <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="h-3 w-16 rounded bg-zinc-800" />
                        <div className="h-3 w-3 rounded bg-zinc-800" />
                    </div>

                    <div className="space-y-3">
                        {/* Comment 1 */}
                        <AnimatePresence>
                            {step >= 1 && (
                                <motion.div
                                    key="comment-1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="group relative rounded-lg border border-white/5 bg-zinc-900/80 p-3 shadow-sm"
                                >
                                    <div className="absolute -left-[13px] top-3.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-4 ring-black" />
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[8px] font-bold text-white">
                                            JD
                                        </div>
                                        <div className="h-2 w-12 rounded bg-zinc-800" />
                                        <span className="ml-auto text-[9px] font-medium text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded font-mono">0:45</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-1.5 w-full rounded bg-zinc-800" />
                                        <div className="h-1.5 w-3/4 rounded bg-zinc-800" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Comment 2 */}
                        <AnimatePresence>
                            {step >= 3 && (
                                <motion.div
                                    key="comment-2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="group relative rounded-lg border border-white/5 bg-zinc-900/80 p-3 shadow-sm"
                                >
                                    <div className="absolute -left-[13px] top-3.5 h-1.5 w-1.5 rounded-full bg-purple-500 ring-4 ring-black" />
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-[8px] font-bold text-white">
                                            MK
                                        </div>
                                        <div className="h-2 w-12 rounded bg-zinc-800" />
                                        <span className="ml-auto text-[9px] font-medium text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded font-mono">1:30</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-1.5 w-full rounded bg-zinc-800" />
                                        <div className="h-1.5 w-2/3 rounded bg-zinc-800" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
