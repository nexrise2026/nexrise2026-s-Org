import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Gemini initialization
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client initialization warning:', err);
  }
}

// In-memory mock database for Hackathon demonstration
interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'CONSENT' | 'APPLICATION' | 'REVOCATION' | 'ESCALATION' | 'ADMIN';
  details: string;
  serviceId?: string;
  dataCategoriesShared?: string[];
  status: 'SUCCESS' | 'REVOKED' | 'PENDING';
}

interface SupportTicket {
  id: string;
  category: string;
  description: string;
  contactMethod: string;
  sharedPlanSummary: boolean;
  timestamp: string;
  status: 'PENDING' | 'ASSIGNED' | 'RESOLVED';
  assignedTo: string;
}

const auditLogs: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'SERVICE_SOURCE_VERIFICATION',
    category: 'ADMIN',
    details: 'Verified Karnataka Student Fee Support Grant official portal and rules.',
    serviceId: 'srv-karnataka-fee',
    status: 'SUCCESS',
  },
  {
    id: 'AUD-002',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'ONBOARDING_CONSENT_ACKNOWLEDGED',
    category: 'CONSENT',
    details: 'User acknowledged guidance disclaimer without data storage.',
    status: 'SUCCESS',
  }
];

const supportTickets: SupportTicket[] = [
  {
    id: 'NIR-2026-00089',
    category: 'Fee Support & Bonafide Issuance',
    description: 'Student requested clarification on fee concession deadline.',
    contactMethod: 'Phone / WhatsApp',
    sharedPlanSummary: true,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'ASSIGNED',
    assignedTo: 'College Student Welfare Desk',
  }
];

// API: Audit logs
app.get('/api/audit-logs', (_req, res) => {
  res.json({ success: true, logs: auditLogs });
});

// API: Human support escalation ticket
app.post('/api/support/ticket', (req, res) => {
  const { category, description, contactMethod, sharedPlanSummary } = req.body;
  const ticketId = `NIR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const newTicket: SupportTicket = {
    id: ticketId,
    category: category || 'General Guidance',
    description: description || 'Assistance requested with public service action plan',
    contactMethod: contactMethod || 'Phone',
    sharedPlanSummary: Boolean(sharedPlanSummary),
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    assignedTo: 'Government & College Welfare Cell',
  };

  supportTickets.unshift(newTicket);
  auditLogs.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    action: 'HUMAN_SUPPORT_ESCALATED',
    category: 'ESCALATION',
    details: `Created escalation ticket ${ticketId} via ${contactMethod}. Plan shared: ${sharedPlanSummary}`,
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    ticket: newTicket,
    message: 'Your human support request has been logged successfully.',
  });
});

// API: AssistFill Application Submission
app.post('/api/assist-fill/submit', (req, res) => {
  const {
    serviceId,
    serviceName,
    draftCreationConsent,
    reviewConfirmed,
    submissionConsent,
    requiredDocumentsComplete,
    requiredFieldsComplete,
    applicationDeadlineOpen,
    applicantData,
    documentList,
  } = req.body;

  // Strict Evaluation of Boolean Conditions as specified in hackathon brief
  const isEligibleToSubmit =
    draftCreationConsent === true &&
    reviewConfirmed === true &&
    submissionConsent === true &&
    requiredDocumentsComplete === true &&
    requiredFieldsComplete === true &&
    applicationDeadlineOpen === true;

  if (!isEligibleToSubmit) {
    return res.status(400).json({
      success: false,
      error: 'Complete all required fields, documents, and consent steps before submitting.',
      validationErrors: {
        draftCreationConsent,
        reviewConfirmed,
        submissionConsent,
        requiredDocumentsComplete,
        requiredFieldsComplete,
        applicationDeadlineOpen,
      },
    });
  }

  const applicationId = `NIR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const consentRecordId = `CSR-${Date.now().toString().slice(-6)}`;

  // Log in consent audit trail (zero sensitive data saved)
  auditLogs.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    action: 'APPLICATION_SUBMITTED_WITH_CONSENT',
    category: 'APPLICATION',
    details: `Application ${applicationId} submitted to ${serviceName} with consent receipt ${consentRecordId}.`,
    serviceId,
    dataCategoriesShared: [
      'Enrolment status & institution',
      'Course & year of study',
      'Income eligibility bracket',
      'Compulsory bonafide and marks verification',
    ],
    status: 'SUCCESS',
  });

  return res.json({
    success: true,
    applicationId,
    consentRecordId,
    serviceName,
    status: 'SUBMITTED',
    timestamp: new Date().toISOString(),
    documentsAttachedCount: Array.isArray(documentList) ? documentList.length : 3,
    nextExpectedUpdate: 'Within 7–10 working days by the issuing authority',
    authorityDisclaimer: 'Application status after submission is controlled by the official authority. NIRVAHA AI cannot guarantee approval.',
  });
});

