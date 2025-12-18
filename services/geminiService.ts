import { GoogleGenAI } from "@google/genai";
import { LabResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateHealthInsights = async (results: LabResult): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI service unavailable. Please check API Key configuration.";

  try {
    const prompt = `
      You are a friendly and professional gut health specialist.
      Analyze the following gut microbiome test results for a patient:
      - Diversity Score: ${results.diversityScore}/100 (Higher is better)
      - Beneficial Bacteria Load: ${results.goodBacteria}% (Target > 80%)
      - Pathogenic Bacteria Load: ${results.badBacteria}% (Target < 10%)
      - Key Sensitivity: ${results.sensitivity}

      Provide a 3-sentence summary of what this means for their health.
      Be encouraging but realistic. Do not give medical advice, but suggest general wellness steps.
      Format the output as a clean paragraph.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "I apologize, but I cannot connect to the service right now. Please check your configuration.";

  try {
    const systemInstruction = `
      You are the AI Assistant for GMTCC Insight, a premier gut health and microbiome research company based in Hong Kong.
      
      Your Role:
      - Answer questions about gut health, microbiome testing, and GMTCC's specific offerings.
      - Be professional, scientifically accurate, yet accessible and empathetic.
      - Do NOT provide medical diagnoses. Always recommend consulting a specialist for medical conditions.

      Product Knowledge:
      1. Option A (Gut Discovery Kit):
         - Cost: HKD 3,000.
         - Includes: At-home collection kit, 16S rRNA Lab Analysis, and a Full Microbiome Report.
         - Best for: Discovery and baseline understanding.

      2. Option B (Complete Gut Restoration):
         - Cost: HKD 3,900 (Special Year-End Price, normally HKD 4,800).
         - Includes: Everything in Option A PLUS a 20-min Video Consultation and a Complimentary 20-min BRT (Bio-Resonance) Check.
         - Best for: Taking action and building a personalized protocol.
         - 92% of customers choose this.

      Key Processes:
      - Timeline: Results take 3-4 weeks after the lab receives the sample.
      - BRT: German bio-resonance technology used to verify supplement compatibility.
      - Probiotics: Personalized protocols are purchased separately after consultation.

      If asked about pricing, always mention the savings on Option B.
    `;

    // Convert internal message format to Gemini API format
    // We limit history to the last 10 messages to save tokens
    const contents = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add the new message
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm sorry, I didn't catch that. Could you please rephrase?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble accessing my knowledge base right now. Please try again later.";
  }
};
