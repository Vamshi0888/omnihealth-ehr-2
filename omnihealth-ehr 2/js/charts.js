/**
 * OmniHealth EHR - Longitudinal Cross-Hospital Biomarker Charts
 * Renders interactive SVG trends with normal/high reference bands and hospital source markers
 */

class OmniBiomarkerCharts {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentMetric = "glucose"; // 'glucose' | 'hba1c' | 'cholesterol' | 'creatinine'
  }

  setMetric(metricKey) {
    this.currentMetric = metricKey;
    this.render();
  }

  extractData(labReports) {
    // Sort lab reports chronologically (oldest to newest)
    const sorted = [...labReports].sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate));

    const metricsConfig = {
      glucose: {
        title: "Fasting Blood Glucose",
        unit: "mg/dL",
        refMin: 70,
        refMax: 99,
        targetDesc: "Target Normal: 70 - 99 mg/dL | Pre-diabetes: 100 - 125 | Diabetes: ≥ 126",
        searchTerms: ["fasting blood glucose", "fbs", "glucose"]
      },
      hba1c: {
        title: "Glycated Hemoglobin (HbA1c)",
        unit: "%",
        refMin: 4.0,
        refMax: 5.6,
        targetDesc: "Normal: < 5.7% | Pre-diabetes: 5.7 - 6.4% | Diabetes Target: < 7.0%",
        searchTerms: ["glycated hemoglobin", "hba1c"]
      },
      cholesterol: {
        title: "Total Cholesterol",
        unit: "mg/dL",
        refMin: 125,
        refMax: 200,
        targetDesc: "Desirable: < 200 mg/dL | Borderline: 200 - 239 | High: ≥ 240",
        searchTerms: ["total cholesterol", "cholesterol"]
      },
      creatinine: {
        title: "Serum Creatinine (Renal Function)",
        unit: "mg/dL",
        refMin: 0.55,
        refMax: 1.02,
        targetDesc: "Normal Adult Female: 0.55 - 1.02 mg/dL | Elevated indicates reduced renal clearance",
        searchTerms: ["serum creatinine", "creatinine"]
      }
    };

    const config = metricsConfig[this.currentMetric] || metricsConfig.glucose;
    const points = [];

    for (const report of sorted) {
      for (const test of report.tests) {
        const testNameLower = test.name.toLowerCase();
        const matches = config.searchTerms.some(term => testNameLower.includes(term));
        if (matches) {
          points.push({
            date: report.collectionDate,
            value: test.value,
            unit: test.unit || config.unit,
            flag: test.flag,
            hospitalId: report.hospitalId,
            hospitalName: report.hospitalName,
            reportId: report.id
          });
          break;
        }
      }
    }

    return { config, points };
  }

  render(labReports = null) {
    if (!this.container) return;
    if (!labReports) {
      labReports = window.OmniApp?.records?.labReports || OMNI_SAMPLE_DATA.labReports;
    }

    const { config, points } = this.extractData(labReports);

    if (points.length === 0) {
      this.container.innerHTML = `
        <div class="empty-chart-state">
          <p>No historical lab test data points available for ${config.title}.</p>
        </div>
      `;
      return;
    }

    // Determine scale bounds
    const values = points.map(p => p.value);
    const minVal = Math.min(...values, config.refMin * 0.85);
    const maxVal = Math.max(...values, config.refMax * 1.25);
    const range = maxVal - minVal;

    const width = 850;
    const height = 320;
    const padLeft = 65;
    const padRight = 35;
    const padTop = 30;
    const padBottom = 50;

    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;

    const getY = (val) => {
      const norm = (val - minVal) / (range || 1);
      return padTop + chartHeight - norm * chartHeight;
    };

    const getX = (idx) => {
      if (points.length === 1) return padLeft + chartWidth / 2;
      return padLeft + (idx / (points.length - 1)) * chartWidth;
    };

    // Calculate normal range band Y coordinates
    const normalTopY = Math.max(padTop, getY(config.refMax));
    const normalBottomY = Math.min(padTop + chartHeight, getY(config.refMin));
    const normalBandHeight = Math.max(2, normalBottomY - normalTopY);

    // Build SVG Path
    let pathD = "";
    points.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.value);
      pathD += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
    });

    // Area fill below line
    const areaD = `${pathD} L ${getX(points.length - 1)},${padTop + chartHeight} L ${getX(0)},${padTop + chartHeight} Z`;

    // Generate Points & Tooltips
    const circlesSvg = points.map((pt, i) => {
      const x = getX(i);
      const y = getY(pt.value);
      const isHigh = pt.flag === "HIGH";
      const isLow = pt.flag === "LOW";
      const color = isHigh ? "#ef4444" : (isLow ? "#f59e0b" : "#10b981");

      const hospBadgeColor = pt.hospitalId === "hosp-mayo" ? "#2563eb" : 
                            (pt.hospitalId === "hosp-apollo" ? "#059669" : 
                            (pt.hospitalId === "hosp-jhm" ? "#0284c7" : "#7c3aed"));

      return `
        <g class="chart-point-group" tabindex="0">
          <circle cx="${x}" cy="${y}" r="7" fill="${color}" stroke="#ffffff" stroke-width="2.5" class="chart-point"></circle>
          <circle cx="${x}" cy="${y}" r="12" fill="${color}" opacity="0.2" class="chart-point-pulse"></circle>
          
          <!-- Value Label -->
          <text x="${x}" y="${y - 12}" text-anchor="middle" font-size="12" font-weight="700" fill="#1e293b">${pt.value} ${pt.unit}</text>
          
          <!-- Hospital Indicator Pill -->
          <rect x="${x - 40}" y="${height - padBottom + 20}" width="80" height="18" rx="9" fill="${hospBadgeColor}" opacity="0.9"></rect>
          <text x="${x}" y="${height - padBottom + 33}" text-anchor="middle" font-size="9" font-weight="600" fill="#ffffff">${pt.hospitalName.split(" ")[0]}</text>
          
          <!-- Date Label -->
          <text x="${x}" y="${height - padBottom + 12}" text-anchor="middle" font-size="11" fill="#64748b">${pt.date}</text>
        </g>
      `;
    }).join("");

    // Horizontal grid lines
    const gridSteps = 4;
    let gridLinesSvg = "";
    for (let i = 0; i <= gridSteps; i++) {
      const v = minVal + (range * i) / gridSteps;
      const y = getY(v);
      gridLinesSvg += `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"></line>
        <text x="${padLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#94a3b8">${Math.round(v * 10) / 10}</text>
      `;
    }

    this.container.innerHTML = `
      <div class="biomarker-chart-header">
        <div class="metric-info">
          <h4>${config.title} <span class="metric-unit">(${config.unit})</span></h4>
          <p class="metric-subtitle">${config.targetDesc}</p>
        </div>
        <div class="metric-legend">
          <span class="legend-item"><span class="legend-box normal-box"></span> Normal Range (${config.refMin} - ${config.refMax})</span>
          <span class="legend-item"><span class="legend-dot high-dot"></span> Elevated / High</span>
          <span class="legend-item"><span class="legend-dot normal-dot"></span> In Target Range</span>
        </div>
      </div>

      <div class="chart-svg-wrapper">
        <svg viewBox="0 0 ${width} ${height}" class="longitudinal-chart-svg" preserveAspectRatio="xMidYMid meet">
          <!-- Normal Reference Zone Band -->
          <rect x="${padLeft}" y="${normalTopY}" width="${chartWidth}" height="${normalBandHeight}" fill="#10b981" opacity="0.12" rx="4"></rect>
          <line x1="${padLeft}" y1="${normalTopY}" x2="${width - padRight}" y2="${normalTopY}" stroke="#10b981" stroke-width="1.2" stroke-dasharray="4,4"></line>
          <line x1="${padLeft}" y1="${normalBottomY}" x2="${width - padRight}" y2="${normalBottomY}" stroke="#10b981" stroke-width="1.2" stroke-dasharray="4,4"></line>
          
          <!-- Reference Zone Label -->
          <text x="${width - padRight - 5}" y="${normalTopY + 14}" text-anchor="end" font-size="10" font-weight="600" fill="#059669">NORMAL THRESHOLD</text>

          <!-- Grid Lines -->
          ${gridLinesSvg}

          <!-- Gradient Area -->
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="${areaD}" fill="url(#chartGradient)"></path>

          <!-- Trend Connecting Line -->
          <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="chart-trend-line"></path>

          <!-- Points & Labels -->
          ${circlesSvg}
        </svg>
      </div>

      <div class="cross-hospital-insights">
        <div class="insight-badge"><i class="fas fa-hospital-symbol"></i> Multi-Hospital Sync Active</div>
        <div class="insight-text">Comparing tests consolidated from <strong>Mayo Clinic</strong>, <strong>Apollo Hospitals</strong>, and <strong>Johns Hopkins</strong>.</div>
      </div>
    `;
  }
}

window.OmniBiomarkerCharts = OmniBiomarkerCharts;
