import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  const q = (searchParams.get('q') || '').trim();

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

    // 2. Region Validation
    const targetCounties = await prisma.county.findMany({
      where: { isTarget: true },
      include: {
        cities: {
          include: {
            zipCodes: true
          }
        }
      }
    });

    const supportedCities = targetCounties.flatMap(c => c.cities);
    const supportedZipCodes = supportedCities.flatMap(c => c.zipCodes.map(z => z.code));

    if (q) {
      const safeQ = q.replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
      if (safeQ) {
        let explicitZipMatch = null;
        let explicitCityMatch = null;

        // Check for Zip code (5 digits)
        const zipMatch = safeQ.match(/\b\d{5}\b/);
        if (zipMatch) {
          explicitZipMatch = zipMatch[0];
        }

        // Check if query contains an unsupported city or zip
        // We need to compare against all cities/zips in DB to find explicit mentions of unsupported regions
        const allCities = await prisma.city.findMany({
          select: { name: true, county: { select: { isTarget: true } } }
        });

        const joinedInput = safeQ.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const matchedAnyCity = allCities.find(c => {
          const cName = c.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
          return cName.length > 3 && (joinedInput === cName || joinedInput.includes(cName));
        });

        if (matchedAnyCity && !matchedAnyCity.county.isTarget) {
          explicitCityMatch = matchedAnyCity.name;
        }

        // If explicit zip found, check if it's supported
        if (explicitZipMatch && !supportedZipCodes.includes(explicitZipMatch)) {
          return NextResponse.json({
            success: false,
            errorType: 'UNSUPPORTED_REGION',
            message: 'Unsupported search area.',
            supportedData: targetCounties.map(c => ({
              name: c.name,
              cities: c.cities.map(city => city.name).sort()
            }))
          });
        }

        if (explicitCityMatch) {
          return NextResponse.json({
            success: false,
            errorType: 'UNSUPPORTED_REGION',
            message: 'Unsupported search area.',
            supportedData: targetCounties.map(c => ({
              name: c.name,
              cities: c.cities.map(city => city.name).sort()
            })).sort((a, b) => {
              if (a.name === 'Bergen') return -1;
              if (b.name === 'Bergen') return 1;
              return a.name.localeCompare(b.name);
            })
          });
        }
      }
    }

    // 3. Build the DMQL2 Query
    let query = "(L_StatusCatID=1)";

    if (q) {
      const safeQ = q.replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
      if (safeQ) {
        // Step A: City name normalization pre-check
        // Use alpha-only for city matching to handle "2 Euclid Fort Lee" correctly
        const joinedInput = safeQ.replace(/[^a-zA-Z]/g, '').toLowerCase();

        // Use the already fetched supported cities for normalization
        const matchedCity = supportedCities.find(c => {
          const cName = c.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
          return joinedInput === cName || joinedInput.includes(cName);
        });

        // Step B: Word-based "AND of ORs" logic
        let words = safeQ.split(/\s+/).filter(w => {
          const val = w.trim().toLowerCase();
          return val.length > 0 && val !== 'nj'; // Skip 'NJ' and empty
        });

        let queryClauses = [query];

        // If it's a single word search (like "fortlee") and we matched a city,
        // use the city's parts instead of the original word to ensure matching.
        if (matchedCity && words.length === 1 && !/^\d+$/.test(words[0])) {
          const cityParts = matchedCity.name.split(/\s+/).filter(w => w.length > 0);
          for (const part of cityParts) {
            queryClauses.push(`((L_AddressStreet=*${part}*)|(L_City=*${part}*))`);
          }
        } else {
          for (const word of words) {
            const isNumeric = /^\d+$/.test(word);
            let wordOrs = [];

            wordOrs.push(`(L_AddressStreet=*${word}*)`);
            wordOrs.push(`(L_City=*${word}*)`);

            if (isNumeric) {
              wordOrs.push(`(L_AddressNumber=${word})`);
              if (word.length === 5) {
                wordOrs.push(`(L_Zip=${word})`);
              }
              if (word.length >= 7) {
                wordOrs.push(`(L_ListingID=${word})`);
              }
            }

            if (wordOrs.length > 1) {
              queryClauses.push(`(${wordOrs.join('|')})`);
            } else {
              queryClauses.push(wordOrs[0]);
            }
          }
        }

        query = queryClauses.join(',');
      }
    }

    // 3. Search Transaction
    const searchUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/search`);
    searchUrl.searchParams.append('SearchType', 'Property');
    searchUrl.searchParams.append('Class', 'RE_1');
    searchUrl.searchParams.append('QueryType', 'DMQL2');
    searchUrl.searchParams.append('Query', query);
    searchUrl.searchParams.append('Format', 'COMPACT');
    searchUrl.searchParams.append('Limit', '600');
    searchUrl.searchParams.append('Select', 'L_ListingID,L_AskingPrice,L_AddressNumber,L_AddressStreet,L_City,L_State,L_Zip,L_StatusCatID,L_SaleRent,L_ListingDate'); // Removed L_Remarks
    searchUrl.searchParams.append('StandardNames', '0'); // using System Names as found in metadata
    searchUrl.searchParams.append('Count', '1');
    const searchRes = await fetch(searchUrl.toString(), { method: 'GET', headers: authHeaders });
    const searchText = await searchRes.text();

    // Check if RETS returned an error (usually ReplyCode != 0)
    const replyCodeMatch = searchText.match(/ReplyCode="([^"]*)"/);
    const replyTextMatch = searchText.match(/ReplyText="([^"]*)"/);
    // console.log(`API RETS Reply: Code=${replyCodeMatch?.[1]}, Text=${replyTextMatch?.[1]}`);

    const parsedData = parseRETSCompact(searchText);

    // 4. Logout (ALWAYS)
    const logoutUrl = `https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/logout`;
    await fetch(logoutUrl, { method: 'GET', headers: authHeaders });

    return NextResponse.json({
      success: true,
      count: parsedData.length,
      query: query,
      data: parsedData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
