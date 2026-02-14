-- Insert dummy data using your email to find the ID
WITH target_user AS (
  SELECT id FROM auth.users WHERE email = 'ojratkajsar@gmail.com' LIMIT 1
)
INSERT INTO public.user_progress (user_id, course_id, lesson_id, completed, quiz_passed)
SELECT id, 'math-1', 'math-1-1', true, true FROM target_user
UNION ALL
SELECT id, 'math-1', 'math-1-2', true, true FROM target_user
UNION ALL
SELECT id, 'physics-1', 'physics-1-1', true, false FROM target_user
ON CONFLICT (user_id, course_id, lesson_id) DO NOTHING;

-- Enable RLS back (security on)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
