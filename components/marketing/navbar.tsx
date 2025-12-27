"use client";

import Link from 'next/link';
import { Video, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
    hideAuthActions?: boolean;
}

export function Navbar({ hideAuthActions = false }: NavbarProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error('Error checking auth:', error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Listen for auth changes (sign in, sign out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <Video className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl tracking-tight">JointEdit</span>
                </Link>

                {!hideAuthActions && (
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                        ) : user ? (
                            <Link href="/dashboard">
                                <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95">
                                    Dashboard
                                </button>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                                >
                                    Sign In
                                </Link>
                                <Link href="/signup">
                                    <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95">
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
