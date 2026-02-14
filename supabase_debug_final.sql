-- 1. Disable RLS on user_progress to test visibility
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- 2. Check if there is any data (Result should be > 0)
SELECT count(*) as total_progress_records FROM public.user_progress;

-- 3. Check your role (Result should say 'admin' or 'teacher')
-- Removed 'email' as it is not in the profiles table
SELECT id, role FROM public.profiles WHERE id = auth.uid();
