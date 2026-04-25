// Cloudflare Pages Function — website feedback endpoint.
// Writes all feedback to D1 (aloktheanalyst_users / DB binding).
// Sends email via Resend for text feedback only (not silent reactions).
// Resolves google_id from session cookie when available.
//
// Required bindings:
//   RESEND_API_KEY → Secret (Resend API key)
//   SESSION_KV     → KV namespace (rate limiting + sessions)
//   DB             → D1 database (aloktheanalyst_users)

const RATE_LIMIT = 10;
const RATE_WINDOW = 3600; // 1 hour

// Reaction-only categories that should NOT trigger an email
const REACTION_CATEGORIES = new Set([
  'reaction-up', 'reaction-helpful',
  'reaction-down', 'reaction-not-helpful',
  'reaction-wrong-answer', 'reaction-confusing',
  'reaction-bug', 'reaction-other',
]);

const CATEGORY_LABELS = {
  'bug':                   '🐛 Bug',
  'wrong-answer':          '❓ Wrong answer',
  'suggestion':            '💡 Suggestion',
  'reaction-up':           '👍 Helpful',
  'reaction-helpful':      '👍 Helpful',
  'reaction-down':         '👎 Not helpful',
  'reaction-not-helpful':  '👎 Not helpful',
  'reaction-wrong-answer': '👎 Wrong answer',
  'reaction-confusing':    '👎 Confusing',
  'reaction-bug':          '👎 Bug',
  'reaction-other':        '👎 Other',
};

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

async function hashIp(ip) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) out[k.trim()] = v.join('=').trim();
  });
  return out;
}

async function resolveGoogleId(request, env) {
  if (!env.SESSION_KV) return null;
  try {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    if (!cookies.session) return null;
    const raw = await env.SESSION_KV.get(`sess:${cookies.session}`);
    if (!raw) return null;
    return JSON.parse(raw).google_id || null;
  } catch { return null; }
}

export async function onRequest(context) {
  const { env, request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
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

  const { message, category, userEmail, screenshot, page, userAgent } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return json({ error: 'Message is required' }, 400);
  }
  if (message.length > 5000) {
    return json({ error: 'Message too long (max 5000 characters)' }, 400);
  }

  // Parse question_id from debug context if present
  const parts = message.trim().split('\n\n--- Debug Context ---\n');
  const userMessage = parts[0];
  const debugContext = parts[1] || '';
  let questionId = null;
  for (const line of debugContext.split('\n')) {
    const m = line.match(/^Question:.+\(([^)]+)\)\s*$/);
    if (m) { questionId = m[1]; break; }
  }

  const timestamp = new Date().toISOString();
  const isReaction = REACTION_CATEGORIES.has(category);
  const categoryLabel = category ? (CATEGORY_LABELS[category] || category) : null;

  // ── 1. Write to D1 ─────────────────────────────────────────────────────────
  if (env.DB) {
    try {
      const [ipHash, googleId] = await Promise.all([
        hashIp(ip),
        resolveGoogleId(request, env),
      ]);
      let resolvedEmail = userEmail || null;
      if (!resolvedEmail && googleId) {
        try {
          const u = await env.DB.prepare(`SELECT email FROM user WHERE google_id = ?`).bind(googleId).first();
          resolvedEmail = u?.email || null;
        } catch { /* non-fatal */ }
      }
      await env.DB.prepare(
        `INSERT INTO feedback (google_id, user_email, question_id, category, message, page, ip_hash, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        googleId,
        resolvedEmail,
        questionId,
        category || null,
        isReaction ? null : userMessage,
        page || null,
        ipHash,
        userAgent || null,
        timestamp,
      ).run();
    } catch (err) {
      console.error('D1 insert failed:', err);
    }
  }

  // ── 2. Email — only for non-reaction (text) feedback ──────────────────────
  if (isReaction) {
    return json({ ok: true });
  }

  if (!env.RESEND_API_KEY) {
    // D1 write succeeded; email not configured is non-fatal
    return json({ ok: true });
  }

  // Build context table
  const contextHtml = debugContext
    ? '<table style="font-size:0.82rem;color:#334155;margin:0.75rem 0;border-collapse:collapse;">' +
      debugContext.split('\n').map(line => {
        const [label, ...rest] = line.split(': ');
        const value = rest.join(': ');
        return `<tr><td style="color:#94a3b8;padding:2px 8px 2px 0;white-space:nowrap;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`;
      }).join('') +
      '</table>'
    : '';

  const categoryBadge = categoryLabel
    ? `<span style="display:inline-block;padding:2px 10px;border-radius:20px;background:#eff6ff;color:#1d4ed8;font-size:0.8rem;font-weight:600;margin-bottom:0.75rem;">${categoryLabel}</span>`
    : '';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="color:#2563eb;margin-bottom:0.5rem;">Website Feedback</h2>
      <p style="color:#64748b;font-size:0.85rem;margin-top:0;">
        ${timestamp} · <strong>${page || 'Unknown page'}</strong>
      </p>
      ${categoryBadge}
      ${contextHtml}
      <div style="background:#f8faff;border:1px solid #e2e8f2;border-radius:8px;padding:1rem;margin:1rem 0;">
        <p style="margin:0;color:#334155;white-space:pre-wrap;">${escapeHtml(userMessage)}</p>
      </div>
      <p style="color:#94a3b8;font-size:0.75rem;">
        IP: ${ip}<br>
        UA: ${userAgent || 'Unknown'}
      </p>
      ${userEmail ? `<p style="color:#64748b;font-size:0.8rem;">Reply to: <a href="mailto:${escapeHtml(userEmail)}">${escapeHtml(userEmail)}</a></p>` : ''}
      ${screenshot ? '<p style="color:#64748b;font-size:0.8rem;">Screenshot attached.</p>' : ''}
    </div>
  `;

  const emailPayload = {
    from: 'Feedback <feedback@aloktheanalyst.com>',
    to: ['info@aloktheanalyst.com'],
    subject: `Feedback${categoryLabel ? ' [' + categoryLabel.replace(/[^\w\s]/g, '').trim() + ']' : ''}: ${page || '/'} [${timestamp.substring(11, 19)}]`,
    html,
  };

  if (screenshot && typeof screenshot === 'string' && screenshot.length < 4_000_000) {
    emailPayload.attachments = [{
      filename: 'screenshot.png',
      content: screenshot,
    }];
  }

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
