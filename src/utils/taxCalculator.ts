import { TemporalStaff, ShiftSummary, PayslipItem } from '../types/payroll';

/**
 * Calculates GRA PAYE Graduated Tax Bands for standard monthly employment in Ghana
 */
export function calculateGraduatedPAYE(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let remaining = taxableIncome;
  let totalTax = 0;

  // Band 1: First GH₵ 490 at 0%
  const b1 = Math.min(remaining, 490);
  remaining -= b1;

  // Band 2: Next GH₵ 110 at 5%
  if (remaining > 0) {
    const b2 = Math.min(remaining, 110);
    totalTax += b2 * 0.05;
    remaining -= b2;
  }

  // Band 3: Next GH₵ 130 at 10%
  if (remaining > 0) {
    const b3 = Math.min(remaining, 130);
    totalTax += b3 * 0.10;
    remaining -= b3;
  }

  // Band 4: Next GH₵ 3,166.67 at 17.5%
  if (remaining > 0) {
    const b4 = Math.min(remaining, 3166.67);
    totalTax += b4 * 0.175;
    remaining -= b4;
  }

  // Band 5: Next GH₵ 16,000 at 25%
  if (remaining > 0) {
    const b5 = Math.min(remaining, 16000);
    totalTax += b5 * 0.25;
    remaining -= b5;
  }

  // Band 6: Next GH₵ 30,520 at 30%
  if (remaining > 0) {
    const b6 = Math.min(remaining, 30520);
    totalTax += b6 * 0.30;
    remaining -= b6;
  }

  // Band 7: Exceeding at 35%
  if (remaining > 0) {
    totalTax += remaining * 0.35;
  }

  return Math.round(totalTax * 100) / 100;
}

/**
 * Computes complete gross earnings, deductions, and net pay for temporal staff
 */
