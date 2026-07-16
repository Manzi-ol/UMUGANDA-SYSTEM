/* ============================================
   UMUGANDA MANAGEMENT SYSTEM — CORE (v4)
============================================ */

const DEMO_USERS = {
  leader:    { username: "leader",    password: "leader123",    name: "Jean Bosco",     role: "leader" },
  villager:  { username: "villager",  password: "villager123",  name: "Mukamana Aline", role: "villager" },
  inspector: { username: "inspector", password: "inspector123", name: "Habimana Eric",  role: "inspector" }
};

const DEMO_VILLAGERS = [
  "Mukamana Aline",
  "Uwimana Claude",
  "Nshuti Patrick",
  "Ingabire Diane",
  "Habineza Eric"
];

const ABSENCE_CHARGE = 5000; // RWF

const DATA_VERSION = "v5";
if (localStorage.getItem("umuganda_version") !== DATA_VERSION) {
  ["umuganda_activities", "umuganda_rsvps", "umuganda_attendance",
   "umuganda_announcements", "umuganda_inspections", "umuganda_villagers",
   "umuganda_payments", "umuganda_suggestions", "umuganda_photos",
   "umuganda_qr_session"].forEach(k => localStorage.removeItem(k));
  localStorage.setItem("umuganda_version", DATA_VERSION);
}

function seedDemoData() {
  if (!localStorage.getItem("umuganda_activities")) {
    localStorage.setItem("umuganda_activities", JSON.stringify([
      { id: 1, title: "Road Cleaning - Main Street",   date: "2026-05-30", location: "Sector Centre",  status: "scheduled", lat: -1.9536, lng: 30.1044, photos: [] },
      { id: 2, title: "Tree Planting at School",       date: "2026-06-27", location: "Primary School", status: "scheduled", lat: -1.9540, lng: 30.1052, photos: [] },
      { id: 3, title: "Drainage Repair",               date: "2026-04-25", location: "Lower District", status: "completed", lat: -1.9532, lng: 30.1038, photos: [] }
    ]));
  }
  if (!localStorage.getItem("umuganda_rsvps")) {
    // approvalStatus: pending | approved | rejected  (only meaningful when response=unavailable)
    localStorage.setItem("umuganda_rsvps", JSON.stringify([
      { id: 1, activityId: 3, villager: "Uwimana Claude", response: "available",   reason: "", approvalStatus: null },
      { id: 2, activityId: 3, villager: "Nshuti Patrick", response: "unavailable", reason: "Sick - had medical appointment", approvalStatus: "approved" },
      { id: 3, activityId: 3, villager: "Ingabire Diane", response: "available",   reason: "", approvalStatus: null },
      { id: 4, activityId: 3, villager: "Habineza Eric",  response: "available",   reason: "", approvalStatus: null },
      { id: 5, activityId: 1, villager: "Uwimana Claude", response: "available",   reason: "", approvalStatus: null },
      { id: 6, activityId: 1, villager: "Ingabire Diane", response: "unavailable", reason: "Travelling for family event", approvalStatus: "pending" }
    ]));
  }
  if (!localStorage.getItem("umuganda_attendance")) {
    // paid: boolean, momoRef: string|null
    localStorage.setItem("umuganda_attendance", JSON.stringify([
      { id: 1, activityId: 3, villager: "Uwimana Claude", status: "present", charge: 0, paid: true,  momoRef: null, method: "leader" },
      { id: 2, activityId: 3, villager: "Nshuti Patrick", status: "absent",  charge: ABSENCE_CHARGE, paid: false, momoRef: null, method: "leader" },
      { id: 3, activityId: 3, villager: "Ingabire Diane", status: "present", charge: 0, paid: true,  momoRef: null, method: "leader" },
      { id: 4, activityId: 3, villager: "Habineza Eric",  status: "present", charge: 0, paid: true,  momoRef: null, method: "leader" },
      { id: 5, activityId: 3, villager: "Mukamana Aline", status: "present", charge: 0, paid: true,  momoRef: null, method: "leader" }
    ]));
  }
  if (!localStorage.getItem("umuganda_announcements")) {
    localStorage.setItem("umuganda_announcements", JSON.stringify([
      { id: 1, title: "Welcome to the digital Umuganda system",
        message: "We can now confirm attendance and track community work online.",
        date: "2026-05-01", author: "Leader Jean Bosco" },
      { id: 2, title: "Bring tools for May Umuganda",
        message: "Please come with hoes, gloves and water for the road cleaning activity.",
        date: "2026-05-05", author: "Leader Jean Bosco" }
    ]));
  }
  // ----- New in Batch 2 -----
  if (!localStorage.getItem("umuganda_villagers")) {
    // Villager profiles for leader/inspector views
    localStorage.setItem("umuganda_villagers", JSON.stringify([
      { name: "Mukamana Aline",  phone: "0788111111", address: "Village A, Cell 1", photo: null },
      { name: "Uwimana Claude",  phone: "0788222222", address: "Village A, Cell 2", photo: null },
      { name: "Nshuti Patrick",  phone: "0788333333", address: "Village B, Cell 1", photo: null },
      { name: "Ingabire Diane",  phone: "0788444444", address: "Village B, Cell 2", photo: null },
      { name: "Habineza Eric",   phone: "0788555555", address: "Village C, Cell 1", photo: null }
    ]));
  }
  if (!localStorage.getItem("umuganda_payments")) {
    localStorage.setItem("umuganda_payments", JSON.stringify([]));
  }
  if (!localStorage.getItem("umuganda_suggestions")) {
    localStorage.setItem("umuganda_suggestions", JSON.stringify([
      { id: 1, message: "Can we have a tree planting activity next month? Our sector needs shade.",
        date: "2026-05-02", status: "new" }
    ]));
  }
}

