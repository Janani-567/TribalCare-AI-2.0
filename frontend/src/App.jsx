import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  HeartPulse, ShieldCheck, Phone, Users, Stethoscope, Bell, CalendarDays, Baby, House,
  AlertTriangle, LogOut, Menu, Search, Mic, Languages, Activity, Wifi, WifiOff,
  ClipboardList, UserRound, Settings, Syringe, FileText, Check, RefreshCw,
} from 'lucide-react'
import PatientAccess from './PatientAccess.jsx'
import './App.css'
import './Enhancements.css'

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('tribalcare_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('tribalcare_user') || 'null')
  } catch {
    localStorage.removeItem('tribalcare_user')
    return null
  }
}

function Logo({ light = false }) {
  return <Link className={`logo ${light ? 'light' : ''}`} to="/"><span className="logo-mark"><HeartPulse size={22}/></span><span>TribalCare <b>AI 2.0</b></span></Link>
}

function Navbar() {
  const [open, setOpen] = useState(false)
  return <header className="nav"><Logo/><button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation"><Menu/></button><nav className={open ? 'open' : ''}><a href="#mission">Mission</a><a href="#services">Services</a><a href="#ivr">Patient access</a><Link className="nav-login" to="/login/doctor">Doctor Login</Link><Link className="nav-login asha" to="/login/asha">ASHA Login</Link><Link className="nav-login" to="/login/admin">Admin</Link></nav></header>
}

function Landing() {
  return <>
    <Navbar/>
    <main>
      <section className="hero-section">
        <div className="hero-copy"><span className="eyebrow"><Activity size={16}/> Inclusive healthcare technology</span><h1>Healthcare that reaches <em>every voice.</em></h1><p>TribalCare AI 2.0 connects remote communities with doctors and ASHA workers through multilingual voice, SMS and phone access.</p><div className="hero-actions"><a className="btn primary" href="#ivr"><Phone size={18}/> Try phone access</a><a className="btn secondary" href="#services">Explore services</a></div><div className="trust"><ShieldCheck size={18}/><span><b>Consent-first</b><br/>Secure, role-based care</span></div></div>
        <div className="hero-art"><div className="pulse-ring"><HeartPulse size={78}/></div><div className="float-card card-a"><Languages/><span><b>6 languages</b><small>Voice assistance</small></span></div><div className="float-card card-b"><Users/><span><b>Community care</b><small>ASHA connected</small></span></div></div>
      </section>
      <section id="mission" className="section"><div className="section-heading"><span>OUR MISSION</span><h2>No distance should decide access to care.</h2><p>Familiar phone technology helps connect communities and care teams, even when internet access or smartphones are unavailable.</p></div></section>
      <section id="services" className="section soft"><div className="section-heading"><span>HOW IT WORKS</span><h2>One platform. Connected care teams.</h2></div><div className="role-grid"><article className="role-card"><div className="role-icon"><Phone/></div><h3>Patients</h3><p>Call or send an SMS from any keypad phone to request help, check care details or reach a worker.</p></article><article className="role-card"><div className="role-icon"><Stethoscope/></div><h3>Doctors</h3><p>Review patient records, voice messages and care requests, then send follow-up responses.</p></article><article className="role-card"><div className="role-icon"><House/></div><h3>ASHA Workers</h3><p>Register patients, track pregnancy and child health, coordinate visits and respond to requests.</p></article></div></section>
      <section className="section"><PatientAccess/></section>
      <section className="emergency-banner"><div><AlertTriangle/><div><b>Need urgent help?</b><p>Use HELP by SMS or select Emergency Help by phone. This demo coordinates care and does not dispatch ambulances.</p></div></div><a className="btn primary" href="#ivr">Open patient access</a></section>
    </main>
    <footer><Logo light/><p>Connected, consent-based healthcare for remote communities.</p><div><b>Central healthcare number</b><p>Demo service · Emergency requests are routed to the care team.</p></div></footer>
  </>
}

