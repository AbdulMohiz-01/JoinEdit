Great — below is the updated, developer-friendly specification for JointEdit that fully incorporates your decisions and suggestions.
It’s written as a single living document you can paste into Notion, GitHub, or share with engineers.
## JointEdit — Updated Technical Plan (Serverless / Next.js / Supabase)
Author: Shamir Afridi
Version: 1.1
Date: (updated)
High-level decisions you made
- Frontend + serverless API: Next.js (App Router) on Vercel
- Auth, DB, Realtime, Storage: Supabase
- Payments: Paddle
- Email: Resend
- Video metadata: YouTube Data API v3 (API key), plus oEmbed for Vimeo / TikTok / Instagram
- Support direct public links from Google Drive / Dropbox
- PDF export supported (serverless-friendly generation)
- Error monitoring: Sentry
- Metrics & heatmaps: GA4 for analytics; add a lightweight heatmap tool (Hotjar/FullStory/PostHog) as desired
- CDN / WAF / rate-limiting / security: Cloudflare
### 1 — Short summary of behaviour
#### Guest (User 1 — unauthenticated)
- Pastes link on landing (www.jointedit.com hero input) → POST /api/projects/temp-create → temp project created with expires_at = now() + 24h.
- Link sharer + reviewers can comment freely for 24 hours. Reviewers supply a name (saved in short cookie or guest_sessions). Unlimited messages for the lifespan.
- Temp projects cleaned up automatically by scheduled job.
#### Authenticated (User 2 — free)
- Signs up via Supabase (email). Redirects to app.jointedit.com.
- Can create 1 project. Can add up to 10 videos in that project. Can rename project, edit/delete videos, see thumbnails/title/source. Click video → enters comment area with full commenting features.
#### Authenticated Paid (User 3 — Pro)
- Unlimited projects and unlimited videos.
- Pro feature set (below) including password-protection, custom branding, version control, exports, teams, SSO later, priority support.
### 2 — Data model (Postgres / Supabase)
#### users (managed by Supabase auth + mirrored fields)
- id (uuid) — Supabase auth.users.id
- email, display_name
- is_pro (bool) — updated by Paddle webhook
- paddle_customer_id (string)
- created_at
#### projects
- id (uuid)
- owner_id (nullable uuid) — null for temp projects
- title (string)
- description (text)
- is_temp (bool)
- expires_at (timestamp) — for temp projects
- share_slug (string) — short share token
- privacy (enum: public, password, private)
- branding (json) — for custom branding (logo URL, colors)
- created_at, updated_at
#### videos
- id (uuid)
- project_id (uuid)
- video_url (text)
- provider (enum: youtube, vimeo, tiktok, instagram, drive, dropbox, direct)
- title, thumbnail_url, duration_seconds
- source_note (string) — e.g., “uploaded via Dropbox”
- version_of (uuid nullable) — points to previous video if versioned
- created_at, updated_at
#### video_versions
- id, video_id, video_url, meta_json, created_at
(If you prefer separate version table instead of version_of on videos)
#### comments
- id (uuid)
- project_id (uuid)
- video_id (uuid)
- author_id (uuid nullable) — if authenticated
- author_name (string) — guest or user display name
- guest_session_id (uuid nullable)
- timestamp_seconds (float)
- content (text)
- created_at
#### guest_sessions
- id (uuid)
- project_id (uuid)
- guest_name (string)
- cookie_token (string) — stored in browser cookie to persist guest identity
- expires_at (timestamp) — same as project expiry or shorter
- created_at
#### subscriptions
- id (uuid)
- user_id (uuid)
- paddle_subscription_id (string)
- status (active, canceled, past_due)
- plan_id, created_at, updated_at
### 3 — Serverless API Endpoints (Next.js /app/api/*)
> Protect routes using Supabase JWT. Use middleware to check is_pro and per-user quotas.
#### Guest / Temporary Flow
- POST /api/projects/temp-create
Body: { videoUrl, title?, ownerEmail? (optional) }
Creates projects row with is_temp=true, expires_at=now()+24h, generates share_slug. Returns { projectId, shareUrl }. Set guest cookie if name provided.
- GET /api/projects/temp/:slug
Public read endpoint — returns project, videos, comments (if not expired).
- POST /api/guest/set-name
Body: { projectId, name }
Creates guest_sessions entry, issues guest_session_token cookie.
#### Auth & Dashboard (protected)
- POST /api/projects/create — create project (check free user limit 1).
Body: { title, description, privacy? }
- GET /api/projects — list user's projects (with counts + thumbnails).
- GET /api/projects/:id — project details (auth/ownership checks).
- PATCH /api/projects/:id — update title/description/privacy/branding.
- DELETE /api/projects/:id — soft-delete.
#### Videos
- POST /api/projects/:projectId/videos/add
Body: { videoUrl, title? }
→ Validate URL, fetch metadata (oEmbed or YouTube Data API), persist videos row + thumbnail. Enforce per-project limits (10 for free user).
- GET /api/projects/:projectId/videos — list videos.
- PATCH /api/projects/:projectId/videos/:videoId — edit title/notes.
- DELETE /api/projects/:projectId/videos/:videoId
- POST /api/projects/:projectId/videos/:videoId/version — add a new version (save previous to versions table).
#### Comments / Realtime
- POST /api/comments/add
Body: { projectId, videoId, timestamp, content, authorName? }
→ Insert comment; broadcast via Supabase Realtime or server-sent events. Trigger notification email (Resend) to owner if enabled.
- GET /api/comments/:videoId — paginated.
- DELETE /api/comments/:id — owner or authenticated author only.
#### Exports
- GET /api/export/:projectId/comments.pdf — generates PDF (serverless-friendly library). Returns file URL (can store temp in Supabase Storage).
- GET /api/export/:projectId/comments.csv — returns CSV.
- GET /api/export/:projectId/comments.srt — generates SRT with timestamps & comments.
#### Billing — Paddle
- POST /api/billing/paddle/create-checkout — create Paddle checkout link for logged-in user.
- POST /api/billing/paddle/webhook — Paddle webhook receiver. Verify signature, update subscriptions and users.is_pro.
- GET /api/billing/status — returns current subscription status.
#### Notifications & Emails (Resend)
- POST /api/notifications/comment — send email when new comment (owner email, can be batched).
- POST /api/notifications/invite — send invite to reviewer.
#### Utilities
- POST /api/video/metadata — Body: { videoUrl } → return { provider, title, duration, thumbnail } using YouTube Data API or oEmbed fallbacks.
- GET /api/health
- POST /api/admin/cleanup-expired — cron endpoint (secured) for cleaning expired projects / guest_sessions. Can be invoked by Vercel Cron or Supabase Scheduled Function.
### 4 — Third-party services & usage summary
- Supabase — Auth, Postgres, Storage (thumbnails & export temp files), Realtime (comments), scheduled functions (optional).
- Paddle — Payments & subscription management + webhooks.
- Resend — Transactional emails. Alternatively, Supabase email for simple messages.
- YouTube Data API v3 — primary metadata source (requires API key). Use only for YouTube; fallback to oEmbed for others.
- oEmbed endpoints — Vimeo, TikTok, Instagram (for metadata when supported).
- Google Drive / Dropbox — accept direct public links; optionally integrate their APIs later.
- Sentry — error monitoring, alerts.
- GA4 — product & funnel analytics.
- Hotjar / FullStory / PostHog — heatmaps & session replays (choose one). Hotjar is simplest for heatmaps; PostHog is more privacy-friendly and self-hostable.
- Cloudflare — CDN, WAF, rate-limiting, bot protection.
- PDF generation — puppeteer (careful with serverless), or serverless-friendly libraries like chrome-aws-lambda + puppeteer-core, or third-party rendering API (if needed).
- React Player — frontend universal video embed library.
- lucide-react, tailwindcss, framer-motion — UI libraries.
### 5 — Guest 24-hour flow — implementation notes (concrete)
- temp-create:
	- Create projects row: is_temp = true, expires_at = now() + interval '24 hours', share_slug (8-char base62).
	- Create guest_sessions record only when guest sets a name; return guest_session_token cookie (httpOnly if possible; otherwise a standard cookie) with same expiry.
	- Return https://www.jointedit.com/r/:slug.
