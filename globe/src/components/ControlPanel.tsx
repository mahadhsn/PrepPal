import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LocationSearch from "./LocationSearch";
import DisasterAlerts from "./DisasterAlerts";
import { User } from "@supabase/supabase-js";

interface ControlPanelProps {
  user: User | null;
  onLocationSearch?: (country: string) => void;
  onLocationClear?: () => void;
  selectedLocation?: string;
  locationCoordinates?: [number, number];
  onDisasterSelect?: (coordinates: [number, number], disaster: any) => void;
  onShowAllDisasters?: (disasters: any[]) => void;
  onDistanceRadiusChange?: (radius: number) => void;
}

const ControlPanel = ({ user, onLocationSearch, onLocationClear, selectedLocation, locationCoordinates, onDisasterSelect, onShowAllDisasters, onDistanceRadiusChange }: ControlPanelProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="absolute top-6 left-6 h-12 w-12 rounded-full shadow-[var(--shadow-medium)] z-50"
        size="icon"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="absolute top-6 left-6 w-96 bg-card/95 backdrop-blur-sm shadow-[var(--shadow-medium)] border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Control Panel</h2>
        <Button
          onClick={() => setIsMinimized(true)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-6 space-y-6">
          <LocationSearch 
            onSearch={onLocationSearch} 
            onClear={onLocationClear}
            selectedLocation={selectedLocation}
          />
          <DisasterAlerts 
            onDisasterSelect={onDisasterSelect}
            onShowAllDisasters={onShowAllDisasters}
            onDistanceRadiusChange={onDistanceRadiusChange}
            selectedLocation={selectedLocation}
            locationCoordinates={locationCoordinates}
          />
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ControlPanel;
