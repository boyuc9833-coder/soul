
import { GoogleGenAI, Type } from "@google/genai";
import { ExpertType } from "../types";
import { SYSTEM_PROMPTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getExpertResponse = async (expertId: ExpertType, userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  try {
    if (expertId === 'COUNCIL') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "你同時扮演情感專家 Luna、星座專家 Astro、命理專家玄清大師。請針對使用者的問題，分別給出三段建議。回應格式請嚴格遵守 JSON：{ \"emotion\": \"...\", \"zodiac\": \"...\", \"numerology\": \"...\" }",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emotion: { type: Type.STRING },
              zodiac: { type: Type.STRING },
              numerology: { type: Type.STRING }
            },
            required: ["emotion", "zodiac", "numerology"]
          }
        },
      });
      return response.text;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPTS[expertId as keyof typeof SYSTEM_PROMPTS],
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return expertId === 'COUNCIL' ? "{ \"emotion\": \"通靈失敗\", \"zodiac\": \"星象不明\", \"numerology\": \"天機不可洩漏\" }" : "抱歉，通靈過程中遇到了一些波動。";
  }
};

export const getJournalInsight = async (expertId: ExpertType, journalContent: string) => {
  try {
    if (expertId === 'COUNCIL') return null; // Journal already processes individual ones

    const prompt = `這是我今天的日記內容：「${journalContent}」。請以${SYSTEM_PROMPTS[expertId as keyof typeof SYSTEM_PROMPTS].split(' ')[1]}的身分，針對這篇日記給我簡短的點評與建議。字數請控制在 100 字以內。`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPTS[expertId as keyof typeof SYSTEM_PROMPTS],
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
};
