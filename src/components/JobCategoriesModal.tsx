import React, { useState } from 'react';
import { JobCategory } from '../types/payroll';
import { formatGHS } from '../utils/numberToWords';
import { GhsEmblem } from './GhsEmblem';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  Shield,
  Briefcase,
} from 'lucide-react';

interface JobCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: JobCategory[];
  onAddCategory: (category: JobCategory) => void;
  onUpdateCategory: (category: JobCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  staffCountPerCategory?: Record<string, number>;
}

const DEPARTMENTS = [
  'Emergency & Casualty',
  'Out-Patient Department (OPD)',
  'Labour Ward & Maternity',
  'Clinical Laboratory',
  'Pharmacy & Dispensary',
  'Female & Children Ward',
  'Male Medical Ward',
  'Health Information & Records',
  'Estate & Security Unit',
  'Physiotherapy & Rehabilitation',
  'Radiology & Ultrasound',
  'Dental Unit',
  'Hospital Administration',
  'Mortuary & Pathology Unit',
];

export const JobCategoriesModal: React.FC<JobCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  staffCountPerCategory = {},
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<JobCategory | null>(null);

  const [formData, setFormData] = useState<Partial<JobCategory>>({
    name: '',
    department: 'Emergency & Casualty',
    defaultMonthlyRate: 3000,
    defaultDailyRate: 140,
    defaultNightShiftRate: 80,
    defaultEmergencyCallRate: 100,
    defaultRiskAllowance: 150,
    description: '',
  });

  if (!isOpen) return null;

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      department: 'Emergency & Casualty',
      defaultMonthlyRate: 3000,
      defaultDailyRate: 140,
      defaultNightShiftRate: 80,
      defaultEmergencyCallRate: 100,
      defaultRiskAllowance: 150,
      description: '',
    });
    setIsAdding(true);
  };

  const openEdit = (cat: JobCategory) => {
    setEditingCategory(cat);
    setFormData({ ...cat });
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        ...formData,
        defaultMonthlyRate: Number(formData.defaultMonthlyRate || 0),
        defaultDailyRate: Number(formData.defaultDailyRate || 0),
        defaultNightShiftRate: Number(formData.defaultNightShiftRate || 0),
        defaultEmergencyCallRate: Number(formData.defaultEmergencyCallRate || 0),
        defaultRiskAllowance: Number(formData.defaultRiskAllowance || 0),
      } as JobCategory);
    } else {
      const newCategory: JobCategory = {
        ...formData,
        id: `cat-${Date.now()}`,
        name: formData.name.trim(),
        defaultMonthlyRate: Number(formData.defaultMonthlyRate || 0),
        defaultDailyRate: Number(formData.defaultDailyRate || 0),
        defaultNightShiftRate: Number(formData.defaultNightShiftRate || 0),
        defaultEmergencyCallRate: Number(formData.defaultEmergencyCallRate || 0),
        defaultRiskAllowance: Number(formData.defaultRiskAllowance || 0),
        createdAt: new Date().toISOString(),
      } as JobCategory;
      onAddCategory(newCategory);
    }

    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004D25] to-[#005A36] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GhsEmblem size={40} className="shrink-0" />
            <div>
              <h3 className="font-extrabold text-base">Job Categories & Cadres Configuration</h3>
              <p className="text-xs text-emerald-200">
                Configure temporal healthcare roles, baseline salaries, and standard allowances
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
          
          {/* Search & Add Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job categories, cadres, departments..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>

            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Add New Job Category</span>
            </button>
          </div>

          {/* Add / Edit Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-700" />
                  <span>{editingCategory ? 'Edit Job Category' : 'Create New Hospital Job Category / Cadre'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Job Category / Cadre Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Locum Anesthetist or Temporal Sonographer"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary Hospital Department *
                  </label>
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

              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block">
                  Default Baseline Compensation & Shift Allowances (GH₵)
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Monthly Base (GH₵)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.defaultMonthlyRate || 0}
                      onChange={(e) => setFormData({ ...formData, defaultMonthlyRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Daily Rate (GH₵)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.defaultDailyRate || 0}
                      onChange={(e) => setFormData({ ...formData, defaultDailyRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Night Shift (GH₵)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.defaultNightShiftRate || 0}
                      onChange={(e) => setFormData({ ...formData, defaultNightShiftRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Emergency Call (GH₵)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.defaultEmergencyCallRate || 0}
                      onChange={(e) => setFormData({ ...formData, defaultEmergencyCallRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Risk Subsidy (GH₵)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.defaultRiskAllowance || 0}
                      onChange={(e) => setFormData({ ...formData, defaultRiskAllowance: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Description / Scope of Duty</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter details on clinical or operational duties for this cadre..."
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md"
                >
                  {editingCategory ? 'Update Category' : 'Save Job Category'}
                </button>
              </div>
            </form>
          )}

          {/* Categories Grid / Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Hospital Job Cadres ({categories.length})
              </span>
              <span className="text-[10px] text-slate-500">
                Auto-fills default salary rates when enrolling staff
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map((cat) => {
                const count = staffCountPerCategory[cat.name] || 0;

                return (
                  <div
                    key={cat.id}
                    className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {cat.department}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {count} Staff Enrolled
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-slate-500 text-[11px] max-w-xl">{cat.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                        <span>Base: <strong className="font-mono text-emerald-800">{formatGHS(cat.defaultMonthlyRate)}</strong></span>
                        <span>•</span>
                        <span>Daily: <strong className="font-mono">GH₵{cat.defaultDailyRate}</strong></span>
                        <span>•</span>
                        <span>Night: <strong className="font-mono">GH₵{cat.defaultNightShiftRate}</strong></span>
                        <span>•</span>
                        <span>Call-In: <strong className="font-mono">GH₵{cat.defaultEmergencyCallRate}</strong></span>
                        <span>•</span>
                        <span>Risk: <strong className="font-mono">GH₵{cat.defaultRiskAllowance}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="Edit Category Defaults"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {categories.length > 3 && (
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition"
                          title="Remove Category"
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
            Close Cadre Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
