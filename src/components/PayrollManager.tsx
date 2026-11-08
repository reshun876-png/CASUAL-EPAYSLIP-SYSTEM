import React, { useState } from 'react';
import {
  PayrollCycle,
  Payslip,
  TemporalStaff,
  UserAccount,
  UserRole,
  ShiftSummary,
} from '../types/payroll';
import { formatGHS } from '../utils/numberToWords';
import { downloadSinglePayslipPdf, downloadPayrollSummaryLandscapePdf } from '../utils/pdfGenerator';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Edit,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Filter,
  Plus,
  Lock,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface PayrollManagerProps {
  cycles: PayrollCycle[];
  selectedCycleId: string;
  onSelectCycle: (cycleId: string) => void;
  payslips: Payslip[];
  staffList: TemporalStaff[];
  currentUser: UserAccount;
  onViewPayslip: (payslip: Payslip) => void;
  onOpenBatchExport: () => void;
  onUpdatePayrollStatus: (cycleId: string, newStatus: any, notes?: string) => void;
  onRecomputePayslips: (cycleId: string) => void;
  onSaveStaffShifts: (staffId: string, cycleId: string, shifts: ShiftSummary) => void;
  onCreateCycle: (newCycle: PayrollCycle) => void;
}

export const PayrollManager: React.FC<PayrollManagerProps> = ({
  cycles,
  selectedCycleId,
  onSelectCycle,
  payslips,
  staffList,
  currentUser,
  onViewPayslip,
  onOpenBatchExport,
  onUpdatePayrollStatus,
  onRecomputePayslips,
  onSaveStaffShifts,
  onCreateCycle,
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [editingShiftsStaff, setEditingShiftsStaff] = useState<Payslip | null>(null);
  const [shiftForm, setShiftForm] = useState<ShiftSummary>({
    normalDaysWorked: 22,
    nightShiftsWorked: 4,
    emergencyCallsWorked: 2,
    holidayOrWeekendShifts: 1,
  });
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [newCycleMonth, setNewCycleMonth] = useState('December 2026');
  const [newCycleId, setNewCycleId] = useState('2026-12');

  const currentCycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0];
  const cyclePayslips = payslips.filter((p) => p.payrollCycleId === currentCycle?.id);

  const filteredPayslips = cyclePayslips.filter((p) => {
    const matchesSearch =
      p.staffName.toLowerCase().includes(search.toLowerCase()) ||
      p.staffId.toLowerCase().includes(search.toLowerCase()) ||
      p.payslipSerialNo.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || p.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['all', ...Array.from(new Set(staffList.map((s) => s.department)))];

  // RBAC permissions for workflow
  const canRecompute = currentUser.role === 'super_admin' || currentUser.role === 'hr_payroll';
  const canSupervisorSign = currentUser.role === 'super_admin' || currentUser.role === 'supervisor';
  const canAuditCertify = currentUser.role === 'super_admin' || currentUser.role === 'auditor';
  const canFinalApprove = currentUser.role === 'super_admin';

  const handleOpenShiftEdit = (payslip: Payslip) => {
    setEditingShiftsStaff(payslip);
    setShiftForm({ ...payslip.shifts });
  };

  const handleSaveShifts = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShiftsStaff) return;
    onSaveStaffShifts(editingShiftsStaff.staffId, editingShiftsStaff.payrollCycleId, shiftForm);
    setEditingShiftsStaff(null);
  };

  const handleCreateNewCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cycle: PayrollCycle = {
      id: newCycleId,
      monthYear: newCycleMonth,
      periodStart: `${newCycleId}-01`,
      periodEnd: `${newCycleId}-30`,
      paymentDate: `${newCycleId}-27`,
      status: 'Draft',
      totalStaffCount: staffList.length,
      totalGrossAmount: 0,
      totalTaxAmount: 0,
      totalWelfareAmount: 0,
      totalNetAmount: 0,
      notes: `Temporal monthly payroll initialized for ${newCycleMonth}`,
    };
    onCreateCycle(cycle);
    setIsNewCycleModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Header & Cycle Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Ghana Health Service • Essikado Hospital</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-7 h-7 text-emerald-800" />
            <span>Temporal Staff Monthly Payroll Processing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculate shift earnings, statutory GRA withholding tax, generate electronic payslips, and certify disbursements.
          </p>
        </div>

        {/* Cycle Switcher & New Cycle Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 pl-2">Cycle:</span>
            <select
              value={selectedCycleId}
              onChange={(e) => onSelectCycle(e.target.value)}
              className="border-none bg-transparent text-xs font-bold text-slate-900 focus:ring-0 cursor-pointer pr-4"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.monthYear} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {canRecompute && (
            <button
              onClick={() => setIsNewCycleModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Cycle</span>
            </button>
          )}
        </div>
      </div>

      {/* Cycle Status & Approval Stepper */}
      {currentCycle && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Cycle Workflow State:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-black text-slate-900">{currentCycle.monthYear}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {currentCycle.status}
                </span>
              </div>
            </div>

            {/* Quick Actions depending on Role */}
            <div className="flex flex-wrap items-center gap-2">
              {currentCycle.status === 'Draft' && canSupervisorSign && (
                <button
                  onClick={() =>
                    onUpdatePayrollStatus(
                      currentCycle.id,
                      'Supervisor Review',
                      'Shifts and attendance logs certified by Ward/OPD Supervisor.'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Supervisor Sign-Off</span>
                </button>
              )}

              {currentCycle.status === 'Supervisor Review' && canAuditCertify && (
                <button
                  onClick={() =>
                    onUpdatePayrollStatus(
                      currentCycle.id,
                      'Audit Approved',
                      'Internal audit pre-audit passed. GRA WHT calculations compliant.'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Internal Audit Certify</span>
                </button>
              )}

              {currentCycle.status === 'Audit Approved' && canFinalApprove && (
                <button
                  onClick={() =>
                    onUpdatePayrollStatus(
                      currentCycle.id,
                      'Final Approved',
                      'Medical Superintendent final executive authorization granted.'
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-300" />
                  <span>Executive Final Approval</span>
                </button>
              )}

              {/* Landscape Payslip Summary PDF Button */}
              <button
                onClick={() => downloadPayrollSummaryLandscapePdf(cyclePayslips, currentCycle)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#005A36] to-[#006B3F] hover:from-[#004D25] hover:to-[#005A36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="Download official Master Payslip Summary Ledger in Landscape orientation"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Payslip Summary (Landscape PDF)</span>
              </button>

              {/* Batch PDF Download Button */}
              <button
                onClick={onOpenBatchExport}
                className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Batch PDF Export ({cyclePayslips.length})</span>
              </button>
            </div>
          </div>

          {/* Stepper Graphic */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            
            <div className={`p-3 rounded-xl border ${
              ['Draft', 'Supervisor Review', 'Audit Approved', 'Final Approved', 'Disbursed'].includes(currentCycle.status)
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>1. Shift & Data Prep</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">HR logs hours & duty allowances</p>
            </div>

            <div className={`p-3 rounded-xl border ${
              ['Supervisor Review', 'Audit Approved', 'Final Approved', 'Disbursed'].includes(currentCycle.status)
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>2. Supervisor Review</span>
                {['Supervisor Review', 'Audit Approved', 'Final Approved', 'Disbursed'].includes(currentCycle.status) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Nurse In-Charge verifies shifts</p>
            </div>

            <div className={`p-3 rounded-xl border ${
              ['Audit Approved', 'Final Approved', 'Disbursed'].includes(currentCycle.status)
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>3. Internal Audit</span>
                {['Audit Approved', 'Final Approved', 'Disbursed'].includes(currentCycle.status) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">GRA Tax & payroll verification</p>
            </div>

            <div className={`p-3 rounded-xl border ${
              ['Final Approved', 'Disbursed'].includes(currentCycle.status)
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>4. Med Supt Approval</span>
                {['Final Approved', 'Disbursed'].includes(currentCycle.status) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Executive sign-off & payslips issued</p>
            </div>

          </div>

          {/* Cycle Financial Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Enrolled Staff</span>
              <div className="text-xl font-black text-slate-900">{cyclePayslips.length} Temporal Staff</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Gross Payroll</span>
              <div className="text-xl font-mono font-black text-slate-900">
                {formatGHS(cyclePayslips.reduce((s, p) => s + p.grossPay, 0))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total GRA Tax</span>
              <div className="text-xl font-mono font-black text-red-700">
                {formatGHS(cyclePayslips.reduce((s, p) => s + p.graTaxDeduction, 0))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Net Disbursed</span>
              <div className="text-xl font-mono font-black text-emerald-800">
                {formatGHS(cyclePayslips.reduce((s, p) => s + p.netPay, 0))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff, serial number, ID..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          >
            <option value="all">All Departments</option>
            {departments.filter(d => d !== 'all').map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Serial & Staff</th>
                <th className="py-3 px-4">Cadre / Department</th>
                <th className="py-3 px-4">Duty & Shift Log</th>
                <th className="py-3 px-4">Gross Pay</th>
                <th className="py-3 px-4">GRA Tax</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayslips.map((payslip) => (
                <tr key={payslip.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{payslip.staffName}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-emerald-800 font-bold text-[11px]">
                        {payslip.staffId}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        {payslip.payslipSerialNo}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{payslip.cadre}</div>
                    <div className="text-slate-500 text-[11px]">{payslip.department}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-700 font-medium">
                      {payslip.shifts.normalDaysWorked} Days • {payslip.shifts.nightShiftsWorked} Nights
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Calls: {payslip.shifts.emergencyCallsWorked} • Weekend: {payslip.shifts.holidayOrWeekendShifts}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {formatGHS(payslip.grossPay)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-red-600 font-medium">
                    {formatGHS(payslip.graTaxDeduction)}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-sm">
                    {formatGHS(payslip.netPay)}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {canRecompute && currentCycle.status !== 'Final Approved' && (
                      <button
                        onClick={() => handleOpenShiftEdit(payslip)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                        title="Edit shifts and allowances"
                      >
                        Adjust Shifts
                      </button>
                    )}

                    <button
                      onClick={() => onViewPayslip(payslip)}
                      className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition"
                    >
                      View
                    </button>

                    <button
                      onClick={() => downloadSinglePayslipPdf(payslip)}
                      className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition"
                      title="Download PDF"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayslips.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No payslips found for this cycle or search term.
          </div>
        )}
      </div>

      {/* Adjust Shifts Modal */}
      {editingShiftsStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#004D25] to-[#005A36] text-white p-5">
              <h3 className="font-extrabold text-base">Adjust Monthly Shifts & Duties</h3>
              <p className="text-xs text-emerald-200">
                {editingShiftsStaff.staffName} ({editingShiftsStaff.staffId})
              </p>
            </div>

            <form onSubmit={handleSaveShifts} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Standard Duty Days Worked:
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={shiftForm.normalDaysWorked}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, normalDaysWorked: Number(e.target.value) })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Night Duty Shifts:
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={shiftForm.nightShiftsWorked}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, nightShiftsWorked: Number(e.target.value) })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Emergency / Call-In Duties:
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={shiftForm.emergencyCallsWorked}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, emergencyCallsWorked: Number(e.target.value) })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Weekend / Public Holiday Shifts:
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={shiftForm.holidayOrWeekendShifts}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, holidayOrWeekendShifts: Number(e.target.value) })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingShiftsStaff(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md"
                >
                  Save & Recompute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start New Cycle Modal */}
      {isNewCycleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5">
              <h3 className="font-extrabold text-base">Initialize New Monthly Payroll Cycle</h3>
              <p className="text-xs text-slate-400">Ghana Health Service - Essikado Hospital</p>
            </div>

            <form onSubmit={handleCreateNewCycleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cycle Name (Month & Year):</label>
                <input
                  type="text"
                  required
                  value={newCycleMonth}
                  onChange={(e) => setNewCycleMonth(e.target.value)}
                  placeholder="e.g. December 2026"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cycle Code (YYYY-MM):</label>
                <input
                  type="text"
                  required
                  value={newCycleId}
                  onChange={(e) => setNewCycleId(e.target.value)}
                  placeholder="2026-12"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                This will enroll all active {staffList.length} temporal staff into the new draft cycle ready for shift data entry.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewCycleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md"
                >
                  Initialize Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
