import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine, CartesianGrid,
} from "recharts";
import {
  Sunrise, Coffee, Footprints, Egg, Droplets, Utensils, Activity,
  Dumbbell, Moon, BedDouble, Check, Plus, Minus, ChevronLeft,
  ChevronRight, Flame, Target, CalendarDays, ListChecks, TrendingDown,
  Download, Share, X, Smartphone,
} from "lucide-react";

/* ----------------------------------------------------------------
   THE CUT — a discipline protocol tracker
   Warm-ink palette, monospace clock readout, timeline spine.
-----------------------------------------------------------------*/

const C = {
  bg: "#111217",
  surface: "#191B21",
  surface2: "#21242C",
  line: "#2B2E38",
  lineSoft: "#23262F",
  text: "#F3F0E8",
  sub: "#9C9FAA",
  faint: "#686B76",
  accent: "#F0A03C",
  accentSoft: "#3A2D17",
  accentLine: "#5C4524",
  ink: "#16110A",
  bad: "#D9685E",
};

const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
const SANS = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";

/* ---- the daily schedule (routineMin = minutes since 9:30 wake) ---- */
const TIMELINE = [
  { id: "wake", min: 0, time: "9:30 AM", title: "Wake up", icon: Sunrise,
    detail: "750 ml water · 10–15 min sunlight · no phone" },
  { id: "caffeine", min: 15, time: "9:45 AM", title: "Coffee or green tea", icon: Coffee,
    detail: "Optional, no sugar" },
  { id: "fastedwalk", min: 30, time: "10:00 AM", title: "Fasted walk", icon: Footprints,
    detail: "45 min brisk · talking feels hard · 4–5k steps" },
  { id: "breakfast", min: 105, time: "11:15 AM", title: "Breakfast", icon: Egg,
    detail: "4 eggs + 2 whites · 1 fruit · ~35–40 g protein" },
  { id: "hydrate", min: 210, time: "1:00 PM", title: "Focus block · hydrate", icon: Droplets,
    detail: "Hit 1.5 L water by now" },
  { id: "lunch", min: 270, time: "2:00 PM", title: "Lunch", icon: Utensils,
    detail: "200 g chicken/fish/paneer · salad · rice or 2 rotis · ~40–50 g" },
  { id: "move", min: 330, time: "3:00 PM", title: "Work · move hourly", icon: Activity,
    detail: "Stand 2–3 min each hour · +2–3k steps" },
  { id: "preworkout", min: 480, time: "5:30 PM", title: "Pre-workout", icon: Coffee,
    detail: "Whey shake · black coffee if wanted" },
  { id: "gym", min: 540, time: "6:30 PM", title: "Gym", icon: Dumbbell,
    detail: "See Train tab for today's split" },
  { id: "postcardio", min: 615, time: "7:45 PM", title: "Post-workout cardio", icon: Footprints,
    detail: "20 min incline treadmill · +150–250 kcal" },
  { id: "dinner", min: 660, time: "8:30 PM", title: "Dinner", icon: Utensils,
    detail: "200 g protein · veg · salad · keep carbs low · ~40–50 g" },
  { id: "recoverywalk", min: 750, time: "10:00 PM", title: "Recovery walk", icon: Footprints,
    detail: "Easy 15–20 min · helps digestion + glucose" },
  { id: "winddown", min: 810, time: "11:00 PM", title: "Wind down", icon: Moon,
    detail: "No heavy meals · no sweets · finish your water" },
  { id: "sleepprep", min: 870, time: "12:00 AM", title: "Sleep prep", icon: BedDouble,
    detail: "Dim lights · read or relax" },
  { id: "sleep", min: 900, time: "12:30 AM", title: "Sleep", icon: BedDouble,
    detail: "Lights out" },
];

/* ---- non-negotiables ---- */
const COUNTERS = [
  { id: "steps", label: "Steps", icon: Footprints, target: 12000, step: 500, unit: "" },
  { id: "protein", label: "Protein", icon: Egg, target: 150, step: 10, unit: "g" },
  { id: "water", label: "Water", icon: Droplets, target: 3500, step: 250, unit: "ml" },
];
const TOGGLES = [
  { id: "morningWalk", label: "45 min morning walk" },
  { id: "postCardio", label: "20 min post-gym cardio" },
  { id: "sunlight", label: "10–15 min sunlight" },
  { id: "noSugar", label: "No sugary drinks" },
  { id: "noAlcohol", label: "No alcohol" },
];

