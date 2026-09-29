import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { Language, ConsentReceipt, AuditLogEntry } from '../types';
import { initialConsentReceipts } from '../data/mockData';
import { getTranslation } from '../locales/translations';

interface ConsentCentrePageProps {
  language: Language;
  consentReceipts: ConsentReceipt[];
  onRevokeConsent: (receiptId: string) => void;
}

export const ConsentCentrePage: React.FC<ConsentCentrePageProps> = ({
  language,
  consentReceipts,
  onRevokeConsent,
}) => {
  const t = getTranslation(language);
  const [selectedReceiptToRevoke, setSelectedReceiptToRevoke] = useState<ConsentReceipt | null>(null);

  // System audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'AUD-901',
      timestamp: 'Today at 08:30 AM',
      action: 'CONSENT_GRANTED_DRAFT',
      category: 'CONSENT',
      details: 'Draft-creation authorization granted for Karnataka Student Fee Support Grant.',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-882',
      timestamp: 'Today at 08:15 AM',
      action: 'DATA_MINIMIZATION_ENFORCED',
      category: 'CONSENT',
      details: 'Filtered out bank credentials and Aadhaar numbers prior to state portal transmission.',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-741',
      timestamp: 'Yesterday at 04:10 PM',
      action: 'ONBOARDING_TERMS_ACCEPTED',
      category: 'CONSENT',
      details: 'User acknowledged guidance disclaimer without persistent telemetry tracking.',
      status: 'SUCCESS',
    },
  ]);

  const confirmRevocation = () => {
    if (!selectedReceiptToRevoke) return;

    onRevokeConsent(selectedReceiptToRevoke.id);

    // Call server API for revocation
    fetch('/api/consent/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentRecordId: selectedReceiptToRevoke.id,
        serviceName: selectedReceiptToRevoke.serviceName,
      }),
    }).catch(() => {});

    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now().toString().slice(-3)}`,
        timestamp: 'Just now',
        action: 'CONSENT_REVOKED_BY_USER',
        category: 'REVOCATION',
        details: `User explicitly revoked authorization for ${selectedReceiptToRevoke.serviceName}.`,
        status: 'REVOKED',
      },
      ...prev,
    ]);

    setSelectedReceiptToRevoke(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-16 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
            {language === 'kn' ? 'ಗೌಪ್ಯತೆ ನಿಯಂತ್ರಣ' : 'Privacy Control'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#38104E]">
            {t.consentCentre.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.consentCentre.subhead}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6" />
        </div>
      </div>

      {/* Privacy Metric Stat Banner */}
      <div className="bg-gradient-to-r from-[#38104E] to-[#9333EA] text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base sm:text-lg">
              {t.consentCentre.privacyStats}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            {t.consentCentre.protectedRatio}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-2xl font-black text-emerald-300">100%</span>
          <span className="block text-[11px] text-slate-200 uppercase font-semibold">
            User-Authorized
          </span>
        </div>
      </div>

      {/* Active Consent Receipts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-[#38104E]">
            {t.consentCentre.activeConsents}
          </h2>
          <span className="text-xs text-slate-400">
            {consentReceipts.length} Active Authorizations
          </span>
        </div>

        {consentReceipts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active data-sharing permissions granted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {consentReceipts.map((receipt) => {
              const isRevoked = receipt.status === 'Revoked';
              return (
                <div
                  key={receipt.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isRevoked
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 shadow-2xs hover:border-[#9333EA]/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Receipt ID: {receipt.id}
                      </span>
                      <h3 className="text-base font-bold text-[#38104E] mt-0.5">
                        {receipt.serviceName}
                      </h3>
                      <p className="text-xs text-slate-500">{receipt.purpose}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isRevoked
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        Status: {receipt.status}
                      </span>
                    </div>
                  </div>

                  {/* Data Shared Categories */}
                  <div className="py-3">
                    <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                      {t.consentCentre.dataShared}:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {receipt.dataShared.map((field, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{field}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dates & Revoke Action */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-4">
                      <span>Approved: {receipt.dateApproved}</span>
                      <span>Expires: {receipt.accessExpires}</span>
                    </div>

                    {!isRevoked && (
                      <button
                        onClick={() => setSelectedReceiptToRevoke(receipt)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.consentCentre.revokeBtn}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-[#38104E]">
            {t.consentCentre.auditLogTitle}
          </h2>
          <span className="text-xs text-slate-400 font-mono">Immutable Log</span>
        </div>

        <div className="space-y-2.5">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">{log.id}</span>
                  <span className="font-bold text-[#38104E]">{log.action}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {log.category}
                  </span>
                </div>
                <p className="text-slate-600">{log.details}</p>
              </div>

              <span className="text-slate-400 text-[11px] shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Revocation Confirmation Dialog */}
      {selectedReceiptToRevoke && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedReceiptToRevoke(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {t.consentCentre.revokeConfirmTitle}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {t.consentCentre.revokeConfirmText}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedReceiptToRevoke(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                {t.consentCentre.cancelBtn}
              </button>
              <button
                onClick={confirmRevocation}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
              >
                {t.consentCentre.revokeConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
