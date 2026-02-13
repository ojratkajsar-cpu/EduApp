-- =============================================
-- Add approval system for student tracking
-- Run this in Supabase SQL Editor
-- =============================================

-- Add status column to user_links
ALTER TABLE public.user_links 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Allow students to see link requests where they are the student
CREATE POLICY "Students can view link requests" ON public.user_links
    FOR SELECT USING (auth.uid() = student_id);

-- Allow students to update (approve/reject) link requests
CREATE POLICY "Students can update link status" ON public.user_links
    FOR UPDATE USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- Update the parent progress view policy - only approved links
DROP POLICY IF EXISTS "Parents can view linked student progress" ON public.user_progress;
CREATE POLICY "Parents can view approved student progress" ON public.user_progress
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.user_links 
            WHERE parent_id = auth.uid() 
            AND student_id = user_progress.user_id
            AND status = 'approved'
        )
    );

-- Update profile view for approved links only
DROP POLICY IF EXISTS "Parents can view linked student profiles" ON public.profiles;
CREATE POLICY "Parents can view approved student profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id
        OR
        EXISTS (
            SELECT 1 FROM public.user_links 
            WHERE parent_id = auth.uid() 
            AND student_id = profiles.id
            AND status = 'approved'
        )
    );

-- Function to get pending requests count for a student
CREATE OR REPLACE FUNCTION public.get_pending_requests_count(user_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.user_links
    WHERE student_id = user_uuid AND status = 'pending';
$$ LANGUAGE sql SECURITY DEFINER;