/* ---- training split by weekday (0 Sun .. 6 Sat) ---- */
const WORKOUTS = {
  1: { name: "Push", sub: "Chest · Shoulders · Triceps", ex: [
    { n: "Bench Press", sets: 4 }, { n: "Incline DB Press", sets: 3 },
    { n: "Shoulder Press", sets: 3 }, { n: "Lateral Raises", sets: 3 },
    { n: "Tricep Pushdowns", sets: 3 } ] },
  2: { name: "Pull", sub: "Back · Biceps", ex: [
    { n: "Pull-Ups / Lat Pulldown", sets: 4 }, { n: "Barbell Row", sets: 4 },
    { n: "Seated Cable Row", sets: 3 }, { n: "Face Pulls", sets: 3 },
    { n: "Bicep Curls", sets: 3 } ] },
  3: { name: "Legs", sub: "Quads · Hamstrings · Calves", ex: [
    { n: "Squats", sets: 4 }, { n: "Romanian Deadlift", sets: 3 },
    { n: "Leg Press", sets: 3 }, { n: "Leg Curl", sets: 3 },
    { n: "Calf Raises", sets: 4 } ] },
  4: { name: "Push", sub: "Chest · Shoulders · Triceps", ex: [
    { n: "Bench Press", sets: 4 }, { n: "Incline DB Press", sets: 3 },
    { n: "Shoulder Press", sets: 3 }, { n: "Lateral Raises", sets: 3 },
    { n: "Tricep Pushdowns", sets: 3 } ] },
  5: { name: "Pull", sub: "Back · Biceps", ex: [
    { n: "Pull-Ups / Lat Pulldown", sets: 4 }, { n: "Barbell Row", sets: 4 },
    { n: "Seated Cable Row", sets: 3 }, { n: "Face Pulls", sets: 3 },
    { n: "Bicep Curls", sets: 3 } ] },
  6: { name: "Legs + Core", sub: "Legs · Abs", ex: [
    { n: "Squats", sets: 4 }, { n: "Romanian Deadlift", sets: 3 },
    { n: "Leg Press", sets: 3 }, { n: "Leg Curl", sets: 3 },
    { n: "Calf Raises", sets: 3 }, { n: "Hanging Leg Raises", sets: 3 },
    { n: "Plank", sets: 3 } ] },
  0: { name: "Rest", sub: "Long walk only", ex: [] },
};

const IMPACT = [
  "Calorie deficit held for 8–12 weeks",
  "12k steps every day",
  "High protein (140–160 g)",
  "Consistent weight training",
  "Good sleep",
  "Low alcohol & processed food",
  "Hydration & sodium control",
];

/* ----------------------- storage helper -----------------------
   Per-device local database. Data lives on the user's own device
   (their phone / browser) via localStorage — it persists across
   refreshes and app restarts and is never sent anywhere.
   Resolution order:
     1) window.storage bridge  (native host / webview, if present)
     2) localStorage           (the device-local DB — normal case)
     3) in-memory map          (private mode / SSR fallback, session only)
-----------------------------------------------------------------*/
const mem = {};
const DB = "thecut:"; // key namespace so we never collide with other apps on the origin
const hasLS = () => {
  try {
    if (typeof localStorage === "undefined") return false;
    const k = "__thecut_probe__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) { return false; }
};

const store = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage?.get) {
        const r = await window.storage.get(key);
        return r ? r.value : null;
      }
    } catch (e) { /* fall through */ }
    if (hasLS()) {
      const v = localStorage.getItem(DB + key);
      return v === null ? null : v;
    }
    return key in mem ? mem[key] : null;
  },
  async set(key, value) {
    mem[key] = value;
    try {
      if (typeof window !== "undefined" && window.storage?.set) {
        await window.storage.set(key, value);
        return;
      }
    } catch (e) { /* fall through */ }
    if (hasLS()) {
      try { localStorage.setItem(DB + key, value); }
      catch (e) { /* quota exceeded — keep the in-memory copy */ }
    }
  },
};

/* ----------------------- date utils ----------------------- */
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const todayStr = () => fmt(new Date());
const parseD = (s) => new Date(s + "T00:00:00");
const shiftDay = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return fmt(d); };
const prettyDate = (s) => {
  const d = parseD(s);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  return `${wd}, ${mo} ${d.getDate()}`;
};

/* day completion 0..1 from a day object */
const dayPct = (day) => {
  if (!day) return 0;
  let total = 0;
  for (const c of COUNTERS) {
    const v = day.counters?.[c.id] || 0;
    total += Math.min(v / c.target, 1);
  }
  for (const t of TOGGLES) total += day.toggles?.[t.id] ? 1 : 0;
  const n = COUNTERS.length + TOGGLES.length;
  return total / n;
};

const emptyDay = () => ({ counters: {}, toggles: {}, tasks: {}, workout: {} });

