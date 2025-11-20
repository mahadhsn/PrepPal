import { useEffect, useRef } from "react";
import { Camera } from "lucide-react";

// Declare google maps types
declare global {
  interface Window {
    google: any;
  }
}

interface GlobeProps {
  onMapReady?: (map: any) => void;
  onMapClick?: (coordinates: [number, number], locationName: string) => void;
  apiKey?: string;
}

const Globe = ({ onMapReady, onMapClick, apiKey }: GlobeProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const scriptLoaded = useRef(false);
  const mapStyle = [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative",
      elementType: "labels.text.fill",
      stylers: [{ color: "#444444" }, { visibility: "off" }],
    },
    {
      featureType: "administrative.neighborhood",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ visibility: "on" }, { color: "#e0dfe0" }],
    },
    {
      featureType: "landscape",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#a8a9a8" }, { visibility: "on" }],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ saturation: -100 }, { lightness: 45 }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ visibility: "on" }, { color: "#5b5b5a" }],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [{ visibility: "simplified" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ color: "#ffffff" }, { visibility: "on" }],
    },
    {
      featureType: "water",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];
  useEffect(() => {
    if (!mapContainer.current || !apiKey) return;

    const initMap = () => {
      if (!mapContainer.current || map.current) return;

      const google = window.google;
      if (!google) return;

      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        minZoom: 2,
        maxZoom: 12,
        mapTypeId: "terrain",
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain"],
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        restriction: {
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180,
          },
          strictBounds: true,
        },
        styles: mapStyle,
      });

      // Add custom EOR button control
      const eorButtonDiv = document.createElement("div");
      eorButtonDiv.style.margin = "10px";
      
      const eorButton = document.createElement("a");
      eorButton.href = "https://google.com";
      eorButton.target = "_blank";
      eorButton.rel = "noopener noreferrer";
      eorButton.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: white;
        border: 2px solid rgba(0,0,0,0.1);
        border-radius: 6px;
        padding: 8px 16px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        transition: all 0.2s;
      `;
      eorButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
        <span>Emergency Object Recognition</span>
      `;
      eorButton.onmouseover = () => {
        eorButton.style.backgroundColor = "#f3f4f6";
      };
      eorButton.onmouseout = () => {
        eorButton.style.backgroundColor = "white";
      };
      
      eorButtonDiv.appendChild(eorButton);
      map.current.controls[google.maps.ControlPosition.TOP_RIGHT].push(eorButtonDiv);

      // Add click listener to the map
      if (onMapClick) {
        map.current.addListener("click", async (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          // Try to get location name via reverse geocoding
          try {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
              let locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

              if (status === "OK" && results?.[0]) {
                // Try to find country or locality
                const addressComponents = results[0].address_components;
                const country = addressComponents.find((c: any) => c.types.includes("country"));
                const locality = addressComponents.find(
                  (c: any) => c.types.includes("locality") || c.types.includes("administrative_area_level_1"),
                );

                if (locality && country) {
                  locationName = `${locality.long_name}, ${country.long_name}`;
                } else if (country) {
                  locationName = country.long_name;
                }
              }

              onMapClick([lng, lat], locationName);
            });
          } catch (error) {
            console.error("Geocoding error:", error);
            onMapClick([lng, lat], `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        });
      }

      if (onMapReady) {
        onMapReady(map.current);
      }
    };

    if (!window.google) {
      if (!scriptLoaded.current) {
        scriptLoaded.current = true;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      }
    } else {
      initMap();
    }

    return () => {
      // Cleanup if needed
    };
  }, [apiKey, onMapReady, onMapClick]);

  if (!apiKey) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg shadow-[var(--shadow-medium)] max-w-md">
          <p className="text-muted-foreground text-sm">
            Map will appear here once you add your Google Maps API key in the panel →
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Globe;