// API: Revoke consent
app.post('/api/consent/revoke', (req, res) => {
  const { consentRecordId, serviceName } = req.body;
  auditLogs.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    action: 'CONSENT_REVOKED_BY_USER',
    category: 'REVOCATION',
    details: `User explicitly revoked authorization for ${serviceName || 'service'} (ID: ${consentRecordId}).`,
    status: 'REVOKED',
  });
  res.json({ success: true, message: 'Authorization revoked successfully.' });
});

// API: Gemini-Powered Agent Consultation
app.post('/api/gemini/chat', async (req, res) => {
  const { message, language = 'en', lifeEvent, context } = req.body;

  const langNames: Record<string, string> = {
    kn: 'Kannada (ಕನ್ನಡ)',
    hi: 'Hindi (हिन्दी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    ml: 'Malayalam (മലയാളം)',
    mr: 'Marathi (मराठी)',
    bn: 'Bengali (বাংলা)',
    en: 'English',
  };
  const targetLanguagePrompt = langNames[language] || 'English';

  const systemInstruction = `
You are NIRVAHA AI, a trusted, calm, empathetic, and consent-first public-service navigation agent for India.
Core Tagline: "From life event to the right action."
Language: Respond strictly in ${targetLanguagePrompt} with clean, simple, natural, empathetic phrasing.

Safety and Persona Rules:
1. Multi-Turn Context & Chat History: Actively remember and use earlier conversation history. When the user asks follow-up questions (e.g. "what documents do I need for that?", "how to apply?", "what is the deadline?", or provides more details about their family or college), reference the previously discussed schemes and facts directly and build upon them.
2. Empathy without false promises. Never guarantee approval or eligibility.
3. Keep responses concise (2 to 4 short paragraphs) and focused on actionable next steps.
4. Clearly distinguish between "Verified Information", "AI Guidance", and "Needs Official Confirmation".
5. Grounded Sources: Cite verified portals and schemes accurately:
   - Karnataka Student Fee Support Grant (SSP Post-Matric: ssp.postmatric.karnataka.gov.in, ₹45,000/yr)
   - Central Sector Scholarship PM-USP (NSP: scholarships.gov.in, ₹12,000/yr)
   - AICTE Pragati Scholarship for Meritorious Girls in Technical Education (₹50,000/yr)
   - Minority Post-Matric Scholarship (dom.karnataka.gov.in, up to ₹30,000/yr)
   - Karnataka Labour Welfare Board Educational Assistance (₹15,000 - ₹25,000/yr)
   - College Emergency Assistance & Hardship Relief Fund (institutional stop-gap relief)
   - AICTE Saksham Scholarship for Specially-Abled Students (₹50,000/yr)
   - PM Fasal Bima Yojana (PMFBY: pmfby.gov.in, critical 72-hour crop loss intimation)
   - National Family Benefit Scheme (NFBS: compassionate assistance for demise of earning breadwinner)
   - Unique Disability ID (UDID: swavlambancard.gov.in, transport & academic concessions)
   - Karnataka Seva Sindhu (sevasindhu.karnataka.gov.in, address & civic records porting)
6. Never request passwords, full Aadhaar numbers, bank PINs, OTPs, or debit/credit card info.
7. If the citizen mentions acute distress or emergency danger, advise contacting 112 / helpline services or human help.
`;

  // 1. Try Gemini models in priority order
  if (ai) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

    // Construct conversation history for Gemini multi-turn dialogue
    const rawContents: any[] = [];
    if (Array.isArray(req.body.history) && req.body.history.length > 0) {
      for (const item of req.body.history.slice(-10)) {
        rawContents.push({
          role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.content || item.text || '' }],
        });
      }
    }

    // Must start with user role and drop leading model turns
    while (rawContents.length > 0 && rawContents[0].role !== 'user') {
      rawContents.shift();
    }

    const userPrompt = `Citizen Query: "${message}". Context: Life Event="${lifeEvent || 'Public service support'}". User Profile: ${JSON.stringify(context?.userProfile || {})}.`;
    rawContents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    // Merge consecutive identical roles to guarantee strict alternating turn structure
    const contents: any[] = [];
    for (const item of rawContents) {
      const prev = contents[contents.length - 1];
      if (prev && prev.role === item.role) {
        prev.parts[0].text += `\n${item.parts[0].text}`;
      } else {
        contents.push(item);
      }
    }

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.35,
          },
        });

        if (response.text && response.text.trim()) {
          return res.json({
            success: true,
            reply: response.text.trim(),
            source: model,
          });
        }
      } catch (err: any) {
        console.info(`Gemini model ${model} temporarily unavailable, continuing to next model candidate.`);
      }
    }
  }

  // 2. Try OpenAI Chat Bot if OPENAI_API_KEY is configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const openAiMessages: any[] = [
        { role: 'system', content: systemInstruction },
      ];

      if (Array.isArray(req.body.history) && req.body.history.length > 0) {
        for (const item of req.body.history.slice(-10)) {
          openAiMessages.push({
            role: item.role === 'model' ? 'assistant' : (item.role || 'user'),
            content: item.content || item.text || '',
          });
        }
      }

      openAiMessages.push({
        role: 'user',
        content: `Citizen Query: "${message}". Context: Life Event="${lifeEvent || 'Public service support'}". User Profile: ${JSON.stringify(context?.userProfile || {})}.`,
      });

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: openAiMessages,
          temperature: 0.35,
        }),
      });

      if (openAiRes.ok) {
        const openAiData = await openAiRes.json();
        const reply = openAiData.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return res.json({
            success: true,
            reply: reply.trim(),
            source: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          });
        }
      }
    } catch (openAiErr: any) {
      console.warn('OpenAI request error:', openAiErr?.message);
    }
  }

  // Grounded Deterministic Agent Fallback
  const fallbackReplies: Record<string, string> = {
    kn: 'ನಮಸ್ಕಾರ. ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ನಿಮಗೆ ಕಾಲೇಜು ಶುಲ್ಕ ಸಹಾಯ, ಬೋನಫೈಡ್ ಪ್ರಮಾಣಪತ್ರ ಹಾಗೂ ಆದಾಯ ದೃಢೀಕರಣದ ಸರಿಯಾದ ಕ್ರಮಗಳನ್ನು ಹುಡುಕಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    hi: 'नमस्ते। मैं आपकी स्थिति को समझता हूँ। मैं आपको कॉलेज फीस सहायता, आवश्यक प्रमाण पत्र और छात्रवृत्ति विकल्पों के सही कदम खोजने में मदद करूँगा।',
    ta: 'வணக்கம். உங்கள் சூழலை நான் புரிந்துகொள்கிறேன். கல்லூரி கட்டணச் சலுகை, சான்றிதழ்கள் மற்றும் கல்வி உதவித்தொகை பெறுவதற்கான அடுத்த வழிகளை அறிய நான் உதவுகிறேன்.',
    te: 'నమస్కారం. మీ పరిస్థితిని నేను అర్థం చేసుకున్నాను. కాలేజ్ ఫీజు సహాయం, ధృవీకరణ పత్రాలు మరియు స్కాలర్‌షిప్ ఎంపికల కోసం సరైన మార్గదర్శకత్వం అందించడానికి నేను ఇక్కడ ఉన్నాను.',
    ml: 'നമസ്കാരം. നിങ്ങളുടെ സാഹചര്യം ഞാൻ മനസ്സിലാക്കുന്നു. കോളേജ് ഫീസ് ഇളവ്, സർട്ടിഫിക്കറ്റുകൾ, സ്കോളർഷിപ്പ് സഹായങ്ങൾ എന്നിവ കണ്ടെത്താൻ ഞാൻ സഹായിക്കാം.',
    mr: 'नमस्कार. मी तुमची अडचण समजू शकतो. कॉलेज फी सवलत, आवश्यक कागदपत्रे आणि शिष्यवृत्तीचे योग्य पर्याय शोधण्यात मी तुम्हाला मदत करेन.',
    bn: 'নমস্কার। আমি আপনার পরিস্থিতি বুঝতে পারছি। কলেজ ফি সহায়তা, প্রয়োজনীয় সার্টিফিকেট এবং বৃত্তির বিকল্পগুলি খুঁজে পেতে আমি আপনাকে সাহায্য করব।',
    en: 'I understand this situation can be stressful. I am here to help you identify verified fee-support, emergency assistance grants, and required document checklists step-by-step.',
  };

  return res.json({
    success: true,
    reply: fallbackReplies[language] || fallbackReplies.en,
    source: 'nirvaha-deterministic-grounded-engine',
  });
});

// Start dev or production server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIRVAHA AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
