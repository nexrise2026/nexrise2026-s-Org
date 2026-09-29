import React, { useState } from 'react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { LandingPage } from './components/LandingPage';
import { AgentChat } from './components/AgentChat';
import { ActionPlanPage } from './components/ActionPlanPage';
import { AssistFillPage } from './components/AssistFillPage';
import { ConsentCentrePage } from './components/ConsentCentrePage';
import { ServiceDirectoryPage } from './components/ServiceDirectoryPage';
import { HumanHelpPage } from './components/HumanHelpPage';
import { AdminPortalPage } from './components/AdminPortalPage';
import { CitizenVaultPage } from './components/CitizenVaultPage';
import { ScholarshipMatchboard } from './components/ScholarshipMatchboard';
import { OnboardingModal } from './components/OnboardingModal';
import { DemoGuideModal } from './components/DemoGuideModal';
import {
  Language,
  UserProfile,
  LifeEventId,
  VerifiedService,
  ConsentReceipt,
  UploadedDoc,
} from './types';
import { defaultUserProfile, mockVerifiedServices, initialConsentReceipts, initialUploadedDocuments } from './data/mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [userDocuments, setUserDocuments] = useState<UploadedDoc[]>([...initialUploadedDocuments]);
  const [selectedLifeEvent, setSelectedLifeEvent] = useState<LifeEventId | undefined>(undefined);
  const [startWithSituationTrigger, setStartWithSituationTrigger] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<VerifiedService>(mockVerifiedServices[0]);
  const [consentReceipts, setConsentReceipts] = useState<ConsentReceipt[]>([...initialConsentReceipts]);
  const [autoStartVoice, setAutoStartVoice] = useState<boolean>(false);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [humanHelpCategory, setHumanHelpCategory] = useState<string>('College Scholarship Help Desk');

  const handleSelectLifeEvent = (eventId: LifeEventId) => {
    setSelectedLifeEvent(eventId);
    setCurrentTab('agent');
  };

  const handleStartWithSituation = () => {
    setSelectedLifeEvent(undefined);
    setStartWithSituationTrigger((prev) => prev + 1);
    setCurrentTab('agent');
  };

  const handleOpenAssistFillForService = (service: VerifiedService) => {
    setSelectedService(service);
    setCurrentTab('assist-fill');
  };

  const handleOpenHumanSupport = (category?: string) => {
    if (category) setHumanHelpCategory(category);
    setCurrentTab('support');
  };

  const handleRevokeConsent = (receiptId: string) => {
    setConsentReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'Revoked' } : r))
    );
  };

  const handleAddConsentReceipt = (receipt: ConsentReceipt) => {
    setConsentReceipts((prev) => [receipt, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7FD] text-slate-900 flex flex-col selection:bg-[#9333EA]/20 selection:text-[#38104E]">
      {/* 3-Zone Top Navigation Header */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        language={language}
        onLanguageChange={setLanguage}
        userProfile={userProfile}
        onOpenProfile={() => setIsOnboardingOpen(true)}
      />

      {/* Main View Port Container */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && (
          <LandingPage
            language={language}
            onSelectLifeEvent={handleSelectLifeEvent}
            onNavigate={setCurrentTab}
            onVoiceStart={() => {
              setAutoStartVoice(true);
              setCurrentTab('agent');
            }}
            onStartWithSituation={handleStartWithSituation}
          />
        )}

        {currentTab === 'agent' && (
          <AgentChat
            language={language}
            onLanguageChange={setLanguage}
            userProfile={userProfile}
            userDocuments={userDocuments}
            onUpdateProfile={(updated) => setUserProfile({ ...userProfile, ...updated })}
            initialLifeEvent={selectedLifeEvent}
            startWithSituationTrigger={startWithSituationTrigger}
            autoStartVoice={autoStartVoice}
            onVoiceStarted={() => setAutoStartVoice(false)}
            onNavigate={setCurrentTab}
            onOpenAssistFill={handleOpenAssistFillForService}
            onOpenActionPlan={() => setCurrentTab('action-plan')}
            onOpenHumanSupport={handleOpenHumanSupport}
            onOpenVault={() => setCurrentTab('vault')}
          />
        )}

        {currentTab === 'action-plan' && (
          <ActionPlanPage
            language={language}
            onNavigate={setCurrentTab}
            onOpenHumanSupport={handleOpenHumanSupport}
          />
        )}

        {currentTab === 'scholarships' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#38104E] tracking-tight">
                  {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿವೇತನಗಳ ಮ್ಯಾಚ್‌ಬೋರ್ಡ್' : 'Student Scholarship Matchboard'}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {language === 'kn'
                    ? 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ವಾಲ್ಟ್ ದಾಖಲೆಗಳ ಆಧಾರದ ಮೇಲೆ ಎಲ್ಲಾ ಲಭ್ಯವಿರುವ ಅಧಿಕೃತ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು'
                    : 'All available official scholarships matched with student profile and vault documents'}
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('vault')}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200/80 text-[#38104E] text-xs font-semibold rounded-xl border border-purple-200 flex items-center gap-1.5 transition-colors"
              >
                <span>{language === 'kn' ? 'ದಾಖಲೆಗಳ ವಾಲ್ಟ್ ತೆರೆಯಿರಿ' : 'Open Document Vault'}</span>
              </button>
            </div>
            <ScholarshipMatchboard
              language={language}
              userProfile={userProfile}
              userDocuments={userDocuments}
              onOpenAssistFill={handleOpenAssistFillForService}
              onOpenVault={() => setCurrentTab('vault')}
            />
          </div>
        )}

        {currentTab === 'vault' && (
          <CitizenVaultPage
            language={language}
            userProfile={userProfile}
            userDocuments={userDocuments}
            onUpdateProfile={(updated) => setUserProfile({ ...userProfile, ...updated })}
            onUpdateDocuments={setUserDocuments}
            onOpenAssistFill={handleOpenAssistFillForService}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'assist-fill' && (
          <AssistFillPage
            language={language}
            userProfile={userProfile}
            userDocuments={userDocuments}
            selectedService={selectedService}
            onSelectService={setSelectedService}
            onNavigate={setCurrentTab}
            onAddConsentReceipt={handleAddConsentReceipt}
          />
        )}

        {currentTab === 'consent' && (
          <ConsentCentrePage
            language={language}
            consentReceipts={consentReceipts}
            onRevokeConsent={handleRevokeConsent}
          />
        )}

        {currentTab === 'directory' && (
          <ServiceDirectoryPage
            language={language}
            onSelectService={setSelectedService}
            onOpenAssistFill={handleOpenAssistFillForService}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'support' && (
          <HumanHelpPage
            language={language}
            initialCategory={humanHelpCategory}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPortalPage language={language} />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        language={language}
      />

      {/* Profile & Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={userProfile}
        onSaveProfile={setUserProfile}
        language={language}
      />

      {/* Hackathon 1-Click Evaluation Guide Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onTriggerDemo={(scenario) => {
          setSelectedLifeEvent(scenario);
          setCurrentTab('agent');
        }}
        onSwitchLanguage={setLanguage}
        onOpenAssistFill={() => setCurrentTab('assist-fill')}
        onOpenConsent={() => setCurrentTab('consent')}
      />
    </div>
  );
}
