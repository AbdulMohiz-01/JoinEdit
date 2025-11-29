import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-500/30">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
