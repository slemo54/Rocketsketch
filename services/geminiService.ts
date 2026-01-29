
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TranscriptionResult, GenerationSettings, AspectRatio } from "../types";

// Helper to map UI aspect ratios to SDK supported ones
const mapToSupportedAspectRatio = (ratio: string): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
  const supported = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  if (supported.includes(ratio)) return ratio as any;
  if (ratio === "2:3") return "3:4";
  if (ratio === "3:2") return "4:3";
  if (ratio === "21:9") return "16:9";
  return "1:1";
};

export const analyzeNote = async (base64Image: string): Promise<TranscriptionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this hand-drawn note image. 
  Extract the main title, a concise summary, the most important key points as a list, and suggest visual themes (icons, styles) that would suit a digital sketchnote.
  Return the result strictly as a JSON object.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
          rawText: { type: Type.STRING }
        },
        required: ["title", "summary", "keyPoints", "visualThemes", "rawText"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateSketchnote = async (
  analysis: TranscriptionResult, 
  settings: GenerationSettings
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Create a vertical digital sketchnote infographic based on these notes:
    Title: ${analysis.title}
    Summary: ${analysis.summary}
    Key Points: ${analysis.keyPoints.join(', ')}
    
    Style Requirements:
    - Pure white background.
    - High-quality, clean line art with a hand-drawn aesthetic but digitally polished.
    - Minimalist color palette: primarily black ink with subtle accent colors (like yellow or soft blue).
    - Legible, neat handwriting-style font for text elements.
    - Use clean icons and structured layout (sections, arrows, banners).
    - Vertical composition.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: mapToSupportedAspectRatio(settings.aspectRatio),
        imageSize: settings.imageSize
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};
