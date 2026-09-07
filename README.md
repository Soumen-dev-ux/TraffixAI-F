# 🚦 TraffixAI

**TraffixAI** is an AI-powered intelligent traffic monitoring and vehicle tracking platform designed to integrate CCTV cameras, vehicle detection, traffic analytics, and vehicle trajectory tracking into a centralized system.

The current version is an **MVP frontend prototype** built with **React Native + Expo + TypeScript**, using mock APIs and a layered architecture so that real backend APIs can be integrated later without significantly changing the UI.

---

## ✨ Current Features

### 🗺️ CCTV & Traffic Map

* Interactive city traffic map
* CCTV camera markers
* Camera online/offline status
* Vehicle markers on the map
* Vehicle-type emoji representation
* Map legend
* Camera-based vehicle detection visualization

### 📹 Camera Information

Each camera contains:

* Camera ID
* Camera location/name
* Latitude & longitude
* Online/offline status
* FPS
* Vehicle count
* Traffic congestion level
* Detected vehicle distribution

### 🚗 Vehicle Search

Search vehicles using their license plate number.

Currently supports:

* Exact plate search
* Partial plate search
* Spaces and hyphens in search queries
* Vehicle type
* Vehicle color
* Current camera
* Detection time
* Current location

### 🛣️ Vehicle Trajectory

The application can visualize a vehicle's movement across multiple CCTV cameras.

Trajectory information includes:

* Vehicle ID
* License plate
* Vehicle type
* Detection points
* Camera IDs
* Camera locations
* Detection timestamps
* Route visualization on the map

### 📊 Traffic Analytics

The MVP includes traffic analytics such as:

* Total vehicles
* Active cameras
* Total cameras
* Overall congestion level
* Vehicle-type distribution
* Camera-wise traffic
* Hourly traffic statistics

### 🔥 Traffic Heatmap

* Heatmap toggle
* Traffic-density visualization
* Low-to-high density legend

---

# 🏗️ Architecture

TraffixAI follows a **4-layer architecture** designed to keep the application modular and make future backend integration easier.

```text
┌──────────────────────────────────────┐
│          PRESENTATION LAYER          │
│                                      │
│ Screens + UI Components + Map        │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│             DOMAIN LAYER             │
│                                      │
│ Models + Use Cases + Business Logic  │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│              DATA LAYER              │
│                                      │
│ Repositories + API Interfaces        │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│          EXTERNAL DATA SOURCE        │
│                                      │
│ Mock APIs → Future Backend APIs      │
└──────────────────────────────────────┘
```

### Why this architecture?

The frontend should not directly depend on backend implementation details.

For example:

```text
UI
 ↓
SearchVehicle Use Case
 ↓
VehicleRepository
 ↓
MockVehicleRepository
 ↓
Mock Vehicle API
```

Later, the mock repository can be replaced with a real API repository:

```text
UI
 ↓
SearchVehicle Use Case
 ↓
VehicleRepository
 ↓
VehicleApiRepository
 ↓
TraffixAI Backend
```

This allows the frontend to continue using the same domain and presentation logic.

---

# 📁 Project Structure