/* =================================================================
   APP
==================================================================*/
export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("today");
  const [date, setDate] = useState(todayStr());
  const [day, setDay] = useState(emptyDay());
  const [profile, setProfile] = useState({
    startWeight: 72, goalWeight: 67.5, startDate: todayStr(),
    height: "5'8\"", age: 30,
  });
  const [weightLog, setWeightLog] = useState({});
  const [summary, setSummary] = useState({});
  const [nowMin, setNowMin] = useState(() => {
    const n = new Date(); return n.getHours() * 60 + n.getMinutes();
  });

  /* initial load */
  useEffect(() => {
    (async () => {
      const p = await store.get("profile");
      if (p) setProfile(JSON.parse(p));
      else await store.set("profile", JSON.stringify({
        startWeight: 72, goalWeight: 67.5, startDate: todayStr(),
        height: "5'8\"", age: 30,
      }));
      const wl = await store.get("weightLog");
      if (wl) setWeightLog(JSON.parse(wl));
      const sm = await store.get("summary");
      if (sm) setSummary(JSON.parse(sm));
      setReady(true);
    })();
  }, []);

  /* load day when date changes */
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const d = await store.get("day:" + date);
      setDay(d ? JSON.parse(d) : emptyDay());
    })();
  }, [date, ready]);

  /* tick clock every minute */
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date(); setNowMin(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(t);
  }, []);

  /* persist a day + roll up summary */
  const saveDay = async (next) => {
    setDay(next);
    await store.set("day:" + date, JSON.stringify(next));
    const pct = Math.round(dayPct(next) * 100);
    const sm = { ...summary, [date]: pct };
    setSummary(sm);
    await store.set("summary", JSON.stringify(sm));
  };

  const setCounter = (id, val) => {
    const v = Math.max(0, val);
    saveDay({ ...day, counters: { ...day.counters, [id]: v } });
  };
  const toggleNN = (id) => {
    saveDay({ ...day, toggles: { ...day.toggles, [id]: !day.toggles?.[id] } });
  };
  const toggleTask = (id) => {
    saveDay({ ...day, tasks: { ...day.tasks, [id]: !day.tasks?.[id] } });
  };
  const toggleSet = (exName, i) => {
    const cur = day.workout?.[exName] ? [...day.workout[exName]] : [];
    cur[i] = !cur[i];
    saveDay({ ...day, workout: { ...day.workout, [exName]: cur } });
  };

  const logWeight = async (kg) => {
    const wl = { ...weightLog, [date]: kg };
    setWeightLog(wl);
    await store.set("weightLog", JSON.stringify(wl));
  };
  const saveProfile = async (p) => {
    setProfile(p);
    await store.set("profile", JSON.stringify(p));
  };

  const isToday = date === todayStr();
  const canGoForward = date < todayStr();
  const pct = dayPct(day);
  const routineNow = ((nowMin - 570) % 1440 + 1440) % 1440;

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: SANS, color: C.faint }}>
        <div style={{ letterSpacing: "0.3em", fontSize: 12, textTransform: "uppercase" }}>
          Loading protocol…
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS,
      color: C.text, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 440, position: "relative",
        paddingBottom: 86, minHeight: "100vh", background: C.bg }}>

        <Header
          date={date} setDate={setDate} isToday={isToday}
          canGoForward={canGoForward} pct={pct} summary={summary}
        />

        <div style={{ padding: "0 16px" }}>
          {tab === "today" && (
            <Today
              day={day} routineNow={routineNow} isToday={isToday}
              setCounter={setCounter} toggleNN={toggleNN} toggleTask={toggleTask}
            />
          )}
          {tab === "train" && (
            <Train date={date} day={day} toggleSet={toggleSet} />
          )}
          {tab === "progress" && (
            <Progress
              profile={profile} weightLog={weightLog} summary={summary}
              date={date} logWeight={logWeight} saveProfile={saveProfile}
            />
          )}
          {tab === "plan" && <Plan />}
        </div>

        <Nav tab={tab} setTab={setTab} />
        <InstallPrompt />
      </div>
    </div>
  );
}

