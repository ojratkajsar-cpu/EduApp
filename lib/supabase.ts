import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ekotelgvmdgafjelasam.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Q3csT-SLDKG2zQZec09MIw_8rA1aI94';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
