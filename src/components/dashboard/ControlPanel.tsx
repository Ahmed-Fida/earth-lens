import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Loader2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  PARAMETERS,
  ParameterType,
  generateTimeSeries,
  calculateStats,
  generateInsights,
} from '@/lib/mockData';
import { DrawnShape } from './LeafletMap';
import { AnalysisResults } from './AnalysisResults';
import { PakistanNDVIWidget } from './PakistanNDVIWidget';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { supabase } from '@/integrations/supabase/client';

const parameterList = Object.entries(PARAMETERS).map(([id, config]) => ({
  id: id as ParameterType,
  name: config.name,
  unit: config.unit,
  color: config.palette[Math.floor(config.palette.length / 2)],
}));

// Pakistan bounding box
const PAKISTAN_BOUNDS = {
  minLat: 23.5,
  maxLat: 37.1,
  minLon: 60.9,
  maxLon: 77.5,
};

function isInsidePakistan(lat: number, lon: number): boolean {
  return (
    lat >= PAKISTAN_BOUNDS.minLat &&
    lat <= PAKISTAN_BOUNDS.maxLat &&
    lon >= PAKISTAN_BOUNDS.minLon &&
    lon <= PAKISTAN_BOUNDS.maxLon
  );
}

interface ControlPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  drawnShape: DrawnShape | null;
}

