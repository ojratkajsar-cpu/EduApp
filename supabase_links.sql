-- =============================================
-- Parent/Teacher to Student linking
-- Run this in Supabase SQL Editor
-- =============================================

-- Table for linking parents/teachers to students
CREATE TABLE IF NOT EXISTS public.user_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(parent_id, student_id)
);

ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;

-- Parents/teachers can see their own links
CREATE POLICY "Users can view own links" ON public.user_links
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own links" ON public.user_links
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can delete own links" ON public.user_links
    FOR DELETE USING (auth.uid() = parent_id);

-- Allow parents/teachers to view student progress
CREATE POLICY "Parents can view linked student progress" ON public.user_progress
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.user_links 
            WHERE parent_id = auth.uid() AND student_id = user_progress.user_id
        )
    );

-- Allow parents/teachers to view linked student profiles
CREATE POLICY "Parents can view linked student profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id
        OR
        EXISTS (
            SELECT 1 FROM public.user_links 
            WHERE parent_id = auth.uid() AND student_id = profiles.id
        )
    );

-- Allow viewing profiles by email for search
CREATE POLICY "Authenticated users can search profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Drop old restrictive policy if exists
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;

CREATE INDEX IF NOT EXISTS idx_user_links_parent ON public.user_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_links_student ON public.user_links(student_id);
