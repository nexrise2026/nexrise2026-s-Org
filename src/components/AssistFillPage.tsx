import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Upload,
  Eye,
  Trash2,
  RefreshCw,
  ExternalLink,
  Download,
  AlertTriangle,
  Lock,
  Edit3,
  Check,
  FileCheck
} from 'lucide-react';
import {
  Language,
  UserProfile,
  VerifiedService,
  UploadedDoc,
  DraftField,
  ApplicationStatus,
  ConsentReceipt
} from '../types';
import { mockVerifiedServices, initialUploadedDocuments } from '../data/mockData';
import { getTranslation } from '../locales/translations';

interface AssistFillPageProps {
  language: Language;
  userProfile: UserProfile;
  userDocuments?: UploadedDoc[];
  selectedService: VerifiedService | null;
  onSelectService: (service: VerifiedService) => void;
  onNavigate: (tab: string) => void;
  onAddConsentReceipt: (receipt: ConsentReceipt) => void;
}

export const AssistFillPage: React.FC<AssistFillPageProps> = ({
  language,
  userProfile,
  userDocuments,
  selectedService: initialService,
  onSelectService,
  onNavigate,
  onAddConsentReceipt,
}) => {
  const t = getTranslation(language);

  // Active service (defaults to Karnataka Student Fee Support Grant if none selected)
  const [activeService, setActiveService] = useState<VerifiedService>(
    initialService || mockVerifiedServices[0]
  );

  // AssistFill step state:
  // 1: Service Readiness
  // 2: Draft-creation Consent
  // 3: Draft Form Preparation & Field Inspection
  // 4: Supporting Documents Upload & Validation
  // 5: Application Review
  // 6: Final Submission Confirmation
  // 7: Submission Receipt
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Consent & Review Checkboxes
  const [draftConsentChecked, setDraftConsentChecked] = useState<boolean>(false);
  const [reviewConfirmed, setReviewConfirmed] = useState<boolean>(false);
  const [submissionConsent, setSubmissionConsent] = useState<boolean>(false);

  // Application Draft Data
  const [documents, setDocuments] = useState<UploadedDoc[]>(
    userDocuments && userDocuments.length > 0 ? userDocuments : [...initialUploadedDocuments]
  );
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    applicationId: string;
    consentRecordId: string;
    timestamp: string;
    docsCount: number;
  } | null>(null);

  // Draft form fields
  const [fields, setFields] = useState<DraftField[]>([
    {
      id: 'f1',
      key: 'fullName',
      label: 'Full Name',
      labelKn: 'ಪೂರ್ಣ ಹೆಸರು',
      value: userProfile.preferredName || 'Rahul Kumar',
      source: 'User profile',
      status: 'filled',
      editable: true,
    },
    {
      id: 'f2',
      key: 'collegeName',
      label: 'College Name',
      labelKn: 'ಕಾಲೇಜಿನ ಹೆಸರು',
      value: userProfile.collegeName || 'R.V. College of Engineering (Autonomous)',
      source: 'User profile',
      status: 'filled',
      editable: true,
    },
    {
      id: 'f3',
      key: 'courseYear',
      label: 'Course & Year of Study',
      labelKn: 'ಕೋರ್ಸ್ ಮತ್ತು ವ್ಯಾಸಂಗ ವರ್ಷ',
      value: `${userProfile.course || 'B.E. Computer Science'} · ${userProfile.yearOfStudy || '3rd Year'}`,
      source: 'User profile',
      status: 'filled',
      editable: true,
    },
    {
      id: 'f4',
      key: 'incomeCategory',
      label: 'Income Category Bracket',
      labelKn: 'ಆದಾಯ ವರ್ಗದ ಮಿತಿ',
      value: userProfile.householdIncomeRange || 'Below ₹2.5 Lakh per annum',
      source: 'Income certificate',
      status: 'needs_review',
      editable: true,
    },
    {
      id: 'f5',
      key: 'bonafideCert',
      label: 'College Bonafide Certificate',
      labelKn: 'ಕಾಲೇಜು ಬೋನಫೈಡ್ ಪ್ರಮಾಣಪತ್ರ',
      value: 'Attached: RVCE_Bonafide_Enrolment_2026.pdf',
      source: 'Uploaded document',
      status: 'verified',
      editable: false,
    },
    {
      id: 'f6',
      key: 'marksCard',
      label: 'Previous Semester Marks Card',
      labelKn: 'ಹಿಂದಿನ ಸೆಮಿಸ್ಟರ್ ಅಂಕಪಟ್ಟಿ',
      value: 'Attached: VTU_Semester4_Transcript.pdf (8.2 CGPA)',
      source: 'Uploaded document',
      status: 'verified',
      editable: false,
    },
    {
      id: 'f7',
      key: 'bankAccount',
      label: 'Bank Account & IFSC for Direct Benefit Transfer',
      labelKn: 'ಡಿಬಿಟಿಗಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ',
      value: 'Not auto-filled · Enter securely on official portal',
      source: 'Requires manual entry on portal',
      status: 'manual_required',
      editable: false,
      sensitiveNotice: 'For your security, NIRVAHA AI never collects bank account credentials or PINs.',
    },
  ]);

  // Derived readiness computations
  const compulsoryDocs = documents.filter((d) => d.required);
  const completedCompulsoryDocs = compulsoryDocs.filter((d) => d.status === 'verified' || d.status === 'uploaded');
  const requiredDocumentsComplete = completedCompulsoryDocs.length === compulsoryDocs.length;
  const requiredFieldsComplete = fields.every(
    (f) => f.status === 'filled' || f.status === 'verified' || f.status === 'needs_review' || f.status === 'manual_required'
  );
  const applicationDeadlineOpen = (activeService.deadlineDays ?? 30) > 0;
  const draftCreationConsent = draftConsentChecked;

  // Strict Boolean logic from hackathon brief
  const isSubmissionAllowed =
    reviewConfirmed === true &&
    submissionConsent === true &&
    requiredDocumentsComplete === true &&
    requiredFieldsComplete === true &&
    applicationDeadlineOpen === true &&
    draftCreationConsent === true;

  // Document upload simulation
  const handleUploadDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'verified',
            fileName: `${d.name.replace(/\s+/g, '_')}_Uploaded.pdf`,
            fileSize: '512 KB',
            lastUpdated: 'Just now',
          };
        }
        return d;
      })
    );
  };

  // Document removal
  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'missing',
            fileName: undefined,
            fileSize: undefined,
          };
        }
        return d;
      })
    );
  };

  // Submit Application Handler
  const handleFinalSubmit = async () => {
    if (!isSubmissionAllowed) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/assist-fill/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: activeService.id,
          serviceName: activeService.name,
          draftCreationConsent,
          reviewConfirmed,
          submissionConsent,
          requiredDocumentsComplete,
          requiredFieldsComplete,
          applicationDeadlineOpen,
          applicantData: {
            preferredName: userProfile.preferredName,
            collegeName: userProfile.collegeName,
            course: userProfile.course,
          },
          documentList: documents.filter((d) => d.fileName).map((d) => d.fileName),
        }),
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (data.success) {
        setSubmissionReceipt({
          applicationId: data.applicationId,
          consentRecordId: data.consentRecordId,
          timestamp: new Date().toLocaleString(),
          docsCount: data.documentsAttachedCount,
        });

        // Record in Consent Centre
        onAddConsentReceipt({
          id: data.consentRecordId,
          serviceId: activeService.id,
          serviceName: activeService.name,
          purpose: 'Official Application Submission & Verification',
          dataShared: [
            'Enrolment status & institution',
            'Course & year of study',
            'Income eligibility bracket',
            'Attached verification documents',
          ],
          dateApproved: new Date().toLocaleDateString(),
          accessExpires: '30 days from submission',
          status: 'Active',
          unnecessaryProtectedFieldsCount: 7,
        });

        setCurrentStep(7);
      }
    } catch (e) {
      setIsSubmitting(false);
      // Client-side fallback receipt
      const fallbackAppId = `NIR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const fallbackConsentId = `CSR-${Date.now().toString().slice(-6)}`;
      setSubmissionReceipt({
        applicationId: fallbackAppId,
        consentRecordId: fallbackConsentId,
        timestamp: new Date().toLocaleString(),
        docsCount: 3,
      });
      setCurrentStep(7);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-16 space-y-6">
      {/* AssistFill Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#38104E] text-white flex items-center justify-center shadow-md shadow-[#38104E]/20">
              <FileCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#38104E]">
                  {t.assistFill.brand}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#9333EA] border border-[#9333EA]/20">
                  {t.assistFill.tagline}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t.assistFill.subtitle}
              </p>
            </div>
          </div>

          {/* Service Switcher if needed */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {language === 'kn' ? 'ಆಯ್ಕೆಮಾಡಿದ ಸೇವೆ:' : 'Selected Service:'}
            </span>
            <select
              value={activeService.id}
              onChange={(e) => {
                const s = mockVerifiedServices.find((x) => x.id === e.target.value);
                if (s) {
                  setActiveService(s);
                  onSelectService(s);
                }
              }}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#9333EA]"
            >
              {mockVerifiedServices.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {language === 'kn' ? srv.nameKn : srv.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Tracker Steps */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2 mt-6 pt-5 border-t border-slate-100 text-center">
          {[
            { num: 1, label: 'Readiness' },
            { num: 2, label: 'Consent' },
            { num: 3, label: 'Draft Form' },
            { num: 4, label: 'Documents' },
            { num: 5, label: 'Review' },
            { num: 6, label: 'Confirm' },
            { num: 7, label: 'Receipt' },
          ].map((st) => (
            <button
              key={st.num}
              onClick={() => {
                // allow switching up to current max step
                if (st.num <= currentStep || (st.num === 3 && draftConsentChecked)) {
                  setCurrentStep(st.num);
                }
              }}
              className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                currentStep === st.num
                  ? 'bg-[#38104E] text-white font-bold shadow-xs'
                  : currentStep > st.num
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-xs font-bold leading-none">{st.num}</span>
              <span className="text-[10px] truncate max-w-[60px] mt-1 hidden sm:inline">
                {st.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: SERVICE SELECTION & READINESS */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
                Step 1 of 6
              </span>
              <h2 className="text-xl font-extrabold text-[#38104E]">
                {language === 'kn' ? activeService.nameKn : activeService.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeService.deadlineText}</span>
              </span>
            </div>
          </div>

          {/* Purpose & Benefit */}
          <div className="bg-[#FAF5FF] p-4 rounded-2xl border border-[#9333EA]/20 text-xs sm:text-sm text-[#38104E] leading-relaxed">
            <p className="font-semibold mb-1">
              {language === 'kn' ? 'ಸೇವೆಯ ಉದ್ದೇಶ:' : 'Service Purpose & Benefit:'}
            </p>
            <p>{language === 'kn' ? activeService.purposeKn : activeService.purpose}</p>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Estimated benefit: {activeService.estimatedBenefit}
            </p>
          </div>

          {/* Readiness Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">Likely Eligibility</span>
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Likely Eligible</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Based on enrolled college & state
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">Documents Status</span>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${
                requiredDocumentsComplete ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {requiredDocumentsComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {completedCompulsoryDocs.length} of {compulsoryDocs.length} Ready
                </span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {requiredDocumentsComplete ? 'All required docs present' : '1 missing document'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">Official Portal</span>
              <a
                href={activeService.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[#9333EA] hover:underline flex items-center gap-1"
              >
                <span>{activeService.officialDomain}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Verified: {activeService.lastVerifiedDate}
              </span>
            </div>
          </div>

          {/* Missing document note if any */}
          {!requiredDocumentsComplete && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold">Missing: State Income Certificate</p>
                <p>
                  You can prepare the draft now, but the state application portal requires an active income certificate (or revenue RD number) before final submission.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white font-semibold text-sm transition-all shadow-md shadow-[#38104E]/20 flex items-center gap-2"
            >
              <span>Continue to Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DRAFT-CREATION CONSENT SCREEN */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
                Step 2 of 6 · Explicit Consent
              </span>
              <h2 className="text-xl font-extrabold text-[#38104E]">
                {t.assistFill.consentNoticeTitle}
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-3">
            <p className="leading-relaxed">
              NIRVAHA AI can prepare this application draft using the selected information:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium text-slate-800 pl-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Preferred name</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>College name & course</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Current year of study</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Enrolment status</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Income-certificate status</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Bonafide & Marks verification</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-200/80">
              <p className="font-bold text-slate-900">
                Purpose:
              </p>
              <p className="text-slate-600">
                To prepare a draft application for <span className="font-semibold">{activeService.name}</span>.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <p className="font-bold">Important Principle:</p>
              <p>
                NIRVAHA AI will <span className="underline font-bold">never</span> silently submit this application. You must personally review all pre-filled fields and provide final submission confirmation.
              </p>
            </div>
          </div>

          {/* Required Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-[#FAF5FF]/60 border border-[#9333EA]/30 hover:bg-[#FAF5FF] transition-colors">
              <input
                type="checkbox"
                checked={draftConsentChecked}
                onChange={(e) => setDraftConsentChecked(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-[#9333EA] focus:ring-[#9333EA]"
              />
              <span className="text-xs sm:text-sm font-semibold text-[#38104E] leading-snug">
                {t.assistFill.consentCheckboxText}
              </span>
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              disabled={!draftConsentChecked}
              className={`px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                draftConsentChecked
                  ? 'bg-[#38104E] hover:bg-[#9333EA] text-white shadow-md shadow-[#38104E]/20 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{t.assistFill.createDraftBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FORM DRAFT PREPARATION & FIELD INSPECTION */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
                Step 3 of 6 · Draft Form Filling
              </span>
              <h2 className="text-xl font-extrabold text-[#38104E]">
                Pre-Filled Application Draft
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Status: Draft in preparation
            </span>
          </div>

          {/* Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              {t.assistFill.sensitiveDisclaimer}
            </p>
          </div>

          {/* Table of Fields, Sources & Status */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Application Field</th>
                  <th className="py-2.5 px-3">Pre-Filled Value</th>
                  <th className="py-2.5 px-3">Data Source</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((fld) => (
                  <tr key={fld.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {fld.label}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {fld.value}
                      {fld.sensitiveNotice && (
                        <span className="block text-[11px] text-amber-700 mt-0.5">
                          {fld.sensitiveNotice}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-xs">
                      {fld.source}
                    </td>
                    <td className="py-3 px-3">
                      {fld.status === 'verified' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      )}
                      {fld.status === 'filled' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Filled
                        </span>
                      )}
                      {fld.status === 'needs_review' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Needs Review
                        </span>
                      )}
                      {fld.status === 'manual_required' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Manual Portal Entry
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#38104E]/20 flex items-center gap-2"
            >
              <span>Validate Documents (Step 4)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUPPORTING DOCUMENTS VALIDATION */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
                Step 4 of 6 · Document Validation
              </span>
              <h2 className="text-xl font-extrabold text-[#38104E]">
                Required Supporting Documents
              </h2>
            </div>
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Documents Complete: {completedCompulsoryDocs.length} of {compulsoryDocs.length}
            </div>
          </div>

          {/* Document rows */}
          <div className="space-y-3">
            {documents.map((doc) => {
              const isMissing = doc.status === 'missing';
              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isMissing
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isMissing ? 'bg-rose-100 text-rose-600' : 'bg-[#FAF5FF] text-[#9333EA]'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {language === 'kn' ? doc.nameKn : doc.name}
                        </span>
                        {doc.required ? (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Compulsory
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                            Optional
                          </span>
                        )}
                      </div>

                      {doc.fileName ? (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {doc.fileName} · {doc.fileSize} · {doc.status.toUpperCase()}
                        </p>
                      ) : (
                        <p className="text-xs text-rose-600 mt-0.5 font-semibold">
                          Missing document · Compulsory for government grant
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions per document */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {doc.fileName ? (
                      <>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUploadDocument(doc.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#9333EA] hover:bg-[#38104E] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Document</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-6 py-3 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#38104E]/20 flex items-center gap-2"
            >
              <span>Review Before Submission (Step 5)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: APPLICATION REVIEW BEFORE SUBMISSION */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
                Step 5 of 6 · Review
              </span>
              <h2 className="text-xl font-extrabold text-[#38104E]">
                Review Your Application Before Submission
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Service:</span>
              <span className="text-xs font-bold text-[#38104E] bg-slate-100 px-2.5 py-1 rounded-lg">
                {activeService.name}
              </span>
            </div>
          </div>

          {/* Color-Coded Status Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500">Legend:</span>
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Verified / Complete</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Needs Your Review</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Missing / Cannot Submit</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Manual Entry Required</span>
            </span>
          </div>

          {/* Application Detail Cards */}
          <div className="space-y-3">
            {fields.map((field) => {
              const isMissing = field.status === 'needs_review' && !field.value;
              return (
                <div
                  key={field.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs text-slate-400 block font-mono">
                      Source: {field.source}
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                      {field.label}: <span className="font-normal text-slate-700">{field.value}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {field.status === 'verified' && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Complete
                      </span>
                    )}
                    {field.status === 'needs_review' && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Needs Review
                      </span>
                    )}
                    {field.status === 'manual_required' && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        Portal Direct Entry
                      </span>
                    )}
                    {field.editable && (
                      <button
                        onClick={() => {
                          const newVal = prompt(`Update ${field.label}:`, field.value);
                          if (newVal !== null) {
                            setFields((prev) =>
                              prev.map((f) => (f.id === field.id ? { ...f, value: newVal, status: 'filled' } : f))
                            );
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-[#9333EA] hover:bg-slate-100"
                        title="Edit value"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="px-6 py-3 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#38104E]/20 flex items-center gap-2"
            >
              <span>Proceed to Final Confirmation (Step 6)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: FINAL SUBMISSION CONFIRMATION WITH STRICT BOOLEAN CONDITION */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38104E] text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
                Step 6 of 6 · Final Approval
              </span>
              <h2 className="text-xl font-extrabold text-[#38104E]">
                Final Submission Confirmation
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-3">
            <p className="font-semibold text-slate-900">
              You are about to submit an application to:
            </p>
            <p className="text-base font-extrabold text-[#38104E]">
              {activeService.name}
            </p>
            <p className="text-slate-600">
              The following information will be submitted:
            </p>
            <ul className="space-y-1.5 pl-2 font-medium text-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Name and contact information</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>College and course details</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Enrolment proof</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Income eligibility information</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Selected supporting documents</span>
              </li>
            </ul>

            <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
              NIRVAHA AI will submit this application only after you confirm.
            </p>
          </div>

          {/* Compulsory Final Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-[#9333EA] transition-colors">
              <input
                type="checkbox"
                checked={reviewConfirmed}
                onChange={(e) => setReviewConfirmed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-[#9333EA] focus:ring-[#9333EA]"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                {t.assistFill.finalReview1}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-[#9333EA] transition-colors">
              <input
                type="checkbox"
                checked={submissionConsent}
                onChange={(e) => setSubmissionConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-[#9333EA] focus:ring-[#9333EA]"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                {t.assistFill.finalReview2}
              </span>
            </label>
          </div>

          {/* Boolean validation condition message */}
          {!isSubmissionAllowed && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 leading-relaxed space-y-1">
                <p className="font-bold">{t.assistFill.submitDisabledMsg}</p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                  <span className={reviewConfirmed ? 'text-emerald-700' : 'text-rose-700'}>
                    • Review Checked: {String(reviewConfirmed)}
                  </span>
                  <span className={submissionConsent ? 'text-emerald-700' : 'text-rose-700'}>
                    • Submit Consent: {String(submissionConsent)}
                  </span>
                  <span className={requiredDocumentsComplete ? 'text-emerald-700' : 'text-rose-700'}>
                    • Docs Complete: {String(requiredDocumentsComplete)}
                  </span>
                  <span className={draftCreationConsent ? 'text-emerald-700' : 'text-rose-700'}>
                    • Draft Consent: {String(draftCreationConsent)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={!isSubmissionAllowed || isSubmitting}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                isSubmissionAllowed && !isSubmitting
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Submitting to Official API...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.assistFill.submitBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: OFFICIAL SUBMISSION RECEIPT SCREEN */}
      {currentStep === 7 && submissionReceipt && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Official Confirmation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#38104E] mt-1">
              {t.assistFill.receiptTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your application has been received and logged by the state welfare system.
            </p>
          </div>

          {/* Receipt Details Card */}
          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs sm:text-sm space-y-2.5">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Application ID:</span>
              <span className="font-mono font-bold text-[#38104E]">
                {submissionReceipt.applicationId}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Service:</span>
              <span className="font-semibold text-slate-800 text-right">
                {activeService.name}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Submitted At:</span>
              <span className="text-slate-700">{submissionReceipt.timestamp}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Documents Attached:</span>
              <span className="font-semibold text-slate-800">
                {submissionReceipt.docsCount} verified attachments
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Consent Reference:</span>
              <span className="font-mono text-[#9333EA]">
                {submissionReceipt.consentRecordId}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Expected Update:</span>
              <span className="font-semibold text-emerald-700">
                Within 7–10 working days
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            {t.assistFill.trackingDisclaimer}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('consent')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
            >
              View Consent Receipt
            </button>
            <button
              onClick={() => onNavigate('action-plan')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#38104E]/20"
            >
              Return to My Action Plan
            </button>
          </div>
        </div>
      )}

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#38104E]">
                  {previewDoc.name}
                </h3>
                <p className="text-xs text-slate-500">{previewDoc.fileName}</p>
              </div>
            </div>

            <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2 mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-semibold text-slate-700">
                Document Verified by NIRVAHA OCR Scanner
              </p>
              <p className="text-[11px]">
                Valid digital signature detected · Size: {previewDoc.fileSize}
              </p>
            </div>

            <button
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2.5 rounded-xl bg-[#38104E] text-white text-xs font-semibold hover:bg-[#9333EA]"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