const loginAccounts = {
  doctor: { title: 'Doctor', email: 'doctor@tribalcare.demo', password: 'Doctor@123', icon: <Stethoscope/> },
  asha: { title: 'ASHA Worker', email: 'asha@tribalcare.demo', password: 'Asha@123', icon: <House/> },
  admin: { title: 'Administrator', email: 'admin@tribalcare.demo', password: 'Admin@123', icon: <Settings/> },
}

function LoginPage() {
  const { role } = useParams()
  return loginAccounts[role] ? <LoginForm key={role} role={role}/> : <Navigate to="/"/>
}

function LoginForm({ role }) {
  const navigate = useNavigate()
  const account = loginAccounts[role]
  const [email, setEmail] = useState(account?.email || '')
  const [password, setPassword] = useState(account?.password || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async event => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.data.user.role !== role) {
        setError(`This account is not a ${account.title} account.`)
        return
      }
      localStorage.setItem('tribalcare_token', response.data.access_token)
      localStorage.setItem('tribalcare_user', JSON.stringify(response.data.user))
      navigate(`/${role}`)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Login failed. Ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }
  return <main className="login-page"><Link to="/" className="back">← Back to website</Link><div className="login-card"><Logo/><div className="login-icon">{account.icon}</div><h1>{account.title} Login</h1><form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required/></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required/></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="btn primary full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form><div className="demo-credentials"><b>Demo credentials</b><span>{account.email} · {account.password}</span></div></div></main>
}

function Protected({ role, children }) {
  const user = readUser()
  const token = localStorage.getItem('tribalcare_token')
  return user?.role === role && token ? children : <Navigate to={`/login/${role}`} replace/>
}

const navigation = {
  doctor: [
    ['Dashboard', Activity], ['Patient Records', Users], ['Patient Voice Messages', Mic],
    ['AI Transcriptions', FileText], ['Translation Review', Languages], ['Appointments', CalendarDays],
    ['Emergency Cases', AlertTriangle], ['Patient SMS Requests', Phone], ['Doctor Responses', ClipboardList],
    ['Health Reports', Activity], ['Notifications', Bell], ['Profile and Settings', Settings],
  ],
  asha: [
    ['Dashboard', Activity], ['Register Patient', Users], ['My Patients', Users],
    ['Pregnancy Tracking', Baby], ['Child Healthcare', Baby], ['Vaccination Management', Syringe],
    ['Home Visit Management', House], ['Appointments', CalendarDays], ['Emergency Alerts', AlertTriangle],
    ['Patient SMS Requests', Phone], ['Follow-up Reminders', Bell], ['Health Awareness', FileText], ['Notifications', Bell], ['Profile', UserRound],
  ],
  admin: [
    ['Dashboard', Activity], ['User Management', Users], ['Patient Records', Users],
    ['Appointments', CalendarDays], ['Emergency Cases', AlertTriangle], ['Patient SMS Requests', Phone], ['Notifications', Bell],
  ],
}

function Dashboard() {
  const { role } = useParams()
  const navigate = useNavigate()
  const user = readUser() || {}
  const items = navigation[role] || []
  const [tab, setTab] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  const logout = () => {
    localStorage.removeItem('tribalcare_token')
    localStorage.removeItem('tribalcare_user')
    navigate('/')
  }
  return <div className="dash"><aside className={collapsed ? 'collapsed' : ''}><div className="dash-brand"><HeartPulse/><b>TribalCare</b></div><button className="collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse navigation"><Menu/></button><nav>{items.map(([label, Icon]) => <button key={label} className={tab === label ? 'active' : ''} onClick={() => setTab(label)}><Icon/><span>{label}</span></button>)}</nav><button className="logout" onClick={logout}><LogOut/><span>Logout</span></button></aside><div className="dash-main"><header className="dash-header"><div><b>{tab}</b><span>{user.name || 'Healthcare team'} · {role === 'asha' ? 'ASHA Worker' : role === 'admin' ? 'Administrator' : 'Doctor'}</span></div><div className={`status ${online ? '' : 'offline'}`}>{online ? <Wifi/> : <WifiOff/>}{online ? 'Online' : 'Offline'}</div><div className="avatar">{(user.name || 'TC').slice(0, 2).toUpperCase()}</div></header><DashboardContent role={role} tab={tab}/></div></div>
}

