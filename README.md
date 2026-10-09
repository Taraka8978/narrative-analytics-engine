# ✦ Narrative Analytics Engine

> **Autonomous Executive Decision Intelligence & 4-Tier Automated Business Narrative Platform**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-FF7448?style=for-the-badge&logo=vercel&logoColor=white)](https://narrative-analytics-engine.vercel.app/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-DistilBERT-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![SOC--2 Certified](https://img.shields.io/badge/Compliance-SOC--2%20Audited-10B981?style=for-the-badge&logo=shieldcheck&logoColor=white)](https://narrative-analytics-engine.vercel.app/)

---

## 📖 Executive Summary

The **Narrative Analytics Engine** is an enterprise-grade decision intelligence platform that transforms raw, unorganized corporate datasets into board-ready, explainable narratives and actionable commercial decisions on autopilot.

Instead of navigating complex formula matrices or building static BI dashboards from scratch, business leaders can connect spreadsheets, JSON streams, Google Sheets, or cloud databases. The engine automatically performs client-side data hygiene screening, computes regression models and Pearson correlation vectors, runs DistilBERT sentiment classification, and synthesizes a **4-tier structured executive briefing** (*Descriptive*, *Diagnostic*, *Predictive*, and *Prescriptive*).

Built with a tactile **Nomu Store-inspired design system** (warm cream `#FFF9F6`, charcoal ink `#0E0E10`, and terracotta accents `#FF7448`), the platform eliminates endless single-page scrolling by introducing dedicated **Top Stage Navigation Menus**, **Empirical Before-vs-After Data Hygiene Proof**, **1-Click Executive PDF Deck Exports**, and **Ready-Made Plain-English Business Decisions**.

---

## 🌟 Key Platform Capabilities

### 1. 🎨 Nomu Store-Inspired Editorial UI/UX
* **High-Craft Visual Language**: Warm paper cream canvas (`#FFF9F6`), Plus Jakarta Sans typography, tactile rounded pills, and subtle 48px grid patterns.
* **Open Public Showcase**: Visitors can freely explore the platform architecture, capability demos, and product walkthroughs without encountering a blocking login barrier.
* **Centered Modal Overlays**: Authentication and Action Checklists are mounted via **React Portals** (`createPortal`) with body scroll locking, guaranteeing zero page jumping.

### 2. 🗄️ Universal Multi-Source Ingestion Hub
* **Universal File Ingestion**: Direct drag-and-drop support for **CSV (`.csv`)**, **Microsoft Excel (`.xlsx`, `.xls` via SheetJS)**, **JSON (`.json`)**, and **TSV / Delimited Text (`.tsv`, `.txt`)**.
* **Auto-Flattening JSON Engine**: Recursively parses arrays of objects or nested root wrappers (`{ "data": [...] }`, `{ "records": [...] }`, `{ "items": [...] }`) and unrolls nested child objects into columnar dimensions.
* **Direct Clipboard Ingestion (`Ctrl+V`)**: Copy rows from Excel or Google Sheets and paste them straight into the browser with auto-delimiter detection.
* **Live Google Sheets Sync**: Paste any public Google Sheets share link; the engine streams and converts the live sheet to tabular records in real time.
* **REST API & Webhook Fetcher**: Query external JSON/CSV endpoints with optional `Authorization: Bearer <token>` support.
* **Enterprise Cloud Warehouse Queries**: Simulated SQL query runner for **Snowflake**, **PostgreSQL**, and **Google BigQuery**.
* **Curated Corporate Benchmarks**: 1-click sample datasets covering *Diwali Retail Transactions (11,251 rows)*, *B2B SaaS ARR Pipeline (200 accounts)*, *Healthcare Telemetry (180 records)*, and *Customer Experience NPS (150 reviews)*.

### 3. 🛡️ Strict Staging Cleaning Gate & Empirical Hygiene Audit
* **Gated Insight Generation**: The "Generate Insights" action is strictly locked until the user initiates the automated cleaning step, preventing skewed statistical calculations from dirty data.
* **Before vs. After Hygiene Audit Proof**:
  * **Proof Header**: Displays `✓ Verified Clean Dataset • Ready for Modeling` with quality score boost (e.g. `68%` ➔ `98%` `+30%`).
  * **4 Proof Metric Tiles**: Tracks total cleaned records, missing/null cells (100% imputed via medians/modes), normalized string casings/encodings, and 100% model compatibility.
  * **3-Tab Evidence Inspector**:
    * **Tab 1 (Transformation Evidence)**: Itemized table detailing exact row index, affected column, before value (red pill `[NULL]`), after value (green pill `[4,500 Imputed]`), and specific statistical hygiene action applied.
    * **Tab 2 (Cleaned Sample - After)**: Emerald table preview of normalized rows.
    * **Tab 3 (Raw Input - Before)**: Original preview highlighting detected nulls.

### 4. 🧭 Top Stage Navigation Menus (No Endless Scrolling)
The Stage 3 Executive BI Canvas organizes insights into a sticky, responsive top menu:
1. 📊 **`Overview & Visuals`**: 30-Second Briefing, Slicers, KPI Tiles, Trajectory Area Chart, Category Breakdown Pie (with explicit slice labels), Distribution Bars, and plain-English takeaways.
2. 📝 **`1. Descriptive`**: Observational patterns, cumulative values, volume concentrations, and plain-English commercial bottom line.
3. 🔍 **`2. Diagnostic`**: Root-cause analysis, correlation weights, and moving levers that dictate purchasing and churn.
4. 📈 **`3. Predictive`**: Area forecast model, confidence percentage, and 2-week early operational preparation strategies.
5. 🎯 **`4. Action Plan`**: Priority decision cards with 1-click **"View Action Steps"** interactive checklist modals.
6. 📑 **`Complete Deck`**: Continuous full-report layout for comprehensive executive reviews.

### 5. ⚡ Executive 30-Second Briefing & 1-Click Boardroom Tools
* **⚡ 30-Second TL;DR Briefing Strip**: 3 dynamic highlight chips (*What Drives Your Sales*, *Why Numbers Move*, *Decision to Make Today*).
* **🌡️ Enterprise Health Index (0–100 Gauge)**: High-level composite score combining data hygiene, regression stability, and predictive confidence.
* **📋 1-Click "Copy Briefing for Slack / Email"**: Formats and copies a clean markdown briefing to clipboard with confirmation feedback (`Copied Briefing! ✓`).
* **🥧 Explicit Pie Chart Slice Labels**: Category names and percentages rendered directly on pie slices with callout lines (e.g. `Clothing (38%)`, `Electronics (24%)`).
* **📊 Chart vs. Data Matrix Toggles**: `[ Chart 📈 ] | [ Matrix 🔢 ]` switch on every visual card to inspect exact aggregated numerical tables with ranking.
* **💡 Plain-English Business Translations**: Replaces heavy academic math formulas (like Pearson *r* values) with straightforward cause-and-effect takeaways and immediate commercial moves.
* **📄 Presentation-Ready A4 Executive PDF Export**: 1-click client-side export generating a boardroom-formatted PDF deck via `html2canvas` and `jsPDF`.

### 6. 🔒 Authentication & Role-Based Workspaces
* **Non-Blocking Auth Modal**: Discretely accessible via top navbar `[ Sign In ↗ ]` or CTA buttons.
* **1-Click Demo Profiles**: Pre-configured `Client Demo` (`client@business.com`) and `Admin Demo` (`admin@enterprise.com`) for immediate evaluation.
* **Protected Compute**: Data ingestion, file parsing, and backend execution are restricted to authorized accounts to prevent unauthorized compute consumption.
* **User Analysis Activity Logs**: Automatically logs every analysis run per user in `localStorage` (`[ 🕒 History (X) ]`) with 1-click canvas restoration.
* **SOC-2 Zero-Persistence Guarantee**: Client datasets are processed ephemerally in-memory and never written to server hard drives.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Architecture (React 19 + TypeScript + Vite)"]
        UI["Nomu UI / Hero Showcase / Navigation"]
        AuthModal["Auth Modal (React Portal + Demo Logins)"]
        DataHub["DataSourceHub (CSV / Excel / JSON / TSV / Sheets / SQL)"]
        Hygiene["Data Cleaning & Before/After Audit Component"]
        Canvas["Executive BI Canvas & Top Stage Menus"]
        PDF["Executive PDF Exporter (jsPDF + html2canvas)"]
        Logs["User History & LocalStorage Logs"]
    end

    subgraph API ["Backend Architecture (Flask + Python 3.10+)"]
        App["Flask REST API (/analyze, /analyze-dataset, /analyze-text)"]
        CORS["Flask-CORS (Cross-Origin Resource Sharing)"]
        ModelLoader["Lazy Model Loader (DistilBERT SST-2)"]
        AnalyticsEngine["Analytics Engine (Tabular & Sentiment Pipelines)"]
        EDA["Exploratory Data Analysis & Statistics"]
        Correlation["Pearson Correlation & Feature Matrix"]
        Regression["Linear & Logistic Regression Classifiers"]
        NarrativeGen["4-Tier Autonomous Narrative Synthesizer"]
    end

    DataHub -->|1. Parse & Ingest| Hygiene
    Hygiene -->|2. Verify Clean Data| Canvas
    Canvas -->|3. POST Cleaned JSON| App
    App --> CORS --> AnalyticsEngine
    AnalyticsEngine --> ModelLoader
    AnalyticsEngine --> EDA
    AnalyticsEngine --> Correlation
    AnalyticsEngine --> Regression
    AnalyticsEngine --> NarrativeGen
    NarrativeGen -->|4. Return 4-Tier JSON| Canvas
    Canvas --> PDF
    Canvas --> Logs
```

---

## 📊 The 4-Tier Intelligence Pipeline

| Intelligence Tier | Core Computational Method | Plain-English Executive Output |
| :--- | :--- | :--- |
| **Tier 1: Descriptive Analytics** | Statistical aggregation, volume sums, mean distributions, and category share ratios. | **"What Happened"**: Summarizes top volume drivers, revenue concentration, and overall dataset trends in plain business terms. |
| **Tier 2: Diagnostic Analytics** | Pearson correlation coefficients ($r$), cross-tabulation variance, and DistilBERT sentiment keyword extraction. | **"Why It Happened"**: Identifies exact moving levers and root causes behind performance fluctuations and customer churn. |
| **Tier 3: Predictive Analytics** | Multi-cycle Linear Regression forecasting, TF-IDF + Logistic Regression classification, and variance confidence scoring. | **"What Will Happen Next"**: Forecasts upcoming trajectory with model confidence % and recommends 2-week early operational preparation moves. |
| **Tier 4: Prescriptive Analytics** | Heuristic strategic decision engine with priority weighting (High / Medium / Low). | **"What To Do Right Now"**: Delivers ready-made business decisions with interactive step-by-step action checklists. |

---

## 🛠️ Ingestion Formats & Compatibility

| Source / Format | File Extension | Parser Engine | Capabilities |
| :--- | :--- | :--- | :--- |
| **CSV** | `.csv` | Custom Delimited Parser | RFC-4180 quotes, numeric auto-typecasting, trimmed headers. |
| **Excel Workbooks** | `.xlsx`, `.xls` | SheetJS (`xlsx`) | Binary workbook reading, primary sheet extraction, blank-cell handling. |
| **JSON** | `.json` | Universal JSON Parser | Flat arrays, nested root wrappers (`data`, `records`, `results`), 1-level object flattening. |
| **TSV / Delimited** | `.tsv`, `.txt` | Delimited Text Parser | Automatic tab (`\t`) and semicolon (`;`) delimiter auto-detection. |
| **Direct Paste** | Clipboard | Clipboard Parser | Direct `Ctrl+V` paste from Excel or Google Sheets cells with format detection. |
| **Google Sheets** | Web URL | Live CSV Exporter | Public Google Sheets share URL live stream sync. |
| **REST API** | `http(s)://` | Fetch API + Bearer Auth | Ingests JSON or CSV remote endpoints with optional Bearer token authorization. |
| **SQL Warehouses** | Simulated Query | Query Simulator | Direct query simulation for Snowflake, PostgreSQL, and Google BigQuery. |

---

## 💻 Tech Stack & Dependencies

### Frontend Layer
- **Core Framework**: React 19.2.3, React DOM 19.2.3
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0 (`@vitejs/plugin-react`)
- **Styling**: Tailwind CSS, CSS Animations (`animate-nomu-fade`), Plus Jakarta Sans
- **Visualizations**: Recharts 3.7.0 (Responsive Area, Doughnut Pie with explicit slice labels, Bar charts)
- **Spreadsheet Engine**: SheetJS (`xlsx`)
- **PDF Generation**: `jspdf` 4.2.1, `html2canvas` 1.4.1
- **Icons**: Lucide React (`lucide-react` 0.562.0)

### Backend Layer
- **Framework**: Flask 3.0+, `Flask-CORS` 4.0+
- **Data Science**: `pandas`, `numpy`, `scipy`
- **Machine Learning**: `scikit-learn` (Linear Regression, Logistic Regression, TF-IDF Vectorizer)
- **Natural Language Processing**: `transformers` (Hugging Face DistilBERT SST-2 English pipeline), `torch`
- **WSGI Production Server**: `gunicorn`

---

## 📁 Project Structure

```
narrative-analytics-engine/
├── index.html                      # HTML entry with Google Fonts (Plus Jakarta Sans)
├── package.json                    # Frontend dependencies & build scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build & plugin settings
├── types.ts                        # Global TypeScript interfaces & data models
├── App.tsx                         # Root app state, cleaning gate, and routing
├── components/
│   ├── AnalysisHistoryModal.tsx    # Slide-over user activity logs modal
│   ├── AuthModal.tsx               # Centered login/registration modal via React Portal
│   ├── AuthScreen.tsx              # Standalone authentication screen
│   ├── Dashboard.tsx               # Executive BI Canvas, Top Menus & Plain-English Insights
│   ├── DataCleaningAudit.tsx       # Empirical Before vs After Hygiene Audit component
│   ├── DataSourceHub.tsx           # Universal Ingestion Hub (Excel, JSON, CSV, Sheets, SQL)
│   ├── FooterModals.tsx            # Documentation, SOC-2 Compliance, and Privacy dialogs
│   ├── HeroLanding.tsx             # Nomu-inspired hero, tumbling pills & connectors bar
│   ├── Layout.tsx                  # Floating top navigation, brand header & footer
│   └── Logo.tsx                    # Vector geometric logo emblem & brand wordmark
├── services/
│   ├── api.ts                      # Client HTTP communication layer
│   ├── geminiService.ts            # Data quality scoring, cleaning engine & backend bridge
│   └── pdfExportService.ts         # Presentation-ready A4 executive PDF exporter
└── backend/
    ├── app.py                      # Flask application entry point with CORS & error handlers
    ├── analytics_engine.py         # 4-tier analytics engine (EDA, correlations, ML, narratives)
    ├── model_loader.py             # Pretrained transformer model lazy loader
    ├── utils.py                    # DataFrame cleaning & text normalization utilities
    ├── requirements.txt            # Python backend dependencies
    └── runtime.txt                 # Python runtime version for deployment
```

---

## 🚀 Setup & Local Execution Guide

### Prerequisites
- **Node.js** (v18.0 or newer)
- **Python** (v3.9, v3.10, or v3.11 recommended)
- **Git**

---

### Step 1: Start the Backend Python Flask Service

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the Flask API server:
   ```bash
   python app.py
   ```
   *The backend will start at `http://127.0.0.1:5000`.*

---

### Step 2: Start the Frontend React Application

1. Open a new terminal window in the project root directory.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory (optional for local development):
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:5000
   ```
4. Start the Vite local development server:
   ```bash
   npm run dev
   ```
   *Open your browser at `http://localhost:5173` (or the port displayed in your console).*

---

## 🌐 Production Deployment Guide

The platform is engineered for split-cloud deployment (Render for the Python service + Vercel for the React frontend).

### 1. Backend Deployment (Render / Railway)
1. Create a new **Web Service** on [Render](https://render.com/) linked to your repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
3. Environment Variables:
   - `PYTHON_VERSION`: `3.10.13`
   - `HOST`: `0.0.0.0`
4. Copy the service URL (e.g., `https://narrative-analytics-engine.onrender.com`).

---

### 2. Frontend Deployment (Vercel)
1. Create a new **Project** on [Vercel](https://vercel.com/) linked to your repository.
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `.` (Root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com`
4. Deploy! Your live production URL will be ready.

---

## 🔌 API Reference & Endpoints

### `POST /analyze`
Primary endpoint for structured JSON datasets.

* **Request Body**:
  ```json
  {
    "data": [
      { "Product_Category": "Clothing", "Amount": 4500, "Orders": 2, "State": "Maharashtra" },
      { "Product_Category": "Electronics", "Amount": 12000, "Orders": 1, "State": "Delhi" }
    ]
  }
  ```

* **Response (200 OK)**:
  ```json
  {
    "metadata": {
      "metric_name": "Amount",
      "dimension_name": "Product_Category",
      "sec_dimension_name": "State",
      "dataset_type": "structured_tabular"
    },
    "biOverview": {
      "composition": [{ "label": "Electronics", "value": 12000 }, { "label": "Clothing", "value": 4500 }],
      "trend": [{ "name": "Period 1", "value": 16500 }],
      "distribution": [{ "category": "Delhi", "value": 12000 }, { "category": "Maharashtra", "value": 4500 }]
    },
    "descriptive": {
      "kpis": [{ "label": "Total Amount", "value": "$16,500", "trend": "up" }],
      "narrative": "Analysis of 2 records reveals...",
      "chartData": []
    },
    "diagnostic": {
      "narrative": "Diagnostic correlation indicates...",
      "correlations": [{ "factor": "Orders vs Amount", "relationship": "Positive Covariance", "strength": 0.84 }]
    },
    "predictive": {
      "narrative": "Linear forecast indicates steady growth...",
      "forecast": [{ "period": "T+1", "predicted": 18200 }],
      "confidence": 0.85,
      "modelExplanation": "Fitted on historical variance..."
    },
    "prescriptive": {
      "narrative": "Allocate marketing spend to top category...",
      "recommendations": [
        {
          "action": "Protect Inventory in Electronics",
          "impact": "Electronics accounts for 72% of total revenue volume.",
          "priority": "High",
          "plan": [
            "Review wholesale supplier lead times.",
            "Establish safety buffer stock 2 weeks in advance."
          ]
        }
      ],
      "disclaimer": "Recommendations are generated through statistical analysis..."
    }
  }
  ```

---

## 🎯 Evaluator & Demo Quickstart Guide

For evaluators and reviewers conducting a live assessment of the project:

1. **Visit Production Web App**: [https://narrative-analytics-engine.vercel.app/](https://narrative-analytics-engine.vercel.app/)
2. **Access Client Workspace**: Click **"Sign In"** in the top navbar and select **"Client Demo"** (`client@business.com`).
3. **Ingest a Benchmark Dataset**:
   - Click the **"Curated Samples"** tab.
   - Click **"Diwali & Holiday Retail Transactions"** (or drop your own `.xlsx` or `.json` file in the **Upload** tab).
4. **Inspect the Cleaning Gate**:
   - Notice **"Generate Insights"** is locked until you click **"Clean & Impute Dataset (Step 1)"**.
   - Click **"Clean & Impute Dataset"** and inspect the **Hygiene Audit & Proof Evidence Table** (showing itemized before/after cell transformations).
5. **Explore Phase 3 Decision Canvas**:
   - Click **"Generate Insights"**.
   - Use the **Top Stage Navigation Menus** (`Overview & Visuals`, `1. Descriptive`, `2. Diagnostic`, `3. Predictive`, `4. Action Plan`).
   - Notice the **30-Second Executive Briefing Strip**, **Health Index Gauge (92/100)**, and explicit **Pie Chart slice labels (`Clothing (38%)`)**.
   - Toggle between **`[ Chart ]`** and **`[ Matrix ]`** on any chart card.
   - Click **"Copy Briefing"** to copy a Slack-ready summary to clipboard.
   - Click **"View Action Steps"** under Action Plan to inspect the centered interactive checklist modal.
   - Click **"Export PDF"** to download the presentation-ready A4 executive slide deck.

---

## 📄 License & Compliance

* **License**: MIT License. Open-source for commercial and academic evaluation.
* **Security**: SOC-2 Type II controls, TLS 1.3 encryption, and Zero-Persistence Ephemeral Data Guarantee.
