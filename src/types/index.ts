export type Language = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ml' | 'mr' | 'bn';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  speechLocale: string;
  fontClass: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-IN', fontClass: 'font-sans' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN', fontClass: 'font-kannada' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN', fontClass: 'font-devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN', fontClass: 'font-tamil' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN', fontClass: 'font-telugu' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN', fontClass: 'font-malayalam' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN', fontClass: 'font-devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN', fontClass: 'font-bengali' },
];

export type UserType = 
  | 'Student'
  | 'Farmer'
  | 'Worker'
  | 'Parent/Guardian'
  | 'Citizen'
  | 'Other';

export interface UserProfile {
  preferredName: string;
  state: string;
  district: string;
  preferredLanguage: Language;
  userType: UserType;
  // Universal Citizen Demographics (for all)
  age?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone?: string;
  email?: string;
  socialCategory?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';
  householdIncomeRange?: string;
  rationCardType?: 'BPL / PHH' | 'APL' | 'Antyodaya (AAY)' | 'None';
  bplCardNumber?: string;
  bankAccountLinked?: boolean;
  hasIncomeCertificate?: 'yes' | 'no' | 'not_sure';
  hasBonafideCertificate?: 'yes' | 'no' | 'not_sure';
  hasMarksCard?: 'yes' | 'no' | 'not_sure';
  // Student Specific
  collegeName?: string;
  course?: string;
  yearOfStudy?: string;
  cgpaOrPercentage?: string;
  studentRollNo?: string;
  isHosteller?: boolean;
  // Farmer Specific
  landholdingAcres?: string;
  surveyRtcNumber?: string;
  pmKisanId?: string;
  primaryCrops?: string;
  // Worker / Labour Specific
  occupationTrade?: string;
  eShramUan?: string;
  bocwCardNo?: string;
  monthlyWages?: string;
  // Disability Support
  udidNumber?: string;
  disabilityType?: string;
  disabilityPercent?: string;
  // System Flags
  onboardingCompleted: boolean;
  termsAccepted: boolean;
}

export type LifeEventId = 
  | 'student_fees'
  | 'loss_of_earner'
  | 'crop_loss'
  | 'disability'
  | 'relocation';

export interface LifeEventOption {
  id: LifeEventId;
  title: string;
  titleKn: string;
  iconName: string;
  description: string;
  descriptionKn: string;
  urgency: 'high' | 'medium' | 'normal';
  samplePrompt: string;
  samplePromptKn: string;
}

export type EligibilityStatus = 
  | 'likely_eligible'
  | 'may_be_eligible'
  | 'more_info_required'
  | 'not_likely_eligible';

