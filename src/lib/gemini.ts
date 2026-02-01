
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY!;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

export const generateMarketInsight = async () => {
  const model = getGeminiModel();
  const prompt = `
    You are an expert Real Estate Analyst for Bergen County, NJ.
    Write a daily "Realtor's Investment Vision" post for today (${new Date().toLocaleDateString()}).
    
    You MUST output the response in strictly valid JSON format with the following structure:
    {
      "english": "markdown content here...",
      "korean": "korean translation of the markdown content here..."
    }

    Content Requirements for both versions:
    1. **Market Snapshot**: Current mortgage rates (30-year fixed, 15-year fixed) - estimate based on recent trends. Mention specific towns like Tenafly, Cresskill, Closter.
    2. **Price Trends**: Upward/downward pressure in Bergen County luxury market.
    3. **Investment Opportunity**: Where is the "smart money" going right now?
    4. **Realtor's Advice**: A actionable tip for buyers or sellers today.
    
    Tone: Professional, insightful, encouraging, yet realistic. 
    Keep it concise. Ensure the Korean translation is natural and professional (polite formal tone).
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
