export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="mx-auto max-w-4xl px-6 py-16 text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
            Joint<span className="text-blue-600">Edit</span>
          </h1>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-semibold text-slate-800 dark:text-slate-100">
            Timestamped video feedback — fast.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Paste a link. Share a review. Get precise feedback — no signup required.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 text-3xl">✅</div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Next.js Setup
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              App Router, TypeScript, Tailwind CSS configured
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 text-3xl">📦</div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Dependencies
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Supabase, Framer Motion, Zod, React Hook Form installed
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 text-3xl">🚀</div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Ready to Build
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Project structure created, ready for Iteration 1.2
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
          <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
            ✨ Iteration 1.1 Complete!
          </h3>
          <p className="mb-4 text-blue-800 dark:text-blue-200">
            Next up: <strong>Iteration 1.2 - Supabase Setup & Database Schema</strong>
          </p>
          <ul className="space-y-2 text-left text-sm text-blue-700 dark:text-blue-300">
            <li>• Create Supabase project</li>
            <li>• Deploy database schema (users, projects, videos, comments)</li>
            <li>• Set up Row Level Security policies</li>
            <li>• Create Supabase client utilities</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-slate-500 dark:text-slate-500">
          <p>Development server running on port 3000</p>
        </div>
      </main>
    </div>
  );
}