export interface VerifiedService {
  id: string;
  name: string;
  nameKn: string;
  status: 'Prototype demo data' | 'Verified Official';
  purpose: string;
  purposeKn: string;
  category: 'Education' | 'Agriculture' | 'Social Welfare' | 'Disability' | 'Civic';
  applicableLifeEvents: LifeEventId[];
  userTypes: UserType[];
  state: string;
  eligibilityExample: string[];
  eligibilityExampleKn: string[];
  documentsRequired: string[];
  documentsRequiredKn: string[];
  deadlineDays: number | null; // null for rolling
  deadlineText: string;
  deadlineTextKn: string;
  officialSourceUrl: string;
  officialDomain: string;
  lastVerifiedDate: string;
  whyResultReasons: string[];
  whyResultReasonsKn: string[];
  estimatedBenefit: string;
  // Specific Scholarship attributes
  isScholarship?: boolean;
  scholarshipAmount?: string;
  providerAgency?: string;
  targetCategory?: string; // e.g. "All Students", "SC/ST/OBC", "Girls in STEM", "Minorities", "Worker Wards"
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_help';

export interface ActionTask {
  id: string;
  title: string;
  titleKn: string;
  whyNeeded: string;
  whyNeededKn: string;
  status: TaskStatus;
  deadlineDays: number;
  deadlineDate: string;
  requiredDocuments: string[];
  officialLink?: string;
  reminderEnabled: boolean;
  serviceId?: string;
}

export interface ActionPlan {
  id: string;
  title: string;
  titleKn: string;
  lifeEvent: LifeEventId;
  totalTasks: number;
  completedTasks: number;
  missingDocumentsCount: number;
  nearestDeadlineDays: number;
  tasks: ActionTask[];
  lastUpdated: string;
}

export interface ConsentReceipt {
  id: string;
  serviceId: string;
  serviceName: string;
  purpose: string;
  dataShared: string[];
  dateApproved: string;
  accessExpires: string;
  status: 'Active' | 'Revoked';
  unnecessaryProtectedFieldsCount: number;
}

export type ApplicationStatus = 
  | 'NOT_STARTED'
  | 'DRAFT_CREATED'
  | 'DOCUMENTS_PENDING'
  | 'READY_FOR_REVIEW'
  | 'AWAITING_FINAL_CONSENT'
  | 'SUBMITTING'
  | 'SUBMITTED'
  | 'SUBMISSION_FAILED'
  | 'NEEDS_HUMAN_HELP';

export interface DraftField {
  id: string;
  key: string;
  label: string;
  labelKn: string;
  value: string;
  source: 'User profile' | 'Income certificate' | 'Uploaded document' | 'Requires manual entry on portal';
  status: 'filled' | 'needs_review' | 'manual_required' | 'verified';
  editable: boolean;
  sensitiveNotice?: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  nameKn: string;
  required: boolean;
  status: 'verified' | 'uploaded' | 'missing' | 'expired';
  fileName?: string;
  fileSize?: string;
  lastUpdated?: string;
  fileType?: string;
  category?: 'Identity' | 'Income & Caste' | 'Academic' | 'Land & Agriculture' | 'Labour & Work' | 'Disability';
  docNumber?: string;
  extractedDetails?: string;
  isApplicableToAll?: boolean;
}

export interface ApplicationDraft {
  id: string;
  serviceId: string;
  serviceName: string;
  officialDomain: string;
  status: ApplicationStatus;
  draftCreationConsent: boolean;
  reviewConfirmed: boolean;
  submissionConsent: boolean;
  applicationDeadlineOpen: boolean;
  fields: DraftField[];
  documents: UploadedDoc[];
  applicationId?: string;
  consentRecordId?: string;
  submittedAt?: string;
  nextUpdateEstimate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  textKn?: string;
  timestamp: string;
  label?: 'AI Guidance' | 'Verified Information' | 'Needs Official Confirmation' | 'Urgent: Contact Human Support';
  verifiedSource?: {
    badge: string;
    sourceName: string;
    officialUrl: string;
    domain: string;
    lastVerifiedDate: string;
    whyShowingThis: string;
    whyShowingThisKn: string;
  };
  options?: {
    id: string;
    label: string;
    labelKn?: string;
    actionType: 'select_option' | 'open_assistfill' | 'create_action_plan' | 'human_help' | 'open_url';
    payload?: any;
  }[];
  interactiveType?: 'questionnaire' | 'service_recommendation' | 'assist_fill_prompt' | 'scholarship_matchboard';
  serviceData?: VerifiedService;
}

export interface HumanSupportTicket {
  id: string;
  category: string;
  description: string;
  contactMethod: string;
  sharedPlanSummary: boolean;
  timestamp: string;
  status: 'PENDING' | 'ASSIGNED' | 'RESOLVED';
  assignedTo: string;
  estimatedResponseTime: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'CONSENT' | 'APPLICATION' | 'REVOCATION' | 'ESCALATION' | 'ADMIN';
  details: string;
  serviceId?: string;
  dataCategoriesShared?: string[];
  status: 'SUCCESS' | 'REVOKED' | 'PENDING';
}
