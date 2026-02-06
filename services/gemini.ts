
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAcademicInsights = async (students: Student[]): Promise<string> => {
  if (students.length === 0) return "Add some student records to generate insights.";

  const prompt = `
    Analyze the following student records and provide a professional, concise academic report.
    Highlight the overall performance trends, identify potential outliers, and suggest strategies for academic improvement.
    
    Student Data:
    ${students.map(s => `${s.name} (Roll: ${s.rollNumber}, GPA: ${s.gpa}, Dept: ${s.department})`).join('\n')}
    
    Format the response with bullet points and clear headings. Keep it focused on actionable insights.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Failed to generate AI insights.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "The academic advisor is currently offline. Please try again later.";
  }
};

export const generateSampleStudents = async (): Promise<Partial<Student>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate 5 realistic sample student records for a university system. Return ONLY as a JSON array of objects with properties: name, rollNumber (e.g. CS2024-001), gpa (between 2.0 and 4.0), department (CS, EE, ME, or Math), and status (Enrolled).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              rollNumber: { type: Type.STRING },
              gpa: { type: Type.NUMBER },
              department: { type: Type.STRING },
              status: { type: Type.STRING }
            },
            required: ['name', 'rollNumber', 'gpa', 'department', 'status']
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate sample data", error);
    return [];
  }
};
