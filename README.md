# CI-CARE – Smart Healthcare System

A healthcare management web app inspired by a modern EHR dashboard. Built with **JavaScript**, **Node.js**, **React**, and **SQL** (SQLite).

## Features

- **Login page** – Email/password auth; demo user included
- **Dashboard** – Welcome message, stat cards (Total Pasien, Pasien Selesai, Pasien Antri, Jadwal Temu), today’s schedule, recent patients
- **Sidebar** – Dashboard, Pasien, Jadwal, Rekam Medis, Analitik (all clickable)
- **Quick actions** – Pasien Baru, Resep Cepat, Template, Jadwal (all buttons work)
- **Pasien** – List, add new patient (modal), same color theme
- **Jadwal** – Appointment list with filter tabs
- **Rekam Medis** – Medical records list, “Resep Cepat” / template modal
- **Analitik** – Charts and summary (visits per month, growth, top conditions)
- **CI-CARE** branding and shared color theme (blue, green, orange, purple) across all pages

## Tech Stack

- **Frontend:** React 18, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** SQLite via `sql.js` (pure JavaScript SQL, no native build required)

## Setup

1. Install dependencies (root + backend + frontend):

   ```bash
   cd ci-care
   npm run install:all
   ```

   Or manually:

   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Start backend and frontend together:

   ```bash
   npm run dev
   ```

   Or run separately:

   - Backend: `npm run server` (API at http://localhost:3001)
   - Frontend: `npm run client` (app at http://localhost:5173)

3. **Login (demo):**
   - Email: `dr.sarah@cicare.com`
   - Password: `admin123`

## Project structure

```
ci-care/
├── backend/
│   ├── server.js      # Express API, auth, routes
│   ├── database.js    # SQLite schema + seed
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, sidebar, header
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # Login, Dashboard, Pasien, Jadwal, RekamMedis, Analitik
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── package.json
└── README.md
```

All buttons and nav items are wired (routing, modals, API calls). The design uses the same color theme (primary blue, green/orange/purple accents) on every page.
