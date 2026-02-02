
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY!;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
};

export const generateMarketInsight = async () => {
  const model = getGeminiModel();
  const prompt = `
    You are an expert Real Estate Analyst & Investment Advisor for Bergen County, NJ.
    Write a detailed "Daily Investment & Mortgage Update" for today (${new Date().toLocaleDateString()}).

    You MUST output the response in strictly valid JSON format with the following structure:
    {
      "english": "markdown content here...",
      "korean": "korean translation of the markdown content here..."
    }

    Content Requirements (Focus on Bergen County, NJ):
    1. **Mortgage Rate Monitor**:
       - Provide TODAY's estimated mortgage interest rates for 30-year fixed, 15-year fixed, and ARM.
       - Comment on the trend (Rising/Falling/Stable) compared to last week.
    
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

    // Clean up potential markdown formatting in the response (e.g. ```json ... ```)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating market insight:", error);
    throw error;
  }
};
