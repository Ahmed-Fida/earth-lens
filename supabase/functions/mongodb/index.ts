import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONGODB_URI = Deno.env.get('MONGODB_URI');

// Parse MongoDB connection string to extract cluster info
function parseMongoURI(uri: string) {
  try {
    // Extract cluster from connection string like: mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/
    const match = uri.match(/@([^/]+)/);
    if (match) {
      return match[1];
    }
  } catch (e) {
    console.error('Failed to parse MongoDB URI:', e);
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!MONGODB_URI) {
    return new Response(
      JSON.stringify({ error: 'MongoDB URI not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { action, collection, data, filter, userId } = await req.json();
    
    // For now, use in-memory storage simulation since MongoDB Data API requires additional setup
    // This provides the same interface while you configure MongoDB Atlas Data API
    
    const result = await handleAction(action, collection, data, filter, userId);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('MongoDB operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// In-memory storage (for development - data persists only during function execution)
// In production, this should be replaced with actual MongoDB Data API calls
const memoryStore: Record<string, Record<string, unknown>[]> = {
  profiles: [],
  analysis_history: [],
};

async function handleAction(
  action: string, 
  collection: string, 
  data?: Record<string, unknown>, 
  filter?: Record<string, unknown>,
  userId?: string
): Promise<unknown> {
  
  if (!memoryStore[collection]) {
    memoryStore[collection] = [];
  }
  
  const coll = memoryStore[collection];
  const now = new Date().toISOString();

  switch (action) {
    case 'insertOne': {
      const doc = {
        _id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      coll.push(doc);
      return { insertedId: doc._id };
    }

    case 'findOne': {
      return coll.find(doc => matchesFilter(doc, filter)) || null;
    }

    case 'find': {
      return coll.filter(doc => matchesFilter(doc, filter));
    }

    case 'updateOne': {
      const index = coll.findIndex(doc => matchesFilter(doc, filter));
      if (index >= 0) {
        coll[index] = { ...coll[index], ...data, updatedAt: now };
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    }

    case 'deleteOne': {
      const index = coll.findIndex(doc => matchesFilter(doc, filter));
      if (index >= 0) {
        coll.splice(index, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    }

    case 'upsertProfile': {
      const existingIndex = coll.findIndex(doc => doc.userId === userId);
      if (existingIndex >= 0) {
        coll[existingIndex] = { ...coll[existingIndex], ...data, userId, updatedAt: now };
        return { modifiedCount: 1, upsertedId: null };
      } else {
        const doc = {
          _id: crypto.randomUUID(),
          userId,
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        coll.push(doc);
        return { modifiedCount: 0, upsertedId: doc._id };
      }
    }

    case 'getProfile': {
      return coll.find(doc => doc.userId === userId) || null;
    }

    case 'saveAnalysis': {
      const doc = {
        _id: crypto.randomUUID(),
        userId,
        ...data,
        createdAt: now,
      };
      coll.push(doc);
      return { insertedId: doc._id };
    }

    case 'getAnalysisHistory': {
      return coll
        .filter(doc => doc.userId === userId)
        .sort((a, b) => {
          const dateA = new Date(a.createdAt as string).getTime();
          const dateB = new Date(b.createdAt as string).getTime();
          return dateB - dateA;
        });
    }

    case 'deleteAnalysis': {
      const index = coll.findIndex(doc => doc._id === filter?._id && doc.userId === userId);
      if (index >= 0) {
        coll.splice(index, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

function matchesFilter(doc: Record<string, unknown>, filter?: Record<string, unknown>): boolean {
  if (!filter) return true;
  return Object.entries(filter).every(([key, value]) => doc[key] === value);
}
