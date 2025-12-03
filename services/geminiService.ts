import { GoogleGenAI } from "@google/genai";
import { Activity, Child } from '../types';

// Initialize Gemini client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailySummary = async (
  child: Child,
  activities: Activity[]
): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Error: API Key not configured. Please provides a valid API Key to use the Smart Summary feature.";
  }

  const prompt = `
    You are an affectionate and professional AI assistant for a preschool parent app called 'SchoolFam'.
    
    Child Name: ${child.name}
    Class: ${child.class}
    
    Here are today's recorded activities:
    ${JSON.stringify(activities.map(a => ({ type: a.type, title: a.title, desc: a.description, time: a.timestamp })))}
    
    Please generate a 'Smart Daily Summary' for the parent.
    The summary should be formatted in Markdown and include:
    1. A warm opening.
    2. A bulleted list of "Skills & Milestones" practiced today based on the activities.
    3. A "Mood & Social" observation (infer from activities).
    4. A creative "Ask ${child.name} about..." conversation starter question for the parent to use tonight.
    
    Keep the tone encouraging, concise, and professional yet warm. Use emojis sparingly but effectively.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate summary at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, we couldn't generate the AI summary right now. Please try again later.";
  }
};