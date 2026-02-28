export type AppStatus = 'building' | 'finished' | 'queued';

export interface AppInfo {
  id: string;
  title: string;
  description: string;
  status: AppStatus;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  liveUrl: string | null;
  model: string;
  deployment: string | null;
}

export type LogCategory = 'INIT' | 'PLAN' | 'REASONING' | 'TEST' | 'DEPLOY' | 'BUILD' | 'ERROR';

export interface ActivityLogEntry {
  id: string;
  appId: string;
  timestamp: string;
  category: LogCategory;
  message: string;
  codeSnippet: string | null;
}

export interface AppRequestAssessment {
  accepted: boolean;
  reason: string | null;
  appId: string | null;
}
