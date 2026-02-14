-- DEBUG STEP: Disable RLS completely to see if data exists
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- Check if there is any data at all
SELECT count(*) as total_progress_records FROM public.user_progress;

-- Check your role again
SELECT email, role FROM public.profiles WHERE id = auth.uid();
