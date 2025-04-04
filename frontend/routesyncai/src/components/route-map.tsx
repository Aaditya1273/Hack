"use client"

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { RoutePath } from '@/lib/types'

interface RouteMapProps {
  route: RoutePath
}

export function RouteMap({ route }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [is3DView, setIs3DView] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [coordinates, setCoordinates] = useState<[number, number][]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Geocode nodes using OpenStreetMap Nominatim API
  const geocodeNode = async (nodeName: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nodeName)}`
      )
      const data = await response.json()
      if (data.length > 0) {
        const { lat, lon } = data[0]
        return [parseFloat(lon), parseFloat(lat)] // Nominatim returns [lat, lon], but MapLibre expects [lon, lat]
      }
      console.warn(`No results found for node: ${nodeName}`)
      return null
    } catch (error) {
      console.error(`Geocoding failed for node: ${nodeName}`, error)
      return null
    }
  }

  // Fetch coordinates for all nodes in the route
  const fetchCoordinates = async () => {
    if (!route || !route.path || !Array.isArray(route.path)) {
      console.error("Invalid route data:", route);
      setIsLoading(false);
      return;
    }

    const coords: [number, number][] = [];
    
    // First, check if the route includes coordinates directly
    if (route.coordinates && Array.isArray(route.coordinates)) {
      for (const point of route.coordinates) {
        if (point && typeof point === 'object' && 'latitude' in point && 'longitude' in point) {
          coords.push([parseFloat(point.longitude), parseFloat(point.latitude)]);
        }
      }
      
      if (coords.length > 0) {
        setCoordinates(coords);
        setIsLoading(false);
        return;
      }
    }

    // Fallback to geocoding if no coordinates provided
    try {
      for (const node of route.path) {
        // Check local storage for cached coordinates
        const cachedCoords = localStorage.getItem(node);
        if (cachedCoords) {
          try {
            const parsed = JSON.parse(cachedCoords);
            if (Array.isArray(parsed) && parsed.length === 2) {
              coords.push(parsed);
              continue;
            }
          } catch (e) {
            console.warn("Failed to parse cached coordinates", e);
          }
        }

        // If not cached or invalid, geocode
        try {
          const coord = await geocodeNode(node);
          if (coord) {
            coords.push(coord);
            // Cache the coordinates in local storage
            localStorage.setItem(node, JSON.stringify(coord));
          }
        } catch (e) {
          console.error(`Error geocoding ${node}:`, e);
        }
      }
    } catch (e) {
      console.error("Error in fetchCoordinates:", e);
    }

    setCoordinates(coords);
    setIsLoading(false);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://api.maptiler.com/maps/streets/style.json?key=KjP8QVbU8JTtyyew1cAd",
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
      interactive: true,
      pitch: 0,
      bearing: 0
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-left')

    return () => {
      map.current?.remove()
    }
  }, [])

  // Fetch coordinates and draw route when the route changes
  useEffect(() => {
    if (!route.path) return

    setIsLoading(true)
    fetchCoordinates().then(() => {
      if (coordinates.length > 0 && map.current) {
        drawRouteOnMap()
      }
    })
  }, [route]) // Add route as a dependency

  // Draw the route on the map
  const drawRouteOnMap = () => {
    if (!map.current || coordinates.length === 0) return

    // Remove existing route source and layer if they exist
    if (map.current.getSource('route')) {
      map.current.removeLayer('route-line') // Remove the layer first
      map.current.removeSource('route') // Then remove the source
    }

    // Add a source and layer for the route line
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    })

    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    })

    // Add markers for each node with icons based on mode
    route.edges.forEach((edge, index) => {
      const fromNode = edge.from;
      const toNode = edge.to;
      const mode = edge.mode;

      // Create a custom marker element
      const el = document.createElement('div');
      el.className = 'marker';

      // Set icon based on mode
      let iconUrl = '';
      switch (mode) {
        case 'sea':
          iconUrl = '/icons/ships.png'; // Path to ship icon
          break;
        case 'air':
          iconUrl = '/icons/plane.png'; // Path to plane icon
          break;
        default:
          iconUrl = '/icons/car.png'; // Path to car icon
      }

      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundSize = 'cover';

      // Make sure coordinate exists and is in the correct format
      if (index < coordinates.length) {
        const fromCoord = coordinates[index];
        // Create a new element clone for each marker
        const fromEl = el.cloneNode(true) as HTMLDivElement;
        
        // Add marker for the "from" node with a popup
        const fromMarker = new maplibregl.Marker(fromEl)
          .setLngLat({ lng: fromCoord[0], lat: fromCoord[1] })
          .setPopup(new maplibregl.Popup().setHTML(`<strong style="color: black;">${fromNode}</strong ><br><span style="color: black;">Mode: ${mode}</span>`))
          .addTo(map.current!);
      }

      // Add marker for the "to" node (if it's the last edge)
      if (index === route.edges.length - 1 && index + 1 < coordinates.length) {
        const toCoord = coordinates[index + 1];
        // Create a new element for the to marker
        const toEl = el.cloneNode(true) as HTMLDivElement;
        
        const toMarker = new maplibregl.Marker(toEl)
          .setLngLat({ lng: toCoord[0], lat: toCoord[1] })
          .setPopup(new maplibregl.Popup().setHTML(`<strong style="color: black;">${toNode}</strong><br><span style="color: black;">Mode: ${mode}</span>`))
          .addTo(map.current!);
      }
    });

    // Fit the map to the route
    if (coordinates.length > 1) {
      const bounds = new maplibregl.LngLatBounds(
        { lng: coordinates[0][0], lat: coordinates[0][1] },
        { lng: coordinates[0][0], lat: coordinates[0][1] }
      );
      
      coordinates.forEach(coord => {
        bounds.extend({ lng: coord[0], lat: coord[1] });
      });

      map.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      });
    }
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${isFullscreen ? 'h-screen w-screen' : 'h-full w-full'}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-lg">Loading map...</div>
        </div>
      )}
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  )
}