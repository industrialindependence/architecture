import type { APIRoute } from 'astro';

export const prerender = false;

const POSTMARK_TOKEN = import.meta.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = import.meta.env.POSTMARK_FROM_EMAIL;
const TO_EMAIL = import.meta.env.CONTACT_DESTINATION_EMAIL;
const STREAM = import.meta.env.POSTMARK_MESSAGE_STREAM ?? 'outbound';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON payload.' }, 400);
  }

  if (typeof payload._honey === 'string' && payload._honey.length > 0) {
    return json({ ok: true }, 200);
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';

  if (!name || !email || !message) {
    return json({ error: 'Name, email, and message are required.' }, 400);
  }
  if (name.length > 120) {
    return json({ error: 'Name is too long.' }, 400);
  }
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please provide a valid email.' }, 400);
  }
  if (message.length < 4 || message.length > 5000) {
    return json({ error: 'Message must be 4–5000 characters.' }, 400);
  }
  if (subject.length > 160) {
    return json({ error: 'Subject is too long.' }, 400);
  }

  if (!POSTMARK_TOKEN || !FROM_EMAIL || !TO_EMAIL) {
    console.error('Contact form misconfigured: missing POSTMARK_SERVER_TOKEN / POSTMARK_FROM_EMAIL / CONTACT_DESTINATION_EMAIL env vars.');
    return json({ error: 'Contact form is not configured. Please try again later.' }, 500);
  }

  const subjectLine = subject || 'New contact form message';
  const textBody = `From: ${name} <${email}>\n\n${message}\n`;

  let postmarkRes: Response;
  try {
    postmarkRes = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_TOKEN,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: TO_EMAIL,
        ReplyTo: `${name.replace(/[<>"]/g, '')} <${email}>`,
        Subject: `Contact: ${subjectLine}`,
        TextBody: textBody,
        MessageStream: STREAM,
      }),
    });
  } catch (err) {
    console.error('Postmark request failed:', err);
    return json({ error: 'Send failed; please try again.' }, 502);
  }

  if (!postmarkRes.ok) {
    const detail = await postmarkRes.text().catch(() => '');
    console.error('Postmark error:', postmarkRes.status, detail);
    return json({ error: 'Send failed; please try again.' }, 502);
  }

  return json({ ok: true }, 200);
};
