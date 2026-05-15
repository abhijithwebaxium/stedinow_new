import express from 'express';
import resolveContext from '../controllers/mcpContextResolver.js';
import executeQuery from '../controllers/mcpQueryExecutor.js';
import { requireAuth, isAuthenticated } from '../middleware/auth.js';
import ChatConversation from '../models/chatConversation.js';
import ChatMessage from '../models/chatMessage.js';
import ErrorQuery from '../models/errorQuery.js';

const router = express.Router();

// Protect all routes
router.use(requireAuth);
router.use(isAuthenticated);

// Helper function to save chat messages
async function saveChatMessage(userId, conversationId, type, content, query = null, response = null, metadata = {}) {
  try {
    const messageData = {
      conversationId,
      userId,
      type,
      content,
      metadata
    };

    if (type === 'user') {
      messageData.query = query || content;
    } else if (type === 'assistant') {
      messageData.response = response;
    }

    const message = await ChatMessage.create(messageData);
    return message;
  } catch (error) {
    console.error('[Chat] Failed to save message:', error.message);
    return null;
  }
}

// Helper function to get or create conversation
async function getOrCreateConversation(userId, title = null) {
  try {
    const defaultTitle = title || `Chat ${new Date().toLocaleString()}`;

    const conversation = await ChatConversation.create({
      title: defaultTitle.substring(0, 100),
      userId,
      lastMessageAt: new Date(),
      messageCount: 0
    });

    return conversation;
  } catch (error) {
    console.error('[Chat] Failed to create conversation:', error.message);
    return null;
  }
}

// Helper function to track error queries
async function trackErrorQuery(query, error, statusCode, processingTime, req, context = null) {
  try {
    let errorType = 'UnknownError';
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('Context needed:')) {
      errorType = 'ContextResolutionError';
    } else if (errorMessage.includes('Unknown collection')) {
      errorType = 'DatabaseError';
    } else if (errorMessage.includes('Gemini API')) {
      errorType = 'GeminiAPIError';
    } else if (errorMessage.includes('JSON.parse')) {
      errorType = 'JSONParseError';
    } else if (errorMessage.includes('timeout')) {
      errorType = 'TimeoutError';
    } else if (errorMessage.includes('validation')) {
      errorType = 'ValidationError';
    }

    const errorQueryData = {
      query: query.substring(0, 1000),
      errorMessage: errorMessage.substring(0, 500),
      errorType,
      statusCode,
      processingTime,
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip || req.connection.remoteAddress || '',
      context: context ? {
        collection: context.collection,
        filter: context.filter,
        fields: context.fields,
        limit: context.limit,
        sort: context.sort
      } : null,
      stackTrace: error.stack ? error.stack.substring(0, 1000) : null
    };

    await ErrorQuery.create(errorQueryData);
  } catch (trackingError) {
    console.error('[MCP Error Tracking] Failed to track error query:', trackingError.message);
  }
}

// Main query endpoint
router.post('/query', async (req, res) => {
  const startTime = Date.now();
  const { input, conversationId, userId } = req.body;

  // Input validation
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input: Please provide a valid query string.'
    });
  }

  if (input.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Query too long: Please limit your query to 1000 characters.'
    });
  }

  // Security check for sensitive keywords
  const sensitiveKeywords = ['password', 'secret', 'key', 'token', 'credential'];
  const lowerInput = input.toLowerCase();
  const hasSensitiveContent = sensitiveKeywords.some(keyword => lowerInput.includes(keyword));

  if (hasSensitiveContent) {
    return res.json({
      success: true,
      result: {
        message: "I can't help with accessing sensitive information like passwords or credentials for security reasons.",
        type: 'security_block'
      }
    });
  }

  let context = null;
  let trimmedInput = '';

  try {
    trimmedInput = input.trim();

    try {
      context = await resolveContext(trimmedInput);

      if (!context || typeof context !== 'object') {
        console.error('[MCP Query] Invalid context resolved:', context);
        throw new Error('Invalid context resolution: Unable to understand the query structure');
      }
    } catch (contextError) {
      console.error(`[MCP Query] Context resolution failed:`, contextError.message);
      throw contextError;
    }

    const result = await executeQuery(context, trimmedInput);
    const processingTime = Date.now() - startTime;

    // Handle chat conversation if userId is provided
    let chatConversationId = conversationId;
    if (userId) {
      try {
        let conversation = null;
        if (conversationId) {
          conversation = await ChatConversation.findOne({ _id: conversationId, userId });
        }

        if (!conversation) {
          const title = trimmedInput.substring(0, 50).trim() + (trimmedInput.length > 50 ? '...' : '');
          conversation = await getOrCreateConversation(userId, title);
          chatConversationId = conversation ? conversation._id : null;
        }

        if (conversation) {
          await saveChatMessage(
            userId,
            conversation._id,
            'user',
            trimmedInput,
            trimmedInput,
            null,
            { processingTime: 0, queryType: 'user_input' }
          );

          await saveChatMessage(
            userId,
            conversation._id,
            'assistant',
            result.message || JSON.stringify(result),
            null,
            result,
            {
              processingTime,
              queryType: result.type || 'database'
            }
          );
        }
      } catch (chatError) {
        console.error('[Chat] Error saving chat messages:', chatError.message);
      }
    }

    res.json({
      success: true,
      result,
      conversationId: chatConversationId,
      meta: {
        processingTime,
        timestamp: new Date().toISOString(),
        queryLength: input.length
      }
    });

  } catch (err) {
    const processingTime = Date.now() - startTime;
    console.error(`[MCP Error] ${err.message} (${processingTime}ms)`, {
      input: input.substring(0, 200),
      stack: err.stack
    });

    let userMessage = 'I encountered an issue processing your request. Please try rephrasing your question.';
    let statusCode = 500;

    if (err.message.includes('Context needed:')) {
      userMessage = err.message.replace('Context needed: ', '');
      statusCode = 400;
    } else if (err.message.includes('Unknown collection')) {
      userMessage = 'I couldn\'t find the data you\'re looking for. Please check if you\'re asking about valid database collections.';
      statusCode = 400;
    } else if (err.message.includes('Gemini API')) {
      userMessage = 'I\'m having trouble understanding your question right now. Please try again in a moment.';
      statusCode = 503;
    } else if (err.message.includes('timeout')) {
      userMessage = 'Your request is taking too long to process. Please try a simpler query.';
      statusCode = 408;
    }

    const queryToTrack = trimmedInput || input || '';
    await trackErrorQuery(queryToTrack, err, statusCode, processingTime, req, context);

    res.status(statusCode).json({
      success: false,
      error: userMessage,
      meta: {
        processingTime,
        timestamp: new Date().toISOString(),
        errorType: err.name || 'UnknownError'
      }
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MCP Query Service'
  });
});

// Get conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await ChatConversation.find({
      userId,
      isActive: true
    })
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    const total = await ChatConversation.countDocuments({ userId, isActive: true });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('[Chat] Failed to fetch conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ChatMessage.countDocuments({ conversationId });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('[Chat] Failed to fetch messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

export default router;
