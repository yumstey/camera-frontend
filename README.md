# 🌿 Park Analytics Dashboard

React + Recharts + Pure CSS dashboard (Tailwind yo'q).

---

## 🚀 Ishga tushirish

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## 📁 Fayl strukturasi

```
park-analytics/
├── public/
│   └── index.html             # HTML template, Google Fonts
│
├── src/
│   ├── api/
│   │   └── analyticsApi.js    # ⭐ API layer (mock + real rejim)
│   │
│   ├── hooks/
│   │   └── useAnalyticsData.js # Data fetching + auto-refresh hook
│   │
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigatsiya
│   │   ├── StatCard.jsx        # KPI karta
│   │   ├── VisitorActivityChart.jsx  # Chiziqli grafik
│   │   ├── PeakLoadChart.jsx   # Ustunli grafik
│   │   ├── TrafficGenderChart.jsx    # Donut chart
│   │   └── CamerasPage.jsx     # Kameralar sahifasi
│   │
│   ├── styles/
│   │   ├── global.css          # CSS variables, layout, utility
│   │   ├── sidebar.css
│   │   ├── statcard.css
│   │   ├── charts.css
│   │   └── cameras.css
│   │
│   ├── App.jsx                 # Asosiy sahifa va routing
│   └── main.jsx                # React entry point
│
├── .env.example               # Environment variables namunasi
├── package.json
└── vite.config.js
```

---

## 🔌 Real API ga ulash

### 1. `analyticsApi.js` ni oching:
```js
const USE_MOCK = false;  // ← shu qatorni o'zgartiring
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

### 2. `.env` fayl yarating:
```bash
cp .env.example .env
```
```env
VITE_API_BASE_URL=https://your-api.com/api
VITE_WS_URL=wss://your-api.com/ws/stats
```

### 3. Backend javob formatini moslashtiring:

`GET /stats/overview` → javob:
```json
{
  "nowInPark":    { "value": 721000, "change": 11.01 },
  "loginsToday":  { "value": 527000, "change": -0.03 },
  "outputsToday": { "value": 1156,   "change": 15.03 },
  "avgPerWeek":   { "value": 239000, "change": 6.08  }
}
```

`GET /stats/visitor-activity` → javob:
```json
[
  { "month": "Jan", "entrance": 8000000, "exit": 6000000 },
  { "month": "Feb", "entrance": 10000000, "exit": 11000000 }
]
```

`GET /cameras` → javob:
```json
[
  { "id": "cam-01", "name": "North Gate", "status": "online", "visitors": 1240 },
  { "id": "cam-02", "name": "South Gate", "status": "offline", "visitors": 0 }
]
```

---

## 📹 Kamera stream ulash

`CamerasPage.jsx` da kommentariyalar bor. Uchta variant:

### HLS (m3u8 stream):
```jsx
import Hls from 'hls.js';
// video elementga ulang
<video ref={videoRef} autoPlay muted playsInline />
```

### MJPEG (oddiy kamera):
```jsx
<img src={`${BASE_URL}/cameras/${camera.id}/mjpeg`} alt="stream" />
```

### WebRTC iframe:
```jsx
<iframe src={`https://your-server/camera/${camera.id}`} allow="camera" />
```

---

## ⚡ Real-time WebSocket

```js
// App.jsx da yoqish:
import { connectStatsSocket } from './api/analyticsApi';

useEffect(() => {
  const ws = connectStatsSocket((newData) => {
    setStats(newData);
  });
  return () => ws.close();
}, []);
```

---

## 🎨 Ranglarni o'zgartirish

`src/styles/global.css` da CSS variables:
```css
:root {
  --accent-blue: #4a90d9;   /* grafik rangi */
  --accent-green: #7ec87e;  /* ikkinchi rang */
  --bg-main: #eef0f5;       /* fon */
}
```

---

## 📦 Build (production)

```bash
npm run build
# dist/ papkasi tayyor
```