const emptyData = { patients: [], appointments: [], pregnancy: [], vaccinations: [], visits: [], emergencies: [], voice: [], notifications: [], users: [], sms: [] }

function DashboardContent({ role, tab }) {
  const [data, setData] = useState(emptyData)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const notify = message => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }
  const fetchData = useCallback(async () => {
    const paths = ['/patients', '/appointments', '/pregnancy', '/vaccinations', '/home-visits', '/emergency', '/voice/messages', '/notifications', '/sms/history']
    if (role === 'admin') paths.push('/admin/users')
    const results = await Promise.all(paths.map(path => api.get(path)))
    const next = { ...emptyData, patients: results[0].data, appointments: results[1].data, pregnancy: results[2].data, vaccinations: results[3].data, visits: results[4].data, emergencies: results[5].data, voice: results[6].data, notifications: results[7].data, sms: results[8].data }
    if (role === 'admin') next.users = (await api.get('/admin/users')).data
    return next
  }, [role])
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fetchData())
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load dashboard data. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [fetchData])
  useEffect(() => {
    let active = true
    fetchData().then(next => {
      if (!active) return
      setData(next)
      setError('')
      setLoading(false)
    }).catch(requestError => {
      if (!active) return
      setError(requestError.response?.data?.detail || 'Could not load dashboard data. Check your connection and try again.')
      setLoading(false)
    })
    const refresh = () => reload()
    window.addEventListener('tribalcare:refresh', refresh)
    return () => {
      active = false
      window.removeEventListener('tribalcare:refresh', refresh)
    }
  }, [fetchData, reload])

  const refresh = () => window.dispatchEvent(new Event('tribalcare:refresh'))
  if (tab === 'Register Patient') return <PatientForm notify={notify} onSaved={refresh}/>
  if (tab === 'Appointments') return <><AppointmentForm patients={data.patients} notify={notify} onSaved={refresh}/><Table title="Appointments" rows={data.appointments} cols={['patient_id','date','time','facility','status']}/></>
  if (tab === 'My Patients' || tab === 'Patient Records') return <Table title="Patient records" rows={data.patients} cols={['id','name','mobile','village','age','preferred_language']}/>
  if (tab.includes('Emergency')) return <Emergency rows={data.emergencies} notify={notify} onUpdated={refresh}/>
  if (tab === 'Vaccination Management' || tab === 'Child Healthcare') return <><VaccinationForm patients={data.patients} notify={notify} onSaved={refresh}/><Table title="Vaccination schedule" rows={data.vaccinations} cols={['patient_id','vaccine','due_date','status']}/></>
  if (tab === 'Pregnancy Tracking') return <><PregnancyForm patients={data.patients} notify={notify} onSaved={refresh}/><Table title="Pregnancy records" rows={data.pregnancy} cols={['patient_id','stage','expected_delivery','next_checkup','status']}/></>
  if (tab === 'Home Visit Management') return <><VisitForm patients={data.patients} notify={notify} onSaved={refresh}/><Table title="Home visits" rows={data.visits} cols={['patient_id','date','time','purpose','status']}/></>
  if (tab === 'Patient Voice Messages') return <Voice rows={data.voice}/>
  if (tab === 'Patient SMS Requests') return <SMSRequests rows={data.sms} notify={notify} onUpdated={refresh}/>
  if (tab === 'AI Transcriptions' || tab === 'Translation Review') return <Translation/>
  if (tab === 'Doctor Responses') return <Response patients={data.patients} notify={notify} onSaved={refresh}/>
  if (tab === 'Notifications') return <Notifications rows={data.notifications} onChanged={refresh}/>
  if (tab === 'User Management') return <Table title="Role-based accounts" rows={data.users} cols={['name','email','role']}/>
  if (tab === 'Profile' || tab === 'Profile and Settings') return <Profile user={readUser() || {}}/>
  if (tab === 'Health Awareness') return <HealthAwareness/>
  return <main className="dashboard-body">
    {error && <div className="dashboard-error" role="alert"><span>{error}</span><button onClick={reload}><RefreshCw size={15}/> Retry</button></div>}
    {loading && <div className="loading-state"><RefreshCw className="spin"/> Loading your care dashboard…</div>}
    <div className="stat-grid">
      <Stat icon={<Users/>} value={data.patients.length} label={role === 'doctor' ? 'Assigned patients' : 'Patients'} color="green"/>
      <Stat icon={<CalendarDays/>} value={data.appointments.length} label="Appointments" color="blue"/>
      <Stat icon={<Bell/>} value={data.notifications.filter(item => !item.read).length} label="Unread notifications" color="cream"/>
      <Stat icon={<AlertTriangle/>} value={data.emergencies.filter(item => item.status !== 'Resolved').length} label="Open emergencies" color="red"/>
    </div>
    <div className="dash-grid">
      <section className="panel"><div className="panel-head"><h3>{role === 'doctor' ? 'Today’s care overview' : 'Care overview'}</h3><button className="icon-button" onClick={reload} aria-label="Refresh dashboard"><RefreshCw size={16}/></button></div>{data.appointments.length ? <div className="simple-rows">{data.appointments.slice(0, 5).map(row => <div key={row.id}><b>{row.facility || row.patient_id}</b><small>{row.date} · {row.time} · {row.status}</small></div>)}</div> : <div className="empty">No upcoming appointments</div>}</section>
      <section className="panel"><div className="panel-head"><h3>Latest notifications</h3><Bell/></div><div className="notification-list">{data.notifications.slice(0, 4).map(row => <div key={row.id}><b>{row.title}</b><p>{row.message}</p></div>)}</div>{!data.notifications.length && <div className="empty">No notifications</div>}</section>
    </div>
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>
}

