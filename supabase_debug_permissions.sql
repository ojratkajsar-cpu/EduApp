-- 1. Drop the policy if it exists (to fix the error)
DROP POLICY IF EXISTS "Teachers/Admins can view all progress" ON public.user_progress;

-- 2. Create the policy again
CREATE POLICY "Teachers/Admins can view all progress"
ON public.user_progress
FOR SELECT
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('teacher', 'admin')
  )
);

-- 3. Check your current role (Run this to see if you are really admin)
SELECT id, email, role FROM public.profiles 
WHERE id = auth.uid();