/* ----------------------------- HEADER ----------------------------- */
function Header({ date, setDate, isToday, canGoForward, pct, summary }) {
  const streak = computeStreak(summary);
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: C.bg,
      borderBottom: `1px solid ${C.lineSoft}`, padding: "16px 16px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase",
            color: C.accent, fontWeight: 700 }}>The Cut · Day Protocol</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <IconBtn onClick={() => setDate(shiftDay(date, -1))}><ChevronLeft size={18} /></IconBtn>
            <div style={{ fontSize: 19, fontWeight: 700, minWidth: 118, textAlign: "center" }}>
              {isToday ? "Today" : prettyDate(date)}
            </div>
            <IconBtn onClick={() => canGoForward && setDate(shiftDay(date, 1))} dim={!canGoForward}>
              <ChevronRight size={18} />
            </IconBtn>
          </div>
          {!isToday && (
            <button onClick={() => setDate(todayStr())} style={{
              marginTop: 6, fontSize: 11, color: C.accent, background: "none",
              border: "none", padding: 0, cursor: "pointer", fontFamily: SANS }}>
              ← back to today
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <Flame size={14} color={C.accent} />
              <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700 }}>{streak}</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: C.faint, marginTop: 2 }}>day streak</div>
          </div>
          <Ring pct={pct} size={46} stroke={5} />
        </div>
      </div>
    </div>
  );
}

function computeStreak(summary) {
  let s = 0;
  let d = todayStr();
  // allow today to be in-progress: if today < threshold, start from yesterday
  if ((summary[d] || 0) < 80) d = shiftDay(d, -1);
  while ((summary[d] || 0) >= 80) { s++; d = shiftDay(d, -1); }
  return s;
}

