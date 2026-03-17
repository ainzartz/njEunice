import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateMlsMetadata } from '@/lib/mls-metadata';
import { ensureInternalRequest } from '@/lib/api-auth';

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

export async function GET(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

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

    // Update metadata timestamp
    await updateMlsMetadata();

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
        const joinedInput = safeQ.replace(/[^a-zA-Z]/g, '').toLowerCase();

        const matchedCity = supportedCities.find(c => {
          const cName = c.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
          return joinedInput === cName || joinedInput.includes(cName);
        });

        let words = safeQ.split(/\s+/).filter(w => {
          const val = w.trim().toLowerCase();
          return val.length > 0 && val !== 'nj';
        });

        let queryClauses = [query];

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
            } else if (wordOrs.length === 1) {
              queryClauses.push(wordOrs[0]);
            }
          }
        }

        query = queryClauses.join(',');
      }
    }

    const type = (searchParams.get('type') || '').toLowerCase(); // sale, rent, commercial

    // 4. Search across multiple classes
    let classes = [
      { id: 'RE_1', limit: 300, type: 'sale' as const },
      { id: 'CT_3', limit: 200, type: 'sale' as const },
      { id: 'RN_4', limit: 200, type: 'rent' as const },
      { id: 'CM_5', limit: 100, type: 'sale' as const },
      { id: 'BU_7', limit: 50, type: 'sale' as const },
      { id: 'MF_2', limit: 100, type: 'sale' as const }
    ];

    const fetchItems = async (cls: string, limit: number, type: 'sale' | 'rent') => {
      const searchUrl = new URL(`https://${mlsId}-rets.paragonrels.com/rets/fnisrets.aspx/${mlsId}/search`);
      searchUrl.searchParams.append('SearchType', 'Property');
      searchUrl.searchParams.append('Class', cls);
      searchUrl.searchParams.append('QueryType', 'DMQL2');
      searchUrl.searchParams.append('Query', query);
      searchUrl.searchParams.append('Format', 'COMPACT');
      searchUrl.searchParams.append('Limit', limit.toString());
      searchUrl.searchParams.append('Select', 'L_ListingID,L_AskingPrice,L_AddressNumber,L_AddressStreet,L_City,L_State,L_Zip,L_StatusCatID,L_SaleRent,L_ListingDate,LM_Int1_1,LM_Int1_19,LM_Int1_20,L_Type_,LM_Char10_7,L_AddressUnit');
      searchUrl.searchParams.append('StandardNames', '0');

      try {
        const res = await fetch(searchUrl.toString(), { method: 'GET', headers: authHeaders });
        const text = await res.text();
        const parsed = parseRETSCompact(text);
        return parsed.map(item => ({ ...item, propertyType: type, mlsClass: cls }));
      } catch (err) {
        console.error(`Error fetching class ${cls}:`, err);
        return [];
      }
    };

    const allResults = await Promise.all(
      classes.map(c => fetchItems(c.id, c.limit, c.type))
    );

    const parsedData = allResults.flat();

    // Sort by date newest first
    parsedData.sort((a, b) => {
      const dateA = a.L_ListingDate || '';
      const dateB = b.L_ListingDate || '';
      return dateB.localeCompare(dateA);
    });

    // 4.5 Batch Fetch Cached Images
    try {
      const listingIds = parsedData.map(item => item.L_ListingID).filter(Boolean);
      if (listingIds.length > 0) {
        const cachedImages = await prisma.propertyImage.findMany({
          where: {
            listingId: { in: listingIds }
          },
          select: {
            listingId: true,
            urls: true
          }
        });

        const imageMap = new Map();
        cachedImages.forEach(img => {
          if (img.urls && img.urls.length > 0) {
            imageMap.set(img.listingId, img.urls[0]);
          }
        });

        // Attach cached images directly to the payload
        parsedData.forEach(item => {
          item.cachedImageUrl = imageMap.get(item.L_ListingID) || null;
        });
      }
    } catch (imgError) {
      console.warn("Failed to bulk fetch cached images:", imgError);
    }

    // 5. Logout (ALWAYS)
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
