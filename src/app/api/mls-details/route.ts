import { NextResponse } from 'next/server';

const username = '9500181';
const password = 'Sun$3t!620w';
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

    // 2. Build the DMQL2 Query for specific listing
    const query = `(L_ListingID=${id})`;

    // 3. Search Transaction
    const searchUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/search`);
    searchUrl.searchParams.append('SearchType', 'Property');
    searchUrl.searchParams.append('Class', 'RE_1');
    searchUrl.searchParams.append('QueryType', 'DMQL2');
    searchUrl.searchParams.append('Query', query);
    searchUrl.searchParams.append('Format', 'COMPACT');
    searchUrl.searchParams.append('Limit', '1');
    // searchUrl.searchParams.append('Select', 'L_ListingID,L_AskingPrice,L_AddressNumber,L_AddressStreet,L_City,L_State,L_Zip,L_StatusCatID,L_SaleRent,L_ListingDate,L_Area,L_Type_,L_PropertyType,L_Status,L_BedroomsTotal,L_BathsFull,L_BathsHalf,L_SquareFeet,L_LotSizeDimensions,L_Taxes,LM_Dec_1,LM_Dec_2,LM_Dec_3,L_UpdateDate,L_Remarks');
    searchUrl.searchParams.append('StandardNames', '0');
    searchUrl.searchParams.append('Count', '1');

    // Fetch search results
    const searchRes = await fetch(searchUrl.toString(), { method: 'GET', headers: authHeaders });
    const searchText = await searchRes.text();

    const parsedData = parseRETSCompact(searchText);

    // 4. Logout (ALWAYS)
    const logoutUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/logout`;
    await fetch(logoutUrl, { method: 'GET', headers: authHeaders });

    if (parsedData.length === 0) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: parsedData[0]
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