// ----- Auth -----
function login(username, password, role) {
  const u = DEMO_USERS[role];
  if (u && u.username === username && u.password === password) {
    localStorage.setItem("umuganda_user", JSON.stringify(u));
    return u;
  }
  return null;
}
function getCurrentUser() {
  const raw = localStorage.getItem("umuganda_user");
  return raw ? JSON.parse(raw) : null;
}
function logout() {
  localStorage.removeItem("umuganda_user");
  window.location.href = "index.html";
}

/* -----------------------------------------------------------
   PROPER route guard: runs SYNCHRONOUSLY at page-load top,
   BEFORE the body renders. This prevents the "flash of
   restricted content" that happens with post-render checks.
   Call this at the very top of a dashboard's <script> block.
----------------------------------------------------------- */
function guardRole(requiredRole) {
  const user = getCurrentUser();
  if (!user) {
    // Hide body, redirect immediately
    document.documentElement.style.visibility = "hidden";
    window.location.replace("login.html");
    return null;
  }
  if (user.role !== requiredRole) {
    document.documentElement.style.visibility = "hidden";
    window.location.replace(user.role + ".html");
    return null;
  }
  return user;
}

// ----- Data accessors -----
function getActivities()    { return JSON.parse(localStorage.getItem("umuganda_activities")    || "[]"); }
function getRsvps()         { return JSON.parse(localStorage.getItem("umuganda_rsvps")         || "[]"); }
function getAttendance()    { return JSON.parse(localStorage.getItem("umuganda_attendance")    || "[]"); }
function getAnnouncements() { return JSON.parse(localStorage.getItem("umuganda_announcements") || "[]"); }
function getVillagers()     { return JSON.parse(localStorage.getItem("umuganda_villagers")     || "[]"); }
function getPayments()      { return JSON.parse(localStorage.getItem("umuganda_payments")      || "[]"); }
function getSuggestions()   { return JSON.parse(localStorage.getItem("umuganda_suggestions")   || "[]"); }

function saveActivities(d)    { localStorage.setItem("umuganda_activities",    JSON.stringify(d)); }
function saveRsvps(d)         { localStorage.setItem("umuganda_rsvps",         JSON.stringify(d)); }
function saveAttendance(d)    { localStorage.setItem("umuganda_attendance",    JSON.stringify(d)); }
function saveAnnouncements(d) { localStorage.setItem("umuganda_announcements", JSON.stringify(d)); }
function saveVillagers(d)     { localStorage.setItem("umuganda_villagers",     JSON.stringify(d)); }
function savePayments(d)      { localStorage.setItem("umuganda_payments",      JSON.stringify(d)); }
function saveSuggestions(d)   { localStorage.setItem("umuganda_suggestions",   JSON.stringify(d)); }

