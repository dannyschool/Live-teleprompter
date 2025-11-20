import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enhanceScript = async (currentText: string, tone: 'engaging' | 'professional' | 'funny'): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const ai = getAiClient();
  const prompt = `
    Act as a professional live stream scriptwriter.
    Rewrite the following script content to make it more ${tone}.
    Keep the core message but improve flow, readability for speaking aloud, and audience engagement.
    Do not add markdown formatting like **bold** or titles, just return the raw text ready for a teleprompter.

    Script:
    ${currentText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || currentText;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};
