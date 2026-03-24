import { NextRequest, NextResponse } from 'next/server';
import { updateMlsMetadata } from '@/lib/mls-metadata';
import { ensureInternalRequest } from '@/lib/api-auth';

const mlsId = 'njmls';

function parseRETSCompact(xmlText: string) {
  try {
    const columnsMatch = xmlText.match(/<COLUMNS>(.*?)<\/COLUMNS>/);
    if (!columnsMatch) return [];

    const columnsLine = columnsMatch[1].trim();
    // Fields are separated by tabs
    const headers = columnsLine.split('\t');

    const dataRegex = /<DATA>(.*?)<\/DATA>/g;
    const results = [];
    let match;

    while ((match = dataRegex.exec(xmlText)) !== null) {
      const dataLine = match[1].trim();
      const values = dataLine.split('\t');

      const record: any = {};
      headers.forEach((header, index) => {
        if (header) { // avoid empty headers from trailing tabs
          record[header] = values[index] || '';
        }
      });
      results.push(record);
    }
    return results;
  } catch (error) {
    console.error("Error parsing RETS:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const providedClass = searchParams.get('class');

  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
  }

  const username = process.env.NJMLS_USERNAME;
  const password = process.env.NJMLS_PASSWORD;

  if (!username || !password) {
    return NextResponse.json({ error: 'MLS credentials not configured' }, { status: 500 });
  }

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
      return NextResponse.json({ error: 'MLS Login failed', status: loginRes.status }, { status: 500 });
    }

    const authHeaders = new Headers(headers);
    if (cookies) {
      authHeaders.set('Cookie', cookies.split(';')[0]);
    }

    // Update metadata timestamp
    await updateMlsMetadata();

    // 2. Determine classes to try
    // Using a list of common classes as a fallback
    const classesToTry = providedClass ? [providedClass] : ['RE_1', 'CT_3', 'RN_4', 'CM_5', 'BU_7', 'MF_2'];
    let finalData = null;

    for (const cls of classesToTry) {
      const query = `(L_ListingID=${id})`;
      const searchUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/search`);
      searchUrl.searchParams.append('SearchType', 'Property');
      searchUrl.searchParams.append('Class', cls);
      searchUrl.searchParams.append('QueryType', 'DMQL2');
      searchUrl.searchParams.append('Query', query);
      searchUrl.searchParams.append('Format', 'COMPACT');
      searchUrl.searchParams.append('Limit', '1');
      searchUrl.searchParams.append('StandardNames', '0');

      const searchRes = await fetch(searchUrl.toString(), { method: 'GET', headers: authHeaders });
      const searchText = await searchRes.text();
      const parsedData = parseRETSCompact(searchText);

      if (parsedData.length > 0) {
        finalData = { ...parsedData[0], mlsClass: cls };
        break;
      }
    }

    // 3. Logout (ALWAYS)
    const logoutUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/logout`;
    await fetch(logoutUrl, { method: 'GET', headers: authHeaders });

    if (!finalData) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: finalData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
