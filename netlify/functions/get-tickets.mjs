import { getStore } from '@netlify/blobs';

function normalizePhone(phone) {
    return String(phone || '').replace(/\D/g, '');
}

export default async (req) => {
    const url = new URL(req.url);
    const property = url.searchParams.get('property');
    const phone = normalizePhone(url.searchParams.get('phone'));

    if (!property || !phone) {
          return new Response(JSON.stringify({ ok: false, error: 'property and phone query parameters are required' }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
          });
    }

    try {
          const store = getStore({ name: 'on-record-tickets', consistency: 'strong' });
          const { blobs } = await store.list({ prefix: 'ticket:' });

      const all = await Promise.all(
              blobs.map((b) => store.get(b.key, { type: 'json' }))
            );

      const tickets = all
            .filter((t) => t && t.propertyId === property && t.phone === phone)
            .sort((a, b) => (b.filedAt || 0) - (a.filedAt || 0));

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
