import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black py-12 text-zinc-400">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">JointEdit</h3>
                        <p className="text-sm">
                            Precise, timestamped video feedback for creative teams.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-white">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#features" className="hover:text-blue-400">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-blue-400">Pricing</Link></li>
                            <li><Link href="/changelog" className="hover:text-blue-400">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-white">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="hover:text-blue-400">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-400">Terms</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-white">Social</h4>
                        <div className="flex gap-4">
                            <a href="https://github.com/AbdulMohiz-01/JoinEdit" target="_blank" rel="noreferrer" className="hover:text-white">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-white">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm">
                    © {new Date().getFullYear()} JointEdit. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
