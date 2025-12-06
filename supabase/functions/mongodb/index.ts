import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONGODB_URI = Deno.env.get('MONGODB_URI');

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
    
    const client = new MongoClient();
    await client.connect(MONGODB_URI);
    
    const db = client.database("envirosense");
    const coll = db.collection(collection);

    let result;

    switch (action) {
      case 'insertOne':
        result = await coll.insertOne({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        break;

      case 'findOne':
        result = await coll.findOne(filter);
        break;

      case 'find':
        result = await coll.find(filter).toArray();
        break;

      case 'updateOne':
        result = await coll.updateOne(
          filter,
          { $set: { ...data, updatedAt: new Date() } }
        );
        break;

      case 'deleteOne':
        result = await coll.deleteOne(filter);
        break;

      // User profile operations
      case 'upsertProfile':
        result = await coll.updateOne(
          { userId: userId },
          { 
            $set: { 
              ...data, 
              userId,
              updatedAt: new Date() 
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
        break;

      case 'getProfile':
        result = await coll.findOne({ userId });
        break;

      // Analysis history operations
      case 'saveAnalysis':
        result = await coll.insertOne({
          userId,
          ...data,
          createdAt: new Date(),
        });
        break;

      case 'getAnalysisHistory':
        result = await coll.find({ userId }).sort({ createdAt: -1 }).toArray();
        break;

      case 'deleteAnalysis':
        result = await coll.deleteOne({ 
          _id: new ObjectId(filter._id),
          userId 
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await client.close();

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('MongoDB operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
