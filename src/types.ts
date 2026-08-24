export type Severity = 'critical' | 'high' | 'moderate' | 'safe'

export interface Incident {
  id: string
  title: string
  detail: string
  people: number
  trapped?: number
  vulnerability: string
  eta: number
  rps: number
  severity: Severity
  lat: number
  lng: number
  status: 'Active' | 'Deploying' | 'Stabilized'
  photo?: string
  aiRecommendation?: {
    analysis: string
    assignedVehicleType: string
    assignedVehicleLabel: string
    startCoord: { lat: number, lng: number }
    problemMagnitude?: string
    magnitudeDetails?: string
    etaMinutes?: number
  }
}

export interface TimelineEvent {
  time: string
  text: string
  type: 'alert' | 'route' | 'system' | 'resource'
}