function Stat({ icon, value, label, color }) {
  return <article className="stat"><div className={`stat-icon ${color}`}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div></article>
}

function Table({ title, rows, cols }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter(row => cols.some(column => String(row[column] ?? '').toLowerCase().includes(query.toLowerCase()))), [rows, cols, query])
  return <section className="panel full-panel"><div className="panel-head"><h3>{title}</h3><label className="search"><Search/><input aria-label={`Search ${title}`} placeholder="Search records…" value={query} onChange={event => setQuery(event.target.value)}/></label></div><div className="table-wrap"><table><thead><tr>{cols.map(column => <th key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{filtered.map(row => <tr key={row.id}>{cols.map(column => <td key={column}>{row[column] ?? '—'}</td>)}</tr>)}</tbody></table>{!filtered.length && <div className="empty">{query ? 'No matching records' : 'No records available'}</div>}</div></section>
}

function PatientForm({ notify, onSaved }) {
  const [form, setForm] = useState({ name: '', mobile: '', village: '', age: '', gender: 'Female', preferred_language: 'Tamil', consent: false })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const submit = async event => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await api.post('/patients', { ...form, age: Number(form.age) })
      setMessage('Patient registered successfully.')
      notify('Patient saved successfully')
      setForm({ name: '', mobile: '', village: '', age: '', gender: 'Female', preferred_language: 'Tamil', consent: false })
      onSaved()
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to register patient.')
    } finally {
      setLoading(false)
    }
  }
  return <section className="panel full-panel"><div className="panel-head"><h3>Register patient</h3></div><form className="data-form" onSubmit={submit}><label>Name<input name="name" required value={form.name} onChange={update}/></label><label>Mobile<input name="mobile" required pattern="[0-9]{10}" inputMode="numeric" value={form.mobile} onChange={update}/></label><label>Village<input name="village" required value={form.village} onChange={update}/></label><label>Age<input name="age" required min="0" max="120" type="number" value={form.age} onChange={update}/></label><label>Gender<select name="gender" value={form.gender} onChange={update}><option>Female</option><option>Male</option><option>Other</option></select></label><label>Language<select name="preferred_language" value={form.preferred_language} onChange={update}>{['Tamil','English','Hindi','Telugu','Malayalam','Kannada'].map(item => <option key={item}>{item}</option>)}</select></label><label className="check"><input name="consent" type="checkbox" checked={form.consent} onChange={update}/> Patient consent recorded</label><button className="btn primary" disabled={loading}>{loading ? 'Saving…' : 'Register patient'}</button>{message && <div className={message.includes('successfully') ? 'form-success' : 'form-error'} role="status">{message}</div>}</form></section>
}

