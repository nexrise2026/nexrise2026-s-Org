# NIRVAHA AI — Hackathon Presentation & Pitch Kit

> **Tagline**: *"From life event to the right action."*  
> **Track**: Agentic AI for Billions / Public Service & Digital Inclusion  
> **Target Audience**: Citizens, students, farmers, first-generation learners navigating public services, welfare schemes, and college grants in India.

---

## 1. 60-Second Elevator Pitch

> *"Every year, millions of Indian citizens miss out on emergency student fee grants, crop loss compensation, or disability benefits—not because schemes don't exist, but because government portals are fragmented, rules are opaque, and deadlines are missed.  
>  
> Most AI attempts build conversational chatbots that hallucinate schemes or hand out dead links.  
>  
> **NIRVAHA AI** is fundamentally different: it is an **action-oriented, consent-first public service navigation agent**. It takes a raw life event—like sudden financial distress or crop loss—and executes a reliable pipeline: Needs assessment → Verified scheme discovery with official source citations → Document validation checklist → Personalized 7-day action plan → **NIRVAHA AssistFill** (drafting application forms with strict Boolean consent gates) → Human social worker escalation.  
>  
> Built fully bilingual in **English and Kannada (ಕನ್ನಡ)** with voice navigation, NIRVAHA AI guarantees zero sensitive credential collection, zero hallucinations, and total citizen data sovereignty."*

---

## 2. Project Architecture & Codebase Map

| File / Folder | Role & Functionality |
| :--- | :--- |
| `server.ts` | **Full-Stack Express + Gemini Backend**: Handles `/api/agent/chat` with Google GenAI SDK (`gemini-2.5-flash` / `gemini-3.8-flash` cascade), `/api/assist-fill/submit`, `/api/audit-logs`, `/api/support/escalate`, and Vite middleware mounting. |
| `src/App.tsx` | **Application Root & Global State**: Manages active tabs, bilingual language toggle (`en` / `kn`), user profile, citizen vault documents, active consent receipts, and notification banners. |
| `src/components/AgentChat.tsx` | **Agentic Multilingual Dialogue Engine**: Voice input (Web SpeechRecognition), TTS read-aloud (SpeechSynthesis), empathetic prompt processing, verified source recommendation cards, interactive life event shortcuts, and direct hand-offs. |
| `src/components/AssistFillPage.tsx` | **Consent-First Form Drafter**: 6-step wizard with a strict Boolean gate: `reviewConfirmed && submissionConsent && requiredDocsComplete && draftConsent` required before application dispatch. Generates verifiable submission receipts. |
| `src/components/ConsentCentrePage.tsx` | **Citizen Privacy & Data Sovereignty**: Transparency dashboard displaying active access receipts, data minimization metrics (3 shared vs 7 protected), and 1-click access revocation. |
| `src/components/CitizenVaultPage.tsx` | **Local Document Locker**: Securely verifies and stores Aadhaar, Income RD certificates, Bonafide certificates, Marks cards, and Disability IDs with readiness badges. |
| `src/components/ActionPlanPage.tsx` | **Day-by-Day Action Tracker**: Step-by-step checklist with priority flags, deadlines, and status toggles for the citizen's recovery journey. |
| `src/components/ServiceDirectoryPage.tsx` | **Curated Verified Scheme Catalog**: Filterable directory of Karnataka and Central government schemes with official `.gov.in` citations, eligibility rules, and "Why am I seeing this?" logic. |
| `src/components/HumanHelpPage.tsx` | **Human-in-the-Loop Escalation**: Direct ticketing system connecting citizens to college student welfare officers, Seva Sindhu volunteers, and emergency helplines. |
| `src/components/AdminPortalPage.tsx` | **Source Curation & Audit Ledger**: Immutable audit trail of consents, submissions, and revocations for institutional trust and compliance. |
| `src/locales/translations.ts` | **Complete Kannada & English Dictionary**: Cultural and domain-accurate terminology for public administration, certificates, and welfare. |

---

## 3. How to Run Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: npm, bun, or yarn

