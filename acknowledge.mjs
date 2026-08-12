import { getStore } from '@netlify/blobs';

function renderPage({ title, message, ticketId, status }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>On Record</title>
<style>
  body{margin:0;background:#FAF7EF;font-family:Arial, Helvetica, sans-serif;color:#1E2A3A;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;}
  .card{max-width:420px;background:#FFFDF8;border:1.5px solid #D8CFB8;border-radius:8px;padding:32px 28px;text-align:center;}
  .stamp{display:inline-block;border:1.5px dashed #4B7A5B;color:#4B7A5B;border-radius:14px;padding:6px 16px;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;}
  h1{font-size:20px;margin:0 0 10px;}
  p{font-size:14px;color:#4B5A6B;line-height:1.5;}
  .id{font-family:'Courier New', monospace;font-size:12px;color:#4B5A6B;margin-top:20px;}
</style>
</head>
<body>
  <div class="card">
    <div class="stamp">On Record</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${ticketId ? `<div class="id">${ticketId}${status ? ' — ' + status : ''}</div>` : ''}
  </div>
</body>
</html>`;
}

export default async (req) => {
  const url = new URL(req.url);
  const ticketId = url.searchParams.get('ticket');

  if (!ticketId) {
    return new Response(
      renderPage({ title: 'Missing ticket reference', message: 'This link is missing a ticket ID.' }),
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  try {
    const store = getStore({ name: 'on-record-tickets', consistency: 'strong' });
    const ticket = await store.get(`ticket:${ticketId}`, { type: 'json' });

    if (!ticket) {
      return new Response(
        renderPage({
          title: 'Request not found',
          message: "We couldn't find this maintenance request. It may be from a test that's since been cleared.",
          ticketId
        }),
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (ticket.status === 'filed') {
      ticket.status = 'acknowledged';
      ticket.trail.push({
        date: new Date().toISOString().slice(0, 10),
        text: 'Property manager acknowledged this request.'
      });
      await store.setJSON(`ticket:${ticketId}`, ticket);
    }

    return new Response(
      renderPage({
        title: 'Request acknowledged',
        message: `Thanks — the tenant will see that you've received their request for "${ticket.title}".`,
        ticketId,
        status: ticket.status
      }),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    return new Response(
      renderPage({ title: 'Something went wrong', message: String(err) }),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
};
