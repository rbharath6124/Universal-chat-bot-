-- ====================================================
-- Campus Ambassador Applications Table
-- ====================================================

CREATE TABLE IF NOT EXISTS public.campus_ambassador_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  branch TEXT NOT NULL,
  linkedin_url TEXT,
  instagram_handle TEXT,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'interview_scheduled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campus_ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (submit applications)
CREATE POLICY "Public insert campus ambassador apps"
  ON public.campus_ambassador_applications
  FOR INSERT
  WITH CHECK (true);

-- Admin can do everything
CREATE POLICY "Admin full access campus ambassador apps"
  ON public.campus_ambassador_applications
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'rbharath0467@gmail.com');

-- Allow public to read their own application by email (optional, for status tracking)
CREATE POLICY "Users read own campus ambassador app"
  ON public.campus_ambassador_applications
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);
