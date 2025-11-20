import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResponse } from "../types";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractWarrantyDetails = async (base64Image: string): Promise<ExtractionResponse> => {
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.includes(',') 
    ? base64Image.split(',')[1] 
    : base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity
              data: base64Data
            }
          },
          {
            text: `Analyze this image of an appliance bill, warranty card, or product box. 
            Extract the following details into a strict JSON format. 
            If a field is not found, return an empty string or empty array. 
            Infer the 'expiry_date' based on 'purchase_date' and 'warranty_period' if explicitly stated, otherwise leave empty.
            Infer the 'category' of the device (e.g., Refrigerator, Laptop, Washing Machine) based on the content.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            device_serial: { type: Type.STRING, description: "The serial number of the device" },
            brand_name: { type: Type.STRING, description: "The manufacturer brand name" },
            warranty_period: { type: Type.STRING, description: "Duration of warranty (e.g., '24 months')" },
            purchase_date: { type: Type.STRING, description: "Date of purchase in YYYY-MM-DD format" },
            expiry_date: { type: Type.STRING, description: "Date of warranty expiry in YYYY-MM-DD format" },
            free_service_dates: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of dates for free service in YYYY-MM-DD format" 
            },
            helpline_number: { type: Type.STRING, description: "Customer support phone number" },
            invoice_number: { type: Type.STRING, description: "The invoice or bill number" },
            service_receipt: { type: Type.STRING, description: "Service receipt number if applicable" },
            category: { type: Type.STRING, description: "Category of the appliance (e.g., TV, Fridge)" }
          },
          required: ["brand_name"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini.");

    const data = JSON.parse(text) as ExtractionResponse;
    return data;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};