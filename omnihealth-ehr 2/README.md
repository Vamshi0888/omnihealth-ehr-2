# OmniHealth EHR - Multi-Hospital Digital Health Record & OCR Consolidation Platform

A federated Electronic Health Record (EHR / PHR) system designed to consolidate prescriptions, laboratory diagnostics, and vaccination records across multiple disparate hospital networks (Mayo Clinic, Apollo Hospitals, Johns Hopkins Medicine, and Mount Sinai) via an intelligent Optical Character Recognition (OCR) pipeline.

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Hospital Federated Aggregation
- **Unified Master Patient Index**: Aggregates records for patient Eleanor Vance while preserving hospital-specific Medical Record Numbers (MRN / UHID):
  - **Mayo Clinic**: `MC-892410` (Epic MyChart)
  - **Apollo Hospitals**: `APL-440912` (Apollo Prism / FHIR)
  - **Johns Hopkins Medicine**: `JHM-771829` (Epic Systems)
  - **Mount Sinai Health System**: `MSH-310948` (Cerner Millennium)
- **Universal Search & Facility Filtering**: Switch between cross-hospital consolidated view and facility-specific records.

### 2. Intelligent Document OCR Pipeline & Side-by-Side Review
- **Interactive Scanning Workbench**:
  - Drag-and-drop document upload (prescriptions, lab panels, immunization certificates).
  - Built-in authentic 1-click sample templates from Mayo Clinic, Apollo Diagnostics, and Johns Hopkins.
  - Real-time image pre-processing filters (adaptive binarization, grayscale, contrast stretch, invert, 3x3 convolution sharpening, and 90° rotation).
- **Medical Named Entity Recognition (NER)**:
  - Extracts hospital headers, prescriber / pathologist details, Rx medications, dosages, frequency, lab biomarkers with observed values/units/reference intervals, and vaccine lots.
  - Optical confidence rating (e.g. 98.6%) and animated bounding box overlays indicating recognized fields.
- **Side-by-Side Verification Editor**:
  - Live side-by-side view with scanned image on the left and structured editable forms on the right.
  - Review, edit, and commit records directly into the active longitudinal EHR database.

### 3. Consolidated Health Vault Modules
- **Unified Longitudinal Timeline**: Chronological stream of encounters, medications, lab tests, and vaccines.
- **Longitudinal Biomarker Trend Charts**: Multi-hospital comparative trend graphs for Fasting Blood Glucose, HbA1c, Total Cholesterol, and Serum Creatinine with normal/high benchmark bands.
- **Drug-Drug Interaction Checker**: Automated cross-prescription contraindication alerts (e.g., ACE inhibitors + potassium elevation risks).
- **Verifiable Vaccination Passport**: SMART Health Card compliant digital immunization passport with verifiable QR code badges.
- **Universal Emergency Medical ID Card**: Rapid-glance profile for emergency personnel with blood type (A+), severe allergies (Penicillin, Sulfa), active medications, and primary emergency contacts.
- **Interoperability & Export**:
  - Standard HL7 / FHIR R4 Bundle JSON export (`Patient`, `MedicationRequest`, `Observation`, `Immunization`).
  - Print-ready clean medical summary PDF layout.

---

## 🚀 Running the Live Application

### Starting the Local Live Server
Run the built-in, zero-dependency Python server:
```bash
python3 server.py
```
Open your browser and navigate to:
```
http://localhost:8080
```

### Live Cloud Deployment
To deploy to a public URL:
- **Vercel**:
  ```bash
  npx -y vercel --prod
  ```
- **Netlify**:
  ```bash
  npx -y netlify-cli deploy --prod --dir=.
  ```
- **GitHub Pages**:
  Push this repository and enable GitHub Pages on the `main` or `gh-pages` branch.

---

## 📂 Project Structure
```
omnihealth-ehr/
├── index.html            # Main single-page application shell & views
├── css/
│   └── styles.css        # Responsive clinical design system
├── js/
│   ├── sample-data.js    # Multi-hospital records & OCR demo templates
│   ├── ocr-engine.js     # Canvas image filters, OCR tokenizer & medical NER
│   ├── charts.js         # Longitudinal SVG biomarker trend visualization
│   └── app.js            # State management, search, OCR review & FHIR export
├── server.py             # High-performance Python HTTP server & REST APIs
├── deploy.sh             # Cloud deployment helper script
└── README.md             # Documentation
```
