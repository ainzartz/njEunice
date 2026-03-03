import { NextResponse } from 'next/server';

const username = '9500181';
const password = 'Sun$3t!620w';
const mlsId = 'njmls'; // Using njmls based on previous test

export async function GET() {
  const loginUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/login?rets-version=rets/1.8`;

  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from(username + ':' + password).toString('base64'));
  headers.set('RETS-Version', 'RETS/1.8');
  headers.set('User-Agent', 'NodeJSTestClient/1.0');

  try {
    const response = await fetch(loginUrl, {
      method: 'GET',
      headers
    });

    const status = response.status;
    const text = await response.text();
    const cookies = response.headers.get('set-cookie');

    return NextResponse.json({
      status,
      success: status >= 200 && status < 300 && text.includes('<RETS'),
      data: text,
      cookies: cookies
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 500,
      error: error.message
    }, { status: 500 });
  }
}
