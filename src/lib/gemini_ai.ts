import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini AI client
// Note: This requires NEXT_PUBLIC_GEMINI_API_KEY to be set in your .env file
// We use NEXT_PUBLIC_ prefix because this is likely used in client-side components
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const gemini_ai = new GoogleGenerativeAI(apiKey);

export const gemini = gemini_ai.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
});
