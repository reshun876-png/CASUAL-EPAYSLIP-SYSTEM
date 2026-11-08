import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types/payroll';
import { GhsEmblem } from './GhsEmblem';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Building2,
  Mail,
  UserCheck,
  Lock,
  Search,
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  currentUserId: string;
}

const ROLES: { id: UserRole; label: string; desc: string; color: string }[] = [
  {
    id: 'super_admin',
    label: 'Super Admin (Med. Superintendent)',
    desc: 'Executive approval, user management, audit oversight, and system configuration.',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'hr_payroll',
    label: 'HR & Payroll Officer',
    desc: 'Temporal staff enrollment, timesheet adjustments, payroll calculations, and batch PDF generation.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'supervisor',
    label: 'Ward / Unit Supervisor',
    desc: 'Nursing In-Charge / OPD head shift attendance review and locum duty verification.',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'auditor',
    label: 'Internal Auditor',
    desc: 'Pre-audit ledger review, GRA tax compliance check, and audit trail examination.',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'staff',
    label: 'Temporal Staff Portal',
    desc: 'Self-service access to individual monthly payslips, shift records, and direct PDF downloads.',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
];

const DEPARTMENTS = [
  'Hospital Administration',
  'Human Resources & Finance',
  'Out-Patient Department (OPD)',
  'Emergency & Casualty',
  'Labour Ward & Maternity',
  'Clinical Laboratory',
  'Pharmacy & Dispensary',
  'Female & Children Ward',
  'Male Medical Ward',
  'Health Information & Records',
  'Internal Audit & Compliance',
  'Estate & Security Unit',
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUserId,
}) => {
  const [search, setSearch] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [formData, setFormData] = useState<Partial<UserAccount>>({
    fullName: '',
    username: '',
    email: '',
    role: 'hr_payroll',
    department: 'Human Resources & Finance',
    title: '',
    staffId: '',
  });

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAddForm = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      username: '',
      email: '',
      role: 'hr_payroll',
      department: 'Human Resources & Finance',
      title: 'Assistant HR Officer',
      staffId: '',
    });
    setIsAddingUser(true);
  };

  const openEditForm = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsAddingUser(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.email) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...formData,
      } as UserAccount);
    } else {
      const newUser: UserAccount = {
        ...formData,
        id: `usr-${Date.now()}`,
      } as UserAccount;
      onAddUser(newUser);
    }

    setIsAddingUser(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004D25] to-[#005A36] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GhsEmblem size={40} className="shrink-0" />
            <div>
              <h3 className="font-extrabold text-base">Hospital System User & RBAC Management</h3>
              <p className="text-xs text-emerald-200">
                Ghana Health Service • Essikado Hospital Administrative Portal
              </p>
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
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Top Bar: Search & Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search administrators, officers, supervisors..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>

            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span>Add New System User</span>
            </button>
          </div>

          {/* Add / Edit Form Dropdown */}
          {isAddingUser && (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>{editingUser ? 'Modify User Profile' : 'Register New System User'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Nana Akua Mensah"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. dr.akua or hr.mensah"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@ghs.gov.gh"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Position / Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Assistant HR Officer / Nursing Supervisor"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role & Authority Level *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white font-semibold text-slate-800"
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Unit *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.role === 'staff' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Linked Temporal Staff ID</label>
                  <input
                    type="text"
                    value={formData.staffId || ''}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="e.g. GHS-EH-TMP-001"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md"
                >
                  {editingUser ? 'Save Changes' : 'Create System User'}
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Registered Administrative Accounts ({users.length})
              </span>
              <span className="text-[10px] text-slate-500">
                Changes persist automatically in the system vault
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const roleDef = ROLES.find((r) => r.id === user.role);
                const isSelf = user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 mt-0.5">
                        {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{user.fullName}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-slate-700">@{user.username}</span>
                          <span>•</span>
                          <span>{user.title}</span>
                          <span>•</span>
                          <span>{user.department}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleDef?.color}`}>
                        {roleDef?.label}
                      </span>

                      <button
                        onClick={() => openEditForm(user)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!isSelf && users.length > 1 && (
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Close User Management
          </button>
        </div>

      </div>
    </div>
  );
};
