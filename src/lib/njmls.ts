import https from 'https';
import { XMLParser } from 'fast-xml-parser';

const RETS_URL = process.env.NJMLS_RETS_URL!;
const USERNAME = process.env.NJMLS_USERNAME!;
const PASSWORD = process.env.NJMLS_PASSWORD!;

if (!RETS_URL || !USERNAME || !PASSWORD) {
  throw new Error("NJMLS Credentials (NJMLS_RETS_URL, NJMLS_USERNAME, NJMLS_PASSWORD) are missing.");
}

interface RetsSession {
  cookies: string[];
  urls: {
    Search?: string;
    GetMetadata?: string;
    GetObject?: string;
    Logout?: string;
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

export class NJMLSService {
  private session: RetsSession | null = null;

  private async request(url: string, method: string = 'GET', headers: Record<string, string> = {}): Promise<{ body: string, headers: any, statusCode?: number }> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      // Explicitly type headers to allow dynamic assignment
      const requestHeaders: Record<string, string | number | string[]> = {
        'User-Agent': 'RETS-Client/1.0',
        'RETS-Version': 'RETS/1.8',
        ...headers
      };

      // Add Basic Auth if no cookies / initial login
      if (!headers['Cookie']) {
        requestHeaders['Authorization'] = 'Basic ' + Buffer.from(USERNAME + ':' + PASSWORD).toString('base64');
      }

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: requestHeaders
      };

      console.log(`[NJMLS] Request: ${method} ${url}`);

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            console.error(`[NJMLS] Error ${res.statusCode}: ${data}`);
            reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
          } else {
            resolve({ body: data, headers: res.headers, statusCode: res.statusCode });
          }
        });
      });

      req.on('error', (e) => {
        console.error(`[NJMLS] Network Error: ${e.message}`);
        reject(e);
      });
      req.end();
    });
  }

  private parseLoginResponse(body: string): Record<string, string> {
    // RETS Login response body is key=value pairs, often inside XML
    // Example: 
    // <RETS ...>
    // <RETS-RESPONSE>
    // MemberName=...
    // Search=/...
    // </RETS-RESPONSE>
    // </RETS>

    // Parse XML first
    let textContent = body;
    try {
      const parsed = parser.parse(body);
      // Navigate to RETS-RESPONSE
      if (parsed.RETS && parsed.RETS['RETS-RESPONSE']) {
        textContent = parsed.RETS['RETS-RESPONSE'];
      }
    } catch (e) {
      // Fallback: Use regex to extract body if XML parsing fails or structure varies
      console.warn("[NJMLS] XML parsing failed, using raw body text", e);
    }

    const lines = textContent.split('\n');
    const result: Record<string, string> = {};
    for (const line of lines) {
      const [key, ...valParts] = line.trim().split('=');
      if (key && valParts.length > 0) {
        result[key.trim()] = valParts.join('=').trim();
      }
    }
    return result;
  }

  public async login(): Promise<void> {
    console.log("[NJMLS] Logging in...");
    const res = await this.request(RETS_URL);

    // Capture cookies
    const setCookie = res.headers['set-cookie'];
    const cookies = setCookie ? (Array.isArray(setCookie) ? setCookie : [setCookie]) : [];

    const urls = this.parseLoginResponse(res.body);

    // Resolve relative URLs
    const baseUrl = new URL(RETS_URL).origin;
    const resolve = (path?: string) => path ? (path.startsWith('http') ? path : baseUrl + path) : undefined;

    this.session = {
      cookies: cookies.map(c => c.split(';')[0]), // Extract just the cookie part
      urls: {
        Search: resolve(urls['Search']),
        GetMetadata: resolve(urls['GetMetadata']),
        Logout: resolve(urls['Logout'])
      }
    };
    console.log("[NJMLS] Login successful. Search URL:", this.session.urls.Search);
  }

  public async search(query: string, limit: number = 10) {
    if (!this.session) {
      await this.login();
    }
    if (!this.session?.urls.Search) {
      throw new Error("Login failed to provide Search URL.");
    }

    // Default Class: ResidentialProperty (based on PDF)
    // Default SearchType: Property
    const searchUrl = new URL(this.session.urls.Search);
    searchUrl.searchParams.set('SearchType', 'Property');
    searchUrl.searchParams.set('Class', 'Residential'); // Try 'Residential' or 'RES' or 'ResidentialProperty'. 
    // PDF p.5: Class=ResidentialProperty
    searchUrl.searchParams.set('Class', 'ResidentialProperty');

    searchUrl.searchParams.set('Query', query);
    searchUrl.searchParams.set('QueryType', 'DMQL2');
    searchUrl.searchParams.set('Count', '1');
    searchUrl.searchParams.set('Format', 'COMPACT-DECODED');
    searchUrl.searchParams.set('Limit', limit.toString());
    searchUrl.searchParams.set('StandardNames', '1'); // Use standard names

    const cookieHeader = this.session.cookies.join('; ');

    const res = await this.request(searchUrl.toString(), 'GET', {
      'Cookie': cookieHeader
    });

    // Parse COMPACT-DECODED format (Tab delimited)
    // <RETS ...>
    // <COLUMNS>...</COLUMNS>
    // <DATA>...</DATA>
    // </RETS>

    const parsed = parser.parse(res.body);
    const retsRoot = parsed.RETS;
    if (!retsRoot) return [];

    const columnsStr = retsRoot.COLUMNS;
    if (!columnsStr) return [];

    const columns = columnsStr.split('\t');

    const dataRows: any[] = [];
    let dataElements = retsRoot.DATA;

    if (!dataElements) return [];
    if (!Array.isArray(dataElements)) dataElements = [dataElements];

    for (const dataStr of dataElements) {
      const values = dataStr.split('\t');
      const obj: any = {};
      columns.forEach((col: string, index: number) => {
        if (col) obj[col] = values[index];
      });
      dataRows.push(obj);
    }

    return dataRows;
  }
}

export const njmls = new NJMLSService();
