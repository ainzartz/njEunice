import { NextResponse } from 'next/server';

const username = '9500181';
const password = 'Sun$3t!620w';
const mlsId = 'njmls';

function parseMultipartLocations(text: string): string[] {
  const images: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.trim().startsWith('Location:')) {
      const url = line.replace('Location:', '').trim();
      if (url && url.startsWith('http')) {
        images.push(url);
      }
    }
  }

  return images;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
  }

  const loginUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/login?rets-version=rets/1.8`;

  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from(username + ':' + password).toString('base64'));
  headers.set('RETS-Version', 'RETS/1.8');
  headers.set('User-Agent', 'NJEunice/1.0');

  try {
    // 1. Login
    const loginRes = await fetch(loginUrl, { method: 'GET', headers });
    const cookies = loginRes.headers.get('set-cookie');

    if (!loginRes.ok) {
      return NextResponse.json({ error: 'MLS Login failed' }, { status: 500 });
    }

    const authHeaders = new Headers(headers);
    if (cookies) {
      authHeaders.set('Cookie', cookies.split(';')[0]);
    }

    // 2. Fetch Object Location
    const getObjectUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/getobject`);
    getObjectUrl.searchParams.append('Type', 'Photo');
    getObjectUrl.searchParams.append('Resource', 'Property');
    getObjectUrl.searchParams.append('ID', `${id}:*`); // Fetch all photos
    getObjectUrl.searchParams.append('Location', '1'); // URL only

    const objectRes = await fetch(getObjectUrl.toString(), { method: 'GET', headers: authHeaders });
    const textBuffer = await objectRes.text();

    // Parse the multipart payload for Location: headers
    let images = parseMultipartLocations(textBuffer);

    // Filter out invalid/empty XML entries
    images = images.filter(url => !url.includes('ReplyCode'));

    // 4. Logout (ALWAYS)
    const logoutUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/logout`;
    await fetch(logoutUrl, { method: 'GET', headers: authHeaders });

    return NextResponse.json({
      success: true,
      images: images
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