```text
TraffixAI/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── modal.tsx
│
├── assets/
│   └── images/
│
├── components/
│   ├── themed-text.tsx
│   └── themed-view.tsx
│
├── src/
│   │
│   ├── data/
│   │   ├── api/
│   │   │   ├── CameraApi.ts
│   │   │   ├── TrafficAnalyticsApi.ts
│   │   │   ├── VehicleApi.ts
│   │   │   ├── VehicleTrajectoryApi.ts
│   │   │   ├── mockCameraData.ts
│   │   │   └── mockHeatmapData.ts
│   │   │
│   │   └── repositories/
│   │       ├── CameraRepository.ts
│   │       ├── MockCameraRepository.ts
│   │       ├── MockRealtimeRepository.ts
│   │       ├── MockTrafficAnalyticsRepository.ts
│   │       ├── MockVehicleRepository.ts
│   │       ├── MockVehicleTrajectoryRepository.ts
│   │       ├── RealtimeRepository.ts
│   │       ├── TrafficAnalyticsRepository.ts
│   │       ├── VehicleRepository.ts
│   │       └── VehicleTrajectoryRepository.ts
│   │
│   ├── domain/
│   │   ├── models/
│   │   │   ├── Camera.ts
│   │   │   ├── HeatmapPoint.ts
│   │   │   ├── RealtimeEvent.ts
│   │   │   ├── TrafficAnalytics.ts
│   │   │   ├── Vehicle.ts
│   │   │   └── VehicleTrajectory.ts
│   │   │
│   │   └── usecases/
│   │       ├── GetCameras.ts
│   │       ├── GetTrafficAnalytics.ts
│   │       ├── GetVehicleTrajectory.ts
│   │       ├── SubscribeToRealtimeUpdates.ts
│   │       └── searchVehicle.ts
│   │
│   └── presentation/
│       ├── components/
│       │   ├── CameraBottomSheet.tsx
│       │   ├── CityMap.tsx
│       │   ├── CityMap.web.tsx
│       │   ├── TrafficAnalyticsPanel.tsx
│       │   ├── VehicleDetails.tsx
│       │   ├── VehicleResultcard.tsx
│       │   └── VehicleSearch.tsx
│       │
│       └── screens/
│           └── DashboardScreen.tsx
│
├── app.json
├── package.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

---

# 🧩 Layer Responsibilities

## 1. Presentation Layer

Location:

```text
src/presentation/
```

Responsible for:

* Screens
* UI components
* Maps
* Search interface
* Camera information
* Vehicle details
* Analytics panels
* User interaction

Main screen:

```text
DashboardScreen.tsx
```

---

## 2. Domain Layer

Location:

```text
src/domain/
```

Contains application-independent business logic.

### Models

Examples:

```text
Camera
Vehicle
VehicleTrajectory
TrafficAnalytics
HeatmapPoint
RealtimeEvent
```

### Use Cases

Examples:

```text
GetCameras
GetTrafficAnalytics
GetVehicleTrajectory
SearchVehicle
SubscribeToRealtimeUpdates
```

The domain layer does not need to know whether the data comes from a mock API, REST API, WebSocket, or another backend service.

---

## 3. Data Layer

Location:

```text
src/data/
```

Responsible for obtaining and managing external data.

It currently contains:

### APIs

```text
CameraApi
VehicleApi
TrafficAnalyticsApi
VehicleTrajectoryApi
```

### Repositories

```text
CameraRepository
VehicleRepository
VehicleTrajectoryRepository
TrafficAnalyticsRepository
RealtimeRepository
```

Both mock and repository abstractions are already present so that real backend integration can be added later.

---

## 4. External Data Source

Currently:

```text
Mock Data
```

The application simulates backend responses using local TypeScript data and artificial delays.

Future implementation:

```text
TraffixAI Backend
       ↓
REST APIs / WebSocket
       ↓
Repositories
       ↓
Domain
       ↓
