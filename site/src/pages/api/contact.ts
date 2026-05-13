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

function t(locale: string | undefined) {
  const fr = locale === 'fr';
  return {
    invalidJson: fr ? 'Charge utile JSON invalide.' : 'Invalid JSON payload.',
    required: fr ? 'Le nom, le courriel et le message sont obligatoires.' : 'Name, email, and message are required.',
    longName: fr ? 'Le nom est trop long.' : 'Name is too long.',
    invalidEmail: fr ? 'Veuillez fournir une adresse e-mail valide.' : 'Please provide a valid email.',
    invalidMessage: fr ? 'Le message doit contenir entre 4 et 5000 caracteres.' : 'Message must be 4–5000 characters.',
    longSubject: fr ? 'Le sujet est trop long.' : 'Subject is too long.',
    misconfigured: fr ? "Le formulaire de contact n'est pas configure. Veuillez reessayer plus tard." : 'Contact form is not configured. Please try again later.',
    sendFailed: fr ? "Echec de l'envoi; veuillez reessayer." : 'Send failed; please try again.'
  };
}

export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON payload.' }, 400);
  }

  const locale = typeof payload.locale === 'string' ? payload.locale : undefined;
  const copy = t(locale);

  if (typeof payload._honey === 'string' && payload._honey.length > 0) {
    return json({ ok: true }, 200);
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';

  if (!name || !email || !message) {
    return json({ error: copy.required }, 400);
  }
  if (name.length > 120) {
    return json({ error: copy.longName }, 400);
  }
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: copy.invalidEmail }, 400);
  }
  if (message.length < 4 || message.length > 5000) {
    return json({ error: copy.invalidMessage }, 400);
  }
  if (subject.length > 160) {
    return json({ error: copy.longSubject }, 400);
  }

  if (!POSTMARK_TOKEN || !FROM_EMAIL || !TO_EMAIL) {
    console.error('Contact form misconfigured: missing POSTMARK_SERVER_TOKEN / POSTMARK_FROM_EMAIL / CONTACT_DESTINATION_EMAIL env vars.');
    return json({ error: copy.misconfigured }, 500);
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
        ReplyTo: `${name.replace(/[<>\"]/g, '')} <${email}>`,
        Subject: `Contact: ${subjectLine}`,
        TextBody: textBody,
        MessageStream: STREAM,
      }),
    });
  } catch (err) {
    console.error('Postmark request failed:', err);
    return json({ error: copy.sendFailed }, 502);
  }

  if (!postmarkRes.ok) {
    const detail = await postmarkRes.text().catch(() => '');
    console.error('Postmark error:', postmarkRes.status, detail);
    return json({ error: copy.sendFailed }, 502);
  }

  return json({ ok: true }, 200);
};