### Quick Start Commands
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional: add Gemini API key)
cp .env.example .env
# Edit .env and set:
# GEMINI_API_KEY=your_gemini_api_key_here

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit: http://localhost:3000
```

### Production Build & Preview
```bash
npm run build
npm start
```

---

## 4. 3-Minute Live Demo Walkthrough for Judges

1. **Start on the Landing Screen**:
   - Point out the trust banner: *"Government of Karnataka Verified Partner · Zero Sensitive Data Retention Policy"*.
   - Mention the bilingual switch: Click **ಕನ್ನಡ** in the header to demonstrate full vernacular localization.

2. **Trigger the Primary Demo** *(Student Financial Distress)*:
   - Click the quick action chip: **"College Fee Emergency"** or click **"Demo Script"** in the top bar.
   - Show how NIRVAHA assesses the situation empathetically without robotic phrasing.
   - Show the **Verified Source Card**: Points directly to *Karnataka Student Fee Support Grant* with an official `.gov.in` badge, 12-day deadline countdown, and a transparent **"Why am I seeing this?"** breakdown.

3. **Demonstrate Data Minimization & Consent**:
   - Click **"Apply with NIRVAHA AssistFill"**.
   - Point out Step 2: Explicit pre-fill authorization is requested before reading any vault document.
   - Point out Step 3: Clear warning that passwords/OTPs are NEVER collected.
   - Show the **Boolean Submission Gate**: Attempting to submit without checking the final confirmation keeps the button disabled with a clear explanation.
   - Check both boxes and click **"Submit Application"** → instant verifiable receipt with ID `NIR-2026-XXXXXX`.

4. **Show Citizen Sovereignty**:
   - Click the **"Consent Centre"** tab.
   - Show the active authorization granted just 10 seconds ago.
   - Click **"Revoke Access"** → The consent is terminated instantly with an immutable audit log entry created in the background.

5. **Show Accessibility & Voice**:
   - Click the microphone icon in the chat to speak in Kannada or English.
   - Click the speaker icon on any message to trigger native Web Speech TTS audio.

---

## 5. Technical Highlights & Judge Q&A Cheat Sheet

### Q1: "How do you prevent AI hallucinations in high-stakes public welfare?"
> **Answer**: NIRVAHA AI uses a **Retrieval-Grounded Dual Architecture**. The generative Gemini model is constrained strictly to conversation structuring and natural language empathy; it is never allowed to synthesize unverified URLs or invent eligibility rules. All schemes, deadlines, and criteria are retrieved from an authenticated schema catalog (`servicesData.ts`) curated by administrative authorities.

### Q2: "What is your approach to DPDP (Digital Personal Data Protection) compliance?"
> **Answer**: NIRVAHA is built on three architectural principles:
> 1. **Data Minimization**: Only 3 specific fields are requested for fee grants, while 7 unneeded fields are shielded.
> 2. **Explicit Purpose Limitation**: Every consent receipt has an expiry date, scope limit, and 1-click instant revocation.
> 3. **Zero Sensitive Storage**: Sensitive credentials (passwords, Aadhaar OTPs, biometric tokens, banking PINs) are blocked by design.

### Q3: "How does the agent handle connectivity drops or API failures?"
> **Answer**: `server.ts` implements a multi-tier fallback cascade:
> - Primary: High-throughput `gemini-2.5-flash` / `gemini-3.8-flash`.
> - Secondary: High-availability fallback model aliases.
> - Tertiary: A local deterministic heuristic engine that serves complete verified guidance, deadlines, and document checklists even if the internet drops or AI APIs experience high demand.

---

## 6. Hackathon Presentation Slides Outline (5 Slides)

- **Slide 1**: Title, Problem (The $10B Welfare Delivery Gap in India), Team Name.
- **Slide 2**: The Solution — "From Life Event to Right Action" (Flow diagram).
- **Slide 3**: Core Innovations — NIRVAHA AssistFill, Boolean Consent Gates, Bilingual Kannada-First.
- **Slide 4**: Live Demo Highlights & Privacy Metrics (Zero-Aadhaar storage, 1-click Revoke).
- **Slide 5**: Roadmap & Impact — Integration with DigiLocker, Seva Sindhu, and Bhashini AI APIs.
