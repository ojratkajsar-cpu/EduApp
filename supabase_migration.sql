-- =============================================
-- EduApp Database Schema
-- Run this in Supabase SQL Editor for ekotelgvmdgafjelasam
-- =============================================

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('mathematics', 'physics', 'languages')),
    thumbnail_url TEXT,
    lessons_count INTEGER DEFAULT 0,
    duration TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_id TEXT,
    duration TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]',
    correct_answer_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    quiz_passed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, course_id, lesson_id)
);

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'kk')),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);

-- =============================================
-- Insert Data
-- =============================================

-- Insert courses
INSERT INTO public.courses (id, title, description, category, thumbnail_url, lessons_count, duration, level) VALUES
('math-1', 'course-math-1-title', 'course-math-1-desc', 'mathematics', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop', 3, '2h 30m', 'beginner'),
('math-2', 'course-math-2-title', 'course-math-2-desc', 'mathematics', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop', 3, '1h 45m', 'intermediate'),
('physics-1', 'course-physics-1-title', 'course-physics-1-desc', 'physics', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop', 3, '3h 15m', 'beginner'),
('physics-2', 'course-physics-2-title', 'course-physics-2-desc', 'physics', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop', 3, '2h 00m', 'advanced'),
('lang-1', 'course-lang-1-title', 'course-lang-1-desc', 'languages', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop', 3, '2h 45m', 'beginner'),
('lang-2', 'course-lang-2-title', 'course-lang-2-desc', 'languages', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop', 3, '1h 30m', 'intermediate')
ON CONFLICT (id) DO NOTHING;

-- Insert lessons
INSERT INTO public.lessons (id, course_id, title, description, video_id, duration, "order") VALUES
('math-1-1', 'math-1', 'lesson-math-1-1-title', 'lesson-math-1-1-desc', '8hBEpVKMDLg', '12:30', 1),
('math-1-2', 'math-1', 'lesson-math-1-2-title', 'lesson-math-1-2-desc', '8hBEpVKMDLg', '15:45', 2),
('math-1-3', 'math-1', 'lesson-math-1-3-title', 'lesson-math-1-3-desc', '8hBEpVKMDLg', '18:20', 3),
('math-2-1', 'math-2', 'lesson-math-2-1-title', 'lesson-math-2-1-desc', 'dQw4w9WgXcQ', '14:00', 1),
('math-2-2', 'math-2', 'lesson-math-2-2-title', 'lesson-math-2-2-desc', 'dQw4w9WgXcQ', '16:30', 2),
('math-2-3', 'math-2', 'lesson-math-2-3-title', 'lesson-math-2-3-desc', 'dQw4w9WgXcQ', '19:15', 3),
('physics-1-1', 'physics-1', 'lesson-physics-1-1-title', 'lesson-physics-1-1-desc', 'eVgokiqERI8', '11:45', 1),
('physics-1-2', 'physics-1', 'lesson-physics-1-2-title', 'lesson-physics-1-2-desc', 'eVgokiqERI8', '13:20', 2),
('physics-1-3', 'physics-1', 'lesson-physics-1-3-title', 'lesson-physics-1-3-desc', 'eVgokiqERI8', '17:00', 3),
('physics-2-1', 'physics-2', 'lesson-physics-2-1-title', 'lesson-physics-2-1-desc', 'dQw4w9WgXcQ', '18:00', 1),
('physics-2-2', 'physics-2', 'lesson-physics-2-2-title', 'lesson-physics-2-2-desc', 'dQw4w9WgXcQ', '16:45', 2),
('physics-2-3', 'physics-2', 'lesson-physics-2-3-title', 'lesson-physics-2-3-desc', 'dQw4w9WgXcQ', '22:00', 3),
('lang-1-1', 'lang-1', 'lesson-lang-1-1-title', 'lesson-lang-1-1-desc', 'ATaNvqPSZEI', '10:00', 1),
('lang-1-2', 'lang-1', 'lesson-lang-1-2-title', 'lesson-lang-1-2-desc', 'ATaNvqPSZEI', '12:30', 2),
('lang-1-3', 'lang-1', 'lesson-lang-1-3-title', 'lesson-lang-1-3-desc', 'ATaNvqPSZEI', '15:00', 3),
('lang-2-1', 'lang-2', 'lesson-lang-2-1-title', 'lesson-lang-2-1-desc', 'dQw4w9WgXcQ', '14:00', 1),
('lang-2-2', 'lang-2', 'lesson-lang-2-2-title', 'lesson-lang-2-2-desc', 'dQw4w9WgXcQ', '12:45', 2),
('lang-2-3', 'lang-2', 'lesson-lang-2-3-title', 'lesson-lang-2-3-desc', 'dQw4w9WgXcQ', '16:30', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert quizzes
INSERT INTO public.quizzes (id, lesson_id, question, options, correct_answer_index) VALUES
('quiz-math-1-1', 'math-1-1', 'quiz-math-1-1-q', '["quiz-math-1-1-o0","quiz-math-1-1-o1","quiz-math-1-1-o2","quiz-math-1-1-o3"]', 0),
('quiz-math-1-2', 'math-1-2', 'quiz-math-1-2-q', '["quiz-math-1-2-o0","quiz-math-1-2-o1","quiz-math-1-2-o2","quiz-math-1-2-o3"]', 1),
('quiz-math-1-3', 'math-1-3', 'quiz-math-1-3-q', '["quiz-math-1-3-o0","quiz-math-1-3-o1","quiz-math-1-3-o2","quiz-math-1-3-o3"]', 1),
('quiz-math-2-1', 'math-2-1', 'quiz-math-2-1-q', '["quiz-math-2-1-o0","quiz-math-2-1-o1","quiz-math-2-1-o2","quiz-math-2-1-o3"]', 2),
('quiz-math-2-2', 'math-2-2', 'quiz-math-2-2-q', '["quiz-math-2-2-o0","quiz-math-2-2-o1","quiz-math-2-2-o2","quiz-math-2-2-o3"]', 1),
('quiz-math-2-3', 'math-2-3', 'quiz-math-2-3-q', '["quiz-math-2-3-o0","quiz-math-2-3-o1","quiz-math-2-3-o2","quiz-math-2-3-o3"]', 1),
('quiz-physics-1-1', 'physics-1-1', 'quiz-physics-1-1-q', '["quiz-physics-1-1-o0","quiz-physics-1-1-o1","quiz-physics-1-1-o2","quiz-physics-1-1-o3"]', 1),
('quiz-physics-1-2', 'physics-1-2', 'quiz-physics-1-2-q', '["quiz-physics-1-2-o0","quiz-physics-1-2-o1","quiz-physics-1-2-o2","quiz-physics-1-2-o3"]', 1),
('quiz-physics-1-3', 'physics-1-3', 'quiz-physics-1-3-q', '["quiz-physics-1-3-o0","quiz-physics-1-3-o1","quiz-physics-1-3-o2","quiz-physics-1-3-o3"]', 1),
('quiz-physics-2-1', 'physics-2-1', 'quiz-physics-2-1-q', '["quiz-physics-2-1-o0","quiz-physics-2-1-o1","quiz-physics-2-1-o2","quiz-physics-2-1-o3"]', 1),
('quiz-physics-2-2', 'physics-2-2', 'quiz-physics-2-2-q', '["quiz-physics-2-2-o0","quiz-physics-2-2-o1","quiz-physics-2-2-o2","quiz-physics-2-2-o3"]', 1),
('quiz-physics-2-3', 'physics-2-3', 'quiz-physics-2-3-q', '["quiz-physics-2-3-o0","quiz-physics-2-3-o1","quiz-physics-2-3-o2","quiz-physics-2-3-o3"]', 1),
('quiz-lang-1-1', 'lang-1-1', 'quiz-lang-1-1-q', '["quiz-lang-1-1-o0","quiz-lang-1-1-o1","quiz-lang-1-1-o2","quiz-lang-1-1-o3"]', 2),
('quiz-lang-1-2', 'lang-1-2', 'quiz-lang-1-2-q', '["quiz-lang-1-2-o0","quiz-lang-1-2-o1","quiz-lang-1-2-o2","quiz-lang-1-2-o3"]', 1),
('quiz-lang-1-3', 'lang-1-3', 'quiz-lang-1-3-q', '["quiz-lang-1-3-o0","quiz-lang-1-3-o1","quiz-lang-1-3-o2","quiz-lang-1-3-o3"]', 0),
('quiz-lang-2-1', 'lang-2-1', 'quiz-lang-2-1-q', '["quiz-lang-2-1-o0","quiz-lang-2-1-o1","quiz-lang-2-1-o2","quiz-lang-2-1-o3"]', 2),
('quiz-lang-2-2', 'lang-2-2', 'quiz-lang-2-2-q', '["quiz-lang-2-2-o0","quiz-lang-2-2-o1","quiz-lang-2-2-o2","quiz-lang-2-2-o3"]', 1),
('quiz-lang-2-3', 'lang-2-3', 'quiz-lang-2-3-q', '["quiz-lang-2-3-o0","quiz-lang-2-3-o1","quiz-lang-2-3-o2","quiz-lang-2-3-o3"]', 1)
ON CONFLICT (id) DO NOTHING;
