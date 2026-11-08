/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  TemporalStaff,
  PayrollCycle,
  Payslip,
  AuditLogEntry,
  ShiftSummary,
  JobCategory,
} from './types/payroll';
import {
  INITIAL_USERS,
  INITIAL_STAFF,
  INITIAL_CYCLES,
  INITIAL_PAYSLIPS,
  INITIAL_AUDIT_LOGS,
  INITIAL_JOB_CATEGORIES,
  buildPayslipForStaff,
} from './data/initialData';
import { computeTemporalStaffPay, generateSecurityHash } from './utils/taxCalculator';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { PayrollManager } from './components/PayrollManager';
import { StaffDirectory } from './components/StaffDirectory';
import { VerificationTool } from './components/VerificationTool';
import { StaffSelfService } from './components/StaffSelfService';
import { AuditTrail } from './components/AuditTrail';
import { PayslipViewerModal } from './components/PayslipViewerModal';
import { BatchPdfModal } from './components/BatchPdfModal';
import { UserManagementModal } from './components/UserManagementModal';
import { JobCategoriesModal } from './components/JobCategoriesModal';

import {
  saveStaffRosterSecurely,
  loadStaffRosterSecurely,
  saveUsersSecurely,
  loadUsersSecurely,
  saveJobCategoriesSecurely,
  loadJobCategoriesSecurely,
} from './utils/secureStorage';

import {
  syncStaffWithFirestore,
  loadStaffFromFirestore,
  deleteStaffFromFirestore,
  syncJobCategoriesWithFirestore,
  loadJobCategoriesFromFirestore,
  syncUsersWithFirestore,
  loadUsersFromFirestore,
  syncPayrollCyclesWithFirestore,
  loadPayrollCyclesFromFirestore,
  syncPayslipsWithFirestore,
  loadPayslipsFromFirestore,
  addAuditLogToFirestore,
  loadAuditLogsFromFirestore,
  testConnection,
} from './firebase/config';

