import React, { useState, useRef } from 'react';
import {
  FolderLock,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  ShieldCheck,
  Lock,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  FileText,
  X,
  Building,
  HelpCircle,
  Save,
  Check
} from 'lucide-react';
import { Language, UserProfile, UploadedDoc, UserType, VerifiedService } from '../types';
import { getTranslation } from '../locales/translations';
import { ScholarshipMatchboard } from './ScholarshipMatchboard';

interface CitizenVaultPageProps {
  language: Language;
  userProfile: UserProfile;
  userDocuments: UploadedDoc[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateDocuments: (updated: UploadedDoc[]) => void;
  onOpenAssistFill: (service: VerifiedService) => void;
  onNavigate: (tab: string) => void;
}

export const CitizenVaultPage: React.FC<CitizenVaultPageProps> = ({
  language,
  userProfile,
  userDocuments,
  onUpdateProfile,
  onUpdateDocuments,
  onOpenAssistFill,
  onNavigate,
}) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'documents' | 'profile' | 'scholarships'>('documents');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');
  const [searchDocQuery, setSearchDocQuery] = useState('');
  
  // Profile edit state
  const [editProfile, setEditProfile] = useState<UserProfile>({ ...userProfile });
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Document modal preview & upload simulation
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadDocId, setTargetUploadDocId] = useState<string | null>(null);

  // Derived readiness stats
  const totalDocs = userDocuments.length;
  const verifiedDocs = userDocuments.filter((d) => d.status === 'verified').length;
  const uploadedDocs = userDocuments.filter((d) => d.status === 'uploaded').length;
  const missingDocs = userDocuments.filter((d) => d.status === 'missing').length;
  const readinessPercent = Math.round(((verifiedDocs + uploadedDocs) / totalDocs) * 100);

  // Filtered documents
  const filteredDocs = userDocuments.filter((doc) => {
    const q = searchDocQuery.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(q) ||
      (doc.nameKn && doc.nameKn.toLowerCase().includes(q)) ||
      (doc.docNumber && doc.docNumber.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (docCategoryFilter === 'all') return true;
    return doc.category === docCategoryFilter;
  });

  // Handle document upload simulation (Mock OCR scanner)
  const handleTriggerUpload = (docId: string) => {
    setTargetUploadDocId(docId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUploadDocId) return;

    setUploadingDocId(targetUploadDocId);

    // Simulate OCR scanner delay
    setTimeout(() => {
      const updatedDocs = userDocuments.map((d) => {
        if (d.id === targetUploadDocId) {
          return {
            ...d,
            status: 'verified' as const,
            fileName: file.name,
            fileSize: `${Math.round(file.size / 1024) || 350} KB`,
            lastUpdated: 'Just now',
            fileType: file.type || 'PDF Document',
            docNumber: d.docNumber || `VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`,
            extractedDetails: `OCR Verified on ${new Date().toLocaleDateString()} — Document verified with official database stamp.`,
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setUploadingDocId(null);
      setTargetUploadDocId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1200);
  };

  // Remove document
  const handleRemoveDoc = (docId: string) => {
    const updated = userDocuments.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'missing' as const,
          fileName: undefined,
          fileSize: undefined,
          lastUpdated: undefined,
        };
      }
      return d;
    });
    onUpdateDocuments(updated);
    if (previewDoc?.id === docId) setPreviewDoc(null);
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editProfile);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-16 bg-[#F8FAFC]">
      {/* Hidden file input for native upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Top Header Banner */}
      <div className="bg-gradient-to-r from-[#38104E] via-[#6B21A8] to-[#38104E] text-white pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
            <FolderLock className="w-3.5 h-3.5" />
            <span>Universal Citizen Document Vault & Profile</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {language === 'kn' ? 'ನನ್ನ ದಾಖಲೆಗಳ ವಾಲ್ಟ್ ಮತ್ತು ಪ್ರೊಫೈಲ್' : 'Citizen Document Vault & Profile Vault'}
              </h1>
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಮತ್ತು ಅಧಿಕೃತ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ. ವಿದ್ಯಾರ್ಥಿಗಳು, ರೈತರು ಮತ್ತು ಎಲ್ಲಾ ನಾಗರಿಕರಿಗೆ ಒಂದೇ ಬಾರಿಯ ಅಪ್‌ಲೋಡ್ ಮೂಲಕ ಎಲ್ಲಾ ಯೋಜನೆಗಳ ಸ್ವಯಂಚಾಲಿತ ಅನ್ವಯ.'
                  : 'Collect and verify your individual profile and documents in one secure vault. Works universally for Students, Farmers, Workers, and all Citizens to auto-qualify and pre-fill schemes without repetitive forms.'}
              </p>
            </div>

            {/* Overall Vault Readiness Meter */}
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 min-w-[280px]">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span>Vault Readiness</span>
                <span className="text-amber-300 text-sm">{readinessPercent}% Ready</span>
              </div>
              <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-purple-100">
                <span>{verifiedDocs} Verified</span>
                <span>•</span>
                <span>{uploadedDocs} Uploaded</span>
                <span>•</span>
                <span className="text-amber-300">{missingDocs} Missing</span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="pt-4 flex items-center gap-2 border-t border-white/15">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'bg-white text-[#38104E] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Document Locker ({totalDocs})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-white text-[#38104E] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Individual Profile Information</span>
            </button>
            <button
              onClick={() => setActiveTab('scholarships')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'scholarships'
                  ? 'bg-white text-[#38104E] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Matching Scholarships (7)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TAB 1: UNIVERSAL DOCUMENT LOCKER */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Quick Upload Banner & Search */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Filter:</span>
                {[
                  { id: 'all', label: `All (${totalDocs})` },
                  { id: 'Identity', label: 'Identity & Address' },
                  { id: 'Income & Caste', label: 'Income & Caste' },
                  { id: 'Academic', label: 'Academic & Student' },
                  { id: 'Land & Agriculture', label: 'Land & Farm' },
                  { id: 'Labour & Work', label: 'Labour & Work' },
                  { id: 'Disability', label: 'Disability' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDocCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                      docCategoryFilter === cat.id
                        ? 'bg-[#38104E] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  placeholder="Search document name, RD..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                />
              </div>
            </div>

            {/* Document Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => {
                const isVerified = doc.status === 'verified';
                const isMissing = doc.status === 'missing';
                const isUploading = uploadingDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isVerified
                        ? 'border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20'
                        : isMissing
                        ? 'border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20'
                        : 'border-purple-100'
                    }`}
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {doc.category || 'General'}
                        </span>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified (OCR)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              <span>Action Needed</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-[#38104E] leading-snug">
                        {language === 'kn' ? doc.nameKn : doc.name}
                      </h3>

                      {/* Doc Reference Number or Instructions */}
                      {doc.docNumber && (
                        <p className="text-[11px] font-mono text-slate-500 mt-1">
                          ID: {doc.docNumber}
                        </p>
                      )}

                      {/* Extracted Details */}
                      {doc.extractedDetails && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {doc.extractedDetails}
                        </p>
                      )}

                      {/* File Metadata if present */}
                      {doc.fileName && (
                        <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate max-w-[170px] font-medium">{doc.fileName}</span>
                          <span className="text-slate-400 shrink-0">{doc.fileSize}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      {isVerified ? (
                        <>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="text-xs font-semibold text-[#9333EA] hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleTriggerUpload(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-[#38104E] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Replace with new file"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveDoc(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => handleTriggerUpload(doc.id)}
                          disabled={isUploading}
                          className="w-full py-2 px-3 rounded-xl bg-[#38104E] hover:bg-[#4D166A] text-white font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Scanning OCR...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Document</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy & Auto-Fill Trust Box */}
            <div className="bg-[#FAF5FF] rounded-2xl p-5 border border-[#9333EA]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#9333EA] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#38104E]">
                    Consent-First Document Encryption
                  </h4>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    All uploaded files stay inside your secure browser session. NIRVAHA AI never transmits documents to any portal without your explicit review and confirmation in AssistFill.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('consent')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-purple-50 text-[#38104E] text-xs font-bold border border-[#9333EA]/30 transition-colors shrink-0"
              >
                Inspect Consent Records
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: UNIVERSAL CITIZEN PROFILE & DEMOGRAPHICS */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#38104E]">
                  Individual Citizen Information Collector
                </h2>
                <p className="text-xs text-slate-500">
                  This data personalizes eligibility rules across all public services for you and your family.
                </p>
              </div>

              {showSaveToast && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile Synced Successfully!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs sm:text-sm">
              {/* Citizen Type Switcher */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Citizen Primary Occupation / Role:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['Student', 'Farmer', 'Worker', 'Parent/Guardian', 'Citizen'] as UserType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditProfile({ ...editProfile, userType: type })}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        editProfile.userType === type
                          ? 'bg-[#38104E] text-white border-[#38104E] shadow-xs'
                          : 'bg-purple-50/50 hover:bg-purple-100/50 border-purple-100 text-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 1: Basic Demographics */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9333EA] border-b border-purple-100 pb-1">
                  1. Basic Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editProfile.preferredName}
                      onChange={(e) => setEditProfile({ ...editProfile, preferredName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="text"
                      value={editProfile.age || '20'}
                      onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editProfile.gender || 'Male'}
                      onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (OTP verification)</label>
                    <input
                      type="tel"
                      value={editProfile.phone || '+91 98450 12345'}
                      onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editProfile.state}
                      onChange={(e) => setEditProfile({ ...editProfile, state: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={editProfile.district}
                      onChange={(e) => setEditProfile({ ...editProfile, district: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Socio-Economic & Welfare Credentials */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9333EA] border-b border-purple-100 pb-1">
                  2. Socio-Economic & Welfare Eligibility
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Social Category</label>
                    <select
                      value={editProfile.socialCategory || 'OBC'}
                      onChange={(e) => setEditProfile({ ...editProfile, socialCategory: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none bg-white"
                    >
                      <option value="General">General / Open Merit</option>
                      <option value="OBC">OBC (Category 1, 2A, 2B, 3A, 3B)</option>
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="ST">Scheduled Tribe (ST)</option>
                      <option value="EWS">Economically Weaker Section (EWS)</option>
                      <option value="Minority">Religious Minority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Annual Family Income Bracket</label>
                    <select
                      value={editProfile.householdIncomeRange || '₹1.5 Lakh - ₹2.5 Lakh per annum'}
                      onChange={(e) => setEditProfile({ ...editProfile, householdIncomeRange: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none bg-white"
                    >
                      <option value="Below ₹1.0 Lakh per annum">Below ₹1.0 Lakh per annum</option>
                      <option value="₹1.0 Lakh - ₹2.5 Lakh per annum">₹1.0 Lakh - ₹2.5 Lakh per annum</option>
                      <option value="₹2.5 Lakh - ₹5.0 Lakh per annum">₹2.5 Lakh - ₹5.0 Lakh per annum</option>
                      <option value="Above ₹5.0 Lakh per annum">Above ₹5.0 Lakh per annum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ration Card Type</label>
                    <select
                      value={editProfile.rationCardType || 'BPL / PHH'}
                      onChange={(e) => setEditProfile({ ...editProfile, rationCardType: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none bg-white"
                    >
                      <option value="BPL / PHH">BPL / Priority Household (PHH)</option>
                      <option value="Antyodaya (AAY)">Antyodaya Anna Yojana (AAY)</option>
                      <option value="APL">APL / Non-Priority (NPHH)</option>
                      <option value="None">No Ration Card</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Role Specific Details */}
              {editProfile.userType === 'Student' && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9333EA] border-b border-purple-100 pb-1">
                    3. Student & Academic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">College / University</label>
                      <input
                        type="text"
                        value={editProfile.collegeName || ''}
                        onChange={(e) => setEditProfile({ ...editProfile, collegeName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Course & Stream</label>
                      <input
                        type="text"
                        value={editProfile.course || ''}
                        onChange={(e) => setEditProfile({ ...editProfile, course: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Year of Study</label>
                      <input
                        type="text"
                        value={editProfile.yearOfStudy || ''}
                        onChange={(e) => setEditProfile({ ...editProfile, yearOfStudy: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Marks / CGPA</label>
                      <input
                        type="text"
                        value={editProfile.cgpaOrPercentage || '8.28 CGPA (80.5%)'}
                        onChange={(e) => setEditProfile({ ...editProfile, cgpaOrPercentage: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">University Roll / USN</label>
                      <input
                        type="text"
                        value={editProfile.studentRollNo || '1RV22CS089'}
                        onChange={(e) => setEditProfile({ ...editProfile, studentRollNo: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#9333EA] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Form */}
              <div className="pt-4 border-t border-purple-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#38104E] hover:bg-[#4D166A] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Sync Profile to All Services</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: MATCHING SCHOLARSHIPS */}
        {activeTab === 'scholarships' && (
          <ScholarshipMatchboard
            language={language}
            userProfile={userProfile}
            userDocuments={userDocuments}
            onOpenAssistFill={onOpenAssistFill}
            onOpenActionPlan={() => onNavigate('action-plan')}
            onOpenVault={() => setActiveTab('documents')}
          />
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-purple-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-purple-50 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm sm:text-base text-[#38104E]">
                  {previewDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-purple-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">File Name:</span>
                <span className="font-bold text-slate-800">{previewDoc.fileName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">File Size:</span>
                <span>{previewDoc.fileSize}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Document ID / Number:</span>
                <span className="font-mono font-bold text-[#9333EA]">{previewDoc.docNumber}</span>
              </div>
              <div className="pt-2 border-t border-purple-100">
                <span className="font-medium text-slate-700 block mb-1">OCR Extracted Details:</span>
                <p className="p-2.5 rounded-lg bg-white border border-purple-100 font-mono text-[11px] text-slate-700 leading-relaxed">
                  {previewDoc.extractedDetails || 'Valid document verified against official registry.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  handleRemoveDoc(previewDoc.id);
                }}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from Vault</span>
              </button>

              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 rounded-xl bg-[#38104E] hover:bg-[#4D166A] text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
