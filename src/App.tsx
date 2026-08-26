import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Bell, Bot, Check, ChevronDown, CircleHelp, Clock3, Pause, Play, RotateCcw, ShieldCheck, WifiOff, Zap } from 'lucide-react'
import Sidebar from './components/Sidebar'
import DisasterMap from './components/DisasterMap'
import SOSModal from './components/SOSModal'
import { initialEvents, initialIncidents, resources, rescueCenters } from './data/simulation'
import type { Incident, TimelineEvent } from './types'

const chartData = [{n:'10:30',v:21},{n:'10:33',v:18},{n:'10:36',v:14},{n:'10:39',v:11},{n:'10:42',v:13},{n:'10:45',v:9}]
const agents = [['01','DETECTION','Flood · fire · accident','ACTIVE'],['02','SITUATION','4 signal streams fused','ACTIVE'],['03','VULNERABILITY','High-risk population mapped','ACTIVE'],['04','RESOURCE','42 assets tracked','ACTIVE'],['05','ROUTE','Fastest + safest route','ACTIVE'],['06','COORDINATOR','Recommendation ready','DECISION REQUIRED']]

function Metric({ label, value, tone = 'cyan' }: {label: string; value: string | number; tone?: string}) { return <div className="metric"><span className={`metric-bar ${tone}`}/><div><small>{label}</small><strong>{value}</strong></div></div> }
function ScoreBar({label, value, tone = 'cyan'}: {label:string; value:number; tone?:string}) { return <div className="score-bar"><div><span>{label}</span><b>{value}%</b></div><i><em className={tone} style={{width:`${value}%`}}/></i></div> }

