import type { Incident, TimelineEvent } from '../types'

export const initialIncidents: Incident[] = [
  { id: 'A-104', title: 'Major urban fire', detail: 'Sector 4 commercial complex', people: 12, trapped: 12, vulnerability: '2 elderly · 1 child', eta: 8, rps: 94, severity: 'critical', lat: 28.5833, lng: 77.3167, status: 'Active' },
  { id: 'C-312', title: 'Building collapse', detail: 'East Delhi residential block', people: 35, vulnerability: 'Trapped residents', eta: 14, rps: 91, severity: 'critical', lat: 28.6324, lng: 77.2750, status: 'Active' },
  { id: 'B-207', title: 'Waterlogged road', detail: 'Mayur Vihar underpass', people: 10, vulnerability: 'Vehicles stranded', eta: 22, rps: 61, severity: 'high', lat: 28.6045, lng: 77.2968, status: 'Active' },
  { id: 'D-418', title: 'Road accident', detail: 'NH-24 interchange collision', people: 4, vulnerability: '2 injured', eta: 11, rps: 47, severity: 'moderate', lat: 28.6256, lng: 77.3000, status: 'Active' },
]

export const initialEvents: TimelineEvent[] = [
  { time: '10:32:14', text: 'Urban emergency detected — sensor cluster 07', type: 'alert' },
  { time: '10:32:27', text: 'Incident A-104 classified as Critical', type: 'alert' },
  { time: '10:33:01', text: 'Fire Engine 02 deployed to A-104', type: 'resource' },
  { time: '10:34:19', text: 'Route Agent recalculating around NH-24', type: 'route' },
  { time: '10:35:14', text: 'Patient destination reallocated to AIIMS Trauma', type: 'system' },
]

export const resources = [
  ['Ambulances', 12, 8, 'Active'], ['Fire trucks', 7, 5, 'Active'], ['Rescue teams', 18, 13, 'Active'], ['Hospital beds', 64, 41, 'Available'],
]

export const rescueCenters = {
  fire: { id: 'CP-FIRE', label: 'FIRE 04', lat: 28.6320, lng: 77.2195 },
  amb: { id: 'AIIMS-AMB', label: 'AMB 07', lat: 28.5670, lng: 77.2000 },
  rescue: { id: 'NDRF-GZB', label: 'RESCUE 01', lat: 28.6830, lng: 77.4500 },
  hospital: { id: 'SAFDARJUNG', label: 'HOSP C', lat: 28.5690, lng: 77.2050 }
}
