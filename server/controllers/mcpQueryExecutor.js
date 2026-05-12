import { GoogleGenerativeAI } from '@google/generative-ai';
import Student from '../models/Student.js';
import User from '../models/user.js';
import Application from '../models/application.js';
import Payment from '../models/payment.js';
import University from '../models/university.js';
import Course from '../models/course.js';
import Country from '../models/country.js';
import config from '../config/index.js';

const MODEL_MAPPING = {
  students: Student,
  users: User,
  applications: Application,
  payments: Payment,
  universities: University,
  courses: Course,
  countries: Country,
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Executes a resolved context against the database and generates a natural language response
 * @param {Object} context - The resolved query context (collection, filter, sort, limit, count)
 * @param {string} originalQuery - The original natural language query from the user
 */
export default async function executeQuery(context, originalQuery) {
  const { collection, filter, count, sort, limit, fields } = context;
  const MongoModel = MODEL_MAPPING[collection];

  if (!MongoModel) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  try {
    console.log(`[MCP Executor] Executing query on ${collection}`, { filter, count });
    
    let dbResult;
    if (count) {
      const total = await MongoModel.countDocuments(filter);
      dbResult = { count: total };
    } else {
      // Create query
      let query = MongoModel.find(filter).sort(sort).limit(limit);
      
      // Select specific fields if provided
      if (fields && fields.length > 0) {
        query = query.select(fields.join(' '));
      }
      
      dbResult = await query.lean();
    }

    // Generate AI response message
    let aiMessage = '';
    try {
      const prompt = `
        You are an AI assistant for Stedinow CRM, an education consultancy platform.
        A user asked: "${originalQuery}"
        The database returned the following data from the "${collection}" collection:
        ${JSON.stringify(dbResult, null, 2)}
        
        Please provide a concise, professional, and helpful natural language summary of this data.
        If it's a count, just state the number clearly.
        If it's a list, summarize the key findings (e.g., "I found 3 students in the visa stage: John, Doe, and Smith").
        Keep it under 3 sentences.
      `;

      const result = await model.generateContent(prompt);
      aiMessage = result.response.text().trim();
    } catch (aiError) {
      console.error('[MCP Executor] AI Message Generation Failed:', aiError.message);
      // Fallback message
      if (count) {
        aiMessage = `I found ${dbResult.count} ${collection} matching your request.`;
      } else {
        aiMessage = `I found ${dbResult.length} ${collection}. Here are the details.`;
      }
    }

    return {
      success: true,
      message: aiMessage,
      data: dbResult,
      type: count ? 'count' : 'list',
      meta: {
        collection,
        filterCount: Object.keys(filter).length,
        resultCount: count ? dbResult.count : dbResult.length
      }
    };
  } catch (error) {
    console.error(`[MCP Executor] Database Error:`, error.message);
    throw error;
  }
}
