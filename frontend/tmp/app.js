import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { HeartPulse, ShieldCheck, Phone, Users, Stethoscope, Bell, CalendarDays, Baby, House, AlertTriangle, LogOut, Menu, X, Search, Mic, Send, Languages, Activity, Wifi, WifiOff } from "lucide-react";
import "./App.css";
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("tribalcare_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
function Logo({ light = false }) {
  return /* @__PURE__ */ React.createElement(Link, { className: `logo ${light ? "light" : ""}`, to: "/" }, /* @__PURE__ */ React.createElement("span", { className: "logo-mark" }, /* @__PURE__ */ React.createElement(HeartPulse, { size: 22 })), /* @__PURE__ */ React.createElement("span", null, "TribalCare ", /* @__PURE__ */ React.createElement("b", null, "AI 2.0")));
}
function Navbar() {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ React.createElement("header", { className: "nav" }, /* @__PURE__ */ React.createElement(Logo, null), /* @__PURE__ */ React.createElement("button", { className: "menu-btn", onClick: () => setOpen(!open) }, open ? /* @__PURE__ */ React.createElement(X, null) : /* @__PURE__ */ React.createElement(Menu, null)), /* @__PURE__ */ React.createElement("nav", { className: open ? "open" : "" }, /* @__PURE__ */ React.createElement("a", { href: "#mission" }, "Mission"), /* @__PURE__ */ React.createElement("a", { href: "#services" }, "Services"), /* @__PURE__ */ React.createElement("a", { href: "#ivr" }, "IVR Demo"), /* @__PURE__ */ React.createElement(Link, { className: "nav-login", to: "/login/doctor" }, "Doctor Login"), /* @__PURE__ */ React.createElement(Link, { className: "nav-login asha", to: "/login/asha" }, "ASHA Login")));
}
function IVR() {
  const [screen, setScreen] = useState("Welcome to TribalCare AI.\nPress Call to begin.");
  const [language, setLanguage] = useState("");
  const [call, setCall] = useState(false);
  const [sms, setSms] = useState("HELP");
  const [mobile, setMobile] = useState("9876543210");
  const [result, setResult] = useState("");
  const press = (k) => {
    if (!call) return;
    if (!language) {
      const x = { 1: "Tamil", 2: "English", 3: "Hindi", 4: "Other" }[k];
      if (x) {
        setLanguage(x);
        setScreen(`${x} selected.
1 Emergency  2 Appointment
3 Pregnancy  4 Vaccination
5 Health info  6 ASHA worker
7 Record problem  8 Callback`);
      }
    } else {
      const x = { 1: "Emergency request created. ASHA alerted.", 2: "Appointment: 2 days, 10:30 AM, Kottapalli PHC.", 3: "Pregnancy follow-up scheduled for 10 December.", 4: "Next vaccine: Polio Booster, 05 December.", 5: "For severe symptoms, contact your ASHA worker.", 6: "Meena Kumari \u2014 assigned ASHA worker.", 7: "Voice recording prompt opened.", 8: "Callback requested." }[k];
      setScreen(x || "Please select 1\u20138.");
    }
  };
  const send = async () => {
    try {
      const r = await api.post("/sms/process", { mobile, keyword: sms });
      setResult(r.data.response);
    } catch (e) {
      setResult("SMS service unavailable. Demo mode response: " + sms);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { id: "ivr", className: "ivr-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "phone" }, /* @__PURE__ */ React.createElement("div", { className: "phone-speaker" }), /* @__PURE__ */ React.createElement("div", { className: "phone-screen" }, /* @__PURE__ */ React.createElement("div", { className: "screen-top" }, /* @__PURE__ */ React.createElement("span", null, language || "TribalCare"), /* @__PURE__ */ React.createElement("span", null, "\u2022\u2022\u2022")), /* @__PURE__ */ React.createElement("p", null, screen)), /* @__PURE__ */ React.createElement("div", { className: "keypad" }, ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => press(k) }, /* @__PURE__ */ React.createElement("b", null, k)))), /* @__PURE__ */ React.createElement("div", { className: "call-controls" }, /* @__PURE__ */ React.createElement("button", { className: "call", onClick: () => {
    setCall(true);
    setLanguage("");
    setScreen("Welcome to TribalCare AI.\n1 Tamil  2 English\n3 Hindi  4 Other");
  } }, /* @__PURE__ */ React.createElement(Phone, null)), /* @__PURE__ */ React.createElement("button", { className: "end", onClick: () => {
    setCall(false);
    setScreen("Call ended. Press call to try again.");
  } }, /* @__PURE__ */ React.createElement(Phone, null)))), /* @__PURE__ */ React.createElement("div", { className: "sms-panel" }, /* @__PURE__ */ React.createElement("h3", null, /* @__PURE__ */ React.createElement(Send, { size: 18 }), " SMS simulator"), /* @__PURE__ */ React.createElement("label", null, "Mobile number", /* @__PURE__ */ React.createElement("input", { value: mobile, onChange: (e) => setMobile(e.target.value) })), /* @__PURE__ */ React.createElement("label", null, "Keyword", /* @__PURE__ */ React.createElement("select", { value: sms, onChange: (e) => setSms(e.target.value) }, ["HELP", "APPT", "VACCINE", "WORKER", "CALL"].map((x) => /* @__PURE__ */ React.createElement("option", { key: x }, x)))), /* @__PURE__ */ React.createElement("button", { className: "btn primary full", onClick: send }, "Send keyword"), result && /* @__PURE__ */ React.createElement("div", { className: "sms-result" }, result)));
}
function Landing() {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Navbar, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("div", { className: "hero-copy" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, /* @__PURE__ */ React.createElement(Activity, { size: 16 }), " Inclusive healthcare technology"), /* @__PURE__ */ React.createElement("h1", null, "Healthcare that reaches ", /* @__PURE__ */ React.createElement("em", null, "every voice.")), /* @__PURE__ */ React.createElement("p", null, "TribalCare AI 2.0 connects remote communities with doctors and ASHA workers through multilingual voice, SMS and phone access."), /* @__PURE__ */ React.createElement("div", { className: "hero-actions" }, /* @__PURE__ */ React.createElement("a", { className: "btn primary", href: "#ivr" }, /* @__PURE__ */ React.createElement(Phone, { size: 18 }), " Try Phone Demo"), /* @__PURE__ */ React.createElement("a", { className: "btn secondary", href: "#services" }, "Explore services")), /* @__PURE__ */ React.createElement("div", { className: "trust" }, /* @__PURE__ */ React.createElement(ShieldCheck, { size: 18 }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Consent-first"), /* @__PURE__ */ React.createElement("br", null), "Secure & role-based"))), /* @__PURE__ */ React.createElement("div", { className: "hero-art" }, /* @__PURE__ */ React.createElement("div", { className: "pulse-ring" }, /* @__PURE__ */ React.createElement(HeartPulse, { size: 78 })), /* @__PURE__ */ React.createElement("div", { className: "float-card card-a" }, /* @__PURE__ */ React.createElement(Languages, null), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "3 languages"), /* @__PURE__ */ React.createElement("small", null, "Voice assistance"))), /* @__PURE__ */ React.createElement("div", { className: "float-card card-b" }, /* @__PURE__ */ React.createElement(Users, null), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Community care"), /* @__PURE__ */ React.createElement("small", null, "ASHA connected"))))), /* @__PURE__ */ React.createElement("section", { id: "mission", className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "section-heading" }, /* @__PURE__ */ React.createElement("span", null, "OUR MISSION"), /* @__PURE__ */ React.createElement("h2", null, "No distance should decide access to care."), /* @__PURE__ */ React.createElement("p", null, "We combine familiar phone technology with connected health teams to make essential services available without internet or smartphones."))), /* @__PURE__ */ React.createElement("section", { id: "services", className: "section soft" }, /* @__PURE__ */ React.createElement("div", { className: "section-heading" }, /* @__PURE__ */ React.createElement("span", null, "HOW IT WORKS"), /* @__PURE__ */ React.createElement("h2", null, "One platform. Three connected roles.")), /* @__PURE__ */ React.createElement("div", { className: "role-grid" }, /* @__PURE__ */ React.createElement("article", { className: "role-card" }, /* @__PURE__ */ React.createElement("div", { className: "role-icon" }, /* @__PURE__ */ React.createElement(Phone, null)), /* @__PURE__ */ React.createElement("h3", null, "Patients"), /* @__PURE__ */ React.createElement("p", null, "Call or send SMS from any keypad phone. Record health problems and receive reminders.")), /* @__PURE__ */ React.createElement("article", { className: "role-card" }, /* @__PURE__ */ React.createElement("div", { className: "role-icon" }, /* @__PURE__ */ React.createElement(Stethoscope, null)), /* @__PURE__ */ React.createElement("h3", null, "Doctors"), /* @__PURE__ */ React.createElement("p", null, "Review voice messages, translate concerns and respond to patient requests.")), /* @__PURE__ */ React.createElement("article", { className: "role-card" }, /* @__PURE__ */ React.createElement("div", { className: "role-icon" }, /* @__PURE__ */ React.createElement(House, null)), /* @__PURE__ */ React.createElement("h3", null, "ASHA Workers"), /* @__PURE__ */ React.createElement("p", null, "Register patients, track care, visit homes and respond to emergencies offline.")))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "split" }, /* @__PURE__ */ React.createElement(IVR, null), /* @__PURE__ */ React.createElement("div", { className: "ivr-info" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "PATIENT ACCESS"), /* @__PURE__ */ React.createElement("h2", null, "Designed for the simplest phone."), /* @__PURE__ */ React.createElement("p", null, "No apps. No internet. Patients use a familiar keypad and central healthcare number."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(Phone, null), " Emergency help & callback"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(CalendarDays, null), " Appointment information"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(Baby, null), " Pregnancy & vaccination support"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(Languages, null), " Tamil, English, Hindi & more")))))), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement(Logo, { light: true }), /* @__PURE__ */ React.createElement("p", null, "Connected, consent-based healthcare for remote communities."), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Emergency"), /* @__PURE__ */ React.createElement("p", null, "This prototype coordinates care. It does not dispatch ambulances."))));
}
function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(role === "doctor" ? "doctor@tribalcare.demo" : "asha@tribalcare.demo");
  const [password, setPassword] = useState(role === "doctor" ? "Doctor@123" : "Asha@123");
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const r = await api.post("/auth/login", { email, password });
      if (r.data.user.role !== role) {
        setError(`This account is not a ${role} account.`);
        return;
      }
      localStorage.setItem("tribalcare_token", r.data.access_token);
      localStorage.setItem("tribalcare_user", JSON.stringify(r.data.user));
      navigate(role === "doctor" ? "/doctor" : "/asha");
    } catch (e2) {
      setError(e2.response?.data?.detail || "Login failed. Ensure the backend is running.");
    }
  };
  return /* @__PURE__ */ React.createElement("main", { className: "login-page" }, /* @__PURE__ */ React.createElement(Link, { to: "/", className: "back" }, "\u2190 Back to website"), /* @__PURE__ */ React.createElement("div", { className: "login-card" }, /* @__PURE__ */ React.createElement(Logo, null), /* @__PURE__ */ React.createElement("div", { className: "login-icon" }, role === "doctor" ? /* @__PURE__ */ React.createElement(Stethoscope, null) : /* @__PURE__ */ React.createElement(House, null)), /* @__PURE__ */ React.createElement("h1", null, role === "doctor" ? "Doctor" : "ASHA Worker", " Login"), /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("label", null, "Email address", /* @__PURE__ */ React.createElement("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })), /* @__PURE__ */ React.createElement("label", null, "Password", /* @__PURE__ */ React.createElement("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true })), error && /* @__PURE__ */ React.createElement("div", { className: "form-error" }, error), /* @__PURE__ */ React.createElement("button", { className: "btn primary full" }, "Sign in")), /* @__PURE__ */ React.createElement("div", { className: "demo-credentials" }, /* @__PURE__ */ React.createElement("b", null, "Demo credentials"), /* @__PURE__ */ React.createElement("span", null, role === "doctor" ? /* @__PURE__ */ React.createElement(React.Fragment, null, "doctor@tribalcare.demo \xB7 Doctor@123") : /* @__PURE__ */ React.createElement(React.Fragment, null, "asha@tribalcare.demo \xB7 Asha@123")))));
}
function Protected({ role, children }) {
  const u = JSON.parse(localStorage.getItem("tribalcare_user") || "null");
  return u?.role === role ? children : /* @__PURE__ */ React.createElement(Navigate, { to: `/login/${role}` });
}
function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const u = JSON.parse(localStorage.getItem("tribalcare_user") || "{}");
  const [tab, setTab] = useState(role === "doctor" ? "Overview" : "Dashboard Overview");
  const [collapsed, setCollapsed] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  const tabs = role === "doctor" ? ["Overview", "Patient Records", "Incoming Voice Messages", "AI Translation", "Appointments", "Emergency Requests", "Doctor Responses", "Health Reports", "Notifications", "Profile"] : ["Dashboard Overview", "Register Patient", "My Patients", "Pregnancy Tracking", "Child Healthcare", "Vaccination Management", "Home Visit Management", "Appointments", "Emergency Alerts", "Follow-up Reminders", "Health Awareness", "Notifications", "Profile"];
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "dash" }, /* @__PURE__ */ React.createElement("aside", { className: collapsed ? "collapsed" : "" }, /* @__PURE__ */ React.createElement("div", { className: "dash-brand" }, /* @__PURE__ */ React.createElement(HeartPulse, null), /* @__PURE__ */ React.createElement("b", null, "TribalCare")), /* @__PURE__ */ React.createElement("button", { className: "collapse", onClick: () => setCollapsed(!collapsed) }, /* @__PURE__ */ React.createElement(Menu, null)), /* @__PURE__ */ React.createElement("nav", null, tabs.map((t) => /* @__PURE__ */ React.createElement("button", { key: t, className: tab === t ? "active" : "", onClick: () => setTab(t) }, /* @__PURE__ */ React.createElement(Activity, null), /* @__PURE__ */ React.createElement("span", null, t)))), /* @__PURE__ */ React.createElement("button", { className: "logout", onClick: logout }, /* @__PURE__ */ React.createElement(LogOut, null), /* @__PURE__ */ React.createElement("span", null, "Logout"))), /* @__PURE__ */ React.createElement("div", { className: "dash-main" }, /* @__PURE__ */ React.createElement("header", { className: "dash-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, tab), /* @__PURE__ */ React.createElement("span", null, u.name || "Healthcare team")), /* @__PURE__ */ React.createElement("div", { className: `status ${online ? "" : "offline"}` }, online ? /* @__PURE__ */ React.createElement(Wifi, null) : /* @__PURE__ */ React.createElement(WifiOff, null), online ? "Online" : "Offline"), /* @__PURE__ */ React.createElement("div", { className: "avatar" }, (u.name || "TC").slice(0, 2).toUpperCase())), /* @__PURE__ */ React.createElement(DashboardContent, { role, tab })));
}
function Stat({ icon, value, label, color }) {
  return /* @__PURE__ */ React.createElement("article", { className: "stat" }, /* @__PURE__ */ React.createElement("div", { className: `stat-icon ${color}` }, icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, value), /* @__PURE__ */ React.createElement("span", null, label)));
}
function DashboardContent({ role, tab }) {
  const [d, setD] = useState({ patients: [], appointments: [], pregnancy: [], vaccinations: [], visits: [], emergencies: [], voice: [], notifications: [] });
  const [toast, setToast] = useState("");
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3e3);
  };
  useEffect(() => {
    Promise.allSettled(["/patients", "/appointments", "/pregnancy", "/vaccinations", "/home-visits", "/emergency", "/voice/messages", "/notifications"].map((p) => api.get(p))).then((rs) => setD({ patients: rs[0].value?.data || [], appointments: rs[1].value?.data || [], pregnancy: rs[2].value?.data || [], vaccinations: rs[3].value?.data || [], visits: rs[4].value?.data || [], emergencies: rs[5].value?.data || [], voice: rs[6].value?.data || [], notifications: rs[7].value?.data || [] }));
  }, [tab]);
  if (tab === "Register Patient") return /* @__PURE__ */ React.createElement(PatientForm, { notify });
  if (tab === "Appointments" || tab === "My Patients" || tab === "Patient Records") return tab === "Appointments" ? /* @__PURE__ */ React.createElement(Table, { title: "Appointments", rows: d.appointments, cols: ["patient_id", "date", "time", "facility", "status"] }) : /* @__PURE__ */ React.createElement(Table, { title: "Patient records", rows: d.patients, cols: ["id", "name", "mobile", "village", "preferred_language"] });
  if (tab.includes("Emergency")) return /* @__PURE__ */ React.createElement(Emergency, { rows: d.emergencies, notify });
  if (tab === "Vaccination Management" || tab === "Child Healthcare") return /* @__PURE__ */ React.createElement(Vaccinations, { rows: d.vaccinations, notify });
  if (tab === "Home Visit Management") return /* @__PURE__ */ React.createElement(Visits, { rows: d.visits, notify });
  if (tab === "Pregnancy Tracking") return /* @__PURE__ */ React.createElement(Pregnancy, { rows: d.pregnancy, notify });
  if (tab === "Incoming Voice Messages") return /* @__PURE__ */ React.createElement(Voice, { rows: d.voice });
  if (tab === "AI Translation") return /* @__PURE__ */ React.createElement(Translation, null);
  if (tab === "Doctor Responses") return /* @__PURE__ */ React.createElement(Response, { notify });
  if (tab === "Notifications") return /* @__PURE__ */ React.createElement(Notifications, { rows: d.notifications });
  return /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement("div", { className: "stat-grid" }, /* @__PURE__ */ React.createElement(Stat, { icon: /* @__PURE__ */ React.createElement(Users, null), value: d.patients.length, label: "Patients", color: "green" }), /* @__PURE__ */ React.createElement(Stat, { icon: /* @__PURE__ */ React.createElement(CalendarDays, null), value: d.appointments.length, label: "Appointments", color: "blue" }), /* @__PURE__ */ React.createElement(Stat, { icon: /* @__PURE__ */ React.createElement(Baby, null), value: d.pregnancy.length, label: "Pregnancies", color: "cream" }), /* @__PURE__ */ React.createElement(Stat, { icon: /* @__PURE__ */ React.createElement(AlertTriangle, null), value: d.emergencies.filter((e) => e.status !== "Resolved").length, label: "Emergencies", color: "red" })), /* @__PURE__ */ React.createElement("div", { className: "dash-grid" }, /* @__PURE__ */ React.createElement("section", { className: "panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Care overview")), d.appointments.length ? /* @__PURE__ */ React.createElement("div", { className: "simple-rows" }, d.appointments.slice(0, 5).map((r) => /* @__PURE__ */ React.createElement("div", { key: r.id }, /* @__PURE__ */ React.createElement("b", null, r.facility || r.patient_id), /* @__PURE__ */ React.createElement("small", null, r.date, " \xB7 ", r.time)))) : /* @__PURE__ */ React.createElement("div", { className: "empty" }, "No upcoming records")), /* @__PURE__ */ React.createElement("section", { className: "panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Notifications"), /* @__PURE__ */ React.createElement(Bell, null)), /* @__PURE__ */ React.createElement("div", { className: "notification-list" }, d.notifications.slice(0, 4).map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id }, /* @__PURE__ */ React.createElement("b", null, n.title), /* @__PURE__ */ React.createElement("p", null, n.message)))))), toast ? /* @__PURE__ */ React.createElement("div", { className: "toast" }, toast) : null);
}
function Table({ title, rows, cols }) {
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, title), /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Search, null), /* @__PURE__ */ React.createElement("input", { placeholder: "Search..." }))), /* @__PURE__ */ React.createElement("div", { className: "table-wrap" }, /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, cols.map((c) => /* @__PURE__ */ React.createElement("th", { key: c }, c.replace("_", " "))))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.id }, cols.map((c) => /* @__PURE__ */ React.createElement("td", { key: c }, r[c] || "\u2014")))))), !rows.length && /* @__PURE__ */ React.createElement("div", { className: "empty" }, "No records found")));
}
function PatientForm({ notify }) {
  const [f, setF] = useState({ name: "", mobile: "", village: "", age: "", gender: "Female", preferred_language: "Tamil", consent: false });
  const [msg, setMsg] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/patients", { ...f, age: Number(f.age) });
      setMsg("Patient registered successfully");
      notify("Patient saved successfully");
      setF({ name: "", mobile: "", village: "", age: "", gender: "Female", preferred_language: "Tamil", consent: false });
    } catch (e2) {
      setMsg(e2.response?.data?.detail || "Unable to register patient");
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Register patient")), /* @__PURE__ */ React.createElement("form", { className: "data-form", onSubmit: submit }, /* @__PURE__ */ React.createElement("label", null, "Name", /* @__PURE__ */ React.createElement("input", { required: true, value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }) })), /* @__PURE__ */ React.createElement("label", null, "Mobile", /* @__PURE__ */ React.createElement("input", { required: true, pattern: "[0-9]{10}", value: f.mobile, onChange: (e) => setF({ ...f, mobile: e.target.value }) })), /* @__PURE__ */ React.createElement("label", null, "Village", /* @__PURE__ */ React.createElement("input", { required: true, value: f.village, onChange: (e) => setF({ ...f, village: e.target.value }) })), /* @__PURE__ */ React.createElement("label", null, "Age", /* @__PURE__ */ React.createElement("input", { required: true, type: "number", value: f.age, onChange: (e) => setF({ ...f, age: e.target.value }) })), /* @__PURE__ */ React.createElement("label", null, "Gender", /* @__PURE__ */ React.createElement("select", { value: f.gender, onChange: (e) => setF({ ...f, gender: e.target.value }) }, /* @__PURE__ */ React.createElement("option", null, "Female"), /* @__PURE__ */ React.createElement("option", null, "Male"), /* @__PURE__ */ React.createElement("option", null, "Other"))), /* @__PURE__ */ React.createElement("label", null, "Language", /* @__PURE__ */ React.createElement("select", { value: f.preferred_language, onChange: (e) => setF({ ...f, preferred_language: e.target.value }) }, /* @__PURE__ */ React.createElement("option", null, "Tamil"), /* @__PURE__ */ React.createElement("option", null, "English"), /* @__PURE__ */ React.createElement("option", null, "Hindi"))), /* @__PURE__ */ React.createElement("label", { className: "check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: f.consent, onChange: (e) => setF({ ...f, consent: e.target.checked }) }), " Patient consent recorded"), /* @__PURE__ */ React.createElement("button", { className: "btn primary" }, "Register patient"), msg && /* @__PURE__ */ React.createElement("div", { className: "form-success" }, msg)));
}
function Emergency({ rows, notify }) {
  const update = async (id, status) => {
    try {
      await api.put(`/emergency/${id}/status`, { status });
      notify(`Emergency marked ${status}`);
    } catch (e) {
      notify("Unable to update emergency");
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Emergency requests"), /* @__PURE__ */ React.createElement("span", { className: "priority" }, /* @__PURE__ */ React.createElement(AlertTriangle, null), " High priority")), rows.length ? /* @__PURE__ */ React.createElement("div", { className: "emergency-list" }, rows.map((e) => /* @__PURE__ */ React.createElement("article", { key: e.id }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, e.patient_name || e.patient_mobile), /* @__PURE__ */ React.createElement("small", null, e.patient_mobile, " \xB7 ", e.location || "Location unavailable")), /* @__PURE__ */ React.createElement("strong", null, e.status), /* @__PURE__ */ React.createElement("div", { className: "action-row" }, /* @__PURE__ */ React.createElement("button", { onClick: () => update(e.id, "Acknowledged") }, "Acknowledge"), /* @__PURE__ */ React.createElement("button", { onClick: () => update(e.id, "Callback Initiated") }, "Callback"), /* @__PURE__ */ React.createElement("button", { onClick: () => update(e.id, "Resolved") }, "Resolve"))))) : /* @__PURE__ */ React.createElement("div", { className: "empty" }, "No emergency requests"));
}
function Vaccinations({ rows, notify }) {
  const [v, setV] = useState({ patient_id: "", vaccine: "", due_date: "" });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/vaccinations", v);
      notify("Vaccination record added");
    } catch (e2) {
      notify("Unable to save record");
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Vaccinations")), /* @__PURE__ */ React.createElement("form", { className: "inline-form", onSubmit: submit }, /* @__PURE__ */ React.createElement("input", { required: true, placeholder: "Patient ID", value: v.patient_id, onChange: (e) => setV({ ...v, patient_id: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { required: true, placeholder: "Vaccine", value: v.vaccine, onChange: (e) => setV({ ...v, vaccine: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { required: true, type: "date", value: v.due_date, onChange: (e) => setV({ ...v, due_date: e.target.value }) }), /* @__PURE__ */ React.createElement("button", { className: "btn primary" }, "Add")), /* @__PURE__ */ React.createElement(Table, { title: "Vaccination schedule", rows, cols: ["patient_id", "vaccine", "due_date", "status"] }));
}
function Visits({ rows, notify }) {
  const [v, setV] = useState({ patient_id: "", date: "", time: "", purpose: "" });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/home-visits", { ...v, status: "Pending" });
      notify("Visit scheduled");
    } catch (e2) {
      notify("Unable to schedule");
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Home visits")), /* @__PURE__ */ React.createElement("form", { className: "inline-form", onSubmit: submit }, /* @__PURE__ */ React.createElement("input", { required: true, placeholder: "Patient ID", value: v.patient_id, onChange: (e) => setV({ ...v, patient_id: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { required: true, type: "date", value: v.date, onChange: (e) => setV({ ...v, date: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { required: true, type: "time", value: v.time, onChange: (e) => setV({ ...v, time: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { required: true, placeholder: "Purpose", value: v.purpose, onChange: (e) => setV({ ...v, purpose: e.target.value }) }), /* @__PURE__ */ React.createElement("button", { className: "btn primary" }, "Schedule")), /* @__PURE__ */ React.createElement(Table, { title: "Visit history", rows, cols: ["patient_id", "date", "time", "purpose", "status"] }));
}
function Pregnancy({ rows, notify }) {
  const [p, setP] = useState({ patient_id: "", stage: "First trimester", expected_delivery: "", next_checkup: "" });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pregnancy", p);
      notify("Pregnancy record saved");
    } catch (e2) {
      notify("Unable to save");
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Pregnancy tracking")), /* @__PURE__ */ React.createElement("form", { className: "inline-form", onSubmit: submit }, /* @__PURE__ */ React.createElement("input", { required: true, placeholder: "Patient ID", value: p.patient_id, onChange: (e) => setP({ ...p, patient_id: e.target.value }) }), /* @__PURE__ */ React.createElement("select", { value: p.stage, onChange: (e) => setP({ ...p, stage: e.target.value }) }, /* @__PURE__ */ React.createElement("option", null, "First trimester"), /* @__PURE__ */ React.createElement("option", null, "Second trimester"), /* @__PURE__ */ React.createElement("option", null, "Third trimester")), /* @__PURE__ */ React.createElement("input", { required: true, type: "date", value: p.expected_delivery, onChange: (e) => setP({ ...p, expected_delivery: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { type: "date", value: p.next_checkup, onChange: (e) => setP({ ...p, next_checkup: e.target.value }) }), /* @__PURE__ */ React.createElement("button", { className: "btn primary" }, "Save")), /* @__PURE__ */ React.createElement(Table, { title: "Pregnancy records", rows, cols: ["patient_id", "stage", "expected_delivery", "next_checkup", "status"] }));
}
function Voice({ rows }) {
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Incoming voice messages")), rows.length ? /* @__PURE__ */ React.createElement("div", { className: "voice-list" }, rows.map((v) => /* @__PURE__ */ React.createElement("article", { key: v.id }, /* @__PURE__ */ React.createElement("div", { className: "play" }, /* @__PURE__ */ React.createElement(Mic, null)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, v.patient_mobile), /* @__PURE__ */ React.createElement("p", null, v.original_text), /* @__PURE__ */ React.createElement("small", null, "Demo transcription \xB7 review required"))))) : /* @__PURE__ */ React.createElement("div", { className: "empty" }, "No voice messages"));
}
function Translation() {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("English");
  const [result, setResult] = useState(null);
  const run = async () => {
    const r = await api.post("/voice/translate", { text, target_language: target });
    setResult(r.data);
  };
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "AI Translation"), /* @__PURE__ */ React.createElement("span", { className: "demo-badge" }, "Demo mode")), /* @__PURE__ */ React.createElement("div", { className: "translation" }, /* @__PURE__ */ React.createElement("textarea", { placeholder: "Enter patient message\u2026", value: text, onChange: (e) => setText(e.target.value) }), /* @__PURE__ */ React.createElement("select", { value: target, onChange: (e) => setTarget(e.target.value) }, /* @__PURE__ */ React.createElement("option", null, "English"), /* @__PURE__ */ React.createElement("option", null, "Tamil"), /* @__PURE__ */ React.createElement("option", null, "Hindi")), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: run }, /* @__PURE__ */ React.createElement(Languages, null), " Translate"), result && /* @__PURE__ */ React.createElement("div", { className: "translation-result" }, /* @__PURE__ */ React.createElement("b", null, "Translated text"), /* @__PURE__ */ React.createElement("p", null, result.translated_text), /* @__PURE__ */ React.createElement("small", null, "Confidence unavailable \xB7 Human verification required"))));
}
function Response({ notify }) {
  const [r, setR] = useState({ patient_id: "", response_text: "", language: "English" });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/doctor-responses", r);
      notify("Response sent");
    } catch (e2) {
      notify("Unable to send response");
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Doctor response")), /* @__PURE__ */ React.createElement("form", { className: "data-form", onSubmit: submit }, /* @__PURE__ */ React.createElement("label", null, "Patient ID", /* @__PURE__ */ React.createElement("input", { required: true, value: r.patient_id, onChange: (e) => setR({ ...r, patient_id: e.target.value }) })), /* @__PURE__ */ React.createElement("label", null, "Response", /* @__PURE__ */ React.createElement("textarea", { required: true, value: r.response_text, onChange: (e) => setR({ ...r, response_text: e.target.value }) })), /* @__PURE__ */ React.createElement("button", { className: "btn primary" }, "Send response")));
}
function Notifications({ rows }) {
  return /* @__PURE__ */ React.createElement("section", { className: "panel full-panel" }, /* @__PURE__ */ React.createElement("div", { className: "panel-head" }, /* @__PURE__ */ React.createElement("h3", null, "Notifications")), /* @__PURE__ */ React.createElement("div", { className: "notification-list large" }, rows.map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id }, /* @__PURE__ */ React.createElement("b", null, n.title), /* @__PURE__ */ React.createElement("p", null, n.message), /* @__PURE__ */ React.createElement("small", null, n.read ? "Read" : "Unread")))), !rows.length && /* @__PURE__ */ React.createElement("div", { className: "empty" }, "No notifications"));
}
export default function App() {
  return /* @__PURE__ */ React.createElement(BrowserRouter, null, /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "/", element: /* @__PURE__ */ React.createElement(Landing, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/login/:role", element: /* @__PURE__ */ React.createElement(LoginPage, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/doctor", element: /* @__PURE__ */ React.createElement(Protected, { role: "doctor" }, /* @__PURE__ */ React.createElement(Dashboard, null)) }), /* @__PURE__ */ React.createElement(Route, { path: "/asha", element: /* @__PURE__ */ React.createElement(Protected, { role: "asha" }, /* @__PURE__ */ React.createElement(Dashboard, null)) }), /* @__PURE__ */ React.createElement(Route, { path: "*", element: /* @__PURE__ */ React.createElement(Navigate, { to: "/" }) })));
}
