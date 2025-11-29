import Link from 'next/link';
import { Button } from '@/components/ui/button'; // We'll create this next
import { Video } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <Video className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl tracking-tight">JointEdit</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                    >
                        Sign In
                    </Link>
                    <Link href="/signup">
                        <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95">
                            Get Started
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