/* ----------------------------- TODAY ----------------------------- */
function Today({ day, routineNow, isToday, setCounter, toggleNN, toggleTask }) {
  // current block = last block whose min <= routineNow
  let curIdx = 0;
  for (let i = 0; i < TIMELINE.length; i++) {
    if (TIMELINE[i].min <= routineNow) curIdx = i;
  }
  const asleep = routineNow >= 900 || routineNow < 0;
  const current = TIMELINE[curIdx];
  const next = TIMELINE[Math.min(curIdx + 1, TIMELINE.length - 1)];
  const HeroIcon = (asleep ? Sunrise : current.icon);

  return (
    <div>
      {/* NOW card */}
      {isToday && (
        <div style={{ marginTop: 14, background: C.surface,
          border: `1px solid ${C.accentLine}`, borderRadius: 18, padding: 16,
          position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0,
            background: `radial-gradient(120% 90% at 100% 0%, ${C.accentSoft} 0%, transparent 55%)` }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: C.accent, fontWeight: 700 }}>
              {asleep ? "Rest" : "Right now"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.accentSoft,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HeroIcon size={22} color={C.accent} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.15 }}>
                  {asleep ? "Sleep — recover" : current.title}
                </div>
                <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3 }}>
                  {asleep ? "Next up: Wake up · 9:30 AM" : current.detail}
                </div>
              </div>
            </div>
            {!asleep && (
              <div style={{ marginTop: 12, fontSize: 11.5, color: C.faint, fontFamily: MONO }}>
                Up next · {next.time} — {next.title}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-negotiables */}
      <SectionLabel icon={Target}>Non-negotiables</SectionLabel>
      <div style={{ display: "grid", gap: 10 }}>
        {COUNTERS.map((c) => (
          <CounterRow key={c.id} c={c} value={day.counters?.[c.id] || 0}
            onChange={(v) => setCounter(c.id, v)} />
        ))}
      </div>
      <div style={{ marginTop: 10, background: C.surface, border: `1px solid ${C.line}`,
        borderRadius: 16, overflow: "hidden" }}>
        {TOGGLES.map((t, i) => (
          <ToggleRow key={t.id} label={t.label} on={!!day.toggles?.[t.id]}
            onClick={() => toggleNN(t.id)} last={i === TOGGLES.length - 1} />
        ))}
      </div>

      {/* Timeline */}
      <SectionLabel icon={CalendarDays}>The day, hour by hour</SectionLabel>
      <div style={{ position: "relative", marginBottom: 8 }}>
        <div style={{ position: "absolute", left: 19, top: 8, bottom: 8, width: 2,
          background: C.line }} />
        {TIMELINE.map((b, i) => {
          const done = !!day.tasks?.[b.id];
          const isCur = isToday && i === curIdx && !(routineNow >= 900);
          const Icon = b.icon;
          return (
            <div key={b.id} style={{ position: "relative", display: "flex",
              gap: 14, padding: "9px 0", alignItems: "flex-start" }}
              onClick={() => toggleTask(b.id)}>
              <button aria-label={b.title} style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0, zIndex: 1,
                background: done ? C.accent : C.surface,
                border: `1.5px solid ${done ? C.accent : isCur ? C.accent : C.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer" }}>
                {done ? <Check size={20} color={C.ink} />
                  : <Icon size={18} color={isCur ? C.accent : C.sub} />}
              </button>
              <div style={{ flex: 1, paddingTop: 1, opacity: done ? 0.55 : 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11.5,
                    color: isCur ? C.accent : C.faint, fontWeight: 600 }}>{b.time}</span>
                  {isCur && <span style={{ fontSize: 9, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: C.accent, fontWeight: 700 }}>now</span>}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 1,
                  textDecoration: done ? "line-through" : "none" }}>{b.title}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{b.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- TRAIN ----------------------------- */
function Train({ date, day, toggleSet }) {
  const wd = parseD(date).getDay();
  const w = WORKOUTS[wd];
  const rest = w.ex.length === 0;

  let doneSets = 0, totalSets = 0;
  w.ex.forEach((e) => {
    totalSets += e.sets;
    const arr = day.workout?.[e.n] || [];
    for (let i = 0; i < e.sets; i++) if (arr[i]) doneSets++;
  });

  return (
    <div>
      <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.line}`,
        borderRadius: 18, padding: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0,
          background: `radial-gradient(120% 90% at 0% 0%, ${C.accentSoft} 0%, transparent 50%)` }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between",
          alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: C.accent, fontWeight: 700 }}>{prettyDate(date)}</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, lineHeight: 1 }}>{w.name}</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>{w.sub}</div>
          </div>
          {!rest && <Ring pct={totalSets ? doneSets / totalSets : 0} size={54} stroke={6} />}
        </div>
      </div>

      {rest ? (
        <div style={{ marginTop: 18, textAlign: "center", padding: "40px 20px",
          background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16 }}>
          <Footprints size={28} color={C.accent} style={{ margin: "0 auto" }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>Long walk only</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>
            No lifting today. Keep steps high and let the body recover.
          </div>
        </div>
      ) : (
        <>
          <SectionLabel icon={Dumbbell}>Tap each set as you finish</SectionLabel>
          <div style={{ display: "grid", gap: 10 }}>
            {w.ex.map((e) => {
              const arr = day.workout?.[e.n] || [];
              const done = arr.filter(Boolean).length;
              return (
                <div key={e.n} style={{ background: C.surface,
                  border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center" }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{e.n}</div>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: done >= e.sets ? C.accent : C.faint }}>
                      {done}/{e.sets}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                    {Array.from({ length: e.sets }).map((_, i) => {
                      const on = !!arr[i];
                      return (
                        <button key={i} onClick={() => toggleSet(e.n, i)} style={{
                          flex: 1, height: 38, borderRadius: 10, cursor: "pointer",
                          background: on ? C.accent : C.surface2,
                          border: `1px solid ${on ? C.accent : C.line}`,
                          color: on ? C.ink : C.sub, fontFamily: MONO, fontSize: 13,
                          fontWeight: 700 }}>
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: C.faint, textAlign: "center" }}>
            Finish with 20 min incline treadmill walk — log it under Today.
          </div>
        </>
      )}

      {/* week glance */}
      <SectionLabel icon={CalendarDays}>This week's split</SectionLabel>
      <div style={{ display: "grid", gap: 6, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5, 6, 0].map((d) => {
          const cur = d === wd;
          return (
            <div key={d} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "10px 14px", borderRadius: 10,
              background: cur ? C.accentSoft : C.surface,
              border: `1px solid ${cur ? C.accentLine : C.line}` }}>
              <span style={{ fontSize: 13, color: cur ? C.accent : C.sub, fontWeight: 600,
                width: 44 }}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{WORKOUTS[d].name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- PROGRESS ----------------------------- */
function Progress({ profile, weightLog, summary, date, logWeight, saveProfile }) {
  const entries = Object.entries(weightLog).map(([d, kg]) => ({ d, kg }))
    .sort((a, b) => a.d.localeCompare(b.d));
  const latest = entries.length ? entries[entries.length - 1].kg : profile.startWeight;
  const start = profile.startWeight;
  const goal = profile.goalWeight;
  const lost = +(start - latest).toFixed(1);
  const toGo = +(latest - goal).toFixed(1);
  const totalToLose = start - goal;
  const progPct = totalToLose > 0 ? Math.min(Math.max((start - latest) / totalToLose, 0), 1) : 0;

  const [input, setInput] = useState(String(latest));
  useEffect(() => { setInput(String(latest)); }, [latest, date]);

  const chartData = entries.map((e) => ({
    label: e.d.slice(5), kg: e.kg,
  }));
  const ys = entries.map((e) => e.kg).concat([goal, start]);
  const yMin = Math.floor(Math.min(...ys) - 1);
  const yMax = Math.ceil(Math.max(...ys) + 1);

  const last14 = Array.from({ length: 14 }).map((_, i) => {
    const d = shiftDay(todayStr(), -(13 - i));
    return { d, pct: summary[d] || 0 };
  });

  return (
    <div>
      {/* big weight */}
      <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.line}`,
        borderRadius: 18, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
              color: C.faint, fontWeight: 700 }}>Current weight</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 800,
                color: C.accent, lineHeight: 1 }}>{latest}</span>
              <span style={{ fontSize: 15, color: C.sub }}>kg</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Stat label="Lost" value={`${lost > 0 ? "−" : ""}${Math.abs(lost)} kg`} />
            <div style={{ height: 8 }} />
            <Stat label="To goal" value={`${Math.max(toGo, 0)} kg`} />
          </div>
        </div>
        {/* progress bar start -> goal */}
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 8, borderRadius: 6, background: C.surface2, overflow: "hidden" }}>
            <div style={{ width: `${progPct * 100}%`, height: "100%",
              background: C.accent, borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6,
            fontFamily: MONO, fontSize: 11, color: C.faint }}>
            <span>{start} kg start</span>
            <span style={{ color: C.accent }}>{goal} kg goal</span>
          </div>
        </div>
      </div>

      {/* log weight */}
      <div style={{ marginTop: 12, background: C.surface, border: `1px solid ${C.line}`,
        borderRadius: 16, padding: 14 }}>
        <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 10 }}>
          Log weight for {date === todayStr() ? "today" : prettyDate(date)}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setInput((v) => (Math.round((+v - 0.1) * 10) / 10).toFixed(1))}
            style={stepBtn}><Minus size={18} /></button>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            inputMode="decimal" style={{
              flex: 1, textAlign: "center", background: C.surface2,
              border: `1px solid ${C.line}`, borderRadius: 12, color: C.text,
              fontFamily: MONO, fontSize: 22, fontWeight: 700, padding: "10px 0",
              outline: "none" }} />
          <button onClick={() => setInput((v) => (Math.round((+v + 0.1) * 10) / 10).toFixed(1))}
            style={stepBtn}><Plus size={18} /></button>
        </div>
        <button onClick={() => { const k = parseFloat(input); if (!isNaN(k)) logWeight(k); }}
          style={{ marginTop: 10, width: "100%", background: C.accent, color: C.ink,
            border: "none", borderRadius: 12, padding: "12px 0", fontSize: 14,
            fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
          Save weight
        </button>
      </div>

      {/* chart */}
      <SectionLabel icon={TrendingDown}>Weight trend</SectionLabel>
      {entries.length < 2 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16,
          padding: "30px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 13.5, color: C.sub }}>
            Log your weight on a few different days and your trend line will appear here.
          </div>
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16,
          padding: "14px 8px 6px" }}>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{ top: 6, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.lineSoft} vertical={false} />
              <ReferenceArea y1={goal - 0.5} y2={goal + 0.5} fill={C.accent} fillOpacity={0.08} />
              <ReferenceLine y={goal} stroke={C.accentLine} strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: C.faint, fontSize: 10, fontFamily: MONO }}
                axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis domain={[yMin, yMax]} tick={{ fill: C.faint, fontSize: 10, fontFamily: MONO }}
                axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: C.surface2, border: `1px solid ${C.line}`,
                borderRadius: 10, fontFamily: MONO, fontSize: 12, color: C.text }}
                labelStyle={{ color: C.faint }} />
              <Area type="monotone" dataKey="kg" stroke={C.accent} strokeWidth={2.5}
                fill="url(#wg)" dot={{ r: 3, fill: C.accent, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* consistency */}
      <SectionLabel icon={ListChecks}>14-day consistency</SectionLabel>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16,
        padding: "16px 14px" }}>
        <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 70 }}>
          {last14.map((x) => (
            <div key={x.d} style={{ flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "flex-end", height: "100%" }}>
              <div style={{ width: "100%", height: `${Math.max(x.pct, 4)}%`,
                background: x.pct >= 80 ? C.accent : x.pct > 0 ? C.accentLine : C.surface2,
                borderRadius: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8,
          fontFamily: MONO, fontSize: 10, color: C.faint }}>
          <span>14d ago</span><span>today</span>
        </div>
      </div>

      {/* profile mini */}
      <div style={{ marginTop: 14, marginBottom: 4, display: "flex", gap: 10 }}>
        <MiniStat label="Age" value={profile.age} />
        <MiniStat label="Height" value={profile.height} />
        <MiniStat label="Start" value={`${profile.startWeight} kg`} />
        <MiniStat label="Goal" value={`${profile.goalWeight} kg`} />
      </div>
    </div>
  );
}

/* ----------------------------- PLAN ----------------------------- */
function Plan() {
  return (
    <div style={{ paddingBottom: 8 }}>
      <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.accentLine}`,
        borderRadius: 18, padding: 18 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
          color: C.accent, fontWeight: 700 }}>The goal</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8, lineHeight: 1.35 }}>
          Lose 0.5–0.7 kg/week while keeping muscle.
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>
          At 90% consistency you should reach 67–68 kg in 8–10 weeks — where facial
          definition and jawline visibility sharpen the most.
        </div>
      </div>

      <SectionLabel icon={Target}>Every single day</SectionLabel>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16,
        padding: "6px 0" }}>
        {["12,000+ steps", "140–160 g protein", "3.5–4 L water", "45 min morning walk",
          "20 min post-gym cardio", "10–15 min sunlight", "No sugary drinks", "No alcohol"]
          .map((t, i, a) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10,
              padding: "11px 16px", borderBottom: i < a.length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: C.accent }} />
              <span style={{ fontSize: 13.5 }}>{t}</span>
            </div>
          ))}
      </div>

      <SectionLabel icon={TrendingDown}>What moves your jawline most</SectionLabel>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16,
        padding: "6px 0" }}>
        {IMPACT.map((t, i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 12,
            padding: "11px 16px", borderBottom: i < IMPACT.length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: C.accent,
              width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 13.5 }}>{t}</span>
          </div>
        ))}
      </div>

      <SectionLabel icon={Dumbbell}>Training week</SectionLabel>
      <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <div key={d} style={{ display: "flex", gap: 12, alignItems: "center",
            padding: "11px 14px", background: C.surface, border: `1px solid ${C.line}`,
            borderRadius: 10 }}>
            <span style={{ fontSize: 12.5, color: C.faint, width: 40, fontWeight: 600 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{WORKOUTS[d].name}</span>
            <span style={{ fontSize: 11.5, color: C.sub, marginLeft: "auto" }}>{WORKOUTS[d].sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- SHARED UI ----------------------------- */
function Ring({ pct, size = 46, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(Math.max(pct, 0), 1));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.surface2} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.accent}
          strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: MONO, fontSize: size > 50 ? 13 : 11,
        fontWeight: 700, color: C.text }}>
        {Math.round(pct * 100)}
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "22px 2px 11px" }}>
      {Icon && <Icon size={13} color={C.accent} />}
      <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        color: C.sub, fontWeight: 700 }}>{children}</span>
    </div>
  );
}

