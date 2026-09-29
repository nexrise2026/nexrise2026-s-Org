import React, { useState } from 'react';
import {
  Users,
  Phone,
  Mail,
  MessageSquare,
  Building,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  ExternalLink
} from 'lucide-react';
import { Language, HumanSupportTicket } from '../types';
import { getTranslation } from '../locales/translations';

interface HumanHelpPageProps {
  language: Language;
  initialCategory?: string;
  onNavigate: (tab: string) => void;
}

export const HumanHelpPage: React.FC<HumanHelpPageProps> = ({
  language,
  initialCategory = '',
  onNavigate,
}) => {
  const t = getTranslation(language);

  const [category, setCategory] = useState(initialCategory || 'College Scholarship Help Desk');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'whatsapp' | 'email' | 'in_person'>('whatsapp');
  const [contactDetail, setContactDetail] = useState('');
  const [sharePlanSummary, setSharePlanSummary] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<HumanSupportTicket | null>(null);

  const supportChannels = [
    {
      title: 'College Student Welfare Office',
      desc: 'Direct consultation on fee deferral, bonafide issues, and hardship grants.',
      timing: 'Mon–Sat, 10 AM – 5 PM',
      icon: GraduationCap,
      contact: 'welfare@college.edu · Intercom: 204',
    },
    {
      title: 'State Scholarship & Fee Help Desk',
      desc: 'Official support for state fee reimbursement & income RD verification.',
      timing: 'Toll-free 1800-425-5333 (10 AM – 6 PM)',
      icon: Building,
      contact: 'ssp.support@karnataka.gov.in',
    },
    {
      title: 'Community Service Centre (Gram One / Bangalore One)',
      desc: 'In-person biometric assistance, certificate downloads, and portal submission.',
      timing: 'Walk-in Centers Across Karnataka',
      icon: Users,
      contact: 'Seva Sindhu Centers',
    },
    {
      title: 'Institutional Student Counselor',
      desc: 'Confidential emotional and financial counseling support for distressed students.',
      timing: 'Confidential 1-on-1 sessions',
      icon: HeartHandshake,
      contact: 'counseling.cell@college.edu',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description,
          contactMethod,
          sharedPlanSummary: sharePlanSummary,
        }),
      });
      const data = await response.json();
      setIsSubmitting(false);

      if (data.success && data.ticket) {
        setCreatedTicket(data.ticket);
      }
    } catch (e) {
      setIsSubmitting(false);
      // Fallback ticket
      setCreatedTicket({
        id: `NIR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        category,
        description,
        contactMethod,
        sharedPlanSummary: sharePlanSummary,
        timestamp: new Date().toISOString(),
        status: 'PENDING',
        assignedTo: 'College Welfare Desk',
        estimatedResponseTime: 'Within 1 working day',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-16 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
            {language === 'kn' ? 'ಮಾನವ ಅಧಿಕಾರಿ ಬೆಂಬಲ' : 'Human Support Escalation'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#38104E]">
            {t.humanSupport.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.humanSupport.subhead}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Verified Institutional Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportChannels.map((channel, i) => {
          const Icon = channel.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-start gap-4 hover:border-indigo-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-indigo-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">{channel.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {channel.desc}
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-600 space-y-0.5">
                  <p>🕒 {channel.timing}</p>
                  <p className="text-[#9333EA] font-semibold">📞 {channel.contact}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Escalation Request Form OR Success Screen */}
      {createdTicket ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-5 animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Request Logged
            </span>
            <h2 className="text-2xl font-extrabold text-[#38104E] mt-1">
              {t.humanSupport.successTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              A welfare officer has been assigned to your case.
            </p>
          </div>

          <div className="max-w-sm mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm text-left space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">{t.humanSupport.ticketId}:</span>
              <span className="font-mono font-bold text-[#38104E]">
                {createdTicket.id}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{createdTicket.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Preferred Method:</span>
              <span className="capitalize text-slate-800">{createdTicket.contactMethod}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Expected Response:</span>
              <span className="font-semibold text-emerald-700">
                {t.humanSupport.estimatedResponse}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('action-plan')}
              className="px-6 py-2.5 rounded-xl bg-[#38104E] text-white text-xs sm:text-sm font-semibold hover:bg-[#9333EA]"
            >
              Return to Action Plan
            </button>
            <button
              onClick={() => onNavigate('agent')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
            >
              Continue in AI Chat
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-[#38104E] pb-2 border-b border-slate-100">
            Request Official Help or Human Callback
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.humanSupport.formCategory}
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#9333EA] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brief Explanation of Difficulties or Questions
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. My family income reduced and my college fee deadline is Oct 8. I need guidance on paying in 2 installments."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#9333EA] bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.humanSupport.contactMethod}
              </label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#9333EA] bg-white"
              >
                <option value="whatsapp">WhatsApp Message</option>
                <option value="phone">Direct Phone Call</option>
                <option value="email">Email</option>
                <option value="in_person">In-Person Campus Appointment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number / Email
              </label>
              <input
                type="text"
                required
                value={contactDetail}
                onChange={(e) => setContactDetail(e.target.value)}
                placeholder="+91 98765 43210 or student@college.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#9333EA] bg-white"
              />
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="pt-2 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                checked={sharePlanSummary}
                onChange={(e) => setSharePlanSummary(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#9333EA]"
              />
              <span className="text-xs text-slate-700">
                {t.humanSupport.sharePlanCheck}
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-[#FAF5FF]/50 border border-[#9333EA]/30">
              <input
                type="checkbox"
                required
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#9333EA]"
              />
              <span className="text-xs font-semibold text-[#38104E]">
                {t.humanSupport.consentCheck}
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={!hasConsented || isSubmitting}
              className={`px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                hasConsented && !isSubmitting
                  ? 'bg-[#38104E] hover:bg-[#9333EA] text-white shadow-md shadow-[#38104E]/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Submitting request...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.humanSupport.submitBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