export function ControlPanel({ isOpen, onToggle, drawnShape }: ControlPanelProps) {
  const { toast } = useToast();
  const { addAnalysis } = useAnalysisHistory();
  const [selectedParameter, setSelectedParameter] = useState<ParameterType>('NDVI');
  const [startDate, setStartDate] = useState<Date>(new Date('2019-01-01'));
  const [endDate, setEndDate] = useState<Date>(new Date('2024-12-31'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Coordinate input mode
  const [inputMode, setInputMode] = useState<'draw' | 'coordinates' | 'bbox'>('coordinates');
  const [coordLat, setCoordLat] = useState('30.3753'); // Default to Lahore
  const [coordLng, setCoordLng] = useState('69.3451');
  const [bboxNorth, setBboxNorth] = useState('');
  const [bboxSouth, setBboxSouth] = useState('');
  const [bboxEast, setBboxEast] = useState('');
  const [bboxWest, setBboxWest] = useState('');

  // Validate coordinates when they change
  useEffect(() => {
    if (inputMode === 'coordinates' && coordLat && coordLng) {
      const lat = parseFloat(coordLat);
      const lon = parseFloat(coordLng);
      if (!isNaN(lat) && !isNaN(lon)) {
        if (!isInsidePakistan(lat, lon)) {
          setValidationError('Location is outside Pakistan. Please enter coordinates within Pakistan (Lat: 23.5-37.1, Lon: 60.9-77.5)');
        } else {
          setValidationError(null);
        }
      }
    } else if (inputMode === 'bbox' && bboxNorth && bboxSouth && bboxEast && bboxWest) {
      const north = parseFloat(bboxNorth);
      const south = parseFloat(bboxSouth);
      const east = parseFloat(bboxEast);
      const west = parseFloat(bboxWest);
      if (!isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
        const centerLat = (north + south) / 2;
        const centerLon = (east + west) / 2;
        if (!isInsidePakistan(centerLat, centerLon)) {
          setValidationError('Bounding box center is outside Pakistan.');
        } else {
          setValidationError(null);
        }
      }
    } else {
      setValidationError(null);
    }
  }, [inputMode, coordLat, coordLng, bboxNorth, bboxSouth, bboxEast, bboxWest]);

  const handleAnalyze = async () => {
    let hasValidArea = false;
    let geometry: unknown = null;
    let geometryType = '';
    let lat: number | null = null;
    let lon: number | null = null;
    
    if (inputMode === 'draw' && drawnShape) {
      hasValidArea = true;
      geometry = drawnShape.geoJSON?.geometry;
      geometryType = drawnShape.type;
      // Get center point from drawn shape
      if (drawnShape.geoJSON?.geometry) {
        const coords = drawnShape.geoJSON.geometry as any;
        if (coords.type === 'Point') {
          lon = coords.coordinates[0];
          lat = coords.coordinates[1];
        } else if (coords.type === 'Polygon' && coords.coordinates?.[0]) {
          const points = coords.coordinates[0];
          lat = points.reduce((sum: number, p: number[]) => sum + p[1], 0) / points.length;
          lon = points.reduce((sum: number, p: number[]) => sum + p[0], 0) / points.length;
        }
      }
    } else if (inputMode === 'coordinates' && coordLat && coordLng) {
      lat = parseFloat(coordLat);
      lon = parseFloat(coordLng);
      if (!isNaN(lat) && !isNaN(lon)) {
        hasValidArea = true;
        geometry = { type: 'Point', coordinates: [lon, lat] };
        geometryType = 'point';
        (window as any).leafletMapMethods?.addMarker(lat, lon);
      }
    } else if (inputMode === 'bbox' && bboxNorth && bboxSouth && bboxEast && bboxWest) {
      const north = parseFloat(bboxNorth);
      const south = parseFloat(bboxSouth);
      const east = parseFloat(bboxEast);
      const west = parseFloat(bboxWest);
      
      if (!isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
        hasValidArea = true;
        lat = (north + south) / 2;
        lon = (east + west) / 2;
        geometry = {
          type: 'Polygon',
          coordinates: [[
            [west, north],
            [east, north],
            [east, south],
            [west, south],
            [west, north],
          ]],
        };
        geometryType = 'rectangle';
        const coords = [
          { lat: north, lng: west },
          { lat: north, lng: east },
          { lat: south, lng: east },
          { lat: south, lng: west },
        ];
        (window as any).leafletMapMethods?.addShapeFromCoords(coords, 'rectangle');
      }
    }

    if (!hasValidArea || lat === null || lon === null) {
      toast({
        title: 'No area selected',
        description: 'Please draw a shape on the map or enter coordinates.',
        variant: 'destructive',
      });
      return;
    }

    // Validate Pakistan bounds
    if (!isInsidePakistan(lat, lon)) {
      toast({
        title: 'Location outside Pakistan',
        description: 'This service only provides NDVI data for locations within Pakistan.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Use real NDVI endpoint for NDVI parameter
      if (selectedParameter === 'NDVI') {
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();

        const { data, error } = await supabase.functions.invoke('get-ndvi', {
          body: { lat, lon, startYear, endYear },
        });

        if (error) {
          throw new Error(error.message || 'Failed to fetch NDVI data');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        const paramConfig = PARAMETERS[selectedParameter];
        const result = {
          parameter: {
            id: selectedParameter,
            name: paramConfig.name,
            fullName: paramConfig.name,
            unit: paramConfig.unit,
            color: paramConfig.palette[Math.floor(paramConfig.palette.length / 2)],
          },
          timeSeries: data.timeSeries,
          stats: {
            mean: data.stats.mean,
            min: data.stats.min,
            max: data.stats.max,
            stdDev: data.stats.stdDev,
            trend: data.stats.trendPercent,
          },
          insights: data.insights,
          startDate: format(startDate, 'MMM d, yyyy'),
          endDate: format(endDate, 'MMM d, yyyy'),
          geometry,
          geometryType,
          source: data.source,
        };

        setAnalysisResult(result);
        toast({
          title: 'Analysis complete',
          description: `Real NDVI data retrieved from ${data.source}.`,
        });
      } else {
        // Use mock data for other parameters
        await new Promise(resolve => setTimeout(resolve, 1500));

        const timeSeries = generateTimeSeries(selectedParameter, startDate, endDate);
        const stats = calculateStats(timeSeries);
        const insights = generateInsights(selectedParameter, stats);
        const paramConfig = PARAMETERS[selectedParameter];

        const result = {
          parameter: {
            id: selectedParameter,
            name: paramConfig.name,
            fullName: paramConfig.name,
            unit: paramConfig.unit,
            color: paramConfig.palette[Math.floor(paramConfig.palette.length / 2)],
          },
          timeSeries,
          stats: {
            mean: stats.mean,
            min: stats.min,
            max: stats.max,
            stdDev: stats.stdDev,
            trend: stats.trendPercent,
          },
          insights,
          startDate: format(startDate, 'MMM d, yyyy'),
          endDate: format(endDate, 'MMM d, yyyy'),
          geometry,
          geometryType,
        };

        setAnalysisResult(result);
        toast({
          title: 'Analysis complete',
          description: `${paramConfig.name} data retrieved successfully.`,
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to fetch data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;
    
    setIsSaving(true);
    await addAnalysis({
      parameter: analysisResult.parameter.id,
      geometry: analysisResult.geometry,
      geometryType: analysisResult.geometryType,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      results: {
        timeSeries: analysisResult.timeSeries,
        stats: analysisResult.stats,
        insights: analysisResult.insights,
      },
    });
    setIsSaving(false);
  };

  const handleExport = (formatId: string) => {
    if (!analysisResult) return;

    const { parameter, timeSeries, stats } = analysisResult;
    let content = '';
    let filename = `${parameter.id}_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}`;

    if (formatId === 'csv') {
      content = 'Date,Value\n' + timeSeries.map((d: any) => `${d.date},${d.value}`).join('\n');
      filename += '.csv';
      downloadFile(content, filename, 'text/csv');
    } else if (formatId === 'geojson') {
      const geoJSON = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: { parameter: parameter.id, stats, timeSeries },
          geometry: drawnShape?.geoJSON?.geometry || { type: 'Point', coordinates: [0, 0] },
        }],
      };
      content = JSON.stringify(geoJSON, null, 2);
      filename += '.geojson';
      downloadFile(content, filename, 'application/geo+json');
    } else if (formatId === 'shapefile') {
      toast({
        title: 'Shapefile Export',
        description: 'Shapefile export requires server-side processing. Coming soon!',
      });
      return;
    }

    toast({ title: 'Export successful', description: `Data exported as ${formatId.toUpperCase()}.` });
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={onToggle}
        className={cn(
          'fixed top-1/2 -translate-y-1/2 z-30 bg-card border border-border rounded-l-lg p-2 shadow-lg transition-all',
          isOpen ? 'right-[400px]' : 'right-0'
        )}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-[400px] bg-card border-l border-border shadow-2xl z-20 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Pakistan NDVI Analysis</h2>
              <p className="text-sm text-muted-foreground">MODIS satellite data (2019-2024)</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Pakistan-wide NDVI Widget */}
              <PakistanNDVIWidget />

              {/* Parameter Selection */}
              <div className="space-y-2">
                <Label>Environmental Parameter</Label>
                <Select value={selectedParameter} onValueChange={(v) => setSelectedParameter(v as ParameterType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {parameterList.map(param => (
                      <SelectItem key={param.id} value={param.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: param.color }} />
                          <span>{param.id}</span>
                          <span className="text-muted-foreground text-xs">({param.unit})</span>
                          {param.id === 'NDVI' && (
                            <span className="text-xs text-primary font-medium">Real Data</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedParameter !== 'NDVI' && (
                  <p className="text-xs text-muted-foreground">
                    Note: Only NDVI uses real satellite data. Other parameters use simulated data.
                  </p>
                )}
              </div>

              {/* Area Input Mode */}
              <div className="space-y-3">
                <Label>Area Selection Method</Label>
                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="draw">Draw</TabsTrigger>
                    <TabsTrigger value="coordinates">Point</TabsTrigger>
                    <TabsTrigger value="bbox">Bbox</TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="mt-3">
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{drawnShape ? `${drawnShape.type} selected` : 'Draw on map'}</p>
                        <p className="text-xs text-muted-foreground">Use the drawing tools on the map</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="coordinates" className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Latitude (23.5 - 37.1)</Label>
                        <Input 
                          type="number" 
                          step="any" 
                          placeholder="e.g., 30.3753" 
                          value={coordLat} 
                          onChange={(e) => setCoordLat(e.target.value)}
                          min={23.5}
                          max={37.1}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Longitude (60.9 - 77.5)</Label>
                        <Input 
                          type="number" 
                          step="any" 
                          placeholder="e.g., 69.3451" 
                          value={coordLng} 
                          onChange={(e) => setCoordLng(e.target.value)}
                          min={60.9}
                          max={77.5}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter coordinates within Pakistan only
                    </p>
                  </TabsContent>

                  <TabsContent value="bbox" className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">North (Max Lat)</Label><Input type="number" step="any" placeholder="e.g., 35" value={bboxNorth} onChange={(e) => setBboxNorth(e.target.value)} /></div>
                      <div><Label className="text-xs">South (Min Lat)</Label><Input type="number" step="any" placeholder="e.g., 25" value={bboxSouth} onChange={(e) => setBboxSouth(e.target.value)} /></div>
                      <div><Label className="text-xs">East (Max Lon)</Label><Input type="number" step="any" placeholder="e.g., 75" value={bboxEast} onChange={(e) => setBboxEast(e.target.value)} /></div>
                      <div><Label className="text-xs">West (Min Lon)</Label><Input type="number" step="any" placeholder="e.g., 65" value={bboxWest} onChange={(e) => setBboxWest(e.target.value)} /></div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Validation Error */}
                {validationError && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded-lg text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label>Date Range (2019-2024)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(startDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <CalendarComponent 
                        mode="single" 
                        selected={startDate} 
                        onSelect={(d) => d && setStartDate(d)} 
                        initialFocus 
                        className="pointer-events-auto"
                        fromDate={new Date('2019-01-01')}
                        toDate={new Date('2024-12-31')}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(endDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <CalendarComponent 
                        mode="single" 
                        selected={endDate} 
                        onSelect={(d) => d && setEndDate(d)} 
                        initialFocus 
                        className="pointer-events-auto"
                        fromDate={new Date('2019-01-01')}
                        toDate={new Date('2024-12-31')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Analyze Button */}
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !!validationError} 
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing...</> : 'Analyze Area'}
              </Button>

              {/* Results */}
              {analysisResult && (
                <>
                  <AnalysisResults result={analysisResult} onExport={handleExport} />
                  <Button 
                    onClick={handleSaveAnalysis} 
                    disabled={isSaving}
                    variant="outline" 
                    className="w-full"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Save to History</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
