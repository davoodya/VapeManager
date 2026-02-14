
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CoilStats, WickingHistory } from '../types.ts';

// Using gemini-2.5-flash as it is supported for Maps grounding according to documentation
export const findNearbyShops = async (lat: number, lng: number): Promise<GenerateContentResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Find highly rated vape shops and electronic cigarette stores nearby. Provide names and summary of their ratings.",
    config: {
      tools: [{googleMaps: {}}],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    },
  });
  return response;
};

// Fix: Implemented missing visualizeCoilBuild function for CoilCalculator.tsx
/**
 * Generates a technical visualization of a coil build using gemini-2.5-flash-image.
 * Iterates through response parts to extract the base64 image data.
 */
export const visualizeCoilBuild = async (params: { 
  material: string, 
  wireConfig: string, 
  coilCount: string, 
  wraps: number, 
  innerDiameter: number 
}): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `A professional macro photo of a high-end vaping coil build on an RDA deck. 
    Specs: ${params.coilCount} ${params.wireConfig} ${params.material} coils, ${params.wraps} wraps, ${params.innerDiameter}mm inner diameter. 
    Industrial, clean, technical aesthetics, soft bokeh background.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Find the image part in the response as per guidelines
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Coil Visualization AI Error:", error);
    return null;
  }
};

export const analyzeExperience = async (topic: string, content: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this technical vaping journey entry and provide professional feedback.
      Topic: "${topic}"
      Log: "${content}"
      
      Structure your response:
      1. Technical Evaluation
      2. Optimization Ideas
      3. Pro Tip for this Setup.`,
    });
    return response.text || "Insight analysis pending.";
  } catch (error) {
    console.error("AI Error:", error);
    return "AI system currently offline.";
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following vaping analysis into ${targetLanguage}. Maintain technical accuracy and professional tone.
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following technical vaping analysis into a bulleted list of 3 absolute essentials.
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Vaping Setup Critical Analysis:
      - Vaping Style: ${setup.vapingStyle}
      - Atomizer: ${setup.atomizerModel}
      - Coil Specs: ${JSON.stringify(setup.coilData)}
      - Airflow Config: ${JSON.stringify(setup.airflow)}
      - Wattage: ${setup.wattage}W
      - Drip Tip: ${setup.dripTip}
      - Liquid: ${setup.liquidName}
      
      Structure your analysis with these exact headings:
      **Overall Evaluation**: Grade this build (A-F).
      **Optimization Suggestions**: Specific technical tweaks.
      **Compatibility Check**: Components alignment verification.
      **Cost Efficiency Insight**: Usage optimization vs longevity.
      **Necessary and Important Suggestion**: One critical action item for safety or flavor.
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
