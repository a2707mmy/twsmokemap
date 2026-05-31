import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/**
 * Supabase client。未設定環境變數時為 null，
 * 此時資料層會 fallback 到內建範例資料（demo 模式），
 * 讓網站在尚未接後端時也能展示與截圖。
 */
export const supabase: SupabaseClient | null = HAS_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
