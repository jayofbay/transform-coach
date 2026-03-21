import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";

// ─── DATA ────────────────────────────────────────────────────────────────────
// Hardcoded CLIENTS kept as seed/session data reference by thread_id
const CLIENTS = [
  {
    id: 1, thread_id: "jordan-blake", name: "Jordan Blake", avatar: "JB", goal: "Fat Loss", phase: "Cut",
    watch: "Apple Watch Series 9", connected: true,
    weight: 89.4, startWeight: 102, targetWeight: 78,
    bodyFat: 24.1, startBodyFat: 31, targetBodyFat: 15,
    weekNum: 8, totalWeeks: 16,
    compliance: 91, streak: 12,
    accent: "#FF4D00",
    stats: { calories: 2100, protein: 185, steps: 9840, sleep: 7.2, water: 2.8 },
    measurements: { chest: 102, waist: 88, hips: 105, arms: 38, thighs: 62 },
    weightHistory: [102, 100.5, 99.1, 97.8, 96.4, 95.0, 93.6, 92.2, 91.0, 89.8, 89.4],
    sessions: [
      { day: "MON", type: "strength", label: "Push A", status: "done",
        exercises: [
          { name: "Bench Press", sets: "4×8", weight: "80kg", done: true, actual: "80kg×8,8,7,7" },
          { name: "Incline DB Press", sets: "3×10", weight: "30kg", done: true, actual: "30kg×10,10,9" },
          { name: "Cable Fly", sets: "3×12", weight: "15kg", done: true, actual: "15kg×12,12,11" },
          { name: "Tricep Pushdown", sets: "3×15", weight: "25kg", done: true, actual: "25kg×15,14,13" },
          { name: "Lateral Raises", sets: "4×15", weight: "10kg", done: true, actual: "10kg×15,15,15,14" },
        ]},
      { day: "TUE", type: "cardio", label: "HIIT 30", status: "done",
        exercises: [
          { name: "Treadmill Sprint Intervals", sets: "10×30s", weight: "16km/h", done: true, actual: "Completed" },
          { name: "Jump Rope", sets: "5×1min", weight: "—", done: true, actual: "Completed" },
          { name: "Battle Ropes", sets: "4×30s", weight: "—", done: true, actual: "Completed" },
        ]},
      { day: "WED", type: "strength", label: "Pull A", status: "done",
        exercises: [
          { name: "Barbell Row", sets: "4×8", weight: "70kg", done: true, actual: "70kg×8,8,8,7" },
          { name: "Lat Pulldown", sets: "4×10", weight: "65kg", done: true, actual: "65kg×10,10,9,9" },
          { name: "Seated Row", sets: "3×12", weight: "55kg", done: false, actual: null },
          { name: "Face Pulls", sets: "3×15", weight: "20kg", done: true, actual: "20kg×15,15,14" },
          { name: "Barbell Curl", sets: "3×10", weight: "35kg", done: true, actual: "35kg×10,9,9" },
        ]},
      { day: "THU", type: "rest", label: "Active Rest", status: "done",
        exercises: [{ name: "30min Walk", sets: "1", weight: "—", done: true, actual: "32min" }]},
      { day: "FRI", type: "strength", label: "Legs A", status: "missed",
        exercises: [
          { name: "Back Squat", sets: "4×6", weight: "100kg", done: false, actual: null },
          { name: "Romanian DL", sets: "3×10", weight: "80kg", done: false, actual: null },
          { name: "Leg Press", sets: "4×12", weight: "140kg", done: false, actual: null },
          { name: "Leg Curl", sets: "3×12", weight: "50kg", done: false, actual: null },
        ]},
      { day: "SAT", type: "cardio", label: "LISS 45", status: "upcoming",
        exercises: [
          { name: "Incline Treadmill", sets: "45min", weight: "6km/h", done: false, actual: null },
        ]},
      { day: "SUN", type: "rest", label: "Full Rest", status: "upcoming",
        exercises: [{ name: "Rest & Recovery", sets: "—", weight: "—", done: false, actual: null }]},
    ],
  },
  {
    id: 2, thread_id: "priya-sharma", name: "Priya Sharma", avatar: "PS", goal: "Muscle Gain", phase: "Bulk",
    watch: "Garmin Venu 3", connected: true,
    weight: 58.2, startWeight: 54, targetWeight: 62,
    bodyFat: 21.3, startBodyFat: 23, targetBodyFat: 20,
    weekNum: 5, totalWeeks: 12,
    compliance: 84, streak: 6,
    accent: "#00C896",
    stats: { calories: 2650, protein: 145, steps: 7200, sleep: 8.1, water: 3.2 },
    measurements: { chest: 86, waist: 68, hips: 92, arms: 29, thighs: 55 },
    weightHistory: [54, 54.4, 54.9, 55.5, 56.1, 56.8, 57.3, 57.8, 58.2],
    sessions: [
      { day: "MON", type: "strength", label: "Upper Hypertrophy", status: "done",
        exercises: [
          { name: "DB Shoulder Press", sets: "4×10", weight: "15kg", done: true, actual: "15kg×10,10,10,9" },
          { name: "Cable Row", sets: "4×12", weight: "40kg", done: true, actual: "40kg×12,12,11,11" },
          { name: "Chest Fly", sets: "3×12", weight: "12kg", done: true, actual: "12kg×12,12,12" },
        ]},
      { day: "TUE", type: "cardio", label: "Zone 2 30min", status: "done",
        exercises: [
          { name: "Bike Steady State", sets: "30min", weight: "135bpm", done: true, actual: "Completed" },
        ]},
      { day: "WED", type: "strength", label: "Lower Hypertrophy", status: "done",
        exercises: [
          { name: "Goblet Squat", sets: "4×12", weight: "24kg", done: true, actual: "24kg×12×4" },
          { name: "Hip Thrust", sets: "4×12", weight: "60kg", done: true, actual: "60kg×12×4" },
          { name: "Walking Lunges", sets: "3×16", weight: "12kg", done: true, actual: "12kg×16×3" },
        ]},
      { day: "THU", type: "rest", label: "Rest", status: "done",
        exercises: [{ name: "Rest", sets: "—", weight: "—", done: true, actual: "Rest" }]},
      { day: "FRI", type: "strength", label: "Full Body", status: "done",
        exercises: [
          { name: "Deadlift", sets: "3×5", weight: "65kg", done: true, actual: "65kg×5×3" },
          { name: "Pull-Ups", sets: "3×6", weight: "BW", done: true, actual: "BW×6,5,5" },
        ]},
      { day: "SAT", type: "cardio", label: "HIIT 20", status: "upcoming",
        exercises: [
          { name: "Bike Sprints", sets: "8×20s", weight: "Max", done: false, actual: null },
        ]},
      { day: "SUN", type: "rest", label: "Full Rest", status: "upcoming",
        exercises: [{ name: "Rest", sets: "—", weight: "—", done: false, actual: null }]},
    ],
  },
  {
    id: 3, thread_id: "marcus-webb", name: "Marcus Webb", avatar: "MW", goal: "Recomp", phase: "Maintenance",
    watch: null, connected: false,
    weight: 84.0, startWeight: 84, targetWeight: 82,
    bodyFat: 18.5, startBodyFat: 22, targetBodyFat: 14,
    weekNum: 3, totalWeeks: 20,
    compliance: 58, streak: 2,
    accent: "#FFB800",
    stats: { calories: 2400, protein: 168, steps: 5100, sleep: 6.4, water: 2.1 },
    measurements: { chest: 105, waist: 84, hips: 98, arms: 42, thighs: 62 },
    weightHistory: [84, 84.2, 83.8, 84.1, 83.9, 84.0],
    sessions: [
      { day: "MON", type: "strength", label: "Push/Pull", status: "done",
        exercises: [
          { name: "OHP", sets: "4×6", weight: "60kg", done: true, actual: "60kg×6,6,5,5" },
        ]},
      { day: "TUE", type: "cardio", label: "Run 20min", status: "missed",
        exercises: [
          { name: "Outdoor Run", sets: "20min", weight: "Z2", done: false, actual: null },
        ]},
      { day: "WED", type: "strength", label: "Legs", status: "done",
        exercises: [
          { name: "Squat", sets: "4×5", weight: "110kg", done: true, actual: "110kg×5×4" },
        ]},
      { day: "THU", type: "rest", label: "Rest", status: "done",
        exercises: [{ name: "Rest", sets: "—", weight: "—", done: true, actual: "Rest" }]},
      { day: "FRI", type: "strength", label: "Upper", status: "missed",
        exercises: [
          { name: "Bench Press", sets: "4×5", weight: "90kg", done: false, actual: null },
        ]},
      { day: "SAT", type: "cardio", label: "Walk 45min", status: "upcoming",
        exercises: [
          { name: "Brisk Walk", sets: "45min", weight: "—", done: false, actual: null },
        ]},
      { day: "SUN", type: "rest", label: "Rest", status: "upcoming",
        exercises: [{ name: "Rest", sets: "—", weight: "—", done: false, actual: null }]},
    ],
  },
];

