import React, { useState } from 'react';
import { Payslip, PayrollCycle } from '../types/payroll';
import { downloadBatchPayslipsPdf, downloadPayrollSummaryLandscapePdf } from '../utils/pdfGenerator';
import {
  FileCheck2,
  Download,
  X,
  CheckCircle2,
  Filter,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

interface BatchPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslips: Payslip[];
  cycleName: string;
  cycle?: PayrollCycle;
}

export const BatchPdfModal: React.FC<BatchPdfModalProps> = ({
  isOpen,
  onClose,
  payslips,
  cycleName,
  cycle,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const departments = ['all', ...Array.from(new Set(payslips.map((p) => p.department)))];

  const filteredPayslips =
    selectedDept === 'all'
      ? payslips
      : payslips.filter((p) => p.department === selectedDept);

  const handleStartExport = () => {
    setIsProcessing(true);
    setCompleted(false);

    setTimeout(() => {
      downloadBatchPayslipsPdf(filteredPayslips, cycleName, (current, total) => {
        setProgress({ current, total });
      });

      setIsProcessing(false);
      setCompleted(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004D25] to-[#005A36] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileCheck2 className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-extrabold text-base">Batch Electronic Payslip PDF Generator</h3>
              <p className="text-xs text-emerald-200">{cycleName} Temporal Payroll Cycle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              <span>Filter by Department:</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCompleted(false);
              }}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            >
              <option value="all">All Hospital Departments ({payslips.length} Staff)</option>
              {departments.filter(d => d !== 'all').map((dept) => (
                <option key={dept} value={dept}>
                  {dept} ({payslips.filter(p => p.department === dept).length} staff)
                </option>
              ))}
            </select>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Selected Staff Count:</span>
              <strong className="text-slate-900 text-sm">{filteredPayslips.length} staff</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Net Payout:</span>
              <strong className="text-emerald-700 text-sm">
                GH₵ {filteredPayslips.reduce((sum, p) => sum + p.netPay, 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Document Format:</span>
              <span className="text-slate-700 font-medium">Standard A4 Multi-page Official GHS PDF</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Security:</span>
              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Individual QR verification fingerprints
              </span>
            </div>
          </div>

          {/* Progress / Status */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Generating secure PDFs...</span>
                <span>{progress ? `${progress.current} / ${progress.total}` : 'Compiling'}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{
                    width: progress ? `${(progress.current / progress.total) * 100}%` : '50%',
                  }}
                />
              </div>
            </div>
          )}

          {completed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-900 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Consolidated batch PDF document generated and downloaded successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Landscape Master Summary PDF Button */}
            <button
              type="button"
              onClick={() => {
                const targetCycle: PayrollCycle = cycle || {
                  id: payslips[0]?.payrollCycleId || '2026-10',
                  monthYear: cycleName,
                  periodStart: '2026-10-01',
                  periodEnd: '2026-10-31',
                  paymentDate: '2026-10-28',
                  status: 'Final Approved',
                  totalStaffCount: filteredPayslips.length,
                  totalGrossAmount: filteredPayslips.reduce((s, p) => s + p.grossPay, 0),
                  totalTaxAmount: filteredPayslips.reduce((s, p) => s + p.graTaxDeduction, 0),
                  totalWelfareAmount: 0,
                  totalNetAmount: filteredPayslips.reduce((s, p) => s + p.netPay, 0),
                };
                downloadPayrollSummaryLandscapePdf(filteredPayslips, targetCycle);
              }}
              disabled={filteredPayslips.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#005A36] to-[#006B3F] hover:from-[#004D25] hover:to-[#005A36] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Download Payslip Summary Ledger (Landscape PDF)</span>
            </button>

            {/* Individual Slips Batch PDF Button */}
            <button
              type="button"
              onClick={handleStartExport}
              disabled={isProcessing || filteredPayslips.length === 0}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>
                {isProcessing
                  ? 'Compiling Slips...'
                  : `Download All Individual Payslips (Portrait PDF - ${filteredPayslips.length} Staff)`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