export function computeTemporalStaffPay(
  staff: TemporalStaff,
  shifts: ShiftSummary,
  customAllowances: { description: string; amount: number }[] = [],
  customDeductions: { description: string; amount: number }[] = []
) {
  const earnings: PayslipItem[] = [];
  const deductions: PayslipItem[] = [];

  // 1. Basic Monthly / Daily Wage
  let basicPay = staff.standardMonthlyRate;
  if (staff.baseDailyRate > 0 && shifts.normalDaysWorked > 0 && staff.standardMonthlyRate === 0) {
    basicPay = staff.baseDailyRate * shifts.normalDaysWorked;
    earnings.push({
      description: `Basic Temporal Wage (${shifts.normalDaysWorked} days @ GH₵ ${staff.baseDailyRate.toFixed(2)})`,
      amount: basicPay,
      type: 'earning',
      isTaxable: true,
    });
  } else {
    earnings.push({
      description: `Basic Temporal Stipend (${shifts.normalDaysWorked} standard duty days)`,
      amount: basicPay,
      type: 'earning',
      isTaxable: true,
    });
  }

  // 2. Night Shift Allowance
  if (shifts.nightShiftsWorked > 0 && staff.nightShiftRate > 0) {
    const nightAllowance = shifts.nightShiftsWorked * staff.nightShiftRate;
    earnings.push({
      description: `Night Duty Allowance (${shifts.nightShiftsWorked} shifts @ GH₵ ${staff.nightShiftRate.toFixed(2)})`,
      amount: nightAllowance,
      type: 'earning',
      isTaxable: true,
    });
  }

  // 3. Emergency / Call-in Locum Allowance
  if (shifts.emergencyCallsWorked > 0 && staff.emergencyCallRate > 0) {
    const callAllowance = shifts.emergencyCallsWorked * staff.emergencyCallRate;
    earnings.push({
      description: `Emergency / Call-in Duty (${shifts.emergencyCallsWorked} calls @ GH₵ ${staff.emergencyCallRate.toFixed(2)})`,
      amount: callAllowance,
      type: 'earning',
      isTaxable: true,
    });
  }

  // 4. Weekend / Holiday Duty
  if (shifts.holidayOrWeekendShifts > 0) {
    const holidayRate = staff.baseDailyRate > 0 ? staff.baseDailyRate * 1.5 : 120;
    const weekendAllowance = shifts.holidayOrWeekendShifts * holidayRate;
    earnings.push({
      description: `Weekend / Public Holiday Premium (${shifts.holidayOrWeekendShifts} shifts)`,
      amount: weekendAllowance,
      type: 'earning',
      isTaxable: true,
    });
  }

  // 5. Custom / Additional Allowances (Risk, Commuting, etc.)
  for (const item of customAllowances) {
    if (item.amount > 0) {
      earnings.push({
        description: item.description,
        amount: item.amount,
        type: 'earning',
        isTaxable: true,
      });
    }
  }

  const grossPay = earnings.reduce((sum, item) => sum + item.amount, 0);

  // Deductions:
  // SSNIT (5.5%) if staff has registered SSNIT
  let ssnitEmployeeDeduction = 0;
  if (staff.ssnitNo && staff.ssnitNo.trim().length > 3) {
    ssnitEmployeeDeduction = Math.round(basicPay * 0.055 * 100) / 100;
    deductions.push({
      description: 'SSNIT Tier 1 Employee Contribution (5.5%)',
      amount: ssnitEmployeeDeduction,
      type: 'deduction',
    });
  }

  // Taxable Base (Gross less SSNIT)
  const taxableBase = Math.max(0, grossPay - ssnitEmployeeDeduction);

  // GRA Tax computation
  let graTaxDeduction = 0;
  if (staff.taxTreatment === 'Withholding Tax (5%)') {
    graTaxDeduction = Math.round(taxableBase * 0.05 * 100) / 100;
    deductions.push({
      description: 'GRA Withholding Tax (5% Casual/Locum WHT)',
      amount: graTaxDeduction,
      type: 'deduction',
    });
  } else if (staff.taxTreatment === 'Withholding Tax (7.5%)') {
    graTaxDeduction = Math.round(taxableBase * 0.075 * 100) / 100;
    deductions.push({
      description: 'GRA Withholding Tax (7.5% Contract WHT)',
      amount: graTaxDeduction,
      type: 'deduction',
    });
  } else if (staff.taxTreatment === 'Standard PAYE') {
    graTaxDeduction = calculateGraduatedPAYE(taxableBase);
    deductions.push({
      description: 'GRA PAYE Income Tax (Graduated)',
      amount: graTaxDeduction,
      type: 'deduction',
    });
  } else {
    // Exempt
    graTaxDeduction = 0;
  }

  // Hospital Welfare
  let welfareDeduction = 0;
  if (staff.welfareContribution > 0) {
    welfareDeduction = staff.welfareContribution;
    deductions.push({
      description: 'Hospital Temporal Staff Welfare Fund',
      amount: welfareDeduction,
      type: 'deduction',
    });
  }

  // Other custom deductions (Loan advance, union dues, ID/badge, etc.)
  let otherDeductions = 0;
  for (const item of customDeductions) {
    if (item.amount > 0) {
      deductions.push({
        description: item.description,
        amount: item.amount,
        type: 'deduction',
      });
      otherDeductions += item.amount;
    }
  }

  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = Math.max(0, Math.round((grossPay - totalDeductions) * 100) / 100);

  return {
    earnings,
    deductions,
    grossPay,
    totalTaxable: taxableBase,
    graTaxDeduction,
    ssnitEmployeeDeduction,
    welfareDeduction,
    otherDeductions,
    totalDeductions,
    netPay,
  };
}

/**
 * Creates a tamper-evident SHA-like verification fingerprint
 */
export function generateSecurityHash(payload: {
  serialNo: string;
  staffId: string;
  month: string;
  netPay: number;
  ghanaCard: string;
}): string {
  const str = `${payload.serialNo}|${payload.staffId}|${payload.month}|${payload.netPay.toFixed(2)}|${payload.ghanaCard}|GHS-ESSIKADO-AUTH-SECRET-2026`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const part2 = ((Math.abs(hash) * 31) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const part3 = ((Math.abs(hash) * 97) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `GHS-EH-${hex.slice(0, 4)}-${part2.slice(0, 4)}-${part3.slice(0, 4)}`;
}
