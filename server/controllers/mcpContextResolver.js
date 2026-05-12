// Simplified MCP Context Resolver - Pattern-based (no AI needed)
// Converts natural language queries to MongoDB query context

const COLLECTION_MAPPINGS = {
  'student': 'students',
  'students': 'students',
  'lead': 'students',
  'leads': 'students',
  'user': 'users',
  'users': 'users',
  'staff': 'users',
  'counselor': 'users',
  'counselors': 'users',
  'application': 'applications',
  'applications': 'applications',
  'document': 'documents',
  'documents': 'documents',
  'payment': 'payments',
  'payments': 'payments',
  'university': 'universities',
  'universities': 'universities',
  'course': 'courses',
  'courses': 'courses',
  'country': 'countries',
  'countries': 'countries',
};

const STATUS_MAPPINGS = {
  'new': 'New Inquiry',
  'interested': 'Interested',
  'callback': 'Callback Required',
  'documents pending': 'Documents Pending',
  'docs pending': 'Documents Pending',
  'application submitted': 'Application Submitted',
  'offer received': 'Offer Received',
  'visa approved': 'Visa Approved',
  'enrolled': 'Enrollment Confirmed',
};

const PHASE_MAPPINGS = {
  'lead': 'Lead Acquisition',
  'counseling': 'Counseling & Selection',
  'application': 'Application Processing',
  'onboarding': 'Student Onboarding',
  'visa': 'Visa Preparation',
  'post arrival': 'Post-Arrival Support',
};

// Extract collection from query
function extractCollection(query) {
  const lowerQuery = query.toLowerCase();

  for (const [key, value] of Object.entries(COLLECTION_MAPPINGS)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }

  // Default to students if no collection found
  return 'students';
}

// Extract filters from query
function extractFilters(query, collection) {
  const lowerQuery = query.toLowerCase();
  const filters = {};

  // Status filters
  for (const [key, value] of Object.entries(STATUS_MAPPINGS)) {
    if (lowerQuery.includes(key)) {
      filters.currentStatus = value;
      break;
    }
  }

  // Phase filters
  for (const [key, value] of Object.entries(PHASE_MAPPINGS)) {
    if (lowerQuery.includes(key)) {
      filters.currentPhase = value;
      break;
    }
  }

  // Role filters (for users collection)
  if (collection === 'users') {
    if (lowerQuery.includes('counselor')) {
      filters['role.name'] = 'Counselor';
    } else if (lowerQuery.includes('admin')) {
      filters['role.name'] = 'Admin';
    } else if (lowerQuery.includes('manager')) {
      filters['role.name'] = 'Manager';
    }
  }

  // Time-based filters
  if (lowerQuery.includes('today')) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    filters.createdAt = { $gte: startOfDay, $lte: endOfDay };
  } else if (lowerQuery.includes('this week')) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    filters.createdAt = { $gte: weekAgo };
  } else if (lowerQuery.includes('this month')) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    filters.createdAt = { $gte: monthStart };
  }

  // Name search
  const nameMatch = lowerQuery.match(/named?\s+([a-z\s]+)/i);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    filters.name = { $regex: name, $options: 'i' };
  }

  // Email search
  const emailMatch = lowerQuery.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    filters.email = emailMatch[1];
  }

  // Phone search
  const phoneMatch = lowerQuery.match(/phone\s+([0-9]+)/i);
  if (phoneMatch) {
    filters.phone = { $regex: phoneMatch[1] };
  }

  return filters;
}

// Determine if it's a count query
function isCountQuery(query) {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('how many') ||
    lowerQuery.includes('count') ||
    lowerQuery.includes('total') ||
    lowerQuery.includes('number of')
  );
}

// Determine sort order
function extractSort(query) {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('latest') || lowerQuery.includes('recent') || lowerQuery.includes('newest')) {
    return { createdAt: -1 };
  }

  if (lowerQuery.includes('oldest')) {
    return { createdAt: 1 };
  }

  if (lowerQuery.includes('name')) {
    return { name: 1 };
  }

  // Default sort by most recent
  return { createdAt: -1 };
}

// Determine limit
function extractLimit(query) {
  const lowerQuery = query.toLowerCase();

  // Look for number patterns like "first 5", "top 10", "show 20"
  const limitMatch = lowerQuery.match(/(first|top|show|last)\s+(\d+)/);
  if (limitMatch) {
    return Math.min(parseInt(limitMatch[2]), 100);
  }

  // Default limit
  return 50;
}

// Main resolver function
export default async function resolveContext(naturalText) {
  try {
    console.log(`[MCP Context] Resolving query: "${naturalText}"`);

    const collection = extractCollection(naturalText);
    const filter = extractFilters(naturalText, collection);
    const count = isCountQuery(naturalText);
    const sort = extractSort(naturalText);
    const limit = extractLimit(naturalText);

    const context = {
      collection,
      filter,
      count,
      sort,
      limit,
      fields: [] // Return all fields by default
    };

    console.log(`[MCP Context] Resolved context:`, JSON.stringify(context, null, 2));

    return context;
  } catch (error) {
    console.error('[MCP Context] Error resolving context:', error.message);
    throw new Error(`Failed to resolve query context: ${error.message}`);
  }
}
