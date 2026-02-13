-- =============================================
-- ПОЛНАЯ НАСТРОЙКА базы данных EduApp
-- Запустите ВЕСЬ этот файл в Supabase SQL Editor
-- =============================================

-- 1. Создать таблицу связей (если не создана)
CREATE TABLE IF NOT EXISTS public.user_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(parent_id, student_id)
);

-- Добавить колонку status если таблица уже существует
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_links' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.user_links ADD COLUMN status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;

-- 2. Удалить старые политики (чтобы избежать ошибок "already exists")
DROP POLICY IF EXISTS "Users can view own links" ON public.user_links;
DROP POLICY IF EXISTS "Users can insert own links" ON public.user_links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.user_links;
DROP POLICY IF EXISTS "Students can view link requests" ON public.user_links;
DROP POLICY IF EXISTS "Students can update link status" ON public.user_links;
DROP POLICY IF EXISTS "Parents can view linked student progress" ON public.user_progress;
DROP POLICY IF EXISTS "Parents can view approved student progress" ON public.user_progress;
DROP POLICY IF EXISTS "Parents can view linked student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Parents can view approved student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Authenticated users can search profiles" ON public.profiles;

-- 3. Создать политики для user_links
CREATE POLICY "Users can view own links" ON public.user_links
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own links" ON public.user_links
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can delete own links" ON public.user_links
    FOR DELETE USING (auth.uid() = parent_id);

CREATE POLICY "Students can view link requests" ON public.user_links
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update link status" ON public.user_links
    FOR UPDATE USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- 4. Политики для просмотра прогресса
CREATE POLICY "Users and parents can view progress" ON public.user_progress
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

-- 5. Политики для просмотра профилей
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Индексы
CREATE INDEX IF NOT EXISTS idx_user_links_parent ON public.user_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_links_student ON public.user_links(student_id);

-- 7. Функция поиска ученика по email
CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email TEXT)
RETURNS TABLE (id UUID, full_name TEXT, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.role
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE u.email = search_email
    AND p.role = 'student';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Проверка
SELECT 'Все настроено!' as result;
