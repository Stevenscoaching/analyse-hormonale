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
    console.log('API response status:', contactRes.status);
    console.log('API response body:', contactText);

    let contact;
    try { contact = JSON.parse(contactText); } catch(e) { contact = {}; }

    if (contact && contact.id) {
      const tagsRes = await fetch('https://api.systeme.io/api/tags?name=bilan_complete', {
        headers: HEADERS
      });
      const tagsData = await tagsRes.json();
      console.log('Tags data:', JSON.stringify(tagsData));
      const tag = tagsData.items && tagsData.items[0];

      if (tag && tag.id) {
        const tagRes = await fetch(`https://api.systeme.io/api/contacts/${contact.id}/tags`, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({ tagId: tag.id })
        });
        console.log('Tag assigned:', tagRes.status);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, contact: contact, status: contactRes.status })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