const PHASES = ["Cut", "Bulk", "Maintenance", "Peak Week"];
const GOALS = ["Fat Loss", "Muscle Gain", "Recomp", "Athletic Performance"];

// ─── Helper: map a DB row to UI client shape ──────────────────────────────────
function mapDbClientToUi(row) {
  // Look up seed data by thread_id
  const seed = CLIENTS.find(c => c.thread_id === row.thread_id);
  return {
    id: row.id,
    thread_id: row.thread_id,
    name: row.name,
    avatar: row.avatar || "?",
    goal: row.goal || "Fat Loss",
    phase: row.phase || "Cut",
    accent: row.accent_color || "#FF4D00",
    watch: row.watch || null,
    connected: row.connected || false,
    weight: row.weight || 0,
    startWeight: row.start_weight || 0,
    targetWeight: row.target_weight || 0,
    bodyFat: row.body_fat || 0,
    startBodyFat: row.start_body_fat || 0,
    targetBodyFat: row.target_body_fat || 0,
    weekNum: row.week_num || 1,
    totalWeeks: row.total_weeks || 16,
    compliance: row.compliance || 0,
    streak: row.streak || 0,
    // Use seed data if available, otherwise empty defaults
    sessions: seed ? seed.sessions : [],
    stats: seed ? seed.stats : { calories: 0, protein: 0, steps: 0, sleep: 0, water: 0 },
    measurements: seed ? seed.measurements : { chest: 0, waist: 0, hips: 0, arms: 0, thighs: 0 },
    weightHistory: seed ? seed.weightHistory : [row.weight || 0],
  };
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const ProgressBar = ({ value, max, color, height = 4, glow = false }) => (
  <div style={{ width: "100%", height, background: "rgba(255,255,255,0.07)", borderRadius: height }}>
    <div style={{
      width: `${Math.min((value / max) * 100, 100)}%`, height: "100%",
      background: color, borderRadius: height,
      boxShadow: glow ? `0 0 8px ${color}80` : "none",
      transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
    }} />
  </div>
);

const WeightChart = ({ history, accent }) => {
  const w = 220, h = 60, pad = 8;
  const min = Math.min(...history) - 1;
  const max = Math.max(...history) + 1;
  const range = max - min;
  const pts = history.map((v, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length-1][0]},${h} L${pts[0][0]},${h} Z`;
  const lastPt = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`wg-${accent.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#wg-${accent.replace("#","")})`} />
      <path d={pathD} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={accent} style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
    </svg>
  );
};

const StatPill = ({ icon, value, label, color, minWidth }) => (
  <div style={{
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", gap: 12,
    minWidth, flexShrink: 0
  }}>
    <span style={{ fontSize: 22 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.02em" }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("clients"); // clients | week | body | build | chat
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    goal: 'Fat Loss',
    phase: 'Cut',
    startWeight: '',
    targetWeight: '',
    bodyFat: '',
    totalWeeks: '16',
    accentColor: '#FF4D00',
  });
  const [notification, setNotif] = useState(null);
  const [planForm, setPlanForm] = useState({ type: "strength", label: "", exercises: [{ name: "", sets: "", weight: "" }] });
  const [tick, setTick] = useState(0);

  // ── Invoice state ──
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ description: "", amount: "", dueDate: "" });
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  // ── Messaging state ──
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const chatEndRef = useRef(null);

  // ── Exercise compliance (live) ──
  const [liveExLogs, setLiveExLogs] = useState([]);

  // ── Food photo logs ──
  const [foodPhotos, setFoodPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoFeedback, setPhotoFeedback] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);


  // ── Progress photos ──
  const [progressPhotos, setProgressPhotos] = useState([]);

  // ─── Tick for animated device data ───────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 4000);
    return () => clearInterval(t);
  }, []);

  // ─── Supabase: Fetch clients on mount ────────────────────────────────────
  useEffect(() => {
    setClientsLoading(true);
    supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbClientToUi);
          setClients(mapped);
          setClient(mapped[0]);
        } else {
          // Fallback to hardcoded if DB is empty or errors
          setClients(CLIENTS);
          setClient(CLIENTS[0]);
        }
        setClientsLoading(false);
      });
  }, []);

  // ─── Supabase: Fetch messages + real-time subscription ───────────────────
  useEffect(() => {
    if (!client) return;
    const threadId = client.thread_id;

    // Reset and fetch for new client
    setMessages([]);

    supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setMessages(data);
      });

    // Real-time subscription for new messages
    const channel = supabase
      .channel(`messages-channel-${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client?.thread_id]);

  // ─── Supabase: Scroll to bottom when messages change ────────────────────
  useEffect(() => {
    if (view === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

  // ─── Supabase: Fetch exercise_logs + real-time subscription ─────────────
  useEffect(() => {
    if (!client) return;
    const threadId = client.thread_id;
    const today = new Date().toISOString().split("T")[0];

    setLiveExLogs([]);

    supabase
      .from("exercise_logs")
      .select("*")
      .eq("thread_id", threadId)
      .gte("logged_at", today + "T00:00:00")
      .then(({ data, error }) => {
        if (!error && data) setLiveExLogs(data);
      });

    const channel = supabase
      .channel(`exercise-logs-channel-${threadId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exercise_logs", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLiveExLogs((prev) => {
              if (prev.some((l) => l.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === "UPDATE") {
            setLiveExLogs((prev) =>
              prev.map((l) => (l.id === payload.new.id ? payload.new : l))
            );
          } else if (payload.eventType === "DELETE") {
            setLiveExLogs((prev) => prev.filter((l) => l.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client?.thread_id]);

  // ─── Supabase: Fetch food_photo_logs ─────────────────────────────────────
  useEffect(() => {
    if (!client) return;
    const threadId = client.thread_id;

    setFoodPhotos([]);

    supabase
      .from("food_photo_logs")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setFoodPhotos(data);
      });
  }, [client?.thread_id]);


  // ─── Supabase: Fetch progress_photos + real-time subscription ───────────
  useEffect(() => {
    if (!client) return;
    const threadId = client.thread_id;
    setProgressPhotos([]);
    supabase
      .from("progress_photos")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { if (!error && data) setProgressPhotos(data); });

    const channel = supabase
      .channel(`progress-photos-coach-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "progress_photos", filter: `thread_id=eq.${threadId}` },
        (payload) => setProgressPhotos(prev => prev.some(p => p.id === payload.new.id) ? prev : [payload.new, ...prev]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [client?.thread_id]);

  // ─── Supabase: Fetch invoices + real-time subscription ───────────────────
  useEffect(() => {
    if (!client) return;
    const threadId = client.thread_id;

    setInvoices([]);

    supabase
      .from("invoices")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setInvoices(data); });

    const channel = supabase
      .channel(`invoices-channel-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "invoices", filter: `thread_id=eq.${threadId}` },
        (payload) => setInvoices(prev => [payload.new, ...prev]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "invoices", filter: `thread_id=eq.${threadId}` },
        (payload) => setInvoices(prev => prev.map(i => i.id === payload.new.id ? payload.new : i)))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [client?.thread_id]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const notify = (msg, ok = true) => {
    setNotif({ msg, ok });
    setTimeout(() => setNotif(null), 2800);
  };

  const addExercise = () => setPlanForm(f => ({ ...f, exercises: [...f.exercises, { name: "", sets: "", weight: "" }] }));
  const removeExercise = (i) => setPlanForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));
  const updateExercise = (i, field, val) => setPlanForm(f => ({
    ...f, exercises: f.exercises.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex)
  }));

  const handleCreateInvoice = async () => {
    if (!invoiceForm.description.trim() || !invoiceForm.amount) return;
    setCreatingInvoice(true);
    try {
      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: client.thread_id,
          amount_cents: Math.round(parseFloat(invoiceForm.amount) * 100),
          description: invoiceForm.description.trim(),
          due_date: invoiceForm.dueDate || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create invoice");
      setInvoiceForm({ description: "", amount: "", dueDate: "" });
      setShowInvoiceModal(false);
      notify("Invoice sent to client!");
    } catch (e) {
      notify(e.message, false);
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleClientSelect = (c) => {
    setClient(c);
    setView("week");
    setActiveDay(null);
    // Reset data state — subscriptions will re-fetch on client change
    setMessages([]);
    setFoodPhotos([]);
    setProgressPhotos([]);
    setInvoices([]);
    setLiveExLogs([]);
  };

  // ─── Add New Client ───────────────────────────────────────────────────────
  const handleAddClient = async () => {
    if (!newClientForm.name.trim()) {
      notify("Name is required", false);
      return;
    }

    const nameTrimmed = newClientForm.name.trim();

    // Generate avatar from initials
    const parts = nameTrimmed.split(/\s+/);
    const avatar = (parts.length >= 2
      ? parts[0][0] + parts[1][0]
      : parts[0].slice(0, 2)
    ).toUpperCase();

    // Generate thread_id as slug
    const thread_id = nameTrimmed
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const insertPayload = {
      thread_id,
      name: nameTrimmed,
      avatar,
      goal: newClientForm.goal,
      phase: newClientForm.phase,
      start_weight: newClientForm.startWeight ? parseFloat(newClientForm.startWeight) : null,
      target_weight: newClientForm.targetWeight ? parseFloat(newClientForm.targetWeight) : null,
      weight: newClientForm.startWeight ? parseFloat(newClientForm.startWeight) : null,
      body_fat: newClientForm.bodyFat ? parseFloat(newClientForm.bodyFat) : null,
      start_body_fat: newClientForm.bodyFat ? parseFloat(newClientForm.bodyFat) : null,
      target_body_fat: null,
      total_weeks: parseInt(newClientForm.totalWeeks) || 16,
      week_num: 1,
      compliance: 0,
      streak: 0,
      accent_color: newClientForm.accentColor,
      connected: false,
      watch: null,
    };

    const { data, error } = await supabase
      .from("clients")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      notify(error.message || "Failed to add client", false);
      return;
    }

    const newClient = mapDbClientToUi(data);
    setClients(prev => [...prev, newClient]);
    setShowAddClient(false);
    setNewClientForm({
      name: '',
      goal: 'Fat Loss',
      phase: 'Cut',
      startWeight: '',
      targetWeight: '',
      bodyFat: '',
      totalWeeks: '16',
      accentColor: '#FF4D00',
    });
    setClient(newClient);
    setView("week");
    notify("Client added!");
  };

  const changeWeek = async (delta) => {
    if (!client) return;
    const newWeek = Math.max(1, Math.min(client.totalWeeks, client.weekNum + delta));
    if (newWeek === client.weekNum) return;
    const updatedClient = { ...client, weekNum: newWeek };
    setClient(updatedClient);
    setClients(prev => prev.map(c => c.thread_id === client.thread_id ? updatedClient : c));
    await supabase.from("clients").update({ week_num: newWeek }).eq("thread_id", client.thread_id);
  };

  const pct = (v, s, t) => Math.round(((v - s) / (t - s)) * 100);
  const weightPct = client ? pct(client.weight, client.startWeight, client.targetWeight) : 0;
  const compColor = c => c >= 85 ? "#00C896" : c >= 65 ? "#FFB800" : "#FF4D00";

  const typeConfig = {
    strength: { label: "STRENGTH", color: "#FF4D00", icon: "🏋️", bg: "rgba(255,77,0,0.12)" },
    cardio: { label: "CARDIO", color: "#00C896", icon: "🔥", bg: "rgba(0,200,150,0.1)" },
    rest: { label: "REST", color: "#6B7280", icon: "😴", bg: "rgba(107,114,128,0.08)" },
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14,
    fontFamily: "inherit", outline: "none", width: "100%",
  };

  // ─── Messaging: send message to Supabase ─────────────────────────────────
  const sendMessage = async () => {
    const content = msgInput.trim();
    if (!content || msgSending || !client) return;
    setMsgSending(true);
    setMsgInput("");

    const { error } = await supabase.from("messages").insert({
      thread_id: client.thread_id,
      sender: "coach",
      content,
    });

    if (error) {
      notify("Failed to send message", false);
      setMsgInput(content);
    }
    setMsgSending(false);
  };

  // ─── Food photos: open photo, mark seen, load feedback ───────────────────
  const openPhoto = async (photo) => {
    setSelectedPhoto(photo);
    setPhotoFeedback(photo.coach_feedback || "");

    if (!photo.coach_seen) {
      const { data } = await supabase
        .from("food_photo_logs")
        .update({ coach_seen: true })
        .eq("id", photo.id)
        .select()
        .single();
      if (data) {
        setFoodPhotos((prev) => prev.map((p) => (p.id === photo.id ? data : p)));
        setSelectedPhoto(data);
      }
    }
  };

  const saveFeedback = async () => {
    if (!selectedPhoto || savingFeedback) return;
    setSavingFeedback(true);
    const { data, error } = await supabase
      .from("food_photo_logs")
      .update({ coach_feedback: photoFeedback, coach_seen: true })
      .eq("id", selectedPhoto.id)
      .select()
      .single();
    setSavingFeedback(false);
    if (!error && data) {
      setFoodPhotos((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setSelectedPhoto(data);
      notify("Feedback saved");
    } else {
      notify("Failed to save feedback", false);
    }
  };

  // ─── Live exercise count for today ───────────────────────────────────────
  const todayDoneCount = liveExLogs.filter((l) => l.done).length;
  const todayTotalCount = liveExLogs.length;

  const ACCENT_SWATCHES = ['#FF4D00', '#00C896', '#FFB800', '#818CF8', '#06B6D4', '#F43F5E'];

  return (
    <div style={{
      fontFamily: "'Barlow', 'Barlow Condensed', sans-serif",
      background: "#000",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .cl-item:active { background: rgba(255,255,255,0.08) !important; }
        .btn:active { opacity: 0.7; transform: scale(0.98); }
        .btn { transition: all 0.15s ease; cursor: pointer; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(15px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
        .live { animation: pulse 2.5s infinite; }
        .notif { animation: slideDown 0.25s ease; }
        textarea:focus, input:focus { border-color: rgba(255,255,255,0.25) !important; }
        select option { background: #1a1a1a; }
        .photo-thumb:active { opacity: 0.75; }
        .photo-thumb { transition: opacity 0.15s; cursor: pointer; }
      `}</style>

      {/* MOBILE CONTAINER (Simulated iPhone) */}
      <div style={{
        width: "100%", maxWidth: 430, height: "100vh", maxHeight: 932,
        background: "#0A0A0A", position: "relative", display: "flex", flexDirection: "column",
        overflow: "hidden", color: "white",
        boxShadow: "0 0 40px rgba(0,0,0,0.8)", border: "1px solid #1a1a1a"
      }}>

        {/* NOTIFICATION */}
        {notification && (
          <div className="notif" style={{
            position: "absolute", top: 60, left: 20, right: 20,
            zIndex: 2000, background: notification.ok ? "rgba(0,200,150,0.2)" : "rgba(255,77,0,0.2)",
            border: `1px solid ${notification.ok ? "#00C896" : "#FF4D00"}`,
            borderRadius: 14, padding: "14px 20px", fontSize: 14, fontWeight: 600,
            backdropFilter: "blur(20px)", textAlign: "center"
          }}>
            {notification.msg}
          </div>
        )}

        {/* ── PHOTO DETAIL MODAL ── */}
        {selectedPhoto && (
          <div style={{
            position: "absolute", inset: 0, background: "#000", zIndex: 1100,
            display: "flex", flexDirection: "column", animation: "slideUp 0.3s cubic-bezier(0.2,0.8,0.2,1)"
          }}>
            {/* Header */}
            <div style={{ padding: "50px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <div style={{ fontFamily: "Barlow Condensed", fontSize: 22, fontWeight: 800 }}>FOOD PHOTO</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {selectedPhoto.meal_type ? selectedPhoto.meal_type.toUpperCase() : "—"}
                  {selectedPhoto.logged_date ? ` · ${selectedPhoto.logged_date}` : ""}
                </div>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            </div>

            <div className="no-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {/* Photo */}
              <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, background: "rgba(255,255,255,0.05)", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selectedPhoto.public_url ? (
                  <img
                    src={selectedPhoto.public_url}
                    alt={selectedPhoto.caption || "Food photo"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ fontSize: 48, opacity: 0.3 }}>🍽️</div>
                )}
              </div>

              {/* Caption */}
              {selectedPhoto.caption && (
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 20, lineHeight: 1.5 }}>
                  {selectedPhoto.caption}
                </div>
              )}

              {/* Seen badge */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {selectedPhoto.coach_seen && (
                  <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(0,200,150,0.15)", color: "#00C896", fontWeight: 700 }}>
                    SEEN
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>
                  Coach Feedback
                </div>
                <textarea
                  value={photoFeedback}
                  onChange={(e) => setPhotoFeedback(e.target.value)}
                  placeholder="Add feedback for the client..."
                  style={{ ...inputStyle, height: 100, resize: "none" }}
                />
              </div>

              <button
                className="btn"
                onClick={saveFeedback}
                disabled={savingFeedback}
                style={{
                  width: "100%", background: client?.accent || "#FF4D00", border: "none", borderRadius: 14,
                  padding: "16px", color: "white", fontSize: 15, fontWeight: 700,
                  fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.06em",
                  textTransform: "uppercase", opacity: savingFeedback ? 0.6 : 1, marginBottom: 40
                }}
              >
                {savingFeedback ? "Saving…" : "Save Feedback"}
              </button>
            </div>
          </div>
        )}

        {/* FULL SCREEN MODAL (New Session Plan) */}
        {showModal && client && (
          <div style={{
            position: "absolute", inset: 0, background: "#0A0A0A", zIndex: 1000,
            display: "flex", flexDirection: "column", animation: "slideUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}>
            <div style={{ padding: "50px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontFamily: "Barlow Condensed", fontSize: 26, fontWeight: 800 }}>NEW SESSION PLAN</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Sending to {client.name}</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div className="no-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {/* Session type */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", fontWeight: 600 }}>Session Type</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {["strength", "cardio", "rest"].map(t => {
                    const tc = typeConfig[t];
                    return (
                      <button key={t} className="btn" onClick={() => setPlanForm(f => ({ ...f, type: t }))} style={{
                        background: planForm.type === t ? tc.bg : "rgba(255,255,255,0.04)",
                        border: `1px solid ${planForm.type === t ? tc.color + "60" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 14, padding: "16px 10px",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      }}>
                        <span style={{ fontSize: 24 }}>{tc.icon}</span>
                        <span style={{ fontSize: 11, color: planForm.type === t ? tc.color : "rgba(255,255,255,0.5)", fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: "0.05em" }}>{tc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day & Label */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Day</div>
                  <select style={inputStyle} defaultValue="MON">
                    {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Label</div>
                  <input style={inputStyle} placeholder="e.g. Push A" value={planForm.label}
                    onChange={e => setPlanForm(f => ({ ...f, label: e.target.value }))} />
                </div>
              </div>

              {/* Exercises */}
              {planForm.type !== "rest" && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 600 }}>
                      {planForm.type === "strength" ? "Exercises" : "Intervals"}
                    </div>
                  </div>

                  {planForm.exercises.map((ex, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 30px", gap: 8, marginBottom: 10, alignItems: "center" }}>
                      <input style={inputStyle} placeholder="Exercise" value={ex.name} onChange={e => updateExercise(i, "name", e.target.value)} />
                      <input style={inputStyle} placeholder="Sets" value={ex.sets} onChange={e => updateExercise(i, "sets", e.target.value)} />
                      <button onClick={() => removeExercise(i)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 20 }}>×</button>
                    </div>
                  ))}
                  <button className="btn" onClick={addExercise} style={{
                      width: "100%", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)",
                      borderRadius: 10, padding: "12px", color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4
                    }}>+ ADD ROW</button>
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Notes</div>
                <textarea placeholder="Coach notes..." style={{ ...inputStyle, height: 100, resize: "none" }} />
              </div>

              <button className="btn" onClick={() => { notify(`Plan sent to ${client.name}`); setShowModal(false); }} style={{
                width: "100%", background: typeConfig[planForm.type].color,
                border: "none", borderRadius: 14, padding: "18px",
                color: "white", fontSize: 16, fontWeight: 700, fontFamily: "Barlow Condensed, sans-serif",
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 40
              }}>
                Send to Athlete ↑
              </button>
            </div>
          </div>
        )}

        {/* SEND INVOICE MODAL */}
        {showInvoiceModal && client && (
          <div style={{
            position: "absolute", inset: 0, background: "#0A0A0A", zIndex: 1000,
            display: "flex", flexDirection: "column", animation: "slideUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Barlow Condensed", fontSize: 22, fontWeight: 800 }}>Send Invoice</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>to {client.name}</div>
              </div>
              <button className="btn" onClick={() => setShowInvoiceModal(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, width: 36, height: 36, color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Description", key: "description", placeholder: "e.g. Monthly coaching — April", type: "text" },
                  { label: "Amount (USD)", key: "amount", placeholder: "e.g. 150.00", type: "number" },
                  { label: "Due Date (optional)", key: "dueDate", placeholder: "", type: "date" },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={invoiceForm[f.key]}
                      onChange={e => setInvoiceForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit",
                      }}
                    />
                  </div>
                ))}

                {/* Preview */}
                {invoiceForm.amount && (
                  <div style={{ background: `${client.accent}10`, border: `1px solid ${client.accent}30`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Invoice preview</div>
                    <div style={{ fontFamily: "Barlow Condensed", fontSize: 28, fontWeight: 800, color: client.accent }}>
                      ${parseFloat(invoiceForm.amount || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{invoiceForm.description || "—"}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button className="btn" onClick={handleCreateInvoice} disabled={creatingInvoice || !invoiceForm.description.trim() || !invoiceForm.amount} style={{
                width: "100%", background: invoiceForm.description.trim() && invoiceForm.amount ? client.accent : "rgba(255,255,255,0.08)",
                border: "none", borderRadius: 14, padding: "16px", color: "#fff",
                fontSize: 16, fontWeight: 800, fontFamily: "Barlow Condensed", letterSpacing: "0.05em",
                cursor: invoiceForm.description.trim() && invoiceForm.amount ? "pointer" : "default",
                opacity: creatingInvoice ? 0.6 : 1,
              }}>
                {creatingInvoice ? "Creating..." : "SEND INVOICE VIA STRIPE"}
              </button>
            </div>
          </div>
        )}

        {/* ADD NEW CLIENT MODAL */}
        {showAddClient && (
          <div style={{
            position: "absolute", inset: 0, background: "#0A0A0A", zIndex: 1000,
            display: "flex", flexDirection: "column", animation: "slideUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}>
            <div style={{ padding: "50px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontFamily: "Barlow Condensed", fontSize: 26, fontWeight: 800 }}>NEW CLIENT</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Add a client to your roster</div>
              </div>
              <button onClick={() => setShowAddClient(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div className="no-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>

              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Name</div>
                <input
                  style={inputStyle}
                  placeholder="e.g. Alex Johnson"
                  value={newClientForm.name}
                  onChange={e => setNewClientForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Goal */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Goal</div>
                <select
                  style={inputStyle}
                  value={newClientForm.goal}
                  onChange={e => setNewClientForm(f => ({ ...f, goal: e.target.value }))}
                >
                  <option>Fat Loss</option>
                  <option>Muscle Gain</option>
                  <option>Recomp</option>
                </select>
              </div>

              {/* Phase */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Phase</div>
                <select
                  style={inputStyle}
                  value={newClientForm.phase}
                  onChange={e => setNewClientForm(f => ({ ...f, phase: e.target.value }))}
                >
                  <option>Cut</option>
                  <option>Bulk</option>
                  <option>Maintenance</option>
                </select>
              </div>

              {/* Start Weight & Target Weight */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Start Weight kg</div>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 90"
                    value={newClientForm.startWeight}
                    onChange={e => setNewClientForm(f => ({ ...f, startWeight: e.target.value }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Target Weight kg</div>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 78"
                    value={newClientForm.targetWeight}
                    onChange={e => setNewClientForm(f => ({ ...f, targetWeight: e.target.value }))}
                  />
                </div>
              </div>

              {/* Body Fat & Total Weeks */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Current Body Fat %</div>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 22"
                    value={newClientForm.bodyFat}
                    onChange={e => setNewClientForm(f => ({ ...f, bodyFat: e.target.value }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Total Weeks</div>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="16"
                    value={newClientForm.totalWeeks}
                    onChange={e => setNewClientForm(f => ({ ...f, totalWeeks: e.target.value }))}
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", fontWeight: 600 }}>Accent Color</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {ACCENT_SWATCHES.map(color => (
                    <div
                      key={color}
                      className="btn"
                      onClick={() => setNewClientForm(f => ({ ...f, accentColor: color }))}
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: color,
                        border: newClientForm.accentColor === color
                          ? "3px solid white"
                          : "3px solid transparent",
                        boxShadow: newClientForm.accentColor === color
                          ? `0 0 10px ${color}80`
                          : "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                className="btn"
                onClick={handleAddClient}
                style={{
                  width: "100%", background: newClientForm.accentColor,
                  border: "none", borderRadius: 14, padding: "18px",
                  color: "white", fontSize: 16, fontWeight: 700,
                  fontFamily: "Barlow Condensed, sans-serif",
                  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 40
                }}
              >
                Add Client
              </button>
            </div>
          </div>
        )}

        {/* FAKE iOS STATUS BAR */}
        <div style={{ height: 48, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 28px", fontSize: 14, fontWeight: 600, flexShrink: 0, zIndex: 10 }}>
          <span>9:41</span>
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 110, height: 30, background: "#000", borderRadius: 15, top: 8 }} />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>📶</span>
            <span style={{ fontSize: 12 }}>🔋</span>
          </div>
        </div>

        {/* MAIN ROUTER AREA */}
        <div className="no-scroll" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* VIEW: CLIENTS LIST */}
          {view === "clients" && (
            <div className="no-scroll fade-up" style={{ padding: "10px 0 20px", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "0 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "Barlow Condensed", fontSize: 34, fontWeight: 800 }}>CLIENTS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,200,150,0.1)", padding: "6px 12px", borderRadius: 20 }}>
                  <div className="live" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C896" }} />
                  <span style={{ fontSize: 11, color: "#00C896", fontWeight: 600 }}>{clients.filter(c => c.connected).length} Live</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {clientsLoading ? (
                  <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,0.1)",
                      borderTopColor: "#00C896",
                      animation: "spin 0.8s linear infinite"
                    }} />
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading clients…</div>
                  </div>
                ) : (
                  clients.map(c => (
                    <div key={c.id} className="cl-item btn" onClick={() => handleClientSelect(c)} style={{
                      padding: "16px 24px", display: "flex", alignItems: "center", gap: 16,
                      borderBottom: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: `${c.accent}15`, border: `2px solid ${c.accent}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 700, color: c.accent, flexShrink: 0,
                        fontFamily: "Barlow Condensed, sans-serif",
                      }}>
                        {c.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: `${c.accent}20`, color: c.accent, fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: "0.05em" }}>{c.phase.toUpperCase()}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Wk {c.weekNum}/{c.totalWeeks}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: compColor(c.compliance), fontFamily: "Barlow Condensed" }}>{c.compliance}%</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Compliance</div>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 18, marginLeft: 4 }}>›</div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: 24 }}>
                <button className="btn" onClick={() => setShowAddClient(true)} style={{
                  width: "100%", background: "rgba(255,255,255,0.05)",
                  border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 14,
                  padding: "16px", color: "white", fontSize: 14,
                  fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: "0.08em",
                }}>+ ADD NEW CLIENT</button>
              </div>
            </div>
          )}

          {/* VIEW: CLIENT DETAIL (Week, Body, Build, Chat) */}
          {view !== "clients" && client && (
            <>
              {/* Client Header */}
              <div style={{ padding: "0 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <button className="btn" onClick={() => setView("clients")} style={{ background: "none", border: "none", color: client.accent, fontSize: 15, fontWeight: 600, padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 20 }}>‹</span> Clients
                </button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 16, background: `${client.accent}20`,
                      border: `2px solid ${client.accent}50`, display: "flex", alignItems: "center",
                      justifyContent: "center", fontFamily: "Barlow Condensed", fontSize: 18, fontWeight: 800, color: client.accent
                    }}>{client.avatar}</div>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed", fontSize: 24, fontWeight: 800 }}>{client.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{client.goal}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button className="btn" onClick={() => changeWeek(-1)} disabled={client.weekNum <= 1} style={{
                            background: "none", border: "none", color: client.weekNum <= 1 ? "rgba(255,255,255,0.15)" : client.accent,
                            fontSize: 16, padding: "0 2px", lineHeight: 1, cursor: client.weekNum <= 1 ? "default" : "pointer"
                          }}>‹</button>
                          <span style={{ fontSize: 12, fontWeight: 700, color: client.accent }}>Wk {client.weekNum}/{client.totalWeeks}</span>
                          <button className="btn" onClick={() => changeWeek(1)} disabled={client.weekNum >= client.totalWeeks} style={{
                            background: "none", border: "none", color: client.weekNum >= client.totalWeeks ? "rgba(255,255,255,0.15)" : client.accent,
                            fontSize: 16, padding: "0 2px", lineHeight: 1, cursor: client.weekNum >= client.totalWeeks ? "default" : "pointer"
                          }}>›</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="btn" onClick={() => setShowModal(true)} style={{
                    background: client.accent, border: "none", borderRadius: 12, width: 40, height: 40,
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20
                  }}>+</button>
                </div>
              </div>

              {/* Sub-Views */}
              <div className="no-scroll" style={{ flex: 1, overflowY: view === "chat" ? "hidden" : "auto", minHeight: 0, display: "flex", flexDirection: "column" }}>

                {/* ─── TRAINING WEEK ─── */}
                {view === "week" && (
                  <div className="no-scroll fade-up" style={{ padding: "20px 0 40px", overflowY: "auto", flex: 1 }}>
                    {/* Horizontal Stat Scroll */}
                    <div className="no-scroll" style={{ display: "flex", overflowX: "auto", gap: 12, padding: "0 24px 20px" }}>
                      {[
                        { label: "Compliance", value: `${client.compliance}%`, color: compColor(client.compliance), icon: "✅" },
                        { label: "Streak", value: `${client.streak} days`, color: client.accent, icon: "🔥" },
                        { label: "Done", value: `${client.sessions.filter(s=>s.status==="done").length}/${client.sessions.length}`, color: "#00C896", icon: "💪" },
                        { label: "Missed", value: `${client.sessions.filter(s=>s.status==="missed").length}`, color: client.sessions.filter(s=>s.status==="missed").length > 1 ? "#FF4D00" : "#FFB800", icon: "⚠️" },
                      ].map((item, i) => (
                        <div key={i} style={{
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 16, padding: "16px", minWidth: 120, flexShrink: 0, position: "relative"
                        }}>
                          <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                          <div style={{ fontFamily: "Barlow Condensed", fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{item.label}</div>
                          {/* Live indicator on Compliance card */}
                          {i === 0 && todayTotalCount > 0 && (
                            <div style={{
                              position: "absolute", bottom: 8, right: 8,
                              display: "flex", alignItems: "center", gap: 4,
                              background: "rgba(0,200,150,0.15)", borderRadius: 8,
                              padding: "3px 6px"
                            }}>
                              <div className="live" style={{ width: 5, height: 5, borderRadius: "50%", background: "#00C896" }} />
                              <span style={{ fontSize: 10, color: "#00C896", fontWeight: 700, fontFamily: "Barlow Condensed" }}>
                                {todayDoneCount}/{todayTotalCount}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: "0 24px" }}>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 16 }}>This Week's Plan</div>

                      {client.sessions.length === 0 ? (
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
                          <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>📅</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No sessions planned yet</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Tap + to add a session</div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {client.sessions.map((s, i) => {
                            const tc = typeConfig[s.type];
                            const donePct = s.type !== "rest" ? Math.round((s.exercises.filter(e=>e.done).length / s.exercises.length) * 100) : 100;
                            const isActive = activeDay === i;

                            return (
                              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? tc.color+"50" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, overflow: "hidden", transition: "all 0.3s" }}>
                                {/* Card Header */}
                                <div className="btn" onClick={() => setActiveDay(isActive ? null : i)} style={{ padding: "16px", display: "flex", alignItems: "center", gap: 16 }}>
                                  <div style={{
                                    width: 44, height: 44, borderRadius: 12, background: s.status === "done" ? tc.bg : "rgba(255,255,255,0.05)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                                  }}>{tc.icon}</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{s.day}</span>
                                      <span style={{ fontSize: 10, color: tc.color, fontFamily: "Barlow Condensed", fontWeight: 700, padding: "2px 6px", background: `${tc.color}15`, borderRadius: 4 }}>{tc.label}</span>
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 600 }}>{s.label}</div>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    {s.status === "done" && <div style={{ fontSize: 11, color: "#00C896", fontWeight: 700 }}>DONE</div>}
                                    {s.status === "missed" && <div style={{ fontSize: 11, color: "#FF4D00", fontWeight: 700 }}>MISSED</div>}
                                    {s.status === "upcoming" && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>UPCOMING</div>}
                                    {s.type !== "rest" && <div style={{ width: 40, marginTop: 6 }}><ProgressBar value={donePct} max={100} color={tc.color} height={3} /></div>}
                                  </div>
                                </div>

                                {/* Card Expanded Content */}
                                {isActive && (
                                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                                    <div style={{ marginTop: 16 }}>
                                      {s.exercises.map((ex, exIdx) => (
                                        <div key={exIdx} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: exIdx === s.exercises.length-1 ? "none" : "1px dashed rgba(255,255,255,0.1)" }}>
                                          <div style={{ width: 20, fontSize: 14 }}>{ex.done ? "✅" : "○"}</div>
                                          <div style={{ flex: 1, paddingLeft: 10 }}>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</div>
                                            <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Barlow Condensed" }}>
                                              <span>{ex.sets}</span>
                                              <span>{ex.weight}</span>
                                            </div>
                                          </div>
                                          {ex.actual && <div style={{ fontSize: 12, color: ex.done ? "#00C896" : "rgba(255,255,255,0.4)", fontFamily: "Barlow Condensed", textAlign: "right", maxWidth: 80 }}>{ex.actual}</div>}
                                        </div>
                                      ))}
                                    </div>
                                    <button className="btn" onClick={(e) => { e.stopPropagation(); setShowModal(true); }} style={{
                                      width: "100%", marginTop: 16, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: "10px", color: "white", fontSize: 12, fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: "0.05em"
                                    }}>EDIT SESSION</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Smartwatch Data */}
                      <div style={{ marginTop: 30, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>⌚ Device Data</div>
                          {client.connected && <div style={{ fontSize: 11, color: "#00C896", display: "flex", alignItems: "center", gap: 6 }}><span className="live" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C896" }}/> Live</div>}
                        </div>
                        {client.connected ? (
                          <div className="no-scroll" style={{ display: "flex", overflowX: "auto", gap: 10, paddingBottom: 4 }}>
                            <StatPill minWidth={140} icon="🔥" value={`${1840 + (tick % 3) * 30} kcal`} label="Burned" color={client.accent} />
                            <StatPill minWidth={110} icon="❤️" value={`${58 + (tick % 4)} bpm`} label="Rest HR" color="#FF4D00" />
                            <StatPill minWidth={120} icon="👟" value={client.stats.steps.toLocaleString()} label="Steps" color="#FFB800" />
                            <StatPill minWidth={110} icon="💤" value={`${client.stats.sleep}h`} label="Sleep" color="#818CF8" />
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>No device connected</div>
                            <button className="btn" onClick={() => notify("Invite sent!")} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "10px 16px", color: "white", fontSize: 12, fontWeight: 600 }}>Send Connect Invite</button>
                          </div>
                        )}
                      </div>

                      {/* ─── FOOD PHOTO LOG SECTION ─── */}
                      <div style={{ marginTop: 30 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>
                            🍽️ Food Photos
                          </div>
                          {foodPhotos.filter((p) => !p.coach_seen).length > 0 && (
                            <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: `${client.accent}25`, color: client.accent, fontWeight: 700 }}>
                              {foodPhotos.filter((p) => !p.coach_seen).length} new
                            </div>
                          )}
                        </div>

                        {foodPhotos.length === 0 ? (
                          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>🍽️</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No food photos logged yet</div>
                          </div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {foodPhotos.map((photo) => (
                              <div
                                key={photo.id}
                                className="photo-thumb"
                                onClick={() => openPhoto(photo)}
                                style={{
                                  aspectRatio: "1/1", borderRadius: 12, overflow: "hidden",
                                  background: "rgba(255,255,255,0.05)",
                                  border: `1px solid ${!photo.coach_seen ? client.accent + "60" : "rgba(255,255,255,0.08)"}`,
                                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                              >
                                {photo.public_url ? (
                                  <img
                                    src={photo.public_url}
                                    alt={photo.caption || "Food"}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <span style={{ fontSize: 28, opacity: 0.3 }}>🍽️</span>
                                )}
                                {/* Unseen dot */}
                                {!photo.coach_seen && (
                                  <div style={{
                                    position: "absolute", top: 6, right: 6,
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: client.accent,
                                    boxShadow: `0 0 6px ${client.accent}`
                                  }} />
                                )}
                                {/* Meal type label */}
                                {photo.meal_type && (
                                  <div style={{
                                    position: "absolute", bottom: 0, left: 0, right: 0,
                                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                    padding: "12px 6px 5px",
                                    fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)",
                                    fontFamily: "Barlow Condensed", textTransform: "uppercase",
                                    letterSpacing: "0.04em", textAlign: "center"
                                  }}>
                                    {photo.meal_type}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* ─── END FOOD PHOTO SECTION ─── */}

                    </div>
                  </div>
                )}

                {/* ─── BODY STATS ─── */}
                {view === "body" && (
                  <div className="fade-up" style={{ padding: "20px 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Weight Card */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Weight Progress</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                        <div>
                          <div style={{ fontFamily: "Barlow Condensed", fontSize: 46, fontWeight: 800, lineHeight: 1 }}>{client.weight}<span style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>kg</span></div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{client.goal === "Fat Loss" ? "↓" : "↑"} {Math.abs((client.weight - client.startWeight).toFixed(1))}kg total</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Target: {client.targetWeight}kg</div>
                          <div style={{ fontSize: 14, color: client.accent, fontWeight: 700, marginTop: 4 }}>{Math.abs((client.targetWeight - client.weight).toFixed(1))}kg left</div>
                        </div>
                      </div>
                      <WeightChart history={client.weightHistory} accent={client.accent} />
                      <div style={{ marginTop: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Overall Progress</span>
                          <span style={{ fontSize: 12, color: client.accent, fontWeight: 700 }}>{Math.max(0, weightPct)}%</span>
                        </div>
                        <ProgressBar value={Math.max(0, weightPct)} max={100} color={client.accent} height={6} glow />
                      </div>
                    </div>

                    {/* Body Fat Card */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Body Fat</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                        <div style={{ fontFamily: "Barlow Condensed", fontSize: 46, fontWeight: 800, lineHeight: 1 }}>{client.bodyFat}<span style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>%</span></div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Target: {client.targetBodyFat}%</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { label: "Essential", range: [3, 6], color: "#818CF8" },
                          { label: "Athletic", range: [6, 14], color: "#00C896" },
                          { label: "Fitness", range: [14, 21], color: "#FFB800" },
                          { label: "Average", range: [21, 28], color: "#FF8C42" },
                        ].map(zone => {
                          const isActive = client.bodyFat >= zone.range[0] && client.bodyFat < zone.range[1];
                          return (
                            <div key={zone.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px", background: isActive ? `${zone.color}15` : "transparent", borderRadius: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? zone.color : "rgba(255,255,255,0.1)", boxShadow: isActive ? `0 0 8px ${zone.color}` : "none" }} />
                              <div>
                                <div style={{ fontSize: 12, color: isActive ? "white" : "rgba(255,255,255,0.4)", fontWeight: isActive ? 600 : 400 }}>{zone.label}</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "Barlow Condensed" }}>{zone.range[0]}–{zone.range[1]}%</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Measurements Matrix */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Measurements (cm)</div>
                        <button className="btn" onClick={() => notify("Ready to log")} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 11, fontWeight: 600 }}>+ LOG</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        {Object.entries(client.measurements).map(([key, val]) => (
                          <div key={key} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 10px", textAlign: "center" }}>
                            <div style={{ fontFamily: "Barlow Condensed", fontSize: 26, fontWeight: 800, color: client.accent }}>{val}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "capitalize" }}>{key}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── BUILD PLAN ─── */}
                {view === "build" && (
                  <div className="fade-up" style={{ padding: "20px 24px 40px", display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* Settings */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Program Settings</div>
                      {[
                        { label: "Goal", value: client.goal, options: GOALS },
                        { label: "Phase", value: client.phase, options: PHASES },
                        { label: "Days / Week", value: "5", options: ["3","4","5","6"] },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                          <select defaultValue={item.value} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 13, fontFamily: "Barlow Condensed", fontWeight: 700, outline: "none" }}>
                            {item.options.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                      <button className="btn" onClick={() => notify("Settings Saved")} style={{ width: "100%", background: client.accent, border: "none", borderRadius: 12, padding: "14px", color: "white", fontSize: 14, fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: "0.05em", marginTop: 8 }}>SAVE SETTINGS</button>
                    </div>

                    {/* Quick Templates */}
                    <div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Quick Templates</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { name: "Push Day", type: "strength", exercises: "Bench, OHP, Flyes" },
                          { name: "Pull Day", type: "strength", exercises: "Row, Pulldown, Curl" },
                          { name: "Leg Day", type: "strength", exercises: "Squat, RDL, Press" },
                          { name: "HIIT Cardio", type: "cardio", exercises: "30min Intervals" },
                        ].map((tpl, i) => (
                          <button key={i} className="btn" onClick={() => { setShowModal(true); setPlanForm(f => ({ ...f, type: tpl.type, label: tpl.name })); }} style={{
                            background: "rgba(255,255,255,0.04)", border: `1px solid ${typeConfig[tpl.type].color}30`, borderRadius: 14, padding: "16px", color: "white", display: "flex", alignItems: "center", gap: 16, textAlign: "left"
                          }}>
                            <span style={{ fontSize: 24 }}>{typeConfig[tpl.type].icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 600 }}>{tpl.name}</div>
                              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{tpl.exercises}</div>
                            </div>
                            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.2)" }}>+</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── PROGRESS CHECK-INS ─── */}
                {view === "progress" && (() => {
                  const ANGLES = ["front", "back", "left", "right"];

                  // Group all photos by logged_date, newest first
                  const dateGroups = progressPhotos.reduce((acc, p) => {
                    const date = p.logged_date || p.created_at?.split("T")[0] || "Unknown";
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(p);
                    return acc;
                  }, {});
                  const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));

                  return (
                    <div className="no-scroll fade-up" style={{ overflowY: "auto", flex: 1, padding: "20px 24px 40px", display: "flex", flexDirection: "column", gap: 28 }}>

                      {/* Empty state */}
                      {progressPhotos.length === 0 && (
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "48px 20px", textAlign: "center" }}>
                          <div style={{ fontSize: 40, opacity: 0.2, marginBottom: 12 }}>📸</div>
                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>No check-ins yet</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Photos uploaded by {client.name} will appear here</div>
                        </div>
                      )}

                      {/* One card per check-in date */}
                      {sortedDates.map((date, di) => {
                        const photos = dateGroups[date];
                        const isToday = date === new Date().toISOString().split("T")[0];
                        const anglesPresent = ANGLES.filter(a => photos.some(p => p.angle === a));
                        return (
                          <div key={date}>
                            {/* Date header */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                              <div style={{
                                background: isToday ? `${client.accent}20` : "rgba(255,255,255,0.06)",
                                border: `1px solid ${isToday ? client.accent + "40" : "rgba(255,255,255,0.1)"}`,
                                borderRadius: 10, padding: "6px 14px",
                              }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? client.accent : "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                  {isToday ? "Today" : new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                                  {anglesPresent.length}/4 angles · Check-in #{sortedDates.length - di}
                                </div>
                              </div>
                              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                            </div>

                            {/* 2×2 photo grid for this check-in */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {ANGLES.map(angle => {
                                const photo = photos.find(p => p.angle === angle);
                                return (
                                  <div key={angle} style={{
                                    aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", position: "relative",
                                    background: "rgba(255,255,255,0.04)",
                                    border: photo ? "1px solid rgba(255,255,255,0.1)" : "1px dashed rgba(255,255,255,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}>
                                    {photo?.public_url ? (
                                      <>
                                        <img src={photo.public_url} alt={angle} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                                        <div style={{
                                          position: "absolute", bottom: 0, left: 0, right: 0,
                                          background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                                          padding: "20px 10px 8px", display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                                        }}>
                                          <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "Barlow Condensed", color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{angle}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                        <span style={{ fontSize: 22, opacity: 0.15 }}>📷</span>
                                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{angle}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* ─── BILLING ─── */}
                {view === "billing" && (
                  <div className="fade-up" style={{ padding: "20px 24px 40px", overflowY: "auto", flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div>
                        <div style={{ fontFamily: "Barlow Condensed", fontSize: 22, fontWeight: 800 }}>Invoices</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                          {invoices.filter(i => i.status === "pending").length} pending · {invoices.filter(i => i.status === "paid").length} paid
                        </div>
                      </div>
                      <button className="btn" onClick={() => setShowInvoiceModal(true)} style={{
                        background: client.accent, border: "none", borderRadius: 12, padding: "10px 16px",
                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      }}>
                        + Send Invoice
                      </button>
                    </div>

                    {/* Invoice list */}
                    {invoices.length === 0 ? (
                      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "40px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>🧾</div>
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>No invoices yet</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Tap "Send Invoice" to create one</div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {invoices.map(inv => (
                          <div key={inv.id} style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${inv.status === "paid" ? "rgba(0,200,150,0.25)" : inv.status === "cancelled" ? "rgba(255,255,255,0.08)" : `${client.accent}33`}`,
                            borderRadius: 16, padding: "16px 18px",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{inv.description}</div>
                                <div style={{ fontFamily: "Barlow Condensed", fontSize: 26, fontWeight: 800, color: inv.status === "paid" ? "#00C896" : client.accent }}>
                                  ${(inv.amount_cents / 100).toFixed(2)}
                                </div>
                                {inv.due_date && (
                                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Due {inv.due_date}</div>
                                )}
                                {inv.paid_at && (
                                  <div style={{ fontSize: 11, color: "#00C896", marginTop: 4 }}>Paid {new Date(inv.paid_at).toLocaleDateString()}</div>
                                )}
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                                  Sent {new Date(inv.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div style={{
                                fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, textTransform: "uppercase", letterSpacing: 0.5,
                                background: inv.status === "paid" ? "rgba(0,200,150,0.15)" : inv.status === "cancelled" ? "rgba(255,255,255,0.06)" : `${client.accent}20`,
                                color: inv.status === "paid" ? "#00C896" : inv.status === "cancelled" ? "rgba(255,255,255,0.3)" : client.accent,
                              }}>
                                {inv.status}
                              </div>
                            </div>
                            {inv.status === "pending" && inv.stripe_payment_link_url && (
                              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                                <a href={inv.stripe_payment_link_url} target="_blank" rel="noopener noreferrer" style={{
                                  fontSize: 12, color: client.accent, textDecoration: "none", fontWeight: 600,
                                  padding: "6px 12px", background: `${client.accent}15`, borderRadius: 8, border: `1px solid ${client.accent}30`,
                                }}>
                                  View Payment Link ↗
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── CHAT ─── */}
                {view === "chat" && (
                  <div className="fade-up" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                    {/* Messages list */}
                    <div className="no-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
                      {messages.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>💬</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No messages yet. Say hi!</div>
                        </div>
                      )}
                      {messages.map((msg) => {
                        const isCoach = msg.sender === "coach";
                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              justifyContent: isCoach ? "flex-end" : "flex-start",
                              marginBottom: 10,
                            }}
                          >
                            <div style={{
                              maxWidth: "75%",
                              background: isCoach ? client.accent : "rgba(255,255,255,0.08)",
                              borderRadius: isCoach ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                              padding: "10px 14px",
                            }}>
                              {msg.media_url && (
                                <img
                                  src={msg.media_url}
                                  alt="media"
                                  style={{ width: "100%", borderRadius: 10, marginBottom: 6, display: "block" }}
                                />
                              )}
                              <div style={{ fontSize: 14, lineHeight: 1.45 }}>{msg.content}</div>
                              <div style={{ fontSize: 10, color: isCoach ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)", marginTop: 4, textAlign: isCoach ? "right" : "left" }}>
                                {msg.created_at
                                  ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                  : ""}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input bar */}
                    <div style={{
                      padding: "10px 16px 16px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", gap: 10, alignItems: "flex-end",
                      background: "rgba(10,10,10,0.95)",
                    }}>
                      <textarea
                        value={msgInput}
                        onChange={(e) => setMsgInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Message client…"
                        rows={1}
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 20, padding: "10px 16px",
                          color: "white", fontSize: 14,
                          fontFamily: "inherit", outline: "none",
                          resize: "none", lineHeight: 1.4,
                          maxHeight: 100, overflowY: "auto",
                        }}
                      />
                      <button
                        className="btn"
                        onClick={sendMessage}
                        disabled={!msgInput.trim() || msgSending}
                        style={{
                          width: 42, height: 42, borderRadius: "50%",
                          background: msgInput.trim() && !msgSending ? client.accent : "rgba(255,255,255,0.1)",
                          border: "none", color: "white", fontSize: 18,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                          transition: "background 0.2s",
                          opacity: msgSending ? 0.6 : 1,
                        }}
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM TAB BAR */}
              <div style={{
                height: 84, background: "rgba(10, 10, 10, 0.9)", backdropFilter: "blur(10px)",
                borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-around",
                padding: "10px 10px 24px", flexShrink: 0
              }}>
                {[
                  { id: "week", icon: "📅", label: "Week" },
                  { id: "body", icon: "📊", label: "Body" },
                  { id: "build", icon: "🛠️", label: "Build" },
                  { id: "chat", icon: "💬", label: "Chat", badge: messages.filter(m => m.sender === "client").length > 0 },
                  { id: "progress", icon: "📸", label: "Progress", badge: progressPhotos.length > 0 && progressPhotos[0]?.created_at > new Date(Date.now() - 86400000).toISOString() },
                  { id: "billing", icon: "💳", label: "Billing", badge: invoices.some(i => i.status === "pending") },
                ].map(tab => (
                  <div key={tab.id} onClick={() => setView(tab.id)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, cursor: "pointer",
                    opacity: view === tab.id ? 1 : 0.4, transition: "opacity 0.2s",
                    position: "relative"
                  }}>
                    <span style={{ fontSize: 22 }}>{tab.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
                    {tab.badge && view !== "chat" && (
                      <div style={{
                        position: "absolute", top: -2, right: "calc(50% - 18px)",
                        width: 8, height: 8, borderRadius: "50%",
                        background: client.accent,
                        boxShadow: `0 0 6px ${client.accent}`
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Fake iOS Home Indicator */}
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 130, height: 5, background: "rgba(255,255,255,0.8)", borderRadius: 3, zIndex: 100 }} />
      </div>
    </div>
  );
}