function PatientSelect({ patients, value, onChange }) {
  return <select required value={value} onChange={onChange}><option value="">Select a patient</option>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name} · {patient.village}</option>)}</select>
}

function AppointmentForm({ patients, notify, onSaved }) {
  const [form, setForm] = useState({ patient_id: '', date: '', time: '', facility: 'Kottapalli PHC' })
  const submit = async event => {
    event.preventDefault()
    try {
      await api.post('/appointments', { ...form, doctor_name: 'TribalCare care team' })
      notify('Appointment created')
      onSaved()
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to create appointment')
    }
  }
  return <section className="panel inline-panel"><div className="panel-head"><h3>Schedule an appointment</h3></div><form className="inline-form" onSubmit={submit}><PatientSelect patients={patients} value={form.patient_id} onChange={event => setForm({ ...form, patient_id: event.target.value })}/><input aria-label="Appointment date" required type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })}/><input aria-label="Appointment time" required type="time" value={form.time} onChange={event => setForm({ ...form, time: event.target.value })}/><input aria-label="Facility" required value={form.facility} onChange={event => setForm({ ...form, facility: event.target.value })}/><button className="btn primary">Schedule</button></form></section>
}

function VaccinationForm({ patients, notify, onSaved }) {
  const [form, setForm] = useState({ patient_id: '', vaccine: '', due_date: '' })
  const submit = async event => {
    event.preventDefault()
    try {
      await api.post('/vaccinations', form)
      notify('Vaccination record added')
      onSaved()
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to save vaccination record')
    }
  }
  return <section className="panel inline-panel"><div className="panel-head"><h3>Add vaccination record</h3></div><form className="inline-form" onSubmit={submit}><PatientSelect patients={patients} value={form.patient_id} onChange={event => setForm({ ...form, patient_id: event.target.value })}/><input required aria-label="Vaccine" placeholder="Vaccine name" value={form.vaccine} onChange={event => setForm({ ...form, vaccine: event.target.value })}/><input required aria-label="Due date" type="date" value={form.due_date} onChange={event => setForm({ ...form, due_date: event.target.value })}/><button className="btn primary">Save</button></form></section>
}

function PregnancyForm({ patients, notify, onSaved }) {
  const [form, setForm] = useState({ patient_id: '', stage: 'First trimester', expected_delivery: '', next_checkup: '' })
  const submit = async event => {
    event.preventDefault()
    try {
      await api.post('/pregnancy', form)
      notify('Pregnancy record saved')
      onSaved()
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to save pregnancy record')
    }
  }
  return <section className="panel inline-panel"><div className="panel-head"><h3>Add pregnancy record</h3></div><form className="inline-form" onSubmit={submit}><PatientSelect patients={patients} value={form.patient_id} onChange={event => setForm({ ...form, patient_id: event.target.value })}/><select aria-label="Pregnancy stage" value={form.stage} onChange={event => setForm({ ...form, stage: event.target.value })}><option>First trimester</option><option>Second trimester</option><option>Third trimester</option></select><input required aria-label="Expected delivery" type="date" value={form.expected_delivery} onChange={event => setForm({ ...form, expected_delivery: event.target.value })}/><input aria-label="Next checkup" type="date" value={form.next_checkup} onChange={event => setForm({ ...form, next_checkup: event.target.value })}/><button className="btn primary">Save</button></form></section>
}

function VisitForm({ patients, notify, onSaved }) {
  const [form, setForm] = useState({ patient_id: '', date: '', time: '', purpose: '' })
  const submit = async event => {
    event.preventDefault()
    try {
      await api.post('/home-visits', { ...form, status: 'Pending' })
      notify('Home visit scheduled')
      onSaved()
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to schedule home visit')
    }
  }
  return <section className="panel inline-panel"><div className="panel-head"><h3>Schedule a home visit</h3></div><form className="inline-form" onSubmit={submit}><PatientSelect patients={patients} value={form.patient_id} onChange={event => setForm({ ...form, patient_id: event.target.value })}/><input required aria-label="Visit date" type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })}/><input required aria-label="Visit time" type="time" value={form.time} onChange={event => setForm({ ...form, time: event.target.value })}/><input required aria-label="Visit purpose" placeholder="Purpose" value={form.purpose} onChange={event => setForm({ ...form, purpose: event.target.value })}/><button className="btn primary">Schedule</button></form></section>
}

