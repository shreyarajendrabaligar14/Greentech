/**
 * Supabase Client & Persistence Service for CarbonTrack AI
 * Enables seamless cloud database storage with Supabase when configured.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload an activity record to Supabase
 */
export async function saveActivityToSupabase(activityData, userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([{ ...activityData, user_id: userId }])
      .select();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to save activity:', err.message);
    return null;
  }
}

/**
 * Fetch activities for a user from Supabase
 */
export async function getActivitiesFromSupabase(userId) {
  if (!supabase) return null;
  try {
    const query = supabase.from('activities').select('*').order('date', { ascending: false });
    if (userId) query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch activities:', err.message);
    return null;
  }
}

/**
 * Save user reduction target to Supabase
 */
export async function saveTargetToSupabase(targetData, userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('targets')
      .upsert({ ...targetData, user_id: userId })
      .select();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to save target:', err.message);
    return null;
  }
}

export default supabase;
