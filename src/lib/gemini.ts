
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY!;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
};

// Scrape Mortgage News Daily for 30Y and 15Y Fixed Rates
const getMortgageRates = async () => {
  try {
    const res = await fetch("https://www.mortgagenewsdaily.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Regex to find 30YR and 15YR Fixed Rate in the header widget
    // Pattern: <div class="product">NAME</div> ... <div class="price">RATE</div>
    const productRegex = /<div class="product">(.*?)<\/div>[\s\S]*?<div class="price">(.*?)<\/div>[\s\S]*?<div class="rate.*?>(.*?)<\/div>/g;

    let match;
    const rates: any = {};

    while ((match = productRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const rate = match[2].trim();
      const change = match[3].trim().replace(/&#x2B;/g, '+');

      if (name.includes("30YR Fixed")) rates.thirty = { rate, change };
      if (name.includes("15YR Fixed")) rates.fifteen = { rate, change };
    }

    return rates;
  } catch (error) {
    console.warn("Failed to fetch live mortgage rates:", error);
    return null;
  }
};

const cleanJson = (text: string): string => {
  // 1. Remove markdown code blocks
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

  // 2. Remove purely markdown citation markers like [1], [^1] if they leak in
  cleaned = cleaned.replace(/\[\d+\]/g, '');

  // 3. Attempt to find the specific JSON object structure matching our expected specific keys if possible
  //    But generally finding the first { and last } is safer for nested content.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export const generateMarketInsight = async () => {
  const model = getGeminiModel();
  const liveRates = await getMortgageRates();

  let rateContext = "";
  if (liveRates && liveRates.thirty) {
    // Clean up rate strings themselves just in case
    const r30 = liveRates.thirty.rate.trim();
    const c30 = liveRates.thirty.change.trim();
    const r15 = liveRates.fifteen?.rate?.trim() || "N/A";
    const c15 = liveRates.fifteen?.change?.trim() || "N/A";

    rateContext = `
      LIVE DATA (Source: Mortgage News Daily) - USE THESE EXACT NUMBERS:
      - 30-Year Fixed: "${r30}" (Change: "${c30}")
      - 15-Year Fixed: "${r15}" (Change: "${c15}")
      `;
  }

  const prompt = `
    You are an expert Real Estate Analyst & Investment Advisor for Bergen County, NJ.
    Write a detailed "Daily Investment & Mortgage Update" for today.
    STRICT INSTRUCTION: Do NOT include a main title or H1/H2 header at the beginning. The website already displays the title. Start directly with the first section (e.g. "### 1. Mortgage Rate Monitor").

    ${rateContext}

    You MUST output the response in strictly valid JSON format with the following structure:
    {
      "english": "markdown content here (escape double quotes with backslash)",
      "korean": "korean translation of the markdown content here (escape double quotes with backslash)"
    }

    Content Requirements (Focus on Bergen County, NJ):
    1. **Mortgage Rate Monitor**:
       - Create a Markdown table with EXACTLY these columns: "Loan Type", "Estimated Rate (APR)", "Trend (vs Last Week)".
       - For "Trend", you MUST compare it to last week (or yesterday) and use specific arrows: "↑ Rising", "↓ Falling", or "→ Stable".
       - Include 30-year fixed, 15-year fixed, and 5/1 ARM.
       - IMPORTANT: Use the LIVE DATA provided above for 30-year and 15-year rates. Do not hallunicate different numbers for these. For 5/1 ARM, estimate based on typical spread if not provided.
       - Briefly comment on the catalyst for this trend (e.g. Fed news, inflation data).
    
    2. **Bergen County Regional Market Pulse**:
       - Instead of focusing on just one area, analyze Key Regions of Bergen County.
       - Group major towns into meaningful clusters, for example:
         * **Northern Valley**: (Tenafly, Closter, Cresskill, Demarest, Alpine, Haworth)
         * **Pascack Valley**: (Woodcliff Lake, Hillsdale, River Vale, Westwood)
         * **Gold Coast / Waterfront**: (Edgewater, Fort Lee, Cliffside Park)
         * **Northwest Bergen**: (Ridgewood, Ho-Ho-Kus, Saddle River, Franklin Lakes, Wyckoff)
         * **Central Bergen**: (Paramus, Oradell, River Edge)
       - Select 3-4 distinct regions to highlight today (rotate focus if possible, but cover diverse areas).
       - For EACH selected region, provide:
         * **Market Mood**: Buyer's vs Seller's Market status.
         * **Key Trend**: What is happening with inventory or pricing?
         * **Actionable Advice**: Special tip for investors or sellers in this specific zone.

    3. **Strategic Advice**:
       - Tip for First-time homebuyers in this rate environment.
       - Tip for homeowners considering selling.

    Tone:
    - Highly vivid, professional, and confident.
    - Use data-driven language but keep it accessible.
    - Korean translation should be high-quality business formal (polite).
    - Ensure all JSON strings are valid (no invalid control characters).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = cleanJson(text);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating market insight:", error);
    throw error;
  }
};
