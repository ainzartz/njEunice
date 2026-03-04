import { NextResponse } from 'next/server';

const username = '9500181';
const password = 'Sun$3t!620w';
const mlsId = 'njmls';

// Unified Office IDs for RE/MAX NOW (Palisades Park & Norwood) and API OFFICE
const TARGET_OFFICE_IDS = ['58499', '58680', '58589'];

function parseRETSCompact(xml: string) {
  const result: any[] = [];
  const delimiterMatch = xml.match(/<DELIMITER value="([^"]*)" \/>/);
  const delimiter = delimiterMatch ? String.fromCharCode(parseInt(delimiterMatch[1], 10)) : '\t';

  const columnsMatch = xml.match(/<COLUMNS>(.*?)<\/COLUMNS>/);
  if (!columnsMatch) return [];
  const columns = columnsMatch[1].trim().split(delimiter);

  const dataMatches = xml.matchAll(/<DATA>(.*?)<\/DATA>/g);
  for (const match of dataMatches) {
    const dataRow = match[1].trim().split(delimiter);
    const item: any = {};
    columns.forEach((col, index) => {
      item[col] = dataRow[index] || '';
    });
    result.push(item);
  }
  return result;
}

export async function GET(request: Request) {
  const loginUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/login?rets-version=rets/1.8`;

  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from(username + ':' + password).toString('base64'));
  headers.set('RETS-Version', 'RETS/1.8');
  headers.set('User-Agent', 'NodeJSTestClient/1.0');

  try {
    const loginRes = await fetch(loginUrl, { method: 'GET', headers });
    const cookies = loginRes.headers.get('set-cookie');
    if (!loginRes.ok) throw new Error('RETS Login Failed');

    const authHeaders = new Headers(headers);
    if (cookies) authHeaders.set('Cookie', cookies.split(';')[0]);

    // Query for targeted offices across multiple classes
    const officeQuery = TARGET_OFFICE_IDS.map(id => `(L_ListOffice1=${id})`).join('|');
    const statusQuery = `(L_StatusCatID=1,3)`; // Active, Under Contract (Excluding Sold 2)
    const query = `${statusQuery},(${officeQuery})`;

    const fetchFromClass = async (cls: string, limit: number, type: 'sale' | 'rent') => {
      const searchUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/search`);
      searchUrl.searchParams.append('SearchType', 'Property');
      searchUrl.searchParams.append('Class', cls);
      searchUrl.searchParams.append('QueryType', 'DMQL2');
      searchUrl.searchParams.append('Query', query);
      searchUrl.searchParams.append('Format', 'COMPACT');
      searchUrl.searchParams.append('Limit', limit.toString());
      searchUrl.searchParams.append('Select', 'L_ListingID,L_AskingPrice,L_AddressNumber,L_AddressStreet,L_City,L_State,L_Zip,L_StatusCatID,L_SaleRent,L_ListingDate,LM_Int1_1,LM_Int1_19,LM_Int1_20,L_Type_,LM_Char10_7,L_AddressUnit');
      searchUrl.searchParams.append('StandardNames', '0');

      const res = await fetch(searchUrl.toString(), { method: 'GET', headers: authHeaders });
      const text = await res.text();
      const parsed = parseRETSCompact(text);
      return parsed.map(item => ({ ...item, propertyType: type, mlsClass: cls }));
    };

    // Try multiple classes for office listings
    const re1Listings = await fetchFromClass('RE_1', 12, 'sale');
    const ct3Listings = await fetchFromClass('CT_3', 6, 'sale');
    const rn4Listings = await fetchFromClass('RN_4', 6, 'rent');

    let parsedData = [...re1Listings, ...ct3Listings, ...rn4Listings];
    let isFallback = false;

    // Fallback: If no office listings found at all, get latest active residential listings
    if (parsedData.length === 0) {
      console.log('No office listings found in any class, using fallback to newest active listings.');
      const fallbackQuery = '(L_StatusCatID=1)';
      const fallbackUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/search`);
      fallbackUrl.searchParams.append('SearchType', 'Property');
      fallbackUrl.searchParams.append('Class', 'RE_1');
      fallbackUrl.searchParams.append('QueryType', 'DMQL2');
      fallbackUrl.searchParams.append('Query', fallbackQuery);
      fallbackUrl.searchParams.append('Format', 'COMPACT');
      fallbackUrl.searchParams.append('Limit', '6');
      fallbackUrl.searchParams.append('Select', 'L_ListingID,L_AskingPrice,L_AddressNumber,L_AddressStreet,L_City,L_State,L_Zip,L_StatusCatID,L_SaleRent,L_ListingDate,LM_Int1_1,LM_Int1_19,LM_Int1_20,L_Type_,LM_Char10_7,L_AddressUnit');
      fallbackUrl.searchParams.append('StandardNames', '0');

      const fallbackRes = await fetch(fallbackUrl.toString(), { method: 'GET', headers: authHeaders });
      const fallbackText = await fallbackRes.text();
      parsedData = parseRETSCompact(fallbackText).map(item => ({ ...item, mlsClass: 'RE_1' }));
      isFallback = true;
    }

    // Sort combined data by date (newest first)
    parsedData.sort((a, b) => {
      const dateA = a.L_ListingDate || '';
      const dateB = b.L_ListingDate || '';
      return dateB.localeCompare(dateA);
    });

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    // Limit to 6 for the homepage if not fallback AND not requested all
    if (!isFallback && !all) {
      parsedData = parsedData.slice(0, 6);
    }

    // Logout
    const logoutUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/logout`;
    await fetch(logoutUrl, { method: 'GET', headers: authHeaders });

    return NextResponse.json({
      success: true,
      count: parsedData.length,
      isFallback,
      data: parsedData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
