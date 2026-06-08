-- Complete Supabase Schema for Enterprise EdTech SaaS
-- Run this in your Supabase SQL Editor

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    enrolled_programs TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Programs Table (Audit / Update)
-- Ensuring the necessary fields exist
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    tagline TEXT,
    status TEXT DEFAULT 'draft',
    price NUMERIC DEFAULT 0,
    old_price NUMERIC,
    duration TEXT,
    rating TEXT DEFAULT '5.0',
    main_domain_id UUID,
    subdomain_id UUID,
    blurb TEXT,
    level TEXT,
    color TEXT,
    tags TEXT[] DEFAULT '{}',
    overview TEXT,
    who_should_enroll TEXT[] DEFAULT '{}',
    what_you_learn TEXT[] DEFAULT '{}',
    tools_covered TEXT[] DEFAULT '{}',
    includes TEXT[] DEFAULT '{}',
    modules JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    mentors JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    certificate TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Job Listings Table
CREATE TABLE IF NOT EXISTS public.job_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    salary_package TEXT,
    hiring_type TEXT,
    experience_required TEXT,
    domain TEXT,
    description TEXT,
    technologies TEXT[] DEFAULT '{}',
    application_link TEXT,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_initials TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    experience TEXT,
    linkedin_url TEXT,
    resume_url TEXT,
    why_hire TEXT,
    status TEXT DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Setup Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 7. Policies

-- Only the Super Admin email can manage these tables via the UI
-- We verify the user's email matching rbharath0467@gmail.com

-- Employees Policy
CREATE POLICY "Admin full access employees" ON public.employees
FOR ALL USING (auth.jwt() ->> 'email' = 'rbharath0467@gmail.com');

-- Students Policy
CREATE POLICY "Admin full access students" ON public.students
FOR ALL USING (auth.jwt() ->> 'email' = 'rbharath0467@gmail.com');

-- Programs Policy (Public can read, Admin can manage)
CREATE POLICY "Public read programs" ON public.programs
FOR SELECT USING (true);

CREATE POLICY "Admin full access programs" ON public.programs
FOR ALL USING (auth.jwt() ->> 'email' = 'rbharath0467@gmail.com');

-- Job Listings Policy (Public can read, Admin can manage)
CREATE POLICY "Public read jobs" ON public.job_listings
FOR SELECT USING (true);

CREATE POLICY "Admin full access jobs" ON public.job_listings
FOR ALL USING (auth.jwt() ->> 'email' = 'rbharath0467@gmail.com');

-- Job Applications Policy (Public can insert, Admin can manage)
CREATE POLICY "Public insert job apps" ON public.job_applications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access job apps" ON public.job_applications
FOR ALL USING (auth.jwt() ->> 'email' = 'rbharath0467@gmail.com');

-- Create Realtime publications
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.job_applications;
alter publication supabase_realtime add table public.employees;
