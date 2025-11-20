import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Waves, RefreshCw, MapPin, Map, Wind, Flame } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  coordinates: [number, number, number];
  depth: number;
  tsunami: number;
}

interface Hurricane {
  id: string;
  name: string;
  category: string;
  windSpeed: number;
  pressure: number;
  coordinates: [number, number, number];
  time: number;
  movement: string;
}

interface Volcano {
  id: string;
  name: string;
  alertLevel: string;
  location: string;
  coordinates: [number, number, number];
  time: number;
  elevation: number;
  status: string;
}

interface Wildfire {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number, number];
  time: number;
  brightness: number;
  frp: number; // Fire Radiative Power in MW
  confidence: string;
  acresBurned?: number;
}

interface Disaster {
  type: 'earthquake' | 'hurricane' | 'volcano' | 'wildfire';
  data: Earthquake | Hurricane | Volcano | Wildfire;
  severity: number;
}

interface DisasterAlertsProps {
  onDisasterSelect?: (coordinates: [number, number], disaster: any) => void;
  onShowAllDisasters?: (disasters: Disaster[]) => void;
  onDistanceRadiusChange?: (radius: number) => void;
  selectedLocation?: string;
  locationCoordinates?: [number, number];
}

const DisasterAlerts = ({ onDisasterSelect, onShowAllDisasters, onDistanceRadiusChange, selectedLocation, locationCoordinates }: DisasterAlertsProps) => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [distanceRadius, setDistanceRadius] = useState(3000);
  const [filters, setFilters] = useState({
    earthquake: true,
    hurricane: true,
    volcano: true,
    wildfire: true,
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchEarthquakeData = async (): Promise<Earthquake[]> => {
    try {
      const response = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      );
      const data = await response.json();

      const earthquakeData: Earthquake[] = data.features.map((feature: any) => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        place: feature.properties.place,
        time: feature.properties.time,
        coordinates: feature.geometry.coordinates,
        depth: feature.geometry.coordinates[2],
        tsunami: feature.properties.tsunami,
      }));

      return earthquakeData;
    } catch (error) {
      console.error("Error fetching earthquake data:", error);
      return [];
    }
  };

  const fetchHurricaneData = async (): Promise<Hurricane[]> => {
    try {
      // Note: NOAA NHC API has CORS restrictions for browser access
      // Using mock data for demonstration. In production, this would need a backend proxy
      // or alternative API source
      
      // Mock hurricane data for demonstration (appears only when showing specific regions)
      const mockHurricanes: Hurricane[] = [
        {
          id: "AL012025",
          name: "Elena",
          category: "CAT3",
          windSpeed: 115,
          pressure: 965,
          coordinates: [-75.5, 28.3, 0],
          time: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          movement: "NW at 12 mph",
        },
        {
          id: "EP022025",
          name: "Frank",
          category: "CAT1",
          windSpeed: 75,
          pressure: 985,
          coordinates: [-115.2, 18.7, 0],
          time: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
          movement: "W at 8 mph",
        },
        {
          id: "AL032025",
          name: "Georgia",
          category: "TS",
          windSpeed: 50,
          pressure: 998,
          coordinates: [-45.8, 15.2, 0],
          time: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
          movement: "NW at 15 mph",
        },
      ];

      // Return mock data for demonstration
      // In production, replace this with actual API call through a backend proxy
      return mockHurricanes;
    } catch (error) {
      console.error("Error fetching hurricane data:", error);
      return [];
    }
  };

  const fetchVolcanoData = async (): Promise<Volcano[]> => {
    try {
      // Note: USGS Volcano API may have CORS restrictions for browser access
      // Using mock data for demonstration. In production, use backend proxy
      
      // Mock active volcano data for demonstration
      const mockVolcanoes: Volcano[] = [
        {
          id: "KILAUEA-2025",
          name: "Kilauea",
          alertLevel: "WARNING",
          location: "Hawaii, USA",
          coordinates: [-155.2869, 19.4069, 1222],
          time: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
          elevation: 1222,
          status: "Erupting",
        },
        {
          id: "POPOCATEPETL-2025",
          name: "Popocatépetl",
          alertLevel: "WATCH",
          location: "Mexico",
          coordinates: [-98.6225, 19.0232, 5426],
          time: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          elevation: 5426,
          status: "Elevated Activity",
        },
        {
          id: "ETNA-2025",
          name: "Mount Etna",
          alertLevel: "ADVISORY",
          location: "Sicily, Italy",
          coordinates: [14.9934, 37.7510, 3357],
          time: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
          elevation: 3357,
          status: "Strombolian Activity",
        },
        {
          id: "SAKURAJIMA-2025",
          name: "Sakurajima",
          alertLevel: "WARNING",
          location: "Kyushu, Japan",
          coordinates: [130.6570, 31.5850, 1117],
          time: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          elevation: 1117,
          status: "Frequent Explosions",
        },
      ];

      // Return mock data for demonstration
      return mockVolcanoes;
    } catch (error) {
      console.error("Error fetching volcano data:", error);
      return [];
    }
  };

  const fetchWildfireData = async (): Promise<Wildfire[]> => {
    try {
      // Note: NASA FIRMS API requires MAP_KEY and has CORS restrictions
      // Using mock data for demonstration. In production, use backend proxy
      // API: https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/{bbox}/{days}
      
      // Mock wildfire hotspot data for demonstration
      const mockWildfires: Wildfire[] = [
        {
          id: "FIRE-CA-001",
          name: "Mountain Fire",
          location: "California, USA",
          coordinates: [-120.5542, 38.8375, 0],
          time: Date.now() - 30 * 60 * 1000, // 30 minutes ago
          brightness: 358.2,
          frp: 45.8, // High intensity
          confidence: "high",
          acresBurned: 15000,
        },
        {
          id: "FIRE-AU-002",
          name: "Bushfire Alert",
          location: "New South Wales, Australia",
          coordinates: [149.1300, -35.2809, 0],
          time: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          brightness: 342.5,
          frp: 38.2,
          confidence: "high",
          acresBurned: 8500,
        },
        {
          id: "FIRE-BR-003",
          name: "Amazon Hotspot",
          location: "Amazon Rainforest, Brazil",
          coordinates: [-62.8361, -8.7832, 0],
          time: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
          brightness: 335.1,
          frp: 28.5,
          confidence: "nominal",
          acresBurned: 5200,
        },
        {
          id: "FIRE-GR-004",
          name: "Forest Fire",
          location: "Attica, Greece",
          coordinates: [23.7275, 38.0756, 0],
          time: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
          brightness: 328.9,
          frp: 22.1,
          confidence: "nominal",
          acresBurned: 3800,
        },
        {
          id: "FIRE-CA-005",
          name: "Boreal Fire",
          location: "British Columbia, Canada",
          coordinates: [-122.9574, 53.7267, 0],
          time: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
          brightness: 318.7,
          frp: 18.9,
          confidence: "nominal",
          acresBurned: 2500,
        },
        {
          id: "FIRE-PT-006",
          name: "Wildfire",
          location: "Algarve, Portugal",
          coordinates: [-8.2245, 37.0194, 0],
          time: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          brightness: 312.3,
          frp: 15.2,
          confidence: "low",
          acresBurned: 1200,
        },
      ];

      // Return mock data for demonstration
      return mockWildfires;
    } catch (error) {
      console.error("Error fetching wildfire data:", error);
      return [];
    }
  };

  const calculateSeverity = (disaster: Disaster): number => {
    if (disaster.type === 'earthquake') {
      const eq = disaster.data as Earthquake;
      if (eq.magnitude >= 7) return 10;
      if (eq.magnitude >= 6) return 8;
      if (eq.magnitude >= 5) return 6;
      if (eq.magnitude >= 4) return 4;
      return 2;
    } else if (disaster.type === 'hurricane') {
      const hurricane = disaster.data as Hurricane;
      const category = hurricane.category;
      if (category === "CAT5") return 10;
      if (category === "CAT4") return 9;
      if (category === "CAT3") return 7;
      if (category === "CAT2") return 5;
      if (category === "CAT1") return 4;
      if (category === "TS") return 3;
      return 2;
    } else if (disaster.type === 'volcano') {
      const volcano = disaster.data as Volcano;
      const alertLevel = volcano.alertLevel;
      if (alertLevel === "WARNING" && volcano.status.includes("Erupt")) return 10;
      if (alertLevel === "WARNING") return 8;
      if (alertLevel === "WATCH") return 6;
      if (alertLevel === "ADVISORY") return 4;
      return 2;
    } else {
      const wildfire = disaster.data as Wildfire;
      // Severity based on FRP (Fire Radiative Power) and confidence
      const frp = wildfire.frp;
      const confidence = wildfire.confidence;
      
      if (frp >= 40 && confidence === "high") return 10;
      if (frp >= 30 && confidence === "high") return 8;
      if (frp >= 20) return 6;
      if (frp >= 10) return 4;
      return 2;
    }
  };

  const fetchAllDisasters = async () => {
    setLoading(true);
    try {
      const [earthquakes, hurricanes, volcanoes, wildfires] = await Promise.all([
        fetchEarthquakeData(),
        fetchHurricaneData(),
        fetchVolcanoData(),
        fetchWildfireData(),
      ]);

      let allDisasters: Disaster[] = [
        ...earthquakes.map(eq => ({
          type: 'earthquake' as const,
          data: eq,
          severity: 0,
        })),
        ...hurricanes.map(h => ({
          type: 'hurricane' as const,
          data: h,
          severity: 0,
        })),
        ...volcanoes.map(v => ({
          type: 'volcano' as const,
          data: v,
          severity: 0,
        })),
        ...wildfires.map(w => ({
          type: 'wildfire' as const,
          data: w,
          severity: 0,
        })),
      ];

      if (locationCoordinates) {
        const [targetLng, targetLat] = locationCoordinates;
        allDisasters = allDisasters.filter(disaster => {
          const coords = disaster.data.coordinates;
          const distance = calculateDistance(
            targetLat,
            targetLng,
            coords[1],
            coords[0]
          );
          return distance <= distanceRadius;
        });
      }

      allDisasters = allDisasters.map(disaster => ({
        ...disaster,
        severity: calculateSeverity(disaster),
      }));

      const sortedData = allDisasters.sort((a, b) => b.severity - a.severity);
      setDisasters(sortedData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching disaster data:", error);
      toast.error("Failed to fetch disaster data");
    }
    setLoading(false);
  };

  useEffect(() => {
    // Notify parent of initial distance radius when location is set
    if (locationCoordinates && onDistanceRadiusChange) {
      onDistanceRadiusChange(distanceRadius);
    }
  }, [locationCoordinates]);

  useEffect(() => {
    // Only fetch disasters if a location has been selected
    if (locationCoordinates) {
      fetchAllDisasters();
      
      // Refresh every 5 minutes
      const interval = setInterval(fetchAllDisasters, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      // Clear disasters when no location is selected
      setDisasters([]);
      setLastUpdate(null);
    }
  }, [locationCoordinates, selectedLocation, distanceRadius]);

  const getSeverityColor = (severity: number) => {
    if (severity >= 9) return "bg-destructive text-destructive-foreground";
    if (severity >= 7) return "bg-orange-500 text-white";
    if (severity >= 5) return "bg-yellow-500 text-black";
    return "bg-blue-500 text-white";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 9) return "Critical";
    if (severity >= 7) return "Severe";
    if (severity >= 5) return "Moderate";
    return "Minor";
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleString();
  };

  const toggleFilter = (type: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const filteredDisasters = disasters.filter(disaster => {
    return filters[disaster.type];
  });

  const generateSummary = () => {
    // Use disasters (distance-filtered only) instead of filteredDisasters (distance + type filters)
    if (disasters.length === 0) {
      return {
        headline: "✅ All Clear - Safe for Travel",
        details: "No significant natural disasters detected in this region. Normal travel precautions apply. Always check local weather forecasts and follow standard safety guidelines.",
      };
    }
    
    const critical = disasters.filter(d => d.severity >= 9);
    const severe = disasters.filter(d => d.severity >= 7 && d.severity < 9);
    const moderate = disasters.filter(d => d.severity >= 5 && d.severity < 7);
    
    const earthquakes = disasters.filter(d => d.type === 'earthquake');
    const hurricanes = disasters.filter(d => d.type === 'hurricane');
    const volcanoes = disasters.filter(d => d.type === 'volcano');
    const wildfires = disasters.filter(d => d.type === 'wildfire');
    
    let headline = "";
    let travelAdvice = "";
    let risks = [];
    let recommendations = [];
    
    if (critical.length > 0) {
      const types = [];
      if (critical.some(d => d.type === 'wildfire')) {
        const w = critical.find(d => d.type === 'wildfire')?.data as Wildfire;
        types.push(`Major Wildfire: ${w.name}`);
        risks.push("Air quality hazardous for outdoor activities");
        risks.push("Road closures and evacuations likely");
        recommendations.push("Avoid the region entirely if possible");
      }
      if (critical.some(d => d.type === 'volcano')) {
        const v = critical.find(d => d.type === 'volcano')?.data as Volcano;
        types.push(`Erupting Volcano: ${v.name}`);
        risks.push("Ashfall may disrupt flights and ground transportation");
        risks.push("Respiratory hazards from volcanic gases");
        recommendations.push("Stay at least 20km from volcanic sites");
      }
      if (critical.some(d => d.type === 'hurricane')) {
        const h = critical.find(d => d.type === 'hurricane')?.data as Hurricane;
        types.push(`${h.category} Hurricane ${h.name}`);
        risks.push("Life-threatening storm surge and flooding expected");
        risks.push("Airport closures and flight cancellations likely");
        risks.push("Power outages affecting hotels and services");
        recommendations.push("Delay travel until storm passes");
      }
      if (critical.some(d => d.type === 'earthquake')) {
        const eq = critical.find(d => d.type === 'earthquake')?.data as Earthquake;
        types.push(`M${eq.magnitude.toFixed(1)} Earthquake`);
        risks.push("Aftershocks expected - structural damage to buildings");
        risks.push("Transportation infrastructure may be compromised");
        if (eq.tsunami === 1) {
          risks.push("⚠️ TSUNAMI WARNING - Avoid coastal areas");
        }
        recommendations.push("Check hotel structural safety before booking");
      }
      headline = `🚨 TRAVEL NOT ADVISED: ${types.join(" + ")}`;
      travelAdvice = "CRITICAL ALERT - Postpone all non-essential travel to this region.";
    } else if (severe.length > 0) {
      headline = `⚠️ TRAVEL CAUTION: ${severe.length} Severe Event${severe.length > 1 ? "s" : ""} Active`;
      travelAdvice = "High risk conditions present. Only essential travel recommended.";
      
      if (severe.some(d => d.type === 'hurricane')) {
        risks.push("Severe weather may disrupt flights and accommodations");
        recommendations.push("Purchase travel insurance with weather coverage");
      }
      if (severe.some(d => d.type === 'wildfire')) {
        risks.push("Poor air quality affecting visibility and health");
        recommendations.push("Bring N95 masks and stay indoors during peak smoke");
      }
      if (severe.some(d => d.type === 'volcano')) {
        risks.push("Volcanic activity may affect regional air travel");
        recommendations.push("Have backup travel plans and flexible bookings");
      }
      if (severe.some(d => d.type === 'earthquake')) {
        risks.push("Recent seismic activity - aftershocks possible");
        recommendations.push("Identify emergency exits and safe zones at your hotel");
      }
    } else if (moderate.length > 0) {
      headline = `⚡ TRAVEL WITH AWARENESS: ${moderate.length} Moderate Event${moderate.length > 1 ? "s" : ""}`;
      travelAdvice = "Travel possible with precautions. Monitor local conditions closely.";
      recommendations.push("Keep emergency contacts and evacuation routes handy");
      recommendations.push("Stay informed through local news and alerts");
    } else {
      const parts = [];
      if (earthquakes.length > 0) parts.push(`${earthquakes.length} minor earthquake${earthquakes.length > 1 ? "s" : ""}`);
      if (hurricanes.length > 0) parts.push(`${hurricanes.length} tropical system${hurricanes.length > 1 ? "s" : ""}`);
      if (volcanoes.length > 0) parts.push(`${volcanoes.length} volcano${volcanoes.length > 1 ? "es" : ""} monitored`);
      if (wildfires.length > 0) parts.push(`${wildfires.length} wildfire${wildfires.length > 1 ? "s" : ""}`);
      
      headline = `📊 MINOR ACTIVITY: ${parts.join(" + ")}`;
      travelAdvice = "Low risk - normal travel conditions with standard precautions.";
      recommendations.push("Standard travel insurance recommended");
      recommendations.push("Check local forecasts before outdoor activities");
    }
    
    const details = [
      travelAdvice,
      risks.length > 0 ? "\n\nKey Risks:\n• " + risks.join("\n• ") : "",
      recommendations.length > 0 ? "\n\nTraveler Recommendations:\n• " + recommendations.join("\n• ") : "",
      "\n\n🏥 Always verify hotel emergency procedures and nearest medical facilities.",
    ].filter(Boolean).join("");
    
    return { headline, details };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Disaster Alerts
        </h2>
        <div className="flex gap-2">
          {disasters.length > 0 && locationCoordinates && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowAllDisasters?.(filteredDisasters)}
              className="text-xs"
            >
              <Map className="h-3 w-3 mr-1" />
              Show All
            </Button>
          )}
          {locationCoordinates && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAllDisasters}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      {locationCoordinates && (
        <Card className="p-4 bg-accent/50 border-border">
          <div className="space-y-2">
            <p className="text-sm font-bold text-foreground">
              {generateSummary().headline}
            </p>
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
              {generateSummary().details}
            </p>
          </div>
        </Card>
      )}

      {/* Show message when no location is selected */}
      {!locationCoordinates && (
        <Card className="p-6 bg-muted/50 border-border">
          <div className="text-center space-y-3">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Search for a Location</h3>
              <p className="text-sm text-muted-foreground">
                Use the search bar above to find disasters near a specific country or region
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Disaster Type Filters - Only show when location is selected */}
      {locationCoordinates && disasters.length > 0 && (
        <Card className="p-3 bg-card border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Filter by Type</label>
              {(!filters.earthquake || !filters.hurricane || !filters.volcano || !filters.wildfire) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ earthquake: true, hurricane: true, volcano: true, wildfire: true })}
                  className="text-xs h-6 px-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={filters.earthquake ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('earthquake')}
                className="text-xs justify-start"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Earthquakes ({disasters.filter(d => d.type === 'earthquake').length})
              </Button>
              <Button
                variant={filters.hurricane ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('hurricane')}
                className="text-xs justify-start"
              >
                <Wind className="h-3 w-3 mr-1" />
                Storms ({disasters.filter(d => d.type === 'hurricane').length})
              </Button>
              <Button
                variant={filters.volcano ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('volcano')}
                className="text-xs justify-start"
              >
                <Flame className="h-3 w-3 mr-1 text-red-500" />
                Volcanoes ({disasters.filter(d => d.type === 'volcano').length})
              </Button>
              <Button
                variant={filters.wildfire ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('wildfire')}
                className="text-xs justify-start"
              >
                <Flame className="h-3 w-3 mr-1 text-orange-600" />
                Wildfires ({disasters.filter(d => d.type === 'wildfire').length})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {locationCoordinates && (
        <>
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Distance Filter
              </label>
              <span className="text-xs font-semibold text-foreground">
                {distanceRadius} km
              </span>
            </div>
            <Slider
              value={[distanceRadius]}
              onValueChange={(value) => {
                setDistanceRadius(value[0]);
                onDistanceRadiusChange?.(value[0]);
              }}
              min={100}
              max={3000}
              step={100}
              className="w-full"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {selectedLocation 
              ? `Showing ${filteredDisasters.length} disaster${filteredDisasters.length !== 1 ? 's' : ''} within ${distanceRadius}km of ${selectedLocation}`
              : `Real-time data - Past 24 hours (${filteredDisasters.length} total)`
            }
            {lastUpdate && ` • Updated ${formatTime(lastUpdate.getTime())}`}
          </p>
        </>
      )}

      <ScrollArea className="h-[400px] pr-4">
        {!locationCoordinates ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Select a location to view disasters</p>
          </div>
        ) : filteredDisasters.length > 0 ? (
          <div className="space-y-4">
            {/* Earthquakes Section */}
            {filteredDisasters.filter(d => d.type === 'earthquake').length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm pb-2 z-10">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Earthquakes ({filteredDisasters.filter(d => d.type === 'earthquake').length})
                </h3>
                {filteredDisasters.filter(d => d.type === 'earthquake').map((disaster) => {
                  const earthquake = disaster.data as Earthquake;
                  return (
                    <Card key={earthquake.id} className="p-4 hover:shadow-md transition-shadow border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(disaster.severity)}>
                            M {earthquake.magnitude.toFixed(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getSeverityLabel(disaster.severity)}
                          </span>
                        </div>
                        {earthquake.tsunami === 1 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Waves className="h-3 w-3" />
                            Tsunami
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-foreground">
                        {earthquake.place}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                        <span>{formatTime(earthquake.time)}</span>
                        <span>Depth: {earthquake.depth.toFixed(1)} km</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => onDisasterSelect?.([earthquake.coordinates[0], earthquake.coordinates[1]], disaster)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Show on Map
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Hurricanes Section */}
            {filteredDisasters.filter(d => d.type === 'hurricane').length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm pb-2 z-10">
                  <Wind className="h-4 w-4 text-blue-500" />
                  Hurricanes & Storms ({filteredDisasters.filter(d => d.type === 'hurricane').length})
                </h3>
                {filteredDisasters.filter(d => d.type === 'hurricane').map((disaster, index) => {
                  const hurricane = disaster.data as Hurricane;
                  return (
                    <Card key={hurricane.id || index} className="p-4 hover:shadow-md transition-shadow border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(disaster.severity)}>
                            {hurricane.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getSeverityLabel(disaster.severity)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-foreground">
                        Hurricane {hurricane.name}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                        <span>{formatTime(hurricane.time)}</span>
                        <span>Wind: {hurricane.windSpeed} kt</span>
                        <span>Pressure: {hurricane.pressure} mb</span>
                        <span>Movement: {hurricane.movement}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => onDisasterSelect?.([hurricane.coordinates[0], hurricane.coordinates[1]], disaster)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Show on Map
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Volcanoes Section */}
            {filteredDisasters.filter(d => d.type === 'volcano').length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm pb-2 z-10">
                  <Flame className="h-4 w-4 text-red-500" />
                  Active Volcanoes ({filteredDisasters.filter(d => d.type === 'volcano').length})
                </h3>
                {filteredDisasters.filter(d => d.type === 'volcano').map((disaster, index) => {
                  const volcano = disaster.data as Volcano;
                  return (
                    <Card key={volcano.id || index} className="p-4 hover:shadow-md transition-shadow border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(disaster.severity)}>
                            {volcano.alertLevel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getSeverityLabel(disaster.severity)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-foreground">
                        {volcano.name}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                        <span>{volcano.location}</span>
                        <span>{formatTime(volcano.time)}</span>
                        <span>Elevation: {volcano.elevation}m</span>
                        <span>Status: {volcano.status}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => onDisasterSelect?.([volcano.coordinates[0], volcano.coordinates[1]], disaster)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Show on Map
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Wildfires Section */}
            {filteredDisasters.filter(d => d.type === 'wildfire').length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm pb-2 z-10">
                  <Flame className="h-4 w-4 text-orange-600" />
                  Active Wildfires ({filteredDisasters.filter(d => d.type === 'wildfire').length})
                </h3>
                {filteredDisasters.filter(d => d.type === 'wildfire').map((disaster, index) => {
                  const wildfire = disaster.data as Wildfire;
                  return (
                    <Card key={wildfire.id || index} className="p-4 hover:shadow-md transition-shadow border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(disaster.severity)}>
                            {wildfire.confidence.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getSeverityLabel(disaster.severity)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-foreground">
                        {wildfire.name}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                        <span>{wildfire.location}</span>
                        <span>{formatTime(wildfire.time)}</span>
                        <span>Fire Power: {wildfire.frp.toFixed(1)} MW</span>
                        <span>Brightness: {wildfire.brightness.toFixed(1)}K</span>
                        {wildfire.acresBurned && <span>Area: {wildfire.acresBurned.toLocaleString()} acres</span>}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => onDisasterSelect?.([wildfire.coordinates[0], wildfire.coordinates[1]], disaster)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Show on Map
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-border">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading disaster data..." : "No disasters detected in this area"}
            </p>
          </Card>
        )}
      </ScrollArea>

      <Card className="p-3 bg-blue-500/10 border-blue-500/20">
        <p className="text-xs text-muted-foreground">
          <strong>Data Sources:</strong> USGS Earthquakes, NOAA Hurricane Center, USGS Volcano Program & NASA FIRMS
        </p>
      </Card>
    </div>
  );
};

export default DisasterAlerts;
