// Cloudflare Pages Function — website feedback endpoint.
// Sends feedback + optional screenshot to info@aloktheanalyst.com via Resend.
//
// Required bindings:
//   RESEND_API_KEY → Secret (Resend API key)
//   SESSION_KV     → KV namespace (rate limiting)

const RATE_LIMIT = 5;
const RATE_WINDOW = 3600; // 1 hour

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export async function onRequest(context) {
  const { env, request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: 'Email service not configured' }, 503);
  }

  // Rate limiting
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.SESSION_KV) {
    try {
      const key = `rl:feedback:${ip}`;
      const raw = await env.SESSION_KV.get(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (count >= RATE_LIMIT) {
        return json({ error: 'Too many submissions. Please try again later.' }, 429);
      }
      await env.SESSION_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
    } catch { /* don't block on rate limit failure */ }
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { message, screenshot, page, userAgent, context } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return json({ error: 'Message is required' }, 400);
  }
  if (message.length > 2000) {
    return json({ error: 'Message too long (max 2000 characters)' }, 400);
  }

  // Build email HTML
  const timestamp = new Date().toISOString();
  const ctx = context || {};
  const contextRows = [
    ctx.userName && `<tr><td style="color:#94a3b8;padding:2px 8px 2px 0;">User</td><td>${escapeHtml(ctx.userName)}${ctx.userEmail ? ' (' + escapeHtml(ctx.userEmail) + ')' : ''}</td></tr>`,
    ctx.activeCase && `<tr><td style="color:#94a3b8;padding:2px 8px 2px 0;">Question</td><td>${escapeHtml(ctx.caseTitle || ctx.activeCase)} <span style="color:#94a3b8;">(${escapeHtml(ctx.activeCase)})</span></td></tr>`,
    ctx.dialect && `<tr><td style="color:#94a3b8;padding:2px 8px 2px 0;">Dialect</td><td>${escapeHtml(ctx.dialect)}</td></tr>`,
    ctx.aiProvider && `<tr><td style="color:#94a3b8;padding:2px 8px 2px 0;">AI Provider</td><td>${escapeHtml(ctx.aiProvider)}</td></tr>`,
    ctx.errorText && `<tr><td style="color:#94a3b8;padding:2px 8px 2px 0;">Error</td><td style="color:#dc2626;">${escapeHtml(ctx.errorText)}</td></tr>`,
  ].filter(Boolean).join('');

  const html = `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="color:#2563eb;margin-bottom:0.5rem;">Website Feedback</h2>
      <p style="color:#64748b;font-size:0.85rem;margin-top:0;">
        ${timestamp} · <strong>${page || 'Unknown page'}</strong>
      </p>
      ${contextRows ? `<table style="font-size:0.82rem;color:#334155;margin:0.75rem 0;border-collapse:collapse;">${contextRows}</table>` : ''}
      <div style="background:#f8faff;border:1px solid #e2e8f2;border-radius:8px;padding:1rem;margin:1rem 0;">
        <p style="margin:0;color:#334155;white-space:pre-wrap;">${escapeHtml(message.trim())}</p>
      </div>
      <p style="color:#94a3b8;font-size:0.75rem;">
        IP: ${ip}<br>
        UA: ${userAgent || 'Unknown'}
      </p>
      ${screenshot ? '<p style="color:#64748b;font-size:0.8rem;">Screenshot attached.</p>' : ''}
    </div>
  `;

  // Build Resend payload
  const emailPayload = {
    from: 'Feedback <feedback@aloktheanalyst.com>',
    to: ['info@aloktheanalyst.com'],
    subject: `Feedback: ${page || '/'}`,
    html,
  };

  if (screenshot && typeof screenshot === 'string' && screenshot.length < 1_400_000) {
    emailPayload.attachments = [{
      filename: 'screenshot.jpg',
      content: screenshot,
    }];
  }

  // Send via Resend
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return json({ error: 'Failed to send feedback' }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error('Feedback send failed:', err);
    return json({ error: 'Failed to send feedback' }, 500);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
