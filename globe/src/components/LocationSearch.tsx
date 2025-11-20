import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

interface LocationSearchProps {
  onSearch?: (country: string) => void;
  onClear?: () => void;
  selectedLocation?: string;
}

const LocationSearch = ({ onSearch, onClear, selectedLocation }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location");
      return;
    }

    toast.success(`Searching for: ${searchQuery}`);
    onSearch?.(searchQuery);
    setSearchQuery("");
  };

  const handleClear = () => {
    setSearchQuery("");
    onClear?.();
    toast.success("Location cleared");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Search Location</label>
          {selectedLocation && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs h-7 px-2">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedLocation
            ? `Currently viewing: ${selectedLocation}`
            : "Enter any location (country, city, state) to search for disasters"}
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="e.g. United States, Queensland, London"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LocationSearch;
