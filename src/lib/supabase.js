import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch all events (falls back to mock data if Supabase not connected)
export async function fetchEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    if (error || !data?.length) return null;
    return data;
  } catch {
    return null;
  }
}

// Fetch all galleries
export async function fetchGalleries() {
  try {
    const { data, error } = await supabase
      .from('galleries')
      .select('*');
    if (error || !data?.length) return null;
    return data;
  } catch {
    return null;
  }
}

// Post a new event (admin)
export async function postEvent(event) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select();
  return { data, error };
}

// Save / unsave an event
export async function toggleSaved(userId, eventId, isSaved) {
  if (isSaved) {
    return supabase.from('saved_events').delete()
      .eq('user_id', userId).eq('event_id', eventId);
  } else {
    return supabase.from('saved_events').insert([{ user_id: userId, event_id: eventId }]);
  }
}
