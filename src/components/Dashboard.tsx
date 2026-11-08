import React from 'react';
import {
  PayrollCycle,
  Payslip,
  TemporalStaff,
  UserAccount,
  AuditLogEntry,
} from '../types/payroll';
import { GhsEmblem, GhanaFlagStrip } from './GhsEmblem';
import { formatGHS } from '../utils/numberToWords';
import {
  Users,
  Calculator,
  ShieldCheck,
  FileCheck2,
  Building2,
  TrendingUp,
  Clock,
  ArrowRight,
  Download,
  AlertCircle,
  CheckCircle2,
  History,
} from 'lucide-react';

interface DashboardProps {
  currentUser: UserAccount;
  cycles: PayrollCycle[];
  payslips: Payslip[];
  staffList: TemporalStaff[];
  auditLogs: AuditLogEntry[];
  onNavigateTab: (tabId: string) => void;
  onViewPayslip: (payslip: Payslip) => void;
  onOpenBatchExport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  cycles,
  payslips,
  staffList,
  auditLogs,
  onNavigateTab,
  onViewPayslip,
  onOpenBatchExport,
}) => {
  const activeCycle = cycles[0];
  const activePayslips = payslips.filter((p) => p.payrollCycleId === activeCycle?.id);

  const totalGross = activePayslips.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNet = activePayslips.reduce((sum, p) => sum + p.netPay, 0);
  const totalTax = activePayslips.reduce((sum, p) => sum + p.graTaxDeduction, 0);
  const totalWelfare = activePayslips.reduce((sum, p) => sum + p.welfareDeduction, 0);

  // Cadre grouping
  const cadreCounts = staffList.reduce((acc, s) => {
    acc[s.cadre] = (acc[s.cadre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#004D25] via-[#005A36] to-[#006B3F] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <GhsEmblem size={64} className="shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-200 uppercase tracking-widest">
                <span>Ghana Health Service</span>
                <span>•</span>
                <span>Essikado Hospital</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Temporal Staff Electronic Payslip System
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                Official payroll management portal for locum doctors, temporal nurses, healthcare assistants, and contract health personnel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('staff_roster')}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Staff Management</span>
            </button>

            <button
              onClick={() => onNavigateTab('payroll')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Manage Monthly Payroll</span>
            </button>

            <button
              onClick={onOpenBatchExport}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-xs transition flex items-center gap-2 border border-white/20"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Batch PDF Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Temporal Staff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Temporal Staff
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {staffList.length} <span className="text-xs font-semibold text-slate-500">Personnel</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All rostered for duty</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Net Disbursement */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Monthly Net Disbursement
            </span>
            <div className="text-2xl font-black font-mono text-emerald-800 mt-1">
              {formatGHS(totalNet)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Period: {activeCycle?.monthYear}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* GRA Tax Withheld */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              GRA Tax Withheld (WHT)
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {formatGHS(totalTax)}
            </div>
            <p className="text-[11px] text-red-600 font-medium mt-1">
              Remitted to Ghana Revenue Authority
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Welfare Fund */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Hospital Welfare Fund
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {formatGHS(totalWelfare)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Temporal Staff Welfare Account
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Cycle & Cadre Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Payroll Runs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-800" />
                <span>Hospital Temporal Payroll Cycles</span>
              </h3>
              <p className="text-xs text-slate-500">Overview of recent monthly disbursement batches</p>
            </div>
            <button
              onClick={() => onNavigateTab('payroll')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>View All Cycles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {cycles.map((cycle) => (
              <div key={cycle.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{cycle.monthYear}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {cycle.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Period: {cycle.periodStart} to {cycle.periodEnd} • Disbursed: {cycle.paymentDate}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500">Net Outlay:</span>
                    <div className="font-mono font-bold text-emerald-800 text-base">
                      {formatGHS(cycle.totalNetAmount || totalNet)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <span>Staff Enrolled: <strong>{cycle.totalStaffCount}</strong></span>
                    <span>GRA Tax: <strong>{formatGHS(cycle.totalTaxAmount || totalTax)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateTab('payroll')}
                      className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Open Processing View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Cadre Distribution & Quick Actions */}
        <div className="space-y-6">
          
          {/* Cadres Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
              <span>Temporal Workforce Cadres</span>
              <span className="text-xs text-slate-500 font-normal">{staffList.length} total</span>
            </h3>

            <div className="space-y-2.5">
              {Object.entries(cadreCounts).map(([cadre, count]) => {
                const percentage = Math.round((count / staffList.length) * 100);
                return (
                  <div key={cadre} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{cadre}</span>
                      <strong className="text-slate-900 font-mono">{count}</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-700 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigateTab('staff_roster')}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Manage Staff Roster & Rates →
              </button>
            </div>
          </div>

          {/* Authenticity Quick Action Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Payslip Authenticity Validator</span>
            </div>
            <p className="text-xs text-emerald-800">
              Banks, loan providers, and staff can instantly verify any printed or digital payslip using its QR code or security hash.
            </p>
            <button
              onClick={() => onNavigateTab('verifier')}
              className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <span>Launch Verification Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Recent Sample Payslips Ready for Download */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-800" />
              <span>Current Cycle Electronic Payslips ({activeCycle?.monthYear})</span>
            </h3>
            <p className="text-xs text-slate-500">Preview or download individual high-security PDF documents</p>
          </div>
          <button
            onClick={onOpenBatchExport}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Batch Download All PDFs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Serial & Staff</th>
                <th className="py-3 px-4">Cadre</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Gross Pay</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4">Verification Hash</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activePayslips.slice(0, 5).map((payslip) => (
                <tr key={payslip.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{payslip.staffName}</div>
                    <div className="font-mono text-emerald-800 text-[10px]">{payslip.payslipSerialNo}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{payslip.cadre}</td>
                  <td className="py-3 px-4 text-slate-600">{payslip.department}</td>
                  <td className="py-3 px-4 font-mono font-medium">{formatGHS(payslip.grossPay)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800 text-sm">
                    {formatGHS(payslip.netPay)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[10px]">{payslip.securityHash}</td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onViewPayslip(payslip)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onViewPayslip(payslip)}
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
