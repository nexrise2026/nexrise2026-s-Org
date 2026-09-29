import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Filter,
  ShieldCheck,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
  Search,
  Upload,
  UserCheck
} from 'lucide-react';
import { Language, UserProfile, UploadedDoc, VerifiedService } from '../types';
import { mockVerifiedServices } from '../data/mockData';
import { getTranslation } from '../locales/translations';

interface ScholarshipMatchboardProps {
  language: Language;
  userProfile: UserProfile;
  userDocuments: UploadedDoc[];
  onOpenAssistFill: (service: VerifiedService) => void;
  onOpenActionPlan?: () => void;
  onOpenVault?: () => void;
}

export const ScholarshipMatchboard: React.FC<ScholarshipMatchboardProps> = ({
  language,
  userProfile,
  userDocuments,
  onOpenAssistFill,
  onOpenActionPlan,
  onOpenVault,
}) => {
  const t = getTranslation(language);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'state' | 'central' | 'technical' | 'special'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // All verified scholarship services
  const scholarships = mockVerifiedServices.filter((s) => s.isScholarship || s.category === 'Education');

  // Filter scholarships
  const filteredScholarships = scholarships.filter((s) => {
    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.purpose.toLowerCase().includes(q) ||
      (s.providerAgency && s.providerAgency.toLowerCase().includes(q)) ||
      (s.targetCategory && s.targetCategory.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'state') return s.state === 'Karnataka' || s.id.includes('karnataka') || s.id.includes('labour');
    if (selectedFilter === 'central') return s.state === 'Pan-India' || s.id.includes('nsp') || s.id.includes('pm-usp');
    if (selectedFilter === 'technical') return s.id.includes('pragati') || s.id.includes('karnataka') || s.id.includes('saksham');
    if (selectedFilter === 'special') return s.id.includes('minority') || s.id.includes('labour') || s.id.includes('pragati') || s.id.includes('saksham');
    return true;
  });

  // Check document readiness for a given scholarship
  const checkDocReadiness = (service: VerifiedService) => {
    const requiredDocs = service.documentsRequired;
    const verifiedOrUploaded = userDocuments.filter((d) => d.status === 'verified' || d.status === 'uploaded');
    
    // Check matches
    let readyCount = 0;
    const missingDocs: string[] = [];

    requiredDocs.forEach((req) => {
      const reqLower = req.toLowerCase();
      const hasMatch = verifiedOrUploaded.some((doc) => {
        const docLower = doc.name.toLowerCase();
        if (reqLower.includes('bonafide') && docLower.includes('bonafide')) return true;
        if (reqLower.includes('marks') && (docLower.includes('marks') || docLower.includes('transcript'))) return true;
        if (reqLower.includes('income') && docLower.includes('income')) return true;
        if (reqLower.includes('aadhaar') && docLower.includes('aadhaar')) return true;
        if (reqLower.includes('bank') && docLower.includes('bank')) return true;
        if (reqLower.includes('caste') && docLower.includes('caste')) return true;
        if (reqLower.includes('disability') && docLower.includes('disability')) return true;
        if (reqLower.includes('labour') && docLower.includes('labour')) return true;
        return false;
      });

      if (hasMatch) {
        readyCount++;
      } else {
        missingDocs.push(req);
      }
    });

    const isFullyReady = readyCount === requiredDocs.length;
    return { readyCount, totalRequired: requiredDocs.length, isFullyReady, missingDocs };
  };

  return (
    <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden my-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#38104E] via-[#6B21A8] to-[#38104E] text-white p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Scholarship Matchboard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {language === 'kn' ? 'ನಿಮಗಾಗಿ ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು' : 'All Verified Scholarships Available for You'}
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
              {language === 'kn'
                ? `ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ (${userProfile.course || 'ಎಂಜಿನಿಯರಿಂಗ್'}, ${userProfile.state || 'ಕರ್ನಾಟಕ'}) ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ${scholarships.length} ಅಧಿಕೃತ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು.`
                : `Matched across State & Central portals for your profile (${userProfile.course || 'B.E. Computer Science'}, ${userProfile.state || 'Karnataka'}, Family Income ${userProfile.householdIncomeRange || '≤ ₹2.5 Lakh'}).`}
            </p>
          </div>

          {/* Quick Vault Call-to-Action */}
          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="self-start md:self-center px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-[#38104E] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 active:scale-95 shrink-0"
            >
              <Upload className="w-4 h-4 text-[#9333EA]" />
              <span>Open Document Vault</span>
            </button>
          )}
        </div>

        {/* Search & Filter Strip */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-purple-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship name, grant, or category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-purple-200 text-xs border border-white/20 focus:border-white focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                selectedFilter === 'all'
                  ? 'bg-white text-[#38104E] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              All ({scholarships.length})
            </button>
            <button
              onClick={() => setSelectedFilter('state')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                selectedFilter === 'state'
                  ? 'bg-white text-[#38104E] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              State (SSP)
            </button>
            <button
              onClick={() => setSelectedFilter('central')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                selectedFilter === 'central'
                  ? 'bg-white text-[#38104E] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Central (NSP)
            </button>
            <button
              onClick={() => setSelectedFilter('technical')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                selectedFilter === 'technical'
                  ? 'bg-white text-[#38104E] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Technical / STEM
            </button>
            <button
              onClick={() => setSelectedFilter('special')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                selectedFilter === 'special'
                  ? 'bg-white text-[#38104E] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Special Welfare
            </button>
          </div>
        </div>
      </div>

      {/* Scholarships List */}
      <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {filteredScholarships.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
            <p className="text-sm font-medium">No scholarships found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-2 text-xs font-bold text-[#9333EA] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredScholarships.map((srv) => {
            const isExpanded = expandedId === srv.id;
            const { readyCount, totalRequired, isFullyReady, missingDocs } = checkDocReadiness(srv);

            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-purple-100 hover:border-[#9333EA]/50 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5FF] text-[#38104E] border border-[#9333EA]/20 uppercase tracking-wide">
                        {srv.providerAgency ? srv.providerAgency.split(',')[0] : 'Govt of Karnataka / India'}
                      </span>
                      {srv.targetCategory && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {srv.targetCategory}
                        </span>
                      )}
                    </div>

                    {/* Deadline urgency indicator */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{srv.deadlineText}</span>
                    </div>
                  </div>

                  {/* Main Title & Benefit */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <h3 className="text-base sm:text-lg font-bold text-[#38104E] leading-snug">
                        {language === 'kn' ? srv.nameKn : srv.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {language === 'kn' ? srv.purposeKn : srv.purpose}
                      </p>
                    </div>

                    {/* Prominent Grant Value Box */}
                    <div className="bg-[#FAF5FF]/80 border border-[#9333EA]/30 rounded-2xl p-3.5 sm:text-right shrink-0 min-w-[210px]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Estimated Benefit
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-[#9333EA] leading-tight block mt-0.5">
                        {srv.scholarshipAmount || srv.estimatedBenefit}
                      </span>
                    </div>
                  </div>

                  {/* Document Readiness Match Bar */}
                  <div className="mt-4 p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      {isFullyReady ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-slate-800">
                          Locker Readiness: {readyCount} of {totalRequired} documents ready
                        </span>
                        {missingDocs.length > 0 && (
                          <span className="text-[11px] text-slate-500 block">
                            Missing: {missingDocs.slice(0, 2).join(', ')}
                            {missingDocs.length > 2 ? ` (+${missingDocs.length - 2} more)` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Upload action if missing */}
                    {onOpenVault && missingDocs.length > 0 && (
                      <button
                        onClick={onOpenVault}
                        className="text-[11px] font-bold text-[#9333EA] hover:underline flex items-center gap-1 self-start sm:self-auto"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload in Vault</span>
                      </button>
                    )}
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-purple-100 space-y-4 animate-in fade-in duration-200">
                      {/* Eligibility Criteria */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#38104E] mb-2 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-[#9333EA]" />
                          <span>Detailed Eligibility Requirements</span>
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          {(language === 'kn' ? srv.eligibilityExampleKn : srv.eligibilityExample).map((crit, idx) => (
                            <li key={idx} className="flex items-start gap-2 bg-purple-50/30 p-2.5 rounded-lg border border-purple-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA] mt-1.5 shrink-0" />
                              <span>{crit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Required Documents from Locker */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#38104E] mb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#9333EA]" />
                          <span>Required Documents Checklist</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {srv.documentsRequired.map((docName, idx) => {
                            const isPresent = userDocuments.some(
                              (ud) =>
                                (ud.status === 'verified' || ud.status === 'uploaded') &&
                                ud.name.toLowerCase().includes(docName.toLowerCase().split(' ')[0])
                            );

                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2.5 rounded-lg border ${
                                  isPresent
                                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                                    : 'bg-amber-50/50 border-amber-200 text-amber-900'
                                }`}
                              >
                                <span className="font-medium">{docName}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border">
                                  {isPresent ? 'Ready in Locker' : 'Pending Upload'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Official Domain & Verification */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-purple-50">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Official Portal: </span>
                          <a
                            href={srv.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[#9333EA] hover:underline flex items-center gap-1"
                          >
                            <span>{srv.officialDomain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span>Last Verified: {srv.lastVerifiedDate}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="mt-5 pt-4 border-t border-purple-50 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : srv.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-[#38104E] flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Full Eligibility & Rules'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    <div className="flex items-center gap-2.5">
                      {onOpenActionPlan && (
                        <button
                          onClick={onOpenActionPlan}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-purple-200 text-purple-900 hover:bg-purple-50 transition-colors"
                        >
                          Add to Next Steps
                        </button>
                      )}

                      <button
                        onClick={() => onOpenAssistFill(srv)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#38104E] hover:bg-[#4D166A] text-white transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Apply with AssistFill</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
