import { GoogleGenAI, Type } from "@google/genai";
import { GameStats } from "../types";

// Helper to safely get API key
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const getCoachCommentary = async (stats: GameStats, lastResult: 'SCORED' | 'MISSED'): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "AI Coach: (API Key missing) Nice shot!";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are a high-energy, witty basketball coach and commentator.
      The player just ${lastResult} a shot.
      Current Stats:
      - Shots Made: ${stats.shotsMade}/${stats.shotsTaken}
      - Current Streak: ${stats.currentStreak}
      - Best Streak: ${stats.bestStreak}

      Give a very short (max 15 words), punchy comment reacting to this.
      If they are on a streak, get hyped. If they missed, roast them gently or offer quick encouragement.
      Do not use hashtags.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 50,
        temperature: 0.9,
      }
    });

    return response.text || "Keep shooting!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Focus on the rim!";
  }
};