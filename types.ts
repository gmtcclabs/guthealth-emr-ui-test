export enum TestStatus {
  NONE = 'NONE',
  ORDERED = 'ORDERED', // Kit purchased, on way to user
  RECEIVED = 'RECEIVED', // User has kit
  ACTIVATED = 'ACTIVATED', // User scanned/registered kit
  MAILED = 'MAILED', // User mailed back
  PROCESSING = 'PROCESSING', // Lab has it
  READY = 'READY' // Results are in
}

export enum ConsultationStatus {
  NONE = 'NONE',
  PURCHASED = 'PURCHASED', // Paid for, not scheduled
  SCHEDULED = 'SCHEDULED', // On calendar
  COMPLETED = 'COMPLETED' // Done
}

export enum BrtStatus {
  NONE = 'NONE', // Not eligible (Option B before upgrade)
  OPTIONAL = 'OPTIONAL', // Eligible but not booked
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export enum ProbioticsStatus {
  NONE = 'NONE',
  RECOMMENDED = 'RECOMMENDED', // After consult
  PAID = 'PAID',
  SHIPPED = 'SHIPPED'
}

export enum PurchaseOption {
  NONE = 'NONE',
  TEST_ONLY = 'TEST_ONLY', // Option A: Discovery (HKD 3000)
  BUNDLE = 'BUNDLE', // Option B: Proactive/Action (HKD 3900)
  UPGRADE = 'UPGRADE' // Consult Add-on (HKD 1200)
}

export interface LabResult {
  diversityScore: number;
  goodBacteria: number;
  badBacteria: number;
  sensitivity: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserState {
  name: string;
  purchaseHistory: PurchaseOption[];
  testStatus: TestStatus;
  consultationStatus: ConsultationStatus;
  brtStatus: BrtStatus;
  probioticsStatus: ProbioticsStatus;
  questionnaireStatus: {
    completed: boolean;
    date?: string;
  };
  labResults?: LabResult;
  consultationDate?: Date;
  brtDate?: Date;
  notifications: Notification[];
}