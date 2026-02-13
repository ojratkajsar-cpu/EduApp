-- =============================================
-- Auto-create profile on signup + role management
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Trigger: auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'student',
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (user_id, theme, language, updated_at)
    VALUES (
        NEW.id,
        'light',
        'ru',
        now()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Allow service_role (admin via dashboard) to manage all profiles
CREATE POLICY "Service role can manage all profiles" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Allow public read of profiles (for displaying names)
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Update existing users - create profiles for users who already registered
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    'student',
    now(),
    now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
