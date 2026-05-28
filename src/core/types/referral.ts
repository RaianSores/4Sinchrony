export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export interface ReferralInfo {
  code: string;
  url: string;
  totalReferrals: number;
  totalCreditsEarned: number;
}
