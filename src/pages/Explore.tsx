import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Navigation } from "lucide-react";
import { useTheme } from "next-themes";
import { renderToStaticMarkup } from "react-dom/server";

// Fix for default Leaflet markers in React
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom Marker Icons
const createCustomIcon = (colorClass: string) => {
  const svgString = renderToStaticMarkup(
    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${colorClass}`}>
      <div className="w-2 h-2 bg-white rounded-full" />
    </div>
  );

  return L.divIcon({
    html: svgString,
    className: "custom-leaflet-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const goldIcon = createCustomIcon("bg-yellow-500 animate-bounce");
const blueIcon = createCustomIcon("bg-blue-500");
const greenIcon = createCustomIcon("bg-green-500");

// Mock Data matching the Schema structure for visualization
const MOCK_LOCATIONS = [
  {
    id: "1",
    title: "Eiffel Tower",
    lat: 48.8584,
    lng: 2.2945,
    is_must_see: true,
    is_visited: false,
    cost: 35,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"
  },
  {
    id: "2",
    title: "Louvre Museum",
    lat: 48.8606,
    lng: 2.3376,
    is_must_see: true,
    is_visited: true,
    cost: 22,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?w=800"
  },
  {
    id: "3",
    title: "Montmartre",
    lat: 48.8872,
    lng: 2.3429,
    is_must_see: false,
    is_visited: false, // Unvisited spot -> Blue
    cost: 0,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1550340499-a6c6030e6953?w=800"
  },
  {
    id: "4",
    title: "Le Marais",
    lat: 48.8575,
    lng: 2.3582,
    is_must_see: false,
    is_visited: false,
    cost: 0,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1509439649568-d0554157d6e4?w=800"
  }
];

// Component to handle map view updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const Explore = () => {
  // Default to Paris
  const [viewState, setViewState] = useState({
    center: [48.8566, 2.3522] as [number, number],
    zoom: 13
  });
  const [selectedLocation, setSelectedLocation] = useState<typeof MOCK_LOCATIONS[0] | null>(null);
  const { theme } = useTheme();

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col md:flex-row relative bg-background overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 h-full relative z-0">
        <MapContainer
          center={viewState.center}
          zoom={viewState.zoom}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={theme === 'dark'
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
          />
          <MapUpdater center={viewState.center} zoom={viewState.zoom} />

          {MOCK_LOCATIONS.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={loc.is_must_see ? goldIcon : loc.is_visited ? greenIcon : blueIcon}
              eventHandlers={{
                click: () => {
                  setSelectedLocation(loc);
                },
              }}
            >
              {selectedLocation?.id === loc.id && (
                <Popup className="custom-popup" closeButton={false} maxWidth={300} minWidth={250}>
                  <div className="rounded-xl overflow-hidden shadow-none border-none p-0 m-0 w-full font-sans">
                    <div className="relative h-32 w-full">
                      <img src={loc.image} alt={loc.title} className="w-full h-full object-cover" />
                      <Badge className={`absolute top-2 left-2 border-0 ${loc.is_must_see ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"}`}>
                        {loc.is_must_see ? "Must See" : "Explore"}
                      </Badge>
                    </div>
                    <div className="p-3 bg-card text-card-foreground">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm m-0 leading-tight">{loc.title}</h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                            {loc.rating}
                          </div>
                        </div>
                        <span className="font-semibold text-sm">₹{loc.cost}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="w-full text-xs h-8">
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs h-8">
                          <Navigation className="w-3 h-3 mr-1" /> Go
                        </Button>
                      </div>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar / Overlay for Discovery (Optional List View) */}
      <div className="hidden lg:block w-80 h-full border-l border-border bg-card p-4 overflow-y-auto shrink-0 z-10 shadow-xl">
        <h2 className="font-display font-bold text-xl mb-4">Discovery</h2>
        <div className="space-y-3">
          {MOCK_LOCATIONS.map(loc => (
            <div
              key={loc.id}
              className={`flex gap-3 p-3 rounded-xl border cursor-pointer hover:bg-accent/50 transition-colors ${selectedLocation?.id === loc.id ? 'border-primary bg-accent' : 'border-border'}`}
              onClick={() => {
                setSelectedLocation(loc);
                setViewState({ center: [loc.lat, loc.lng], zoom: 15 });
              }}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img src={loc.image} className="w-full h-full object-cover" alt={loc.title} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm truncate">{loc.title}</h3>
                  {loc.is_must_see && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {loc.is_visited ? "Visited" : loc.is_must_see ? "Must See" : "Recommended"}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                  <span className="text-primary">₹{loc.cost}</span>
                  <span className="text-muted-foreground mx-1">•</span>
                  <span>{loc.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
