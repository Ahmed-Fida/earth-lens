// Mock environmental data generators for EnviroGeo

export type ParameterType = 
  | 'NDVI' 
  | 'EVI' 
  | 'Aerosol Index' 
  | 'NO2' 
  | 'SO2' 
  | 'CO' 
  | 'Soil Moisture' 
  | 'Rainfall' 
  | 'LST' 
  | 'ET' 
  | 'AQI';

export interface ParameterConfig {
  name: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  palette: string[];
  icon: string;
}

export const PARAMETERS: Record<ParameterType, ParameterConfig> = {
  NDVI: {
    name: 'Normalized Difference Vegetation Index',
    unit: 'Index (-1 to 1)',
    description: 'Measures vegetation health and density using satellite imagery',
    min: -0.2,
    max: 0.9,
    palette: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'],
    icon: 'Leaf',
  },
  EVI: {
    name: 'Enhanced Vegetation Index',
    unit: 'Index (0 to 1)',
    description: 'Improved vegetation index optimized for high biomass regions',
    min: 0,
    max: 1,
    palette: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8'],
    icon: 'Trees',
  },
  'Aerosol Index': {
    name: 'Aerosol Index',
    unit: 'AI',
    description: 'Indicates presence of absorbing aerosols like dust and smoke',
    min: -1,
    max: 5,
    palette: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#f46d43', '#d73027'],
    icon: 'Wind',
  },
  NO2: {
    name: 'Nitrogen Dioxide',
    unit: 'mol/m²',
    description: 'Air pollutant from combustion, indicates traffic and industrial activity',
    min: 0,
    max: 0.0003,
    palette: ['#4575b4', '#91bfdb', '#e0f3f8', '#fee090', '#fc8d59', '#d73027'],
    icon: 'Factory',
  },
  SO2: {
    name: 'Sulfur Dioxide',
    unit: 'mol/m²',
    description: 'Gas produced by volcanic activity and industrial processes',
    min: 0,
    max: 0.001,
    palette: ['#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#d9f0d3', '#a6dba0', '#5aae61'],
    icon: 'Flame',
  },
  CO: {
    name: 'Carbon Monoxide',
    unit: 'mol/m²',
    description: 'Colorless gas from incomplete combustion',
    min: 0,
    max: 0.05,
    palette: ['#2166ac', '#67a9cf', '#d1e5f0', '#fddbc7', '#ef8a62', '#b2182b'],
    icon: 'CloudFog',
  },
  'Soil Moisture': {
    name: 'Soil Moisture',
    unit: 'mm',
    description: 'Water content in the top layer of soil',
    min: 0,
    max: 100,
    palette: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e'],
    icon: 'Droplets',
  },
  Rainfall: {
    name: 'Precipitation',
    unit: 'mm/day',
    description: 'Daily rainfall amount',
    min: 0,
    max: 100,
    palette: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'],
    icon: 'CloudRain',
  },
  LST: {
    name: 'Land Surface Temperature',
    unit: '°C',
    description: 'Temperature of the Earth\'s surface',
    min: -10,
    max: 50,
    palette: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027'],
    icon: 'Thermometer',
  },
  ET: {
    name: 'Evapotranspiration',
    unit: 'kg/m²/8day',
    description: 'Combined evaporation and plant transpiration',
    min: 0,
    max: 100,
    palette: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
    icon: 'Waves',
  },
  AQI: {
    name: 'Air Quality Index',
    unit: 'AQI',
    description: 'Composite measure of air quality',
    min: 0,
    max: 500,
    palette: ['#00e400', '#ffff00', '#ff7e00', '#ff0000', '#8f3f97', '#7e0023'],
    icon: 'Wind',
  },
};

export interface TimeSeriesPoint {
  date: string;
  value: number;
  min?: number;
  max?: number;
}

export interface AnalysisResult {
  parameter: ParameterType;
  timeSeries: TimeSeriesPoint[];
  stats: {
    mean: number;
    min: number;
    max: number;
    stdDev: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    trendPercent: number;
  };
  mapTileUrl?: string;
  insights: string[];
}

