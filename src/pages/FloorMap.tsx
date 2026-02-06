import { useState, useRef, useCallback } from 'react';
import { MapPin, Camera, X, Plus, Trash2, ChevronDown, Move, ZoomIn, ZoomOut, Image } from 'lucide-react';
import { clsx } from 'clsx';
import { properties } from '../data/mockData';

interface PhotoPin {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
  imageUrl: string;
  room: string;
}

interface FloorPlan {
  id: string;
  propertyId: string;
  name: string;
  floor: string;
  pins: PhotoPin[];
}

// Mock floor plans with pre-placed pins
const initialFloorPlans: FloorPlan[] = [
  {
    id: 'fp1',
    propertyId: 'p1',
    name: 'Azure Penthouse - Main Floor',
    floor: 'PH-1',
    pins: [
      { id: 'pin1', x: 25, y: 30, label: 'Living Room View', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600', room: 'Living Room' },
      { id: 'pin2', x: 65, y: 25, label: 'Master Bedroom', imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600', room: 'Master Bedroom' },
      { id: 'pin3', x: 45, y: 70, label: 'Kitchen Area', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600', room: 'Kitchen' },
      { id: 'pin4', x: 80, y: 65, label: 'Rooftop Pool', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600', room: 'Pool Deck' },
    ],
  },
  {
    id: 'fp2',
    propertyId: 'p2',
    name: 'Villa Serenità - Ground Floor',
    floor: 'Ground',
    pins: [
      { id: 'pin5', x: 30, y: 40, label: 'Grand Foyer', imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600', room: 'Foyer' },
      { id: 'pin6', x: 70, y: 35, label: 'Mediterranean Garden', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600', room: 'Garden' },
      { id: 'pin7', x: 50, y: 75, label: 'Wine Cave Entrance', imageUrl: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600', room: 'Wine Cave' },
    ],
  },
  {
    id: 'fp3',
    propertyId: 'p5',
    name: 'Aspen Summit Estate - Main Level',
    floor: 'Main',
    pins: [
      { id: 'pin8', x: 40, y: 30, label: 'Great Room', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600', room: 'Great Room' },
      { id: 'pin9', x: 75, y: 50, label: 'Mountain View Deck', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600', room: 'Deck' },
    ],
  },
];

export default function FloorMap() {
  const [floorPlans] = useState(initialFloorPlans);
  const [selectedPlan, setSelectedPlan] = useState(floorPlans[0]);
  const [selectedPin, setSelectedPin] = useState<PhotoPin | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacing || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin: PhotoPin = {
      id: `pin-${Date.now()}`,
      x,
      y,
      label: 'New Photo Point',
      imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600',
      room: 'Room',
    };

    setSelectedPlan(prev => ({
      ...prev,
      pins: [...prev.pins, newPin],
    }));
    setIsPlacing(false);
  }, [isPlacing]);

  const removePin = (pinId: string) => {
    setSelectedPlan(prev => ({
      ...prev,
      pins: prev.pins.filter(p => p.id !== pinId),
    }));
    if (selectedPin?.id === pinId) setSelectedPin(null);
  };

  const property = properties.find(p => p.id === selectedPlan.propertyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Floor Map</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive property floor plans with linked photos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlacing(!isPlacing)}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isPlacing
                ? 'bg-gold-500 text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            {isPlacing ? <Move size={16} /> : <Plus size={16} />}
            {isPlacing ? 'Click map to place pin' : 'Add Photo Pin'}
          </button>
        </div>
      </div>

      {/* Floor plan selector */}
      <div className="flex flex-wrap gap-2">
        {floorPlans.map(fp => {
          const prop = properties.find(p => p.id === fp.propertyId);
          return (
            <button
              key={fp.id}
              onClick={() => { setSelectedPlan(fp); setSelectedPin(null); }}
              className={clsx(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                selectedPlan.id === fp.id
                  ? 'border-gold-400 bg-gold-50 text-gold-700 dark:border-gold-600 dark:bg-gold-900/30 dark:text-gold-400'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              {prop?.name} - {fp.floor}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map area */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-mansion-800">
            {/* Map header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <div>
                <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">{selectedPlan.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{property?.address}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="w-12 text-center text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* Map canvas */}
            <div className="overflow-auto p-4">
              <div
                ref={mapRef}
                onClick={handleMapClick}
                className={clsx(
                  'relative mx-auto aspect-[4/3] rounded-lg border-2 transition-all',
                  isPlacing
                    ? 'cursor-crosshair border-gold-400 bg-gold-50/30 dark:border-gold-500 dark:bg-gold-900/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-mansion-900'
                )}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                {/* Floor plan grid (schematic representation) */}
                <div className="absolute inset-0 p-4">
                  {/* Outer walls */}
                  <div className="h-full w-full rounded-lg border-2 border-slate-300 dark:border-slate-500">
                    {/* Room divisions */}
                    <div className="absolute left-[35%] top-0 h-[60%] border-r-2 border-slate-300 dark:border-slate-500" />
                    <div className="absolute left-[35%] top-[60%] w-[35%] border-t-2 border-slate-300 dark:border-slate-500" />
                    <div className="absolute left-[70%] top-[35%] h-[65%] border-r-2 border-slate-300 dark:border-slate-500" />
                    <div className="absolute left-0 top-[50%] w-[35%] border-t-2 border-slate-300 dark:border-slate-500" />

                    {/* Room labels */}
                    <div className="absolute left-[10%] top-[20%] text-xs font-medium text-slate-400 dark:text-slate-500">Living Room</div>
                    <div className="absolute left-[10%] top-[65%] text-xs font-medium text-slate-400 dark:text-slate-500">Kitchen</div>
                    <div className="absolute left-[45%] top-[20%] text-xs font-medium text-slate-400 dark:text-slate-500">Master Bed</div>
                    <div className="absolute left-[45%] top-[70%] text-xs font-medium text-slate-400 dark:text-slate-500">Bathroom</div>
                    <div className="absolute left-[75%] top-[50%] text-xs font-medium text-slate-400 dark:text-slate-500">Terrace</div>
                  </div>
                </div>

                {/* Photo Pins */}
                {selectedPlan.pins.map(pin => (
                  <button
                    key={pin.id}
                    onClick={e => { e.stopPropagation(); setSelectedPin(pin); }}
                    onMouseEnter={() => setHoveredPin(pin.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                    className="group/pin absolute z-10 -translate-x-1/2 -translate-y-full"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  >
                    {/* Pin marker */}
                    <div
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all',
                        selectedPin?.id === pin.id
                          ? 'scale-125 bg-gold-500 text-white ring-4 ring-gold-200 dark:ring-gold-800'
                          : 'bg-white text-gold-600 hover:scale-110 dark:bg-mansion-700 dark:text-gold-400'
                      )}
                    >
                      <Camera size={14} />
                    </div>
                    {/* Pin stem */}
                    <div className={clsx(
                      'mx-auto h-2 w-0.5',
                      selectedPin?.id === pin.id ? 'bg-gold-500' : 'bg-slate-300 dark:bg-slate-500'
                    )} />

                    {/* Hover tooltip */}
                    {hoveredPin === pin.id && (
                      <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-slate-700">
                        {pin.label}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
                      </div>
                    )}
                  </button>
                ))}

                {isPlacing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="rounded-lg bg-gold-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
                      Click anywhere to place a photo pin
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Selected pin detail */}
          {selectedPin ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-mansion-800">
              <div className="relative">
                <img
                  src={selectedPin.imageUrl}
                  alt={selectedPin.label}
                  className="h-48 w-full rounded-t-xl object-cover"
                />
                <button
                  onClick={() => setSelectedPin(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">{selectedPin.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedPin.room}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <MapPin size={12} />
                  Position: ({Math.round(selectedPin.x)}%, {Math.round(selectedPin.y)}%)
                </div>
                <button
                  onClick={() => removePin(selectedPin.id)}
                  className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={12} />
                  Remove Pin
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
              <div className="flex flex-col items-center py-4 text-center">
                <Image size={32} className="text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Click a pin to view photo
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Or click &quot;Add Photo Pin&quot; to place new ones
                </p>
              </div>
            </div>
          )}

          {/* Pin list */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
            <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
              Photo Points ({selectedPlan.pins.length})
            </h3>
            <div className="mt-3 space-y-2">
              {selectedPlan.pins.map(pin => (
                <button
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors',
                    selectedPin?.id === pin.id
                      ? 'border-gold-300 bg-gold-50 dark:border-gold-700 dark:bg-gold-900/20'
                      : 'border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  )}
                >
                  <img src={pin.imageUrl} alt={pin.label} className="h-10 w-10 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{pin.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pin.room}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">How to use</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <Camera size={12} className="mt-0.5 text-gold-500" />
                Click pins on the map to view linked photos
              </li>
              <li className="flex items-start gap-2">
                <Plus size={12} className="mt-0.5 text-gold-500" />
                Use &quot;Add Photo Pin&quot; then click the map to place new pins
              </li>
              <li className="flex items-start gap-2">
                <ChevronDown size={12} className="mt-0.5 text-gold-500" />
                Switch between floor plans using the tabs above
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
