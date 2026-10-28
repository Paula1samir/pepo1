/**
 * Vercel Serverless Function — PS Shop Manager
 * Handles all /api/:key routes via Supabase.
 *
 * Required environment variables (set in Vercel dashboard):
 *   SUPABASE_URL   — e.g. https://xxxx.supabase.co
 *   SUPABASE_KEY   — service_role key (from Supabase Settings → API)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Extract :key from the URL path  /api/<key>
function extractKey(url) {
  const match = url.match(/\/api\/([^/?]+)/);
  return match ? match[1] : null;
}

async function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const key = extractKey(req.url);
  if (!key) return res.status(400).json({ error: 'Missing key' });

  // ── GET /api/:key ──────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('store')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ? data.value : null);
  }

  // ── POST /api/:key — upsert value ──────────────────────────────────────────
  if (req.method === 'POST') {
    const body = await readBody(req);
    const value = body.value !== undefined ? body.value : body;

    const { error } = await supabase
      .from('store')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  // ── DELETE /api/:key ───────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('store')
      .delete()
      .eq('key', key);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