function Emergency({ rows, notify, onUpdated }) {
  const update = async (id, status) => {
    try {
      await api.put(`/emergency/${id}/status`, { status })
      notify(`Emergency marked ${status}`)
      onUpdated()
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to update emergency')
    }
  }
  return <section className="panel full-panel"><div className="panel-head"><h3>Emergency requests</h3><span className="priority"><AlertTriangle/> High priority</span></div>{rows.length ? <div className="emergency-list">{rows.map(item => <article key={item.id}><div><b>{item.patient_name || item.patient_mobile}</b><small>{item.patient_mobile} · {item.location || 'Location unavailable'}</small></div><strong>{item.status}</strong><div className="action-row"><button onClick={() => update(item.id, 'Acknowledged')}>Acknowledge</button><button onClick={() => update(item.id, 'Callback Initiated')}>Callback</button><button onClick={() => update(item.id, 'Resolved')}>Resolve</button></div></article>)}</div> : <div className="empty">No emergency requests</div>}</section>
}

function SMSRequests({ rows, notify, onUpdated }) {
  const [busy, setBusy] = useState('')
  const update = async (id, status) => {
    setBusy(id)
    try {
      await api.put(`/sms/${id}/status`, { status })
      notify(`Request marked ${status}`)
      onUpdated()
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to update request')
    } finally {
      setBusy('')
    }
  }
  return <section className="panel full-panel"><div className="panel-head"><h3>Assigned patient requests</h3></div>{rows.length ? <div className="sms-request-list">{rows.map(item => <article key={item.id}><div><b>{item.keyword} · {item.mobile}</b><p>{item.response}</p><small>{item.channel || 'SMS'} · {item.status}</small></div><div className="action-row"><button disabled={busy === item.id} onClick={() => update(item.id, 'Acknowledged')}>Acknowledge</button><button disabled={busy === item.id} onClick={() => update(item.id, 'In progress')}>In progress</button><button disabled={busy === item.id} onClick={() => update(item.id, 'Resolved')}>Resolve</button></div></article>)}</div> : <div className="empty">No requests assigned to you</div>}</section>
}

function Voice({ rows }) {
  const [audioUrls, setAudioUrls] = useState({})
  const [loadingId, setLoadingId] = useState('')
  const [error, setError] = useState('')
  const urls = useRef(new Set())
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), [])
  const loadRecording = async id => {
    setLoadingId(id)
    setError('')
    try {
      const response = await api.get(`/voice/messages/${id}/audio`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      urls.current.add(url)
      setAudioUrls(current => ({ ...current, [id]: url }))
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load original recording.')
    } finally {
      setLoadingId('')
    }
  }
  return <section className="panel full-panel"><div className="panel-head"><h3>Patient voice messages</h3></div>{error && <p className="form-error">{error}</p>}{rows.length ? <div className="voice-list">{rows.map(item => <article key={item.id}><div className="play"><Mic/></div><div><b>{item.patient_mobile}</b><p>{item.original_text || 'Audio received. Transcription is pending review.'}</p><small>{item.language_detected || 'Language not detected'} · {item.status || 'Needs review'} · {Math.ceil((item.size || 0) / 1024)} KB</small>{audioUrls[item.id] ? <audio controls src={audioUrls[item.id]}>Audio playback is not supported.</audio> : <button className="btn secondary recording-play" disabled={!item.size || loadingId === item.id} onClick={() => loadRecording(item.id)}>{loadingId === item.id ? 'Loading…' : 'Play original recording'}</button>}</div></article>)}</div> : <div className="empty">No voice messages</div>}</section>
}

