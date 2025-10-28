// ============================================================================
// PDF EXPORT UTILITY FOR PROGESTERONE REPORTS
// Uses jsPDF and html2canvas for client-side PDF generation
// ============================================================================

/**
 * Generate PDF report for progesterone cycle
 * 
 * Note: This requires installing:
 * npm install jspdf html2canvas
 * npm install @types/jspdf --save-dev
 */

export interface ProgesteroneReportData {
  // Bitch information
  bitchName: string;
  bitchBreed?: string;
  bitchRegistration?: string;
  bitchAge?: number;

  // Cycle information
  cycleNumber?: number;
  startDate: string;
  endDate?: string;
  currentDay: number;
  status: 'active' | 'completed' | 'cancelled';

  // Progesterone readings
  readings: Array<{
    day: number;
    date: string;
    level: number;
    phase: string;
    laboratory?: string;
    notes?: string;
  }>;

  // Breeding information
  estimatedOvulationDay?: number;
  estimatedOvulationDate?: string;
  breedingDates?: Array<{
    date: string;
    method: string;
    studName?: string;
  }>;
  estimatedWhelpingDate?: string;

  // Breeder information
  breederName: string;
  breederKennel?: string;
  breederContact?: string;

  // Statistics
  peakLevel?: number;
  peakDay?: number;
  averageLevel?: number;
}

/**
 * Generate HTML content for PDF
 */
