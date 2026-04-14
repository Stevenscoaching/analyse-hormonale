exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = 'ud62nchxmnnj05agbbsfojdt98haiwd5esefrtn50bdmz35i6f4tjxissn40u4g8';
  const HEADERS = { 'Content-Type': 'application/json', 'X-API-Key': API_KEY };

  try {
    const data = JSON.parse(event.body);

    const contactRes = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        fields: data.fields
      })
    });

    const contactText = await contactRes.text();
    let contact;
    try { contact = JSON.parse(contactText); } catch(e) { contact = {}; }

    // Si contact existe déjà, on le met à jour
    if (contactRes.status === 409 || (contact.violations && contact.violations.length > 0)) {
      const searchRes = await fetch(`https://api.systeme.io/api/contacts?email=${encodeURIComponent(data.email)}`, {
        headers: HEADERS
      });
      const searchData = await searchRes.json();
      if (searchData.items && searchData.items[0]) {
        contact = searchData.items[0];
        await fetch(`https://api.systeme.io/api/contacts/${contact.id}`, {
          method: 'PATCH',
          headers: HEADERS,
          body: JSON.stringify({
            first_name: data.first_name,
            last_name: data.last_name,
            fields: data.fields
          })
        });
      }
    }

    if (contact && contact.id) {
      const tagsRes = await fetch('https://api.systeme.io/api/tags?name=bilan_complete', {
        headers: HEADERS
      });
      const tagsData = await tagsRes.json();
      const tag = tagsData.items && tagsData.items[0];

      if (tag && tag.id) {
        await fetch(`https://api.systeme.io/api/contacts/${contact.id}/tags`, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({ tagId: tag.id })
        });
      }
    }

    return {
      statusCode: 200
