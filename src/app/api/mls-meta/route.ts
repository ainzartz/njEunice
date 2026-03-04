import { NextResponse } from 'next/server';

const username = '9500181';
const password = 'Sun$3t!620w';
const mlsId = 'njmls';

export async function GET() {
  const loginUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/login?rets-version=rets/1.8`;

  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from(username + ':' + password).toString('base64'));
  headers.set('RETS-Version', 'RETS/1.8');
  headers.set('User-Agent', 'NodeJSTestClient/1.0');

  try {
    // 1. Login
    const loginRes = await fetch(loginUrl, { method: 'GET', headers });
    const cookies = loginRes.headers.get('set-cookie');

    if (!loginRes.ok) {
      return NextResponse.json({ error: 'Login failed', status: loginRes.status });
    }

    // Prepare headers for the next request, including the session cookie
    const authHeaders = new Headers(headers);
    if (cookies) {
      // Simple cookie extraction, might need better parsing for robust usage
      authHeaders.set('Cookie', cookies.split(';')[0]);
    }

    // 2. Fetch Metadata (Class) for Property resource
    const metadataUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/getmetadata?Type=METADATA-CLASS&ID=Property&Format=COMPACT`;

    const metaRes = await fetch(metadataUrl, { method: 'GET', headers: authHeaders });
    const metaText = await metaRes.text();

    // 3. Logout (ALWAYS DO THIS)
    const logoutUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/logout`;
    await fetch(logoutUrl, { method: 'GET', headers: authHeaders });

    return NextResponse.json({
      success: true,
      metadata_sample: metaText.substring(0, 2000) // Just viewing the first part to see the structure
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
