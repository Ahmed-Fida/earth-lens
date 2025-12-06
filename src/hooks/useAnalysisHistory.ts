import { useState, useCallback } from 'react';
import { saveAnalysis, getAnalysisHistory, deleteAnalysis } from '@/lib/mongodb';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface AnalysisRecord {
  _id: string;
  parameter: string;
  geometryType: string;
  startDate: string;
  endDate: string;
  results: unknown;
  createdAt: string;
}

export function useAnalysisHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await getAnalysisHistory(user.id);
      if (result.success) {
        setHistory(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addAnalysis = useCallback(async (analysisData: {
    parameter: string;
    geometry: unknown;
    geometryType: string;
    startDate: string;
    endDate: string;
    results: unknown;
  }) => {
    if (!user) {
      toast.error('Please sign in to save analysis');
      return;
    }
    
    try {
      await saveAnalysis(user.id, analysisData);
      toast.success('Analysis saved to history');
      await fetchHistory();
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('Failed to save analysis');
    }
  }, [user, fetchHistory]);

  const removeAnalysis = useCallback(async (analysisId: string) => {
    if (!user) return;
    
    try {
      await deleteAnalysis(user.id, analysisId);
      toast.success('Analysis deleted');
      await fetchHistory();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  }, [user, fetchHistory]);

  return {
    history,
    loading,
    fetchHistory,
    addAnalysis,
    removeAnalysis,
  };
}
