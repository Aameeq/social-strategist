export interface InstagramData {
  username: string;
  biography: string;
  followersCount: number;
  recentPosts: Array<{
    caption: string;
    imageUrl: string;
    likes: number;
  }>;
}

export interface BrandKit {
  toneOfVoice: string[];
  colorPalette: string[];
  visualStyle: string;
  keyThemes: string[];
  targetAudience: string;
}

export interface GeneratedPost {
  copy: string;
  hashtags: string[];
  imageUrl?: string;
}

export interface ExpertCritique {
  score: number;
  feedback: string[];
  approved: boolean;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  SCRAPING = 'SCRAPING',
  ANALYZING = 'ANALYZING',
  COPYWRITING = 'COPYWRITING',
  DESIGNING = 'DESIGNING',
  REVIEWING = 'REVIEWING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface WorkflowState {
  status: AgentStatus;
  instagramUrl: string;
  // apifyToken removed as it's now handled server-side/env
  userTheme: string;
  userImage: File | null;
  scrapedData: InstagramData | null;
  brandKit: BrandKit | null;
  generatedPost: GeneratedPost | null;
  critique: ExpertCritique | null;
  error?: string;
}