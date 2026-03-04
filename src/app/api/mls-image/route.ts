import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    // 0. Check Database Cache
    const cached = await prisma.propertyImage.findUnique({
      where: { listingId: id }
    });

    const isExpired = cached ? (Date.now() - new Date(cached.updatedAt).getTime() > 24 * 60 * 60 * 1000) : true;

    if (cached && !isExpired && cached.urls.length > 0) {
      return NextResponse.json({
        success: true,
        images: cached.urls,
        cached: true
      }, {
        headers: {
          'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
        }
      });
    }

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

    // 5. Store in Database Cache
    if (images.length > 0) {
      await prisma.propertyImage.upsert({
        where: { listingId: id },
        update: { urls: images },
        create: { listingId: id, urls: images }
      });
    }

    return NextResponse.json({
      success: true,
      images: images,
      cached: false
    }, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
      }
    });

  } catch (error: any) {
    console.error('mls-image error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
