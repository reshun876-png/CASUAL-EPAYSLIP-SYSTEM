import { jsPDF } from 'jspdf';
import { Payslip, PayrollCycle } from '../types/payroll';
import { formatCedisInWords, formatGHS } from './numberToWords';
import { createVerificationQrDataUrl } from './qrHelper';

/**
 * Generates an official Ghana Health Service Essikado Hospital PDF Payslip
 */
export function generatePayslipPdf(payslip: Payslip, password?: string): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set Document Properties
  doc.setProperties({
    title: `Payslip - ${payslip.staffName} (${payslip.monthYear})`,
    subject: `Ghana Health Service - Essikado Hospital Temporal Staff Payslip`,
    author: `Ghana Health Service, Essikado Hospital`,
    keywords: `payslip, ghs, essikado, temporal, payroll, ghana`,
    creator: `GHS Essikado Hospital Electronic Payroll System`,
  });

  // Background subtle watermark
  doc.saveGraphicsState();
  doc.setTextColor(230, 240, 235);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  // watermark angle
  doc.text('GHANA HEALTH SERVICE', 25, 140, { angle: 35 });
  doc.text('ESSIKADO HOSPITAL - TEMPORAL', 15, 175, { angle: 35 });
  doc.restoreGraphicsState();

  // Top Accent Bar (Ghana National Colors / GHS Green)
  doc.setFillColor(0, 107, 63); // GHS Green #006B3F
  doc.rect(0, 0, 210, 8, 'F');
  doc.setFillColor(252, 209, 22); // Ghana Gold #FCD116
  doc.rect(0, 8, 210, 2, 'F');
  doc.setFillColor(206, 17, 38); // Ghana Red #CE1126
  doc.rect(0, 10, 210, 1, 'F');

  // Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 90, 50); // Dark Green
  doc.text('GHANA HEALTH SERVICE', 105, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(70, 70, 70);
  doc.setFont('helvetica', 'normal');
  doc.text('WESTERN REGIONAL HEALTH DIRECTORATE', 105, 25, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('ESSIKADO HOSPITAL - SEKONDI / TAKORADI', 105, 31, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'P.O. Box 243, Essikado, Western Region, Ghana • Tel: +233 (0) 31 204 6120 • essikado.hospital@ghs.gov.gh',
    105,
    36,
    { align: 'center' }
  );

  // Payslip Title Badge
  doc.setFillColor(241, 245, 249); // light slate
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 40, 182, 11, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 107, 63);
  doc.text('ELECTRONIC PAYSLIP - TEMPORAL & LOCUM HEALTH STAFF', 20, 47);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Pay Period: ${payslip.monthYear}`, 190, 47, { align: 'right' });

  // Serial & Payment Date strip
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Serial No: ${payslip.payslipSerialNo}`, 15, 56);
  doc.text(`Payment Date: ${payslip.paymentDate}`, 105, 56, { align: 'center' });
  doc.text(`Generated: ${new Date(payslip.generatedAt).toLocaleDateString()}`, 195, 56, { align: 'right' });

  // Staff Profile Box
  doc.setDrawColor(200, 220, 210);
  doc.setFillColor(248, 250, 249);
  doc.roundedRect(14, 59, 182, 33, 2, 2, 'FD');

  doc.setFontSize(8.5);
  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Staff Name:', 18, 65);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.staffName, 42, 65);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Staff ID:', 18, 71);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.staffId, 42, 71);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Cadre / Post:', 18, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.cadre, 42, 77);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Department:', 18, 83);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.department, 42, 83);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Ghana Card PIN:', 110, 65);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.ghanaCardNo, 142, 65);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SSNIT Number:', 110, 71);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.ssnitNo || 'N/A (Casual Exemption)', 142, 71);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Mode:', 110, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.paymentMethod, 142, 77);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Disbursement To:', 110, 83);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  // Truncate if long
  const truncatedDetails = payslip.bankOrMomoDetails.length > 28
    ? payslip.bankOrMomoDetails.slice(0, 28) + '...'
    : payslip.bankOrMomoDetails;
  doc.text(truncatedDetails, 142, 83);

  // Shift & Attendance Strip
  doc.setFillColor(238, 242, 255); // Indigo tint
  doc.roundedRect(14, 95, 182, 8, 1, 1, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text('ATTENDANCE & DUTY SUMMARY:', 18, 100);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Regular Days: ${payslip.shifts.normalDaysWorked}  |  Night Shifts: ${payslip.shifts.nightShiftsWorked}  |  Emergency Calls: ${payslip.shifts.emergencyCallsWorked}  |  Weekend/Holiday: ${payslip.shifts.holidayOrWeekendShifts}`,
    75,
    100
  );

  // Dual Column Financials Table
  const tableTop = 106;
  const colWidth = 89;

  // Header Earnings
  doc.setFillColor(0, 107, 63); // GHS Green
  doc.rect(14, tableTop, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('EARNINGS & ALLOWANCES', 18, tableTop + 5);
  doc.text('AMOUNT (GH₵)', 14 + colWidth - 4, tableTop + 5, { align: 'right' });

  // Header Deductions
  doc.setFillColor(185, 28, 28); // Red
  doc.rect(107, tableTop, colWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('DEDUCTIONS & TAXES', 111, tableTop + 5);
  doc.text('AMOUNT (GH₵)', 107 + colWidth - 4, tableTop + 5, { align: 'right' });

  // Rows
  let curY = tableTop + 12;
  const maxRows = Math.max(payslip.earnings.length, payslip.deductions.length, 5);

  doc.setFontSize(8);
  for (let i = 0; i < maxRows; i++) {
    const earning = payslip.earnings[i];
    const deduction = payslip.deductions[i];

    // Alternating background
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, curY - 4, colWidth, 6, 'F');
      doc.rect(107, curY - 4, colWidth, 6, 'F');
    }

    if (earning) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      // shorten description if needed
      const desc = earning.description.length > 34 ? earning.description.slice(0, 32) + '..' : earning.description;
      doc.text(desc, 18, curY);
      doc.setFont('helvetica', 'bold');
      doc.text(earning.amount.toFixed(2), 14 + colWidth - 4, curY, { align: 'right' });
    }

    if (deduction) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const desc = deduction.description.length > 34 ? deduction.description.slice(0, 32) + '..' : deduction.description;
      doc.text(desc, 111, curY);
      doc.setFont('helvetica', 'bold');
      doc.text(deduction.amount.toFixed(2), 107 + colWidth - 4, curY, { align: 'right' });
    }

    curY += 6;
  }

  // Totals Row
  const totalsY = Math.max(curY + 2, 148);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, totalsY - 2, 196, totalsY - 2);

  // Total Gross
  doc.setFillColor(240, 253, 244); // light green
  doc.rect(14, totalsY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 107, 63);
  doc.text('TOTAL GROSS PAY', 18, totalsY + 5);
  doc.text(`GH₵ ${payslip.grossPay.toFixed(2)}`, 14 + colWidth - 4, totalsY + 5, { align: 'right' });

  // Total Deductions
  doc.setFillColor(254, 242, 242); // light red
  doc.rect(107, totalsY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('TOTAL DEDUCTIONS', 111, totalsY + 5);
  doc.text(`GH₵ ${payslip.totalDeductions.toFixed(2)}`, 107 + colWidth - 4, totalsY + 5, { align: 'right' });

  // NET PAY HIGHLIGHT BANNER
  const netPayY = totalsY + 12;
  doc.setFillColor(0, 90, 50); // Deep GHS Emerald
  doc.roundedRect(14, netPayY, 182, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(252, 209, 22); // Ghana Gold
  doc.text('NET MONTHLY TAKE-HOME PAY (GHANA CEDIS):', 20, netPayY + 7);

  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(formatGHS(payslip.netPay), 20, netPayY + 15);

  // Status stamp badge inside banner
  doc.setFillColor(22, 163, 74);
  doc.roundedRect(145, netPayY + 4, 45, 12, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('STATUS: DISBURSED', 167.5, netPayY + 9, { align: 'center' });
  doc.text('DIRECT CREDITED', 167.5, netPayY + 13, { align: 'center' });

  // Net Pay in Words
  const wordsY = netPayY + 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Amount in Words:', 14, wordsY);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(15, 23, 42);
  const words = formatCedisInWords(payslip.netPay);
  doc.text(words, 44, wordsY);

  // YTD Cumulative Summary
  const ytdY = wordsY + 6;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, ytdY, 182, 11, 1, 1, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('YEAR-TO-DATE (YTD) CUMULATIVE RECORD:', 18, ytdY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Gross Earnings: GH₵ ${payslip.ytdGross.toFixed(2)}   |   Tax Withheld (GRA): GH₵ ${payslip.ytdTax.toFixed(2)}   |   Net Disbursed: GH₵ ${payslip.ytdNet.toFixed(2)}`,
    85,
    ytdY + 7
  );

  // Tamper-Proof Verification Section with QR Code
  const qrSectionY = ytdY + 15;
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, qrSectionY, 182, 30, 2, 2, 'D');

  // Insert QR Code image
  const qrDataUrl = createVerificationQrDataUrl(
    `https://ghs.gov.gh/verify/essikado?serial=${payslip.payslipSerialNo}&hash=${payslip.securityHash}&staff=${payslip.staffId}&net=${payslip.netPay}`
  );
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 18, qrSectionY + 2.5, 25, 25);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 107, 63);
  doc.text('ELECTRONIC AUTHENTICITY & SECURITY VERIFICATION', 48, qrSectionY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This payslip is a tamper-evident, cryptographically verified electronic instrument issued under the authority',
    48,
    qrSectionY + 12
  );
  doc.text(
    'of the Western Regional Health Directorate, Essikado Hospital. Scan QR or inspect security fingerprint.',
    48,
    qrSectionY + 16
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`SECURITY HASH: ${payslip.securityHash}`, 48, qrSectionY + 21);
  doc.text(`VERIFICATION CODE: ${payslip.verificationCode}`, 48, qrSectionY + 26);

  // Authorizing Signatures & Official Hospital Stamp
  const sigY = qrSectionY + 34;

  // Left Signature: Head of HR & Payroll
  doc.setDrawColor(148, 163, 184);
  doc.line(20, sigY + 14, 75, sigY + 14);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Mrs. Faustina Baidoo', 20, sigY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Head of HR & Payroll', 20, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghana Health Service, Essikado Hospital', 20, sigY + 22);

  // Center Official Stamp Seal
  doc.setDrawColor(0, 107, 63);
  doc.setLineWidth(0.8);
  doc.roundedRect(88, sigY + 1, 40, 22, 3, 3, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 107, 63);
  doc.text('GHANA HEALTH SERVICE', 108, sigY + 6, { align: 'center' });
  doc.setFontSize(7);
  doc.text('ESSIKADO HOSPITAL', 108, sigY + 11, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(185, 28, 28);
  doc.text('★ CERTIFIED & DISBURSED ★', 108, sigY + 16, { align: 'center' });
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${payslip.paymentDate}`, 108, sigY + 20, { align: 'center' });
  doc.setLineWidth(0.2); // reset

  // Right Signature: Medical Superintendent
  doc.line(140, sigY + 14, 195, sigY + 14);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Emmanuel K. Arhin', 140, sigY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Medical Superintendent', 140, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghana Health Service, Essikado Hospital', 140, sigY + 22);

  // Footer Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'CONFIDENTIAL: This payslip is for the designated temporal staff member only. Unauthorized alteration is an offense under Ghana Law.',
    105,
    290,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads a single payslip as a PDF
 */
export function downloadSinglePayslipPdf(payslip: Payslip, password?: string): void {
  const doc = generatePayslipPdf(payslip, password);
  const cleanName = payslip.staffName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `GHS_Essikado_Payslip_${payslip.staffId}_${payslip.payrollCycleId}_${cleanName}.pdf`;
  doc.save(filename);
}

/**
 * Downloads a batch of payslips into a single combined multi-page PDF document
 */
export function downloadBatchPayslipsPdf(
  payslips: Payslip[],
  cycleName: string,
  onProgress?: (current: number, total: number) => void
): void {
  if (payslips.length === 0) return;

  const firstDoc = generatePayslipPdf(payslips[0]);
  if (onProgress) onProgress(1, payslips.length);

  for (let i = 1; i < payslips.length; i++) {
    firstDoc.addPage('a4', 'portrait');
    const singleDoc = generatePayslipPdf(payslips[i]);
    // Transfer pages
    // Since jsPDF allows generating sequentially on the same document:
    // We can call a page drawing function or reconstruct
    // To ensure 100% fidelity, we can draw each page on firstDoc:
    drawPayslipOnDoc(firstDoc, payslips[i]);
    if (onProgress) onProgress(i + 1, payslips.length);
  }

  firstDoc.save(`GHS_Essikado_Hospital_All_Temporal_Payslips_${cycleName.replace(/\s+/g, '_')}.pdf`);
}

function drawPayslipOnDoc(doc: jsPDF, payslip: Payslip): void {
  // Top Accent Bar
  doc.setFillColor(0, 107, 63);
  doc.rect(0, 0, 210, 8, 'F');
  doc.setFillColor(252, 209, 22);
  doc.rect(0, 8, 210, 2, 'F');
  doc.setFillColor(206, 17, 38);
  doc.rect(0, 10, 210, 1, 'F');

  // Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 90, 50);
  doc.text('GHANA HEALTH SERVICE', 105, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(70, 70, 70);
  doc.setFont('helvetica', 'normal');
  doc.text('WESTERN REGIONAL HEALTH DIRECTORATE', 105, 25, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('ESSIKADO HOSPITAL - SEKONDI / TAKORADI', 105, 31, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'P.O. Box 243, Essikado, Western Region, Ghana • Tel: +233 (0) 31 204 6120 • essikado.hospital@ghs.gov.gh',
    105,
    36,
    { align: 'center' }
  );

  // Payslip Title Badge
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 40, 182, 11, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 107, 63);
  doc.text('ELECTRONIC PAYSLIP - TEMPORAL & LOCUM HEALTH STAFF', 20, 47);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Pay Period: ${payslip.monthYear}`, 190, 47, { align: 'right' });

  // Serial & Payment Date strip
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Serial No: ${payslip.payslipSerialNo}`, 15, 56);
  doc.text(`Payment Date: ${payslip.paymentDate}`, 105, 56, { align: 'center' });
  doc.text(`Generated: ${new Date(payslip.generatedAt).toLocaleDateString()}`, 195, 56, { align: 'right' });

  // Staff Profile Box
  doc.setDrawColor(200, 220, 210);
  doc.setFillColor(248, 250, 249);
  doc.roundedRect(14, 59, 182, 33, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Staff Name:', 18, 65);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.staffName, 42, 65);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Staff ID:', 18, 71);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.staffId, 42, 71);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Cadre / Post:', 18, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.cadre, 42, 77);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Department:', 18, 83);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.department, 42, 83);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Ghana Card PIN:', 110, 65);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.ghanaCardNo, 142, 65);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SSNIT Number:', 110, 71);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.ssnitNo || 'N/A (Casual Exemption)', 142, 71);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Mode:', 110, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.paymentMethod, 142, 77);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Disbursement To:', 110, 83);
  doc.setFont('helvetica', 'normal');
  const truncatedDetails = payslip.bankOrMomoDetails.length > 28
    ? payslip.bankOrMomoDetails.slice(0, 28) + '...'
    : payslip.bankOrMomoDetails;
  doc.text(truncatedDetails, 142, 83);

  // Shift & Attendance Strip
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, 95, 182, 8, 1, 1, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text('ATTENDANCE & DUTY SUMMARY:', 18, 100);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Regular Days: ${payslip.shifts.normalDaysWorked}  |  Night Shifts: ${payslip.shifts.nightShiftsWorked}  |  Emergency Calls: ${payslip.shifts.emergencyCallsWorked}  |  Weekend/Holiday: ${payslip.shifts.holidayOrWeekendShifts}`,
    75,
    100
  );

  // Dual Column Financials Table
  const tableTop = 106;
  const colWidth = 89;

  // Header Earnings
  doc.setFillColor(0, 107, 63);
  doc.rect(14, tableTop, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('EARNINGS & ALLOWANCES', 18, tableTop + 5);
  doc.text('AMOUNT (GH₵)', 14 + colWidth - 4, tableTop + 5, { align: 'right' });

  // Header Deductions
  doc.setFillColor(185, 28, 28);
  doc.rect(107, tableTop, colWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('DEDUCTIONS & TAXES', 111, tableTop + 5);
  doc.text('AMOUNT (GH₵)', 107 + colWidth - 4, tableTop + 5, { align: 'right' });

  let curY = tableTop + 12;
  const maxRows = Math.max(payslip.earnings.length, payslip.deductions.length, 5);

  doc.setFontSize(8);
  for (let i = 0; i < maxRows; i++) {
    const earning = payslip.earnings[i];
    const deduction = payslip.deductions[i];

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, curY - 4, colWidth, 6, 'F');
      doc.rect(107, curY - 4, colWidth, 6, 'F');
    }

    if (earning) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const desc = earning.description.length > 34 ? earning.description.slice(0, 32) + '..' : earning.description;
      doc.text(desc, 18, curY);
      doc.setFont('helvetica', 'bold');
      doc.text(earning.amount.toFixed(2), 14 + colWidth - 4, curY, { align: 'right' });
    }

    if (deduction) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const desc = deduction.description.length > 34 ? deduction.description.slice(0, 32) + '..' : deduction.description;
      doc.text(desc, 111, curY);
      doc.setFont('helvetica', 'bold');
      doc.text(deduction.amount.toFixed(2), 107 + colWidth - 4, curY, { align: 'right' });
    }

    curY += 6;
  }

  const totalsY = Math.max(curY + 2, 148);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, totalsY - 2, 196, totalsY - 2);

  doc.setFillColor(240, 253, 244);
  doc.rect(14, totalsY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 107, 63);
  doc.text('TOTAL GROSS PAY', 18, totalsY + 5);
  doc.text(`GH₵ ${payslip.grossPay.toFixed(2)}`, 14 + colWidth - 4, totalsY + 5, { align: 'right' });

  doc.setFillColor(254, 242, 242);
  doc.rect(107, totalsY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('TOTAL DEDUCTIONS', 111, totalsY + 5);
  doc.text(`GH₵ ${payslip.totalDeductions.toFixed(2)}`, 107 + colWidth - 4, totalsY + 5, { align: 'right' });

  const netPayY = totalsY + 12;
  doc.setFillColor(0, 90, 50);
  doc.roundedRect(14, netPayY, 182, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(252, 209, 22);
  doc.text('NET MONTHLY TAKE-HOME PAY (GHANA CEDIS):', 20, netPayY + 7);

  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(formatGHS(payslip.netPay), 20, netPayY + 15);

  doc.setFillColor(22, 163, 74);
  doc.roundedRect(145, netPayY + 4, 45, 12, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('STATUS: DISBURSED', 167.5, netPayY + 9, { align: 'center' });
  doc.text('DIRECT CREDITED', 167.5, netPayY + 13, { align: 'center' });

  const wordsY = netPayY + 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Amount in Words:', 14, wordsY);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(15, 23, 42);
  const words = formatCedisInWords(payslip.netPay);
  doc.text(words, 44, wordsY);

  const ytdY = wordsY + 6;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, ytdY, 182, 11, 1, 1, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('YEAR-TO-DATE (YTD) CUMULATIVE RECORD:', 18, ytdY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Gross Earnings: GH₵ ${payslip.ytdGross.toFixed(2)}   |   Tax Withheld (GRA): GH₵ ${payslip.ytdTax.toFixed(2)}   |   Net Disbursed: GH₵ ${payslip.ytdNet.toFixed(2)}`,
    85,
    ytdY + 7
  );

  const qrSectionY = ytdY + 15;
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, qrSectionY, 182, 30, 2, 2, 'D');

  const qrDataUrl = createVerificationQrDataUrl(
    `https://ghs.gov.gh/verify/essikado?serial=${payslip.payslipSerialNo}&hash=${payslip.securityHash}&staff=${payslip.staffId}&net=${payslip.netPay}`
  );
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 18, qrSectionY + 2.5, 25, 25);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 107, 63);
  doc.text('ELECTRONIC AUTHENTICITY & SECURITY VERIFICATION', 48, qrSectionY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This payslip is a tamper-evident, cryptographically verified electronic instrument issued under the authority',
    48,
    qrSectionY + 12
  );
  doc.text(
    'of the Western Regional Health Directorate, Essikado Hospital. Scan QR or inspect security fingerprint.',
    48,
    qrSectionY + 16
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`SECURITY HASH: ${payslip.securityHash}`, 48, qrSectionY + 21);
  doc.text(`VERIFICATION CODE: ${payslip.verificationCode}`, 48, qrSectionY + 26);

  const sigY = qrSectionY + 34;

  doc.setDrawColor(148, 163, 184);
  doc.line(20, sigY + 14, 75, sigY + 14);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Mrs. Faustina Baidoo', 20, sigY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Head of HR & Payroll', 20, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghana Health Service, Essikado Hospital', 20, sigY + 22);

  doc.setDrawColor(0, 107, 63);
  doc.setLineWidth(0.8);
  doc.roundedRect(88, sigY + 1, 40, 22, 3, 3, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 107, 63);
  doc.text('GHANA HEALTH SERVICE', 108, sigY + 6, { align: 'center' });
  doc.setFontSize(7);
  doc.text('ESSIKADO HOSPITAL', 108, sigY + 11, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(185, 28, 28);
  doc.text('★ CERTIFIED & DISBURSED ★', 108, sigY + 16, { align: 'center' });
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${payslip.paymentDate}`, 108, sigY + 20, { align: 'center' });
  doc.setLineWidth(0.2);

  doc.line(140, sigY + 14, 195, sigY + 14);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Emmanuel K. Arhin', 140, sigY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Medical Superintendent', 140, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghana Health Service, Essikado Hospital', 140, sigY + 22);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'CONFIDENTIAL: This payslip is for the designated temporal staff member only. Unauthorized alteration is an offense under Ghana Law.',
    105,
    290,
    { align: 'center' }
  );
}

/**
 * Generates an official Monthly Payslip Summary / Master Payroll Ledger in LANDSCAPE orientation (A4: 297mm x 210mm)
 */
export function generatePayrollSummaryLandscapePdf(
  payslips: Payslip[],
  cycle: PayrollCycle
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4', // 297mm x 210mm
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;
  const tableWidth = pageWidth - margin * 2; // 277mm

  // Totals calculation
  const totalGross = payslips.reduce((s, p) => s + p.grossPay, 0);
  const totalTax = payslips.reduce((s, p) => s + p.graTaxDeduction, 0);
  const totalDeductions = payslips.reduce((s, p) => s + p.totalDeductions, 0);
  const totalNet = payslips.reduce((s, p) => s + p.netPay, 0);
  const totalWelfare = payslips.reduce((s, p) => s + (p.welfareDeduction || 0) + (p.ssnitEmployeeDeduction || 0), 0);

  // Document metadata
  doc.setProperties({
    title: `Monthly Payslip Summary Ledger - ${cycle.monthYear}`,
    subject: `Ghana Health Service Essikado Hospital Temporal Staff Master Payroll Ledger`,
    author: `Ghana Health Service, Essikado Hospital`,
    keywords: `payslip, summary, landscape, payroll, ghs, essikado, ghana`,
    creator: `GHS Essikado Hospital Payroll System`,
  });

  const drawHeader = (pageNumber: number, totalPages: number) => {
    // Top Ghana National Tricolor Bar (297mm wide)
    doc.setFillColor(0, 107, 63); // GHS Green
    doc.rect(0, 0, pageWidth, 5, 'F');
    doc.setFillColor(252, 209, 22); // Ghana Gold
    doc.rect(0, 5, pageWidth, 1.5, 'F');
    doc.setFillColor(206, 17, 38); // Ghana Red
    doc.rect(0, 6.5, pageWidth, 1, 'F');

    // Header Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 90, 50);
    doc.text('GHANA HEALTH SERVICE • WESTERN REGIONAL HEALTH DIRECTORATE', pageWidth / 2, 14, { align: 'center' });

    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text('ESSIKADO HOSPITAL - SEKONDI / TAKORADI', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 107, 63);
    doc.text('MONTHLY TEMPORAL & LOCUM STAFF ELECTRONIC PAYSLIP SUMMARY & MASTER DISBURSEMENT LEDGER', pageWidth / 2, 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Pay Period: ${cycle.monthYear}   |   Payment Date: ${cycle.paymentDate}   |   Status: ${cycle.status.toUpperCase()}   |   Page ${pageNumber} of ${totalPages}`,
      pageWidth / 2,
      29.5,
      { align: 'center' }
    );
  };

  // We can fit up to 12 staff rows on page 1 with signatures, or split across pages
  const rowsPerPage = 11;
  const totalPages = Math.max(1, Math.ceil(payslips.length / rowsPerPage));

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage('a4', 'landscape');
    }

    drawHeader(page + 1, totalPages);

    // KPI Summary Strip on Page 1
    let tableStartY = 33;
    if (page === 0) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, 32, tableWidth, 9, 1.5, 1.5, 'F');
      doc.setFontSize(7.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`Enrolled Personnel: `, margin + 4, 38);
      doc.setTextColor(15, 23, 42);
      doc.text(`${payslips.length} Temporal Staff`, margin + 30, 38);

      doc.setTextColor(71, 85, 105);
      doc.text(`Gross Outlay: `, margin + 65, 38);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 107, 63);
      doc.text(formatGHS(totalGross), margin + 84, 38);

      doc.setTextColor(71, 85, 105);
      doc.text(`GRA Tax Withheld: `, margin + 125, 38);
      doc.setTextColor(185, 28, 28);
      doc.text(formatGHS(totalTax), margin + 152, 38);

      doc.setTextColor(71, 85, 105);
      doc.text(`Welfare / Tier-1: `, margin + 185, 38);
      doc.setTextColor(71, 85, 105);
      doc.text(formatGHS(totalWelfare), margin + 208, 38);

      doc.setTextColor(71, 85, 105);
      doc.text(`Net Disbursed: `, margin + 235, 38);
      doc.setTextColor(0, 107, 63);
      doc.text(formatGHS(totalNet), margin + 256, 38);

      tableStartY = 43;
    }

    // Wide Table Header in Landscape
    // Columns:
    // 0: # (8)
    // 1: Staff ID (22)
    // 2: Staff Name (36)
    // 3: Cadre / Dept (38)
    // 4: Shifts (18)
    // 5: Basic Pay (22)
    // 6: Allowances (22)
    // 7: Gross Pay (22)
    // 8: GRA Tax (20)
    // 9: Deductions (20)
    // 10: Net Take-Home (25)
    // 11: Destination (24)
    // Total = 277 mm
    const colX = [
      margin,               // # (8)
      margin + 8,          // Staff ID (22)
      margin + 30,         // Staff Name (36)
      margin + 66,         // Cadre & Dept (38)
      margin + 104,        // Shifts (18)
      margin + 122,        // Basic (22)
      margin + 144,        // Allowances (22)
      margin + 166,        // Gross (22)
      margin + 188,        // GRA Tax (20)
      margin + 208,        // Deductions (20)
      margin + 228,        // Net Pay (25)
      margin + 253,        // Destination (24)
    ];

    doc.setFillColor(0, 107, 63); // Dark Green
    doc.rect(margin, tableStartY, tableWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('#', colX[0] + 2, tableStartY + 4.8);
    doc.text('STAFF ID', colX[1] + 1, tableStartY + 4.8);
    doc.text('STAFF NAME', colX[2] + 1, tableStartY + 4.8);
    doc.text('CADRE & DEPARTMENT', colX[3] + 1, tableStartY + 4.8);
    doc.text('SHIFTS', colX[4] + 1, tableStartY + 4.8);
    doc.text('BASIC (GH₵)', colX[5] + 20, tableStartY + 4.8, { align: 'right' });
    doc.text('ALLOWANCES', colX[6] + 20, tableStartY + 4.8, { align: 'right' });
    doc.text('GROSS (GH₵)', colX[7] + 20, tableStartY + 4.8, { align: 'right' });
    doc.text('GRA TAX (WHT)', colX[8] + 18, tableStartY + 4.8, { align: 'right' });
    doc.text('DEDUCTIONS', colX[9] + 18, tableStartY + 4.8, { align: 'right' });
    doc.text('NET PAY (GH₵)', colX[10] + 23, tableStartY + 4.8, { align: 'right' });
    doc.text('PAYMENT VIA', colX[11] + 1, tableStartY + 4.8);

    // Rows
    const pageStaff = payslips.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    let rowY = tableStartY + 7;

    pageStaff.forEach((p, idx) => {
      const globalIndex = page * rowsPerPage + idx + 1;
      const isEven = idx % 2 === 1;

      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, rowY, tableWidth, 6.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(30, 41, 59);

      // #
      doc.text(String(globalIndex), colX[0] + 2, rowY + 4.5);

      // Staff ID
      doc.setFont('courier', 'bold');
      doc.text(p.staffId, colX[1] + 1, rowY + 4.5);

      // Name
      doc.setFont('helvetica', 'bold');
      const cleanName = p.staffName.length > 20 ? p.staffName.slice(0, 19) + '..' : p.staffName;
      doc.text(cleanName, colX[2] + 1, rowY + 4.5);

      // Cadre & Dept
      doc.setFont('helvetica', 'normal');
      const cadreDept = `${p.cadre.slice(0, 15)} (${p.department.slice(0, 12)})`;
      doc.text(cadreDept, colX[3] + 1, rowY + 4.5);

      // Shifts
      const shiftTxt = `${p.shifts.normalDaysWorked}D/${p.shifts.nightShiftsWorked}N`;
      doc.text(shiftTxt, colX[4] + 1, rowY + 4.5);

      // Basic Pay
      const basicItem = p.earnings.find((e) => e.description.toLowerCase().includes('basic'));
      const basicAmount = basicItem ? basicItem.amount : p.grossPay * 0.75;
      const totalAllowances = Math.max(0, p.grossPay - basicAmount);

      doc.setFont('courier', 'normal');
      doc.text(basicAmount.toFixed(2), colX[5] + 20, rowY + 4.5, { align: 'right' });
      doc.text(totalAllowances.toFixed(2), colX[6] + 20, rowY + 4.5, { align: 'right' });

      // Gross
      doc.setFont('courier', 'bold');
      doc.text(p.grossPay.toFixed(2), colX[7] + 20, rowY + 4.5, { align: 'right' });

      // GRA Tax
      doc.setTextColor(185, 28, 28);
      doc.text(p.graTaxDeduction.toFixed(2), colX[8] + 18, rowY + 4.5, { align: 'right' });

      // Deductions
      doc.setTextColor(71, 85, 105);
      doc.text(p.totalDeductions.toFixed(2), colX[9] + 18, rowY + 4.5, { align: 'right' });

      // Net Take-Home
      doc.setFont('courier', 'bold');
      doc.setTextColor(0, 107, 63);
      doc.text(p.netPay.toFixed(2), colX[10] + 23, rowY + 4.5, { align: 'right' });

      // Payment destination
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const dest = p.paymentMethod === 'Bank Account' ? 'GCB/Bank' : 'MTN/MoMo';
      doc.text(dest, colX[11] + 1, rowY + 4.5);

      rowY += 6.5;
    });

    // If last page, print grand totals row and signatures
    if (page === totalPages - 1) {
      // Grand Totals Row
      doc.setFillColor(240, 253, 244); // Light Green
      doc.rect(margin, rowY, tableWidth, 7, 'F');
      doc.setDrawColor(0, 107, 63);
      doc.setLineWidth(0.3);
      doc.line(margin, rowY, margin + tableWidth, rowY);
      doc.line(margin, rowY + 7, margin + tableWidth, rowY + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(0, 90, 50);
      doc.text('GRAND TOTALS (ALL TEMPORAL STAFF):', colX[0] + 4, rowY + 5);

      doc.setFont('courier', 'bold');
      doc.text(totalGross.toFixed(2), colX[7] + 20, rowY + 5, { align: 'right' });
      doc.setTextColor(185, 28, 28);
      doc.text(totalTax.toFixed(2), colX[8] + 18, rowY + 5, { align: 'right' });
      doc.setTextColor(71, 85, 105);
      doc.text(totalDeductions.toFixed(2), colX[9] + 18, rowY + 5, { align: 'right' });
      doc.setTextColor(0, 107, 63);
      doc.text(totalNet.toFixed(2), colX[10] + 23, rowY + 5, { align: 'right' });

      // Net in Words banner
      const bannerY = rowY + 9;
      doc.setFillColor(0, 90, 50);
      doc.roundedRect(margin, bannerY, tableWidth, 9, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(252, 209, 22);
      doc.text('TOTAL NET DISBURSEMENT IN WORDS: ', margin + 4, bannerY + 6);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(255, 255, 255);
      doc.text(formatCedisInWords(totalNet), margin + 65, bannerY + 6);

      // Authorizations / Signatures across 3 columns
      const sigY = bannerY + 12;

      // Column 1: HR & Payroll Officer
      doc.setDrawColor(148, 163, 184);
      doc.line(margin + 5, sigY + 14, margin + 70, sigY + 14);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Mrs. Faustina Baidoo', margin + 5, sigY + 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('PREPARED BY: Head of HR & Payroll', margin + 5, sigY + 18);
      doc.setFont('helvetica', 'normal');
      doc.text('Essikado Hospital, Sekondi-Takoradi', margin + 5, sigY + 22);

      // Column 2: Internal Audit Examiner
      doc.line(margin + 95, sigY + 14, margin + 160, sigY + 14);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Ms. Vivian Ocran', margin + 95, sigY + 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('CERTIFIED BY: Internal Audit Examiner', margin + 95, sigY + 18);
      doc.setFont('helvetica', 'normal');
      doc.text('Western Regional Health Directorate', margin + 95, sigY + 22);

      // Column 3: Medical Superintendent & Seal
      doc.line(margin + 185, sigY + 14, margin + 250, sigY + 14);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Dr. Emmanuel K. Arhin', margin + 185, sigY + 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('APPROVED BY: Medical Superintendent', margin + 185, sigY + 18);
      doc.setFont('helvetica', 'normal');
      doc.text('Essikado Hospital (Executive Authorization)', margin + 185, sigY + 22);

      // Official Stamp Seal Box (Landscape)
      doc.setDrawColor(0, 107, 63);
      doc.setLineWidth(0.8);
      doc.roundedRect(margin + 242, sigY + 2, 33, 21, 2, 2, 'D');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(0, 107, 63);
      doc.text('GHANA HEALTH SERVICE', margin + 258.5, sigY + 6.5, { align: 'center' });
      doc.setFontSize(6.5);
      doc.text('ESSIKADO HOSPITAL', margin + 258.5, sigY + 11, { align: 'center' });
      doc.setFontSize(5.5);
      doc.setTextColor(185, 28, 28);
      doc.text('★ MASTER DISBURSED ★', margin + 258.5, sigY + 15.5, { align: 'center' });
      doc.setTextColor(71, 85, 105);
      doc.text(cycle.paymentDate, margin + 258.5, sigY + 19.5, { align: 'center' });
      doc.setLineWidth(0.2); // reset

      // Embedded Verification QR
      const qrDataUrl = createVerificationQrDataUrl(
        `https://ghs.gov.gh/verify/essikado-summary?cycle=${cycle.id}&net=${totalNet.toFixed(2)}&staff=${payslips.length}`
      );
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', margin + 215, sigY + 2, 20, 20);
      }
    }

    // Landscape Page Footer
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `CONFIDENTIAL GHANA HEALTH SERVICE FINANCIAL DOCUMENT • ESSIKADO HOSPITAL • GENERATED: ${new Date().toLocaleDateString()} GMT • ACT 843 COMPLIANT`,
      pageWidth / 2,
      204,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Downloads the Monthly Payslip Summary Ledger as a Landscape PDF
 */
export function downloadPayrollSummaryLandscapePdf(
  payslips: Payslip[],
  cycle: PayrollCycle
): void {
  const doc = generatePayrollSummaryLandscapePdf(payslips, cycle);
  const cleanCycle = cycle.monthYear.replace(/\s+/g, '_');
  const filename = `GHS_Essikado_Payslip_Summary_LANDSCAPE_${cleanCycle}_${cycle.id}.pdf`;
  doc.save(filename);
}

