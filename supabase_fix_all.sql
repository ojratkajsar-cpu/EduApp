-- =============================================
-- FIX: Student Progress Visibility
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================

-- 1. Create user_links table (connects parents/teachers to students)
CREATE TABLE IF NOT EXISTS public.user_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(parent_id, student_id)
);

ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;

-- 2. RLS for user_links
CREATE POLICY "Users can view own links"
ON public.user_links FOR SELECT
USING (auth.uid() = parent_id OR auth.uid() = student_id);

CREATE POLICY "Users can insert links"
ON public.user_links FOR INSERT
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can delete own links"
ON public.user_links FOR DELETE
USING (auth.uid() = parent_id);

-- 3. Fix profiles RLS: allow viewing linked students' profiles
CREATE POLICY "Users can view linked students profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR
  id IN (
    SELECT student_id FROM public.user_links
    WHERE parent_id = auth.uid()
  )
);

-- Drop old restrictive policy (only view own profile)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 4. Fix user_progress RLS: allow viewing linked students' progress
CREATE POLICY "Users can view linked students progress"
ON public.user_progress FOR SELECT
USING (
  auth.uid() = user_id
  OR
  user_id IN (
    SELECT student_id FROM public.user_links
    WHERE parent_id = auth.uid()
  )
);

-- Drop old restrictive policy (only view own progress)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
-- Drop old teacher/admin policy if exists
DROP POLICY IF EXISTS "Teachers/Admins can view all progress" ON public.user_progress;
DROP POLICY IF EXISTS "Teachers/Admins/Parents can view all progress" ON public.user_progress;

-- 5. Re-enable RLS (in case it was disabled during debugging)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create find_user_by_email RPC function (for adding students by email)
CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email TEXT)
RETURNS TABLE(id UUID, full_name TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, p.full_name
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE au.email = search_email
  LIMIT 1;
END;
$$;

-- 7. Verify everything is set up
SELECT 'user_links table' as item, count(*) as count FROM public.user_links
UNION ALL
SELECT 'user_progress records', count(*) FROM public.user_progress
UNION ALL  
SELECT 'profiles', count(*) FROM public.profiles;
