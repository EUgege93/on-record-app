import { getStore } from '@netlify/blobs';

export default async (req) => {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
          return new Response(JSON.stringify({ ok: false, error: 'Missing property id' }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
          });
    }

    try {
          const store = getStore({ name: 'on-record-properties', consistency: 'strong' });
          const property = await store.get(`property:${id}`, { type: 'json' });

      if (!property) {
              return new Response(JSON.stringify({ ok: false, error: 'Property not found' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
              });
      }

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