export default function App() {
 const [activePage, setActivePage] = useState('Command Center')
 const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
 const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
 const [running, setRunning] = useState(false)
 const [simTime, setSimTime] = useState('10:36:14')
 const [offline, setOffline] = useState(false)
 const [sosOpen, setSosOpen] = useState(false)
 const [selected, setSelected] = useState<Incident | null>(initialIncidents[0])
 const [recommended, setRecommended] = useState(false)
 const [dispatchedPaths, setDispatchedPaths] = useState<{id: string, start: {lat:number, lng:number}, end: {lat:number, lng:number}, color: string, routePoints?: [number, number][]}[]>([])
 const [aiAnalysis, setAiAnalysis] = useState('')
 const [analyzing, setAnalyzing] = useState(false)
 const sorted = useMemo(() => [...incidents].sort((a,b) => b.rps-a.rps), [incidents])
 useEffect(() => { if (!running) return; const timer = window.setInterval(() => { setSimTime(time => { const second = (Number(time.slice(-2)) + 7) % 60; return `10:${String(36 + Math.floor(second / 30)).padStart(2,'0')}:${String(second).padStart(2,'0')}` }); setEvents(old => old.length < 7 ? [{ time: '10:36:21', text: 'Digital twin refreshed — traffic gridlock detected', type: 'system' }, ...old] : old) }, 3200); return () => clearInterval(timer) }, [running])
 const addEvent = (text:string, type: TimelineEvent['type'] = 'system') => setEvents(old => [{ time: simTime, text, type }, ...old].slice(0, 8))
 const reset = () => { setRunning(false); setSimTime('10:36:14'); setIncidents(initialIncidents); setEvents(initialEvents); setRecommended(false); setOffline(false); setSelected(initialIncidents[0]); setDispatchedPaths([]); setAiAnalysis(''); }
 
 const handleSelect = (inc: Incident) => {
   setSelected(inc);
   setRecommended(!!inc.aiRecommendation);
   setAiAnalysis(inc.aiRecommendation ? inc.aiRecommendation.analysis : '');
 };

 const resolveIncident = (id: string) => {
   setIncidents(prev => prev.filter(i => i.id !== id));
   setDispatchedPaths(prev => prev.filter(p => p.id !== id));
   addEvent(`Incident ${id} successfully resolved and units returned`, 'system');
   if (selected?.id === id) {
     const remaining = incidents.filter(i => i.id !== id);
     handleSelect(remaining[0] || null);
   }
 };

 const submitSOS = async ({ people, children, elderly, type, photo, location }: {people:number;children:number;elderly:number;type:string;photo?:string;location:string}) => { 
   const score = Math.min(98, 58 + people * 3 + children * 8 + elderly * 5); 
   let lat = 28.6139;
   let lng = 77.2090;
   try {
     const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
     const data = await res.json();
     if (data && data.length > 0) {
       lat = parseFloat(data[0].lat);
       lng = parseFloat(data[0].lon);
     }
   } catch (e) {
     console.error('Geocoding failed, using default coordinates');
   }
   const incident: Incident = {id:'F-642', title:`${type} SOS`, detail:location, people, trapped: people, vulnerability:`${children} child · ${elderly} elderly`, eta:9, rps:score, severity:score > 80 ? 'critical' : 'high', lat, lng, status:'Active', photo}; 
   setIncidents(prev=>[incident,...prev]); 
   setSelected(incident); 
   addEvent(`Citizen SOS received from ${location} — F-642 scored RPS ${score}`, 'alert') 
 }
 const analyzeIncident = async () => { 
   if (!selected) return; 
   setAnalyzing(true); 
   setAiAnalysis(''); 
   try { 
     const prompt = `You are Aethera-X Coordinator AI analyzing an urban emergency in Delhi.
Incident ID: ${selected.id} - ${selected.title}
Location: ${selected.detail}
People at Risk: ${selected.people} (${selected.trapped || 0} trapped)
Vulnerabilities: ${selected.vulnerability}
Status: ${selected.status}
Severity Level: ${selected.severity}
${selected.photo ? 'Citizen attached a disaster photo. Analyze image features (flames, structural collapse, water depth, road damage).' : ''}

Your tasks:
1. Assess the magnitude/scale of the problem (e.g., "MASS CASUALTY RISK", "STRUCTURAL DEBRIS TRAP", "SUBMERGED ARTERIAL ROAD", "TRAUMA COLLISION").
2. Select the optimal response vehicle:
   - "fire" -> "FIRE 04" (Fire Engine - for fires, smoke, industrial hazards)
   - "rescue" -> "RESCUE 01" (Heavy Urban Search & Rescue - for building collapses, trapped victims)
   - "amb" -> "AMB 07" (ALS Ambulance - for road collisions, medical trauma, waterlogged vehicles)
3. Provide an optimal route rationale and estimated arrival time (ETA).

Return STRICTLY raw JSON (no markdown fences, pure JSON object):
{
  "problemMagnitude": "CRITICAL" | "HIGH" | "MODERATE",
  "magnitudeDetails": "1-sentence summary of the disaster magnitude and hazard level",
  "assignedVehicleType": "fire" | "rescue" | "amb",
  "assignedVehicleLabel": "FIRE 04" | "RESCUE 01" | "AMB 07",
  "etaMinutes": 5,
  "analysis": "2-sentence tactical briefing explaining vehicle choice and optimal arterial path."
}`; 

     const response = await fetch('/api/analyze-incident', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ prompt, photo: selected.photo })
     });
     const result = await response.json();
     if (!response.ok) throw new Error(result.error || 'AI analysis failed.');
     const rawText = result.analysis || '{}';
     const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim(); 
     let parsed: any; 
     try { 
       parsed = JSON.parse(cleanJson); 
     } catch(e) { 
       const isFire = selected.title.toLowerCase().includes('fire');
       const isCollapse = selected.title.toLowerCase().includes('collapse');
       parsed = { 
         problemMagnitude: selected.severity === 'critical' ? 'CRITICAL DISASTER' : 'HIGH RISK', 
         magnitudeDetails: `${selected.people} people impacted in ${selected.detail}`,
         assignedVehicleType: isFire ? 'fire' : isCollapse ? 'rescue' : 'amb', 
         assignedVehicleLabel: isFire ? 'FIRE 04' : isCollapse ? 'RESCUE 01' : 'AMB 07', 
         etaMinutes: 7,
         analysis: rawText.substring(0, 150) + '...'
       }; 
     } 

     const vType = parsed.assignedVehicleType || 'amb';
     const centerInfo = rescueCenters[vType as keyof typeof rescueCenters] || rescueCenters['amb'];
     const recommendation = { 
       analysis: parsed.analysis || 'Optimal dispatch verified by AI.', 
       assignedVehicleType: vType, 
       assignedVehicleLabel: parsed.assignedVehicleLabel || centerInfo.label, 
       startCoord: { lat: centerInfo.lat, lng: centerInfo.lng },
       problemMagnitude: parsed.problemMagnitude || 'CRITICAL',
       magnitudeDetails: parsed.magnitudeDetails || `${selected.people} people at risk`,
       etaMinutes: parsed.etaMinutes || 6
     }; 

     setAiAnalysis(recommendation.analysis); 
     const updatedIncident = { ...selected, aiRecommendation: recommendation }; 
     setSelected(updatedIncident); 
     setIncidents(prev => prev.map(i => i.id === selected.id ? updatedIncident : i)); 
     addEvent(`AI Magnitude & Route calculated: ${recommendation.assignedVehicleLabel} assigned (${recommendation.etaMinutes}m ETA)`, 'system'); 
   } catch (error) { 
     setAiAnalysis(error instanceof Error ? error.message : 'Analysis unavailable.') 
   } finally { 
     setAnalyzing(false) 
   } 
 }
 return <div className="app-shell"><Sidebar active={activePage} onChange={setActivePage}/><main className="main"><header className="topbar"><div><span className="eyebrow">COMMAND CENTER <span className="slash">/</span> <b>URBAN EMERGENCY — DELHI</b></span><div className="top-title"><h1>{activePage}</h1><span className="simulation-chip">SIMULATION MODE</span></div></div><div className="top-actions"><div className={offline ? 'status offline' : 'status'}><i/> {offline ? 'NETWORK DEGRADED' : 'ALL SYSTEMS OPERATIONAL'}</div><div className="clock"><Clock3 size={15}/>{simTime}</div><button className="operator" onClick={() => alert('Operator Profile')}>RK</button><button onClick={() => alert('Notifications')} style={{all: 'unset', cursor: 'pointer', display: 'flex'}}><Bell size={18} className="muted"/></button></div></header>
 <AnimatePresence mode="wait"><motion.div key={activePage} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.22}}>
 {activePage === 'Analytics' ? <Analytics/> : 
  activePage === 'AI Agents' ? <AgentPage/> : 
  activePage === 'What-If Simulator' ? <WhatIf onApply={() => { setRecommended(true); addEvent('Option C approved — Boat 02 and Ambulance 07 reassigned', 'resource') }}/> : 
  activePage === 'Digital Twin' ? <div className="page-panel" style={{display: 'flex', flexDirection: 'column', gap: 20}}><DigitalTwin/><EventFeed events={events}/></div> :
  activePage === 'Incidents' ? <div className="page-panel"><div className="dashboard-grid"><DisasterMap incidents={incidents} onSelect={handleSelect} paths={dispatchedPaths}/><PriorityEngine incidents={sorted} selected={selected} onSelect={handleSelect}/></div></div> :
  activePage === 'Resources' ? <div className="page-panel"><ResourcePanel/></div> :
  activePage === 'Resilience Mode' ? <div className="page-panel"><Resilience offline={offline} onToggle={() => { setOffline(x=>!x); addEvent(offline ? 'Network restored — 17 SOS messages synchronized' : 'Network connection lost — local coordination enabled', 'system') }}/></div> :
  <><section className="control-row"><div className="scenario"><span className="eyebrow">SCENARIO</span><b>URBAN EMERGENCY — DELHI SIMULATION</b><ChevronDown size={15}/></div><div className="sim-controls"><button className={running ? 'active-control' : ''} onClick={()=> {setRunning(true);addEvent('Simulation resumed — signal fusion active','system')}}><Play size={14}/> START</button><button onClick={()=>setRunning(false)}><Pause size={14}/> PAUSE</button><button onClick={reset}><RotateCcw size={14}/> RESET</button></div><button className="primary sos" onClick={()=>setSosOpen(true)}>+ SIMULATE CITIZEN SOS</button></section>
  <section className="metrics"><Metric label="ACTIVE INCIDENTS" value={incidents.length} tone="red"/><Metric label="RESOURCES AVAILABLE" value="42" tone="cyan"/><Metric label="PEOPLE AT RISK" value={incidents.reduce((n,i)=>n+i.people,0)} tone="orange"/><Metric label="TWIN CONFIDENCE" value="94.7%" tone="green"/></section>
  <div className="dashboard-grid"><DisasterMap incidents={incidents} onSelect={handleSelect} paths={dispatchedPaths}/><PriorityEngine incidents={sorted} selected={selected} onSelect={handleSelect}/><DigitalTwin/><ResourcePanel/></div>
  <div className="lower-grid"><AgentNetwork/><EventFeed events={events}/><Decision incident={selected} analysis={aiAnalysis} analyzing={analyzing} onAnalyze={analyzeIncident} onResolve={() => {
    if (selected) resolveIncident(selected.id);
  }} onApprove={async () => {
    setRecommended(true); 
    const rec = selected?.aiRecommendation; 
    const vLabel = rec ? rec.assignedVehicleLabel : 'Emergency Vehicle'; 
    addEvent(`Coordinator approved — ${vLabel} dispatched via optimal route`, 'resource'); 
    if(selected){ 
      const fleetColors: Record<string, string> = {
        fire: '#ff5a5f',
        amb: '#56d79e',
        rescue: '#f59e0b',
        hospital: '#e2e8f0'
      };
      const vType = rec?.assignedVehicleType || 'amb';
      const centerInfo = rescueCenters[vType as keyof typeof rescueCenters] || rescueCenters['amb'];
      const start = rec?.startCoord || { lat: centerInfo.lat, lng: centerInfo.lng }; 
      const end = { lat: selected.lat, lng: selected.lng };
      const color = fleetColors[vType] || '#56d79e'; 
      let routePoints: [number, number][] | undefined = undefined;
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          routePoints = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        }
      } catch (e) {
        console.error('OSRM route fetch failed');
      }
      setDispatchedPaths(p => [...p, {id: selected.id, start, end, color, routePoints}]); 
    }
  }} approved={recommended}/></div></>}
 </motion.div></AnimatePresence></main>{sosOpen && <SOSModal onClose={()=>setSosOpen(false)} onSubmit={submitSOS}/>}</div>
}

