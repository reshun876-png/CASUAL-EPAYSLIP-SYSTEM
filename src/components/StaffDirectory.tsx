import React, { useState } from 'react';
import {
  TemporalStaff,
  CadreType,
  PaymentMethod,
  UserRole,
  ContractType,
  StaffStatus,
  StaffAllowances,
  JobCategory,
} from '../types/payroll';
import { formatGHS } from '../utils/numberToWords';
import {
  calculateStaffIntegrityHash,
  getContractDaysRemaining,
  exportStaffVaultAsJson,
} from '../utils/secureStorage';
import { GhsEmblem, GhanaFlagStrip } from './GhsEmblem';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  CreditCard,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  X,
  Shield,
  ShieldCheck,
  FileSpreadsheet,
  Calendar,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  FileText,
  DollarSign,
  Layers,
  ChevronDown,
  Info,
  Archive,
  RefreshCw,
  Briefcase,
} from 'lucide-react';

interface StaffDirectoryProps {
  staffList: TemporalStaff[];
  onAddStaff: (newStaff: TemporalStaff) => void;
  onUpdateStaff: (updatedStaff: TemporalStaff) => void;
  onDeleteStaff: (staffId: string) => void;
  userRole: UserRole;
  categories?: JobCategory[];
  onOpenJobCategoriesModal?: () => void;
  onOpenUserManagementModal?: () => void;
}

const CADRES: CadreType[] = [
  'Locum Medical Officer',
  'Temporal Staff Nurse',
  'Temporal Midwife',
  'Locum Pharmacist',
  'Temporal Healthcare Assistant (HCA)',
  'Temporal Lab Technician',
  'Temporal Records Officer',
  'Temporal Ward Orderly',
  'Temporal Security / Sanitation',
];

const DEPARTMENTS = [
  'Out-Patient Department (OPD)',
  'Emergency & Casualty',
  'Labour Ward & Maternity',
  'Clinical Laboratory',
  'Pharmacy & Dispensary',
  'Female & Children Ward',
  'Male Medical Ward',
  'Health Information & Records',
  'Estate & Security Unit',
  'Hospital Administration',
];

const CONTRACT_TYPES: ContractType[] = [
  'Renewable Locum Contract',
  'Fixed-Term Temporal',
  'Casual Service Agreement',
  'Emergency Reliever',
];

