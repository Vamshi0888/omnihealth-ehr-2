/**
 * OmniHealth EHR - Sample Patient & Multi-Hospital Medical Records
 * Features authentic data across Mayo Clinic, Apollo Hospitals, Johns Hopkins, and Mount Sinai
 */

const OMNI_SAMPLE_DATA = {
  patient: {
    id: "PT-109283",
    name: "Eleanor Vance",
    dob: "1988-04-14",
    age: 38,
    gender: "Female",
    bloodGroup: "A+",
    phone: "+1 (555) 349-8210",
    email: "eleanor.vance@example.com",
    address: "742 Evergreen Terrace, Springfield, OR",
    abhaId: "91-4402-9812-3301",
    ssnLast4: "4921",
    allergies: [
      { allergen: "Penicillin", reaction: "Anaphylaxis & Urticaria", severity: "Severe" },
      { allergen: "Sulfa Antibiotics", reaction: "Erythematous rash", severity: "Moderate" },
      { allergen: "Peanuts", reaction: "Gastrointestinal distress", severity: "Mild" }
    ],
    chronicConditions: [
      { condition: "Type 2 Diabetes Mellitus", icd10: "E11.9", diagnosedDate: "2023-05-10", status: "Active" },
      { condition: "Essential Hypertension", icd10: "I10", diagnosedDate: "2022-11-04", status: "Active" },
      { condition: "Mild Dyslipidemia", icd10: "E78.5", diagnosedDate: "2024-02-18", status: "Under Control" }
    ],
    emergencyContacts: [
      { name: "David Vance", relationship: "Spouse", phone: "+1 (555) 349-8211", isPrimary: true },
      { name: "Dr. Sarah Chen", relationship: "Primary Care Physician", phone: "+1 (555) 892-4410", isPrimary: false }
    ],
    hospitalAffiliations: [
      {
        id: "hosp-mayo",
        name: "Mayo Clinic",
        network: "Mayo Clinic Health System",
        location: "Rochester, MN, USA",
        mrn: "MC-892410",
        ehrSystem: "Epic MyChart",
        accreditation: "JCI / Magnet Recognized",
        phone: "+1 (507) 284-2511",
        color: "#2563eb",
        badge: "Mayo",
        syncedRecords: 6
      },
      {
        id: "hosp-apollo",
        name: "Apollo Hospitals",
        network: "Apollo Healthcare Global",
        location: "Bangalore & Chennai, India",
        mrn: "APL-440912",
        ehrSystem: "Apollo Prism / FHIR",
        accreditation: "JCI / NABH Accredited",
        phone: "+91 80 2630 4050",
        color: "#059669",
        badge: "Apollo",
        syncedRecords: 5
      },
      {
        id: "hosp-jhm",
        name: "Johns Hopkins Medicine",
        network: "Johns Hopkins Health System",
        location: "Baltimore, MD, USA",
        mrn: "JHM-771829",
        ehrSystem: "Epic Systems",
        accreditation: "Top 5 US News Honor Roll",
        phone: "+1 (410) 955-5000",
        color: "#0284c7",
        badge: "Johns Hopkins",
        syncedRecords: 5
      },
      {
        id: "hosp-mountsinai",
        name: "Mount Sinai Health System",
        network: "Mount Sinai Hospitals Network",
        location: "New York, NY, USA",
        mrn: "MSH-310948",
        ehrSystem: "Cerner Millennium",
        accreditation: "Magnet Hospital / JCI",
        phone: "+1 (212) 241-6500",
        color: "#7c3aed",
        badge: "Mount Sinai",
        syncedRecords: 4
      }
    ]
  },

  prescriptions: [
    {
      id: "rx-001",
      hospitalId: "hosp-mayo",
      hospitalName: "Mayo Clinic",
      hospitalMrn: "MC-892410",
      doctorName: "Dr. Gregory M. House, MD",
      specialty: "Cardiovascular Medicine",
      prescribedDate: "2026-07-20",
      validUntil: "2027-01-20",
      status: "Active",
      refillsLeft: 3,
      medications: [
        {
          name: "Atorvastatin Calcium",
          brandName: "Lipitor",
          dosage: "20 mg",
          form: "Oral Tablet",
          frequency: "Once daily at bedtime",
          instructions: "Take with or without water. Avoid large quantities of grapefruit juice.",
          indication: "Hyperlipidemia & cardiovascular risk reduction",
          rxNorm: "617314",
          daysSupply: 90
        }
      ],
      ocrScanned: true,
      scanConfidence: 97.8,
      sourceDocName: "Mayo_Clinic_Rx_Atorvastatin_2026.pdf"
    },
    {
      id: "rx-002",
      hospitalId: "hosp-apollo",
      hospitalName: "Apollo Hospitals",
      hospitalMrn: "APL-440912",
      doctorName: "Dr. Sunita K. Rao, MD, DM",
      specialty: "Endocrinology & Diabetology",
      prescribedDate: "2026-06-15",
      validUntil: "2026-12-15",
      status: "Active",
      refillsLeft: 2,
      medications: [
        {
          name: "Metformin Hydrochloride Extended Release",
          brandName: "Glucophage XR",
          dosage: "500 mg",
          form: "Extended-Release Tablet",
          frequency: "Twice daily with meals",
          instructions: "Swallow whole with dinner and breakfast. Do not crush or chew.",
          indication: "Type 2 Diabetes Glycemic Management",
          rxNorm: "860975",
          daysSupply: 60
        }
      ],
      ocrScanned: true,
      scanConfidence: 96.2,
      sourceDocName: "Apollo_Rx_Metformin_Jun2026.jpg"
    },
    {
      id: "rx-003",
      hospitalId: "hosp-jhm",
      hospitalName: "Johns Hopkins Medicine",
      hospitalMrn: "JHM-771829",
      doctorName: "Dr. Robert Vance, MD, FACC",
      specialty: "Hypertension & Nephrology",
      prescribedDate: "2026-03-10",
      validUntil: "2026-09-10",
      status: "Active",
      refillsLeft: 1,
      medications: [
        {
          name: "Lisinopril",
          brandName: "Prinivil / Zestril",
          dosage: "10 mg",
          form: "Oral Tablet",
          frequency: "Once daily every morning",
          instructions: "Monitor blood pressure weekly. Report persistent dry cough.",
          indication: "Essential Hypertension",
          rxNorm: "29046",
          daysSupply: 90
        }
      ],
      ocrScanned: true,
      scanConfidence: 98.4,
      sourceDocName: "JHM_Rx_Lisinopril_Mar2026.pdf"
    },
    {
      id: "rx-004",
      hospitalId: "hosp-mountsinai",
      hospitalName: "Mount Sinai Health System",
      hospitalMrn: "MSH-310948",
      doctorName: "Dr. Marcus Brody, MD",
      specialty: "Internal Medicine",
      prescribedDate: "2025-11-05",
      validUntil: "2026-02-05",
      status: "Discontinued",
      refillsLeft: 0,
      medications: [
        {
          name: "Glipizide",
          brandName: "Glucotrol",
          dosage: "5 mg",
          form: "Tablet",
          frequency: "Once daily 30 minutes before first meal",
          instructions: "Discontinued and switched to Metformin monotherapy.",
          indication: "Type 2 Diabetes",
          rxNorm: "4821",
          daysSupply: 30
        }
      ],
      ocrScanned: true,
      scanConfidence: 94.5,
      sourceDocName: "MountSinai_Rx_Glipizide_Historical.pdf"
    }
  ],

  labReports: [
    {
      id: "lab-001",
      hospitalId: "hosp-apollo",
      hospitalName: "Apollo Hospitals",
      hospitalMrn: "APL-440912",
      reportTitle: "Comprehensive Metabolic & Lipid Diagnostic Panel",
      department: "Clinical Biochemistry & Pathology",
      pathologist: "Dr. R. Venkataraman, MD (Path)",
      collectionDate: "2026-06-15",
      reportedDate: "2026-06-16",
      specimen: "Serum & Fluoride Whole Blood",
      status: "Final Validated",
      ocrScanned: true,
      scanConfidence: 98.1,
      sourceDocName: "Apollo_LabReport_Metabolic_Jun2026.pdf",
      tests: [
        { name: "Fasting Blood Glucose", value: 138, unit: "mg/dL", rangeMin: 70, rangeMax: 99, flag: "HIGH", critical: false },
        { name: "Glycated Hemoglobin (HbA1c)", value: 6.8, unit: "%", rangeMin: 4.0, rangeMax: 5.6, flag: "HIGH", critical: false },
        { name: "Total Cholesterol", value: 215, unit: "mg/dL", rangeMin: 125, rangeMax: 200, flag: "HIGH", critical: false },
        { name: "Triglycerides", value: 172, unit: "mg/dL", rangeMin: 50, rangeMax: 150, flag: "HIGH", critical: false },
        { name: "HDL Cholesterol (Good)", value: 48, unit: "mg/dL", rangeMin: 40, rangeMax: 80, flag: "NORMAL", critical: false },
        { name: "LDL Cholesterol (Calculated)", value: 132, unit: "mg/dL", rangeMin: 50, rangeMax: 100, flag: "HIGH", critical: false },
        { name: "Serum Creatinine", value: 0.92, unit: "mg/dL", rangeMin: 0.55, rangeMax: 1.02, flag: "NORMAL", critical: false },
        { name: "Estimated GFR (CKD-EPI)", value: 96, unit: "mL/min/1.73m²", rangeMin: 90, rangeMax: 130, flag: "NORMAL", critical: false }
      ]
    },
    {
      id: "lab-002",
      hospitalId: "hosp-mayo",
      hospitalName: "Mayo Clinic",
      hospitalMrn: "MC-892410",
      reportTitle: "Complete Blood Count (CBC) with Differential & Glycemic Check",
      department: "Mayo Medical Laboratories",
      pathologist: "Dr. Amanda Ross, MD, PhD",
      collectionDate: "2026-01-10",
      reportedDate: "2026-01-11",
      specimen: "EDTA Whole Blood & Plasma",
      status: "Final Validated",
      ocrScanned: true,
      scanConfidence: 99.0,
      sourceDocName: "Mayo_CBC_Metabolic_Jan2026.pdf",
      tests: [
        { name: "Fasting Blood Glucose", value: 124, unit: "mg/dL", rangeMin: 70, rangeMax: 99, flag: "HIGH", critical: false },
        { name: "Glycated Hemoglobin (HbA1c)", value: 6.4, unit: "%", rangeMin: 4.0, rangeMax: 5.6, flag: "HIGH", critical: false },
        { name: "Total Cholesterol", value: 198, unit: "mg/dL", rangeMin: 125, rangeMax: 200, flag: "NORMAL", critical: false },
        { name: "Hemoglobin", value: 13.9, unit: "g/dL", rangeMin: 12.0, rangeMax: 15.5, flag: "NORMAL", critical: false },
        { name: "White Blood Cells (WBC)", value: 6.8, unit: "x10^3/µL", rangeMin: 4.5, rangeMax: 11.0, flag: "NORMAL", critical: false },
        { name: "Platelet Count", value: 245, unit: "x10^3/µL", rangeMin: 150, rangeMax: 450, flag: "NORMAL", critical: false },
        { name: "Serum Potassium", value: 4.3, unit: "mmol/L", rangeMin: 3.5, rangeMax: 5.0, flag: "NORMAL", critical: false }
      ]
    },
    {
      id: "lab-003",
      hospitalId: "hosp-jhm",
      hospitalName: "Johns Hopkins Medicine",
      hospitalMrn: "JHM-771829",
      reportTitle: "Cardiometabolic & Renal Safety Screening",
      department: "Department of Pathology & Lab Medicine",
      pathologist: "Dr. Ethan Miller, MD",
      collectionDate: "2025-08-20",
      reportedDate: "2025-08-21",
      specimen: "Serum Separator Tube",
      status: "Final Validated",
      ocrScanned: true,
      scanConfidence: 97.4,
      sourceDocName: "JHM_CardioMetabolic_Aug2025.pdf",
      tests: [
        { name: "Fasting Blood Glucose", value: 112, unit: "mg/dL", rangeMin: 70, rangeMax: 99, flag: "HIGH", critical: false },
        { name: "Glycated Hemoglobin (HbA1c)", value: 6.1, unit: "%", rangeMin: 4.0, rangeMax: 5.6, flag: "HIGH", critical: false },
        { name: "Total Cholesterol", value: 185, unit: "mg/dL", rangeMin: 125, rangeMax: 200, flag: "NORMAL", critical: false },
        { name: "Triglycerides", value: 160, unit: "mg/dL", rangeMin: 50, rangeMax: 150, flag: "HIGH", critical: false },
        { name: "HDL Cholesterol (Good)", value: 50, unit: "mg/dL", rangeMin: 40, rangeMax: 80, flag: "NORMAL", critical: false },
        { name: "Serum Creatinine", value: 0.88, unit: "mg/dL", rangeMin: 0.55, rangeMax: 1.02, flag: "NORMAL", critical: false }
      ]
    },
    {
      id: "lab-004",
      hospitalId: "hosp-mountsinai",
      hospitalName: "Mount Sinai Health System",
      hospitalMrn: "MSH-310948",
      reportTitle: "Baseline Endocrine & Renal Evaluation",
      department: "Mount Sinai Clinical Laboratories",
      pathologist: "Dr. Kimberly Foster, MD",
      collectionDate: "2025-03-02",
      reportedDate: "2025-03-03",
      specimen: "Fluoride Plasma & Serum",
      status: "Final Validated",
      ocrScanned: true,
      scanConfidence: 95.9,
      sourceDocName: "MountSinai_Endo_Mar2025.pdf",
      tests: [
        { name: "Fasting Blood Glucose", value: 145, unit: "mg/dL", rangeMin: 70, rangeMax: 99, flag: "HIGH", critical: false },
        { name: "Glycated Hemoglobin (HbA1c)", value: 7.2, unit: "%", rangeMin: 4.0, rangeMax: 5.6, flag: "HIGH", critical: false },
        { name: "Total Cholesterol", value: 228, unit: "mg/dL", rangeMin: 125, rangeMax: 200, flag: "HIGH", critical: false },
        { name: "Serum Creatinine", value: 0.95, unit: "mg/dL", rangeMin: 0.55, rangeMax: 1.02, flag: "NORMAL", critical: false }
      ]
    }
  ],

  vaccinations: [
    {
      id: "vac-001",
      hospitalId: "hosp-jhm",
      hospitalName: "Johns Hopkins Medicine",
      hospitalMrn: "JHM-771829",
      vaccineName: "COVID-19 mRNA Bivalent (Omicron BA.4/BA.5)",
      brandName: "Spikevax Bivalent",
      manufacturer: "ModernaTX, Inc.",
      doseSequence: "Annual Booster (Dose 5)",
      dateAdministered: "2025-10-14",
      site: "Deltoid Muscle, Left Arm",
      lotNumber: "30184A-98",
      expirationDate: "2026-06-30",
      clinician: "Kelly Rogers, RN, MSN",
      nextDueDate: "2026-10-14",
      status: "Up to Date",
      verificationCode: "SHC:JHM-771829-COVID19-MODERNA-20251014",
      ocrScanned: true,
      scanConfidence: 99.2,
      sourceDocName: "CDC_Vaccine_Card_Hopkins_Oct2025.jpg"
    },
    {
      id: "vac-002",
      hospitalId: "hosp-mayo",
      hospitalName: "Mayo Clinic",
      hospitalMrn: "MC-892410",
      vaccineName: "Influenza Quadrivalent Inactivated (Seasonal 2025-2026)",
      brandName: "Fluzone High-Dose",
      manufacturer: "Sanofi Pasteur Inc.",
      doseSequence: "Annual Dose",
      dateAdministered: "2025-11-02",
      site: "Deltoid Muscle, Right Arm",
      lotNumber: "FLZ-88419-B",
      expirationDate: "2026-08-15",
      clinician: "Dr. Rachel Green, MD",
      nextDueDate: "2026-10-01",
      status: "Up to Date",
      verificationCode: "SHC:MAYO-892410-INFLUENZA-SANOFI-20251102",
      ocrScanned: true,
      scanConfidence: 98.7,
      sourceDocName: "Mayo_Clinic_Immunization_Flu2025.pdf"
    },
    {
      id: "vac-003",
      hospitalId: "hosp-apollo",
      hospitalName: "Apollo Hospitals",
      hospitalMrn: "APL-440912",
      vaccineName: "Tdap (Tetanus, Diphtheria, Acellular Pertussis)",
      brandName: "Boostrix",
      manufacturer: "GlaxoSmithKline Biologicals",
      doseSequence: "Decennial Booster",
      dateAdministered: "2024-03-12",
      site: "Deltoid Muscle, Left Arm",
      lotNumber: "TD-4402-CR9",
      expirationDate: "2027-02-28",
      clinician: "Dr. K. Srinivas, MBBS, DNB",
      nextDueDate: "2034-03-12",
      status: "Valid",
      verificationCode: "SHC:APL-440912-TDAP-BOOSTRIX-20240312",
      ocrScanned: true,
      scanConfidence: 96.5,
      sourceDocName: "Apollo_Vaccination_Tdap_2024.jpg"
    },
    {
      id: "vac-004",
      hospitalId: "hosp-mountsinai",
      hospitalName: "Mount Sinai Health System",
      hospitalMrn: "MSH-310948",
      vaccineName: "Hepatitis B Recombinant",
      brandName: "Recombivax HB",
      manufacturer: "Merck Sharp & Dohme LLC",
      doseSequence: "Dose 3 of 3 (Series Complete)",
      dateAdministered: "2023-09-18",
      site: "Deltoid Muscle, Right Arm",
      lotNumber: "MS-HB-99014",
      expirationDate: "2026-12-31",
      clinician: "Laura Bradley, RN",
      nextDueDate: "Lifelong Immunity",
      status: "Completed",
      verificationCode: "SHC:MSH-310948-HEPB-MERCK-20230918",
      ocrScanned: true,
      scanConfidence: 94.8,
      sourceDocName: "MountSinai_HepB_Card_2023.jpg"
    }
  ],

  // Known drug-drug interaction rules for automated patient safety checking
  drugInteractions: [
    {
      drugs: ["lisinopril", "potassium"],
      severity: "Moderate",
      title: "Hyperkalemia Risk",
      description: "Combining ACE inhibitors (Lisinopril) with potassium supplements or potassium-sparing diuretics can elevate serum potassium to hazardous levels."
    },
    {
      drugs: ["metformin", "contrast"],
      severity: "High",
      title: "Lactic Acidosis with Radiopaque Contrast",
      description: "Metformin should be temporarily suspended prior to or at the time of intravascular iodinated contrast radiological procedures."
    },
    {
      drugs: ["atorvastatin", "clarithromycin"],
      severity: "High",
      title: "CYP3A4 Inhibition / Rhabdomyolysis Risk",
      description: "Macrolide antibiotics significantly boost Atorvastatin serum concentrations, elevating the risk of myopathy or rhabdomyolysis."
    },
    {
      drugs: ["aspirin", "ibuprofen"],
      severity: "Moderate",
      title: "Platelet Inhibition & GI Bleed Risk",
      description: "Concurrent NSAID usage negates cardio-protective aspirin effect and significantly increases upper GI ulcer risk."
    }
  ],

  // Pre-configured authentic templates for testing OCR ingestion & side-by-side verification
  ocrDemoTemplates: {
    prescription: {
      id: "demo-rx-mayo",
      category: "prescription",
      hospital: "Mayo Clinic",
      title: "Prescription Pad - Mayo Clinic Cardiovascular Medicine",
      date: "2026-08-12",
      confidence: 98.6,
      rawText: `MAYO CLINIC
DEPARTMENT OF CARDIOVASCULAR MEDICINE
200 First St. SW, Rochester, MN 55905
Phone: (507) 284-2511 | DEA: AH9284102 | NPI: 1982740192

PATIENT: Eleanor Vance        DOB: 04/14/1988
MRN: MC-892410                DATE: 08/12/2026
ADDRESS: 742 Evergreen Terrace, Springfield, OR

Rx:
1. ATORVASTATIN CALCIUM (Lipitor) 20 MG ORAL TABLET
   SIG: Take 1 tablet by mouth daily at bedtime.
   DISP: #90 (Ninety) Tablets
   REFILLS: 3 (Three)
   INDICATION: Hypercholesterolemia

2. COQ10 (Ubiquinone) 100 MG CAPSULE
   SIG: Take 1 capsule once daily with morning meal.
   DISP: #90 Capsules
   REFILLS: 3 (Three)

PRESCRIBER: Dr. Gregory M. House, MD, FACC
SIGNATURE: [Digitally Signed: G. House, MD]
VERIFICATION HASH: 0x9f8b44c1a2`,
      extractedData: {
        category: "prescription",
        hospitalName: "Mayo Clinic",
        hospitalId: "hosp-mayo",
        doctorName: "Dr. Gregory M. House, MD",
        specialty: "Cardiovascular Medicine",
        prescribedDate: "2026-08-12",
        validUntil: "2027-02-12",
        refillsLeft: 3,
        medications: [
          {
            name: "Atorvastatin Calcium",
            brandName: "Lipitor",
            dosage: "20 mg",
            form: "Oral Tablet",
            frequency: "Once daily at bedtime",
            instructions: "Take 1 tablet by mouth daily at bedtime. Avoid grapefruit juice.",
            indication: "Hypercholesterolemia",
            rxNorm: "617314",
            daysSupply: 90
          },
          {
            name: "Coenzyme Q10 (Ubiquinone)",
            brandName: "CoQ10",
            dosage: "100 mg",
            form: "Capsule",
            frequency: "Once daily with morning meal",
            instructions: "Take 1 capsule once daily with breakfast.",
            indication: "Mitochondrial Support / Statin adjunct",
            rxNorm: "205934",
            daysSupply: 90
          }
        ]
      }
    },

    labReport: {
      id: "demo-lab-apollo",
      category: "lab",
      hospital: "Apollo Hospitals",
      title: "Apollo Diagnostics - Comprehensive Biochemical Pathology",
      date: "2026-08-05",
      confidence: 97.9,
      rawText: `APOLLO HOSPITALS INTERNATIONAL
DEPARTMENT OF BIOCHEMISTRY & MOLECULAR PATHOLOGY
154/11 Bannerghatta Road, Bangalore 560076, India
NABL Accredited & CAP Certified Lab #NABL-4401

PATIENT NAME: Mrs. Eleanor Vance    UHID / MRN: APL-440912
AGE/GENDER: 38 Y / Female           ORDER DATE: 05-AUG-2026
SAMPLE: Fluoride Blood & Serum      REPORT DATE: 06-AUG-2026
REF BY: Dr. Sunita K. Rao, MD

TEST NAME                    RESULT   UNIT       REFERENCE INTERVAL   FLAG
-------------------------------------------------------------------------
Fasting Blood Sugar (FBS)     134     mg/dL      70.0 - 99.0          HIGH
Glycated Hemoglobin (HbA1c)    6.7    %          4.0 - 5.6            HIGH
Estimated Avg Glucose (eAG)   146     mg/dL      80 - 115             HIGH
Total Cholesterol             210     mg/dL      125 - 200            HIGH
Serum Triglycerides           168     mg/dL      50 - 150             HIGH
HDL Cholesterol (Direct)       49     mg/dL      40 - 80              NORMAL
LDL Cholesterol (Calculated)  127     mg/dL      50 - 100             HIGH
Serum Creatinine              0.90    mg/dL      0.55 - 1.02          NORMAL
eGFR (CKD-EPI Formula)         98     mL/min     > 90                 NORMAL
Serum Potassium (K+)           4.4    mmol/L     3.5 - 5.1            NORMAL

CONSULTANT PATHOLOGIST: Dr. R. Venkataraman, MD (Path)
REMARKS: Fasting blood sugar and HbA1c indicative of sub-optimally controlled T2D. Repeat in 90 days.`,
      extractedData: {
        category: "lab",
        hospitalName: "Apollo Hospitals",
        hospitalId: "hosp-apollo",
        reportTitle: "Apollo Diagnostics - Fasting Glycemic & Lipid Evaluation",
        department: "Biochemistry & Molecular Pathology",
        pathologist: "Dr. R. Venkataraman, MD (Path)",
        collectionDate: "2026-08-05",
        reportedDate: "2026-08-06",
        specimen: "Fluoride Whole Blood & Serum",
        tests: [
          { name: "Fasting Blood Glucose", value: 134, unit: "mg/dL", rangeMin: 70, rangeMax: 99, flag: "HIGH" },
          { name: "Glycated Hemoglobin (HbA1c)", value: 6.7, unit: "%", rangeMin: 4.0, rangeMax: 5.6, flag: "HIGH" },
          { name: "Total Cholesterol", value: 210, unit: "mg/dL", rangeMin: 125, rangeMax: 200, flag: "HIGH" },
          { name: "Triglycerides", value: 168, unit: "mg/dL", rangeMin: 50, rangeMax: 150, flag: "HIGH" },
          { name: "HDL Cholesterol", value: 49, unit: "mg/dL", rangeMin: 40, rangeMax: 80, flag: "NORMAL" },
          { name: "LDL Cholesterol", value: 127, unit: "mg/dL", rangeMin: 50, rangeMax: 100, flag: "HIGH" },
          { name: "Serum Creatinine", value: 0.90, unit: "mg/dL", rangeMin: 0.55, rangeMax: 1.02, flag: "NORMAL" },
          { name: "eGFR", value: 98, unit: "mL/min", rangeMin: 90, rangeMax: 130, flag: "NORMAL" },
          { name: "Serum Potassium", value: 4.4, unit: "mmol/L", rangeMin: 3.5, rangeMax: 5.1, flag: "NORMAL" }
        ]
      }
    },

    vaccination: {
      id: "demo-vac-hopkins",
      category: "vaccine",
      hospital: "Johns Hopkins Medicine",
      title: "CDC / Johns Hopkins Official Immunization Record",
      date: "2026-04-18",
      confidence: 99.1,
      rawText: `CENTERS FOR DISEASE CONTROL AND PREVENTION (CDC)
COVID-19 & SEASONAL VACCINATION RECORD CARD
Administering Provider: Johns Hopkins Medicine - Community Clinic East
600 N. Wolfe St, Baltimore, MD 21287 | JHM-771829

NAME: Eleanor Vance                  DOB: 04/14/1988
MEDICAL RECORD NO: JHM-771829        GENDER: F

VACCINE PRODUCT: COVID-19 Updated Formula (2025-2026 KP.2)
BRAND: COMIRNATY
MANUFACTURER: Pfizer-BioNTech Inc.
DOSE: Annual Booster (0.3 mL)
DATE ADMINISTERED: 04/18/2026
ADMINISTRATION SITE: Right Deltoid IM
LOT NUMBER: PF-98214-X
EXPIRATION: 11/30/2026
CLINICIAN: Sarah Jenkins, BSN, RN (Lic #RN-894102)

STATUS: Verified in CRISP Maryland Health Exchange
DIGITAL SMART HEALTH CARD ISSUED: YES
VERIFICATION KEY: JHM-CRISP-771829-20260418`,
      extractedData: {
        category: "vaccine",
        hospitalName: "Johns Hopkins Medicine",
        hospitalId: "hosp-jhm",
        vaccineName: "COVID-19 Updated Formula (2025-2026 KP.2)",
        brandName: "Comirnaty",
        manufacturer: "Pfizer-BioNTech Inc.",
        doseSequence: "Annual Booster Dose",
        dateAdministered: "2026-04-18",
        site: "Right Deltoid IM",
        lotNumber: "PF-98214-X",
        expirationDate: "2026-11-30",
        clinician: "Sarah Jenkins, BSN, RN",
        nextDueDate: "2027-04-18",
        status: "Up to Date",
        verificationCode: "SHC:JHM-771829-COVID-PFIZER-20260418"
      }
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = OMNI_SAMPLE_DATA;
}
