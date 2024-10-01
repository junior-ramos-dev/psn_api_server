export interface ITrophy {
  trophyId: number;
  trophyHidden: boolean;
  isEarned: boolean | undefined;
  isEarnedDateTime: string | undefined;
  trophyType: string;
  trophyRare: number | undefined;
  trophyEarnedRate: number;
  trophyName: string | undefined;
  trophyDetail: string | undefined;
  trophyIconUrl: string | undefined;
  trophyGroupId: string | undefined;
  rarity: string;
  groupId: string | undefined;
  points: number;
  isChecked: boolean | undefined;
}

export interface ITrophyCount {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface ITrophySummary {
  level: number;
  progress: number;
  earnedTrophies: ITrophyCount;
}

export interface ITrophyTypeStats {
  earnedTotal: number;
  notEarnedTotal: number;
  total: number;
  trophyType: string;
}
