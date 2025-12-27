"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type AuthMode = "login" | "signup";

interface AuthScreenProps {
    mode: AuthMode;
}

export function AuthScreen({ mode }: AuthScreenProps) {
    const supabase = useMemo(() => createClient(), []);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState<string>("");
    const [oauthLoading, setOauthLoading] = useState(false);

    const authCopy =
        mode === "login"
            ? { title: "Welcome back", subtitle: "Sign in to pick up where you left off.", cta: "Send magic link" }
            : { title: "Create your account", subtitle: "Get instant access to your dashboard.", cta: "Send magic link" };

    const handleEmailSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!email) {
            setStatus("error");
            setMessage("Please enter an email address.");
            return;
        }

        setStatus("loading");
        setMessage("");

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setStatus("error");
            setMessage(error.message || "Something went wrong. Try again.");
            return;
        }

        setStatus("success");
        setMessage("Check your email for a secure magic link to continue.");
    };

    const handleGoogleSignIn = async () => {
        setOauthLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setOauthLoading(false);
            setStatus("error");
            setMessage(error.message || "Google sign in failed. Try again.");
        }
    };

    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-black text-white">
            <div className="relative grid min-h-screen items-stretch overflow-hidden lg:grid-cols-[1.1fr_520px]">
                {/* Visual Panel - now left */}
                <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-black to-zinc-900 px-6 py-12 lg:flex">
                    <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.1),transparent_30%)]" />
                    <div className="absolute left-6 top-6 z-20">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to home
                        </Link>
                    </div>
                    <div className="relative z-10 flex w-full max-w-5xl flex-col gap-10">
                        <div className="space-y-3">
                            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200">
                                Instant access
                                <ArrowRight className="h-4 w-4" />
                            </p>
                            <h2 className="bitcount-grid-single text-4xl font-semibold leading-[1.05] text-zinc-200/80 sm:text-5xl lg:text-6xl">
                                Skip passwords.
                                <br />
                                Start feedback now.
                            </h2>
                            <p className="max-w-3xl text-lg text-zinc-200">
                                Passwordless magic links or Google SSO — get straight to the timeline and keep reviews flowing.
                            </p>
                        </div>

                        <LineOrbitAnimation />
                    </div>
                </div>

                {/* Form Panel - now right, no flare light */}
                <div className="relative flex flex-col justify-center bg-zinc-950/80 backdrop-blur-xl border-l border-white/5 px-6 py-12 md:px-10 lg:px-12">
                    <div className="relative space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                                <Shield className="h-4 w-4 text-blue-400" />
                                Supabase secured
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                                    {authCopy.title}
                                </h1>
                                <p className="text-base text-zinc-400 sm:text-lg">
                                    {authCopy.subtitle}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-7 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl ring-1 ring-white/10">
                            <form className="space-y-7" onSubmit={handleEmailSubmit}>
                                <div className="space-y-3">
                                    <label className="flex flex-col gap-2 text-sm font-medium text-zinc-200">
                                        <span>Email address</span>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            placeholder="you@example.com"
                                            className="h-12 border-white/10 bg-zinc-900/70 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
                                        />
                                    </label>
                                </div>

                                <div className="pt-1">
                                    <Button
                                        type="submit"
                                        className="h-12 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30 transition hover:from-blue-500 hover:to-indigo-500"
                                        disabled={status === "loading"}
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        {status === "loading" ? "Sending..." : authCopy.cta}
                                    </Button>
                                </div>
                            </form>

                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">or</span>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            <Button
                                variant="outline"
                                className="h-11 w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                                onClick={handleGoogleSignIn}
                                disabled={oauthLoading}
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M21.35 11.1H12v2.8h5.35c-.25 1.4-1.01 2.59-2.16 3.38v2.82h3.49c2.04-1.88 3.22-4.64 3.22-7.9 0-.64-.06-1.27-.15-1.88Z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 22c2.92 0 5.37-.97 7.16-2.64l-3.5-2.82c-.97.65-2.2 1.04-3.66 1.04-2.81 0-5.2-1.9-6.05-4.45H2.35v2.9A10 10 0 0 0 12 22Z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.95 13.13A5.99 5.99 0 0 1 5.63 12c0-.39.07-.77.12-1.13V8h-3.6A10 10 0 0 0 2 12c0 1.61.38 3.13 1.06 4.48l2.89-2.35Z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 6.02c1.59 0 3.02.55 4.15 1.62l3.12-3.12C17.35 2.8 14.9 2 12 2 7.69 2 3.99 4.66 2.65 8.34l3.6 2.87C7.8 7.92 9.98 6.02 12 6.02Z"
                                    />
                                </svg>
                                {oauthLoading ? "Redirecting..." : "Continue with Google"}
                            </Button>

                            {message && (
                                <div
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${status === "error"
                                        ? "border-red-500/50 bg-red-500/10 text-red-200"
                                        : "border-green-500/50 bg-green-500/10 text-green-100"
                                        }`}
                                >
                                    {status === "error" ? (
                                        <Shield className="h-4 w-4" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    <span>{message}</span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300 shadow-lg ring-1 ring-white/5">
                            <div className="flex items-center gap-2 font-medium text-white">
                                <Sparkles className="h-4 w-4 text-blue-400" />
                                Magic link access
                            </div>
                            <p className="mt-2 leading-relaxed text-zinc-400">
                                We send a time-limited, single-use link to your email. No password to remember, just click and you are in.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Alternate animation: orbiting light lines for motion without reusing the hero animation
function LineOrbitAnimation() {
    const lines = Array.from({ length: 6 }, (_, i) => i);

    return (
        <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/10 to-transparent backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.22),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(236,72,153,0.2),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.14),transparent_40%)] opacity-70" />
            <div className="absolute inset-0">
                {lines.map((line) => (
                    <AnimatedLine key={line} index={line} />
                ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-3 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-100/70">Timeline ready</p>
                    <p className="bitcount-grid-single text-3xl font-semibold text-white/90 sm:text-4xl">
                        Realtime sync · Zero friction
                    </p>
                </div>
            </div>
        </div>
    );
}

function AnimatedLine({ index }: { index: number }) {
    const speed = 8 + index * 1.2;
    const delay = index * 0.4;
    const opacity = 0.35 + index * 0.05;

    return (
        <motion.div
            className="absolute h-px w-[140%] -left-[20%] bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
                top: `${10 + index * 14}%`,
                opacity,
            }}
            initial={{ x: "-10%" }}
            animate={{ x: "10%" }}
            transition={{
                duration: speed,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay,
            }}
        />
    );
}


