-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
-- This table extends the default Supabase auth.users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  paddle_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_temp BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  share_slug TEXT UNIQUE NOT NULL,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'password', 'private')),
  password_hash TEXT,
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIDEOS TABLE
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('youtube', 'vimeo', 'tiktok', 'instagram', 'drive', 'dropbox', 'direct')),
  title TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  source_note TEXT,
  version_of UUID REFERENCES public.videos(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GUEST SESSIONS TABLE
CREATE TABLE public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  cookie_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMENTS TABLE
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE SET NULL,
  timestamp_seconds FLOAT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')),
  plan_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_slug ON projects(share_slug);
CREATE INDEX idx_projects_temp ON projects(is_temp, expires_at);
CREATE INDEX idx_videos_project ON videos(project_id);
CREATE INDEX idx_comments_video ON comments(video_id);
CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_guest_sessions_token ON guest_sessions(cookie_token);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Public projects are viewable by everyone" 
  ON public.projects FOR SELECT 
  USING (true); -- We'll refine this for 'private' projects later

CREATE POLICY "Users can create projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id OR is_temp = true);

CREATE POLICY "Owners can update their projects" 
  ON public.projects FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their projects" 
  ON public.projects FOR DELETE 
  USING (auth.uid() = owner_id);

-- Videos Policies
CREATE POLICY "Videos are viewable by everyone with access to project" 
  ON public.videos FOR SELECT 
  USING (true);

CREATE POLICY "Project owners can insert videos" 
  ON public.videos FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND (owner_id = auth.uid() OR is_temp = true)
    )
  );

CREATE POLICY "Project owners can update videos" 
  ON public.videos FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete videos" 
  ON public.videos FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND owner_id = auth.uid()
    )
  );

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (true); -- We'll validate permissions in the API

CREATE POLICY "Authors can delete their own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = author_id);

CREATE POLICY "Project owners can delete any comment" 
  ON public.comments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND owner_id = auth.uid()
    )
  );


-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE REALTIME FOR COMMENTS
-- This allows real-time subscriptions to work
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Enable realtime for the comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;
