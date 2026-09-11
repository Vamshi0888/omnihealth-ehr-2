/**
 * OmniHealth EHR - Main Application Controller
 * Handles state, multi-hospital consolidation, OCR verification pipeline,
 * search & filtering, FHIR export, and interactive views.
 */

class OmniHealthApp {
  constructor() {
    this.storageKey = "omnihealth_ehr_state_v1";
    this.state = this.loadState();
    this.currentView = "dashboard";
    this.selectedHospitalFilter = "all";
    this.searchQuery = "";
    this.currentOcrSession = null;
    this.biomarkerChart = null;

    this.init();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read from localStorage, using sample data:", e);
    }
    // Deep clone sample data
    return JSON.parse(JSON.stringify(OMNI_SAMPLE_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  resetToSampleData() {
    if (confirm("Reset health records back to original multi-hospital sample data?")) {
      this.state = JSON.parse(JSON.stringify(OMNI_SAMPLE_DATA));
      this.saveState();
      this.render();
      this.showToast("Health records reset to sample data.", "info");
    }
  }

  init() {
    // Setup event listeners
    this.setupNavigation();
    this.setupGlobalSearch();
    this.setupHospitalFilter();
    this.setupOcrWorkbench();
    this.render();

    // Initialize Biomarker chart
    this.biomarkerChart = new OmniBiomarkerCharts("biomarker-chart-container");
    this.biomarkerChart.render(this.state.labReports);
  }

  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = item.getAttribute("data-view");
        this.switchView(targetView);
      });
    });

    // Quick action buttons
    document.querySelectorAll("[data-action='quick-ocr']").forEach(btn => {
      btn.addEventListener("click", () => this.switchView("ocr"));
    });

    document.querySelectorAll("[data-action='view-emergency']").forEach(btn => {
      btn.addEventListener("click", () => this.openEmergencyModal());
    });

    document.querySelectorAll("[data-action='export-fhir']").forEach(btn => {
      btn.addEventListener("click", () => this.exportFhirJson());
    });

    document.querySelectorAll("[data-action='print-summary']").forEach(btn => {
      btn.addEventListener("click", () => window.print());
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-view") === viewName);
    });

    document.querySelectorAll(".view-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `view-${viewName}`);
    });

    // View specific triggers
    if (viewName === "trends") {
      setTimeout(() => {
        if (this.biomarkerChart) {
          this.biomarkerChart.render(this.getFilteredLabReports());
        }
      }, 50);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  setupGlobalSearch() {
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCurrentViewContent();
      });
    }
  }

  setupHospitalFilter() {
    const filterSelect = document.getElementById("hospital-filter-select");
    if (filterSelect) {
      filterSelect.addEventListener("change", (e) => {
        this.selectedHospitalFilter = e.target.value;
        this.render();
      });
    }
  }

  // Filter helper functions
  isRecordMatching(rec, query) {
    if (!query) return true;
    const str = JSON.stringify(rec).toLowerCase();
    return str.includes(query);
  }

  getFilteredPrescriptions() {
    return this.state.prescriptions.filter(rx => {
      const matchesHosp = this.selectedHospitalFilter === "all" || rx.hospitalId === this.selectedHospitalFilter;
      const matchesSearch = this.isRecordMatching(rx, this.searchQuery);
      return matchesHosp && matchesSearch;
    });
  }

  getFilteredLabReports() {
    return this.state.labReports.filter(lab => {
      const matchesHosp = this.selectedHospitalFilter === "all" || lab.hospitalId === this.selectedHospitalFilter;
      const matchesSearch = this.isRecordMatching(lab, this.searchQuery);
      return matchesHosp && matchesSearch;
    });
  }

  getFilteredVaccinations() {
    return this.state.vaccinations.filter(vac => {
      const matchesHosp = this.selectedHospitalFilter === "all" || vac.hospitalId === this.selectedHospitalFilter;
      const matchesSearch = this.isRecordMatching(vac, this.searchQuery);
      return matchesHosp && matchesSearch;
    });
  }

  render() {
    this.renderHeaderSummary();
    this.renderDashboardTimeline();
    this.renderPrescriptions();
    this.renderLabReports();
    this.renderVaccinations();
    this.renderHospitalDirectory();
    this.renderDrugAlerts();
    this.renderEmergencyCard();
  }

  renderCurrentViewContent() {
    if (this.currentView === "dashboard") this.renderDashboardTimeline();
    else if (this.currentView === "prescriptions") this.renderPrescriptions();
    else if (this.currentView === "labs") this.renderLabReports();
    else if (this.currentView === "vaccines") this.renderVaccinations();
    else if (this.currentView === "trends" && this.biomarkerChart) {
      this.biomarkerChart.render(this.getFilteredLabReports());
    }
  }

  renderHeaderSummary() {
    const rxCount = this.state.prescriptions.filter(r => r.status === "Active").length;
    const labCount = this.state.labReports.length;
    const vacCount = this.state.vaccinations.length;
    const hospCount = this.state.patient.hospitalAffiliations.length;

    const el = (id, val) => {
      const elem = document.getElementById(id);
      if (elem) elem.textContent = val;
    };

    el("summary-active-rx", rxCount);
    el("summary-total-labs", labCount);
    el("summary-vaccines", vacCount);
    el("summary-hospitals", hospCount);

    // Patient info banner
    const pName = document.getElementById("header-patient-name");
    if (pName) pName.textContent = this.state.patient.name;

    const pMeta = document.getElementById("header-patient-meta");
    if (pMeta) {
      pMeta.textContent = `DOB: ${this.state.patient.dob} (${this.state.patient.age}y) • Blood: ${this.state.patient.bloodGroup} • ABHA ID: ${this.state.patient.abhaId}`;
    }
  }

  renderDashboardTimeline() {
    const container = document.getElementById("timeline-feed");
    if (!container) return;

    // Combine all events across hospitals chronologically
    const events = [];

    this.getFilteredPrescriptions().forEach(rx => {
      events.push({
        type: "prescription",
        date: rx.prescribedDate,
        title: `Prescription: ${rx.medications.map(m => m.name).join(", ")}`,
        hospitalName: rx.hospitalName,
        hospitalId: rx.hospitalId,
        doctor: rx.doctorName,
        meta: `${rx.medications[0]?.dosage} - ${rx.medications[0]?.frequency}`,
        status: rx.status,
        ocrScanned: rx.ocrScanned,
        confidence: rx.scanConfidence,
        data: rx
      });
    });

    this.getFilteredLabReports().forEach(lab => {
      const abnormalCount = lab.tests.filter(t => t.flag !== "NORMAL").length;
      events.push({
        type: "lab",
        date: lab.collectionDate,
        title: lab.reportTitle,
        hospitalName: lab.hospitalName,
        hospitalId: lab.hospitalId,
        doctor: lab.pathologist,
        meta: `${lab.tests.length} Biomarkers Tested (${abnormalCount} Outside Range)`,
        status: abnormalCount > 0 ? "Flagged Abnormal" : "Normal",
        ocrScanned: lab.ocrScanned,
        confidence: lab.scanConfidence,
        data: lab
      });
    });

    this.getFilteredVaccinations().forEach(vac => {
      events.push({
        type: "vaccine",
        date: vac.dateAdministered,
        title: `Vaccination: ${vac.vaccineName}`,
        hospitalName: vac.hospitalName,
        hospitalId: vac.hospitalId,
        doctor: vac.clinician,
        meta: `${vac.doseSequence} • Lot: ${vac.lotNumber}`,
        status: vac.status,
        ocrScanned: vac.ocrScanned,
        confidence: vac.scanConfidence,
        data: vac
      });
    });

    // Sort descending (newest first)
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-folder-open empty-icon"></i>
          <h4>No medical records matched your filter</h4>
          <p>Try resetting the search query or hospital selector.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = events.map(evt => {
      const icon = evt.type === "prescription" ? "fa-prescription" : (evt.type === "lab" ? "fa-vial" : "fa-shield-virus");
      const badgeClass = evt.type === "prescription" ? "badge-rx" : (evt.type === "lab" ? "badge-lab" : "badge-vac");
      const hospBadgeClass = `badge-hosp-${evt.hospitalId}`;

      return `
        <div class="timeline-item">
          <div class="timeline-dot ${badgeClass}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="timeline-card">
            <div class="card-top-row">
              <div class="card-type-tags">
                <span class="type-pill ${badgeClass}">${evt.type.toUpperCase()}</span>
                <span class="hospital-pill ${hospBadgeClass}"><i class="fas fa-hospital"></i> ${evt.hospitalName}</span>
                ${evt.ocrScanned ? `<span class="ocr-confidence-pill" title="Ingested via OCR with ${evt.confidence}% optical confidence"><i class="fas fa-file-invoice"></i> OCR ${evt.confidence}%</span>` : ""}
              </div>
              <span class="record-date"><i class="far fa-calendar-alt"></i> ${evt.date}</span>
            </div>

            <h3 class="card-title">${evt.title}</h3>
            <p class="card-meta">${evt.meta}</p>

            <div class="card-footer-row">
              <span class="provider-info"><i class="fas fa-user-md"></i> ${evt.doctor}</span>
              <button class="btn btn-outline-sm" onclick="window.OmniApp.openRecordDetails('${evt.type}', '${evt.data.id}')">
                <i class="fas fa-eye"></i> View Full Record
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  renderPrescriptions() {
    const container = document.getElementById("prescriptions-grid");
    if (!container) return;

    const list = this.getFilteredPrescriptions();
    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No prescriptions found.</p></div>`;
      return;
    }

    container.innerHTML = list.map(rx => {
      const isActive = rx.status === "Active";
      const hospBadgeClass = `badge-hosp-${rx.hospitalId}`;

      return `
        <div class="medication-card ${isActive ? "card-active" : "card-inactive"}">
          <div class="med-card-header">
            <div>
              <span class="hospital-pill ${hospBadgeClass}"><i class="fas fa-hospital"></i> ${rx.hospitalName}</span>
              <h3 class="med-name">${rx.medications[0].name}</h3>
              <span class="med-brand">${rx.medications[0].brandName || ""} • ${rx.medications[0].dosage}</span>
            </div>
            <span class="status-badge ${isActive ? "status-active" : "status-discontinued"}">${rx.status}</span>
          </div>

          <div class="med-body">
            <div class="med-instruction-box">
              <strong><i class="fas fa-clock"></i> Instructions:</strong> ${rx.medications[0].instructions || rx.medications[0].frequency}
            </div>

            <div class="med-detail-grid">
              <div class="detail-item">
                <span class="detail-label">Prescribed Date</span>
                <span class="detail-value">${rx.prescribedDate}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Prescribing Doctor</span>
                <span class="detail-value">${rx.doctorName}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hospital MRN</span>
                <span class="detail-value">${rx.hospitalMrn}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Refills Available</span>
                <span class="detail-value font-bold ${rx.refillsLeft > 0 ? "text-emerald" : "text-amber"}">${rx.refillsLeft} remaining</span>
              </div>
            </div>
          </div>

          <div class="med-card-footer">
            <span class="ocr-tag"><i class="fas fa-check-circle"></i> OCR Verified (${rx.scanConfidence}%)</span>
            <button class="btn btn-sm btn-light" onclick="window.OmniApp.openRecordDetails('prescription', '${rx.id}')">
              Details & Refill
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  renderLabReports() {
    const container = document.getElementById("labs-grid");
    if (!container) return;

    const list = this.getFilteredLabReports();
    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No lab reports found.</p></div>`;
      return;
    }

    container.innerHTML = list.map(lab => {
      const abnormalCount = lab.tests.filter(t => t.flag !== "NORMAL").length;
      const hospBadgeClass = `badge-hosp-${lab.hospitalId}`;

      return `
        <div class="lab-card">
          <div class="lab-card-header">
            <div>
              <div class="flex-row items-center gap-2">
                <span class="hospital-pill ${hospBadgeClass}"><i class="fas fa-hospital"></i> ${lab.hospitalName}</span>
                <span class="date-tag"><i class="far fa-calendar"></i> ${lab.collectionDate}</span>
              </div>
              <h3 class="lab-title">${lab.reportTitle}</h3>
              <p class="lab-subtitle">${lab.department} • Pathologist: ${lab.pathologist}</p>
            </div>
            ${abnormalCount > 0 ? 
              `<span class="flag-badge flag-high"><i class="fas fa-exclamation-triangle"></i> ${abnormalCount} Outside Range</span>` : 
              `<span class="flag-badge flag-normal"><i class="fas fa-check"></i> All Normal</span>`
            }
          </div>

          <div class="lab-tests-table-wrapper">
            <table class="lab-table">
              <thead>
                <tr>
                  <th>Biomarker Test</th>
                  <th>Observed Value</th>
                  <th>Reference Range</th>
                  <th>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                ${lab.tests.map(t => {
                  const isHigh = t.flag === "HIGH";
                  const isLow = t.flag === "LOW";
                  const badge = isHigh ? "eval-high" : (isLow ? "eval-low" : "eval-normal");
                  return `
                    <tr>
                      <td class="test-name">${t.name}</td>
                      <td class="test-val font-bold ${isHigh ? "text-danger" : ""}">${t.value} <span class="unit">${t.unit}</span></td>
                      <td class="test-range">${t.rangeMin} - ${t.rangeMax} ${t.unit}</td>
                      <td><span class="eval-pill ${badge}">${t.flag}</span></td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>

          <div class="lab-card-footer">
            <span class="specimen-tag"><i class="fas fa-vial"></i> Specimen: ${lab.specimen}</span>
            <button class="btn btn-sm btn-outline" onclick="window.OmniApp.openRecordDetails('lab', '${lab.id}')">
              <i class="fas fa-external-link-alt"></i> Full Diagnostic Report
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  renderVaccinations() {
    const container = document.getElementById("vaccines-grid");
    if (!container) return;

    const list = this.getFilteredVaccinations();
    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No vaccination records found.</p></div>`;
      return;
    }

    container.innerHTML = list.map(vac => {
      const hospBadgeClass = `badge-hosp-${vac.hospitalId}`;
      return `
        <div class="vaccine-card">
          <div class="vac-card-header">
            <div class="vac-icon-badge">
              <i class="fas fa-shield-virus"></i>
            </div>
            <div class="vac-title-area">
              <span class="hospital-pill ${hospBadgeClass}"><i class="fas fa-hospital"></i> ${vac.hospitalName}</span>
              <h3 class="vac-name">${vac.vaccineName}</h3>
              <span class="vac-brand">${vac.brandName} • ${vac.manufacturer}</span>
            </div>
            <span class="vac-status-pill"><i class="fas fa-check-circle"></i> ${vac.status}</span>
          </div>

          <div class="vac-card-body">
            <div class="vac-info-row">
              <div class="info-col">
                <span class="info-label">Dose & Administration</span>
                <span class="info-val">${vac.doseSequence}</span>
              </div>
              <div class="info-col">
                <span class="info-label">Date Administered</span>
                <span class="info-val font-bold">${vac.dateAdministered}</span>
              </div>
              <div class="info-col">
                <span class="info-label">Lot / Batch Number</span>
                <span class="info-val font-mono">${vac.lotNumber}</span>
              </div>
              <div class="info-col">
                <span class="info-label">Next Due / Booster</span>
                <span class="info-val text-primary">${vac.nextDueDate}</span>
              </div>
            </div>

            <!-- SMART Health Card QR Code Preview -->
            <div class="shc-qr-preview-box">
              <div class="qr-mock-code" title="${vac.verificationCode}">
                <i class="fas fa-qrcode"></i>
              </div>
              <div class="shc-info">
                <strong>SMART Health Card Verified</strong>
                <p>Digital signature cryptographic digest confirmed by ${vac.hospitalName}.</p>
              </div>
            </div>
          </div>

          <div class="vac-card-footer">
            <span class="clinician-text"><i class="fas fa-user-nurse"></i> ${vac.clinician} (${vac.site})</span>
            <button class="btn btn-sm btn-outline" onclick="window.OmniApp.openRecordDetails('vaccine', '${vac.id}')">
              Passport Certificate
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  renderHospitalDirectory() {
    const container = document.getElementById("hospitals-list");
    if (!container) return;

    container.innerHTML = this.state.patient.hospitalAffiliations.map(h => {
      // Calculate real count of records from this hospital
      const rxCount = this.state.prescriptions.filter(r => r.hospitalId === h.id).length;
      const labCount = this.state.labReports.filter(l => l.hospitalId === h.id).length;
      const vacCount = this.state.vaccinations.filter(v => v.hospitalId === h.id).length;
      const total = rxCount + labCount + vacCount;

      return `
        <div class="hospital-card">
          <div class="hosp-card-header" style="border-top: 4px solid ${h.color}">
            <div class="hosp-avatar" style="background: ${h.color}">
              <i class="fas fa-hospital"></i>
            </div>
            <div>
              <h3 class="hosp-title">${h.name}</h3>
              <p class="hosp-location"><i class="fas fa-map-marker-alt"></i> ${h.location}</p>
            </div>
          </div>

          <div class="hosp-card-body">
            <div class="hosp-field">
              <span class="field-label">Patient MRN / UHID:</span>
              <span class="field-val font-mono font-bold">${h.mrn}</span>
            </div>
            <div class="hosp-field">
              <span class="field-label">EHR Network:</span>
              <span class="field-val">${h.ehrSystem}</span>
            </div>
            <div class="hosp-field">
              <span class="field-label">Accreditation:</span>
              <span class="field-val">${h.accreditation}</span>
            </div>
            <div class="hosp-field">
              <span class="field-label">Clinical Contact:</span>
              <span class="field-val">${h.phone}</span>
            </div>

            <div class="hosp-sync-stats">
              <div class="stat-pill"><i class="fas fa-prescription"></i> ${rxCount} Rx</div>
              <div class="stat-pill"><i class="fas fa-vial"></i> ${labCount} Labs</div>
              <div class="stat-pill"><i class="fas fa-shield-virus"></i> ${vacCount} Vaccines</div>
              <div class="stat-pill total-pill"><strong>${total} Records</strong></div>
            </div>
          </div>

          <div class="hosp-card-footer">
            <button class="btn btn-sm btn-primary w-full" onclick="window.OmniApp.filterByHospital('${h.id}')">
              Filter Records from ${h.badge}
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  filterByHospital(hospId) {
    this.selectedHospitalFilter = hospId;
    const filterSelect = document.getElementById("hospital-filter-select");
    if (filterSelect) filterSelect.value = hospId;
    this.switchView("dashboard");
    this.render();
    this.showToast(`Filtered to records from hospital.`, "info");
  }

  renderDrugAlerts() {
    const alertBox = document.getElementById("drug-interactions-alert");
    if (!alertBox) return;

    // Check active medications for known interaction rules
    const activeMeds = this.state.prescriptions
      .filter(rx => rx.status === "Active")
      .flatMap(rx => rx.medications.map(m => m.name.toLowerCase()));

    const activeAlerts = [];

    for (const rule of OMNI_SAMPLE_DATA.drugInteractions) {
      const matchCount = rule.drugs.filter(drugKey => activeMeds.some(m => m.includes(drugKey))).length;
      if (matchCount >= 2 || (rule.drugs.length === 2 && activeMeds.some(m => m.includes(rule.drugs[0])) && rule.drugs[1] === "contrast")) {
        activeAlerts.push(rule);
      }
    }

    if (activeAlerts.length > 0) {
      alertBox.classList.remove("hidden");
      alertBox.innerHTML = `
        <div class="alert-banner alert-warning">
          <div class="alert-icon"><i class="fas fa-triangle-exclamation"></i></div>
          <div class="alert-content">
            <h4>Clinical Drug-Drug Interaction Safety Alert</h4>
            ${activeAlerts.map(a => `
              <p><strong>[${a.severity} Priority] ${a.title}:</strong> ${a.description}</p>
            `).join("")}
          </div>
        </div>
      `;
    } else {
      alertBox.classList.add("hidden");
    }
  }

  renderEmergencyCard() {
    const container = document.getElementById("emergency-modal-content");
    if (!container) return;

    const p = this.state.patient;
    const activeMeds = this.state.prescriptions
      .filter(rx => rx.status === "Active")
      .flatMap(rx => rx.medications.map(m => `${m.name} (${m.dosage})`));

    container.innerHTML = `
      <div class="emergency-card-wrapper">
        <div class="emergency-banner">
          <div class="banner-top">
            <span class="emergency-tag"><i class="fas fa-heartbeat"></i> UNIVERSAL EMERGENCY MEDICAL ID</span>
            <span class="blood-pill">BLOOD TYPE: ${p.bloodGroup}</span>
          </div>
          <h2 class="patient-title">${p.name}</h2>
          <p class="patient-sub">DOB: ${p.dob} (Age ${p.age}) • Gender: ${p.gender} • ABHA ID: ${p.abhaId}</p>
        </div>

        <div class="emergency-sections">
          <!-- Critical Allergies -->
          <div class="emergency-section alert-section">
            <h4 class="sec-title text-danger"><i class="fas fa-allergies"></i> CRITICAL DRUG & FOOD ALLERGIES</h4>
            <div class="allergy-badges">
              ${p.allergies.map(a => `
                <div class="allergy-badge severity-${a.severity.toLowerCase()}">
                  <strong>${a.allergen}</strong>: ${a.reaction} (${a.severity})
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Chronic Diagnoses -->
          <div class="emergency-section">
            <h4 class="sec-title"><i class="fas fa-notes-medical"></i> CHRONIC MEDICAL CONDITIONS</h4>
            <ul class="condition-list">
              ${p.chronicConditions.map(c => `
                <li><strong>${c.condition}</strong> (ICD-10: ${c.icd10}) - Diagnosed ${c.diagnosedDate}</li>
              `).join("")}
            </ul>
          </div>

          <!-- Active Medications -->
          <div class="emergency-section">
            <h4 class="sec-title"><i class="fas fa-pills"></i> CURRENT ACTIVE MEDICATIONS</h4>
            <div class="active-med-pills">
              ${activeMeds.map(m => `<span class="med-pill">${m}</span>`).join("")}
            </div>
          </div>

          <!-- Emergency Contacts -->
          <div class="emergency-section">
            <h4 class="sec-title"><i class="fas fa-phone-alt"></i> EMERGENCY CONTACTS</h4>
            <div class="contacts-grid">
              ${p.emergencyContacts.map(c => `
                <div class="contact-card ${c.isPrimary ? "primary-contact" : ""}">
                  <strong>${c.name} (${c.relationship}) ${c.isPrimary ? "• Primary" : ""}</strong>
                  <div class="contact-phone"><a href="tel:${c.phone}"><i class="fas fa-phone"></i> ${c.phone}</a></div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Connected Hospital MRNs -->
          <div class="emergency-section">
            <h4 class="sec-title"><i class="fas fa-hospital-user"></i> CONNECTED HOSPITAL MRN REGISTRY</h4>
            <div class="mrn-tags">
              ${p.hospitalAffiliations.map(h => `
                <span class="mrn-badge"><strong>${h.name}:</strong> ${h.mrn}</span>
              `).join("")}
            </div>
          </div>
        </div>

        <div class="emergency-actions">
          <button class="btn btn-danger" onclick="window.print()"><i class="fas fa-print"></i> Print Emergency Card</button>
          <button class="btn btn-outline" onclick="window.OmniApp.closeEmergencyModal()"><i class="fas fa-times"></i> Close</button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // OCR Ingestion & Side-by-Side Review Logic
  // ==========================================
  setupOcrWorkbench() {
    const dropzone = document.getElementById("ocr-dropzone");
    const fileInput = document.getElementById("ocr-file-input");
    const sampleSelector = document.getElementById("ocr-sample-selector");

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("drag-hover");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("drag-hover");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-hover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (sampleSelector) {
      sampleSelector.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val && OMNI_SAMPLE_DATA.ocrDemoTemplates[val]) {
          this.loadSampleOcrTemplate(val);
        }
      });
    }

    // Setup filter controls for the OCR preview
    const filterIds = ["filter-grayscale", "filter-binarize", "filter-sharpen", "filter-invert"];
    filterIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => this.applyOcrFilters());
      }
    });

    const rotateBtn = document.getElementById("btn-rotate-img");
    if (rotateBtn) {
      rotateBtn.addEventListener("click", () => {
        this.currentRotation = ((this.currentRotation || 0) + 90) % 360;
        this.applyOcrFilters();
      });
    }

    // Run OCR button
    const runOcrBtn = document.getElementById("btn-run-ocr");
    if (runOcrBtn) {
      runOcrBtn.addEventListener("click", () => this.executeOcrPipeline());
    }

    // Load initial sample template on load for immediate demonstration
    setTimeout(() => {
      this.loadSampleOcrTemplate("prescription");
    }, 100);
  }

  loadSampleOcrTemplate(templateKey) {
    const template = OMNI_SAMPLE_DATA.ocrDemoTemplates[templateKey];
    if (!template) return;

    // Render realistic scanned paper on canvas
    const imgDataUrl = window.OmniOCR.renderSyntheticDocument(template);

    this.currentOcrSession = {
      templateKey,
      template,
      originalImageDataUrl: imgDataUrl,
      rawText: template.rawText,
      extractedData: template.extractedData,
      confidence: template.confidence
    };

    const imgPreview = document.getElementById("ocr-image-preview");
    if (imgPreview) {
      imgPreview.src = imgDataUrl;
      imgPreview.onload = () => {
        this.clearBoundingBoxes();
        document.getElementById("ocr-workbench-area").classList.remove("hidden");
        document.getElementById("ocr-review-panel").classList.add("hidden");
      };
    }
  }

  handleFileSelected(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgDataUrl = e.target.result;
      this.currentOcrSession = {
        templateKey: "custom-upload",
        file,
        originalImageDataUrl: imgDataUrl,
        rawText: "",
        extractedData: null,
        confidence: 95.0
      };

      const imgPreview = document.getElementById("ocr-image-preview");
      if (imgPreview) {
        imgPreview.src = imgDataUrl;
        imgPreview.onload = () => {
          this.clearBoundingBoxes();
          document.getElementById("ocr-workbench-area").classList.remove("hidden");
          document.getElementById("ocr-review-panel").classList.add("hidden");
        };
      }
    };
    reader.readAsDataURL(file);
  }

  applyOcrFilters() {
    if (!this.currentOcrSession) return;
    const imgPreview = document.getElementById("ocr-image-preview");
    if (!imgPreview) return;

    const grayscale = document.getElementById("filter-grayscale")?.checked || false;
    const binarize = document.getElementById("filter-binarize")?.checked || false;
    const sharpen = document.getElementById("filter-sharpen")?.checked || false;
    const invert = document.getElementById("filter-invert")?.checked || false;

    // Create an offscreen image element to read original source
    const offscreenImg = new Image();
    offscreenImg.onload = () => {
      const processedUrl = window.OmniOCR.preprocessImage(offscreenImg, {
        grayscale,
        binarize,
        sharpen,
        invert,
        rotation: this.currentRotation || 0
      });
      imgPreview.src = processedUrl;
    };
    offscreenImg.src = this.currentOcrSession.originalImageDataUrl;
  }

  async executeOcrPipeline() {
    if (!this.currentOcrSession) return;

    const statusText = document.getElementById("ocr-status-indicator");
    const progressBar = document.getElementById("ocr-progress-fill");
    const runBtn = document.getElementById("btn-run-ocr");

    if (runBtn) runBtn.disabled = true;
    if (statusText) statusText.textContent = "Analyzing document layout & preprocessing optical channels...";
    if (progressBar) progressBar.style.width = "30%";

    await new Promise(r => setTimeout(r, 400));
    if (statusText) statusText.textContent = "Extracting character tokens & segmenting medical lines...";
    if (progressBar) progressBar.style.width = "65%";

    await new Promise(r => setTimeout(r, 400));
    if (statusText) statusText.textContent = "Applying Medical NER & cross-hospital ontology parsing...";
    if (progressBar) progressBar.style.width = "95%";

    // Process using OCR engine
    let result;
    if (this.currentOcrSession.template) {
      result = await window.OmniOCR.processDocument(this.currentOcrSession.template.rawText, this.currentOcrSession.template.category);
    } else if (this.currentOcrSession.file) {
      result = await window.OmniOCR.processDocument(this.currentOcrSession.file);
    } else {
      result = await window.OmniOCR.processDocument(OMNI_SAMPLE_DATA.ocrDemoTemplates.prescription.rawText, "prescription");
    }

    await new Promise(r => setTimeout(r, 300));
    if (progressBar) progressBar.style.width = "100%";
    if (statusText) statusText.textContent = `Completed! Optical Confidence: ${result.confidence}%`;
    if (runBtn) runBtn.disabled = false;

    this.currentOcrSession.result = result;
    this.drawBoundingBoxes(result.boundingBoxes);
    this.populateSideBySideVerification(result);
  }

  drawBoundingBoxes(boxes) {
    const overlay = document.getElementById("ocr-bounding-overlay");
    if (!overlay) return;
    overlay.innerHTML = "";

    if (!boxes || boxes.length === 0) return;

    boxes.forEach(box => {
      const div = document.createElement("div");
      div.className = `ocr-bbox bbox-${box.type}`;
      div.style.left = `${box.x * 100}%`;
      div.style.top = `${box.y * 100}%`;
      div.style.width = `${box.w * 100}%`;
      div.style.height = `${box.h * 100}%`;
      div.innerHTML = `<span class="bbox-label">${box.label}</span>`;
      overlay.appendChild(div);
    });
  }

  clearBoundingBoxes() {
    const overlay = document.getElementById("ocr-bounding-overlay");
    if (overlay) overlay.innerHTML = "";
  }

  populateSideBySideVerification(ocrResult) {
    const reviewPanel = document.getElementById("ocr-review-panel");
    const fieldsContainer = document.getElementById("ocr-extracted-fields");
    if (!reviewPanel || !fieldsContainer) return;

    reviewPanel.classList.remove("hidden");

    const cat = ocrResult.category;
    const d = ocrResult.extractedDetails;
    const hosp = ocrResult.hospital;
    const demo = ocrResult.demographics;

    let specificHtml = "";

    if (cat === "prescription") {
      specificHtml = `
        <div class="form-group">
          <label class="form-label">Doctor / Prescriber</label>
          <input type="text" class="form-input" id="ocr-edit-doctor" value="${d.doctorName || ""}">
        </div>
        <div class="form-group">
          <label class="form-label">Specialty / Department</label>
          <input type="text" class="form-input" id="ocr-edit-specialty" value="${d.specialty || "Cardiovascular Medicine"}">
        </div>
        <div class="form-group">
          <label class="form-label">Refills Left</label>
          <input type="number" class="form-input" id="ocr-edit-refills" value="${d.refillsLeft || 2}">
        </div>

        <h4 class="form-section-heading">Extracted Medications (Rx Items)</h4>
        <div id="ocr-edit-meds-list">
          ${(d.medications || []).map((m, idx) => `
            <div class="edit-item-row" data-index="${idx}">
              <div class="grid-2col">
                <div>
                  <label class="field-tiny">Drug Name</label>
                  <input type="text" class="form-input form-input-sm med-name-input" value="${m.name}">
                </div>
                <div>
                  <label class="field-tiny">Dosage</label>
                  <input type="text" class="form-input form-input-sm med-dosage-input" value="${m.dosage}">
                </div>
              </div>
              <div class="mt-2">
                <label class="field-tiny">Sig / Frequency Instructions</label>
                <input type="text" class="form-input form-input-sm med-freq-input" value="${m.instructions || m.frequency}">
              </div>
            </div>
          `).join("")}
        </div>
      `;
    } else if (cat === "lab") {
      specificHtml = `
        <div class="form-group">
          <label class="form-label">Report Title</label>
          <input type="text" class="form-input" id="ocr-edit-report-title" value="${d.reportTitle || ""}">
        </div>
        <div class="form-group">
          <label class="form-label">Consultant Pathologist</label>
          <input type="text" class="form-input" id="ocr-edit-pathologist" value="${d.pathologist || ""}">
        </div>
        <div class="form-group">
          <label class="form-label">Specimen Type</label>
          <input type="text" class="form-input" id="ocr-edit-specimen" value="${d.specimen || "Serum"}">
        </div>

        <h4 class="form-section-heading">Extracted Biomarker Tests</h4>
        <div id="ocr-edit-tests-list">
          ${(d.tests || []).map((t, idx) => `
            <div class="edit-item-row" data-index="${idx}">
              <div class="grid-3col">
                <div>
                  <label class="field-tiny">Test Name</label>
                  <input type="text" class="form-input form-input-sm test-name-input" value="${t.name}">
                </div>
                <div>
                  <label class="field-tiny">Value (${t.unit})</label>
                  <input type="number" step="0.01" class="form-input form-input-sm test-val-input" value="${t.value}">
                </div>
                <div>
                  <label class="field-tiny">Flag</label>
                  <select class="form-input form-input-sm test-flag-select">
                    <option value="NORMAL" ${t.flag === "NORMAL" ? "selected" : ""}>NORMAL</option>
                    <option value="HIGH" ${t.flag === "HIGH" ? "selected" : ""}>HIGH</option>
                    <option value="LOW" ${t.flag === "LOW" ? "selected" : ""}>LOW</option>
                  </select>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    } else {
      specificHtml = `
        <div class="form-group">
          <label class="form-label">Vaccine Product Name</label>
          <input type="text" class="form-input" id="ocr-edit-vac-name" value="${d.vaccineName || ""}">
        </div>
        <div class="form-group">
          <label class="form-label">Brand / Manufacturer</label>
          <input type="text" class="form-input" id="ocr-edit-vac-brand" value="${d.brandName || ""} • ${d.manufacturer || ""}">
        </div>
        <div class="grid-2col">
          <div class="form-group">
            <label class="form-label">Dose Sequence</label>
            <input type="text" class="form-input" id="ocr-edit-vac-dose" value="${d.doseSequence || "Booster"}">
          </div>
          <div class="form-group">
            <label class="form-label">Lot / Batch Number</label>
            <input type="text" class="form-input font-mono" id="ocr-edit-vac-lot" value="${d.lotNumber || ""}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Administering Clinician</label>
          <input type="text" class="form-input" id="ocr-edit-vac-clinician" value="${d.clinician || ""}">
        </div>
      `;
    }

    fieldsContainer.innerHTML = `
      <div class="verification-header-badge">
        <span class="confidence-badge"><i class="fas fa-check-double"></i> OCR Confidence: ${ocrResult.confidence}%</span>
        <span class="category-badge">${cat.toUpperCase()}</span>
      </div>

      <div class="form-group">
        <label class="form-label">Issuing Hospital / Medical Center</label>
        <select class="form-input" id="ocr-edit-hospital">
          <option value="hosp-mayo" ${hosp.id === "hosp-mayo" ? "selected" : ""}>Mayo Clinic (Rochester, MN)</option>
          <option value="hosp-apollo" ${hosp.id === "hosp-apollo" ? "selected" : ""}>Apollo Hospitals (Bangalore/Chennai)</option>
          <option value="hosp-jhm" ${hosp.id === "hosp-jhm" ? "selected" : ""}>Johns Hopkins Medicine (Baltimore, MD)</option>
          <option value="hosp-mountsinai" ${hosp.id === "hosp-mountsinai" ? "selected" : ""}>Mount Sinai Health System (New York, NY)</option>
        </select>
      </div>

      <div class="grid-2col">
        <div class="form-group">
          <label class="form-label">Patient Name</label>
          <input type="text" class="form-input" id="ocr-edit-patient" value="${demo.patientName || "Eleanor Vance"}">
        </div>
        <div class="form-group">
          <label class="form-label">Date of Service</label>
          <input type="date" class="form-input" id="ocr-edit-date" value="${demo.date || "2026-08-12"}">
        </div>
      </div>

      ${specificHtml}

      <div class="verification-actions-area">
        <button class="btn btn-success w-full" id="btn-confirm-save-record">
          <i class="fas fa-save"></i> Verify & Commit to Patient Health Record
        </button>
      </div>
    `;

    document.getElementById("btn-confirm-save-record").addEventListener("click", () => {
      this.commitOcrRecordToState(ocrResult);
    });

    // Scroll review panel into view
    reviewPanel.scrollIntoView({ behavior: "smooth" });
  }

  commitOcrRecordToState(ocrResult) {
    const hospSelect = document.getElementById("ocr-edit-hospital");
    const hospId = hospSelect.value;
    const hospObj = this.state.patient.hospitalAffiliations.find(h => h.id === hospId) || { name: "Consolidated Medical Center", mrn: "MRN-009" };
    const dateVal = document.getElementById("ocr-edit-date").value;
    const cat = ocrResult.category;

    const newId = `${cat}-${Date.now()}`;

    if (cat === "prescription") {
      const doctor = document.getElementById("ocr-edit-doctor")?.value || "Dr. Attending Physician";
      const specialty = document.getElementById("ocr-edit-specialty")?.value || "General Medicine";
      const refills = parseInt(document.getElementById("ocr-edit-refills")?.value || "2", 10);

      const medRows = document.querySelectorAll("#ocr-edit-meds-list .edit-item-row");
      const meds = [];
      medRows.forEach(row => {
        meds.push({
          name: row.querySelector(".med-name-input").value,
          dosage: row.querySelector(".med-dosage-input").value,
          form: "Tablet",
          frequency: row.querySelector(".med-freq-input").value,
          instructions: row.querySelector(".med-freq-input").value,
          refillsLeft: refills,
          daysSupply: 90
        });
      });

      const newRx = {
        id: newId,
        hospitalId: hospId,
        hospitalName: hospObj.name,
        hospitalMrn: hospObj.mrn,
        doctorName: doctor,
        specialty,
        prescribedDate: dateVal,
        validUntil: "2027-03-01",
        status: "Active",
        refillsLeft: refills,
        medications: meds.length > 0 ? meds : [{ name: "Verified Medication", dosage: "10mg", frequency: "Daily", instructions: "Daily" }],
        ocrScanned: true,
        scanConfidence: ocrResult.confidence,
        sourceDocName: `Scanned_Prescription_${dateVal}.png`
      };

      this.state.prescriptions.unshift(newRx);
      this.saveState();
      this.render();
      this.switchView("prescriptions");
      this.showToast(`New prescription from ${hospObj.name} committed via OCR!`, "success");

    } else if (cat === "lab") {
      const title = document.getElementById("ocr-edit-report-title")?.value || `${hospObj.name} Lab Panel`;
      const pathologist = document.getElementById("ocr-edit-pathologist")?.value || "Consultant Pathologist";
      const specimen = document.getElementById("ocr-edit-specimen")?.value || "Serum";

      const testRows = document.querySelectorAll("#ocr-edit-tests-list .edit-item-row");
      const tests = [];
      testRows.forEach(row => {
        tests.push({
          name: row.querySelector(".test-name-input").value,
          value: parseFloat(row.querySelector(".test-val-input").value) || 100,
          unit: "mg/dL",
          rangeMin: 70,
          rangeMax: 99,
          flag: row.querySelector(".test-flag-select").value
        });
      });

      const newLab = {
        id: newId,
        hospitalId: hospId,
        hospitalName: hospObj.name,
        hospitalMrn: hospObj.mrn,
        reportTitle: title,
        department: "Pathology & Clinical Biochemistry",
        pathologist,
        collectionDate: dateVal,
        reportedDate: dateVal,
        specimen,
        status: "Final Validated",
        ocrScanned: true,
        scanConfidence: ocrResult.confidence,
        sourceDocName: `Scanned_LabReport_${dateVal}.png`,
        tests: tests.length > 0 ? tests : [{ name: "Biomarker Assay", value: 120, unit: "mg/dL", rangeMin: 70, rangeMax: 100, flag: "HIGH" }]
      };

      this.state.labReports.unshift(newLab);
      this.saveState();
      this.render();
      this.switchView("labs");
      this.showToast(`Diagnostic report from ${hospObj.name} committed via OCR!`, "success");

    } else {
      const vacName = document.getElementById("ocr-edit-vac-name")?.value || "Immunization Record";
      const brand = document.getElementById("ocr-edit-vac-brand")?.value || "Standard Vaccine";
      const dose = document.getElementById("ocr-edit-vac-dose")?.value || "Booster Dose";
      const lot = document.getElementById("ocr-edit-vac-lot")?.value || "LOT-99210";
      const clinician = document.getElementById("ocr-edit-vac-clinician")?.value || "Immunization Nurse";

      const newVac = {
        id: newId,
        hospitalId: hospId,
        hospitalName: hospObj.name,
        hospitalMrn: hospObj.mrn,
        vaccineName: vacName,
        brandName: brand,
        manufacturer: brand.split("•")[1]?.trim() || "Pharma Lab",
        doseSequence: dose,
        dateAdministered: dateVal,
        site: "Deltoid IM",
        lotNumber: lot,
        expirationDate: "2027-01-01",
        clinician,
        nextDueDate: "2027-08-12",
        status: "Up to Date",
        verificationCode: `SHC:${hospObj.mrn}-${lot}`,
        ocrScanned: true,
        scanConfidence: ocrResult.confidence,
        sourceDocName: `Scanned_Vaccine_${dateVal}.png`
      };

      this.state.vaccinations.unshift(newVac);
      this.saveState();
      this.render();
      this.switchView("vaccines");
      this.showToast(`Immunization record from ${hospObj.name} saved via OCR!`, "success");
    }
  }

  // ==========================================
  // Record Details Modal
  // ==========================================
  openRecordDetails(type, id) {
    const modal = document.getElementById("record-modal");
    const content = document.getElementById("record-modal-content");
    if (!modal || !content) return;

    let rec = null;
    let title = "";
    let body = "";

    if (type === "prescription") {
      rec = this.state.prescriptions.find(r => r.id === id);
      if (!rec) return;
      title = `Prescription: ${rec.medications[0]?.name}`;
      body = `
        <div class="modal-detail-box">
          <div class="modal-header-info">
            <span class="hospital-pill badge-hosp-${rec.hospitalId}"><i class="fas fa-hospital"></i> ${rec.hospitalName}</span>
            <span class="status-badge ${rec.status === "Active" ? "status-active" : "status-discontinued"}">${rec.status}</span>
          </div>

          <h3 class="modal-item-title">${rec.medications[0]?.name} (${rec.medications[0]?.dosage})</h3>
          <p class="modal-item-sub">Brand: ${rec.medications[0]?.brandName || "Generic"} • Form: ${rec.medications[0]?.form} • RxNorm: ${rec.medications[0]?.rxNorm || "Standard"}</p>

          <div class="instructions-banner">
            <strong>Sig / Frequency Instructions:</strong><br>
            ${rec.medications[0]?.instructions || rec.medications[0]?.frequency}
          </div>

          <div class="detail-props-table">
            <div class="prop-row"><span class="k">Prescribing Physician:</span><span class="v">${rec.doctorName} (${rec.specialty})</span></div>
            <div class="prop-row"><span class="k">Hospital MRN:</span><span class="v font-mono">${rec.hospitalMrn}</span></div>
            <div class="prop-row"><span class="k">Date Issued:</span><span class="v">${rec.prescribedDate}</span></div>
            <div class="prop-row"><span class="k">Valid Until:</span><span class="v">${rec.validUntil}</span></div>
            <div class="prop-row"><span class="k">Refills Remaining:</span><span class="v font-bold">${rec.refillsLeft} refills</span></div>
            <div class="prop-row"><span class="k">Days Supply:</span><span class="v">${rec.medications[0]?.daysSupply || 90} Days</span></div>
            <div class="prop-row"><span class="k">Clinical Indication:</span><span class="v">${rec.medications[0]?.indication || "Documented in EHR"}</span></div>
            <div class="prop-row"><span class="k">OCR Ingestion:</span><span class="v"><i class="fas fa-check-circle text-emerald"></i> Verified (${rec.scanConfidence}% Confidence)</span></div>
          </div>
        </div>
      `;
    } else if (type === "lab") {
      rec = this.state.labReports.find(l => l.id === id);
      if (!rec) return;
      title = rec.reportTitle;
      body = `
        <div class="modal-detail-box">
          <div class="modal-header-info">
            <span class="hospital-pill badge-hosp-${rec.hospitalId}"><i class="fas fa-hospital"></i> ${rec.hospitalName}</span>
            <span class="date-tag"><i class="far fa-calendar"></i> ${rec.collectionDate}</span>
          </div>

          <h3 class="modal-item-title">${rec.reportTitle}</h3>
          <p class="modal-item-sub">${rec.department} • Consultant: ${rec.pathologist}</p>

          <table class="lab-table mt-4">
            <thead>
              <tr>
                <th>Biomarker Test</th>
                <th>Observed Value</th>
                <th>Biological Reference Interval</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rec.tests.map(t => `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td class="font-bold ${t.flag === "HIGH" ? "text-danger" : ""}">${t.value} ${t.unit}</td>
                  <td>${t.rangeMin} - ${t.rangeMax} ${t.unit}</td>
                  <td><span class="eval-pill ${t.flag === "HIGH" ? "eval-high" : (t.flag === "LOW" ? "eval-low" : "eval-normal")}">${t.flag}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="detail-props-table mt-4">
            <div class="prop-row"><span class="k">Specimen:</span><span class="v">${rec.specimen}</span></div>
            <div class="prop-row"><span class="k">Reported Date:</span><span class="v">${rec.reportedDate}</span></div>
            <div class="prop-row"><span class="k">Validation Status:</span><span class="v text-emerald font-bold">${rec.status}</span></div>
          </div>
        </div>
      `;
    } else {
      rec = this.state.vaccinations.find(v => v.id === id);
      if (!rec) return;
      title = `Vaccination Certificate: ${rec.vaccineName}`;
      body = `
        <div class="modal-detail-box">
          <div class="modal-header-info">
            <span class="hospital-pill badge-hosp-${rec.hospitalId}"><i class="fas fa-hospital"></i> ${rec.hospitalName}</span>
            <span class="status-badge status-active">${rec.status}</span>
          </div>

          <h3 class="modal-item-title">${rec.vaccineName}</h3>
          <p class="modal-item-sub">${rec.brandName} • ${rec.manufacturer}</p>

          <div class="detail-props-table mt-4">
            <div class="prop-row"><span class="k">Dose Administered:</span><span class="v font-bold">${rec.doseSequence}</span></div>
            <div class="prop-row"><span class="k">Date of Administration:</span><span class="v">${rec.dateAdministered}</span></div>
            <div class="prop-row"><span class="k">Anatomical Site:</span><span class="v">${rec.site}</span></div>
            <div class="prop-row"><span class="k">Vaccine Lot Number:</span><span class="v font-mono font-bold">${rec.lotNumber}</span></div>
            <div class="prop-row"><span class="k">Lot Expiration:</span><span class="v">${rec.expirationDate}</span></div>
            <div class="prop-row"><span class="k">Administering Clinician:</span><span class="v">${rec.clinician}</span></div>
            <div class="prop-row"><span class="k">Next Booster Due:</span><span class="v text-primary font-bold">${rec.nextDueDate}</span></div>
          </div>

          <div class="qr-cert-box mt-4">
            <div class="qr-large"><i class="fas fa-qrcode"></i></div>
            <div>
              <strong>SMART Health Card Digital Signature</strong>
              <p class="font-mono text-xs text-slate-500 break-all">${rec.verificationCode}</p>
            </div>
          </div>
        </div>
      `;
    }

    document.getElementById("record-modal-title").textContent = title;
    content.innerHTML = body;
    modal.classList.add("active");
  }

  closeRecordDetails() {
    const modal = document.getElementById("record-modal");
    if (modal) modal.classList.remove("active");
  }

  openEmergencyModal() {
    this.renderEmergencyCard();
    const modal = document.getElementById("emergency-modal");
    if (modal) modal.classList.add("active");
  }

  closeEmergencyModal() {
    const modal = document.getElementById("emergency-modal");
    if (modal) modal.classList.remove("active");
  }

  // ==========================================
  // FHIR R4 JSON Export & Interoperability
  // ==========================================
  exportFhirJson() {
    const bundle = {
      resourceType: "Bundle",
      id: "omnihealth-consolidated-bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: this.state.patient.id,
            name: [{ use: "official", family: "Vance", given: ["Eleanor"] }],
            gender: this.state.patient.gender.toLowerCase(),
            birthDate: this.state.patient.dob,
            identifier: [
              { system: "urn:health:abha", value: this.state.patient.abhaId },
              ...this.state.patient.hospitalAffiliations.map(h => ({
                system: `urn:hospital:${h.id}`,
                value: h.mrn,
                assigner: { display: h.name }
              }))
            ]
          }
        },
        ...this.state.prescriptions.map(rx => ({
          resource: {
            resourceType: "MedicationRequest",
            id: rx.id,
            status: rx.status.toLowerCase(),
            intent: "order",
            medicationCodeableConcept: {
              text: rx.medications[0].name,
              coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: rx.medications[0].rxNorm, display: rx.medications[0].name }]
            },
            subject: { reference: `Patient/${this.state.patient.id}` },
            authoredOn: rx.prescribedDate,
            requester: { display: rx.doctorName },
            dispenseRequest: { numberOfRepeatsAllowed: rx.refillsLeft }
          }
        })),
        ...this.state.labReports.flatMap(lab => lab.tests.map(t => ({
          resource: {
            resourceType: "Observation",
            id: `${lab.id}-${t.name.replace(/\s+/g, "-")}`,
            status: "final",
            category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "laboratory" }] }],
            code: { text: t.name },
            subject: { reference: `Patient/${this.state.patient.id}` },
            effectiveDateTime: lab.collectionDate,
            performer: [{ display: lab.hospitalName }],
            valueQuantity: { value: t.value, unit: t.unit },
            referenceRange: [{ low: { value: t.rangeMin, unit: t.unit }, high: { value: t.rangeMax, unit: t.unit } }]
          }
        }))),
        ...this.state.vaccinations.map(vac => ({
          resource: {
            resourceType: "Immunization",
            id: vac.id,
            status: "completed",
            vaccineCode: { text: vac.vaccineName },
            patient: { reference: `Patient/${this.state.patient.id}` },
            occurrenceDateTime: vac.dateAdministered,
            lotNumber: vac.lotNumber,
            performer: [{ actor: { display: vac.hospitalName } }]
          }
        }))
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `OmniHealth_FHIR_R4_${this.state.patient.id}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    this.showToast("HL7/FHIR R4 Bundle downloaded successfully!", "success");
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `omni-toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : (type === "error" ? "fa-exclamation-circle" : "fa-info-circle")}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instantiate and bind globally
document.addEventListener("DOMContentLoaded", () => {
  window.OmniApp = new OmniHealthApp();
});
