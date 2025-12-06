import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface YearlyData {
  year: string;
  value: number;
}

export function PakistanNDVIWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [stats, setStats] = useState<{ mean: number; min: number; max: number } | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    fetchPakistanNDVI();
  }, []);

  const fetchPakistanNDVI = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-ndvi-pakistan-range', {
        body: {},
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch Pakistan NDVI data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform yearly averages for chart
      const chartData = Object.entries(data.yearlyAverages).map(([year, value]) => ({
        year,
        value: value as number,
      }));

      setYearlyData(chartData);
      setStats(data.stats);
      setInsights(data.insights || []);
    } catch (err) {
      console.error('Error fetching Pakistan NDVI:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (yearlyData.length < 2) return <Minus className="w-4 h-4 text-muted-foreground" />;
    const firstValue = yearlyData[0].value;
    const lastValue = yearlyData[yearlyData.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (change > 2) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading Pakistan NDVI...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="py-4">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>🇵🇰 Pakistan National NDVI (2019-2024)</span>
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mini Chart */}
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                width={30}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [value.toFixed(4), 'NDVI']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Mean</p>
              <p className="text-sm font-semibold text-primary">{stats.mean.toFixed(3)}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Min</p>
              <p className="text-sm font-semibold">{stats.min.toFixed(3)}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Max</p>
              <p className="text-sm font-semibold">{stats.max.toFixed(3)}</p>
            </div>
          </div>
        )}

        {/* Key Insight */}
        {insights.length > 0 && (
          <p className="text-xs text-muted-foreground italic">
            {insights[0]}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
