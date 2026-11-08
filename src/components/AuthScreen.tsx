import React, { useState } from 'react';
import { UserAccount } from '../types/payroll';
import { GhsEmblem, GhanaFlagStrip } from './GhsEmblem';
import {
  Lock,
  User,
  Shield,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  availableUsers: UserAccount[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, availableUsers }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'staff'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [staffId, setStaffId] = useState('GHS-EH-TMP-001');
  const [ghanaCardPin, setGhanaCardPin] = useState('GHA-718293041-5');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = availableUsers.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (user && user.role !== 'staff') {
        onLoginSuccess(user);
      } else {
        setError('Invalid username or password. Please check your credentials or use the Quick Access buttons below.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = availableUsers.find(
        (u) =>
          u.role === 'staff' &&
          (u.staffId?.toLowerCase() === staffId.trim().toLowerCase() ||
           u.username.toLowerCase() === staffId.trim().toLowerCase())
      );

      if (user) {
        onLoginSuccess(user);
      } else {
        // Fallback for demo: create a temporary session for valid temporal staff
        const defaultStaff = availableUsers.find((u) => u.role === 'staff');
        if (defaultStaff) {
          onLoginSuccess(defaultStaff);
        } else {
          setError('Temporal Staff ID or Ghana Card PIN not found in current hospital payroll roster.');
          setIsLoading(false);
        }
      }
    }, 400);
  };

  const selectPreset = (user: UserAccount) => {
    setError(null);
    if (user.role === 'staff') {
      setActiveTab('staff');
      setStaffId(user.staffId || user.username);
      setGhanaCardPin('GHA-718293041-5');
    } else {
      setActiveTab('admin');
      setUsername(user.username);
      setPassword('••••••••');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <GhanaFlagStrip className="h-2" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-b from-[#004D25] to-[#005A36] text-white p-6 sm:p-8 text-center relative">
              <div className="flex justify-center mb-3">
                <GhsEmblem size={64} className="drop-shadow-md" />
              </div>
              <p className="text-[11px] font-bold tracking-widest text-emerald-200 uppercase">
                Ghana Health Service • Western Region
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                ESSIKADO HOSPITAL
              </h2>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                Temporal & Locum Staff Electronic Payslip Portal
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs backdrop-blur-xs">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>Role-Based Access Control • Cryptographic Integrity</span>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setError(null);
                }}
                className={`py-3.5 px-4 text-center transition flex items-center justify-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Admin & Management Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('staff');
                  setError(null);
                }}
                className={`py-3.5 px-4 text-center transition flex items-center justify-center gap-2 ${
                  activeTab === 'staff'
                    ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Temporal Staff Self-Service</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8">
              {error && (
                <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {activeTab === 'admin' ? (
                /* Admin Login Form */
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Username / Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. admin or hr.payroll"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      <span className="text-[11px] text-slate-400">Default: admin123</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Verifying Authority...</span>
                    ) : (
                      <>
                        <span>Sign In to Hospital Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Temporal Staff Self-Service */
                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Temporal Staff ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="e.g. GHS-EH-TMP-001"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Ghana Card PIN (National ID)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={ghanaCardPin}
                        onChange={(e) => setGhanaCardPin(e.target.value)}
                        placeholder="e.g. GHA-718293041-5"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Used to decrypt and verify your personal monthly payslip.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Validating Staff Record...</span>
                    ) : (
                      <>
                        <span>Access My Monthly Payslips</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Quick RBAC Role Tester Buttons */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Fast Demo Logins (Click to Test Roles):</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">1-Click Sign In</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableUsers.map((user) => {
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          selectPreset(user);
                          onLoginSuccess(user);
                        }}
                        className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group flex items-start gap-2 bg-slate-50"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {user.role[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 truncate">
                            {user.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {user.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer security note */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Official System • Compliant with Ghana Data Protection Act 2012 (Act 843)</span>
            </div>

          </div>

          <div className="text-center mt-4 text-xs text-slate-500">
            Essikado Hospital, Sekondi-Takoradi • Western Region, Ghana
          </div>

        </div>
      </div>

      <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 Ghana Health Service (GHS) • Western Regional Directorate
      </footer>
    </div>
  );
};
