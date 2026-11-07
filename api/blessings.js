import { get, put } from '@vercel/blob';

const allowedOrigins = new Set([
  'https://chang-sun2402.github.io',
  'https://phone-1108-suwenduo777-1622.vercel.app',
  'https://phone-1108.vercel.app',
]);
const storeOptions = { access: 'private', storeId: 'store_qzSCBS0k7pZMlL81' };

async function existingBlessing(pathname) {
  const result = await get(pathname, { ...storeOptions, useCache: false });
  return result?.statusCode === 200 ? new Response(result.stream).json() : null;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Vary', 'Origin');
  const origin = request.headers.origin;
  if (!allowedOrigins.has(origin)) return response.status(403).json({ error: 'origin_not_allowed' });
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  if (!request.headers['content-type']?.startsWith('application/json')) {
    return response.status(415).json({ error: 'json_required' });
  }
  if (Number(request.headers['content-length']) > 32000) {
    return response.status(413).json({ error: 'too_large' });
  }
  let body = request.body;
  try { if (typeof body === 'string') body = JSON.parse(body); }
  catch { return response.status(400).json({ error: 'invalid_json' }); }
  const id = body?.id;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id || '') || !text || text.length > 5000) {
    return response.status(400).json({ error: 'invalid_blessing' });
  }
  const pathname = 'blessings/' + id + '.json';
  try {
    const existing = await existingBlessing(pathname);
    if (existing) {
      return response.status(existing.text === text ? 200 : 409).json(
        existing.text === text ? { id, saved: true } : { error: 'id_conflict' },
      );
    }
    await put(pathname, JSON.stringify({ id, text, submittedAt: new Date().toISOString() }), {
      ...storeOptions, contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false,
    });
    return response.status(201).json({ id, saved: true });
  } catch {
    // A concurrent retry may have created the same record after the first read.
    try {
      const existing = await existingBlessing(pathname);
      if (existing?.text === text) return response.status(200).json({ id, saved: true });
    } catch {}
    return response.status(503).json({ error: 'save_unavailable' });
  }
}
