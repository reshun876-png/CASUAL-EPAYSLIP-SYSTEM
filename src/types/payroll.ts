export type UserRole = 'super_admin' | 'hr_payroll' | 'supervisor' | 'auditor' | 'staff';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  title: string;
  staffId?: string; // If role is 'staff'
}

export interface JobCategory {
  id: string;
  name: string;
  department: string;
  defaultMonthlyRate: number; // Base monthly in GH₵
  defaultDailyRate: number; // Daily rate in GH₵
  defaultNightShiftRate: number; // Night shift in GH₵
  defaultEmergencyCallRate: number; // Emergency call in GH₵
  defaultRiskAllowance: number; // Risk subsidy in GH₵
  description?: string;
  createdAt?: string;
}

export type CadreType =
  | 'Locum Medical Officer'
  | 'Temporal Staff Nurse'
  | 'Temporal Midwife'
  | 'Locum Pharmacist'
  | 'Temporal Healthcare Assistant (HCA)'
  | 'Temporal Lab Technician'
  | 'Temporal Records Officer'
  | 'Temporal Ward Orderly'
  | 'Temporal Security / Sanitation'
  | string;

export type PaymentMethod = 'Bank Account' | 'MTN Mobile Money' | 'Telecel Cash' | 'AT Money';

export type ContractType =
  | 'Renewable Locum Contract'
  | 'Fixed-Term Temporal'
  | 'Casual Service Agreement'
  | 'Emergency Reliever';

export type StaffStatus = 'Active' | 'Inactive' | 'On Leave' | 'Suspended' | 'Contract Ended';

export interface StaffAllowances {
  nightShiftRate: number; // in GH₵ per shift
  emergencyCallRate: number; // in GH₵ per call
  riskAllowance: number; // monthly infection/risk subsidy in GH₵
  transportAllowance: number; // monthly commuting subsidy in GH₵
  specialDutyAllowance: number; // weekend/extra duty allowance in GH₵
  otherAllowanceDescription?: string;
  otherAllowanceAmount?: number;
}

export interface TemporalStaff {
  id: string;
  staffId: string; // e.g. GHS-EH-TMP-014 (Employee ID)
  fullName: string;
  ghanaCardNo: string; // e.g. GHA-724819031-2
  ssnitNo?: string;
  cadre: CadreType;
  department: string;
  phone: string;
  email: string;
  dateJoined: string;
  
  // Contract Duration & Terms
  contractStartDate: string; // e.g. '2026-01-01'
  contractEndDate: string; // e.g. '2026-12-31'
  contractDurationMonths: number; // e.g. 6 or 12
  contractType: ContractType;
  status: StaffStatus;
  deactivationReason?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;

  // Compensation & Base Salary
  standardMonthlyRate: number; // Base monthly salary in GH₵
  baseDailyRate: number; // Daily locum rate in GH₵
  
  // Allowances Breakdown
  allowances: StaffAllowances;
  
  // Convenience aliases for backward compatibility
  nightShiftRate: number;
  emergencyCallRate: number;

  // Deductions & Institutional Settings
  welfareContribution: number; // in GH₵
  taxTreatment: 'Withholding Tax (5%)' | 'Withholding Tax (7.5%)' | 'Standard PAYE' | 'Exempt';

  // Payment Channels
  paymentMethod: PaymentMethod;
  bankName?: string;
  accountNumber?: string;
  momoNumber?: string;

  // Security & Data Integrity
  recordIntegrityHash: string; // Cryptographic integrity checksum
  lastModified?: string;
  lastModifiedBy?: string;
}

export interface ShiftSummary {
  normalDaysWorked: number;
  nightShiftsWorked: number;
  emergencyCallsWorked: number;
  holidayOrWeekendShifts: number;
}

export interface PayslipItem {
  description: string;
  amount: number; // in GH₵
  type: 'earning' | 'deduction';
  isTaxable?: boolean;
}

export interface Payslip {
  id: string;
  payslipSerialNo: string; // e.g. EH-PS-2026-10-0042
  staffId: string;
  payrollCycleId: string; // e.g. 2026-10
  monthYear: string; // e.g. "October 2026"
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  
  // Staff Snapshot at time of generation
  staffName: string;
  cadre: string;
  department: string;
  ghanaCardNo: string;
  ssnitNo?: string;
  paymentMethod: PaymentMethod;
  bankOrMomoDetails: string;
  
  // Shift Logs
  shifts: ShiftSummary;
  
  // Breakdown
  earnings: PayslipItem[];
  deductions: PayslipItem[];
  
  // Computed Totals
  grossPay: number;
  totalTaxable: number;
  graTaxDeduction: number;
  ssnitEmployeeDeduction: number;
  welfareDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  
  // Year To Date
  ytdGross: number;
  ytdTax: number;
  ytdNet: number;
  
  // Security & Integrity
  securityHash: string; // SHA-256 style fingerprint
  verificationCode: string;
  generatedAt: string;
  generatedBy: string;
  isLocked: boolean;
  isApproved: boolean;
  notes?: string;
}

export type PayrollStatus = 'Draft' | 'Supervisor Review' | 'Audit Approved' | 'Final Approved' | 'Disbursed';

export interface PayrollCycle {
  id: string; // e.g. "2026-10"
  monthYear: string; // "October 2026"
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  status: PayrollStatus;
  totalStaffCount: number;
  totalGrossAmount: number;
  totalTaxAmount: number;
  totalWelfareAmount: number;
  totalNetAmount: number;
  approvedBy?: string;
  approvedAt?: string;
  auditedBy?: string;
  auditedAt?: string;
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}