export default function App() {
  // Authentication & RBAC state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USERS[0]); // Default to Super Admin for immediate rich view
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data State with secure persistence
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsersSecurely(INITIAL_USERS));
  const [categories, setCategories] = useState<JobCategory[]>(() => loadJobCategoriesSecurely(INITIAL_JOB_CATEGORIES));
  const [staffList, setStaffList] = useState<TemporalStaff[]>(() => loadStaffRosterSecurely(INITIAL_STAFF));
  const [cycles, setCycles] = useState<PayrollCycle[]>(INITIAL_CYCLES);
  const [selectedCycleId, setSelectedCycleId] = useState<string>(INITIAL_CYCLES[0].id);
  const [payslips, setPayslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Modals & Inspection State
  const [activePayslipModal, setActivePayslipModal] = useState<Payslip | null>(null);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);
  const [prefilledVerifierSerial, setPrefilledVerifierSerial] = useState<string>('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Firestore Synchronizer on Boot
  useEffect(() => {
    let mounted = true;
    async function initFirestore() {
      try {
        const isConnected = await testConnection();
        if (mounted) setIsFirestoreConnected(isConnected);

        const [cloudStaff, cloudCategories, cloudUsers, cloudCycles, cloudPayslips, cloudLogs] =
          await Promise.all([
            loadStaffFromFirestore(),
            loadJobCategoriesFromFirestore(),
            loadUsersFromFirestore(),
            loadPayrollCyclesFromFirestore(),
            loadPayslipsFromFirestore(),
            loadAuditLogsFromFirestore(),
          ]);

        if (!mounted) return;

        if (cloudStaff && cloudStaff.length > 0) {
          setStaffList(cloudStaff);
          saveStaffRosterSecurely(cloudStaff);
        } else {
          syncStaffWithFirestore(staffList);
        }

        if (cloudCategories && cloudCategories.length > 0) {
          setCategories(cloudCategories);
          saveJobCategoriesSecurely(cloudCategories);
        } else {
          syncJobCategoriesWithFirestore(categories);
        }

        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers);
          saveUsersSecurely(cloudUsers);
        } else {
          syncUsersWithFirestore(users);
        }

        if (cloudCycles && cloudCycles.length > 0) {
          setCycles(cloudCycles);
        } else {
          syncPayrollCyclesWithFirestore(cycles);
        }

        if (cloudPayslips && cloudPayslips.length > 0) {
          setPayslips(cloudPayslips);
        } else {
          syncPayslipsWithFirestore(payslips);
        }

        if (cloudLogs && cloudLogs.length > 0) {
          setAuditLogs(cloudLogs);
        }
      } catch (e) {
        console.warn('Firebase initial synchronization info:', e);
      }
    }

    initFirestore();
    return () => {
      mounted = false;
    };
  }, []);

  // Audit Log helper with Firestore & Vault Persistence
  const addAuditEntry = (action: string, details: string) => {
    if (!currentUser) return;
    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT`;
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
    addAuditLogToFirestore(newEntry);
  };

  // Staff Management Handlers with Secure Vault Persistence & Cloud Firestore
  const handleAddStaff = (newStaff: TemporalStaff) => {
    const updated = [newStaff, ...staffList];
    setStaffList(updated);
    saveStaffRosterSecurely(updated);
    syncStaffWithFirestore(updated);
    addAuditEntry(
      'STAFF_ENROLLED',
      `Enrolled new temporal staff member: ${newStaff.fullName} (${newStaff.staffId}) in ${newStaff.department}. Base: GH₵ ${newStaff.standardMonthlyRate.toFixed(2)}, Contract: ${newStaff.contractDurationMonths}m (${newStaff.contractType})`
    );
  };

  const handleUpdateStaff = (updatedStaff: TemporalStaff) => {
    const updatedList = staffList.map((s) => (s.id === updatedStaff.id ? updatedStaff : s));
    setStaffList(updatedList);
    saveStaffRosterSecurely(updatedList);
    syncStaffWithFirestore(updatedList);

    // If staff details (salary/allowances/name/status) changed, update any draft cycles
    setPayslips((prev) => {
      const updatedPayslips = prev.map((p) => {
        if (p.staffId === updatedStaff.staffId && !p.isLocked) {
          const customAllowances: { description: string; amount: number }[] = [];
          if (updatedStaff.allowances?.riskAllowance) {
            customAllowances.push({
              description: 'Clinical Infection & Risk Subsidy',
              amount: updatedStaff.allowances.riskAllowance,
            });
          }
          if (updatedStaff.allowances?.transportAllowance) {
            customAllowances.push({
              description: 'Local Commuting & Transport Subsidy',
              amount: updatedStaff.allowances.transportAllowance,
            });
          }
          const pay = computeTemporalStaffPay(updatedStaff, p.shifts, customAllowances, []);
          return {
            ...p,
            staffName: updatedStaff.fullName,
            cadre: updatedStaff.cadre,
            department: updatedStaff.department,
            grossPay: pay.grossPay,
            netPay: pay.netPay,
            totalTaxable: pay.totalTaxable,
            graTaxDeduction: pay.graTaxDeduction,
            welfareDeduction: pay.welfareDeduction,
            totalDeductions: pay.totalDeductions,
            earnings: pay.earnings,
            deductions: pay.deductions,
          };
        }
        return p;
      });
      syncPayslipsWithFirestore(updatedPayslips);
      return updatedPayslips;
    });

    addAuditEntry(
      'STAFF_UPDATED',
      `Updated profile for ${updatedStaff.fullName} (${updatedStaff.staffId}). Base: GH₵ ${updatedStaff.standardMonthlyRate}, Status: ${updatedStaff.status}, Contract: ${updatedStaff.contractStartDate} to ${updatedStaff.contractEndDate}.`
    );
  };

  const handleDeleteStaff = (staffId: string) => {
    const staff = staffList.find((s) => s.id === staffId);
    const updatedList = staffList.filter((s) => s.id !== staffId);
    setStaffList(updatedList);
    saveStaffRosterSecurely(updatedList);
    deleteStaffFromFirestore(staffId);

    if (staff) {
      addAuditEntry(
        'STAFF_DELETED',
        `De-registered and permanently removed temporal staff record for ${staff.fullName} (${staff.staffId})`
      );
    }
  };

  // User Management Handlers (Admin RBAC & Cloud Firestore)
  const handleAddUser = (newUser: UserAccount) => {
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsersSecurely(updated);
    syncUsersWithFirestore(updated);
    addAuditEntry(
      'USER_CREATED',
      `Admin provisioned user account: ${newUser.fullName} (${newUser.username}) with role [${newUser.role.toUpperCase()}] for ${newUser.department}.`
    );
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    saveUsersSecurely(updated);
    syncUsersWithFirestore(updated);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    addAuditEntry(
      'USER_UPDATED',
      `Updated user account: ${updatedUser.fullName} (${updatedUser.username}) - Role: [${updatedUser.role.toUpperCase()}].`
    );
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    saveUsersSecurely(updated);
    syncUsersWithFirestore(updated);
    if (target) {
      addAuditEntry(
        'USER_DELETED',
        `Revoked and removed system user account: ${target.fullName} (${target.username}) - [${target.role}].`
      );
    }
  };

  // Job Categories (Cadres & Pay Grade) Handlers
  const handleAddCategory = (newCategory: JobCategory) => {
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveJobCategoriesSecurely(updated);
    syncJobCategoriesWithFirestore(updated);
    addAuditEntry(
      'JOB_CATEGORY_CREATED',
      `Created new job cadre: ${newCategory.name} (${newCategory.department}) with standard base pay GH₵ ${newCategory.defaultMonthlyRate.toFixed(2)}.`
    );
  };

  const handleUpdateCategory = (updatedCategory: JobCategory) => {
    const updated = categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c));
    setCategories(updated);
    saveJobCategoriesSecurely(updated);
    syncJobCategoriesWithFirestore(updated);
    addAuditEntry(
      'JOB_CATEGORY_UPDATED',
      `Updated salary benchmarks and risk subsidies for cadre: ${updatedCategory.name} (${updatedCategory.department}).`
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    saveJobCategoriesSecurely(updated);
    syncJobCategoriesWithFirestore(updated);
    if (cat) {
      addAuditEntry(
        'JOB_CATEGORY_DELETED',
        `Removed job cadre classification: ${cat.name}.`
      );
    }
  };

  // Staff Count per Cadre / Category
  const staffCountPerCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = staffList.filter((s) => s.cadre === cat.name).length;
    return acc;
  }, {} as Record<string, number>);

  // Payroll Lifecycle Handlers
  const handleUpdatePayrollStatus = (cycleId: string, newStatus: any, notes?: string) => {
    setCycles((prev) => {
      const updated = prev.map((c) =>
        c.id === cycleId
          ? {
              ...c,
              status: newStatus,
              approvedBy: newStatus === 'Final Approved' ? currentUser?.fullName : c.approvedBy,
              approvedAt: newStatus === 'Final Approved' ? new Date().toISOString() : c.approvedAt,
              auditedBy: newStatus === 'Audit Approved' ? currentUser?.fullName : c.auditedBy,
              auditedAt: newStatus === 'Audit Approved' ? new Date().toISOString() : c.auditedAt,
              notes: notes || c.notes,
            }
          : c
      );
      syncPayrollCyclesWithFirestore(updated);
      return updated;
    });

    const cycle = cycles.find((c) => c.id === cycleId);
    addAuditEntry(
      `CYCLE_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      `${cycle?.monthYear} cycle status moved to ${newStatus}. ${notes || ''}`
    );
  };

  const handleSaveStaffShifts = (
    staffId: string,
    cycleId: string,
    shifts: ShiftSummary
  ) => {
    const staff = staffList.find((s) => s.staffId === staffId);
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!staff || !cycle) return;

    setPayslips((prev) => {
      const updated = prev.map((p) => {
        if (p.staffId === staffId && p.payrollCycleId === cycleId) {
          // Recompute
          const customAllowances: { description: string; amount: number }[] = [];
          if (['Emergency & Casualty', 'Labour Ward & Maternity', 'Clinical Laboratory'].includes(staff.department)) {
            customAllowances.push({
              description: 'Clinical Infection & Risk Subsidy',
              amount: 150,
            });
          }
          customAllowances.push({
            description: 'Local Commuting & Transport Subsidy',
            amount: 100,
          });

          const pay = computeTemporalStaffPay(staff, shifts, customAllowances, []);
          const securityHash = generateSecurityHash({
            serialNo: p.payslipSerialNo,
            staffId: staff.staffId,
            month: cycle.monthYear,
            netPay: pay.netPay,
            ghanaCard: staff.ghanaCardNo,
          });

          return {
            ...p,
            shifts,
            earnings: pay.earnings,
            deductions: pay.deductions,
            grossPay: pay.grossPay,
            totalTaxable: pay.totalTaxable,
            graTaxDeduction: pay.graTaxDeduction,
            ssnitEmployeeDeduction: pay.ssnitEmployeeDeduction,
            welfareDeduction: pay.welfareDeduction,
            otherDeductions: pay.otherDeductions,
            totalDeductions: pay.totalDeductions,
            netPay: pay.netPay,
            securityHash,
          };
        }
        return p;
      });
      syncPayslipsWithFirestore(updated);
      return updated;
    });

    addAuditEntry(
      'SHIFTS_MODIFIED',
      `Modified duty logs for ${staff.fullName} in ${cycle.monthYear}: ${shifts.normalDaysWorked} days, ${shifts.nightShiftsWorked} nights.`
    );
  };

  const handleCreateCycle = (newCycle: PayrollCycle) => {
    const updatedCycles = [newCycle, ...cycles];
    setCycles(updatedCycles);
    setSelectedCycleId(newCycle.id);
    syncPayrollCyclesWithFirestore(updatedCycles);

    // Generate initial draft payslips for all active temporal staff
    const newCyclePayslips = staffList.map((staff, idx) => {
      const defaultShifts: ShiftSummary = {
        normalDaysWorked: 21,
        nightShiftsWorked: 4,
        emergencyCallsWorked: 2,
        holidayOrWeekendShifts: 1,
      };
      return buildPayslipForStaff(staff, newCycle, defaultShifts, idx + 1);
    });

    const updatedPayslips = [...newCyclePayslips, ...payslips];
    setPayslips(updatedPayslips);
    syncPayslipsWithFirestore(updatedPayslips);

    addAuditEntry(
      'CYCLE_CREATED',
      `Initialized new payroll cycle for ${newCycle.monthYear} with ${staffList.length} temporal staff.`
    );
  };

  const handleRecomputePayslips = (cycleId: string) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return;
    addAuditEntry(
      'PAYSLIPS_RECOMPUTED',
      `Triggered payroll recalculation across all staff for ${cycle.monthYear}.`
    );
  };

  const handleOpenVerifierForSerial = (serialNo: string) => {
    setPrefilledVerifierSerial(serialNo);
    setActiveTab('verifier');
  };

  // If user is not logged in, render the official GHS Authentication Portal
  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'staff') {
            setActiveTab('staff_portal');
          } else {
            setActiveTab('dashboard');
          }
          addAuditEntry('USER_LOGIN', `User signed into portal with role ${user.role}`);
        }}
        availableUsers={users}
      />
    );
  }

  const currentCycleObject = cycles.find((c) => c.id === selectedCycleId) || cycles[0];
  const activeCyclePayslips = payslips.filter((p) => p.payrollCycleId === currentCycleObject?.id);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-emerald-800 selection:text-white">
      <div>
        {/* Navigation bar with role badge & fast switcher */}
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => {
            addAuditEntry('USER_LOGOUT', 'User signed out from session');
            setCurrentUser(null);
          }}
          onSwitchUser={(user) => {
            setCurrentUser(user);
            addAuditEntry('ROLE_SWITCH', `Switched active session to ${user.fullName} (${user.role})`);
          }}
          availableUsers={users}
          onOpenUserManagementModal={() => setIsUserModalOpen(true)}
          onOpenJobCategoriesModal={() => setIsCategoryModalOpen(true)}
          isFirestoreConnected={isFirestoreConnected}
        />

        {/* View Switcher based on Active Tab & Role */}
        <main className="pb-12">
          {activeTab === 'dashboard' && currentUser.role !== 'staff' && (
            <Dashboard
              currentUser={currentUser}
              cycles={cycles}
              payslips={payslips}
              staffList={staffList}
              auditLogs={auditLogs}
              onNavigateTab={setActiveTab}
              onViewPayslip={setActivePayslipModal}
              onOpenBatchExport={() => setIsBatchExportOpen(true)}
            />
          )}

          {activeTab === 'payroll' && currentUser.role !== 'staff' && (
            <PayrollManager
              cycles={cycles}
              selectedCycleId={selectedCycleId}
              onSelectCycle={setSelectedCycleId}
              payslips={payslips}
              staffList={staffList}
              currentUser={currentUser}
              onViewPayslip={setActivePayslipModal}
              onOpenBatchExport={() => setIsBatchExportOpen(true)}
              onUpdatePayrollStatus={handleUpdatePayrollStatus}
              onRecomputePayslips={handleRecomputePayslips}
              onSaveStaffShifts={handleSaveStaffShifts}
              onCreateCycle={handleCreateCycle}
            />
          )}

          {activeTab === 'staff_roster' && currentUser.role !== 'staff' && (
            <StaffDirectory
              staffList={staffList}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
              userRole={currentUser.role}
              categories={categories}
              onOpenJobCategoriesModal={() => setIsCategoryModalOpen(true)}
              onOpenUserManagementModal={() => setIsUserModalOpen(true)}
            />
          )}

          {activeTab === 'verifier' && (
            <VerificationTool
              payslips={payslips}
              initialSerial={prefilledVerifierSerial}
              onViewPayslip={setActivePayslipModal}
            />
          )}

          {activeTab === 'audit_trail' && (currentUser.role === 'super_admin' || currentUser.role === 'auditor') && (
            <AuditTrail
              logs={auditLogs}
              currentUserRole={currentUser.role}
            />
          )}

          {activeTab === 'staff_portal' && (
            <StaffSelfService
              currentUser={currentUser}
              staffRecord={staffList.find(
                (s) =>
                  s.staffId === currentUser.staffId ||
                  s.fullName.toLowerCase() === currentUser.fullName.toLowerCase()
              )}
              payslips={payslips}
              onViewPayslip={setActivePayslipModal}
            />
          )}
        </main>
      </div>

      {/* Payslip Viewer Modal */}
      {activePayslipModal && (
        <PayslipViewerModal
          payslip={activePayslipModal}
          isOpen={!!activePayslipModal}
          onClose={() => setActivePayslipModal(null)}
          onVerifyInApp={handleOpenVerifierForSerial}
        />
      )}

      {/* Batch Export Modal */}
      {isBatchExportOpen && (
        <BatchPdfModal
          isOpen={isBatchExportOpen}
          onClose={() => setIsBatchExportOpen(false)}
          payslips={activeCyclePayslips}
          cycleName={currentCycleObject?.monthYear || 'Current'}
          cycle={currentCycleObject}
        />
      )}

      {/* User Management (Admin RBAC) Modal */}
      {isUserModalOpen && (
        <UserManagementModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          users={users}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          currentUserId={currentUser.id}
        />
      )}

      {/* Job Categories & Cadres Management Modal */}
      {isCategoryModalOpen && (
        <JobCategoriesModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          staffCountPerCategory={staffCountPerCategory}
        />
      )}

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-emerald-800">GHANA HEALTH SERVICE</span>
            <span>•</span>
            <span>Essikado Hospital, Sekondi-Takoradi</span>
          </div>
          <div>
            Western Regional Health Directorate • Temporal Staff Electronic Payroll • Cloud Firestore
          </div>
          <div className="text-[11px] text-slate-400">
            Compliant with Ghana Revenue Authority (GRA) Withholding Tax & Data Protection Act 2012 • Project: seraphic-autumn-8kpm1
          </div>
        </div>
      </footer>
    </div>
  );
}
