import { getStore } from '@netlify/blobs';

export default async () => {
  try {
    const store = getStore({ name: 'on-record-tickets', consistency: 'strong' });
    const { blobs } = await store.list({ prefix: 'ticket:' });

    const tickets = await Promise.all(
      blobs.map((b) => store.get(b.key, { type: 'json' }))
    );

    tickets.sort((a, b) => (b.filedAt || 0) - (a.filedAt || 0));

    return new Response(JSON.stringify({ ok: true, tickets }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
