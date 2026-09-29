import React, { useState } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Language, VerifiedService, UserType, LifeEventId } from '../types';
import { mockVerifiedServices } from '../data/mockData';
import { getTranslation } from '../locales/translations';

interface ServiceDirectoryPageProps {
  language: Language;
  onSelectService: (service: VerifiedService) => void;
  onOpenAssistFill: (service: VerifiedService) => void;
  onNavigate: (tab: string) => void;
}

export const ServiceDirectoryPage: React.FC<ServiceDirectoryPageProps> = ({
  language,
  onSelectService,
  onOpenAssistFill,
  onNavigate,
}) => {
  const t = getTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLifeEvent, setSelectedLifeEvent] = useState<string>('all');

  const categories = ['all', 'Education', 'Agriculture', 'Social Welfare', 'Disability', 'Civic'];

  const filteredServices = mockVerifiedServices.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || srv.category === selectedCategory;

    const matchesLifeEvent =
      selectedLifeEvent === 'all' || srv.applicableLifeEvents.includes(selectedLifeEvent as LifeEventId);

    return matchesSearch && matchesCategory && matchesLifeEvent;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-16 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
            {language === 'kn' ? 'ಪರಿಶೀಲಿಸಿದ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು' : 'Public Service Directory'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#38104E]">
            {t.nav.directory}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified welfare schemes, institutional grants, and civic porting workflows.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
      </div>

      {/* Mandatory Demo Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Prototype demo data. Always verify details and application deadlines on the official portal before applying.
        </span>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships, documents, benefits, service centres, or support..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA] bg-white"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#38104E] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredServices.map((service) => {
          const displayName = language === 'kn' ? service.nameKn : service.name;
          const displayPurpose = language === 'kn' ? service.purposeKn : service.purpose;

          return (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-[#9333EA]/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9333EA]">
                    {service.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {service.officialDomain}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#38104E] leading-snug">
                  {displayName}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                  {displayPurpose}
                </p>

                {/* Common Documents needed */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">
                    Documents Needed:
                  </span>
                  <ul className="space-y-0.5 text-slate-600">
                    {service.documentsRequired.slice(0, 3).map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]" />
                        <span className="truncate">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deadline & Verification status */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{service.deadlineText}</span>
                  </span>
                  <span>Verified: {service.lastVerifiedDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={service.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-600 hover:text-[#38104E] flex items-center gap-1"
                >
                  <span>Rules</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectService(service);
                      onNavigate('agent');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    Check Eligibility
                  </button>

                  <button
                    onClick={() => {
                      onSelectService(service);
                      onOpenAssistFill(service);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
                  >
                    <span>AssistFill</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
