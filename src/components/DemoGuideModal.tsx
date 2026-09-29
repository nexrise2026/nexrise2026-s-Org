import React from 'react';
import {
  Sparkles,
  X,
  Play,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  Volume2,
  Users,
  Layers,
  Globe,
  ArrowRight
} from 'lucide-react';
import { LifeEventId, Language, SUPPORTED_LANGUAGES } from '../types';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerDemo: (scenario: LifeEventId) => void;
  onSwitchLanguage: (lang: Language) => void;
  onOpenAssistFill: () => void;
  onOpenConsent: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onTriggerDemo,
  onSwitchLanguage,
  onOpenAssistFill,
  onOpenConsent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#38104E]">
              Hackathon Evaluation & Demo Guide
            </h2>
            <p className="text-xs text-slate-500">
              Agentic AI for Billions · 1-Click Interactive Walkthrough
            </p>
          </div>
        </div>

        <div className="space-y-4 my-5 text-xs sm:text-sm">
          {/* Main Demo Flow */}
          <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#9333EA]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#38104E] text-sm">
                1. Main Demo Flow: Student Financial Distress
              </span>
              <button
                onClick={() => {
                  onTriggerDemo('student_fees');
                  onClose();
                }}
                className="px-3 py-1 rounded-xl bg-[#38104E] text-white font-bold text-xs hover:bg-[#9333EA] flex items-center gap-1 shadow-xs"
              >
                <Play className="w-3 h-3" />
                <span>Run Demo Flow</span>
              </button>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              Simulates: <em>"My family income has reduced. I am studying engineering and may not be able to pay my fees."</em> Guides user through question check, verified fee support grant, bonafide & income verification, and action planning.
            </p>
          </div>

          {/* AssistFill Feature */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#38104E] text-sm">
                2. NIRVAHA AssistFill (“Review before you submit”)
              </span>
              <button
                onClick={() => {
                  onOpenAssistFill();
                  onClose();
                }}
                className="px-3 py-1 rounded-xl bg-[#9333EA] text-white font-bold text-xs hover:bg-[#38104E] flex items-center gap-1 shadow-xs"
              >
                <FileCheck className="w-3 h-3" />
                <span>Test AssistFill</span>
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Demonstrates strict 6-condition Boolean evaluation: Draft Consent → Form Draft → Document Upload → Review → Final Confirmation → Receipt with audit receipt.
            </p>
          </div>

          {/* Multilingual Experience - All 8 Languages */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#38104E] text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#9333EA]" />
                <span>3. Pan-India Multilingual & Voice Experience (8 Languages)</span>
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Test instant seamless switching across UI copy, AI guidance, action plans, AssistFill drafts, and voice speech-to-text / text-to-speech:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {SUPPORTED_LANGUAGES.map((langItem) => (
                <button
                  key={langItem.code}
                  onClick={() => onSwitchLanguage(langItem.code)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#9333EA] bg-white text-slate-800 text-xs font-semibold hover:shadow-xs transition-all flex flex-col items-center"
                >
                  <span className={`${langItem.fontClass} text-sm font-bold text-[#38104E]`}>
                    {langItem.nativeName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {langItem.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Life Event Triggers */}
          <div className="space-y-1.5 pt-1">
            <span className="font-bold text-slate-700 block text-xs">
              Additional 4 Life Event Demonstrations:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onTriggerDemo('crop_loss');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#9333EA] text-left hover:bg-slate-50 transition-colors font-medium text-slate-800"
              >
                🌾 Crop Damage (72-Hr Relief)
              </button>
              <button
                onClick={() => {
                  onTriggerDemo('loss_of_earner');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#9333EA] text-left hover:bg-slate-50 transition-colors font-medium text-slate-800"
              >
                🤝 Bereavement & Survivor Welfare
              </button>
              <button
                onClick={() => {
                  onTriggerDemo('disability');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#9333EA] text-left hover:bg-slate-50 transition-colors font-medium text-slate-800"
              >
                ♿ Disability & UDID Pass
              </button>
              <button
                onClick={() => {
                  onTriggerDemo('relocation');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#9333EA] text-left hover:bg-slate-50 transition-colors font-medium text-slate-800"
              >
                📍 Relocation & Porting Flow
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
