
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

export const generateMarketInsight = async () => {
  const model = getGeminiModel();
  const liveRates = await getMortgageRates();

  let rateContext = "";
  if (liveRates && liveRates.thirty) {
    rateContext = `
      LIVE DATA (Source: Mortgage News Daily) - USE THESE EXACT NUMBERS:
      - 30-Year Fixed: ${liveRates.thirty.rate} (Change: ${liveRates.thirty.change})
      - 15-Year Fixed: ${liveRates.fifteen?.rate || "N/A"} (Change: ${liveRates.fifteen?.change || "N/A"})
      `;
  }

  const prompt = `
    You are an expert Real Estate Analyst & Investment Advisor for Bergen County, NJ.
    Write a detailed "Daily Investment & Mortgage Update" for today.
    STRICT INSTRUCTION: Do NOT include a main title or H1/H2 header at the beginning. The website already displays the title. Start directly with the first section (e.g. "### 1. Mortgage Rate Monitor").

    ${rateContext}

    You MUST output the response in strictly valid JSON format with the following structure:
    {
      "english": "markdown content here...",
      "korean": "korean translation of the markdown content here..."
    }

    Content Requirements (Focus on Bergen County, NJ):
    1. **Mortgage Rate Monitor**:
       - Create a Markdown table with EXACTLY these columns: "Loan Type", "Estimated Rate (APR)", "Trend (vs Last Week)".
       - For "Trend", you MUST compare it to last week (or yesterday) and use specific arrows: "↑ Rising", "↓ Falling", or "→ Stable".
       - Include 30-year fixed, 15-year fixed, and 5/1 ARM.
       - IMPORTANT: Use the LIVE DATA provided above for 30-year and 15-year rates. Do not hallunicate different numbers for these. For 5/1 ARM, estimate based on typical spread if not provided.
       - Briefly comment on the catalyst for this trend (e.g. Fed news, inflation data).
    
    2. **Bergen County Investment Vision**:
       - Analyze the current buying power in towns like Tenafly, Closter, Cresskill, Demarest, Alpine.
       - Is it a Buyer's or Seller's market right now? Why?
       - Provide a specific actionable "Investment Opinion" for investors looking at this week.

    3. **Strategic Advice**:
       - Tip for First-time homebuyers in this rate environment.
       - Tip for homeowners considering selling.

    Tone:
    - Highly vivid, professional, and confident.
    - Use data-driven language but keep it accessible.
    - Korean translation should be high-quality business formal (polite).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // clean up potential markdown formatting
    let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Attempt to extract JSON if there's extra text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating market insight:", error);
    throw error;
  }
};
