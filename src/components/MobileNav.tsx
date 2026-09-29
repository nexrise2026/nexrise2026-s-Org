import React from 'react';
import { Home, Bot, CheckSquare, FileText, FolderLock } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../locales/translations';

interface MobileNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  language: Language;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onNavigate, language }) => {
  const t = getTranslation(language);

  const tabs = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'agent', label: t.nav.agent, icon: Bot },
    { id: 'vault', label: language === 'kn' ? 'ವಾಲ್ಟ್' : 'Vault', icon: FolderLock },
    { id: 'assist-fill', label: t.nav.assistFill, icon: FileText },
    { id: 'action-plan', label: t.nav.actionPlan, icon: CheckSquare },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 shadow-lg pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive ? 'text-[#38104E]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#FAF5FF] text-[#9333EA]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-[64px] ${
                  isActive ? 'font-bold text-[#38104E]' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
