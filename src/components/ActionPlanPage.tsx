import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Download,
  Bell,
  BellRing,
  HelpCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Language, ActionTask, TaskStatus } from '../types';
import { initialActionTasks } from '../data/mockData';
import { getTranslation } from '../locales/translations';

interface ActionPlanPageProps {
  language: Language;
  onNavigate: (tab: string) => void;
  onOpenHumanSupport: (category?: string) => void;
}

export const ActionPlanPage: React.FC<ActionPlanPageProps> = ({
  language,
  onNavigate,
  onOpenHumanSupport,
}) => {
  const t = getTranslation(language);
  const [tasks, setTasks] = useState<ActionTask[]>([...initialActionTasks]);
  const [reminderToast, setReminderToast] = useState<string>('');

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const nearestDeadline = Math.min(...tasks.map((t) => t.deadlineDays));
  const missingDocsCount = 1; // income cert

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus: TaskStatus = t.status === 'completed' ? 'in_progress' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleToggleReminder = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newState = !t.reminderEnabled;
          if (newState) {
            setReminderToast(`Reminder scheduled for "${language === 'kn' ? t.titleKn : t.title}" (Oct 3, 2026).`);
            setTimeout(() => setReminderToast(''), 3000);
          }
          return { ...t, reminderEnabled: newState };
        }
        return t;
      })
    );
  };

  const handleDownloadChecklist = () => {
    const content = `NIRVAHA AI - Personal Service Action Plan\nGenerated: ${new Date().toLocaleDateString()}\nStatus: ${completedCount} of ${tasks.length} tasks completed\n\n` +
      tasks.map((t, i) => `${i + 1}. [${t.status === 'completed' ? 'X' : ' '}] ${t.title}\n   Why: ${t.whyNeeded}\n   Deadline: ${t.deadlineDate}\n   Required Documents: ${t.requiredDocuments.join(', ')}\n`).join('\n') +
      `\nDisclaimer: Final eligibility and service approval remain with the relevant authority.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nirvaha_Action_Plan_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-16 space-y-6">
      {/* Toast Alert for Reminders */}
      {reminderToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#38104E] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
          <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Action Plan Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider">
            {language === 'kn' ? 'ಕ್ರಿಯಾ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ' : 'Personal Action Plan'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#38104E]">
            {t.actionPlan.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.actionPlan.subhead}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadChecklist}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.actionPlan.downloadChecklist}</span>
          </button>
          <button
            onClick={() => onNavigate('assist-fill')}
            className="px-4 py-2 rounded-xl bg-[#38104E] hover:bg-[#9333EA] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Open AssistFill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Tasks Complete */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Task Progress</span>
            <span className="font-bold text-[#38104E]">{progressPercent}%</span>
          </div>
          <div className="text-xl font-extrabold text-[#38104E]">
            {completedCount} of {tasks.length} {t.actionPlan.completedOf}
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#9333EA] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Deadline */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold block">
            {t.actionPlan.deadlineWarning}
          </span>
          <div className="text-2xl font-extrabold text-amber-600 flex items-center gap-2">
            <Clock className="w-6 h-6 shrink-0" />
            <span>{nearestDeadline} Days</span>
          </div>
          <span className="text-xs text-slate-500 block">
            Portal closes strictly on Oct 8, 2026
          </span>
        </div>

        {/* Metric 3: Missing Documents */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold block">
            Document Readiness
          </span>
          <div className="text-2xl font-extrabold text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span>{missingDocsCount} Missing</span>
          </div>
          <span className="text-xs text-slate-500 block">
            Income certificate verification pending
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-[#38104E]">
            Prioritized Action Timeline
          </h2>
          <span className="text-xs text-slate-400">
            Check off items as you complete them
          </span>
        </div>

        <div className="space-y-3">
          {tasks.map((task, idx) => {
            const isDone = task.status === 'completed';
            const displayTitle = language === 'kn' ? task.titleKn : task.title;
            const displayWhy = language === 'kn' ? task.whyNeededKn : task.whyNeeded;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 hover:border-[#9333EA]/50 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Mark complete checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-[#9333EA] bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {idx + 1}. {displayTitle}
                      </h3>

                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-800'
                              : task.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.actionPlan.taskStatus[task.status]}
                        </span>

                        {/* Reminder bell */}
                        <button
                          onClick={() => handleToggleReminder(task.id)}
                          className={`p-1 rounded-md transition-colors ${
                            task.reminderEnabled
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-slate-300 hover:text-slate-600'
                          }`}
                          title="Toggle deadline reminder"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {displayWhy}
                    </p>

                    {/* Metadata & Actions row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Deadline: {task.deadlineDate}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Required: {task.requiredDocuments.join(', ')}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.officialLink && (
                          <a
                            href={task.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#9333EA] hover:underline flex items-center gap-1"
                          >
                            <span>Open Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => onOpenHumanSupport(`Help with task: ${task.title}`)}
                          className="font-semibold text-slate-600 hover:text-[#38104E] flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Need help?</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Shortcuts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 rounded-3xl bg-[#FAF5FF] border border-[#9333EA]/20">
        <div>
          <h4 className="text-sm font-bold text-[#38104E]">
            Stuck or unsure about any step?
          </h4>
          <p className="text-xs text-slate-600">
            You can return to the AI Assistant or escalate to verified human support staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('agent')}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-[#38104E] border border-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            {t.actionPlan.returnToAI}
          </button>
          <button
            onClick={() => onOpenHumanSupport('Action Plan Assistance')}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#38104E] text-white text-xs font-semibold hover:bg-[#9333EA] transition-colors"
          >
            {t.actionPlan.getHumanHelp}
          </button>
        </div>
      </div>
    </div>
  );
};
