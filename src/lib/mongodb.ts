import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mongodb`;

interface MongoDBResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
}

async function callMongoDB<T = unknown>(
  action: string,
  options: {
    collection: string;
    data?: Record<string, unknown>;
    filter?: Record<string, unknown>;
    userId?: string;
  }
): Promise<MongoDBResponse<T>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      action,
      ...options,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'MongoDB operation failed');
  }

  return response.json();
}

// Profile operations
export async function upsertProfile(userId: string, profileData: {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}) {
  return callMongoDB('upsertProfile', {
    collection: 'profiles',
    userId,
    data: profileData,
  });
}

export async function getProfile(userId: string) {
  return callMongoDB('getProfile', {
    collection: 'profiles',
    userId,
  });
}

// Analysis history operations
export async function saveAnalysis(userId: string, analysisData: {
  parameter: string;
  geometry: unknown;
  geometryType: string;
  startDate: string;
  endDate: string;
  results: unknown;
}) {
  return callMongoDB('saveAnalysis', {
    collection: 'analysis_history',
    userId,
    data: analysisData,
  });
}

export async function getAnalysisHistory(userId: string) {
  return callMongoDB<Array<{
    _id: string;
    parameter: string;
    geometryType: string;
    startDate: string;
    endDate: string;
    results: unknown;
    createdAt: string;
  }>>('getAnalysisHistory', {
    collection: 'analysis_history',
    userId,
  });
}

export async function deleteAnalysis(userId: string, analysisId: string) {
  return callMongoDB('deleteAnalysis', {
    collection: 'analysis_history',
    userId,
    filter: { _id: analysisId },
  });
}

// Generic operations
export async function insertDocument(collection: string, data: Record<string, unknown>) {
  return callMongoDB('insertOne', { collection, data });
}

export async function findDocument(collection: string, filter: Record<string, unknown>) {
  return callMongoDB('findOne', { collection, filter });
}

export async function findDocuments(collection: string, filter: Record<string, unknown>) {
  return callMongoDB('find', { collection, filter });
}

export async function updateDocument(
  collection: string,
  filter: Record<string, unknown>,
  data: Record<string, unknown>
) {
  return callMongoDB('updateOne', { collection, filter, data });
}

export async function deleteDocument(collection: string, filter: Record<string, unknown>) {
  return callMongoDB('deleteOne', { collection, filter });
}
