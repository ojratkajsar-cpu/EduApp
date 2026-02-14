-- Удаление 4 тестовых аккаунтов студентов
-- НЕ трогаем админа Kaisaroirat (dbf1f423-01d9-41c4-b71e-4f6be3...)

-- 1. Удаляем связанные данные (каскад сработает автоматически, но на всякий случай)
DELETE FROM public.user_progress WHERE user_id IN (
    SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.user_links WHERE student_id IN (
    SELECT id FROM public.profiles WHERE role = 'student'
) OR parent_id IN (
    SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.user_settings WHERE user_id IN (
    SELECT id FROM public.profiles WHERE role = 'student'
);

-- 2. Удаляем профили студентов
DELETE FROM public.profiles WHERE role = 'student';

-- 3. Удаляем самих пользователей из auth.users
-- (нужно запустить эту часть отдельно если каскад не сработал)
DELETE FROM auth.users WHERE id NOT IN (
    SELECT id FROM public.profiles
);

-- 4. Проверка — должен остаться только админ
SELECT id, full_name, role FROM public.profiles;
