const fs = require('fs');

const username = '9500181';
const password = 'Sun$3t!620w';
const mlsId = 'njmls';

async function fetchImage(listingId) {
  const loginUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/login?rets-version=rets/1.8`;

  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from(username + ':' + password).toString('base64'));
  headers.set('RETS-Version', 'RETS/1.8');
  headers.set('User-Agent', 'NodeJSTestClient/1.0');

  try {
    const loginRes = await fetch(loginUrl, { method: 'GET', headers });
    const cookies = loginRes.headers.get('set-cookie');

    if (!loginRes.ok) {
      console.error('Login failed');
      return;
    }

    const authHeaders = new Headers(headers);
    if (cookies) {
      authHeaders.set('Cookie', cookies.split(';')[0]);
    }

    // According to RETS spec, GetObject requires Type, Resource, and ID.
    // PDF mentions GetObject Location=1 is required for NJMLS images.
    // ID can be ListingID:PhotoID. Asterisk means all photos. E.g. 25024177:* or 25024177:0 for primary.
    const getObjectUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/getobject`);
    getObjectUrl.searchParams.append('Type', 'Photo');
    getObjectUrl.searchParams.append('Resource', 'Property');
    getObjectUrl.searchParams.append('ID', `${listingId}:*`);
    getObjectUrl.searchParams.append('Location', '1'); // 1 means return a URL, 0 means return raw binary data

    console.log(`Fetching images for ${listingId}...`);
    const objectRes = await fetch(getObjectUrl.toString(), { method: 'GET', headers: authHeaders });

    // GetObject returns a Multipart format, but with Location=1, it often returns XML with the URL
    const textBuffer = await objectRes.text();
    console.log("Response Type:", objectRes.headers.get('content-type'));

    // Print first 1000 chars to see what it gave us
    console.log(textBuffer.substring(0, 1000));

    // Logout
    const logoutUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/logout`;
    await fetch(logoutUrl, { method: 'GET', headers: authHeaders });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

fetchImage('25024177');