// Get villager profile (photo + phone + address)
function getVillagerProfile(name) {
  return getVillagers().find(v => v.name === name) || { name, phone: "", address: "", photo: null };
}

// ----- Helpers -----
function formatRWF(n) { return Number(n).toLocaleString() + " RWF"; }

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

// ----- Toasts -----
function ensureToastHost() {
  let host = document.getElementById("u-toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "u-toast-host";
    host.className = "u-toast-host";
    document.body.appendChild(host);
  }
  return host;
}
function toast(message, type = "success") {
  const host = ensureToastHost();
  const icon = type === "success" ? "bi-check-circle-fill"
             : type === "warn"    ? "bi-exclamation-triangle-fill"
             : "bi-x-circle-fill";
  const el = document.createElement("div");
  el.className = "u-toast " + type;
  el.innerHTML = `<i class="bi ${icon}"></i> <span>${escapeHTML(message)}</span>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

// ----- Theme -----
function getTheme() { return localStorage.getItem("umuganda_theme") || "light"; }
function setTheme(t) {
  localStorage.setItem("umuganda_theme", t);
  document.documentElement.setAttribute("data-theme", t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#0a1a14" : "#0d3b2a");
}
function toggleTheme() { setTheme(getTheme() === "dark" ? "light" : "dark"); }

// Apply theme ASAP (before body paints) to avoid flash
(function applyThemeEarly() {
  document.documentElement.setAttribute("data-theme", getTheme());
})();

// ----- Online / Offline detection -----
function updateOnlineStatus() {
  document.body.classList.toggle("offline", !navigator.onLine);
}
window.addEventListener("online",  updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

// ----- PWA: Service worker registration & install prompt -----
let deferredInstallPrompt = null;
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(err => {
        console.log("Service worker registration skipped:", err.message);
      });
    });
  }
}
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const banner = document.getElementById("installBanner");
  if (banner) banner.classList.add("show");
});
function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(() => {
    deferredInstallPrompt = null;
    const banner = document.getElementById("installBanner");
    if (banner) banner.classList.remove("show");
  });
}
function dismissInstall() {
  const banner = document.getElementById("installBanner");
  if (banner) banner.classList.remove("show");
}

// ----- Boot -----
seedDemoData();
registerServiceWorker();
document.addEventListener("DOMContentLoaded", () => {
  updateOnlineStatus();
  applyTranslations();
});

// ==========================================================
// BATCH 2 HELPERS
// ==========================================================

// ----- Browser Notifications -----
function canNotify() { return "Notification" in window; }
function notifyPermission() { return canNotify() ? Notification.permission : "unsupported"; }
async function requestNotifyPermission() {
  if (!canNotify()) return "unsupported";
  const p = await Notification.requestPermission();
  return p;
}
function sendLocalNotification(title, body) {
  if (!canNotify() || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png"
    });
  } catch (e) { /* Some browsers only allow via service worker */ }
}
// Check upcoming activities within 2 days and send reminders
function checkAndSendReminders() {
  if (!canNotify() || Notification.permission !== "granted") return;
  const today = new Date();
  const activities = getActivities();
  const remindedKey = "umuganda_reminders_sent";
  const reminded = JSON.parse(localStorage.getItem(remindedKey) || "[]");

  activities.forEach(a => {
    if (a.status !== "scheduled") return;
    const actDate = new Date(a.date);
    const diffDays = Math.ceil((actDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 2 && !reminded.includes(a.id)) {
      sendLocalNotification(
        "Umuganda Reminder: " + a.title,
        `${a.date} at ${a.location} — in ${diffDays === 0 ? "today" : diffDays + " day(s)"}`
      );
      reminded.push(a.id);
    }
  });
  localStorage.setItem(remindedKey, JSON.stringify(reminded));
}

// ----- Geolocation helper -----
// Haversine distance in meters between two coordinates
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // earth radius in meters
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

// ----- QR check-in session -----
// The leader starts a QR session for an activity; villagers scan/enter the code.
function getQrSession() {
  return JSON.parse(localStorage.getItem("umuganda_qr_session") || "null");
}
function startQrSession(activityId) {
  const code = "UMG-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const session = { activityId, code, startedAt: Date.now() };
  localStorage.setItem("umuganda_qr_session", JSON.stringify(session));
  return session;
}
function endQrSession() {
  localStorage.removeItem("umuganda_qr_session");
}

// ----- Modal helper -----
function openModal(html) {
  let host = document.getElementById("u-modal-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "u-modal-host";
    host.className = "u-modal-backdrop";
    host.addEventListener("click", (e) => { if (e.target === host) closeModal(); });
    document.body.appendChild(host);
  }
  host.innerHTML = `<div class="u-modal">${html}</div>`;
  host.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  const host = document.getElementById("u-modal-host");
  if (host) { host.classList.remove("show"); host.innerHTML = ""; }
  document.body.style.overflow = "";
}

// ==========================================================
// BATCH 3 HELPERS — analytics, predictions, export
// ==========================================================

// Attendance rate for a given villager (0-100)
function villagerAttendanceRate(name) {
  const records = getAttendance().filter(a => a.villager === name);
  if (!records.length) return null;
  const present = records.filter(a => a.status === "present").length;
  return Math.round(present / records.length * 100);
}

// Rank all villagers by attendance rate (descending)
function villagerRanking() {
  return DEMO_VILLAGERS.map(name => {
    const records = getAttendance().filter(a => a.villager === name);
    const present = records.filter(a => a.status === "present").length;
    const absent  = records.filter(a => a.status === "absent").length;
    const total   = records.length;
    const rate    = total ? Math.round(present / total * 100) : 0;
    return { name, present, absent, total, rate };
  }).sort((a, b) => b.rate - a.rate || b.present - a.present);
}

// Predict attendance rate for the next activity based on trend
// Simple rolling average of last N completed activities
function predictNextAttendance() {
  const activities = getActivities().filter(a => a.status === "completed")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!activities.length) return null;

  const attendance = getAttendance();
  const rates = activities.slice(-6).map(a => {
    const recs = attendance.filter(x => x.activityId === a.id);
    if (!recs.length) return null;
    const p = recs.filter(x => x.status === "present").length;
    return Math.round(p / recs.length * 100);
  }).filter(r => r !== null);

  if (!rates.length) return null;
  const avg = Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
  // Simple linear trend adjustment
  let trend = 0;
  if (rates.length >= 3) {
    const recent = rates.slice(-3);
    const older  = rates.slice(0, Math.max(1, rates.length - 3));
    const recentAvg = recent.reduce((s,r) => s+r, 0) / recent.length;
    const olderAvg  = older.reduce((s,r) => s+r, 0)  / older.length;
    trend = Math.round((recentAvg - olderAvg) / 2);
  }
  const prediction = Math.max(0, Math.min(100, avg + trend));
  return { rate: prediction, samples: rates.length, trend };
}

// ----- CSV Export -----
function downloadCSV(filename, rows) {
  const csv = rows.map(row =>
    row.map(cell => {
      const s = String(cell ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----- Print-friendly HTML report -> browser Save-as-PDF -----
function openPrintReport(html) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) { toast("Popup blocked. Allow popups.", "error"); return; }
  w.document.write(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Umuganda Report</title>
    <style>
      body { font-family: 'Helvetica', Arial, sans-serif; padding: 32px; color: #1a1f1c; max-width: 900px; margin: 0 auto; }
      h1 { color: #0d3b2a; border-bottom: 3px solid #e0a528; padding-bottom: 8px; margin: 0 0 8px; }
      h2 { color: #1a6b48; margin-top: 32px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th { text-align: left; background: #e8f3ed; color: #0d3b2a; padding: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
      td { padding: 8px; border-bottom: 1px solid #e7ebe5; font-size: 14px; }
      .meta { color: #6b7569; font-size: 13px; }
      .stat-row { display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap; }
      .stat { background: #f3f9f5; padding: 12px 16px; border-left: 4px solid #1a6b48; border-radius: 4px; min-width: 140px; }
      .stat .v { font-size: 22px; font-weight: 700; color: #0d3b2a; }
      .stat .l { font-size: 12px; color: #6b7569; text-transform: uppercase; letter-spacing: 0.05em; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e7ebe5; color: #6b7569; font-size: 12px; text-align: center; }
      @media print { body { padding: 0; } }
    </style>
    </head><body>${html}
    <div class="footer">Generated on ${new Date().toLocaleString()} · Umuganda Management System</div>
    </body></html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 400);
}
