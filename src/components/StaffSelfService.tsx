import React from 'react';
import { UserAccount, TemporalStaff, Payslip } from '../types/payroll';
import { GhsEmblem, GhanaFlagStrip } from './GhsEmblem';
import { formatGHS, formatCedisInWords } from '../utils/numberToWords';
import { downloadSinglePayslipPdf } from '../utils/pdfGenerator';
import {
  FileText,
  Download,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Building2,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface StaffSelfServiceProps {
  currentUser: UserAccount;
  staffRecord?: TemporalStaff;
  payslips: Payslip[];
  onViewPayslip: (payslip: Payslip) => void;
}

export const StaffSelfService: React.FC<StaffSelfServiceProps> = ({
  currentUser,
  staffRecord,
  payslips,
  onViewPayslip,
}) => {
  // Find payslips belonging to this staff member
  const staffPayslips = payslips.filter(
    (p) =>
      p.staffId === currentUser.staffId ||
      p.staffName.toLowerCase() === currentUser.fullName.toLowerCase()
  );

  const latestPayslip = staffPayslips[0] || payslips[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#004D25] via-[#005A36] to-[#006B3F] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <GhsEmblem size={56} className="shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
                Essikado Hospital • Temporal Staff Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                Welcome, {currentUser.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-emerald-100">
                <span className="bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
                  {currentUser.title || staffRecord?.cadre || 'Temporal Staff'}
                </span>
                <span>•</span>
                <span>ID: <strong className="font-mono text-white">{currentUser.staffId || 'GHS-EH-TMP-001'}</strong></span>
                <span>•</span>
                <span>Dept: {staffRecord?.department || 'Clinical Services'}</span>
              </div>
            </div>
          </div>

          {latestPayslip && (
            <button
              onClick={() => downloadSinglePayslipPdf(latestPayslip)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Latest PDF ({latestPayslip.monthYear})</span>
            </button>
          )}
        </div>
      </div>

      {/* Latest Month Highlight Card */}
      {latestPayslip && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                Latest Electronic Payslip: {latestPayslip.monthYear}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Disbursed
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewPayslip(latestPayslip)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>View Full Payslip</span>
              </button>

              <button
                onClick={() => downloadSinglePayslipPdf(latestPayslip)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Download</span>
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Net Pay Box */}
            <div className="md:col-span-1 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-xl p-5 border border-emerald-200 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Net Monthly Take-Home Pay
                </p>
                <div className="text-3xl font-black text-emerald-950 mt-1">
                  {formatGHS(latestPayslip.netPay)}
                </div>
                <p className="text-xs text-emerald-800 italic mt-1 font-medium">
                  {formatCedisInWords(latestPayslip.netPay)}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-200/80 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Pay:</span>
                  <strong className="text-slate-900">{formatGHS(latestPayslip.grossPay)}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Deductions:</span>
                  <strong className="text-red-700">{formatGHS(latestPayslip.totalDeductions)}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GRA Tax:</span>
                  <span className="font-medium text-slate-800">{formatGHS(latestPayslip.graTaxDeduction)}</span>
                </div>
              </div>
            </div>

            {/* Shift & Duty Summary */}
            <div className="md:col-span-1 bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Verified Shifts in {latestPayslip.monthYear}</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Regular Duty Days:</span>
                    <strong className="text-slate-900">{latestPayslip.shifts.normalDaysWorked} days</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Night Shifts:</span>
                    <strong className="text-slate-900">{latestPayslip.shifts.nightShiftsWorked} shifts</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Emergency Call-ins:</span>
                    <strong className="text-slate-900">{latestPayslip.shifts.emergencyCallsWorked} calls</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Weekend / Holiday:</span>
                    <strong className="text-slate-900">{latestPayslip.shifts.holidayOrWeekendShifts} shifts</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                Verified by Department In-Charge & Hospital Payroll
              </div>
            </div>

            {/* Disbursement Details */}
            <div className="md:col-span-1 bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Payment Channel Details</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Payment Method:</span>
                    <strong className="text-slate-900">{latestPayslip.paymentMethod}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Disbursed To:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">{latestPayslip.bankOrMomoDetails}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Date:</span>
                    <span className="text-slate-700">{latestPayslip.paymentDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Security Fingerprint:</span>
                    <span className="font-mono text-[10px] text-emerald-800 break-all">{latestPayslip.securityHash}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authorized by Medical Superintendent</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Historical Payslips Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>Monthly Payslip History Archive</span>
          </h3>
          <span className="text-xs text-slate-500">
            {staffPayslips.length} electronic records on file
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffPayslips.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.monthYear}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                    {p.payslipSerialNo}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {formatGHS(p.grossPay)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-red-600">
                    {formatGHS(p.totalDeductions)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">
                    {formatGHS(p.netPay)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Disbursed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => onViewPayslip(p)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => downloadSinglePayslipPdf(p)}
                      className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