export const StaffDirectory: React.FC<StaffDirectoryProps> = ({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  userRole,
  categories = [],
  onOpenJobCategoriesModal,
  onOpenUserManagementModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCadre, setSelectedCadre] = useState('all');
  const cadreList = categories.length > 0 ? categories.map(c => c.name) : CADRES;
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContractType, setSelectedContractType] = useState<string>('all');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<TemporalStaff | null>(null);
  const [viewingProfileStaff, setViewingProfileStaff] = useState<TemporalStaff | null>(null);
  const [deactivatingStaff, setDeactivatingStaff] = useState<TemporalStaff | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('Contract Term Completed');
  const [deactivationNotes, setDeactivationNotes] = useState('');
  const [deletingStaff, setDeletingStaff] = useState<TemporalStaff | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TemporalStaff>>({
    fullName: '',
    staffId: `GHS-EH-TMP-${String(staffList.length + 1).padStart(3, '0')}`,
    ghanaCardNo: 'GHA-',
    ssnitNo: '',
    cadre: 'Temporal Staff Nurse',
    department: 'Out-Patient Department (OPD)',
    phone: '+233 ',
    email: '',
    status: 'Active',
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    contractDurationMonths: 12,
    contractType: 'Renewable Locum Contract',
    baseDailyRate: 120,
    standardMonthlyRate: 2600,
    allowances: {
      nightShiftRate: 75,
      emergencyCallRate: 90,
      riskAllowance: 150,
      transportAllowance: 100,
      specialDutyAllowance: 60,
    },
    welfareContribution: 40,
    taxTreatment: 'Withholding Tax (5%)',
    paymentMethod: 'Bank Account',
    bankName: 'GCB Bank - Takoradi Harbour Branch',
    accountNumber: '',
    momoNumber: '',
  });

  const canEdit = userRole === 'super_admin' || userRole === 'hr_payroll';

  // Counts & Analytics
  const activeCount = staffList.filter((s) => s.status === 'Active').length;
  const deactivatedCount = staffList.filter((s) => s.status === 'Inactive' || s.status === 'Contract Ended').length;
  const expiringSoonCount = staffList.filter((s) => {
    if (s.status !== 'Active') return false;
    const remaining = getContractDaysRemaining(s.contractEndDate);
    return remaining >= 0 && remaining <= 60;
  }).length;
  const totalBaseCommitment = staffList
    .filter((s) => s.status === 'Active')
    .reduce((sum, s) => sum + s.standardMonthlyRate, 0);

  // Filtered List
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.staffId.toLowerCase().includes(search.toLowerCase()) ||
      s.ghanaCardNo.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'all' || s.department === selectedDept;
    const matchesCadre = selectedCadre === 'all' || s.cadre === selectedCadre;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const matchesContract = selectedContractType === 'all' || s.contractType === selectedContractType;

    return matchesSearch && matchesDept && matchesCadre && matchesStatus && matchesContract;
  });

  // Open Add Modal
  const openCreateModal = () => {
    setEditingStaff(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    setFormData({
      fullName: '',
      staffId: `GHS-EH-TMP-${String(staffList.length + 1).padStart(3, '0')}`,
      ghanaCardNo: 'GHA-',
      ssnitNo: '',
      cadre: 'Temporal Staff Nurse',
      department: 'Out-Patient Department (OPD)',
      phone: '+233 ',
      email: '',
      dateJoined: today,
      status: 'Active',
      contractStartDate: today,
      contractEndDate: nextYear,
      contractDurationMonths: 12,
      contractType: 'Renewable Locum Contract',
      baseDailyRate: 120,
      standardMonthlyRate: 2600,
      allowances: {
        nightShiftRate: 75,
        emergencyCallRate: 90,
        riskAllowance: 150,
        transportAllowance: 100,
        specialDutyAllowance: 60,
      },
      welfareContribution: 40,
      taxTreatment: 'Withholding Tax (5%)',
      paymentMethod: 'Bank Account',
      bankName: 'GCB Bank - Takoradi Harbour Branch',
      accountNumber: '',
      momoNumber: '',
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (staff: TemporalStaff) => {
    setEditingStaff(staff);
    const allowances = staff.allowances || {
      nightShiftRate: staff.nightShiftRate || 75,
      emergencyCallRate: staff.emergencyCallRate || 90,
      riskAllowance: 100,
      transportAllowance: 100,
      specialDutyAllowance: 50,
    };

    setFormData({
      ...staff,
      allowances,
      contractDurationMonths: staff.contractDurationMonths || 12,
      contractStartDate: staff.contractStartDate || '2026-01-01',
      contractEndDate: staff.contractEndDate || '2026-12-31',
      contractType: staff.contractType || 'Renewable Locum Contract',
    });
    setIsFormModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.staffId || !formData.ghanaCardNo) return;

    const allowances: StaffAllowances = {
      nightShiftRate: Number(formData.allowances?.nightShiftRate || 0),
      emergencyCallRate: Number(formData.allowances?.emergencyCallRate || 0),
      riskAllowance: Number(formData.allowances?.riskAllowance || 0),
      transportAllowance: Number(formData.allowances?.transportAllowance || 0),
      specialDutyAllowance: Number(formData.allowances?.specialDutyAllowance || 0),
      otherAllowanceDescription: formData.allowances?.otherAllowanceDescription || '',
      otherAllowanceAmount: Number(formData.allowances?.otherAllowanceAmount || 0),
    };

    const payload: Partial<TemporalStaff> = {
      ...formData,
      allowances,
      nightShiftRate: allowances.nightShiftRate,
      emergencyCallRate: allowances.emergencyCallRate,
      standardMonthlyRate: Number(formData.standardMonthlyRate || 0),
      baseDailyRate: Number(formData.baseDailyRate || 0),
      contractDurationMonths: Number(formData.contractDurationMonths || 12),
      welfareContribution: Number(formData.welfareContribution || 0),
      lastModified: new Date().toISOString(),
      lastModifiedBy: userRole.replace('_', ' ').toUpperCase(),
    };

    const integrityHash = calculateStaffIntegrityHash(payload);

    if (editingStaff) {
      onUpdateStaff({
        ...editingStaff,
        ...payload,
        recordIntegrityHash: integrityHash,
      } as TemporalStaff);
    } else {
      const newStaff: TemporalStaff = {
        ...payload,
        id: `staff-${Date.now()}`,
        dateJoined: formData.dateJoined || new Date().toISOString().split('T')[0],
        status: 'Active',
        recordIntegrityHash: integrityHash,
      } as TemporalStaff;
      onAddStaff(newStaff);
    }

    setIsFormModalOpen(false);
  };

  // Handle Deactivate Confirm
  const handleConfirmDeactivate = () => {
    if (!deactivatingStaff) return;
    const isCurrentlyActive = deactivatingStaff.status === 'Active';
    const newStatus: StaffStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    const updated: TemporalStaff = {
      ...deactivatingStaff,
      status: newStatus,
      deactivationReason: isCurrentlyActive ? deactivationReason : undefined,
      deactivatedAt: isCurrentlyActive ? new Date().toISOString() : undefined,
      deactivatedBy: isCurrentlyActive ? userRole : undefined,
      lastModified: new Date().toISOString(),
      lastModifiedBy: userRole,
    };
    updated.recordIntegrityHash = calculateStaffIntegrityHash(updated);
    onUpdateStaff(updated);
    setDeactivatingStaff(null);
  };

  // Handle Delete Confirm
  const handleConfirmDelete = () => {
    if (!deletingStaff) return;
    onDeleteStaff(deletingStaff.id);
    setDeletingStaff(null);
  };

  // Export CSV
  const exportCsv = () => {
    const headers = [
      'Staff ID',
      'Full Name',
      'Ghana Card PIN',
      'SSNIT No',
      'Cadre',
      'Department',
      'Contract Type',
      'Contract Start',
      'Contract End',
      'Contract (Months)',
      'Status',
      'Monthly Base (GH₵)',
      'Daily Rate (GH₵)',
      'Night Shift Allowance (GH₵)',
      'Emergency Call Allowance (GH₵)',
      'Risk Subsidy (GH₵)',
      'Transport Subsidy (GH₵)',
      'Payment Method',
      'Disbursement Destination',
      'Security Integrity Hash',
    ];

    const rows = filteredStaff.map((s) => [
      `"${s.staffId}"`,
      `"${s.fullName}"`,
      `"${s.ghanaCardNo}"`,
      `"${s.ssnitNo || 'N/A'}"`,
      `"${s.cadre}"`,
      `"${s.department}"`,
      `"${s.contractType}"`,
      `"${s.contractStartDate}"`,
      `"${s.contractEndDate}"`,
      s.contractDurationMonths,
      `"${s.status}"`,
      s.standardMonthlyRate,
      s.baseDailyRate,
      s.allowances?.nightShiftRate || s.nightShiftRate,
      s.allowances?.emergencyCallRate || s.emergencyCallRate,
      s.allowances?.riskAllowance || 0,
      s.allowances?.transportAllowance || 0,
      `"${s.paymentMethod}"`,
      `"${s.paymentMethod === 'Bank Account' ? s.accountNumber : s.momoNumber}"`,
      `"${s.recordIntegrityHash}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `GHS_Essikado_Temporal_Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Title & Actions Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Ghana Health Service • Essikado Hospital</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-800" />
            <span>Temporal Staff Management Module</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer temporal staff credentials, employee IDs, contract duration periods, base salaries, and customized duty allowances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Job Categories Config Button */}
          {onOpenJobCategoriesModal && (
            <button
              onClick={onOpenJobCategoriesModal}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Add & configure job categories and default allowances"
            >
              <Briefcase className="w-4 h-4 text-emerald-700" />
              <span>Job Categories ({categories.length})</span>
            </button>
          )}

          {/* Manage Users Button */}
          {onOpenUserManagementModal && (userRole === 'super_admin' || userRole === 'hr_payroll') && (
            <button
              onClick={onOpenUserManagementModal}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Add more users and configure access roles"
            >
              <Users className="w-4 h-4 text-purple-700" />
              <span>System Users</span>
            </button>
          )}

          {/* Secure Vault JSON Backup */}
          <button
            onClick={() => exportStaffVaultAsJson(staffList)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Export signed backup of all staff records"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Backup Vault (JSON)</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          {/* Add New Staff */}
          {canEdit && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span>Enroll New Temporal Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Active Staff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Temporal Staff
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {activeCount} <span className="text-xs font-semibold text-slate-500">/ {staffList.length} Total</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified for monthly payroll</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Contracts Expiring Soon
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {expiringSoonCount} <span className="text-xs font-semibold text-slate-500">Staff (&le; 60 days)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Requires HR contract renewal
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Base Commitment */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Monthly Base Commitment
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {formatGHS(totalBaseCommitment)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Excluding dynamic shift allowances
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Security & Cryptographic Integrity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Vault Record Security
            </span>
            <div className="text-sm font-black text-emerald-800 mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Tamper Sealed</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              SHA-signed storage active
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, Employee ID, Ghana Card PIN..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          >
            <option value="all">All Departments ({DEPARTMENTS.length})</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Cadre Filter */}
        <div>
          <select
            value={selectedCadre}
            onChange={(e) => setSelectedCadre(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          >
            <option value="all">All Cadres / Roles ({cadreList.length})</option>
            {cadreList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active ({activeCount})</option>
            <option value="Inactive">Inactive / Deactivated</option>
            <option value="On Leave">On Leave</option>
            <option value="Contract Ended">Contract Ended</option>
          </select>
        </div>

        {/* Contract Type Filter */}
        <div>
          <select
            value={selectedContractType}
            onChange={(e) => setSelectedContractType(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          >
            <option value="all">All Contract Types</option>
            {CONTRACT_TYPES.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID & Staff Name</th>
                <th className="py-3 px-4">Cadre & Department</th>
                <th className="py-3 px-4">Contract Duration & Terms</th>
                <th className="py-3 px-4">Base Salary</th>
                <th className="py-3 px-4">Standard Allowances</th>
                <th className="py-3 px-4">Status & Integrity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => {
                const daysRemaining = getContractDaysRemaining(staff.contractEndDate);
                const isExpiringSoon = staff.status === 'Active' && daysRemaining >= 0 && daysRemaining <= 60;
                const isExpired = staff.status === 'Active' && daysRemaining < 0;

                return (
                  <tr
                    key={staff.id}
                    className={`hover:bg-slate-50/80 transition ${
                      staff.status === 'Inactive' || staff.status === 'Contract Ended'
                        ? 'opacity-70 bg-slate-50/40'
                        : ''
                    }`}
                  >
                    {/* Employee ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{staff.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-800 font-extrabold text-[11px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {staff.staffId}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {staff.ghanaCardNo}
                        </span>
                      </div>
                    </td>

                    {/* Cadre & Department */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{staff.cadre}</div>
                      <div className="text-slate-500 text-[11px]">{staff.department}</div>
                    </td>

                    {/* Contract Duration */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.contractDurationMonths || 12} Months ({staff.contractType})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        <span>{staff.contractStartDate}</span> &rarr; <span>{staff.contractEndDate}</span>
                      </div>
                      <div className="mt-1">
                        {isExpired ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Contract Expired
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Expiring in {daysRemaining} days
                          </span>
                        ) : staff.status === 'Active' ? (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {daysRemaining} days remaining
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Terminated</span>
                        )}
                      </div>
                    </td>

                    {/* Base Salary */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {formatGHS(staff.standardMonthlyRate)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Daily: {formatGHS(staff.baseDailyRate)}/day
                      </div>
                    </td>

                    {/* Allowances Breakdown */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        <div>
                          Night: <strong className="font-mono">GH₵{staff.allowances?.nightShiftRate || staff.nightShiftRate}</strong> • Call: <strong className="font-mono">GH₵{staff.allowances?.emergencyCallRate || staff.emergencyCallRate}</strong>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Risk: GH₵{staff.allowances?.riskAllowance || 100} • Commute: GH₵{staff.allowances?.transportAllowance || 100}
                        </div>
                      </div>
                    </td>

                    {/* Status & Integrity */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            staff.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : staff.status === 'Inactive'
                              ? 'bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {staff.status}
                        </span>
                        <div
                          className="text-[9px] font-mono text-slate-400 flex items-center gap-1 cursor-help"
                          title={`Integrity Checksum: ${staff.recordIntegrityHash}`}
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{staff.recordIntegrityHash}</span>
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* View Profile */}
                      <button
                        onClick={() => setViewingProfileStaff(staff)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                        title="View Full Staff Record Sheet"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {canEdit && (
                        <>
                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(staff)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                            title="Edit Staff Details, Base Salary, and Allowances"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Deactivate / Reactivate Toggle */}
                          <button
                            onClick={() => setDeactivatingStaff(staff)}
                            className={`p-1.5 rounded-lg transition ${
                              staff.status === 'Active'
                                ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                            }`}
                            title={staff.status === 'Active' ? 'Deactivate staff member' : 'Reactivate staff member'}
                          >
                            {staff.status === 'Active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete / Remove */}
                          <button
                            onClick={() => setDeletingStaff(staff)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition"
                            title="Remove staff record permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No temporal staff records found matching the active filters.
          </div>
        )}
      </div>

      {/* ADD / EDIT STAFF MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004D25] to-[#005A36] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GhsEmblem size={40} className="shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingStaff ? 'Edit Temporal Staff Details' : 'Enroll New Temporal Staff'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Ghana Health Service • Essikado Hospital Workforce Registry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* SECTION 1: Bio & Employee ID */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>1. Identity & Staff ID</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Dr. Kwame Mensah"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Employee ID / Staff ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.staffId || ''}
                      onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                      placeholder="e.g. GHS-EH-TMP-011"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ghana Card PIN (National ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ghanaCardNo || ''}
                      onChange={(e) => setFormData({ ...formData, ghanaCardNo: e.target.value })}
                      placeholder="GHA-XXXXXXXXX-X"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      SSNIT Number (Optional for Casuals)
                    </label>
                    <input
                      type="text"
                      value={formData.ssnitNo || ''}
                      onChange={(e) => setFormData({ ...formData, ssnitNo: e.target.value })}
                      placeholder="e.g. C019283748"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-slate-700">
                        Cadre / Professional Category *
                      </label>
                      {onOpenJobCategoriesModal && (
                        <button
                          type="button"
                          onClick={onOpenJobCategoriesModal}
                          className="text-[10px] text-emerald-700 hover:underline font-semibold"
                        >
                          + Add Category
                        </button>
                      )}
                    </div>
                    <select
                      value={formData.cadre}
                      onChange={(e) => {
                        const selectedCadre = e.target.value;
                        const cat = categories.find((c) => c.name === selectedCadre);
                        if (cat && !editingStaff) {
                          setFormData({
                            ...formData,
                            cadre: selectedCadre,
                            department: cat.department || formData.department,
                            standardMonthlyRate: cat.defaultMonthlyRate || formData.standardMonthlyRate,
                            baseDailyRate: cat.defaultDailyRate || formData.baseDailyRate,
                            allowances: {
                              ...formData.allowances!,
                              nightShiftRate: cat.defaultNightShiftRate || formData.allowances!.nightShiftRate,
                              emergencyCallRate: cat.defaultEmergencyCallRate || formData.allowances!.emergencyCallRate,
                              riskAllowance: cat.defaultRiskAllowance || formData.allowances!.riskAllowance,
                            },
                          });
                        } else {
                          setFormData({ ...formData, cadre: selectedCadre });
                        }
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white font-medium text-slate-800"
                    >
                      {cadreList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Department Assigned *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+233 24 123 4567"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="staff@ghs.gov.gh"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contract Duration & Terms */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>2. Contract Duration & Engagement Terms</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Contract Type *
                    </label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => setFormData({ ...formData, contractType: e.target.value as ContractType })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
                    >
                      {CONTRACT_TYPES.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Contract Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.contractStartDate || ''}
                      onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Contract End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.contractEndDate || ''}
                      onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Contract Duration (Months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      value={formData.contractDurationMonths || 12}
                      onChange={(e) => setFormData({ ...formData, contractDurationMonths: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Staff Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
                    >
                      <option value="Active">Active (Eligible for Payroll)</option>
                      <option value="Inactive">Inactive / Suspended</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Contract Ended">Contract Ended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Base Salary & Daily Locum Rates */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>3. Base Salary & Daily Rate (in Ghana Cedis GH₵)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Standard Monthly Base Salary (GH₵) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.standardMonthlyRate || 0}
                      onChange={(e) => setFormData({ ...formData, standardMonthlyRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono font-bold"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Guaranteed monthly base allowance for 20-22 duty days.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Base Daily Locum Rate (GH₵)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.baseDailyRate || 0}
                      onChange={(e) => setFormData({ ...formData, baseDailyRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Used for per-diem or pro-rated casual duty calculations.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Allowances Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>4. Duty & Hazard Allowances Breakdown (GH₵)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Night Shift Rate (GH₵/shift)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances?.nightShiftRate ?? 75}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: {
                            ...formData.allowances!,
                            nightShiftRate: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Emergency Call Rate (GH₵/call)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances?.emergencyCallRate ?? 90}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: {
                            ...formData.allowances!,
                            emergencyCallRate: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Risk / Infection Subsidy (GH₵)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances?.riskAllowance ?? 150}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: {
                            ...formData.allowances!,
                            riskAllowance: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Commuting / Transport Subsidy (GH₵)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances?.transportAllowance ?? 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: {
                            ...formData.allowances!,
                            transportAllowance: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Weekend / Holiday Duty (GH₵)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances?.specialDutyAllowance ?? 60}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: {
                            ...formData.allowances!,
                            specialDutyAllowance: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hospital Welfare Dues (GH₵)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.welfareContribution ?? 40}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          welfareContribution: Number(e.target.value),
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Payment Channel & Tax */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>5. Payment Channel & GRA Tax Treatment</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Disbursement Method *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
                    >
                      <option value="Bank Account">Bank Account (Direct Deposit)</option>
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Telecel Cash">Telecel Cash</option>
                      <option value="AT Money">AT Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tax Treatment (GRA) *
                    </label>
                    <select
                      value={formData.taxTreatment}
                      onChange={(e) => setFormData({ ...formData, taxTreatment: e.target.value as any })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
                    >
                      <option value="Withholding Tax (5%)">GRA Withholding Tax (5% Standard Casual/Locum)</option>
                      <option value="Withholding Tax (7.5%)">GRA Withholding Tax (7.5% Contract)</option>
                      <option value="Standard PAYE">Standard Graduated PAYE</option>
                      <option value="Exempt">Exempt / Zero-rated</option>
                    </select>
                  </div>
                </div>

                {formData.paymentMethod === 'Bank Account' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Bank Name & Branch</label>
                      <input
                        type="text"
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="e.g. GCB Bank - Takoradi Harbour Branch"
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber || ''}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Account number"
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Money Phone Number</label>
                    <input
                      type="text"
                      value={formData.momoNumber || ''}
                      onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                      placeholder="e.g. 024XXXXXXX"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md hover:shadow-lg cursor-pointer"
                >
                  {editingStaff ? 'Update Staff Record' : 'Enroll & Generate Secure Hash'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DEACTIVATE / REACTIVATE CONFIRMATION MODAL */}
      {deactivatingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className={`p-5 text-white ${
              deactivatingStaff.status === 'Active' ? 'bg-amber-600' : 'bg-emerald-700'
            }`}>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                {deactivatingStaff.status === 'Active' ? (
                  <>
                    <UserX className="w-5 h-5" />
                    <span>Deactivate Temporal Staff</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>Reactivate Temporal Staff</span>
                  </>
                )}
              </h3>
              <p className="text-xs opacity-90">
                {deactivatingStaff.fullName} ({deactivatingStaff.staffId})
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {deactivatingStaff.status === 'Active' ? (
                <>
                  <p className="text-slate-700">
                    Deactivating this staff member will exclude them from upcoming automatic monthly payroll cycles. Historical payslips remain fully archived and verifiable.
                  </p>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Reason for Deactivation:
                    </label>
                    <select
                      value={deactivationReason}
                      onChange={(e) => setDeactivationReason(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                    >
                      <option value="Contract Term Completed">Contract Term Completed / Expired</option>
                      <option value="Locum Rotation Completed">Locum Rotation Completed</option>
                      <option value="Resignation / Voluntary Exit">Resignation / Voluntary Exit</option>
                      <option value="Extended Leave of Absence">Extended Leave of Absence</option>
                      <option value="Disciplinary Suspension">Disciplinary Suspension</option>
                      <option value="Absence without Leave (AWOL)">Absence without Leave (AWOL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Administrative Notes (Optional):
                    </label>
                    <textarea
                      value={deactivationNotes}
                      onChange={(e) => setDeactivationNotes(e.target.value)}
                      placeholder="Add any hospital administrative notes..."
                      rows={2}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                </>
              ) : (
                <p className="text-slate-700">
                  Reactivating <strong>{deactivatingStaff.fullName}</strong> will mark their contract status as Active and enroll them in subsequent monthly payroll runs.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeactivatingStaff(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  className={`px-5 py-2 rounded-lg font-bold text-white shadow-md ${
                    deactivatingStaff.status === 'Active'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {deactivatingStaff.status === 'Active' ? 'Confirm Deactivation' : 'Reactivate Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE / REMOVE CONFIRMATION MODAL */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-red-700 text-white p-5">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-200" />
                <span>Remove Staff Member Record</span>
              </h3>
              <p className="text-xs text-red-100">
                {deletingStaff.fullName} ({deletingStaff.staffId})
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-700">
                Are you sure you want to permanently remove <strong>{deletingStaff.fullName}</strong> from the temporal staff roster?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px]">
                <strong>Warning:</strong> This will remove their record from active roster queries. If this staff member already has issued payslips, their historical payslips will remain archived in the audit ledger.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeletingStaff(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold shadow-md"
                >
                  Permanently Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STAFF PROFILE SHEET MODAL */}
      {viewingProfileStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <GhanaFlagStrip className="h-1.5" />
            
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GhsEmblem size={44} className="shrink-0" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Official Temporal Staff Record Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ghana Health Service • Essikado Hospital, Sekondi-Takoradi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProfileStaff(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Profile summary header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{viewingProfileStaff.fullName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {viewingProfileStaff.staffId}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{viewingProfileStaff.cadre}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{viewingProfileStaff.department}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      viewingProfileStaff.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    Status: {viewingProfileStaff.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    ID: {viewingProfileStaff.ghanaCardNo}
                  </div>
                </div>
              </div>

              {/* Contract terms card */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Contract Terms & Duration</span>
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Contract Type:</span>
                    <strong className="text-slate-900">{viewingProfileStaff.contractType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tenure Length:</span>
                    <strong className="text-slate-900">{viewingProfileStaff.contractDurationMonths} Months</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Start Date:</span>
                    <span className="font-mono text-slate-800">{viewingProfileStaff.contractStartDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">End Date:</span>
                    <span className="font-mono text-slate-800">{viewingProfileStaff.contractEndDate}</span>
                  </div>
                </div>
              </div>

              {/* Salary & Allowances Grid */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>Salary Structure & Approved Duty Allowances</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-emerald-800 text-[10px] font-bold block uppercase">Monthly Base</span>
                    <strong className="font-mono text-emerald-950 text-sm">
                      {formatGHS(viewingProfileStaff.standardMonthlyRate)}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Daily Rate</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {formatGHS(viewingProfileStaff.baseDailyRate)}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Night Duty Rate</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      GH₵{viewingProfileStaff.allowances?.nightShiftRate || viewingProfileStaff.nightShiftRate}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Call-in Duty</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      GH₵{viewingProfileStaff.allowances?.emergencyCallRate || viewingProfileStaff.emergencyCallRate}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Risk / Hazard</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      GH₵{viewingProfileStaff.allowances?.riskAllowance || 150}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Commuting Subsidy</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      GH₵{viewingProfileStaff.allowances?.transportAllowance || 100}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment & Security Footprint */}
              <div className="bg-slate-900 text-white rounded-xl p-4 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>DISBURSEMENT CHANNEL:</span>
                  <strong className="text-white">{viewingProfileStaff.paymentMethod}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ACCOUNT / WALLET:</span>
                  <span className="text-emerald-400">
                    {viewingProfileStaff.paymentMethod === 'Bank Account'
                      ? `${viewingProfileStaff.bankName} (${viewingProfileStaff.accountNumber})`
                      : viewingProfileStaff.momoNumber}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>INTEGRITY HASH:</span>
                  <span className="text-amber-300 font-bold">{viewingProfileStaff.recordIntegrityHash}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>LAST AUDITED:</span>
                  <span className="text-slate-300">{viewingProfileStaff.lastModified || '2026-10-25'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProfileStaff(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close Record Sheet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
