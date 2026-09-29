import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Lock,
  Save,
  X
} from 'lucide-react';
import { Language, VerifiedService } from '../types';
import { mockVerifiedServices } from '../data/mockData';

interface AdminPortalPageProps {
  language: Language;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({ language }) => {
  const [services, setServices] = useState<VerifiedService[]>([...mockVerifiedServices]);
  const [selectedService, setSelectedService] = useState<VerifiedService | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState('');

  const [editForm, setEditForm] = useState<Partial<VerifiedService>>({});

  const handleEditClick = (srv: VerifiedService) => {
    setSelectedService(srv);
    setEditForm({ ...srv });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name) return;

    setServices((prev) =>
      prev.map((s) => (s.id === editForm.id ? ({ ...s, ...editForm } as VerifiedService) : s))
    );

    setIsEditing(false);
    setSelectedService(null);
    setToast('Service source rules and verified links updated successfully.');
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddNew = () => {
    const newService: VerifiedService = {
      id: `srv-${Date.now()}`,
      name: 'New Verified State Scheme',
      nameKn: 'ಹೊಸ ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆ',
      status: 'Verified Official',
      purpose: 'Institutional support and tuition grant for eligible students.',
      purposeKn: 'ಅರ್ಹ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಶೈಕ್ಷಣಿಕ ಶುಲ್ಕ ನೆರವು.',
      category: 'Education',
      applicableLifeEvents: ['student_fees'],
      userTypes: ['Student'],
      state: 'Karnataka',
      eligibilityExample: ['Enrolled full-time student', 'Income under threshold'],
      eligibilityExampleKn: ['ಪೂರ್ಣಾವಧಿ ವಿದ್ಯಾರ್ಥಿ', 'ನಿಗದಿತ ಮಿತಿಯೊಳಗೆ ಆದಾಯ'],
      documentsRequired: ['College Bonafide', 'Income Certificate'],
      documentsRequiredKn: ['ಬೋನಫೈಡ್ ಪ್ರಮಾಣಪತ್ರ', 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ'],
      deadlineDays: 14,
      deadlineText: '14 days remaining',
      deadlineTextKn: '14 ದಿನಗಳು ಬಾಕಿ',
      officialSourceUrl: 'https://demo.gov.in/new-scheme',
      officialDomain: 'demo.gov.in',
      lastVerifiedDate: 'Today (September 26, 2026)',
      whyResultReasons: ['Criteria matches student distress requirements.'],
      whyResultReasonsKn: ['ವಿದ್ಯಾರ್ಥಿ ಆರ್ಥಿಕ ಸಂಕಷ್ಟದ ಮಾನದಂಡಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.'],
      estimatedBenefit: 'Direct benefit tuition waiver up to ₹30,000.',
    };

    setServices([newService, ...services]);
    handleEditClick(newService);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-16 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Admin & Source Curation Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#38104E] mt-1">
            Grounded Source Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Demonstrates how NIRVAHA AI grounds replies in verified institutional gazettes rather than hallucinated responses.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-[#38104E]">
            Curated Services ({services.length})
          </h2>
          <span className="text-xs text-slate-400">Strict Source Validation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Official Domain</th>
                <th className="py-2.5 px-3">Source Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {srv.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{srv.category}</td>
                  <td className="py-3 px-3 font-mono text-xs text-[#9333EA]">
                    {srv.officialDomain}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Verified
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleEditClick(srv)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium mr-2"
                    >
                      Edit Rules
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Service Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#38104E] mb-4">
              Edit Verified Source & Rules
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#9333EA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Source URL
                </label>
                <input
                  type="url"
                  required
                  value={editForm.officialSourceUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, officialSourceUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#9333EA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deadline (Days)
                  </label>
                  <input
                    type="number"
                    value={editForm.deadlineDays || 0}
                    onChange={(e) => setEditForm({ ...editForm, deadlineDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#9333EA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Source Status
                  </label>
                  <select
                    value={editForm.status || 'Verified Official'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#9333EA]"
                  >
                    <option value="Verified Official">Verified Official</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Benefit
                </label>
                <input
                  type="text"
                  value={editForm.estimatedBenefit || ''}
                  onChange={(e) => setEditForm({ ...editForm, estimatedBenefit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#9333EA]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
