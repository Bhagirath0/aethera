import { useState } from 'react'
import { X } from 'lucide-react'
export default function SOSModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (values: { people: number; children: number; elderly: number; type: string; photo?: string; location: string }) => void }) {
 const [values, setValues] = useState({ people: 6, children: 1, elderly: 1, type: 'Urban fire', photo: '', location: 'Greater Noida' })
 const set = (key: keyof typeof values, value: string) => setValues(v => ({ ...v, [key]: key === 'type' || key === 'photo' || key === 'location' ? value : Number(value) }))
 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0]
   if (!file) return
   const reader = new FileReader()
   reader.onloadend = () => {
     set('photo', reader.result as string)
   }
   reader.readAsDataURL(file)
 }
 return <div className="modal-backdrop"><div className="modal"><button className="icon-button close" onClick={onClose}><X size={18}/></button><span className="eyebrow red">CITIZEN SIGNAL INTAKE</span><h2>Simulate citizen SOS</h2><p>Creates a simulated incident and sends it through the priority engine.</p><div className="form-grid"><label>Location<input value={values.location} onChange={e => set('location', e.target.value)}/></label><label>People<input type="number" value={values.people} onChange={e => set('people', e.target.value)}/></label><label>Children<input type="number" value={values.children} onChange={e => set('children', e.target.value)}/></label><label>Elderly<input type="number" value={values.elderly} onChange={e => set('elderly', e.target.value)}/></label><label>Disaster type<select value={values.type} onChange={e => set('type', e.target.value)}><option>Urban fire</option><option>Building collapse</option><option>Road accident</option><option>Waterlogged road</option></select></label><label>Severity<select><option>High</option><option>Critical</option><option>Moderate</option></select></label><label style={{ gridColumn: 'span 2' }}>Disaster Photo (Optional)<input type="file" accept="image/*" onChange={handleFileChange} style={{marginTop: 5, padding: '4px 0', border: 'none', background: 'transparent'}} /></label></div><button className="primary full" onClick={() => { onSubmit(values); onClose() }}>SUBMIT SOS SIGNAL</button></div></div>
}
