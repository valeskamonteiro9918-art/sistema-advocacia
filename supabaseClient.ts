import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcolcvdnpjukmobhhyzg.supabase.co';
const supabaseAnonKey = 'sb_publishable_tpj5FZKe6e7ysuKM6_K__g_m_1Gn-fK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