// Generate realistic mock time series data
export function generateTimeSeries(
  parameter: ParameterType,
  startDate: Date,
  endDate: Date
): TimeSeriesPoint[] {
  const config = PARAMETERS[parameter];
  const points: TimeSeriesPoint[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / dayMs);
  
  // Base value in middle of range with some randomness
  const range = config.max - config.min;
  let baseValue = config.min + range * (0.4 + Math.random() * 0.3);
  
  // Add seasonal variation for relevant parameters
  const seasonalParams = ['NDVI', 'EVI', 'LST', 'ET', 'Rainfall'];
  const hasSeasonal = seasonalParams.includes(parameter);
  
  // Trend direction
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const trendStrength = (Math.random() * 0.0005) * trendDirection;
  
  for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 90))) {
    const date = new Date(startDate.getTime() + i * dayMs);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / dayMs);
    
    // Seasonal component
    let seasonal = 0;
    if (hasSeasonal) {
      seasonal = Math.sin((dayOfYear / 365) * 2 * Math.PI) * (range * 0.15);
    }
    
    // Random walk component
    baseValue += (Math.random() - 0.5) * range * 0.03;
    
    // Trend component
    const trend = i * trendStrength * range;
    
    // Calculate final value
    let value = baseValue + seasonal + trend + (Math.random() - 0.5) * range * 0.1;
    value = Math.max(config.min, Math.min(config.max, value));
    
    // Add min/max uncertainty
    const uncertainty = range * 0.05;
    
    points.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(4)),
      min: Number((value - uncertainty).toFixed(4)),
      max: Number((value + uncertainty).toFixed(4)),
    });
  }
  
  return points;
}

// Calculate statistics from time series
export function calculateStats(timeSeries: TimeSeriesPoint[]): AnalysisResult['stats'] {
  const values = timeSeries.map(p => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate trend
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = mean;
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  const slope = numerator / denominator;
  const trendPercent = ((slope * n) / mean) * 100;
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(trendPercent) < 2) {
    trend = 'stable';
  } else if (trendPercent > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  
  return {
    mean: Number(mean.toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    trend,
    trendPercent: Number(trendPercent.toFixed(1)),
  };
}

// Generate AI insights based on data
export function generateInsights(
  parameter: ParameterType,
  stats: AnalysisResult['stats']
): string[] {
  const config = PARAMETERS[parameter];
  const insights: string[] = [];
  
  // Trend insight
  if (stats.trend === 'increasing') {
    insights.push(`${config.name} shows an upward trend of ${Math.abs(stats.trendPercent)}% over the analysis period.`);
  } else if (stats.trend === 'decreasing') {
    insights.push(`${config.name} shows a downward trend of ${Math.abs(stats.trendPercent)}% over the analysis period.`);
  } else {
    insights.push(`${config.name} remains relatively stable throughout the analysis period.`);
  }
  
  // Value range insight
  const range = stats.max - stats.min;
  const normalizedRange = range / (config.max - config.min);
  if (normalizedRange > 0.5) {
    insights.push(`High variability detected with values ranging from ${stats.min} to ${stats.max} ${config.unit}.`);
  } else if (normalizedRange < 0.2) {
    insights.push(`Low variability indicates consistent conditions across the analysis period.`);
  }
  
  // Parameter-specific insights
  switch (parameter) {
    case 'NDVI':
      if (stats.mean > 0.5) {
        insights.push('Healthy vegetation cover detected in the selected area.');
      } else if (stats.mean < 0.2) {
        insights.push('Sparse vegetation or bare soil detected. Consider monitoring for land degradation.');
      }
      break;
    case 'LST':
      if (stats.max > 40) {
        insights.push('Extreme surface temperatures detected. Urban heat island effect may be present.');
      }
      break;
    case 'AQI':
      if (stats.mean > 100) {
        insights.push('Air quality is unhealthy for sensitive groups. Monitor pollution sources.');
      }
      break;
    case 'Soil Moisture':
      if (stats.mean < 20) {
        insights.push('Low soil moisture levels detected. Drought conditions may be developing.');
      }
      break;
    case 'NO2':
    case 'SO2':
    case 'CO':
      insights.push('Consider correlating with industrial activity and traffic patterns.');
      break;
  }
  
  return insights;
}

// Main analysis function
export function analyzeArea(
  parameter: ParameterType,
  startDate: Date,
  endDate: Date,
  _geometry?: GeoJSON.Geometry
): AnalysisResult {
  const timeSeries = generateTimeSeries(parameter, startDate, endDate);
  const stats = calculateStats(timeSeries);
  const insights = generateInsights(parameter, stats);
  
  return {
    parameter,
    timeSeries,
    stats,
    insights,
  };
}

// Sample locations for demo
export const SAMPLE_LOCATIONS = [
  { name: 'Amazon Rainforest', coordinates: [-60.0, -3.0], zoom: 6 },
  { name: 'Sahara Desert', coordinates: [10.0, 23.0], zoom: 5 },
  { name: 'European Alps', coordinates: [10.0, 46.5], zoom: 7 },
  { name: 'Tokyo Metro', coordinates: [139.7, 35.7], zoom: 10 },
  { name: 'Great Barrier Reef', coordinates: [147.0, -18.0], zoom: 6 },
  { name: 'California Coast', coordinates: [-122.0, 37.0], zoom: 8 },
];
