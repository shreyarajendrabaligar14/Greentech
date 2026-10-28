# CarbonTrack AI | Hack Fest 2026 — Green Tech & Sustainability

**CarbonTrack AI** is a digital carbon accounting and decarbonization intelligence platform designed for individuals, college campuses, and organizations to quantify greenhouse gas (GHG) emissions, understand primary emission hotspots, track reduction targets, and adopt practical sustainable practices.

Built for **Hack Fest 2026**, the application implements real client-server architecture with defensible GHG calculation models, persistent local SQLite storage, interactive Recharts data visualization, and a transparent rule-based decarbonization recommendation engine.

---

## 🌟 Core Features

### 1. Sustainability Dashboard
- **Total Footprint Tracking**: Displays real-time emissions in standard **kg CO2e** (and tonnes CO2e).
- **Categorical Breakdown**: Donut chart detailing electricity, transportation, direct fuels, and solid waste.
- **Historical Emissions Timeline**: Monthly trends calculated from stored activity records.
- **Dynamic Sustainability Score**: Transparent 0–100 score based on emission intensity, targets, and completed eco-challenges.
- **Zero-Data State**: Guided onboarding empty-state when no activities are recorded yet.

### 2. Multi-Source Carbon Calculator
- **Electricity**: Consumption in kWh with configurable billing periods (Daily, Weekly, Monthly, Yearly).
- **Transportation**: Travel distance in km across 6 vehicle modes (Petrol car, Diesel car, EV, Motorcycle, Bus, Train) with commute frequencies.
- **Direct Fuel Combustion**: Petrol, Diesel, LPG, and CNG in Litres or Kilograms.
- **Solid Waste**: Discarded waste in kg categorized into mixed municipal solid waste, food/organics, plastics, and paper.
- **Interactive "Calculate Emissions" Button**: Connects to the FastAPI `/api/calculate` endpoint for server-side verification with instant feedback.
- **Period Normalization**: Eliminates mixed-unit errors by standardizing all outputs to a consistent monthly basis.
- **Preset Demonstration Scenarios**: Quick-fill buttons for Student Commuters, Urban Households, and College Departments.

### 3. Emission Analytics
- **Interactive Recharts Visualizations**: Stacked bar comparison charts, chronological trendlines, and categorical distribution meters.
- **Emission Hotspot Identification**: Flags the primary emission driver (e.g., electricity or transport) with context and suggestions.
- **Category & Search Filters**: Filter records by domain or keywords.
- **One-Click CSV Export**: Download verifiable activity reports for sustainability reporting.

### 4. Personalized Reduction AI (Transparent Rule-Based Engine)
- **Targeted Decarbonization Actions**: Recommends practical interventions tailored specifically to the user's top emission sources.
- **Defensible Savings Calculations**: Clear rationale and mathematical formulas (e.g., 2°C thermostat adjustment yields ~12% HVAC load reduction based on ASHRAE/BEE standards).
- **Interactive Action Commitments**: Users can commit to actions and track cumulative projected monthly savings.
- **Future AI Ready**: Architecture designed with pluggable REST endpoints ready for external LLM API integration without claiming fake models.

### 5. Progress Tracking & Climate Targets
- **Target Setter**: Configure target reduction percentage (e.g., -20% or -30%) against baseline emissions by target year (2026, 2027, 2030).
- **Progress Gauge**: Real-time progress bar tracking actual reduction achieved vs. required reduction.
- **Historical Record Management**: View and delete individual audit logs with immediate database synchronization.

### 6. Sustainability Challenges
- Practical daily and weekly habits (Public Transit Week, Zero Vampire Power, Waste Composting, Plant-Rich Green Monday, Thermostat 24°C Standard).
- Interactive completion tracking with gamified Eco-Points counter.
- Explicitly labeled demonstration challenge set.

### 7. Institutional Leaderboard
- Comparative benchmarks for colleges and corporate organizations.
- Evaluates normalized metrics (kg CO2e per capita / student / employee) rather than raw totals.
- Clearly labeled as sample simulation data to prevent fabricated real-world claims.

