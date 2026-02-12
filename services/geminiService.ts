
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

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following technical vaping analysis text into ${targetLanguage}. Maintain the professional tone and specialized terminology. Return only the translated text.
      Text: "${text}"`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

export const summarizeAiComment = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following vaping setup analysis into a very brief bulleted list (max 3-4 bullets). Use short, high-impact headings followed by extremely concise explanations. Focus only on critical improvements and alignment. Return only the summarized text.
      Text: "${text}"`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Summary Error:", error);
    return text;
  }
};

export const analyzeSetupLogic = async (setup: any): Promise<string> => {
  try {
    const prompt = `
      Vaping Setup Critical Analysis Request:
      
      Details:
      - Vaping Style: ${setup.vapingStyle}
      - Atomizer: ${setup.atomizerModel} (${setup.atomizerStyle})
      - Coil: ${JSON.stringify(setup.coilData)}
      - Airflow: ${JSON.stringify(setup.airflow)}
      - Drip Tip: ${setup.dripTip} ${setup.dripTipCustomValue || ''}
      - Coil Height: ${setup.coilHeightMm}mm
      - E-Liquid: ${setup.liquidNicotine}mg ${setup.liquidType}
      
      Task:
      1. Analyze compatibility between coil resistance and vaping style (${setup.vapingStyle}).
      2. Evaluate if the airflow configuration (AFC/Insert) matches the coil diameter.
      3. Validate the coil height relative to airflow logic.
      4. Detect inconsistencies (e.g., high nicotine with high wattage/DL style).
      5. Suggest 1-2 concrete technical improvements.
      
      Keep the tone professional, engineering-focused, and concise.
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
    return "Analysis engine unavailable.";
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