function Translation() {
  const [text, setText] = useState('')
  const [target, setTarget] = useState('English')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const run = async () => {
    if (!text.trim()) return setError('Enter the patient’s message first.')
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/voice/translate', { text, target_language: target })
      setResult(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Translation service unavailable.')
    } finally {
      setLoading(false)
    }
  }
  return <section className="panel full-panel"><div className="panel-head"><h3>Translation review</h3><span className="demo-badge">REQUIRES HUMAN REVIEW</span></div><div className="translation"><textarea placeholder="Enter patient message…" value={text} onChange={event => setText(event.target.value)}/><select value={target} onChange={event => setTarget(event.target.value)}>{['English','Tamil','Hindi','Telugu','Malayalam','Kannada'].map(value => <option key={value}>{value}</option>)}</select><button className="btn primary" onClick={run} disabled={loading}><Languages/> {loading ? 'Processing…' : 'Translate'}</button>{error && <p className="form-error">{error}</p>}{result && <div className="translation-result"><b>Translated text</b><p>{result.translated_text}</p><small>Human verification required{result.demo_mode ? ' · Demo output' : ''}</small></div>}</div></section>
}

function Response({ patients, notify, onSaved }) {
  const [form, setForm] = useState({ patient_id: '', response_text: '', language: 'English' })
  const submit = async event => {
    event.preventDefault()
    try {
      await api.post('/doctor-responses', form)
      notify('Care response saved and routed')
      setForm({ ...form, response_text: '' })
      onSaved()
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to send response')
    }
  }
  return <section className="panel full-panel"><div className="panel-head"><h3>Send a patient response</h3></div><form className="data-form" onSubmit={submit}><label>Patient<PatientSelect patients={patients} value={form.patient_id} onChange={event => setForm({ ...form, patient_id: event.target.value })}/></label><label>Response language<select value={form.language} onChange={event => setForm({ ...form, language: event.target.value })}>{['English','Tamil','Hindi','Telugu','Malayalam','Kannada'].map(value => <option key={value}>{value}</option>)}</select></label><label>Response<textarea required value={form.response_text} onChange={event => setForm({ ...form, response_text: event.target.value })}/></label><button className="btn primary">Save and send response</button></form></section>
}

function Notifications({ rows, onChanged }) {
  const [error, setError] = useState('')
  const markRead = async id => {
    setError('')
    try {
      await api.put(`/notifications/${id}/read`)
      onChanged()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to update notification.')
    }
  }
  return <section className="panel full-panel"><div className="panel-head"><h3>Notifications</h3></div>{error && <p className="form-error">{error}</p>}<div className="notification-list large">{rows.map(item => <div key={item.id}><b>{item.title}</b><p>{item.message}</p><small>{item.read ? 'Read' : 'Unread'}</small>{!item.read && <button className="text-button" onClick={() => markRead(item.id)}><Check size={15}/> Mark as read</button>}</div>)}</div>{!rows.length && <div className="empty">No notifications</div>}</section>
}

function Profile({ user }) {
  return <section className="panel profile-panel"><div className="profile-avatar">{(user.name || 'TC').slice(0, 2).toUpperCase()}</div><h2>{user.name}</h2><p>{user.email}</p><span className="status">{user.role}</span>{user.village && <p>Assigned area · {user.village}</p>}<p>Your account permissions and dashboard are based on your verified role.</p></section>
}

function HealthAwareness() {
  return <section className="panel full-panel"><div className="panel-head"><h3>Health awareness</h3></div><div className="awareness-grid"><article><Baby/><b>Child health</b><p>Keep vaccination visits on schedule and bring the child health record to each appointment.</p></article><article><HeartPulse/><b>Pregnancy care</b><p>Attend antenatal checkups and contact a care worker if urgent concerns arise.</p></article><article><Phone/><b>Emergency support</b><p>Use HELP by SMS or the emergency option on the phone service to alert the care team.</p></article></div></section>
}

export default function App() {
  return <BrowserRouter><Routes><Route path="/" element={<Landing/>}/><Route path="/login/:role" element={<LoginPage/>}/><Route path="/doctor" element={<Protected role="doctor"><Dashboard/></Protected>}/><Route path="/asha" element={<Protected role="asha"><Dashboard/></Protected>}/><Route path="/admin" element={<Protected role="admin"><Dashboard/></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter>
}