- Commenting:
	- Guest comments must include author_name. If guest_session_token cookie present, associate with guest_sessions.id.
- Cleanup:
	- Use Vercel Cron or Supabase Scheduled Function to call POST /api/admin/cleanup-expired every hour — soft-delete or fully delete projects and guest_sessions where expires_at < now().
- Rate-limiting & abuse:
	- Rate-limit temp-create per IP in Cloudflare (e.g., 10 per hour).
	- Apply CAPTCHA on high-frequency flows.
	- Validate videoUrl using video/metadata before creating project.
### 6 — Limits & enforcement (server-side checks)
- Free authenticated user (User2): max_projects = 1, max_videos_per_project = 10. Enforce on POST /api/projects/create and POST /api/projects/:id/videos/add.
- Pro (is_pro=true): unlimited_projects = true, unlimited_videos = true.
- Video metadata fetch failures: present graceful UI with "Unsupported link" guidance.
### 7 — Pro (paid) feature set (User3) — prioritized
Core (must-have for Pro)
1. Unlimited projects & unlimited videos
2. Password-protected share links per project
3. Custom branding (remove JointEdit logo, add logo & accent color)
4. Export: PDF, CSV, SRT (polished template)
5. Version control for videos (upload or link new version + history)
6. Priority support (email)
Next-wave (nice-to-have)
7. Team seats / collaborator roles (owner / editor / viewer)
8. Advanced analytics per project (views, commenters, response time)
9. Slack / Zapier integration for new comments
10. SSO (Google Workspace) for teams
11. Auto transcription + time-stamped search
### 8 — Landing page brief (minimalist + code-generated graphics)
You asked: no video, just code-rendered graphics showing workflow in a unique way. Key goals: “show, don’t tell”, minimal text, instant clarity.
#### Structure & content
- Hero
	- Headline: Timestamped video feedback — fast.
	- Subhead (one line): Paste a link. Share a review. Get precise feedback — no signup required.
	- Primary CTA: big input field (link placeholder) + Start Review button (this calls POST /api/projects/temp-create).
	- Small secondary CTAs: Sign up / Pricing
