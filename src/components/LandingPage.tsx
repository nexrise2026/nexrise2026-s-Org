import React from 'react';
import { 
  GraduationCap, 
  HeartHandshake, 
  CloudRain, 
  Accessibility, 
  MapPin, 
  Mic, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Compass, 
  FileCheck, 
  Clock, 
  Users, 
  Volume2,
  FolderLock
} from 'lucide-react';
import { Language, LifeEventId } from '../types';
import { lifeEventOptions } from '../data/mockData';
import { getTranslation } from '../locales/translations';

interface LandingPageProps {
  language: Language;
  onSelectLifeEvent: (eventId: LifeEventId) => void;
  onNavigate: (tab: string) => void;
  onVoiceStart: () => void;
  onStartWithSituation?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onSelectLifeEvent,
  onNavigate,
  onVoiceStart,
  onStartWithSituation,
}) => {
  const t = getTranslation(language);

  const getIcon = (name: string) => {
    switch (name) {
      case 'GraduationCap': return GraduationCap;
      case 'HeartHandshake': return HeartHandshake;
      case 'CloudRain': return CloudRain;
      case 'Accessibility': return Accessibility;
      case 'MapPin': return MapPin;
      default: return Compass;
    }
  };

  const handleHeroMicToggle = () => {
    // Immediately open the AgentChat component (the AI Guide tab) and auto-start listening
    onVoiceStart();
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-16 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF5FF] via-white to-[#FAF7FD] pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 border-b border-purple-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#9333EA]/20 text-[#38104E] text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#9333EA]" />
            <span>{t.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#38104E] tracking-tight leading-tight sm:leading-tight">
            {t.heroHeadline.split('\n').map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.heroSubhead}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onStartWithSituation) {
                  onStartWithSituation();
                } else {
                  onNavigate('agent');
                }
              }}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#38104E] hover:bg-[#4D166A] text-white font-semibold text-sm sm:text-base transition-all shadow-md shadow-[#38104E]/20 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>{t.startWithSituation}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('directory')}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-purple-50 text-[#38104E] font-semibold text-sm sm:text-base border border-purple-200 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#9333EA]" />
              <span>{t.exploreServices}</span>
            </button>

            <button
              onClick={() => onNavigate('vault')}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-purple-100 hover:bg-purple-200/70 text-[#38104E] font-semibold text-sm sm:text-base border border-purple-200 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <FolderLock className="w-4 h-4 text-[#9333EA]" />
              <span>{language === 'kn' ? 'ದಾಖಲೆಗಳ ವಾಲ್ಟ್ & ಸ್ಕಾಲರ್‌ಶಿಪ್‌ಗಳು' : 'Document Vault & Scholarships'}</span>
            </button>
          </div>

          {/* Large Accessible Microphone Interaction */}
          <div className="pt-3 max-w-xs mx-auto">
            <div className="bg-white px-6 py-4 rounded-2xl border border-purple-200/80 shadow-sm flex flex-col items-center gap-2.5 hover:border-[#9333EA]/40 transition-colors">
              <button
                onClick={handleHeroMicToggle}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all bg-[#9333EA] hover:bg-[#38104E] text-white shadow-md shadow-[#9333EA]/30 hover:scale-105 active:scale-95"
                title="Speak to NIRVAHA AI"
                aria-label="Speak to NIRVAHA AI"
              >
                <Mic className="w-7 h-7" />
              </button>
              <span className="text-xs sm:text-sm font-semibold text-[#38104E] text-center">
                {t.speakToNirvaha}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-b border-purple-100 py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{t.trustStrip.verified}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#9333EA] shrink-0" />
            <span className="font-semibold">{t.trustStrip.consent}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-700">
            <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{t.trustStrip.languages}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-700">
            <Users className="w-4 h-4 text-purple-700 shrink-0" />
            <span className="font-semibold">{t.trustStrip.humanHelp}</span>
          </div>
        </div>
      </section>

      {/* Clickable Life Event Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
              {language === 'kn' ? 'ಜೀವನದ ಘಟನೆಗಳು' : 'Select What Changed'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#38104E] tracking-tight">
              {language === 'kn' ? 'ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಆರಿಸಿ' : 'Choose Your Current Situation'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            {language === 'kn' 
              ? 'ಯಾವುದೇ ಘಟನೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಹಂತ-ಹಂತದ ಪರಿಶೀಲಿಸಿದ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.' 
              : 'Click any scenario below to immediately start your step-by-step navigation journey.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {lifeEventOptions.map((event, index) => {
            const Icon = getIcon(event.iconName);
            const isFeatured = event.id === 'student_fees';
            return (
              <div
                key={event.id}
                onClick={() => onSelectLifeEvent(event.id)}
                className={`group relative bg-white rounded-2xl p-5 sm:p-6 border transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                  isFeatured 
                    ? 'border-[#9333EA] ring-2 ring-[#9333EA]/20 shadow-md' 
                    : 'border-slate-200 hover:border-[#9333EA]/50 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center group-hover:bg-[#38104E] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    {isFeatured && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {language === 'kn' ? 'ಮುಖ್ಯ ಡೆಮೊ' : 'Main Demo'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#38104E] group-hover:text-[#9333EA] transition-colors leading-snug">
                    {language === 'kn' ? event.titleKn : event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal leading-relaxed">
                    {language === 'kn' ? event.descriptionKn : event.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-purple-50 flex items-center justify-between text-xs font-semibold text-[#9333EA]">
                  <span>{language === 'kn' ? 'ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ' : 'Start Journey'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How NIRVAHA AI Works Section */}
      <section className="bg-purple-50/40 border-t border-b border-purple-100 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
              {language === 'kn' ? 'ಸರಳ ಪ್ರಕ್ರಿಯೆ' : 'Simple Process'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#38104E] mt-1">
              {t.howItWorksTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {t.howItWorksSteps.map((stepItem, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-purple-100 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#38104E] text-white flex items-center justify-center font-bold text-sm mb-3">
                    {stepItem.step}
                  </div>
                  <h4 className="text-sm font-bold text-[#38104E] leading-snug">
                    {stepItem.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal">
                    {stepItem.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {t.footerDisclaimer}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600 pt-2">
            <span>Hackathon: Agentic AI for Billions</span>
            <span>·</span>
            <span>Consent-First Architecture</span>
            <span>·</span>
            <span>Grounded in Official Sources</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
