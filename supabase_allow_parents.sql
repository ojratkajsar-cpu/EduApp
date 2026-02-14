-- 1. DROP POLICY IF EXISTS
DROP POLICY IF EXISTS "Teachers/Admins can view all progress" ON public.user_progress;

-- 2. CREATE POLICY allowing Parents too
CREATE POLICY "Teachers/Admins/Parents can view all progress"
ON public.user_progress
FOR SELECT
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('teacher', 'admin', 'parent')
  )
);

-- 3. Verify roles
SELECT id, email, role FROM public.profiles WHERE id = auth.uid();
