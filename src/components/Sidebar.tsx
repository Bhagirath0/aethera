import { Activity, BarChart3, Bot, Boxes, ChevronRight, Command, Map, Radio, ShieldAlert, SlidersHorizontal, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const nav: Array<[string, LucideIcon]> = [
  ['Command Center', Command], ['Digital Twin', Map], ['Incidents', ShieldAlert], ['AI Agents', Bot], ['Resources', Truck], ['What-If Simulator', SlidersHorizontal], ['Resilience Mode', Radio], ['Analytics', BarChart3],
]

export default function Sidebar({ active, onChange }: { active: string; onChange: (item: string) => void }) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark"><Activity size={18} /></span><span>AETHERA<span>-X</span></span></div>
    <div className="eyebrow">MISSION NAVIGATION</div>
    <nav>{nav.map(([name, Icon]) => <button key={name} onClick={() => onChange(name)} className={`nav-item ${active === name ? 'active' : ''}`}><Icon size={16} /><span>{name}</span>{active === name && <ChevronRight size={15} />}</button>)}</nav>
    <div className="sidebar-bottom"><div className="network-card"><div className="live-dot" /> <div><small>NETWORK</small><strong>RESILIENT</strong></div><Boxes size={15} /></div><p>SIMULATION PLATFORM<br />NOT AN EMERGENCY SERVICE</p></div>
  </aside>
}