- Visual presentation (code-generated, not video)
	- Use SVG + CSS + small canvas animations to illustrate flow:
		- Left panel: stylized browser mock with a small player timeline drawn as SVG (boxes for frames).
		- Right panel: comment thread mock (bubbles appear and align to a timestamp marker).
		- Animate a single comment bubble sliding in and pinching to a timeline tick — uses framer-motion or vanilla CSS keyframes.
		- Add small microinteractions: hover states on timeline marks, highlight of current comment.
	- These assets are created using code (React components rendering SVG), not embedded video. This keeps page lightweight and unique.
- How-it-works strip (3 small steps, icons + one-liners)
	- Step 1: Paste link → Step 2: Share link → Step 3: Comment on timeline
- Pricing strip
	- 3 columns: Guest (temporary), Free account (3 projects), Pro (monthly). Minimal bullets.
- Footer
	- App link (app.jointedit.com), Privacy, Terms, Contact, Docs.
#### Visual/UX rules
- Max 1 accent color. Lots of whitespace.
- Use SVG illustrations built from code so you can tweak or animate them programmatically (e.g., highlight timestamps based on state).
- Keep copy to a minimum; rely on the interactive input + animated SVG to demonstrate value.
### 9 — Subdomains & routing notes
- www.jointedit.com — marketing + link input (guest flow). POST /api/projects/temp-create must accept requests from this domain.
- app.jointedit.com — authenticated application (dashboard, projects, paid features). Use Supabase auth redirect URI here.
- Project public share links: https://www.jointedit.com/r/:slug (public) or https://app.jointedit.com/projects/:id for owners.
- Configure Vercel to route both www and app to the same Next.js project with domain rewrites; or use separate projects if you prefer separation.
### 10 — Monitoring, analytics, security
- Errors / logs: Sentry integrated with Next.js serverless functions (capture errors, performance traces).
- Analytics: GA4 for funnels & activation; track events: paste_link, temp_create, comment_added, signup, upgrade_click, checkout_success.
- Heatmaps / session replay: Hotjar or FullStory or PostHog (choose based on privacy needs). Implement only on production.
- Security: Cloudflare WAF, IP rate-limiting on sensitive endpoints, CAPTCHA on temp-create if traffic spikes, sanitize comment content & escape on render to prevent XSS.
- Paddle webhook verification: Always verify signature and map to Supabase user id.
### 11 — PDF generation / exports
- Implement GET /api/export/:projectId/comments.pdf using a serverless-friendly approach:
	- Option A (in-proc): puppeteer + chrome-aws-lambda (works on Vercel with size considerations).
	- Option B (external render): call a lightweight HTML → PDF service (if cold-starts are problematic).
	- Store generated file in Supabase Storage with short-lived URL and delete after X days.
- CSV & SRT can be generated quickly in-memory and streamed to user.
### 12 — Scheduled jobs & cleanup
- Use Vercel Cron or Supabase scheduled function to call cleanup endpoint hourly:
	- Delete or archive projects and associated guest_sessions where expires_at < now().
### 13 — Dev & deployment checklist (MVP)
1. Repo scaffold: Next.js App Router + Tailwind + TypeScript.
2. Supabase project + tables (migrations SQL).
3. Implement temp-create + public review page + comments (use Supabase Realtime to push comments to clients).
4. Landing page with SVG/code graphics + link input.
5. Auth flow (Supabase) + dashboard (limit enforcement).
6. Video metadata service (oEmbed + YouTube API).
7. Paddle checkout + webhook handler (map subscription → users.is_pro).
8. Resend integration for email notifications.
9. PDF exports (initially TXT/CSV, add PDF once stable).
10. Integrate Sentry, GA4, and heatmap tool.
11. Cloudflare config for domains + rate-limits + WAF.
12. Vercel Cron job + cleanup script.
13. UI polish and Pro features rollout.