function CounterRow({ c, value, onChange }) {
  const Icon = c.icon;
  const p = Math.min(value / c.target, 1);
  const met = value >= c.target;
  return (
    <div style={{ background: C.surface, border: `1px solid ${met ? C.accentLine : C.line}`,
      borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon size={17} color={met ? C.accent : C.sub} />
        <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{c.label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: met ? C.accent : C.text }}>
          {value.toLocaleString()}
          <span style={{ color: C.faint }}> / {c.target.toLocaleString()}{c.unit}</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11 }}>
        <button onClick={() => onChange(value - c.step)} style={miniBtn}><Minus size={16} /></button>
        <div style={{ flex: 1, height: 7, borderRadius: 5, background: C.surface2, overflow: "hidden" }}>
          <div style={{ width: `${p * 100}%`, height: "100%", background: C.accent,
            borderRadius: 5, transition: "width 0.25s ease" }} />
        </div>
        <button onClick={() => onChange(value + c.step)} style={miniBtn}><Plus size={16} /></button>
      </div>
    </div>
  );
}

function ToggleRow({ label, on, onClick, last }) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center",
      gap: 12, padding: "13px 14px", background: "none", border: "none",
      borderBottom: last ? "none" : `1px solid ${C.lineSoft}`, cursor: "pointer",
      fontFamily: SANS, textAlign: "left" }}>
      <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0,
        background: on ? C.accent : "transparent",
        border: `1.5px solid ${on ? C.accent : C.line}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {on && <Check size={15} color={C.ink} />}
      </div>
      <span style={{ fontSize: 13.5, color: on ? C.text : C.sub,
        textDecoration: on ? "none" : "none", fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function IconBtn({ children, onClick, dim }) {
  return (
    <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: 9,
      background: C.surface, border: `1px solid ${C.line}`, color: dim ? C.faint : C.sub,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: dim ? "default" : "pointer", opacity: dim ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
        color: C.faint, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.line}`,
      borderRadius: 12, padding: "10px 6px", textAlign: "center" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
        color: C.faint, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3, fontFamily: MONO }}>{value}</div>
    </div>
  );
}

