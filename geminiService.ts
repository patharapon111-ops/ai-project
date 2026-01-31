
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeDeed(description: string, imageUrl?: string) {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    วิเคราะห์การทำความดีที่นักเรียนส่งเข้ามาดังนี้:
    1. สรุปเป็นประโยคสั้นๆ 1 ประโยค (ภาษาไทย)
    2. จัดหมวดหมู่ (เช่น ชุมชน, สิ่งแวดล้อม, วิชาการ, ความเมตตา)
    3. ตรวจสอบว่าเป็นความดีจริงหรือไม่
    4. แนะนำคะแนน (ปกติ 20 คะแนน)
    
    รายละเอียดความดี: ${description}
    กรุณาตอบกลับเป็นภาษาไทยในส่วนของสรุปและหมวดหมู่
  `;

  try {
    const parts: any[] = [{ text: prompt }];
    
    if (imageUrl) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageUrl.split(',')[1] || "" 
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            isGenuine: { type: Type.BOOLEAN },
            suggestedPoints: { type: Type.NUMBER }
          },
          required: ["summary", "category", "isGenuine", "suggestedPoints"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}