Presentation
```

---

# 🛠️ Tech Stack

| Technology        | Purpose                             |
| ----------------- | ----------------------------------- |
| React Native      | Cross-platform mobile application   |
| Expo              | Development and application tooling |
| TypeScript        | Type-safe development               |
| Expo Router       | File-based application routing      |
| React Native Maps | Interactive map functionality       |
| ESLint            | Code quality                        |
| Git               | Version control                     |

### Planned / Future Technologies

The following can be integrated as the MVP progresses:

* REST APIs
* WebSocket / Socket.IO
* ANPR backend
* OCR / license plate recognition
* Real CCTV streams
* Real-time vehicle detection
* Traffic analytics backend
* Production database

---

# 🚀 Getting Started & Running Methods

TraffixAI is a **Universal 3-in-1 Platform** (Mobile App + Web Dashboard + Desktop Edge App) running from a single unified codebase.

---

## 📋 Prerequisites

Before running the application, make sure you have:
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher
* **Mobile Testing**: **Expo Go** app installed from Google Play Store or Apple App Store (compatible with **Expo SDK 57**)
* **Desktop Testing**: Electron v44+ (installed via dev dependencies)

---

## 📥 1. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Soumen-dev-ux/TraffixAI-F
   cd TraffixAI-F
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Verify project health (Optional but recommended):**
   ```bash
   npx expo-doctor
   ```
   *(All 21 health checks should pass).*

---

## 📱 2. Running on Mobile (Android & iOS via Expo Go)

1. **Start the Expo server:**
   ```bash
   npx expo start
   ```
   *Tip: If you recently upgraded packages, use `npx expo start -c` to start with a clean cache.*

2. **Open the App:**
   * **Physical Android / iPhone**: Open the **Expo Go** app on your phone and scan the QR code displayed in your terminal.
   * **Android Emulator**: Press `a` in your terminal to automatically launch on a running Android Virtual Device (AVD).
   * **iOS Simulator (macOS)**: Press `i` in your terminal to open inside Xcode iOS Simulator.

---

## 🌐 3. Running as Web Application (Browser Dashboard)

Ideal for Command & Control Center monitoring on large screens.

1. **Start the Web server directly:**
   ```bash
   npm run web
   ```
   *(Alternatively, if `npx expo start` is already running in your terminal, simply press `w` on your keyboard).*

2. **Access in Browser:**
   Open [http://localhost:8081](http://localhost:8081) in Chrome, Edge, Firefox, or Brave.

3. **Export Static Web Production Bundle:**
   ```bash
   npx expo export --platform web
   ```
   *Outputs optimized production assets into the `dist/` directory.*

---

## 💻 4. Running as Desktop Application (Electron)

Designed for traffic junction booths and edge control stations running offline or on local LAN.

### Option A: Development Mode (Auto-starts Expo Web + Launches Native Window)
```bash
npm run electron
```
*What this does:* Concurrently boots Metro on port 8081, waits until the server is ready, and immediately opens the native desktop app window ($1400 \times 900$).

### Option B: Launch Desktop Window Only (If Web Server is Already Running)
If you already started `npm run web` in another terminal tab:
```bash
npm run electron:window
```

### Option C: Offline Standalone Desktop Mode (Production Build)
To test how the application runs standalone without any live development server:
```bash
npm run electron:prod
```
*What this does:* Automatically compiles static web bundles into `dist/` and loads them directly into the Electron desktop environment with zero internet dependency.

---

## 🛠️ Troubleshooting & Quick Tips

| Issue | Cause | Solution |
|---|---|---|
| **Expo Go SDK Mismatch** | Phone has newer/older Expo Go | Ensure project dependencies match phone Expo Go version (`npx expo-doctor`). |
| **Port 8081 Already in Use** | Another process is holding port 8081 | Run `lsof -ti:8081 \| xargs kill -9` (Linux/Mac) or restart terminal. |
| **Blank Map on Web** | Leaflet/Web map bundle cache | Hard refresh in browser (`Ctrl + Shift + R`) or run with `npm run web -- -c`. |
| **Missing Module Errors** | `node_modules` out of sync | Run `rm -rf node_modules package-lock.json && npm install`. |

---


# 🧪 Current MVP Data

The current application uses **dummy/mock traffic data**.

Example CCTV cameras include:

```text
CAM_001 → Park Street Junction
CAM_002 → Esplanade Crossing
CAM_003 → Salt Lake Sector V
CAM_004 → Howrah Bridge
CAM_005 → Gariahat Junction
```

Vehicle data includes examples such as:

```text
WB12AB1234
WB06CD5678
WB24EF9012
WB18GH3456
```

These are currently used for frontend development and demonstration purposes.

---

# 🔌 API Integration Strategy

The current architecture is intentionally designed so that mock APIs can later be replaced by real APIs.

### Current

```text
Presentation
      ↓
Use Case
      ↓
Repository
      ↓
