import React, { useState } from 'react';
import { AuditLogEntry, UserRole } from '../types/payroll';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  FileCheck2,
  Calendar,
  User,
  Building2,
  Download,
} from 'lucide-react';

interface AuditTrailProps {
  logs: AuditLogEntry[];
  currentUserRole: UserRole;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs, currentUserRole }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportAuditLog = () => {
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,Timestamp,User,Role,Action,Details\n' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `GHS_Essikado_Payroll_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Governance & Compliance
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-800" />
            <span>Hospital Payroll Audit Trail & Access Logs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed activity log of payroll creations, approvals, and payslip generation.
          </p>
        </div>

        <button
          onClick={exportAuditLog}
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, officer, or transaction details..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin (Medical Supt)</option>
            <option value="hr_payroll">HR & Payroll Officer</option>
            <option value="supervisor">Ward Supervisor</option>
            <option value="auditor">Internal Auditor</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (GMT)</th>
                <th className="py-3 px-4">Authorized User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Details & Ledger Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {log.userRole.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800 text-[11px] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No audit log entries found matching criteria.
          </div>
        )}
      </div>

    </div>
  );
};
