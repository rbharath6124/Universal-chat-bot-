-- supabase_programs_schema.sql
-- Run this script in your Supabase SQL Editor to setup the new domains and programs architecture.

-- 1. Create main_domains table
CREATE TABLE IF NOT EXISTS public.main_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create subdomains table
CREATE TABLE IF NOT EXISTS public.subdomains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    main_domain_id UUID NOT NULL REFERENCES public.main_domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    tagline TEXT,
    status TEXT DEFAULT 'draft',
    price INTEGER DEFAULT 0,
    old_price INTEGER,
    duration TEXT,
    enrollments INTEGER DEFAULT 0,
    rating TEXT,
    blurb TEXT,
    level TEXT,
    color TEXT,
    tags TEXT[],
    overview TEXT,
    who_should_enroll TEXT[],
    what_you_learn TEXT[],
    tools_covered TEXT[],
    modules JSONB,
    projects JSONB,
    mentors JSONB,
    certificate TEXT,
    includes TEXT[],
    faqs JSONB,
    main_domain_id UUID REFERENCES public.main_domains(id) ON DELETE SET NULL,
    subdomain_id UUID REFERENCES public.subdomains(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable RLS
ALTER TABLE public.main_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Public read, authenticated operations handled securely or open for MVP)
-- For this setup, we'll allow public reads, and let the frontend handle admin checks, 
-- or you can secure writes behind authenticated roles later.
CREATE POLICY "Enable read access for all users on main_domains" ON public.main_domains FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users on main_domains (temp MVP)" ON public.main_domains FOR ALL USING (true);

CREATE POLICY "Enable read access for all users on subdomains" ON public.subdomains FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users on subdomains (temp MVP)" ON public.subdomains FOR ALL USING (true);

CREATE POLICY "Enable read access for all users on programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users on programs (temp MVP)" ON public.programs FOR ALL USING (true);

-- 6. Seed Main Domains
INSERT INTO public.main_domains (name, slug) 
VALUES 
    ('Engineering Domains', 'engineering-domains'),
    ('Non-Engineering Domains', 'non-engineering-domains')
ON CONFLICT (slug) DO NOTHING;

-- 7. Seed Subdomains
DO $$
DECLARE
    eng_id UUID;
    non_eng_id UUID;
BEGIN
    SELECT id INTO eng_id FROM public.main_domains WHERE slug = 'engineering-domains';
    SELECT id INTO non_eng_id FROM public.main_domains WHERE slug = 'non-engineering-domains';

    IF eng_id IS NOT NULL THEN
        INSERT INTO public.subdomains (main_domain_id, name, slug) VALUES 
            (eng_id, 'Computer Science', 'computer-science'),
            (eng_id, 'Electronics & Electricals', 'electronics-electricals'),
            (eng_id, 'Mechanical/Civil', 'mechanical-civil')
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    IF non_eng_id IS NOT NULL THEN
        INSERT INTO public.subdomains (main_domain_id, name, slug) VALUES 
            (non_eng_id, 'Medical Domains', 'medical-domains'),
            (non_eng_id, 'Management & Commerce', 'management-commerce'),
            (non_eng_id, 'Miscellaneous', 'miscellaneous')
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;
