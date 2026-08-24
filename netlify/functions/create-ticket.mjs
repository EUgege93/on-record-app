import { getStore } from '@netlify/blobs';

function normalizePhone(phone) {
    return String(phone || '').replace(/\D/g, '');
}

export default async (req) => {
    if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
    }

    try {
          const body = await req.json();
          if (!body.id) {
                  return new Response(JSON.stringify({ ok: false, error: 'Missing ticket id' }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' }
                  });
          }

      const store = getStore({ name: 'on-record-tickets', consistency: 'strong' });

      const ticket = {
              id: body.id,
              propertyId: body.propertyId || 'unknown',
              title: body.title || '',
              category: body.category || '',
              urgency: body.urgency || '',
              status: 'filed',
              filedDate: body.filedDate || '',
              filedAt: Date.now(),
              description: body.description || '',
              name: body.name || '',
              unit: body.unit || '',
              building: body.building || '',
              phone: normalizePhone(body.phone),
              photoNote: body.photoNote || 'No photo attached.',
              trail: [
                { date: body.filedDate || '', text: 'Request filed and sent to your property manager via email.' }
                      ]
      };

      await store.setJSON(`ticket:${body.id}`, ticket);

      return new Response(JSON.stringify({ ok: true, ticket }), {
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
