import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: config.gemini.model });

/**
 * Processes a document image using Gemini Vision to extract key identity information
 */
export const processDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath);
    
    const prompt = `
      Extract the following information from this identity document (Passport, Aadhaar, or National ID).
      Return ONLY a valid JSON object with these exact keys:
      - name: Full name as it appears on the document
      - idNumber: Passport number or ID number
      - dob: Date of birth in YYYY-MM-DD format
      - expiryDate: Expiry date if applicable in YYYY-MM-DD format
      - nationality: Country of citizenship
      - gender: Male, Female, or Other
      
      If a field is not clearly visible or not present, use null for that value.
      Do not include any other text or markdown formatting in your response, just the JSON object.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileData.toString('base64'),
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const responseText = result.response.text();
    
    // Clean up temp file after reading
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('[OCR Controller] Failed to delete temp file:', filePath);
    }

    // Parse JSON safely
    let extractedData = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[OCR Controller] JSON Parse Error:', parseError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to parse AI response',
        raw: responseText 
      });
    }

    res.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error('[OCR Controller] Gemini Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process document using AI' });
  }
};