Mock API
```

### Future

```text
Presentation
      ↓
Use Case
      ↓
Repository
      ↓
REST API
      ↓
TraffixAI Backend
```

For real-time functionality:

```text
TraffixAI Backend
       │
       │ WebSocket
       ▼
RealtimeRepository
       │
       ▼
SubscribeToRealtimeUpdates
       │
       ▼
Dashboard
```

---

# 🚦 Planned Development Roadmap

## Phase 1 — Foundation

* [x] Create Expo project
* [x] Configure Expo
* [x] Set up TypeScript
* [x] Rename application to TraffixAI
* [x] Establish project structure

## Phase 2 — Dashboard UI

* [x] Dashboard screen
* [x] Traffic analytics panel
* [x] Vehicle search UI
* [x] Vehicle details UI

## Phase 3 — Map & CCTV

* [x] Interactive map
* [x] CCTV markers
* [x] Vehicle markers
* [x] Camera information component
* [x] Map legend
* [x] Heatmap toggle
* [x] Route visualization

## Phase 4 — Vehicle Intelligence

* [x] Vehicle model
* [x] Vehicle search
* [x] Vehicle details
* [x] Vehicle trajectory model
* [x] Trajectory API
* [x] Vehicle movement visualization

## Phase 5 — Search & Tracking

* [x] License plate search
* [x] Partial plate matching
* [x] Vehicle location
* [x] Detection history
* [x] Camera-based trajectory

## Phase 6 — Live Data

* [x] Realtime repository abstraction
* [x] Realtime use case abstraction
* [ ] Connect Socket.io
* [ ] Connect real-time vehicle updates
* [ ] Live camera status
* [ ] Live traffic updates

## Phase 7 — Analytics

* [x] Vehicle distribution
* [x] Camera-wise traffic
* [x] Hourly traffic data
* [x] Congestion levels
* [x] Heatmap foundation
* [ ] Advanced analytics
* [ ] Historical traffic analysis

## Phase 8 — Polish & Testing

* [ ] Loading states
* [ ] Error handling
* [ ] Empty states
* [ ] UI responsiveness
* [ ] Performance optimization
* [ ] Component testing
* [ ] API error testing
* [ ] Device testing

## Phase 9 — Production

* [ ] Connect production backend
* [ ] Connect real ANPR system
* [ ] Connect real CCTV feeds
* [ ] Configure production environment
* [ ] Production build
* [ ] Deployment
* [ ] Monitoring

---

# 🔮 Future Vision

The final TraffixAI platform is intended to provide a centralized traffic intelligence system capable of:

```text
                 CCTV NETWORK
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Camera 1    Camera 2    Camera N
          │           │           │
          └───────────┼───────────┘
                      ▼
                 ANPR / AI
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      Plate OCR   Detection    Tracking
          │           │           │
          └───────────┼───────────┘
                      ▼
                TRAFFIXAI API
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Map View   Vehicle Search  Analytics
          │           │           │
          └───────────┼───────────┘
                      ▼
               Traffic Command
                  Dashboard
```

The long-term goal is to move from a frontend MVP using simulated data to a **real-time city-wide traffic intelligence platform**.

---

# 🤝 Development

TraffixAI is currently under active development.

The frontend is being developed incrementally, with mock data being used during the MVP stage before connecting production APIs.

When adding new functionality, maintain the existing separation:

```text
Presentation
     ↓
Domain
     ↓
Data
     ↓
External Source
```

Avoid placing API calls directly inside UI components whenever possible.

---

# 📌 Project Status

**Current Status:** 🚧 MVP Development

**Platform:** React Native / Expo

**Language:** TypeScript

**Architecture:** 4-Layer Architecture

**Data Source:** Mock APIs

**Real-time Backend:** Planned

**Production ANPR Integration:** Planned

---

## 👨‍💻 TraffixAI

Built as a frontend MVP for an intelligent, centralized **CCTV + ANPR + Vehicle Tracking + Traffic Analytics** platform.
