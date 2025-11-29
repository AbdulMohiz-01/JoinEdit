# JointEdit

**Timestamped video feedback — fast.**

Get precise, timestamped feedback on your videos. Share a link, collaborate in real-time, and streamline your video review process.

## 🚀 Features

- **Guest Flow**: Paste a video link, get a shareable review link instantly (no signup required)
- **Timestamped Comments**: Add comments directly on the video timeline
- **Real-time Collaboration**: See comments appear instantly with Supabase Realtime
- **Multi-platform Support**: YouTube, Vimeo, TikTok, Instagram, Google Drive, Dropbox
- **Pro Features**: Unlimited projects, password protection, custom branding, exports (PDF/CSV/SRT), version control

## 🛠️ Tech Stack

- **Frontend/API**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage)
- **Payments**: Paddle
- **Email**: Resend
- **Video Player**: React Player
- **Monitoring**: Sentry
- **Analytics**: Google Analytics 4
- **CDN/Security**: Cloudflare

## 📦 Installation

```bash
# Clone the repository
git clone git@github.com:AbdulMohiz-01/JoinEdit.git
cd JoinEdit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Development Status

### ✅ Completed Iterations

- **Iteration 1.1**: Next.js Project Setup
  - Next.js 14+ with App Router, TypeScript, Tailwind CSS
  - Core dependencies installed (Supabase, Framer Motion, Zod, React Hook Form)
  - Project structure created
  - Environment variables template

### 🚧 In Progress

- **Iteration 1.2**: Supabase Setup & Database Schema

### 📋 Upcoming

See [implementation_plan.md](.gemini/antigravity/brain/75198d20-8249-41b7-92c7-760150e13b8f/implementation_plan.md) for the complete modular development plan.

## 📝 Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `PADDLE_*` - Paddle payment integration
- `RESEND_API_KEY` - Resend email API key
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error monitoring

## 🤝 Contributing

This is a modular development project. Each iteration is self-contained and can be built independently. See the implementation plan for details.

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ by the JointEdit team
