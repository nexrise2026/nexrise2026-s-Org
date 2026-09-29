import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Volume2,
  VolumeX,
  Users,
  CheckSquare,
  Sparkles,
  Info,
  Calendar,
  Layers,
  X,
  Trash2
} from 'lucide-react';
import { Language, UserProfile, VerifiedService, ChatMessage, LifeEventId, EligibilityStatus, UploadedDoc } from '../types';
import { mockVerifiedServices } from '../data/mockData';
import { getTranslation } from '../locales/translations';
import { VoiceAssistant } from '../utils/audio';
import { ScholarshipMatchboard } from './ScholarshipMatchboard';
import { NirvahaLogo } from './NirvahaLogo';

let messageCounter = 0;
const generateMsgId = (prefix: string) => {
  messageCounter += 1;
  return `${prefix}-${Date.now()}-${messageCounter}-${Math.random().toString(36).slice(2, 7)}`;
};

const STORAGE_KEY = 'nirvaha_chat_messages_v1';

// Helper for default greeting
const createDefaultGreeting = (): ChatMessage => ({
  id: generateMsgId('agent-greeting'),
  sender: 'agent',
  text: 'How can I help you?',
  textKn: 'ನಿಮಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  label: 'AI Guidance',
});

interface AgentChatProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userProfile: UserProfile;
  userDocuments: UploadedDoc[];
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  initialLifeEvent?: LifeEventId;
  startWithSituationTrigger?: number;
  autoStartVoice?: boolean;
  onVoiceStarted?: () => void;
  onNavigate: (tab: string) => void;
  onOpenAssistFill: (service: VerifiedService) => void;
  onOpenActionPlan: () => void;
  onOpenHumanSupport: (category?: string) => void;
  onOpenVault?: () => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  language,
  onLanguageChange,
  userProfile,
  userDocuments,
  onUpdateProfile,
  initialLifeEvent,
  startWithSituationTrigger,
  autoStartVoice,
  onVoiceStarted,
  onNavigate,
  onOpenAssistFill,
  onOpenActionPlan,
  onOpenHumanSupport,
  onOpenVault,
}) => {
  const t = getTranslation(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const capturedTextRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [activeWhyResultService, setActiveWhyResultService] = useState<VerifiedService | null>(null);
  const [isLoadingReply, setIsLoadingReply] = useState(false);

  // Initial welcome message from localStorage or default "How can I help you?"
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to load chat history from localStorage:', err);
      }
    }
    return [createDefaultGreeting()];
  });

  // Track student questionnaire step if active
  const [studentFlowStep, setStudentFlowStep] = useState<number>(0);
  const handledInitialLifeEventRef = useRef<string | null>(null);
  const handledStartWithSituationRef = useRef<number>(0);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingReply]);

  // Persist conversation log to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.warn('Failed to save chat history to localStorage:', err);
      }
    }
  }, [messages]);

  // Handle "Start with my situation" trigger from Landing Page
  useEffect(() => {
    if (startWithSituationTrigger && startWithSituationTrigger > handledStartWithSituationRef.current) {
      handledStartWithSituationRef.current = startWithSituationTrigger;
      // Reset any active sub-flow
      setStudentFlowStep(0);
      setInputMessage('');
      // Focus input field so user can immediately type or click mic
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      // Ensure the chatbot displays "How can I help you?"
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === 'agent' && (last.text === 'How can I help you?' || last.textKn === 'ನಿಮಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?')) {
          return prev;
        }
        return [...prev, createDefaultGreeting()];
      });
    }
  }, [startWithSituationTrigger]);

  // Handle initial life event trigger if passed from landing page
  useEffect(() => {
    if (initialLifeEvent && handledInitialLifeEventRef.current !== initialLifeEvent) {
      handledInitialLifeEventRef.current = initialLifeEvent;
      if (initialLifeEvent === 'student_fees') {
        triggerStudentDistressDemo();
      } else if (initialLifeEvent === 'loss_of_earner') {
        triggerLossOfEarnerDemo();
      } else if (initialLifeEvent === 'crop_loss') {
        triggerCropLossDemo();
      } else if (initialLifeEvent === 'disability') {
        triggerDisabilityDemo();
      } else if (initialLifeEvent === 'relocation') {
        triggerRelocationDemo();
      }
    }
  }, [initialLifeEvent]);

  // Handle autoStartVoice trigger from Landing Page mic
  useEffect(() => {
    if (autoStartVoice) {
      onVoiceStarted?.();
      const timer = setTimeout(() => {
        startVoiceCapture();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoStartVoice]);

  // Voice output playback toggle
  const handleToggleVoice = (msgId: string, text: string) => {
    if (isSpeakingId === msgId) {
      VoiceAssistant.stopSpeaking();
      setIsSpeakingId(null);
    } else {
      setIsSpeakingId(msgId);
      VoiceAssistant.speak(text, language, () => {
        setIsSpeakingId(null);
      });
    }
  };

  // Start voice listening with language and auto-submission
  const startVoiceCapture = () => {
    if (isListening) return;
    setIsListening(true);
    setMicNotice(null);
    capturedTextRef.current = '';

    VoiceAssistant.startListening(
      language,
      (transcript) => {
        capturedTextRef.current = transcript;
        setInputMessage(transcript);
      },
      (err) => {
        console.warn('Voice capture status:', err);
        setIsListening(false);
        const errMsg = typeof err === 'string' ? err : (err?.error || '');
        if (errMsg === 'not-allowed' || errMsg === 'permission-denied') {
          setMicNotice(language === 'kn' ? 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿಸಿ.' : 'Microphone access is blocked. Please allow mic permission in your browser to speak.');
        } else if (errMsg === 'no-speech') {
          setMicNotice(language === 'kn' ? 'ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ.' : 'No voice detected. Please click the mic and speak your query.');
        } else {
          setMicNotice(language === 'kn' ? 'ಧ್ವನಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ನೀವು ಟೈಪ್ ಮಾಡಬಹುದು.' : 'Voice recognition ended. You can speak again or type your query.');
        }
        setTimeout(() => setMicNotice(null), 5000);
      },
      () => {
        setIsListening(false);
        const textToSend = capturedTextRef.current.trim() || inputMessage.trim();
        if (textToSend) {
          handleSendMessage(undefined, textToSend);
          capturedTextRef.current = '';
          setInputMessage('');
        }
      }
    );
  };

  // Mic button handler: starts taking voice input and automatically sends when complete
  const handleMicToggle = () => {
    if (isListening) {
      // User tapped mic while listening: stop listening and submit what was captured
      VoiceAssistant.stopListening();
      setIsListening(false);
      const textToSend = capturedTextRef.current.trim() || inputMessage.trim();
      if (textToSend) {
        handleSendMessage(undefined, textToSend);
        capturedTextRef.current = '';
        setInputMessage('');
      }
      return;
    }
    // Start listening
    startVoiceCapture();
  };

  // Clear conversation history and reset conversation log
  const handleClearHistory = () => {
    VoiceAssistant.stopSpeaking();
    VoiceAssistant.stopListening();
    setIsListening(false);
    setIsSpeakingId(null);
    setInputMessage('');
    capturedTextRef.current = '';
    setStudentFlowStep(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear chat history from localStorage:', err);
    }
    const freshGreeting = createDefaultGreeting();
    setMessages([freshGreeting]);
  };

  // Main Demo Flow: Student Financial Distress
  const triggerStudentDistressDemo = () => {
    handleSendMessage(
      undefined,
      language === 'kn'
        ? 'ನನ್ನ ಕಾಲೇಜು ಶುಲ್ಕ ಪಾವತಿಸಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ, ನನಗೆ ಸಹಾಯ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಬೇಕು.'
        : 'I am struggling to pay my college fees. What assistance and scholarships are available for me?'
    );
    setStudentFlowStep(1);
  };

  // Dedicated Flow: Show All Scholarships for Student
  const triggerAllScholarships = () => {
    handleSendMessage(
      undefined,
      language === 'kn'
        ? 'ನನಗೆ ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ತೋರಿಸಿ'
        : 'Show all scholarships available for me'
    );
  };

  // Step-by-step details check
  const handleSelectOption = (optionId: string) => {
    if (optionId === 'opt-all-scholarships') {
      triggerAllScholarships();
    } else if (optionId === 'opt-check-karnataka' || optionId === 'opt-step-by-step') {
      presentVerifiedService(mockVerifiedServices[0]);
    } else if (optionId === 'opt-check-emergency') {
      presentVerifiedService(mockVerifiedServices[5]);
    } else if (optionId === 'opt-income-yes') {
      onUpdateProfile({ hasIncomeCertificate: 'yes' });
      presentVerifiedService(mockVerifiedServices[0], 'Likely eligible');
    } else if (optionId === 'opt-income-not-sure') {
      onUpdateProfile({ hasIncomeCertificate: 'not_sure' });
      presentVerifiedService(mockVerifiedServices[0], 'May be eligible — income certificate needs verification');
    }
  };

  // Present verified service card
  const presentVerifiedService = (service: VerifiedService, customEligibility?: string) => {
    setIsLoadingReply(true);

    setTimeout(() => {
      setIsLoadingReply(false);

      const eligibilityLabel = customEligibility || 
        (userProfile.hasIncomeCertificate === 'yes'
          ? 'Likely eligible'
          : 'May be eligible — income certificate needs verification');

      const serviceResponse: ChatMessage = {
        id: generateMsgId('agent-service'),
        sender: 'agent',
        text: `Here is a verified option for you: ${service.name}. Eligibility Status: "${eligibilityLabel}". Deadline: ${service.deadlineText}.`,
        textKn: `ನಿಮಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಅಧಿಕೃತ ಆಯ್ಕೆ: ${service.nameKn}. ಅಂದಾಜು ಅರ್ಹತೆ: "${eligibilityLabel}". ಗಡುವು: ${service.deadlineTextKn}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        label: 'Verified Information',
        verifiedSource: {
          badge: 'Verified Source',
          sourceName: service.name,
          officialUrl: service.officialSourceUrl,
          domain: service.officialDomain,
          lastVerifiedDate: service.lastVerifiedDate,
          whyShowingThis: service.whyResultReasons.join(' '),
          whyShowingThisKn: service.whyResultReasonsKn.join(' '),
        },
        serviceData: service,
        options: [
          {
            id: 'opt-assistfill',
            label: 'Apply with NIRVAHA AssistFill',
            labelKn: 'ನಿರ್ವಾಹ ಅಸಿಸ್ಟ್‌ಫಿಲ್ ಮೂಲಕ ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ',
            actionType: 'open_assistfill',
            payload: service,
          },
          {
            id: 'opt-actionplan',
            label: 'Create my action plan',
            labelKn: 'ನನ್ನ ಕ್ರಿಯಾ ಯೋಜನೆ ರಚಿಸಿ',
            actionType: 'create_action_plan',
          },
          {
            id: 'opt-human',
            label: 'Ask a human for help',
            labelKn: 'ಮಾನವ ಅಧಿಕಾರಿಯ ಸಹಾಯ ಪಡೆಯಿರಿ',
            actionType: 'human_help',
          },
        ],
      };

      setMessages((prev) => [...prev, serviceResponse]);
    }, 400);
  };

  // Flow A: Loss of main earning family member
  const triggerLossOfEarnerDemo = () => {
    handleSendMessage(
      undefined,
      language === 'kn'
        ? 'ನಮ್ಮ ಕುಟುಂಬದ ಮುಖ್ಯ ದುಡಿಯುವ ವ್ಯಕ್ತಿಯನ್ನು ನಾವು ಕಳೆದುಕೊಂಡಿದ್ದೇವೆ. ನಮಗೆ ಸಿಗುವ ಪರಿಹಾರಗಳೇನು?'
        : 'My family has lost its main earning member. What government survivor welfare schemes or pensions can we apply for?'
    );
  };

  // Flow B: Crop loss due to heavy rain
  const triggerCropLossDemo = () => {
    handleSendMessage(
      undefined,
      language === 'kn'
        ? 'ಮಳೆಯಿಂದ ನನ್ನ ಬೆಳೆ ಹಾನಿಯಾಗಿದೆ. ಪರಿಹಾರ ಪಡೆಯಲು ನಾನು ಏನು ಮಾಡಬೇಕು?'
        : 'My crop was damaged by heavy rain. What are the urgent steps to claim relief under PMFBY?'
    );
  };

  // Flow C: Disability or accident support
  const triggerDisabilityDemo = () => {
    handleSendMessage(
      undefined,
      language === 'kn'
        ? 'ಅಪಘಾತ ಅಥವಾ ವಿಕಲಚೇತನದ ನಂತರ ನನಗೆ ಸಹಾಯ ಮತ್ತು ಯುಡಿಐಡಿ (UDID) ಕಾರ್ಡ್ ಬೇಕಾಗಿದೆ.'
        : 'I need support after an accident or disability. How do I get a UDID card and college accommodations?'
    );
  };

  // Flow D: Relocation
  const triggerRelocationDemo = () => {
    handleSendMessage(
      undefined,
      language === 'kn'
        ? 'ನಾನು ಹೊಸ ಸ್ಥಳಕ್ಕೆ ಸ್ಥಳಾಂತರಗೊಂಡಿದ್ದು, ಸೇವೆಗಳು ಮತ್ತು ವಿಳಾಸವನ್ನು ಹೇಗೆ ನವೀಕರಿಸಬೇಕು?'
        : 'I moved to a new place. In what order should I update my Aadhaar, ration card, and civic services?'
    );
  };

  // Send typed user message or transcribed voice input
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const userText = (customText !== undefined ? customText : inputMessage).trim();
    if (!userText) return;
    setInputMessage('');

    // Detect Indian regional scripts automatically
    let detectedLang: Language = language;
    if (/[\u0C80-\u0CFF]/.test(userText)) detectedLang = 'kn'; // Kannada
    else if (/[\u0B80-\u0BFF]/.test(userText)) detectedLang = 'ta'; // Tamil
    else if (/[\u0C00-\u0C7F]/.test(userText)) detectedLang = 'te'; // Telugu
    else if (/[\u0D00-\u0D7F]/.test(userText)) detectedLang = 'ml'; // Malayalam
    else if (/[\u0980-\u09FF]/.test(userText)) detectedLang = 'bn'; // Bengali
    else if (/[\u0900-\u097F]/.test(userText)) {
      detectedLang = language === 'mr' ? 'mr' : 'hi'; // Devanagari (Hindi / Marathi)
    }

    const activeLang: Language = detectedLang;
    if (detectedLang !== language) {
      onLanguageChange(detectedLang);
    }

    const userMsg: ChatMessage = {
      id: generateMsgId('user'),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingReply(true);

    try {
      // Build conversation history for multi-turn dialogue context
      const history = messages.slice(-10).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      // Call server-side fullstack route (Gemini or OpenAI)
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          language: activeLang,
          lifeEvent: initialLifeEvent || 'student_fees',
          context: {
            userProfile,
          },
          history,
        }),
      });

      const data = await response.json();
      setIsLoadingReply(false);

      if (data.reply) {
        // Detect if query is requesting to view scholarships or student assistance
        const wantsScholarships = /scholarship|ವಿದ್ಯಾರ್ಥಿವೇತನ|ಸ್ಕಾಲರ್‌ಶಿಪ್|छात्रवृत्ति/i.test(userText);
        
        // Intelligent service matching from mockVerifiedServices based on citizen query
        let serviceData: VerifiedService | undefined = undefined;
        const lower = userText.toLowerCase();

        if (/crop|rain|farm|agriculture|pmfby|ಬೆಳೆ|ರೈತ|ಕೃಷಿ|ಫಸಲ್/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-crop-pmfby');
        } else if (/disability|udid|handicap|accessibility|ವಿಕಲಚೇತನ|ಯುಡಿಐಡಿ/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-disability-udid') || mockVerifiedServices.find((s) => s.id === 'srv-aicte-saksham');
        } else if (/relocation|move|address|ration|porting|ಸ್ಥಳಾಂತರ|ವಿಳಾಸ/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-relocation-seva');
        } else if (/earner|death|loss of income|survivor|demise|breadwinner|bereavement|ಆದಾಯ|ಸಾವು/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-bereavement-nfbs');
        } else if (/girl|women|pragati|ಮಹಿಳೆ|ಹೆಣ್ಣು/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-aicte-pragati');
        } else if (/minority|muslim|christian|jain|buddhist|ಅಲ್ಪಸಂಖ್ಯಾತ/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-minority-postmatric');
        } else if (/labour|worker|e-shram|factory|ಕಾರ್ಮಿಕ/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-labour-welfare-edu');
        } else if (/nsp|central sector|pm-usp|ಕೇಂದ್ರ/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-pm-usp-nsp');
        } else if (/emergency|hardship|ತುರ್ತು/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-college-emergency');
        } else if (/fee|college|scholarship|engineering|study|student|tuition|admission|ಶುಲ್ಕ|ಕಾಲೇಜು/i.test(lower)) {
          serviceData = mockVerifiedServices.find((s) => s.id === 'srv-karnataka-fee');
        }

        // Action options
        const options = serviceData ? [
          ...(wantsScholarships || serviceData.isScholarship ? [{
            id: 'opt-all-scholarships',
            label: 'View All Available Scholarships',
            labelKn: 'ಎಲ್ಲಾ ಲಭ್ಯವಿರುವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು',
            actionType: 'select_option' as const,
          }] : []),
          {
            id: 'opt-assistfill',
            label: `Apply with NIRVAHA AssistFill`,
            labelKn: 'ನಿರ್ವಾಹ ಅಸಿಸ್ಟ್‌ಫಿಲ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
            actionType: 'open_assistfill' as const,
            payload: serviceData,
          },
          {
            id: 'opt-actionplan',
            label: 'Add to My Action Plan',
            labelKn: 'ನನ್ನ ಕ್ರಿಯಾ ಯೋಜನೆಗೆ ಸೇರಿಸಿ',
            actionType: 'create_action_plan' as const,
          },
          {
            id: 'opt-human',
            label: 'Need Human Help?',
            labelKn: 'ಮಾನವ ಅಧಿಕಾರಿಯ ಸಹಾಯ ಬೇಕೇ?',
            actionType: 'human_help' as const,
          },
        ] : [
          {
            id: 'opt-all-scholarships',
            label: '🎓 View Verified Scholarships',
            labelKn: 'ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
            actionType: 'select_option' as const,
          },
          {
            id: 'opt-actionplan',
            label: 'Create My Action Plan',
            labelKn: 'ನನ್ನ ಕ್ರಿಯಾ ಯೋಜನೆ ರಚಿಸಿ',
            actionType: 'create_action_plan' as const,
          },
          {
            id: 'opt-human',
            label: 'Need Human Help?',
            labelKn: 'ಮಾನವ ಅಧಿಕಾರಿಯ ಸಹಾಯ ಬೇಕೇ?',
            actionType: 'human_help' as const,
          },
        ];

        const agentMsg: ChatMessage = {
          id: generateMsgId('agent'),
          sender: 'agent',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          label: 'AI Guidance',
          interactiveType: wantsScholarships ? 'scholarship_matchboard' : undefined,
          verifiedSource: serviceData
            ? {
                badge: 'Verified Source',
                sourceName: serviceData.name,
                officialUrl: serviceData.officialSourceUrl,
                domain: serviceData.officialDomain,
                lastVerifiedDate: serviceData.lastVerifiedDate,
                whyShowingThis: serviceData.whyResultReasons.join(' '),
                whyShowingThisKn: serviceData.whyResultReasonsKn.join(' '),
              }
            : undefined,
          serviceData,
          options,
        };

        setMessages((prev) => [...prev, agentMsg]);
      } else {
        // Fallback message
        const fallbackText = language === 'kn'
          ? 'ನಮಸ್ಕಾರ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ತಿಳಿಸಿ.'
          : 'I am here to guide you with verified government services and fee support. Please feel free to ask your question.';
        setMessages((prev) => [
          ...prev,
          {
            id: generateMsgId('agent-fallback'),
            sender: 'agent',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            label: 'AI Guidance',
          },
        ]);
      }
    } catch (err) {
      setIsLoadingReply(false);
      const fallbackText = language === 'kn'
        ? 'ನಮಸ್ಕಾರ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಕಾಲೇಜು ಶುಲ್ಕ ಬೆಂಬಲ, ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳ ವಿವರಗಳನ್ನು ತಿಳಿಯಬಹುದು.'
        : 'I am here to guide you with verified government services and fee support. Please feel free to ask your question.';
      setMessages((prev) => [
        ...prev,
        {
          id: generateMsgId('agent-error'),
          sender: 'agent',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          label: 'AI Guidance',
        },
      ]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-12 flex flex-col h-[calc(100vh-4rem)]">
      {/* Agent Top Context Bar */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <NirvahaLogo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-[#38104E]">
                {t.chat.title}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                Agent Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'kn' ? 'ಸಮ್ಮತಿ-ಮೊದಲು ಸಾರ್ವಜನಿಕ ಸೇವಾ ಮಾರ್ಗದರ್ಶಿ' : 'Consent-First Public Service Navigation Agent'}
            </p>
          </div>
        </div>

        {/* Quick Nav Shortcut Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
            title={language === 'kn' ? 'ಸಂಭಾಷಣೆಯ ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಿ' : 'Reset conversation log'}
            aria-label="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'kn' ? 'ಇತಿಹಾಸ ತೆರವು' : 'Clear History'}</span>
          </button>
          <button
            onClick={onOpenActionPlan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF5FF] text-[#9333EA] hover:bg-[#9333EA] hover:text-white transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{t.nav.actionPlan}</span>
          </button>
          <button
            onClick={() => onOpenHumanSupport('General Assistance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-[#38104E] hover:bg-purple-100 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[#9333EA]" />
            <span className="hidden sm:inline">Human Help</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="mb-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            {t.chat.quickSuggestions}
          </span>
          <button
            onClick={triggerAllScholarships}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#FAF5FF] border border-[#9333EA]/30 text-[#38104E] hover:bg-[#9333EA] hover:text-white transition-colors shadow-2xs font-bold flex items-center gap-1.5"
          >
            <span>🎓</span>
            <span>{language === 'kn' ? 'ನನ್ನ ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು (7 ಲಭ್ಯ)' : 'All Scholarships for Me (7 Available)'}</span>
          </button>
          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-slate-700 hover:border-[#9333EA] hover:text-[#38104E] transition-colors shadow-2xs font-medium flex items-center gap-1.5"
            >
              <span>📁</span>
              <span>{language === 'kn' ? 'ದಾಖಲೆಗಳ ವಾಲ್ಟ್' : 'My Document Vault'}</span>
            </button>
          )}
          <button
            onClick={triggerStudentDistressDemo}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-slate-700 hover:border-[#9333EA] hover:text-[#38104E] transition-colors shadow-2xs font-medium"
          >
            🎓 {language === 'kn' ? 'ಕಾಲೇಜು ಶುಲ್ಕ ಸಂಕಷ್ಟ (ಮುಖ್ಯ ಡೆಮೊ)' : 'College fees distress (Main Demo)'}
          </button>
          <button
            onClick={triggerCropLossDemo}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-slate-700 hover:border-[#9333EA] hover:text-[#38104E] transition-colors shadow-2xs font-medium"
          >
            🌾 {language === 'kn' ? 'ಮಳೆ ಬೆಳೆ ಹಾನಿ' : 'Rain crop damage'}
          </button>
          <button
            onClick={triggerLossOfEarnerDemo}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-slate-700 hover:border-[#9333EA] hover:text-[#38104E] transition-colors shadow-2xs font-medium"
          >
            🤝 {language === 'kn' ? 'ಕುಟುಂಬದ ಆಧಾರಸ್ತಂಭ ನಷ್ಟ' : 'Loss of family earner'}
          </button>
          <button
            onClick={triggerDisabilityDemo}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-slate-700 hover:border-[#9333EA] hover:text-[#38104E] transition-colors shadow-2xs font-medium"
          >
            ♿ {language === 'kn' ? 'ಯುಡಿಐಡಿ / ವಿಕಲಚೇತನ ನೆರವು' : 'Disability / UDID support'}
          </button>
          <button
            onClick={triggerRelocationDemo}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-slate-700 hover:border-[#9333EA] hover:text-[#38104E] transition-colors shadow-2xs font-medium"
          >
            📍 {language === 'kn' ? 'ಸ್ಥಳಾಂತರ ವಿಳಾಸ ನವೀಕರಣ' : 'Relocation address updates'}
          </button>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, idx) => {
          const isAgent = msg.sender === 'agent';
          const displayText = language === 'kn' && msg.textKn ? msg.textKn : msg.text;

          return (
            <div
              key={msg.id ? `${msg.id}-${idx}` : `msg-${idx}`}
              className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                  isAgent
                    ? 'bg-white border border-purple-100 text-slate-800'
                    : 'bg-[#38104E] text-white rounded-br-xs'
                }`}
              >
                {/* Agent Header Badges */}
                {isAgent && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#9333EA] animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#38104E]">
                        NIRVAHA AI
                      </span>
                      {msg.label && msg.label === 'Urgent: Contact Human Support' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                          {msg.label}
                        </span>
                      )}
                    </div>

                    {/* Audio Playback button */}
                    <button
                      onClick={() => handleToggleVoice(msg.id, displayText)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#9333EA] hover:bg-purple-50 transition-colors"
                      title={isSpeakingId === msg.id ? 'Stop audio' : 'Listen with voice'}
                    >
                      {isSpeakingId === msg.id ? (
                        <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* Message Body Text */}
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {displayText}
                </p>

                {/* Interactive Scholarship Matchboard */}
                {msg.interactiveType === 'scholarship_matchboard' && (
                  <div className="mt-3 w-full">
                    <ScholarshipMatchboard
                      language={language}
                      userProfile={userProfile}
                      userDocuments={userDocuments}
                      onOpenAssistFill={onOpenAssistFill}
                      onOpenActionPlan={onOpenActionPlan}
                      onOpenVault={onOpenVault}
                    />
                  </div>
                )}

                {/* Grounded Source Card (Mandatory for factual service data) */}
                {msg.verifiedSource && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#FAF5FF] border border-[#9333EA]/20 text-xs text-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[#9333EA] font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{msg.verifiedSource.sourceName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {msg.verifiedSource.domain}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 pt-1 border-t border-purple-100">
                      <span>Verified: {msg.verifiedSource.lastVerifiedDate}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (msg.serviceData) {
                              setActiveWhyResultService(msg.serviceData);
                            }
                          }}
                          className="font-semibold text-[#9333EA] hover:underline flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{t.chat.whyAmISeeingThis}</span>
                        </button>
                        <a
                          href={msg.verifiedSource.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#38104E] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t.chat.openOfficialWebsite}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Action Options & Buttons */}
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-purple-50 flex flex-wrap gap-2">
                    {msg.options.map((opt, optIdx) => (
                      <button
                        key={`${opt.id}-${optIdx}`}
                        onClick={() => {
                          if (opt.actionType === 'open_assistfill' && opt.payload) {
                            onOpenAssistFill(opt.payload);
                          } else if (opt.actionType === 'create_action_plan') {
                            onOpenActionPlan();
                          } else if (opt.actionType === 'human_help') {
                            onOpenHumanSupport('Student Fee Support Assistance');
                          } else {
                            handleSelectOption(opt.id);
                          }
                        }}
                        className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 ${
                          opt.actionType === 'open_assistfill'
                            ? 'bg-[#38104E] text-white hover:bg-[#4D166A]'
                            : opt.actionType === 'create_action_plan'
                            ? 'bg-[#9333EA] text-white hover:bg-[#38104E]'
                            : 'bg-purple-50 hover:bg-purple-100 text-[#38104E]'
                        }`}
                      >
                        <span>{language === 'kn' && opt.labelKn ? opt.labelKn : opt.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-2 text-right ${
                    isAgent ? 'text-slate-400' : 'text-purple-200'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoadingReply && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-purple-100 max-w-[200px] text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#9333EA] animate-ping" />
            <span>NIRVAHA AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Listening Active Indicator Banner */}
      {isListening && (
        <div className="mt-2.5 px-4 py-2 bg-[#FAF5FF] border border-[#9333EA]/30 rounded-xl flex items-center justify-between shadow-xs animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-[#38104E]">
              {language === 'kn'
                ? 'ಧ್ವನಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ... ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ'
                : `Listening in ${VoiceAssistant.getSpeechLocale(language)}... Speak your query now`}
            </span>
          </div>
          <button
            type="button"
            onClick={handleMicToggle}
            className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            {language === 'kn' ? 'ನಿಲ್ಲಿಸಿ ಮತ್ತು ಕಳುಹಿಸಿ' : 'Stop & Send'}
          </button>
        </div>
      )}

      {/* Mic Status / Warning Notice */}
      {micNotice && (
        <div className="mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 shadow-2xs">
          <span>{micNotice}</span>
          <button
            type="button"
            onClick={() => setMicNotice(null)}
            className="ml-2 font-bold text-amber-900 hover:text-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form with Large Accessible Mic */}
      <form
        onSubmit={handleSendMessage}
        className="mt-3 shrink-0 bg-white rounded-2xl p-2 sm:p-2.5 border border-purple-200 shadow-md flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handleMicToggle}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20'
              : 'bg-purple-50 hover:bg-[#FAF5FF] text-[#38104E] hover:text-[#9333EA]'
          }`}
          title={isListening ? (language === 'kn' ? 'ಆಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ ಮತ್ತು ಕಳುಹಿಸಿ' : 'Stop and send voice input') : (language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ' : 'Click to speak voice input')}
          aria-label={isListening ? 'Stop and send voice input' : 'Click to speak voice input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isListening ? t.chat.listening : t.chat.placeholder}
          className="flex-1 bg-transparent border-none text-sm sm:text-base text-slate-900 focus:outline-none px-2"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoadingReply}
          className="w-11 h-11 rounded-xl bg-[#38104E] hover:bg-[#4D166A] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
          title={t.chat.send}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* "Why am I seeing this result?" Modal */}
      {activeWhyResultService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setActiveWhyResultService(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <Info className="w-5 h-5 text-[#9333EA]" />
              <h3 className="text-lg font-bold text-[#38104E]">
                {language === 'kn' ? 'ಈ ಫಲಿತಾಂಶದ ಹಿನ್ನೆಲೆ (ಏಕೆ?)' : 'Why am I seeing this result?'}
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {language === 'kn'
                ? 'ನಿರ್ವಾಹ AI ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಿವರಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ನಿಯಮಗಳ ಆಧಾರದ ಮೇಲೆ ಈ ಕಾರಣಗಳನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ:'
                : 'NIRVAHA AI matches your profile facts strictly against official service rules without assumptions:'}
            </p>

            <ul className="space-y-2 mb-5">
              {(language === 'kn'
                ? activeWhyResultService.whyResultReasonsKn
                : activeWhyResultService.whyResultReasons
              ).map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveWhyResultService(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                {language === 'kn' ? 'ಸರಿ, ಅರ್ಥವಾಯಿತು' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const s = activeWhyResultService;
                  setActiveWhyResultService(null);
                  onOpenAssistFill(s);
                }}
                className="px-4 py-2 rounded-xl bg-[#38104E] text-white text-xs font-semibold hover:bg-[#4D166A]"
              >
                {t.chat.applyAssistFill}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
