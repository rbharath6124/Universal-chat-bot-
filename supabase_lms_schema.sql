-- supabase_lms_schema.sql
-- Run this script in your Supabase SQL Editor to setup the LMS architecture.

-- 1. Create lms_modules table
CREATE TABLE IF NOT EXISTS public.lms_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create lms_lessons table
CREATE TABLE IF NOT EXISTS public.lms_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.lms_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    google_drive_file_id TEXT,
    duration TEXT,
    order_index INTEGER DEFAULT 1,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create lms_progress table
CREATE TABLE IF NOT EXISTS public.lms_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- For future auth
    lesson_id UUID REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, lesson_id)
);

-- 4. Create lms_purchases table
CREATE TABLE IF NOT EXISTS public.lms_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- For future auth
    course_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, course_id)
);

-- 5. Enable RLS
ALTER TABLE public.lms_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_purchases ENABLE ROW LEVEL SECURITY;

-- 6. Create Policies (MVP public access)
CREATE POLICY "Enable all access for all users on lms_modules (temp MVP)" ON public.lms_modules FOR ALL USING (true);
CREATE POLICY "Enable all access for all users on lms_lessons (temp MVP)" ON public.lms_lessons FOR ALL USING (true);
CREATE POLICY "Enable all access for all users on lms_progress (temp MVP)" ON public.lms_progress FOR ALL USING (true);
CREATE POLICY "Enable all access for all users on lms_purchases (temp MVP)" ON public.lms_purchases FOR ALL USING (true);
