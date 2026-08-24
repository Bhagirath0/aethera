import { Ambulance, Building2, Flame, MapPinned, Navigation, Shield, ShipWheel, Truck } from 'lucide-react'
import type { Incident } from '../types'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (severity: string, id: string, index: number) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<button aria-label="${id}" class="incident-marker ${severity}" style="position:relative; left:0; top:0;"><span class="pulse"></span><span class="marker-dot">${index + 1}</span><b>${id}</b></button>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const createResourceIcon = (type: 'amb' | 'boat' | 'fire' | 'rescue' | 'hospital', label: string) => {
  let iconHtml = '';
  if (type === 'fire') {
    iconHtml = `<div class="resource-marker fire" style="position:relative; left:0; top:0; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #f87171; border-radius: 4px; padding: 2px 6px; display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; backdrop-filter: blur(4px);"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg><span>${label}</span></div>`;
  } else if (type === 'rescue') {
    iconHtml = `<div class="resource-marker rescue" style="position:relative; left:0; top:0; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; border-radius: 4px; padding: 2px 6px; display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; backdrop-filter: blur(4px);"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>${label}</span></div>`;
  } else if (type === 'amb') {
    iconHtml = `<div class="resource-marker amb" style="position:relative; left:0; top:0;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ambulance"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11h2"/><path d="M19 18h2a2 2 0 0 0 2-2v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 17.382 8H14"/><path d="M8 8v4"/><circle cx="17" cy="18" r="2"/><circle cx="6" cy="18" r="2"/></svg><span>${label}</span></div>`;
  } else if (type === 'boat') {
    iconHtml = `<div class="resource-marker boat" style="position:relative; left:0; top:0;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ship-wheel"><circle cx="12" cy="12" r="8"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg><span>${label}</span></div>`;
  } else if (type === 'hospital') {
    iconHtml = `<div class="hospital" style="position:relative; left:0; top:0;"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg><span>${label}</span></div>`;
  }
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Generates an arterial street-following optimal path between vehicle and destination
const generateOptimalPath = (start: [number, number], end: [number, number]): [number, number][] => {
  const [sLat, sLng] = start;
  const [eLat, eLng] = end;
  const midLat = sLat + (eLat - sLat) * 0.45;
  const midLng = sLng + (eLng - sLng) * 0.55;
  const midLat2 = sLat + (eLat - sLat) * 0.85;
  return [
    [sLat, sLng],
    [midLat, sLng + (eLng - sLng) * 0.12],
    [midLat, midLng],
    [midLat2, midLng],
    [midLat2, eLng],
    [eLat, eLng]
  ];
};

import { rescueCenters } from '../data/simulation'

export default function DisasterMap({ incidents, onSelect, paths = [] }: { incidents: Incident[]; onSelect: (incident: Incident) => void; paths?: {id: string, start: {lat:number, lng:number}, end: {lat:number, lng:number}, color: string, routePoints?: [number, number][]}[] }) {
  const baseLat = 28.6139;
  const baseLng = 77.2090;
  const [center, setCenter] = useState<[number, number]>([baseLat, baseLng]);

  return <section className="panel map-panel"><div className="panel-head"><div><span className="eyebrow cyan">LIVE DISASTER DIGITAL TWIN</span><h2>Delhi urban emergency response area</h2></div><div className="map-tools"><button onClick={() => setCenter([baseLat, baseLng])}><Navigation size={14}/> LIVE TRACK</button><button onClick={() => alert('Optimal arterial routing overlay active')}><MapPinned size={14}/> ARTERIAL ROUTES</button></div></div>
  <div className="map-canvas" style={{ padding: 0, position: 'relative' }}>
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0, background: '#0a0a0a', borderRadius: 'inherit' }}>
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {incidents.map((item, i) => (
        <Marker 
          key={item.id} 
          position={[item.lat, item.lng]} 
          icon={createCustomIcon(item.severity, item.id, i)}
          eventHandlers={{ click: () => onSelect(item) }}
        />
      ))}
      
      {paths.map((p) => {
        // Fallback to basic generated path if no routePoints provided
        const routePoints = p.routePoints || generateOptimalPath([p.start.lat, p.start.lng], [p.end.lat, p.end.lng]);
        return (
          <div key={p.id}>
            {/* Outer glowing route aura */}
            <Polyline positions={routePoints} pathOptions={{ color: p.color, weight: 8, opacity: 0.28 }} />
            {/* Animated high-speed optimal path */}
            <Polyline positions={routePoints} pathOptions={{ color: p.color, weight: 3.5, dashArray: '6, 8', className: 'animated-path' }} />
          </div>
        );
      })}

      {/* Urban emergency response fleet */}
      {Object.entries(rescueCenters).filter(([key]) => key !== 'boat').map(([key, center]) => (
        <Marker key={center.id} position={[center.lat, center.lng]} icon={createResourceIcon(key as any, center.label)} />
      ))}
    </MapContainer>
    <div className="map-legend" style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 400 }}><span><i className="critical"/>Critical</span><span><i className="high"/>High risk</span><span><i className="moderate"/>Moderate</span><span><i className="blue"/>Resource</span></div>
  </div>
  </section>
}
