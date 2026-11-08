import React, { useState } from 'react';
import { Payslip } from '../types/payroll';
import { GhsEmblem, GhanaFlagStrip } from './GhsEmblem';
import { formatGHS } from '../utils/numberToWords';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Lock,
  ExternalLink,
  QrCode,
} from 'lucide-react';

interface VerificationToolProps {
  payslips: Payslip[];
  initialSerial?: string;
  onViewPayslip?: (payslip: Payslip) => void;
}

export const VerificationTool: React.FC<VerificationToolProps> = ({
  payslips,
  initialSerial = '',
  onViewPayslip,
}) => {
  const [query, setQuery] = useState(initialSerial);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Payslip | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const clean = query.trim().toUpperCase();
    const match = payslips.find(
      (p) =>
        p.payslipSerialNo.toUpperCase() === clean ||
        p.securityHash.toUpperCase() === clean ||
        p.verificationCode.toUpperCase() === clean ||
        p.staffId.toUpperCase() === clean
    );

    setResult(match || null);
    setSearched(true);
  };

  const handleQuickPick = (serial: string) => {
    setQuery(serial);
    const match = payslips.find((p) => p.payslipSerialNo === serial);
    setResult(match || null);
    setSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#004D25] to-[#005A36] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <GhsEmblem size={64} className="shrink-0" />
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
              Ghana Health Service • Western Regional Directorate
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
              Electronic Payslip Authenticity Validator
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Verify the authenticity and tamper-proof cryptographic fingerprint of temporal staff payslips issued by Essikado Hospital, Sekondi-Takoradi.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Enter Payslip Serial Number, Security Fingerprint, or Verification Code:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. EH-PS-2026-10-0001 or GHS-EH-..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 uppercase"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Verify Record</span>
              </button>
            </div>
          </div>

          {/* Quick test pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
            <span className="font-semibold">Sample Issued Serials:</span>
            {payslips.slice(0, 3).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickPick(p.payslipSerialNo)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 font-mono text-[11px] transition"
              >
                {p.payslipSerialNo}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Verification Result Display */}
      {searched && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {result ? (
            /* Successful Verification */
            <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-600 overflow-hidden">
              <GhanaFlagStrip className="h-2" />
              
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Status Callout */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center space-x-3 text-emerald-900 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                        Official Ledger Verification
                      </div>
                      <h3 className="text-xl font-black text-emerald-950">
                        GENUINE & OFFICIALLY ISSUED
                      </h3>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        This electronic payslip is registered in the official GHS Essikado Hospital payroll registry.
                      </p>
                    </div>
                  </div>

                  {onViewPayslip && (
                    <button
                      onClick={() => onViewPayslip(result)}
                      className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Official Document</span>
                    </button>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>Issuing Facility & Staff</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Institution:</span>
                        <strong className="text-slate-900">Ghana Health Service - Essikado Hospital</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Staff Name:</span>
                        <strong className="text-slate-900">{result.staffName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Staff ID:</span>
                        <span className="font-mono font-bold text-emerald-800">{result.staffId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cadre:</span>
                        <span className="text-slate-800 font-semibold">{result.cadre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Department:</span>
                        <span className="text-slate-700">{result.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span>Financial & Audit Record</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payroll Cycle:</span>
                        <strong className="text-slate-900">{result.monthYear}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Date:</span>
                        <strong className="text-slate-900">{result.paymentDate}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Net Take-Home Pay:</span>
                        <strong className="text-emerald-700 font-mono text-sm">
                          {formatGHS(result.netPay)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">GRA Tax Withheld:</span>
                        <span className="text-slate-700 font-mono">{formatGHS(result.graTaxDeduction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Disbursement Method:</span>
                        <span className="text-slate-800 font-semibold">{result.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Cryptographic Footprint Bar */}
                <div className="bg-slate-900 text-white rounded-xl p-4 font-mono text-xs space-y-1">
                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-slate-400">
                    <span>SECURITY HASH:</span>
                    <strong className="text-emerald-400">{result.securityHash}</strong>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-slate-400">
                    <span>VERIFICATION CODE:</span>
                    <span className="text-amber-300 font-bold">{result.verificationCode}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-slate-400">
                    <span>AUTHORIZED BY:</span>
                    <span className="text-white">Medical Superintendent & Head of Finance</span>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Failed Verification */
            <div className="bg-white rounded-2xl shadow-md border-2 border-red-400 p-6 sm:p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Document Record Not Verified
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  No registered temporal staff payslip was found matching the entered reference (<strong>{query}</strong>) in the Essikado Hospital ledger.
                </p>
              </div>
              <div className="text-xs text-slate-500 max-w-sm mx-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
                Please double check the Serial Number or Security Hash printed on the payslip. If this document was presented for a bank loan or employment verification, contact the Hospital Administration immediately.
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
