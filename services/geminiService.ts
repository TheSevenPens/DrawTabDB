import { GoogleGenAI } from "@google/genai";
import { Tablet } from '../types';

// Singleton instance to avoid re-creation
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    // Assuming API Key is set in environment, but handling gracefully if not
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.warn("API_KEY not found in environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateTabletResponse = async (
  userPrompt: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  tablets: Tablet[]
): Promise<string> => {
  try {
    const client = getAiClient();
    if (!client) throw new Error("AI Client initialization failed");

    // We condense the data to save tokens, focusing on key specs
    // Using the dynamic `tablets` passed to the function instead of imported rawData
    const dataSummary = tablets.map(t => 
      `${t.Brand} ${t.ModelName} (${t.LaunchYear || 'N/A'}): ${t.Type}, ${t.PressureLevels} pressure, ${t.DisplayResolution || 'N/A'}`
    ).join('\n');

    const systemInstruction = `
      You are DrawTabDB AI, an expert assistant for a drawing tablet database.
      You have access to the following list of tablets (Brand, Model, Year, Type, Pressure, Resolution):
      ---
      ${dataSummary}
      ---
      Rules:
      1. Answer user questions about these tablets specifically.
      2. If you don't know the answer from the data provided, use your general knowledge about drawing tablets (Wacom, Huion, XP-Pen, Xencelabs technology) but mention you are generalizing.
      3. Be concise and helpful.
      4. If asked to compare, pick 2-3 specific models from the list and compare their specs.
      5. Format your response with Markdown (bolding key terms, lists).
    `;

    const model = "gemini-2.5-flash";
    
    const response = await client.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: `System Context: ${systemInstruction}` }] },
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI service. Please check your API key configuration.";
  }
};