-- =============================================
-- Function to find user by email
-- Run this in Supabase SQL Editor
-- =============================================

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
