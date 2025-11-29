import { Button } from "@/components/ui/button";
import { HeroInput } from "@/components/marketing/hero-input";
import { WorkflowAnimation } from "@/components/marketing/workflow-animation";
import { Spotlight } from "@/components/ui/spotlight";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ArrowRight, Check, Play, Share2, MessageSquare, Zap, Shield, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-20 bg-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-16 md:pb-24">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto mb-8 flex max-w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm font-medium text-zinc-300 backdrop-blur-md transition-colors hover:bg-zinc-900">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            New: Support for Google Drive & Dropbox
          </div>

          <h1 className="mx-auto mb-8 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Video feedback <br />
            <TextShimmer className="inline-block bg-[linear-gradient(110deg,#3b82f6,45%,#ec4899,55%,#3b82f6)] dark:bg-[linear-gradient(110deg,#3b82f6,45%,#ec4899,55%,#3b82f6)]">
              at the speed of thought.
            </TextShimmer>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed">
            Paste a link. Share a review. Get precise feedback without the back-and-forth emails.
            <span className="text-zinc-200"> No signup required for guests.</span>
          </p>

          {/* Input Form */}
          <HeroInput />

          {/* Workflow Animation */}
          <div className="relative mx-auto max-w-5xl px-2 sm:px-4">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-2xl" />
            <WorkflowAnimation />
          </div>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </section>

      {/* How It Works */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-20">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white md:text-5xl">How it works</h2>
          <p className="mt-4 text-zinc-400">Three simple steps to better feedback.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Play,
              title: "Paste a Link",
              desc: "Support for YouTube, Vimeo, TikTok, Google Drive, and Dropbox. No file uploads needed.",
              color: "blue"
            },
            {
              icon: Share2,
              title: "Share Instantly",
              desc: "Get a unique link to share with your team or clients. Guests don't need an account to comment.",
              color: "purple"
            },
            {
              icon: MessageSquare,
              title: "Precise Feedback",
              desc: "Click anywhere on the timeline to leave a timestamped comment. Export to PDF or CSV.",
              color: "green"
            }
          ].map((feature, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 transition-all hover:border-white/20 hover:bg-zinc-900">
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${feature.color}-500/10 blur-3xl transition-all group-hover:bg-${feature.color}-500/20`} />

              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/50 text-${feature.color}-400 ring-1 ring-white/10 transition-colors group-hover:bg-${feature.color}-500 group-hover:text-white`}>
                <feature.icon className="h-7 w-7" />
              </div>

              <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-12 md:py-20">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white md:text-5xl">Simple pricing</h2>
          <p className="mt-4 text-zinc-400">Start for free, upgrade when you need more power.</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* Guest */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50">
              <Users className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Guest</h3>
            <div className="my-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">Free</span>
            </div>
            <p className="mb-8 text-sm text-zinc-400">Perfect for quick, one-off reviews without creating an account.</p>

            <div className="flex-1 space-y-4">
              {["24-hour project life", "Unlimited comments", "No signup required", "Public links"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-blue-500" /> {item}
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-8 w-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">
              Start Review
            </Button>
          </div>

          {/* Creator (Popular) */}
          <div className="relative flex flex-col rounded-3xl border border-blue-500/50 bg-zinc-900/80 p-8 shadow-2xl shadow-blue-900/20 backdrop-blur-md transition-transform hover:-translate-y-1">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
              MOST POPULAR
            </div>

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>

            <h3 className="text-xl font-bold text-white">Creator</h3>
            <div className="my-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-zinc-500">/forever</span>
            </div>
            <p className="mb-8 text-sm text-zinc-400">For individual creators who need to manage their projects.</p>

            <div className="flex-1 space-y-4">
              {[
                "1 Active Project",
                "10 Videos per project",
                "Project Management Dashboard",
                "Edit & Delete comments",
                "Email notifications"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
                    <Check className="h-3 w-3 text-blue-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <Button className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25">
              Sign Up Free
            </Button>
          </div>

          {/* Pro */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Pro</h3>
            <div className="my-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$12</span>
              <span className="text-zinc-500">/mo</span>
            </div>
            <p className="mb-8 text-sm text-zinc-400">For professionals & teams needing advanced security and branding.</p>

            <div className="flex-1 space-y-4">
              {[
                "Unlimited Projects",
                "Password Protection",
                "Custom Branding (Logo & Colors)",
                "PDF & CSV Exports",
                "Version Control",
                "Priority Support"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-purple-500" /> {item}
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-8 w-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">
              Coming Soon
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
