import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResponse } from "../types";

// Initialize Gemini Client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const extractWarrantyDetails = async (base64Image: string): Promise<ExtractionResponse> => {
  if (!ai) {
    throw new Error("Gemini API Key is missing. Please check your .env file.");
  }

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
            text: `Analyze this image carefully.
            1. First, determine if this image is a valid appliance bill, warranty card, product box, or invoice containing product details. 
               - If it is NOT a valid document (e.g., a selfie, a landscape, a blank paper, or irrelevant object), set 'is_valid_document' to false.
               - If it is invalid, generate a funny, witty message in 'validation_message' telling the user to stop playing around and upload a real bill.
            2. If it IS a valid document, set 'is_valid_document' to true.
            3. Extract the following details into the JSON format.
               - If a field is not found, return an empty string or empty array. 
               - Infer the 'expiry_date' based on 'purchase_date' and 'warranty_period' if explicitly stated.
               - Infer the 'category' of the device based on the content.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_valid_document: { type: Type.BOOLEAN, description: "True if the image is a valid bill/warranty/product box, false otherwise." },
            validation_message: { type: Type.STRING, description: "Funny message if invalid, or empty if valid." },
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
          required: ["is_valid_document"],
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
