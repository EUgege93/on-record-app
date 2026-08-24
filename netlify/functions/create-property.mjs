import { getStore } from '@netlify/blobs';

export default async (req) => {
    if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
    }

    try {
          const body = await req.json();
          if (!body.id || !body.name || !body.contactEmail) {
                  return new Response(JSON.stringify({ ok: false, error: 'id, name, and contactEmail are required' }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' }
                  });
          }

      const store = getStore({ name: 'on-record-properties', consistency: 'strong' });

      const property = {
              id: body.id,
              name: body.name,
              contactEmail: body.contactEmail,
              buildings: Array.isArray(body.buildings) ? body.buildings : []
      };

      await store.setJSON(`property:${body.id}`, property);

      return new Response(JSON.stringify({ ok: true, property }), {
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