### 8. Settings & Storage Management
- Profile switcher: **Individual / Household**, **College / University Campus**, and **Organization / Enterprise**.
- Regional grid emission factor baseline switcher (India CEA Grid 0.82 kg/kWh, US eGRID, EU EEA).
- **Local Data Storage Transparency**: Explains SQLite file location (`backend/carbontrack.db`).
- Demo data seeder for hackathon evaluation and full database purge / reset option.

---

## 🛠️ Tech Stack

- **Frontend**: React (v19), Vite (v8), JavaScript (ES modules)
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS (v3), PostCSS, Autoprefixer
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Python 3.11+, FastAPI, Uvicorn
- **Database**: SQLite (local embedded file `backend/carbontrack.db`)
- **Persistence**: Dual synchronization with Browser `localStorage` and FastAPI REST API

---

## 📂 Project Structure

```text
CarbonTrack-AI/
├── frontend/
│   ├── .env                    # Vite API base URL (http://localhost:8081)
│   ├── index.html              # HTML shell with Google Fonts & metadata
│   ├── package.json            # React, Vite, React Router, Recharts, Lucide
│   ├── tailwind.config.js      # Forest-green & emerald custom palette
│   ├── src/
│   │   ├── main.jsx            # Entry point with BrowserRouter wrapper
│   │   ├── App.jsx             # React Router routes, state sync, localStorage
│   │   ├── index.css           # Tailwind base, utilities, custom scrollbar
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     # Navigation sidebar with React Router Links
│   │   │   ├── Navbar.jsx      # Top header, profile switcher, status indicator
│   │   │   ├── StatCard.jsx    # Metric cards with up/down carbon delta badges
│   │   │   ├── EmptyState.jsx  # Zero-data guidance and prompt
│   │   │   └── FactorInfoModal.jsx # Emission factor methodology modal
│   │   ├── views/
│   │   │   ├── DashboardView.jsx       # Overview, charts, recent table
│   │   │   ├── CalculatorView.jsx      # Multi-source inputs, calculate button
│   │   │   ├── AnalyticsView.jsx       # Recharts drilldown and CSV export
│   │   │   ├── RecommendationsView.jsx # Transparent rule-based advice
│   │   │   ├── ProgressView.jsx        # Reduction target setter and history
│   │   │   ├── ChallengesView.jsx      # Gamified eco-challenges
│   │   │   ├── LeaderboardView.jsx     # Normalized institutional benchmarks
│   │   │   └── SettingsView.jsx        # Profile config and SQLite purge
│   │   ├── services/
│   │   │   ├── api.js                  # REST API client with auto-fallback
│   │   │   └── emissionFactors.js      # Documented factors & citations
│   │   └── utils/
│   │       ├── calculations.js         # Period normalization & math routines
│   │       └── formatters.js           # kg CO2e, dates, and CSV export
└── backend/
    ├── requirements.txt        # fastapi, uvicorn, pydantic
    ├── main.py                 # FastAPI app, CORS, router mounts, health check
    ├── database.py             # SQLite connection, schema migrations, reset
    ├── models.py               # Pydantic validation schemas
    ├── carbontrack.db          # Embedded SQLite database file
    ├── services/
    │   ├── __init__.py
    │   └── calculator.py       # Server-side calculation engine
    └── routers/
        ├── __init__.py
        ├── activities.py       # CRUD activity records (/api/activities)
        ├── dashboard.py        # Summary metrics & trends (/api/dashboard/summary)
        ├── analytics.py        # Calculation verification (/api/calculate)
        ├── targets.py          # Reduction targets (/api/targets)
        ├── challenges.py       # Challenges list & toggle (/api/challenges)
        ├── leaderboard.py      # Benchmark listings (/api/leaderboard)
        └── settings.py         # Settings & data purge (/api/data/reset)
```

---

## 🚀 Setup & Launch Instructions

### Prerequisites
- Node.js (v18+ or v24) & npm
- Python (v3.10+ or v3.11)

### 1. Start the FastAPI Backend
From the root directory:
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8081
```
The backend starts at `http://127.0.0.1:8081`.  
Swagger interactive API docs: `http://127.0.0.1:8081/docs`.

