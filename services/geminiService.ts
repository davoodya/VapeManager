
import { GoogleGenAI, Type } from "@google/genai";
import { CoilStats, WickingHistory } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeExperience = async (topic: string, content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an elite mechanical engineer and master mixologist in the vaping industry. 
      Analyze this user session entry:
      Topic: "${topic}"
      Log: "${content}"
      
      Task: Provide a critical, technical 2-sentence insight. Focus on juice-coil interaction or thermal dynamics if mentioned. 
      Use professional terminology. Keep it under 200 characters.`,
    });
    return response.text || "Insight analysis pending.";
  } catch (error) {
    console.error("AI Error:", error);
    return "AI system currently offline.";
  }
};

export const findSweetSpot = async (
  coil: Partial<CoilStats>, 
  history: WickingHistory[], 
  liquidType: string
): Promise<string> => {
  try {
    const prompt = `
      Vape Setup Technical Analysis Request:
      Configuration: ${coil.coilCount} ${coil.wireConfig} Build
      Specs: ${coil.material} ${coil.gauge}ga, ${coil.wraps} wraps, ${coil.innerDiameter}mm ID. 
      Resulting Ohms: ${coil.resistance}Ω.
      Surface Area estimate: ${coil.surfaceArea} mm².
      Juice Category: ${liquidType}.
      
      Predict:
      1. Optimal Wattage Range (e.g. 15-18W) based on typical heat flux of 200mW/mm².
      2. Wicking strategy (Tight/Loose) for this specific coil diameter.
      3. Expected flavor notes (Warm/Cool) with this setup.
      
      Be extremely precise and technical.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });
    return response.text || "Setup verification complete.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Optimization engine unavailable.";
  }
};
