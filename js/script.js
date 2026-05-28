/* ============================================
   UMUGANDA MANAGEMENT SYSTEM — SHARED JS (v3)
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

const DATA_VERSION = "v3";
if (localStorage.getItem("umuganda_version") !== DATA_VERSION) {
  ["umuganda_activities", "umuganda_rsvps", "umuganda_attendance",
   "umuganda_announcements", "umuganda_inspections"].forEach(k => localStorage.removeItem(k));
  localStorage.setItem("umuganda_version", DATA_VERSION);
}

function seedDemoData() {
  if (!localStorage.getItem("umuganda_activities")) {
    localStorage.setItem("umuganda_activities", JSON.stringify([
      { id: 1, title: "Road Cleaning - Main Street",   date: "2026-05-30", location: "Sector Centre",  status: "scheduled" },
      { id: 2, title: "Tree Planting at School",       date: "2026-06-27", location: "Primary School", status: "scheduled" },
      { id: 3, title: "Drainage Repair",               date: "2026-04-25", location: "Lower District", status: "completed" }
    ]));
  }

  if (!localStorage.getItem("umuganda_rsvps")) {
    localStorage.setItem("umuganda_rsvps", JSON.stringify([
      { id: 1, activityId: 3, villager: "Uwimana Claude", response: "available",   reason: "" },
      { id: 2, activityId: 3, villager: "Nshuti Patrick", response: "unavailable", reason: "Sick - had medical appointment" },
      { id: 3, activityId: 3, villager: "Ingabire Diane", response: "available",   reason: "" },
      { id: 4, activityId: 3, villager: "Habineza Eric",  response: "available",   reason: "" },
      { id: 5, activityId: 1, villager: "Uwimana Claude", response: "available",   reason: "" },
      { id: 6, activityId: 1, villager: "Ingabire Diane", response: "unavailable", reason: "Travelling for family event" }
    ]));
  }

  if (!localStorage.getItem("umuganda_attendance")) {
    localStorage.setItem("umuganda_attendance", JSON.stringify([
      { id: 1, activityId: 3, villager: "Uwimana Claude", status: "present", charge: 0 },
      { id: 2, activityId: 3, villager: "Nshuti Patrick", status: "absent",  charge: ABSENCE_CHARGE },
      { id: 3, activityId: 3, villager: "Ingabire Diane", status: "present", charge: 0 },
      { id: 4, activityId: 3, villager: "Habineza Eric",  status: "present", charge: 0 },
      { id: 5, activityId: 3, villager: "Mukamana Aline", status: "present", charge: 0 }
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
function requireRole(requiredRole) {
  const user = getCurrentUser();
  if (!user) { window.location.href = "login.html"; return null; }
  if (user.role !== requiredRole) { window.location.href = user.role + ".html"; return null; }
  return user;
}

// ----- Data accessors -----
function getActivities()    { return JSON.parse(localStorage.getItem("umuganda_activities")    || "[]"); }
function getRsvps()         { return JSON.parse(localStorage.getItem("umuganda_rsvps")         || "[]"); }
function getAttendance()    { return JSON.parse(localStorage.getItem("umuganda_attendance")    || "[]"); }
function getAnnouncements() { return JSON.parse(localStorage.getItem("umuganda_announcements") || "[]"); }

function saveActivities(d)    { localStorage.setItem("umuganda_activities",    JSON.stringify(d)); }
function saveRsvps(d)         { localStorage.setItem("umuganda_rsvps",         JSON.stringify(d)); }
function saveAttendance(d)    { localStorage.setItem("umuganda_attendance",    JSON.stringify(d)); }
function saveAnnouncements(d) { localStorage.setItem("umuganda_announcements", JSON.stringify(d)); }

// ----- Helpers -----
function formatRWF(n) { return Number(n).toLocaleString() + " RWF"; }

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
}

// ----- Toast notifications -----
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

seedDemoData();
