# 🌐 Littlebro 
> **High-Scale Real-Time Geospatial Anomaly Analysis & Open Telemetry Dashboard**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![MapLibre](https://img.shields.io/badge/MapLibre-WebGL-orange.svg)

**Littlebro** is an advanced, high-performance geospatial intelligence platform engineered to aggregate, analyze, and visualize anomalies from 20 independent open-data telemetry pipelines in real time. 

Built on a strict ethical mandate, Littlebro empowers independent journalists, human rights researchers, and civil society with objective, mathematically sound field verification tools to combat misinformation, track infrastructure disruptions, and monitor public safety crises globally.

Developed by [@opeteer](https://github.com/opeteer).

---

## 🎯 Humanitarian & Ethical Mandate
- **Field Verification & OSINT:** Objective ground truth verification via sun azimuth photogrammetry, open metadata analysis, and thermal anomaly clustering.
- **Crisis & Disaster Mitigation:** Tracks internet BGP blackouts, critical retail operation status (The Waffle House Metric), and public connectivity disruptions.
- **Public Accountability:** Detects artificial shallow seismic tremors, civil aviation GNSS/GPS interference, and abnormal commercial foot-traffic surges (The Pizza Indicator) to expose hidden repressions and crises.

---

## 🚀 Key Features

* **Extreme Rigor & Mathematical Precision:** No dummy data. Real-time calculations of GNSS Navigation Accuracy Category (NACp) degradation, SGP4 orbital propagation using `skyfield`, and trigonometric sun-shadow ratios for photogrammetry.
* **Fault-Tolerant Micro-Pipelines:** 20 isolated, non-blocking asynchronous data ingestion pipelines powered by FastAPI, `httpx`, and APScheduler.
* **Resilient Connectivity:** Robust WebSocket manager with 25-second heartbeats and exponential backoff to survive reverse-proxy timeouts (Cloudflare Tunnel, FRP, etc.).
* **60-FPS WebGL Rendering:** Replaces traditional DOM-based maps with GPU-accelerated **MapLibre GL JS**, effortlessly handling thousands of simultaneous aviation, thermal, and seismic data points via native vector clustering.
* **Command Center HUD:** A sleek, low-latency React/Vite interface inspired by tactical dark-mode HUDs (`#080b11`, JetBrains Mono typography).

---

## 📡 The 20 Open-Data Pipelines

Littlebro ingests 100% free, public, and open telemetry data without compromising on scale:
1. **Aerospace & Navigation:** OpenSky Aviation Fleet Categorization, Diplomatic Tracker, GNSS Interference Heatmaps, CelesTrak SGP4 Satellite Tracking, Space Weather (NOAA SWPC).
2. **Geophysics & Maritime:** NASA FIRMS Thermal Anomalies, USGS Shallow Tremor Discriminator, Volunteer Maritime AIS, Public WebSDR Gateways.
3. **Cyber & Social Anomalies:** Cloudflare Radar / IODA BGP Outages, Z-Score Commercial Foot-Traffic Surges, OSINT News Channel Aggregation, and Strategic Commodities Volatility.

---

## 🛠️ Architecture Stack

- **Backend Engine:** Python 3.11, FastAPI, AsyncIO, Pydantic v2, APScheduler
- **Data & Pub/Sub Broker:** Redis 7 (Dynamic TTL caching)
- **Math & Astronomy:** NumPy, Skyfield, SGP4, Suncalc, GeoPy
- **Frontend App:** React 18, Vite, Tailwind CSS, MapLibre GL JS

---

## 📦 Deployment (Non-Interactive)

Littlebro is fully containerized and designed for rapid, headless deployment on any Linux server. All installation scripts are purely non-interactive.

### 1. Configuration
Clone the repository and set up your environment variables:
```bash
git clone https://github.com/opeteer/Littlebro.git
cd Littlebro
cp .env.example .env
```
*(Optional: Add your free `NASA_FIRMS_MAP_KEY` inside `.env` for high-throughput thermal data).*

### 2. Launching the Platform
Deploy the full stack (Redis, FastAPI Backend, React/Nginx Frontend) using Docker Compose:
```bash
docker compose up --build -d
```

### 3. Access
- **Command Center HUD:** `http://localhost:3000`
- **Backend API & Swagger Docs:** `http://localhost:8000/docs`

---

## 🛡️ License & Disclaimer

This software is released under the MIT License. It relies entirely on publicly accessible, open-source APIs and telemetry feeds. Littlebro is designed strictly for defensive intelligence, transparency, and humanitarian oversight.

---
> *“Veritas vos liberabit.”* — Built with extreme engineering rigor by [@opeteer](https://github.com/opeteer).