function generateReportHTML(data: ProgesteroneReportData): string {
  const {
    bitchName,
    bitchBreed,
    bitchRegistration,
    startDate,
    endDate,
    currentDay,
    status,
    readings,
    estimatedOvulationDay,
    estimatedOvulationDate,
    breedingDates,
    estimatedWhelpingDate,
    breederName,
    breederKennel,
    peakLevel,
    peakDay,
    averageLevel,
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #1f2937;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #8b5cf6;
    }
    .header h1 {
      font-size: 28px;
      color: #8b5cf6;
      margin-bottom: 8px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      text-align: center;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
    }
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    tr:hover {
      background: #f9fafb;
    }
    .phase-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .breeding-list {
      list-style: none;
      padding: 0;
    }
    .breeding-item {
      padding: 12px;
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      margin-bottom: 8px;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .highlight-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 16px 0;
      border-radius: 4px;
    }
    .highlight-box strong {
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐕 Progesterone Tracking Report</h1>
    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  </div>

  <!-- Bitch & Breeder Information -->
  <div class="section">
    <div class="section-title">Bitch Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">${bitchName}</div>
      </div>
      ${bitchBreed ? `
      <div class="info-item">
        <div class="info-label">Breed</div>
        <div class="info-value">${bitchBreed}</div>
      </div>
      ` : ''}
      ${bitchRegistration ? `
      <div class="info-item">
        <div class="info-label">Registration</div>
        <div class="info-value">${bitchRegistration}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <div class="info-label">Breeder</div>
        <div class="info-value">${breederName}${breederKennel ? ` (${breederKennel})` : ''}</div>
      </div>
    </div>
  </div>

  <!-- Cycle Information -->
  <div class="section">
    <div class="section-title">Heat Cycle Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Start Date</div>
        <div class="info-value">${new Date(startDate).toLocaleDateString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Current Day</div>
        <div class="info-value">Day ${currentDay}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value" style="text-transform: capitalize;">${status}</div>
      </div>
      ${endDate ? `
      <div class="info-item">
        <div class="info-label">End Date</div>
        <div class="info-value">${new Date(endDate).toLocaleDateString()}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Statistics -->
  ${peakLevel ? `
  <div class="section">
    <div class="section-title">Progesterone Statistics</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Peak Level</div>
        <div class="stat-value">${peakLevel.toFixed(1)}</div>
        <div class="stat-label">ng/mL (Day ${peakDay})</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Level</div>
        <div class="stat-value">${averageLevel?.toFixed(1)}</div>
        <div class="stat-label">ng/mL</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Readings</div>
        <div class="stat-value">${readings.length}</div>
        <div class="stat-label">tests performed</div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Ovulation & Breeding -->
  ${estimatedOvulationDay ? `
  <div class="section">
    <div class="highlight-box">
      <strong>Estimated Ovulation:</strong> Day ${estimatedOvulationDay}
      ${estimatedOvulationDate ? ` (${new Date(estimatedOvulationDate).toLocaleDateString()})` : ''}
      ${estimatedWhelpingDate ? `<br><strong>Expected Whelping:</strong> ${new Date(estimatedWhelpingDate).toLocaleDateString()} (±2 days)` : ''}
    </div>
  </div>
  ` : ''}

  ${breedingDates && breedingDates.length > 0 ? `
  <div class="section">
    <div class="section-title">Breeding Records</div>
    <ul class="breeding-list">
      ${breedingDates.map(breeding => `
        <li class="breeding-item">
          <strong>${new Date(breeding.date).toLocaleDateString()}</strong> - ${breeding.method}
          ${breeding.studName ? `<br>Stud: ${breeding.studName}` : ''}
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- Progesterone Readings Table -->
  <div class="section">
    <div class="section-title">Progesterone Readings</div>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Date</th>
          <th>Level (ng/mL)</th>
          <th>Phase</th>
          <th>Laboratory</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${readings.map(reading => `
          <tr>
            <td><strong>${reading.day}</strong></td>
            <td>${new Date(reading.date).toLocaleDateString()}</td>
            <td><strong>${reading.level.toFixed(1)}</strong></td>
            <td><span class="phase-badge">${reading.phase}</span></td>
            <td>${reading.laboratory || 'N/A'}</td>
            <td>${reading.notes || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p><strong>Animalytics</strong> - Professional Canine Breeding Management</p>
    <p>This report is for informational purposes only. Consult with a veterinarian for medical advice.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Export progesterone report as PDF
 */
export async function exportProgesteronePDF(data: ProgesteroneReportData): Promise<void> {
  try {
    // Dynamic imports to avoid SSR issues
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;

    // Create temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.innerHTML = generateReportHTML(data);
    document.body.appendChild(container);

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4 height in mm
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    // Generate filename
    const filename = `progesterone-report-${data.bitchName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

    // Download PDF
    pdf.save(filename);

    console.log('✅ PDF exported successfully:', filename);
  } catch (error) {
    console.error('❌ Error exporting PDF:', error);
    throw new Error('Failed to export PDF report');
  }
}

/**
 * Export simple text report (fallback)
 */
export function exportProgesteroneText(data: ProgesteroneReportData): void {
  const {
    bitchName,
    bitchBreed,
    startDate,
    currentDay,
    readings,
    estimatedOvulationDay,
    estimatedWhelpingDate,
    breederName,
  } = data;

  let text = `PROGESTERONE TRACKING REPORT\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `\n`;
  text += `BITCH INFORMATION\n`;
  text += `Name: ${bitchName}\n`;
  if (bitchBreed) text += `Breed: ${bitchBreed}\n`;
  text += `Breeder: ${breederName}\n`;
  text += `\n`;
  text += `CYCLE INFORMATION\n`;
  text += `Start Date: ${new Date(startDate).toLocaleDateString()}\n`;
  text += `Current Day: ${currentDay}\n`;
  if (estimatedOvulationDay) {
    text += `Estimated Ovulation: Day ${estimatedOvulationDay}\n`;
  }
  if (estimatedWhelpingDate) {
    text += `Expected Whelping: ${new Date(estimatedWhelpingDate).toLocaleDateString()}\n`;
  }
  text += `\n`;
  text += `PROGESTERONE READINGS\n`;
  text += `Day\tDate\t\tLevel (ng/mL)\tPhase\n`;
  text += `---\t----\t\t-------------\t-----\n`;

  readings.forEach(reading => {
    text += `${reading.day}\t${new Date(reading.date).toLocaleDateString()}\t${reading.level.toFixed(1)}\t\t${reading.phase}\n`;
  });

  // Create blob and download
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `progesterone-report-${bitchName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✅ Text report exported successfully');
}