function PriorityEngine({incidents, selected, onSelect}:{incidents:Incident[]; selected:Incident|null; onSelect:(x:Incident)=>void}) { return <section className="panel priority"><div className="panel-head"><div><span className="eyebrow red">AI RESCUE PRIORITY ENGINE</span><h2>Ranked intervention queue</h2></div><CircleHelp size={17} className="muted"/></div><div className="priority-list">{incidents.slice(0,4).map((item,i)=><button onClick={()=>onSelect(item)} key={item.id} className={`incident-row ${selected?.id===item.id?'selected':''}`}><span className={`rank ${item.severity}`}>{i+1}</span><div><b>{item.id} <small>{item.status}</small></b><span>{item.title}</span><em>{item.people} PEOPLE · {item.vulnerability}</em></div><strong>RPS <i className={item.severity}>{item.rps}</i><small>ETA {item.eta} MIN</small></strong></button>)}</div><div className="priority-note"><Bot size={16}/><span><b>SIMULATION MODEL</b> · We calculate urgency, not simply victim count.</span></div></section> }
function DigitalTwin() {
  const [weatherData, setWeatherData] = useState<{rain: string, wind: string, visibility: string, temp: string} | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        const data = await res.json();
        if (data.main) {
          setWeatherData({
            temp: `${Math.round(data.main.temp)}°C`,
            rain: data.rain && data.rain['1h'] ? `${data.rain['1h']} mm` : '0 mm',
            wind: `${Math.round(data.wind.speed * 3.6)} km/h`,
            visibility: `${(data.visibility / 1000).toFixed(1)} km`
          });
        }
      } catch (e) {
        console.error('Weather fetch failed', e);
      }
    };
    fetchWeather();
  }, []);

  const stats = [
    ['TEMP', weatherData?.temp || '32°C'],
    ['RAIN', weatherData?.rain || '24 mm'],
    ['WIND', weatherData?.wind || '18 km/h'],
    ['VISIBILITY', weatherData?.visibility || '0.7 km'],
    ['ROADS', '06 blocked'],
    ['POWER', '83%'],
    ['HOSPITAL', '64%'],
    ['SHELTERS', '71%']
  ];

  return <section className="panel twin"><div className="panel-head"><div><span className="eyebrow cyan">DIGITAL TWIN</span><h2>Live operating conditions</h2></div><span className="confidence">94.7% CONF.</span></div><div className="twin-grid">{stats.map(([a,b],i)=><div key={a}><small>{a}</small><b>{b}</b><i style={{width:`${35+i*7}%`}}/></div>)}</div></section>
}
function ResourcePanel(){return <section className="panel resources"><div className="panel-head"><div><span className="eyebrow cyan">LIVE RESOURCE ALLOCATION</span><h2>Response inventory</h2></div><button className="text-button" onClick={() => alert('Viewing all resources...')}>VIEW ALL</button></div><div className="resource-table"><div className="table-head"><span>RESOURCE</span><span>AVAILABLE</span><span>DEPLOYED</span><span>STATUS</span></div>{resources.map(r=><div className="table-row" key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><span>{r[2]}</span><em>{r[3]} <i/></em></div>)}</div></section>}
function AgentNetwork(){return <section className="panel agents"><div className="panel-head"><div><span className="eyebrow cyan">AI AGENT NETWORK</span><h2>Six agents · one decision loop</h2></div><span className="live-label"><i/> LIVE</span></div><div className="agent-grid">{agents.map(a=><div className="agent" key={a[0]}><span>{a[0]}</span><div><b>{a[1]}</b><small>{a[2]}</small></div><i className={a[3] === 'ACTIVE' ? 'ok' : 'warn'} /></div>)}</div></section>}
function AgentPage(){return <section className="page-panel"><span className="eyebrow cyan">MULTI-AGENT AI SYSTEM</span><h1>Signal to decision — continuously coordinated.</h1><p>Each agent operates on simulated, local data and produces explainable recommendations for an operator to review.</p><div className="agent-grid" style={{marginTop:28}}>{agents.map(a=><div className="agent" style={{padding:18}} key={a[0]}><span>{a[0]}</span><div><b>{a[1]} AGENT</b><small>{a[2]}</small></div><i className={a[3] === 'ACTIVE' ? 'ok' : 'warn'} /></div>)}</div></section>}
function EventFeed({events}:{events:TimelineEvent[]}){return <section className="panel feed"><div className="panel-head"><div><span className="eyebrow cyan">CONTINUOUS RE-PLANNING</span><h2>Live event stream</h2></div><Zap size={16} className="cyan-icon"/></div>{events.slice(0,5).map((e,i)=><div className="event" key={i}><time>{e.time}</time><i className={e.type}/><span>{e.text}</span></div>)}</section>}
function Decision({onApprove,approved,incident,analysis,analyzing,onAnalyze,onResolve}:{onApprove:()=>void;approved:boolean;incident:Incident|null;analysis:string;analyzing:boolean;onAnalyze:()=>void;onResolve:()=>void}){
  const rec = incident?.aiRecommendation;
  const vehicleColor = rec?.assignedVehicleType === 'fire' ? '#ff5a5f' : rec?.assignedVehicleType === 'rescue' ? '#f59e0b' : '#56d79e';

  return <section className="panel decision">
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div className="panel-head" style={{border: 'none', padding: 0}}>
        <div>
          <span className="eyebrow cyan">HUMAN-IN-THE-LOOP</span>
          <h2>Coordinator Agent</h2>
        </div>
      </div>
      <div style={{display: 'flex', gap: 12}}>
        <button className="primary outline" onClick={onAnalyze} disabled={analyzing || approved}>
          {analyzing ? 'ANALYZING...' : 'AI ANALYZE INCIDENT'}
        </button>
        {!approved ? (
          <button className="primary" onClick={onApprove} disabled={!rec}>APPROVE DEPLOYMENT</button>
        ) : (
          <button className="primary" style={{background: '#10b981', borderColor: '#10b981', color: '#000', fontWeight: 700}} onClick={onResolve}>
            <Check size={16} /> RESOLVE INCIDENT
          </button>
        )}
      </div>
    </div>
    
    <h2>{approved ? `Dispatched: ${rec?.assignedVehicleLabel || 'Emergency Unit'}` : 'Decision & Path Dispatch'}</h2>
    <p>{approved ? `${rec?.assignedVehicleLabel || 'Assigned vehicle'} is en route via AI-optimized arterial path.` : `AI assesses damage scale, assigns optimal emergency unit, and calculates fastest route for ${incident?.id || 'selected incident'}.`}</p>
    
    {incident?.photo && !approved && (
      <div style={{marginBottom: 10, position: 'relative'}}>
        <img src={incident.photo} alt="Disaster Scene" style={{width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, border: '1px solid #1e353b'}}/>
        <span style={{position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.7)', color: '#22c7e8', fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700}}>CITIZEN PHOTO VERIFIED</span>
      </div>
    )}

    {rec && (
      <div style={{display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap'}}>
        <span style={{fontSize: 11, background: 'rgba(34, 199, 232, 0.15)', border: `1px solid ${vehicleColor}`, color: vehicleColor, padding: '3px 8px', borderRadius: 4, fontWeight: 700}}>
          UNIT: {rec.assignedVehicleLabel}
        </span>
        {rec.etaMinutes && (
          <span style={{fontSize: 11, background: 'rgba(86, 215, 158, 0.15)', border: '1px solid #56d79e', color: '#56d79e', padding: '3px 8px', borderRadius: 4, fontWeight: 700}}>
            OPTIMAL ETA: {rec.etaMinutes} MIN
          </span>
        )}
        {rec.magnitudeDetails && (
          <span style={{fontSize: 11, color: '#94a3b8', width: '100%', marginTop: 2}}>
            {rec.magnitudeDetails}
          </span>
        )}
      </div>
    )}

    <div className="decision-meta">
      <span>AI CONFIDENCE <b>95%</b></span>
      <span>ROUTING <b>OPTIMAL ARTERIAL</b></span>
    </div>

    <button className="ai-action" disabled={analyzing} onClick={onAnalyze}>
      {analyzing ? 'AI EVALUATING MAGNITUDE & ROUTING…' : 'AI ASSESS MAGNITUDE & ASSIGN VEHICLE'}
    </button>
    
    {analysis && <p className="ai-result" style={{borderColor: vehicleColor}}>{analysis}</p>}
    
    {!approved ? (
      <div className="decision-buttons">
        <button className="primary" onClick={onApprove}><Check size={15}/> APPROVE DISPATCH & ROUTE</button>
        <button onClick={() => alert('Vehicle reassignment console')}>MODIFY</button>
        <button onClick={() => alert('Dispatch rejected')}>REJECT</button>
      </div>
    ) : (
      <div className="approved"><ShieldCheck size={16}/> VEHICLE DISPATCHED ALONG OPTIMAL PATH</div>
    )}
  </section>
}
function WhatIf({onApply}:{onApply:()=>void}){const options=[['OPTION A','48','12','11'],['OPTION B','71','15','8'],['OPTION C','82','17','7']];return <section className="page-panel whatif"><span className="eyebrow cyan">WHAT-IF RESPONSE SIMULATOR</span><h1>Compare response strategies before deployment.</h1><p>Projected outcomes from the current simulated conditions and resource constraints.</p><div className="option-grid">{options.map((o,i)=><div className={`option ${i===2?'recommended':''}`} key={o[0]}>{i===2&&<span className="recommend">AI RECOMMENDATION</span>}<h2>{o[0]}</h2><p>{i===0?'2 Ambulances → Area A':i===1?'1 Ambulance → Area A · 1 → Area B':'Rescue Boat → Area A · Ambulance → Area B'}</p><div><b>{o[1]}<small>People reached</small></b><b>{o[2]}<small>Critical cases</small></b><b>{o[3]}<small>Avg response min</small></b></div>{i===2&&<button className="primary full" onClick={onApply}>APPLY RECOMMENDATION</button>}</div>)}</div></section>}
function Resilience({offline,onToggle}:{offline:boolean;onToggle:()=>void}){return <section className={`resilience ${offline?'degraded':''}`}><div><span className="eyebrow orange">RESILIENCE MODE</span><h2>{offline?'Network connection lost':'Normal network'}</h2><p>{offline?'Aethera-X continues simulated local emergency coordination while connectivity is unavailable.':'Primary emergency network is connected and synchronizing normally.'}</p></div><div className="resilience-data"><b>{offline?'SOS QUEUE: 17':'NETWORK STABLE'}</b><span>{offline?'LOCAL DEVICES: 42 · PENDING DATA: 8.4 KB':'Last sync: 10:36:14'}</span><button className="primary" onClick={onToggle}>{offline?'RESTORE CONNECTION':'SIMULATE OFFLINE MODE'}</button></div></section>}
function Analytics(){return <section className="page-panel analytics"><span className="eyebrow cyan">SIMULATED PERFORMANCE</span><h1>Response performance</h1><div className="analytics-grid"><div className="chart-card"><div><h2>Average response time</h2><span>Before AI <b>18.4 min</b> <em>Aethera-X simulation <b>12.6 min</b></em></span></div><div className="chart"><ResponsiveContainer width="100%" height={210}><AreaChart data={chartData}><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#22c7e8" stopOpacity=".5"/><stop offset="1" stopColor="#22c7e8" stopOpacity="0"/></linearGradient></defs><Tooltip/><Area type="monotone" dataKey="v" stroke="#22c7e8" fill="url(#area)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></div><div className="performance"><Metric label="PEOPLE REACHED" value="218"/><Metric label="CRITICAL CASES" value="32" tone="red"/><Metric label="ROUTE EFFICIENCY" value="87%" tone="green"/><Metric label="RESOURCE UTILIZATION" value="73%" tone="orange"/></div></div></section>}
