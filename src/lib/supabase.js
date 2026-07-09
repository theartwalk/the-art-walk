import { createClient } from '@supabase/supabase-js';

// ── Replace these with your Supabase project values ───────────────────────
const SUPABASE_URL = 'https://umwqpquhvymccjdpwjxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtd3FwcXVodnltY2NqZHB3anhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODgwMjgsImV4cCI6MjA5NjE2NDAyOH0.OJ0WFPvdjSUb1WiD6H59o8Z7artt6l_QSpBZN5Zk5XM';
// ─────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const isConnected = !SUPABASE_URL.includes('YOUR_PROJECT');

// ── Fetch all events ──────────────────────────────────────────────────────
export async function fetchEvents() {
  if (!isConnected) return null;
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;
    // Map snake_case Supabase columns → camelCase for the app
    return data.map(e => ({
      id:          String(e.id),
      title:       e.title || '',
      type:        e.type || 'Exhibition',
      venue:       e.venue || '',
      area:        e.area || 'Delhi NCR',
      address:     e.address || '',
      date:        e.date || '',
      dateLabel:   e.date_label || e.date || '',
      time:        e.time || '',
      price:       e.price || 'Free',
      badge:       e.badge || '',
      badgeType:   e.badge_type || 'soon',
      tags:        Array.isArray(e.tags) ? e.tags : [],
      color:       e.color || '#888888',
      description: e.description || '',
      imageUrl:    e.image_url || null,
    }));
  } catch (e) {
    console.log('Supabase fetch error:', e.message);
    return null;
  }
}

// ── Fetch all galleries ───────────────────────────────────────────────────
export async function fetchGalleries() {
  if (!isConnected) return null;
  try {
    const { data, error } = await supabase.from('galleries').select('*');
    if (error) throw error;
    return data;
  } catch (e) {
    return null;
  }
}

// ── Post a new event ──────────────────────────────────────────────────────
export async function postEvent(event) {
  if (!isConnected) return { error: 'Not connected — see SETUP_SUPABASE.md' };
  try {
    const { data, error } = await supabase.from('events').insert([event]).select();
    if (error) throw error;
    return { data };
  } catch (e) {
    return { error: e.message };
  }
}

// ── Upload image or video to Supabase Storage ─────────────────────────────
export async function uploadMedia(file, fileName, mimeType) {
  if (!isConnected) return { error: 'Not connected — see SETUP_SUPABASE.md' };
  try {
    const { data, error } = await supabase.storage
      .from('event-media')
      .upload(`public/${fileName}`, file, {
        contentType: mimeType,
        upsert: true,
      });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('event-media')
      .getPublicUrl(`public/${fileName}`);

    return { url: urlData.publicUrl };
  } catch (e) {
    console.log('Upload error:', e.message);
    return { error: e.message };
  }
}

// ── Toggle saved event ────────────────────────────────────────────────────
export async function toggleSaved(userId, eventId, isSaved) {
  if (!isConnected) return null;
  try {
    if (isSaved) {
      await supabase.from('saved_events')
        .insert([{ user_id: userId, event_id: eventId }]);
    } else {
      await supabase.from('saved_events')
        .delete()
        .match({ user_id: userId, event_id: eventId });
    }
  } catch (e) {
    console.log('Saved toggle error:', e.message);
  }
}
