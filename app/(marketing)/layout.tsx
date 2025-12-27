"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');

    return (
        <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-500/30">
            {!isAuthPage && <Navbar />}
            <main className="flex-1">{children}</main>
            {!isAuthPage && <Footer />}
        </div>
    );
}
