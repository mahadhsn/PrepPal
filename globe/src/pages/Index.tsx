import { useEffect, useState, useRef } from "react";
import Globe from "@/components/Globe";
import ControlPanel from "@/components/ControlPanel";
import DisasterChatbot from "@/components/DisasterChatbot";
import { toast } from "sonner";

// Country coordinates mapping
const countryCoordinates: Record<string, [number, number]> = {
  "united states": [-95.7129, 37.0902],
  "usa": [-95.7129, 37.0902],
  "japan": [138.2529, 36.2048],
  "china": [104.1954, 35.8617],
  "india": [78.9629, 20.5937],
  "united kingdom": [-3.4360, 55.3781],
  "uk": [-3.4360, 55.3781],
  "france": [2.2137, 46.2276],
  "germany": [10.4515, 51.1657],
  "brazil": [-51.9253, -14.2350],
  "australia": [133.7751, -25.2744],
  "canada": [-106.3468, 56.1304],
  "mexico": [-102.5528, 23.6345],
  "russia": [105.3188, 61.5240],
  "italy": [12.5674, 41.8719],
  "spain": [-3.7492, 40.4637],
};

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationCoordinates, setLocationCoordinates] = useState<[number, number] | undefined>();
  const [distanceRadius, setDistanceRadius] = useState(3000);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const disasterMarkersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);

  const handleMapClick = (coordinates: [number, number], locationName: string) => {
    setSelectedLocation(locationName);
    setLocationCoordinates(coordinates);
    
    if (mapRef.current) {
      const position = { lat: coordinates[1], lng: coordinates[0] };
      
      // Clear existing markers (both search pins and disaster dots)
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      disasterMarkersRef.current.forEach(marker => marker.setMap(null));
      disasterMarkersRef.current = [];
      
      // Create custom marker icon with pin shape
      const markerIcon = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#ef4444',
        fillOpacity: 0.95,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 2,
        anchor: new window.google.maps.Point(12, 22),
      };
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP,
      });
      
      markersRef.current.push(marker);
      
      // Create or update radius circle
      if (radiusCircleRef.current) {
        radiusCircleRef.current.setMap(null);
      }
      
      radiusCircleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center: position,
        radius: distanceRadius * 1000, // Convert km to meters
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });
      
      // Create info window
      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow();
      }
      
      const content = `
        <div style="padding: 8px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${locationName}
          </h3>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Searching for disasters in this area...
          </p>
        </div>
      `;
      
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open(mapRef.current, marker);
      
      // Center and zoom map
      mapRef.current.setCenter(position);
      mapRef.current.setZoom(6);
      
      toast.success(`Searching for disasters near ${locationName}`);
    }
  };

  const handleDistanceRadiusChange = (radius: number) => {
    setDistanceRadius(radius);
    
    // Update the circle radius if it exists
    if (radiusCircleRef.current && locationCoordinates) {
      radiusCircleRef.current.setRadius(radius * 1000); // Convert km to meters
    }
  };

  const handleLocationSearch = (country: string) => {
    if (!country.trim()) {
      toast.error("Please enter a location");
      return;
    }

    // Use Google Maps Geocoding API to find any location
    if (window.google && mapRef.current) {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: country }, (results: any, status: string) => {
        if (status === "OK" && results?.[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const coordinates: [number, number] = [lng, lat];
          
          // Get formatted address from results
          const formattedAddress = results[0].formatted_address;
          
          setSelectedLocation(formattedAddress);
          setLocationCoordinates(coordinates);
          
          const position = { lat, lng };
          
          // Clear existing markers
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];
          
          // Create custom marker icon
          const markerIcon = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#ef4444',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          };
          
          // Create marker
          const marker = new window.google.maps.Marker({
            position,
            map: mapRef.current,
            icon: markerIcon,
            animation: window.google.maps.Animation.DROP,
          });
          
          markersRef.current.push(marker);
          
          // Create or update radius circle
          if (radiusCircleRef.current) {
            radiusCircleRef.current.setMap(null);
          }
          
          radiusCircleRef.current = new window.google.maps.Circle({
            map: mapRef.current,
            center: position,
            radius: distanceRadius * 1000, // Convert km to meters
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.5,
            strokeWeight: 2,
          });
          
          // Create info window
          if (!infoWindowRef.current) {
            infoWindowRef.current = new window.google.maps.InfoWindow();
          }
          
          const content = `
            <div style="padding: 8px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                ${formattedAddress}
              </h3>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">
                Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}
              </p>
            </div>
          `;
          
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapRef.current, marker);
          
          // Center and zoom map
          mapRef.current.panTo(position);
          mapRef.current.setZoom(6);
          
          toast.success(`Flying to ${formattedAddress}!`);
        } else {
          console.error("Geocoding error:", status);
          toast.error(`Location "${country}" not found. Please try a different search term.`);
        }
      });
    } else {
      // Fallback to predefined coordinates if Google Maps not loaded
      const coordinates = countryCoordinates[country.toLowerCase()];
      if (coordinates) {
        setSelectedLocation(country);
        setLocationCoordinates(coordinates);
        
        if (mapRef.current) {
          const position = { lat: coordinates[1], lng: coordinates[0] };
          
          // Clear existing markers
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];
          
          // Create custom marker icon
          const markerIcon = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#ef4444',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          };
          
          // Create marker
          const marker = new window.google.maps.Marker({
            position,
            map: mapRef.current,
            icon: markerIcon,
            animation: window.google.maps.Animation.DROP,
          });
          
          markersRef.current.push(marker);
          
          // Create or update radius circle
          if (radiusCircleRef.current) {
            radiusCircleRef.current.setMap(null);
          }
          
          radiusCircleRef.current = new window.google.maps.Circle({
            map: mapRef.current,
            center: position,
            radius: distanceRadius * 1000,
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.5,
            strokeWeight: 2,
          });
          
          mapRef.current.panTo(position);
          mapRef.current.setZoom(5);
          toast.success(`Flying to ${country}!`);
        }
      } else {
        toast.error("Location not found. Please try again when the map is loaded.");
      }
    }
  };

  const handleLocationClear = () => {
    setSelectedLocation("");
    setLocationCoordinates(undefined);
    
    // Clear all markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    disasterMarkersRef.current.forEach(marker => marker.setMap(null));
    disasterMarkersRef.current = [];
    
    // Clear radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
      radiusCircleRef.current = null;
    }
    
    // Close info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
    
    // Reset map view to initial position
    if (mapRef.current) {
      mapRef.current.setZoom(2);
      mapRef.current.panTo({ lat: 20, lng: 0 });
    }
  };

  const handleDisasterSelect = (coordinates: [number, number], disaster: any) => {
    if (!mapRef.current) return;

    const position = { lat: coordinates[1], lng: coordinates[0] };
    const isHurricane = disaster.type === 'hurricane';
    const isVolcano = disaster.type === 'volcano';
    const isWildfire = disaster.type === 'wildfire';
    const disasterData = disaster.data;

    const existingMarkerIndex = disasterMarkersRef.current.findIndex(
      m => m.getPosition().lat() === position.lat && m.getPosition().lng() === position.lng
    );

    let marker;
    if (existingMarkerIndex >= 0) {
      marker = disasterMarkersRef.current[existingMarkerIndex];
    } else {
      let markerColor = '#3b82f6';
      let markerScale = 10;
      let markerPath = window.google.maps.SymbolPath.CIRCLE;

      const severity = disaster.severity;
      
      if (isWildfire) {
        if (severity >= 9) {
          markerColor = '#dc2626';
          markerScale = 14;
        } else if (severity >= 7) {
          markerColor = '#ea580c';
          markerScale = 12;
        } else if (severity >= 5) {
          markerColor = '#f97316';
          markerScale = 10;
        } else {
          markerColor = '#fb923c';
          markerScale = 8;
        }
        // Use a star/cross shape for wildfires (circle with glow effect)
        markerPath = window.google.maps.SymbolPath.CIRCLE;
      } else if (isVolcano) {
        if (severity >= 9) {
          markerColor = '#ef4444';
          markerScale = 16;
        } else if (severity >= 7) {
          markerColor = '#f97316';
          markerScale = 14;
        } else if (severity >= 5) {
          markerColor = '#eab308';
          markerScale = 12;
        }
        markerPath = window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
      } else if (isHurricane) {
        if (severity >= 9) {
          markerColor = '#ef4444';
          markerScale = 16;
        } else if (severity >= 7) {
          markerColor = '#f97316';
          markerScale = 14;
        } else if (severity >= 5) {
          markerColor = '#eab308';
          markerScale = 12;
        }
        markerPath = window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW;
      } else {
        const magnitude = disasterData.magnitude;
        if (magnitude >= 7) {
          markerColor = '#ef4444';
          markerScale = 16;
        } else if (magnitude >= 6) {
          markerColor = '#f97316';
          markerScale = 14;
        } else if (magnitude >= 5) {
          markerColor = '#eab308';
          markerScale = 12;
        }
      }

      const markerIcon = {
        path: markerPath,
        scale: markerScale,
        fillColor: markerColor,
        fillOpacity: isWildfire ? 0.9 : 0.8,
        strokeColor: '#ffffff',
        strokeWeight: isWildfire ? 3 : 2,
        rotation: isHurricane ? 180 : 0,
      };

      marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        icon: markerIcon,
        animation: window.google.maps.Animation.BOUNCE,
      });

      disasterMarkersRef.current.push(marker);

      setTimeout(() => {
        marker.setAnimation(null);
      }, 2000);
    }

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    let content;
    if (isWildfire) {
      content = `
        <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            🔥 ${disasterData.name}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
            ${disasterData.location}
          </p>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Fire Power: ${disasterData.frp.toFixed(1)} MW<br/>
            Brightness: ${disasterData.brightness.toFixed(1)}K<br/>
            Confidence: ${disasterData.confidence}<br/>
            ${disasterData.acresBurned ? `Area: ${disasterData.acresBurned.toLocaleString()} acres` : ''}
          </p>
        </div>
      `;
      toast.success(`Viewing wildfire: ${disasterData.name}`);
    } else if (isVolcano) {
      content = `
        <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            🌋 ${disasterData.name}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
            ${disasterData.location}
          </p>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Alert Level: ${disasterData.alertLevel}<br/>
            Status: ${disasterData.status}<br/>
            Elevation: ${disasterData.elevation}m
          </p>
        </div>
      `;
      toast.success(`Viewing volcano: ${disasterData.name}`);
    } else if (isHurricane) {
      content = `
        <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            🌀 Hurricane ${disasterData.name}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
            Category: ${disasterData.category}
          </p>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Wind Speed: ${disasterData.windSpeed} kt<br/>
            Pressure: ${disasterData.pressure} mb<br/>
            Movement: ${disasterData.movement}
          </p>
        </div>
      `;
      toast.success(`Viewing hurricane: ${disasterData.name}`);
    } else {
      content = `
        <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            Magnitude ${disasterData.magnitude.toFixed(1)} Earthquake
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
            ${disasterData.place}
          </p>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Depth: ${disasterData.depth.toFixed(1)} km<br/>
            ${disasterData.tsunami ? '<strong style="color: #ef4444;">⚠️ Tsunami Warning</strong>' : ''}
          </p>
        </div>
      `;
      toast.success(`Viewing earthquake: M${disasterData.magnitude.toFixed(1)}`);
    }

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapRef.current, marker);

    marker.addListener('click', () => {
      infoWindowRef.current.open(mapRef.current, marker);
    });

    mapRef.current.panTo(position);
    mapRef.current.setZoom(8);
  };

  const handleShowAllDisasters = (disasters: any[]) => {
    if (!mapRef.current) return;

    disasterMarkersRef.current.forEach(marker => marker.setMap(null));
    disasterMarkersRef.current = [];

    let bounds = new window.google.maps.LatLngBounds();

    disasters.forEach((disaster) => {
      const isHurricane = disaster.type === 'hurricane';
      const isVolcano = disaster.type === 'volcano';
      const isWildfire = disaster.type === 'wildfire';
      const disasterData = disaster.data;
      const position = { lat: disasterData.coordinates[1], lng: disasterData.coordinates[0] };

      let markerColor = '#3b82f6';
      let markerScale = 8;
      let markerPath = window.google.maps.SymbolPath.CIRCLE;

      const severity = disaster.severity;
      if (severity >= 9) {
        markerColor = '#ef4444';
        markerScale = 14;
      } else if (severity >= 7) {
        markerColor = '#f97316';
        markerScale = 12;
      } else if (severity >= 5) {
        markerColor = '#eab308';
        markerScale = 10;
      }

      if (isWildfire) {
        // Wildfires use circles with distinct coloring
        markerColor = severity >= 9 ? '#dc2626' : severity >= 7 ? '#ea580c' : '#f97316';
      } else if (isVolcano) {
        markerPath = window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
      } else if (isHurricane) {
        markerPath = window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW;
      }

      const markerIcon = {
        path: markerPath,
        scale: markerScale,
        fillColor: markerColor,
        fillOpacity: isWildfire ? 0.9 : 0.7,
        strokeColor: '#ffffff',
        strokeWeight: isWildfire ? 3 : 2,
        rotation: isHurricane ? 180 : 0,
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP,
      });

      disasterMarkersRef.current.push(marker);

      marker.addListener('click', () => {
        if (!infoWindowRef.current) {
          infoWindowRef.current = new window.google.maps.InfoWindow();
        }

        let content;
        if (isWildfire) {
          content = `
            <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                🔥 ${disasterData.name}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
                ${disasterData.location}
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Fire Power: ${disasterData.frp.toFixed(1)} MW<br/>
                Brightness: ${disasterData.brightness.toFixed(1)}K<br/>
                Confidence: ${disasterData.confidence}<br/>
                ${disasterData.acresBurned ? `Area: ${disasterData.acresBurned.toLocaleString()} acres` : ''}
              </p>
            </div>
          `;
        } else if (isVolcano) {
          content = `
            <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                🌋 ${disasterData.name}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
                ${disasterData.location}
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Alert Level: ${disasterData.alertLevel}<br/>
                Status: ${disasterData.status}<br/>
                Elevation: ${disasterData.elevation}m
              </p>
            </div>
          `;
        } else if (isHurricane) {
          content = `
            <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                🌀 Hurricane ${disasterData.name}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
                Category: ${disasterData.category}
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Wind Speed: ${disasterData.windSpeed} kt<br/>
                Pressure: ${disasterData.pressure} mb<br/>
                Movement: ${disasterData.movement}
              </p>
            </div>
          `;
        } else {
          content = `
            <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                Magnitude ${disasterData.magnitude.toFixed(1)} Earthquake
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
                ${disasterData.place}
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Depth: ${disasterData.depth.toFixed(1)} km<br/>
                ${disasterData.tsunami ? '<strong style="color: #ef4444;">⚠️ Tsunami Warning</strong>' : ''}
              </p>
            </div>
          `;
        }

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapRef.current, marker);
      });

      bounds.extend(position);
    });

    mapRef.current.fitBounds(bounds);
    
    const earthquakeCount = disasters.filter(d => d.type === 'earthquake').length;
    const hurricaneCount = disasters.filter(d => d.type === 'hurricane').length;
    const volcanoCount = disasters.filter(d => d.type === 'volcano').length;
    const wildfireCount = disasters.filter(d => d.type === 'wildfire').length;
    const parts = [];
    if (earthquakeCount > 0) parts.push(`${earthquakeCount} earthquake${earthquakeCount > 1 ? 's' : ''}`);
    if (hurricaneCount > 0) parts.push(`${hurricaneCount} storm${hurricaneCount > 1 ? 's' : ''}`);
    if (volcanoCount > 0) parts.push(`${volcanoCount} volcano${volcanoCount > 1 ? 'es' : ''}`);
    if (wildfireCount > 0) parts.push(`${wildfireCount} wildfire${wildfireCount > 1 ? 's' : ''}`);
    toast.success(`Showing ${parts.join(' + ')} on map`);
  };

  const handleMapReady = (map: any) => {
    mapRef.current = map;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <Globe 
        onMapReady={handleMapReady} 
        onMapClick={handleMapClick}
        apiKey={apiKey} 
      />
      <ControlPanel 
        user={null} 
        onLocationSearch={handleLocationSearch}
        onLocationClear={handleLocationClear}
        selectedLocation={selectedLocation}
        locationCoordinates={locationCoordinates}
        onDisasterSelect={handleDisasterSelect}
        onShowAllDisasters={handleShowAllDisasters}
        onDistanceRadiusChange={handleDistanceRadiusChange}
      />
      <DisasterChatbot />
    </div>
  );
};

export default Index;