const miniBtn = {
  width: 34, height: 34, borderRadius: 9, background: C.surface2,
  border: `1px solid ${C.line}`, color: C.text, display: "flex",
  alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
};
const stepBtn = {
  width: 46, height: 46, borderRadius: 12, background: C.surface2,
  border: `1px solid ${C.line}`, color: C.text, display: "flex",
  alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
};

/* ----------------------------- NAV ----------------------------- */
function Nav({ tab, setTab }) {
  const items = [
    { id: "today", label: "Today", icon: CalendarDays },
    { id: "train", label: "Train", icon: Dumbbell },
    { id: "progress", label: "Progress", icon: TrendingDown },
    { id: "plan", label: "Plan", icon: ListChecks },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex",
      justifyContent: "center", zIndex: 30, pointerEvents: "none" }}>
      <div style={{ width: "100%", maxWidth: 440, background: C.surface,
        borderTop: `1px solid ${C.line}`, display: "flex", padding: "8px 8px 12px",
        pointerEvents: "auto" }}>
        {items.map((it) => {
          const on = tab === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} style={{ flex: 1,
              background: "none", border: "none", cursor: "pointer", display: "flex",
              flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0",
              fontFamily: SANS }}>
              <Icon size={21} color={on ? C.accent : C.faint} />
              <span style={{ fontSize: 10.5, color: on ? C.accent : C.faint,
                fontWeight: on ? 700 : 500 }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- INSTALL / ADD-TO-HOME PROMPT ----------------------- */
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  );
}
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) // iPadOS
  );
}

