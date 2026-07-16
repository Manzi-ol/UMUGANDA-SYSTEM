# Umuganda Management System

A digital platform for managing Rwanda's monthly community work tradition.
Built as a mobile-first Progressive Web App using pure HTML, CSS and JavaScript.

## 👥 Roles

| Role      | What they do                                                    |
|-----------|-----------------------------------------------------------------|
| Villager  | Confirm attendance, check in on-site, pay charges, suggest ideas |
| Leader    | Schedule activities, cross-check attendance, approve absences, confirm payments |
| Inspector | View system-wide analytics, forecasts, and export reports        |

## 🚀 How to run

**Quick preview (no PWA/server features):**
Double-click `index.html` — everything works in any modern browser.

**Full experience with PWA + offline:**
```bash
# From inside the project folder
python3 -m http.server 8000
# Then open http://localhost:8000 in Chrome
```
You will see an install prompt. Once installed, the app works offline.

## 🔑 Demo credentials

| Role      | Username    | Password       |
|-----------|-------------|----------------|
| Leader    | `leader`    | `leader123`    |
| Villager  | `villager`  | `villager123`  |
| Inspector | `inspector` | `inspector123` |

## ✨ Features

### Foundation (Batch 1)
- 🇷🇼 English / Kinyarwanda language toggle
- 🌙 Dark mode
- 🔒 Proper synchronous route guards (no flash of restricted content)
- 📱 Installable PWA with offline support
- 🎨 Mobile-first responsive design, tables transform into cards on phones
- 🔔 Toast notifications

### Villager features (Batch 2)
- ✅ Confirm / decline attendance with mandatory reason
- 📷 QR code check-in on Umuganda day
- 📍 GPS-based check-in (verified within 200m of the site)
- 💰 MoMo payment tracking with reference number
- 💡 Suggestions box for community ideas
- 🔔 Browser notification reminders 2 days before Umuganda

### Leader features (Batch 2)
- ⚖️ Approve or reject absence reasons (approved = no charge)
- 🔐 Generate QR check-in sessions
- 💳 Confirm villager MoMo payments
- 📷 Upload photo evidence per activity
- 👤 Manage villager profiles (phone, address, photo)
- 🖨️ Print-friendly attendance rosters
- 💡 Review villager suggestions

### Inspector analytics (Batch 3)
- 📊 4 live charts: attendance trend, present vs absent, top attenders, check-in method breakdown
- 🔮 Attendance forecast for the next Umuganda (rolling average + trend detection)
- 🏆 Community leaderboard with medals
- 🗺️ Leaflet-powered activity map
- 📄 Export monthly PDF report (browser save-as-PDF)
- 📈 CSV export for activities and attendance

## 📁 Project structure

```
umuganda/
├── index.html          Welcome page
├── login.html          Role selection + login
├── villager.html       Villager dashboard
├── leader.html         Leader dashboard
├── inspector.html      Inspector dashboard with analytics
├── css/style.css       Custom design system (no Bootstrap)
├── js/script.js        Core: data, auth, PWA, helpers
├── js/i18n.js          English & Kinyarwanda translations
├── js/qrcode.js        QR-style code visualization
├── manifest.json       PWA manifest
├── sw.js               Service worker (offline shell)
└── icons/              PWA icons (192, 512)
```

## 🔧 Data storage

All data lives in `localStorage`, so the app works fully offline.
No backend required. Data resets when the schema version changes to keep demos clean.

## 🌐 External dependencies (loaded via CDN)

- Chart.js 4.4 — analytics charts (inspector view only)
- Leaflet 1.9 — community map (inspector view only)
- Bootstrap Icons — icon font
- Google Fonts — Fraunces (display) + Manrope (body)

When offline, the map falls back to a friendly placeholder; charts still work
from cache once loaded.

## 🎓 Academic context

Built for a Computer Engineering project at the University of Rwanda —
College of Science and Technology, demonstrating full-stack thinking in a
frontend-only architecture: real-world workflow modeling, i18n, PWA,
progressive enhancement, and data visualization.
