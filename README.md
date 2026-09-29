# NIRVAHA AI
> **“From life event to the right action.”**  
> *Hackathon Track: Agentic AI for Billions*  
> *Product Category: Multilingual, voice-enabled, consent-first public-service navigation agent for India.*

---

## 1. Executive Summary

When a major life event occurs—such as sudden student financial distress, loss of a household's primary breadwinner, rain-induced crop damage, or an accident causing disability—citizens and first-generation learners are often overwhelmed by fragmented government portals, complex eligibility rules, and opaque document requirements.

**NIRVAHA AI** is not another conversational chatbot. It is a dependable, consent-first public-service navigation agent designed to guide citizens step-by-step from life event to concrete resolution:

```
Life Event 
  → Needs Assessment 
  → Verified Service Discovery 
  → Likely Eligibility Guidance 
  → Required Document Checklist 
  → Personalised Action Plan 
  → Deadline Reminders 
  → NIRVAHA AssistFill (Pre-fill with explicit consent) 
  → Human-Help Escalation
```

---

## 2. Key Pillars & Architectural Guarantees

### A. Grounded in Verified Sources (Anti-Hallucination)
- NIRVAHA AI **never invents schemes, official links, deadlines, or eligibility conditions**.
- Every service recommendation includes an official verified source badge, official domain (`.gov.in`, `.college.edu`), verification timestamp, and a **"Why am I seeing this?"** explanation.
- An **Admin & Source Curation Portal** allows institutional authorities to keep gazettes and rules up to date.

### B. Consent-First & Data Minimization
- **Consent Centre (“Your Data and Permissions”)**: The user retains complete authority over what is shared.
- Active consent receipts with 1-click **Revoke Access** capabilities.
- **Privacy Metric**: *Only 3 necessary data fields shared · 7 unnecessary fields protected from collection.*
- Strict zero-collection policy for sensitive credentials: **Passwords, OTPs, Aadhaar numbers, bank PINs, or credit card details are NEVER collected or stored.**

### C. NIRVAHA AssistFill (“Review before you submit”)
- Prepares verified application form drafts from user-approved profile data and uploaded documents.
- **Strict Boolean Submission Gate**:
  ```ts
  IF reviewConfirmed == true
  AND submissionConsent == true
  AND requiredDocumentsComplete == true
  AND requiredFieldsComplete == true
  AND applicationDeadlineOpen == true
  AND draftCreationConsent == true
  THEN: Enable and show the Submit Application button
  ELSE: Disable button and show:
        "Complete all required fields, documents, and consent steps before submitting."
  ```
- **Zero Silent Submissions**: Final submission is never automatic; the citizen reviews every field before authorizing transmission.

### D. Bilingual & Voice Accessibility (English & ಕನ್ನಡ)
- Complete UI, agent reasoning, and document checklists in **English** and **Kannada (ಕನ್ನಡ)**.
- Integrated **Speech-to-Text** (voice input) and **Text-to-Speech** (voice playback) for low-literacy and regional accessibility.

---

## 3. End-to-End User Journeys Covered

| Life Event | Key Guidance & Action Steps | Primary Verified Scheme |
| :--- | :--- | :--- |
| **1. Student Financial Distress** *(Main Demo)* | College bonafide, income RD certificate verification, marks card upload, fee deferral, institutional emergency fund. | **Karnataka Student Fee Support Grant** & College Emergency Aid |
| **2. Loss of Family Breadwinner** | Demise certificate, survivor welfare, family pensions, legal aid disclaimer, compassionate grant. | **National Family Benefit Scheme (NFBS)** |
| **3. Rain Crop Loss** | 72-hour mandatory reporting window, RTC land record, submerged crop photos, Raitha Mitra helpline. | **PM Fasal Bima Yojana (72-Hour Relief)** |
| **4. Disability or Accident** | Emergency hospital disclaimer, civil surgeon assessment, UDID disability card, college accommodations. | **Unique Disability ID (UDID) Portal** |
| **5. Citizen Relocation** | Strict dependency update sequence: Aadhaar → Fair Price Ration Porting → Bank KYC. | **Karnataka Seva Sindhu Citizen Services** |

---

## 4. Tech Stack & Execution

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend API**: Node.js & Express server (`server.ts`) with Vite middleware mounted in dev mode.
- **AI Engine**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` with grounded prompt boundaries and fallback deterministic engine.
- **Speech & Audio**: Web SpeechRecognition and SpeechSynthesis APIs with Indian/Kannada voice support.
- **Data Persistence**: In-memory and mock state models for users, action plans, consent records, uploaded documents, and audit logs.

---

## 5. Hackathon Judge Demonstration Script

1. **Open the App**: Notice the clean, high-contrast, government-service aesthetic and trust strip.
2. **Click "Demo Script"** in the top bar: Launches the 1-click evaluator walkthrough.
3. **Run "Student Financial Distress"**:
   - The agent empathetically responds to the college fees distress scenario.
   - Click **"Check Karnataka Student Fee Support"** to see the verified source card with the 12-day deadline.
   - Click **"Why am I seeing this?"** to verify transparent decision reasoning.
4. **Test AssistFill**:
   - Click **"Apply with NIRVAHA AssistFill"**.
   - Review Step 1 (Readiness) → Step 2 (Draft Consent checkbox) → Step 3 (Pre-filled form with sensitive data warning) → Step 4 (Document validation) → Step 5 (Review) → Step 6 (Final confirmation with Boolean gate).
   - Check both final checkboxes to enable submission.
   - View the official submission receipt with Application ID `NIR-2026-XXXXXX`.
5. **Inspect the Consent Centre**:
   - Navigate to **"Consent Centre"** to see active authorizations and revoke access with confirmation.
6. **Switch to Kannada (ಕನ್ನಡ)**:
   - Click **ಕನ್ನಡ** in the top header. The entire experience adapts to natural Kannada phrasing.
7. **Test Human Escalation**:
   - Navigate to **"Human Support"** to log an institutional callback ticket.