### 2. Start the Frontend Dev Server
In a second terminal, from the root directory:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📊 Documented Emission Factors & Methodology

All calculations strictly use **kg CO2e** (kilograms of carbon dioxide equivalent) as the standard output unit.

| Category | Sub-Type | Default Factor | Unit | Formula | Reference Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Electricity** | Average Grid | `0.82` | kg CO2e / kWh | `kWh × 0.82` | India CEA Baseline 2023 / Regional Grid Average |
| **Transport** | Car (Petrol) | `0.170` | kg CO2e / km | `km × 0.170` | DEFRA 2023 Average Medium Car |
| **Transport** | Car (Diesel) | `0.165` | kg CO2e / km | `km × 0.165` | DEFRA 2023 Medium Diesel Car |
| **Transport** | Electric Car (EV) | `0.053` | kg CO2e / km | `km × 0.053` | Grid-charged EV lifecycle average |
| **Transport** | Motorcycle | `0.085` | kg CO2e / km | `km × 0.085` | DEFRA 2023 Two-Wheeler |
| **Transport** | Public Transit Bus | `0.050` | kg CO2e / pass-km | `km × 0.050` | DEFRA 2023 Local Bus |
| **Transport** | Metro / Rail | `0.035` | kg CO2e / pass-km | `km × 0.035` | DEFRA 2023 Passenger Rail |
| **Fuel** | Petrol (Gasoline) | `2.31` | kg CO2e / Litre | `Litres × 2.31` | IPCC / DEFRA 2023 Standard Fuel |
| **Fuel** | Diesel | `2.68` | kg CO2e / Litre | `Litres × 2.68` | DEFRA 2023 Direct Fuel Combustion |
| **Fuel** | LPG | `1.51` | kg CO2e / Litre | `Litres × 1.51` | EPA GHG Emission Inventory |
| **Fuel** | CNG | `2.75` | kg CO2e / kg | `kg × 2.75` | IPCC Mobile Combustion |
| **Waste** | Mixed MSW | `0.58` | kg CO2e / kg | `kg × 0.58` | EPA WARM Landfill Model |
| **Waste** | Food / Organic | `0.62` | kg CO2e / kg | `kg × 0.62` | IPCC Anaerobic Landfill Methane |
| **Waste** | Plastics | `1.43` | kg CO2e / kg | `kg × 1.43` | Plastics Europe LCA & Disposal |
| **Waste** | Paper & Cardboard | `0.45` | kg CO2e / kg | `kg × 0.45` | EPA WARM Paper Decomposition |

### Period Normalization Multipliers
To prevent combining mismatched daily, weekly, and monthly rates:
- **Daily**: Multiplied by `30.417` days/month
- **Weekly**: Multiplied by `4.345` weeks/month
- **Monthly**: Multiplied by `1.0`
- **Yearly**: Multiplied by `1 / 12` (0.0833)
- **One-time event**: Direct footprint logged without frequency scaling

---

## 🔒 Data Privacy & Storage Model

1. **Embedded SQLite Database**: All records are stored locally in `backend/carbontrack.db`.
2. **Browser LocalStorage**: User sessions, activities, challenges, and preferences are synchronized in `localStorage` for offline resilience.
3. **Zero Third-Party Telemetry**: No user footprint inputs or activities are transmitted to third-party tracking services or external ad brokers.
4. **Data Purge**: Users can permanently clear all activity logs via the "Purge All Stored Records" button in Settings.

---

## ⚠️ Known Limitations & Future Roadmap

1. **Scope 3 Supply Chain**: Current version focuses on Scopes 1 & 2 (direct fuels, electricity, and local commutes). Full Scope 3 upstream purchased goods accounting is planned for post-hackathon release.
2. **Utility Meter IoT Integration**: Current calculations rely on user-entered bill and odometer figures; direct smart-meter API integrations (e.g. Green Button, Smart Meter Texas) represent the next phase.
3. **Pluggable Generative AI**: The recommendations engine is transparently rule-based today using verified engineering formulas. The code is modularized so an OpenAI/Gemini API key can be inserted into `backend/services/recommendations.py` for dynamic natural-language advisory.
