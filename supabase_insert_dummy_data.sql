-- Insert dummy progress for the current user
INSERT INTO public.user_progress (user_id, course_id, lesson_id, completed, quiz_passed)
VALUES 
  (auth.uid(), 'math-1', 'math-1-1', true, true),
  (auth.uid(), 'math-1', 'math-1-2', true, true),
  (auth.uid(), 'physics-1', 'physics-1-1', true, false)
ON CONFLICT (user_id, course_id, lesson_id) DO NOTHING;

-- Verification
SELECT * FROM public.user_progress;
