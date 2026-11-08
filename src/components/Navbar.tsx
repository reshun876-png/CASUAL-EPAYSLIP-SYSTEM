import React from 'react';
import { UserAccount, UserRole } from '../types/payroll';
import { GhsEmblem, GhanaFlagStrip } from './GhsEmblem';
import {
  LayoutDashboard,
  Calculator,
  Users,
  FileCheck2,
  ShieldCheck,
  History,
  LogOut,
  UserCheck,
  ChevronDown,
  Building2,
  Lock,
  Layers,
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSwitchUser: (user: UserAccount) => void;
  availableUsers: UserAccount[];
  onOpenUserManagementModal?: () => void;
  onOpenJobCategoriesModal?: () => void;
  isFirestoreConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchUser,
  availableUsers,
  onOpenUserManagementModal,
  onOpenJobCategoriesModal,
  isFirestoreConnected = true,
}) => {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  // Role details mapping
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin (Med. Supt)', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'hr_payroll':
        return { label: 'HR & Payroll Officer', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'supervisor':
        return { label: 'Ward / Unit Supervisor', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'auditor':
        return { label: 'Internal Auditor', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'staff':
        return { label: 'Temporal Staff Portal', color: 'bg-teal-100 text-teal-800 border-teal-300' };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);

  // Role based navigation links
  const getNavItems = () => {
    if (currentUser.role === 'staff') {
      return [
        { id: 'staff_portal', label: 'My Payslips & Income', icon: FileCheck2 },
        { id: 'verifier', label: 'Verify Payslip Authenticity', icon: ShieldCheck },
      ];
    }

    const items = [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'payroll', label: 'Monthly Payroll Runs', icon: Calculator },
      { id: 'staff_roster', label: 'Staff Management', icon: Users },
      { id: 'verifier', label: 'Verify Payslip', icon: ShieldCheck },
    ];

    if (currentUser.role === 'super_admin' || currentUser.role === 'auditor') {
      items.push({ id: 'audit_trail', label: 'Audit & Compliance', icon: History });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <GhanaFlagStrip />
      
      {/* Top Banner with Hospital Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Hospital Crest & Title */}
          <div className="flex items-center space-x-3.5">
            <GhsEmblem size={44} className="shrink-0 drop-shadow-xs" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold tracking-widest text-[#006B3F] uppercase">
                  Ghana Health Service
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Western Regional Health Directorate
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 flex-wrap">
                <span>ESSIKADO HOSPITAL</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Temporal Staff Payroll
                </span>
                {isFirestoreConnected && (
                  <span
                    className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300"
                    title="Connected to Firebase Cloud Firestore (seraphic-autumn-8kpm1)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Firebase Live</span>
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* User profile & Fast Role Switcher */}
          <div className="flex items-center gap-2.5 justify-end">
            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 transition text-left"
                title="Switch role for demonstration"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-none mt-0.5 flex items-center gap-1">
                    <span className={`inline-block px-1.5 py-0.2 rounded border font-semibold ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Switcher Menu */}
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20">
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Active Role (RBAC Demo)
                      </p>
                    </div>
                    {availableUsers.map((u) => {
                      const badge = getRoleBadge(u.role);
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setShowRoleMenu(false);
                            if (u.role === 'staff') {
                              setActiveTab('staff_portal');
                            } else if (activeTab === 'staff_portal') {
                              setActiveTab('dashboard');
                            }
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                            isCurrent ? 'bg-emerald-50/60 font-medium' : ''
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">{u.fullName}</div>
                            <div className="text-[11px] text-slate-500">{u.title}</div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.color}`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </button>
                      );
                    })}
                    
                    {currentUser.role === 'super_admin' && (
                      <div className="mt-2 pt-2 border-t border-slate-100 px-2 space-y-1">
                        {onOpenUserManagementModal && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowRoleMenu(false);
                              onOpenUserManagementModal();
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <UserPlus className="w-3.5 h-3.5" />
                              Manage System Users
                            </span>
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">Admin</span>
                          </button>
                        )}
                        {onOpenJobCategoriesModal && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowRoleMenu(false);
                              onOpenJobCategoriesModal();
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5" />
                              Job Categories (Cadres)
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Rates</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Admin Quick-Action Badges for fast 1-click access */}
            {currentUser.role === 'super_admin' && (
              <div className="hidden lg:flex items-center space-x-1.5 border-l border-slate-200 pl-2.5">
                {onOpenUserManagementModal && (
                  <button
                    type="button"
                    onClick={onOpenUserManagementModal}
                    className="flex items-center space-x-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition"
                    title="Add or configure system users"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Users</span>
                  </button>
                )}
                {onOpenJobCategoriesModal && (
                  <button
                    type="button"
                    onClick={onOpenJobCategoriesModal}
                    className="flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition"
                    title="Configure job cadres and standard pay rates"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cadres</span>
                  </button>
                )}
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 transition"
              title="Log out of system"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
