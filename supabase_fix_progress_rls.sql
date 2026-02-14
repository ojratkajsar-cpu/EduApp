-- Allow Teachers and Admins to view all student progress
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

-- Note: We use 'exists' with a subquery on profiles.
-- The profiles table has RLS that allows users to read their own profile.
-- So this check securely confirms if the current user is a teacher or admin.
