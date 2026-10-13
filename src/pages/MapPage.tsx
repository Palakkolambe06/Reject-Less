import React, { useState, useEffect } from 'react';
import { DemoUser } from '../types/user';
import { WasteBatch } from '../types/batch';
import { Recipient } from '../types/recipient';
import { batchService } from '../services/batchService';
import { recipientService } from '../services/recipientService';
import { mapService, MapMarkerItem } from '../services/mapService';
import { LeafletMap } from '../components/map/LeafletMap';
import { MapLegend } from '../components/map/MapLegend';
import { LocationDetails } from '../components/map/LocationDetails';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import {
  MapPin,
  Building2,
  Package,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Radio,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface MapPageProps {
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  activeUser,
  onNavigate,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'recipient' | 'pickup'>('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [showRadius, setShowRadius] = useState(false);

  // Selected Marker and Connected Recipient for Line Rendering
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [connectedRecipient, setConnectedRecipient] = useState<MapMarkerItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const bList = await batchService.getAll();
      const rList = await recipientService.getAll();
      setBatches(bList);
      setRecipients(rList);
      setLoading(false);
    };
    loadData();
  }, []);

  // Prepare all markers applying role-based data visibility
  const allMarkers = mapService.prepareMarkers(
    recipients,
    batches,
    activeUser.role,
    activeUser.recipientFacilityId
  );

  // Filter markers based on search and filters
  const filteredMarkers = allMarkers.filter((item) => {
    // Type Filter
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

    // Material Stream Filter
    if (materialFilter !== 'ALL') {
      if (item.type === 'recipient' && !item.materialCategory?.toLowerCase().includes(materialFilter.toLowerCase())) {
        return false;
      }
      if (item.type === 'pickup' && item.materialCategory?.toLowerCase() !== materialFilter.toLowerCase()) {
        return false;
      }
    }

    // Search Query Filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchMaterial = item.materialCategory?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubtitle && !matchMaterial) return false;
    }

    return true;
  });

  const totalRecipients = allMarkers.filter((m) => m.type === 'recipient').length;
  const totalPickups = allMarkers.filter((m) => m.type === 'pickup').length;

  // When a batch is selected, find matching recipient markers
  const eligibleRecipientsForSelectedBatch =
    selectedMarker?.type === 'pickup' && selectedMarker.batchData
      ? allMarkers
          .filter((m) => m.type === 'recipient' && m.recipientData)
          .map((m) => {
            const pair = mapService.evaluatePair(
              selectedMarker.batchData!,
              m.recipientData!
            );
            return {
              marker: m,
              distanceKm: pair.distanceKm,
              matchScore: pair.result.score,
              isEligible: pair.result.isEligible,
            };
          })
          .sort(
            (a, b) =>
              (b.isEligible ? 1 : 0) - (a.isEligible ? 1 : 0) ||
              (a.distanceKm || 999) - (b.distanceKm || 999)
          )
      : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>Interactive Recipient & Pickup Map</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Geospatial visualization of certified pickup bays, recipient paper mills, polymer plants, and service coverage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/recipients')}
            icon={<Building2 className="w-3.5 h-3.5" />}
          >
            Recipients Directory
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/create-batch')}
            icon={<Package className="w-3.5 h-3.5" />}
          >
            Register Batch
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Mapped Facilities
            </span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {allMarkers.length}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold tracking-wider">
              Recipient Mills
            </span>
            <div className="text-lg font-extrabold text-emerald-900 font-mono mt-0.5">
              {totalRecipients}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-700 font-bold tracking-wider">
              Pickup Bays
            </span>
            <div className="text-lg font-extrabold text-amber-900 font-mono mt-0.5">
              {totalPickups}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-teal-700 font-bold tracking-wider">
              Network Region
            </span>
            <div className="text-sm font-extrabold text-teal-900 mt-0.5 truncate">
              Pune MIDC Belt
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search facility name, city, material..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 placeholder:text-slate-400"
            />
          </div>

          {/* Location Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Layer:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'recipient' | 'pickup')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="ALL">All Mapped Locations</option>
              <option value="recipient">Recipient Facilities Only</option>
              <option value="pickup">Waste Batch Pickups Only</option>
            </select>
          </div>

          {/* Material Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Material:</span>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="ALL">All Material Streams</option>
              <option value="Cardboard">Cardboard</option>
              <option value="Paper">Paper</option>
              <option value="Plastic">Plastic</option>
              <option value="Glass">Glass</option>
              <option value="Metal">Metal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-mono">
            Loading Leaflet geospatial engine and OpenStreetMap tiles...
          </div>
        ) : filteredMarkers.length === 0 ? (
          <div className="w-full h-full bg-white flex items-center justify-center p-8">
            <EmptyState
              icon={<MapPin className="w-8 h-8 text-slate-400" />}
              title="No locations match your filter"
              description="Try selecting 'All Mapped Locations' or clear your search term."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm('');
                setTypeFilter('ALL');
                setMaterialFilter('ALL');
              }}
            />
          </div>
        ) : (
          <>
            <LeafletMap
              markers={filteredMarkers}
              selectedMarker={selectedMarker}
              onSelectMarker={(m) => {
                setSelectedMarker(m);
                setConnectedRecipient(null);
              }}
              showRadius={showRadius}
              connectedRecipient={connectedRecipient}
            />

            {/* Floating Map Legend (Bottom Left) */}
            <div className="absolute bottom-4 left-4 z-20 max-w-xs">
              <MapLegend
                showRadius={showRadius}
                onToggleRadius={setShowRadius}
                hasConnection={Boolean(connectedRecipient)}
              />
            </div>

            {/* Floating Location Details Drawer (Top/Bottom Right) */}
            {selectedMarker && (
              <div className="absolute top-4 right-4 z-20 max-w-sm w-full max-h-[calc(100%-2rem)] overflow-y-auto">
                <LocationDetails
                  item={selectedMarker}
                  onClose={() => {
                    setSelectedMarker(null);
                    setConnectedRecipient(null);
                  }}
                  onNavigate={onNavigate}
                />

                {/* If selected marker is a batch, show list of nearby candidate recipients */}
                {selectedMarker.type === 'pickup' && eligibleRecipientsForSelectedBatch.length > 0 && (
                  <div className="mt-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-xl text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                        Nearby Eligible Recyclers:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {eligibleRecipientsForSelectedBatch.length} facilities
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {eligibleRecipientsForSelectedBatch.map((item) => {
                        const isConnected = connectedRecipient?.id === item.marker.id;
                        return (
                          <div
                            key={item.marker.id}
                            onClick={() => setConnectedRecipient(isConnected ? null : item.marker)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isConnected
                                ? 'bg-emerald-50 border-emerald-600 shadow-2xs font-semibold'
                                : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-900 font-bold truncate max-w-[180px]">
                                {item.marker.title}
                              </span>
                              {item.distanceKm !== null && (
                                <span className="font-mono text-[10px] text-slate-500 font-semibold shrink-0">
                                  {item.distanceKm} km
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                              <span>{item.marker.facilityType}</span>
                              <span
                                className={`font-mono font-bold text-[10px] ${
                                  item.isEligible ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {item.isEligible ? `${item.matchScore}% Eligible` : 'Incompatible'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