/* Pops on every open (until installed): native install on Android / Chrome / Edge,
   "Add to Home Screen" hints on iOS, and a generic menu hint elsewhere. */
function InstallPrompt() {
  const deferredRef = useRef(null);
  const [mode, setMode] = useState(null); // "native" | "ios" | "manual"
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed → never nag
    const iOS = isIOS();

    const onBIP = (e) => {
      e.preventDefault();
      deferredRef.current = e;
      setMode("native");
      setShow(true);
    };
    const onInstalled = () => {
      deferredRef.current = null;
      setShow(false);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    let t;
    if (iOS) {
      setMode("ios");
      t = setTimeout(() => setShow(true), 700);
    } else {
      // browsers that never fire beforeinstallprompt still get a nudge
      t = setTimeout(() => {
        if (!deferredRef.current) {
          setMode("manual");
          setShow(true);
        }
      }, 1600);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(t);
    };
  }, []);

  if (!show) return null;

  const install = async () => {
    const d = deferredRef.current;
    if (!d) return;
    d.prompt();
    try { await d.userChoice; } catch (e) { /* dismissed */ }
    deferredRef.current = null;
    setShow(false);
  };

  const hint = {
    position: "relative", marginTop: 12, padding: "11px 12px",
    background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 12,
    fontSize: 12.5, color: C.text, lineHeight: 1.5,
  };

  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 84, display: "flex",
      justifyContent: "center", zIndex: 50, pointerEvents: "none", padding: "0 12px" }}>
      <div style={{ width: "100%", maxWidth: 416, pointerEvents: "auto", background: C.surface,
        border: `1px solid ${C.accentLine}`, borderRadius: 18, padding: 16,
        boxShadow: "0 16px 44px rgba(0,0,0,0.55)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0,
          background: `radial-gradient(120% 90% at 100% 0%, ${C.accentSoft} 0%, transparent 55%)` }} />
        <button aria-label="Dismiss" onClick={() => setShow(false)} style={{
          position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: 8,
          background: "none", border: "none", color: C.faint, cursor: "pointer", zIndex: 1,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={16} />
        </button>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accentSoft,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Smartphone size={22} color={C.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Install The Cut</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2, lineHeight: 1.35 }}>
              Add it to your {mode === "ios" ? "home screen" : "device"} for full-screen,
              one-tap, offline access.
            </div>
          </div>
        </div>

        {mode === "native" && (
          <div style={{ position: "relative", display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => setShow(false)} style={{
              flex: 1, padding: "11px 0", borderRadius: 11, background: C.surface2,
              border: `1px solid ${C.line}`, color: C.sub, fontSize: 13.5, fontWeight: 600,
              cursor: "pointer", fontFamily: SANS }}>
              Maybe later
            </button>
            <button onClick={install} style={{
              flex: 1.4, padding: "11px 0", borderRadius: 11, background: C.accent, border: "none",
              color: C.ink, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: SANS,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Download size={16} /> Install app
            </button>
          </div>
        )}

        {mode === "ios" && (
          <div style={hint}>
            Tap <Share size={14} color={C.accent} style={{ verticalAlign: "-2px" }} />{" "}
            <b>Share</b>, then <b>“Add to Home Screen”</b>.
          </div>
        )}

        {mode === "manual" && (
          <div style={hint}>
            Open your browser menu and choose <b>“Install app”</b> or{" "}
            <b>“Add to Home Screen”</b>.
          </div>
        )}
      </div>
    </div>
  );
}
