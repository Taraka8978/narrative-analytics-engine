# Narrative Analytics Engine

An executive-level automated analytics and decision-support dashboard. The application parses raw datasets, performs client-side quality screenings, stages and cleans data, and runs a comprehensive 4-tier analytics pipeline (Descriptive, Diagnostic, Predictive, and Prescriptive) with sentiment analysis and explainable ML.

---

## 🏛️ System Architecture

1. **Frontend (Vite + React + TypeScript + Recharts + Tailwind CSS)**
   - Ingests and parses CSV files.
   - Computes data quality metrics (Completeness, Robustness, Diversity).
   - Operates data cleaning transformation controls (Imputation, Normalization, Deduplication).
   - Visualizes dataset metrics, correlation vectors, predictive models, and tactical recommendations.

2. **Backend (Flask + Pandas + Scikit-Learn + Hugging Face Transformers)**
   - Lazy-loads a pretrained `distilbert-base-uncased-sst-2-english` pipeline for single-pass sentiment classification.
   - Computes statistical aggregates, text lengths, and category ratios.
   - Identifies word frequencies and semantic negative keyword clusters.
   - Computes numeric Pearson correlation coefficients.
   - Trains a local Logistic Regression classifier on TF-IDF word vectors to gauge predictability and yields metrics (F1, accuracy).
   - Formulates explainable narratives and strategic recommendations.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Node.js** (v18.0 or newer)
- **Python** (v3.9 or newer)

---

### Step 1: Run the Backend Flask Server

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install required Python libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask application:
   ```bash
   python app.py
   ```
   *The backend server will launch at `http://127.0.0.1:5000`.*

---

### Step 2: Run the Frontend Vite React Application

1. Open a new terminal window in the root directory of the project.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the local frontend development server:
   ```bash
   npm run dev
   ```
   *The application will open in your browser, typically at `http://localhost:3000` (or the port specified in your console).*

---

## 📊 Analytical Pipeline Workflow

1. **Upload Dataset**: Drag & drop or upload any CSV file (e.g., containing customer feedback reviews and numerical dimensions).
2. **Quality Rating**: Review the completeness score. If the file is healthy (green/yellow), you can proceed.
3. **Data Cleaning**: Click **Clean Dataset** to run deduplication and missing-value imputation. You can preview the cleaned data and download the processed CSV.
4. **Generate Insights**: Click **Generate Insights**. This initiates the Flask analytical pipeline. The engine processes text sentiment, calculates correlations, trains a classifier, and populates the **Executive BI Canvas** complete with interactive charts and explainable text narratives.

---

## 🌐 Production Deployment Guide

You can deploy the Narrative Analytics Engine for production in a split-client setup. The backend runs as a Python web service and the frontend is hosted as a static web application.

### 1. Deploy the Backend (e.g., on Render)

Render is ideal for hosting the Flask backend.

1. **Create a Web Service** on Render and connect it to your GitHub repository.
2. Configure these settings:
   - **Environment**: `Python`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
3. Add the following **Environment Variables** in the Render settings:
   - `PORT`: `5000` (Render will bind automatically)
   - `PYTHON_VERSION`: `3.10.13`
4. Copy the resulting Service URL (e.g., `https://narrative-backend.onrender.com`).

---

### 2. Deploy the Frontend (e.g., on Vercel or Netlify)

Vercel/Netlify is ideal for hosting the static React frontend.

1. **Create a Project** on Vercel/Netlify and link it to your GitHub repository.
2. Configure these settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `.` (Root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add the following **Environment Variable** in the frontend hosting dashboard:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com` (Your deployed Render backend URL)
4. Trigger the build. Your deployed frontend site is now ready!

