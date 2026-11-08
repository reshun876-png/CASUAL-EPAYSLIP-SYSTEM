import React, { useState } from 'react';
import { Payslip } from '../types/payroll';
import { GhsEmblem, GhanaFlagStrip } from './GhsEmblem';
import { formatCedisInWords, formatGHS } from '../utils/numberToWords';
import { createVerificationQrDataUrl } from '../utils/qrHelper';
import { downloadSinglePayslipPdf } from '../utils/pdfGenerator';
import {
  Download,
  Printer,
  ShieldCheck,
  Lock,
  X,
  FileCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';

interface PayslipViewerModalProps {
  payslip: Payslip;
  isOpen: boolean;
  onClose: () => void;
  onVerifyInApp?: (serialNo: string) => void;
}

export const PayslipViewerModal: React.FC<PayslipViewerModalProps> = ({
  payslip,
  isOpen,
  onClose,
  onVerifyInApp,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [enablePasswordLock, setEnablePasswordLock] = useState(false);
  const [customPassword, setCustomPassword] = useState('');

  if (!isOpen) return null;

  const qrDataUrl = createVerificationQrDataUrl(
    `https://ghs.gov.gh/verify/essikado?serial=${payslip.payslipSerialNo}&hash=${payslip.securityHash}&staff=${payslip.staffId}&net=${payslip.netPay}`
  );

  const handleCopyHash = () => {
    navigator.clipboard.writeText(payslip.securityHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const password = enablePasswordLock
        ? customPassword || payslip.ghanaCardNo.slice(-4)
        : undefined;
      downloadSinglePayslipPdf(payslip, password);
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-slate-300 print:border-none print:shadow-none print:max-w-none print:max-h-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center space-x-2.5">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Official Electronic Payslip Viewer
              </h3>
              <p className="text-[11px] text-slate-400">
                Serial: <span className="font-mono text-emerald-300">{payslip.payslipSerialNo}</span> • Period: {payslip.monthYear}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Download PDF Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Options Ribbon (Hidden on print) */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden shrink-0">
          <div className="flex items-center space-x-2 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">Cryptographically Certified:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 text-[11px]">
              {payslip.securityHash}
            </span>
            <button
              onClick={handleCopyHash}
              className="text-emerald-700 hover:text-emerald-900 ml-1 inline-flex items-center gap-1"
              title="Copy security hash"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {onVerifyInApp && (
              <button
                onClick={() => {
                  onClose();
                  onVerifyInApp(payslip.payslipSerialNo);
                }}
                className="text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-1"
              >
                <span>Verify in Ledger</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Document Body (Printable Page Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 print:p-0 print:bg-white">
          <div
            id="printable-payslip"
            className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 relative overflow-hidden print:border-none print:shadow-none print:p-4"
          >
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-25deg]">
              <div className="text-center font-black tracking-widest text-slate-900 text-6xl leading-tight uppercase">
                Ghana Health Service<br />Essikado Hospital
              </div>
            </div>

            {/* Top National Colors Ribbon */}
            <GhanaFlagStrip className="h-1.5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6" />

            {/* Hospital Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-emerald-800 pb-4 mb-4 gap-4">
              <div className="flex items-center space-x-4">
                <GhsEmblem size={56} className="shrink-0" />
                <div>
                  <div className="text-[11px] font-extrabold text-[#006B3F] uppercase tracking-wider">
                    Ghana Health Service • Western Region
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    ESSIKADO HOSPITAL
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    P.O. Box 243, Essikado, Sekondi-Takoradi • Tel: +233 (0) 31 204 6120
                  </p>
                </div>
              </div>

              {/* Title Badge */}
              <div className="text-center sm:text-right">
                <div className="inline-block bg-emerald-900 text-white font-extrabold text-xs px-3 py-1 rounded shadow-xs tracking-wide">
                  ELECTRONIC PAYSLIP
                </div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  TEMPORAL & LOCUM STAFF
                </div>
                <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                  Period: {payslip.monthYear}
                </div>
              </div>
            </div>

            {/* Payslip Meta strip */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md mb-4 font-mono">
              <div>
                <span className="text-slate-400">Serial No:</span>{' '}
                <strong className="text-slate-800">{payslip.payslipSerialNo}</strong>
              </div>
              <div>
                <span className="text-slate-400">Payment Date:</span>{' '}
                <strong className="text-slate-800">{payslip.paymentDate}</strong>
              </div>
              <div>
                <span className="text-slate-400">Generated:</span>{' '}
                <strong className="text-slate-800">
                  {new Date(payslip.generatedAt).toLocaleDateString()}
                </strong>
              </div>
            </div>

            {/* Staff Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/40 border border-emerald-200/60 rounded-xl p-4 mb-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Staff Name:</span>
                  <span className="font-extrabold text-slate-900">{payslip.staffName}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Staff ID:</span>
                  <span className="font-mono font-bold text-emerald-800">{payslip.staffId}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Cadre / Post:</span>
                  <span className="font-semibold text-slate-800">{payslip.cadre}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Department:</span>
                  <span className="font-medium text-slate-700">{payslip.department}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Ghana Card PIN:</span>
                  <span className="font-mono font-bold text-slate-800">{payslip.ghanaCardNo}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">SSNIT Number:</span>
                  <span className="font-mono text-slate-700">{payslip.ssnitNo || 'N/A (Exempt)'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Payment Channel:</span>
                  <span className="font-semibold text-slate-800">{payslip.paymentMethod}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Account/Wallet:</span>
                  <span className="font-mono text-slate-700 truncate">{payslip.bankOrMomoDetails}</span>
                </div>
              </div>
            </div>

            {/* Shift & Attendance Summary Bar */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mb-4 text-xs flex flex-wrap items-center justify-between text-indigo-950 font-medium">
              <span className="font-bold text-indigo-800">Shift Log:</span>
              <span>Duty Days: <strong>{payslip.shifts.normalDaysWorked}</strong></span>
              <span>•</span>
              <span>Night Shifts: <strong>{payslip.shifts.nightShiftsWorked}</strong></span>
              <span>•</span>
              <span>Emergency Calls: <strong>{payslip.shifts.emergencyCallsWorked}</strong></span>
              <span>•</span>
              <span>Weekend/Holiday: <strong>{payslip.shifts.holidayOrWeekendShifts}</strong></span>
            </div>

            {/* Financial Breakdown Table: Earnings vs Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              
              {/* Earnings Column */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-[#006B3F] text-white px-3 py-2 text-xs font-bold flex justify-between">
                  <span>EARNINGS & ALLOWANCES</span>
                  <span>AMOUNT (GH₵)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {payslip.earnings.map((e, idx) => (
                    <div key={idx} className="px-3 py-2 flex justify-between items-center hover:bg-slate-50">
                      <span className="text-slate-700 pr-2">{e.description}</span>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        {e.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-50 px-3 py-2 border-t border-emerald-200 flex justify-between text-xs font-bold text-emerald-900">
                  <span>GROSS EARNINGS</span>
                  <span className="font-mono text-sm">{formatGHS(payslip.grossPay)}</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-red-800 text-white px-3 py-2 text-xs font-bold flex justify-between">
                  <span>STATUTORY & LOCAL DEDUCTIONS</span>
                  <span>AMOUNT (GH₵)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {payslip.deductions.map((d, idx) => (
                    <div key={idx} className="px-3 py-2 flex justify-between items-center hover:bg-slate-50">
                      <span className="text-slate-700 pr-2">{d.description}</span>
                      <span className="font-mono font-bold text-red-700 shrink-0">
                        {d.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 px-3 py-2 border-t border-red-200 flex justify-between text-xs font-bold text-red-900">
                  <span>TOTAL DEDUCTIONS</span>
                  <span className="font-mono text-sm">{formatGHS(payslip.totalDeductions)}</span>
                </div>
              </div>

            </div>

            {/* Net Pay Callout Banner */}
            <div className="bg-gradient-to-r from-[#004D25] to-[#006B3F] text-white rounded-xl p-4 sm:p-5 mb-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-extrabold text-[#FCD116]">
                  Net Monthly Take-Home Pay
                </p>
                <div className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                  {formatGHS(payslip.netPay)}
                </div>
                <p className="text-xs text-emerald-100 italic mt-1">
                  {formatCedisInWords(payslip.netPay)}
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>DISBURSED VIA {payslip.paymentMethod.toUpperCase()}</span>
                </span>
                <p className="text-[11px] text-emerald-200 mt-1">
                  Tax Deducted: {formatGHS(payslip.graTaxDeduction)}
                </p>
              </div>
            </div>

            {/* YTD Record Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-5 text-[11px] text-slate-600 flex flex-wrap justify-between items-center gap-2">
              <span className="font-bold text-slate-700 uppercase">Year-To-Date (YTD) Summary:</span>
              <span>Gross YTD: <strong>{formatGHS(payslip.ytdGross)}</strong></span>
              <span>•</span>
              <span>GRA Tax YTD: <strong>{formatGHS(payslip.ytdTax)}</strong></span>
              <span>•</span>
              <span>Net Paid YTD: <strong>{formatGHS(payslip.ytdNet)}</strong></span>
            </div>

            {/* Authenticity Verification Box (QR + Cryptographic hash) */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3.5">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Authenticity Verification QR Code"
                    className="w-16 h-16 rounded border border-slate-300 bg-white p-1 shrink-0"
                  />
                )}
                <div className="text-xs">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Cryptographic Verification Seal</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scan QR code or use the hospital validator to confirm document authenticity.
                  </p>
                  <div className="font-mono text-[10px] text-slate-700 mt-1">
                    Hash: <strong>{payslip.securityHash}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <div>Verification Code:</div>
                <div className="font-mono font-bold text-slate-900 text-xs">
                  {payslip.verificationCode}
                </div>
              </div>
            </div>

            {/* Signatures & Official Hospital Rubber Stamp */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-slate-200 text-center items-end">
              
              {/* HR / Finance Signature */}
              <div>
                <div className="font-serif italic text-xs text-slate-800 mb-1">
                  Faustina Baidoo
                </div>
                <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-700">
                  Mrs. Faustina Baidoo
                </div>
                <div className="text-[9px] text-slate-500">
                  Head of HR & Payroll
                </div>
              </div>

              {/* Hospital Seal Stamp */}
              <div className="flex justify-center">
                <div className="border-2 border-[#006B3F] rounded-lg p-1.5 text-center max-w-[130px] rotate-[-2deg] bg-white shadow-xs">
                  <div className="text-[8px] font-extrabold text-[#006B3F] leading-tight">
                    GHANA HEALTH SERVICE
                  </div>
                  <div className="text-[9px] font-black text-slate-900">
                    ESSIKADO HOSPITAL
                  </div>
                  <div className="text-[7px] font-bold text-red-700 border-y border-red-200 my-0.5 py-0.2">
                    ★ PAID & CERTIFIED ★
                  </div>
                  <div className="text-[7px] text-slate-500">
                    {payslip.paymentDate}
                  </div>
                </div>
              </div>

              {/* Medical Superintendent Signature */}
              <div>
                <div className="font-serif italic text-xs text-slate-800 mb-1">
                  Dr. E. K. Arhin
                </div>
                <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-700">
                  Dr. Emmanuel K. Arhin
                </div>
                <div className="text-[9px] text-slate-500">
                  Medical Superintendent
                </div>
              </div>

            </div>

            {/* Footer Notice */}
            <div className="text-center text-[9px] text-slate-400 mt-6 pt-2 border-t border-slate-100">
              Ghana Health Service • Essikado Hospital • Confidential Electronic Document • Act 843 Compliant
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
