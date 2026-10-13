import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapMarkerItem } from '../../services/mapService';

interface LeafletMapProps {
  markers: MapMarkerItem[];
  selectedMarker: MapMarkerItem | null;
  onSelectMarker: (item: MapMarkerItem) => void;
  showRadius?: boolean;
  connectedRecipient?: MapMarkerItem | null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers,
  selectedMarker,
  onSelectMarker,
  showRadius = false,
  connectedRecipient = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlayLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center Pune Region (18.5204, 73.8567)
    const initialCenter: [number, number] = [18.55, 73.95];
    const initialZoom = 11;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tile layer with required attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    overlayLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Overlays when dependencies change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const overlayLayer = overlayLayerRef.current;

    if (!map || !markersLayer || !overlayLayer) return;

    markersLayer.clearLayers();
    overlayLayer.clearLayers();

    if (markers.length === 0) return;

    const bounds = L.latLngBounds([]);

    // 1. Plot Markers
    markers.forEach((item) => {
      const isSelected = selectedMarker?.id === item.id;
      const isRecipient = item.type === 'recipient';

      // Custom HTML Pin icon using L.divIcon
      const pinHtml = isRecipient
        ? `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
            <div class="w-8 h-8 rounded-full ${
              isSelected ? 'bg-emerald-950 ring-4 ring-emerald-400' : 'bg-emerald-700'
            } text-white shadow-md flex items-center justify-center border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
              </svg>
            </div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
            <div class="w-8 h-8 rounded-full ${
              isSelected ? 'bg-amber-950 ring-4 ring-amber-400' : 'bg-amber-600'
            } text-white shadow-md flex items-center justify-center border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m7.5 4.27 9 5.15"/>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
          </div>
        `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-map-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      // Add tooltip
      marker.bindTooltip(`<strong>${item.title}</strong><br/>${item.subtitle}`, {
        direction: 'top',
        offset: [0, -18],
        opacity: 0.9,
      });

      marker.on('click', () => {
        onSelectMarker(item);
      });

      marker.addTo(markersLayer);
      bounds.extend([item.lat, item.lng]);

      // Draw radius circle if requested for recipients
      if (showRadius && isRecipient && item.maxServiceRadiusKm) {
        L.circle([item.lat, item.lng], {
          radius: item.maxServiceRadiusKm * 1000,
          color: '#059669',
          weight: 1.5,
          opacity: 0.6,
          fillColor: '#10b981',
          fillOpacity: 0.08,
          dashArray: '4, 4',
        }).addTo(overlayLayer);
      }
    });

    // 2. Draw straight-line connection if a batch and recipient are paired
    if (
      selectedMarker &&
      selectedMarker.type === 'pickup' &&
      connectedRecipient &&
      connectedRecipient.type === 'recipient'
    ) {
      const latlngs: [number, number][] = [
        [selectedMarker.lat, selectedMarker.lng],
        [connectedRecipient.lat, connectedRecipient.lng],
      ];

      L.polyline(latlngs, {
        color: '#059669',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 6',
      }).addTo(overlayLayer);
    }

    // Pan to selected marker if selected
    if (selectedMarker) {
      map.panTo([selectedMarker.lat, selectedMarker.lng], {
        animate: true,
        duration: 0.5,
      });
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [markers, selectedMarker, showRadius, connectedRecipient, onSelectMarker]);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
