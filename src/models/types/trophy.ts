import { TrophyRarity } from "psn-api";

export enum TROPHY_TYPE_NAME {
  BRONZE = "bronze",
  SILVER = "silver",
  GOLD = "gold",
  PLATINUM = "platinum",
}

export const TROPHY_RARITY_MAP: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};

export const TROPHY_POINTS_MAP: Record<TROPHY_TYPE_NAME, number> = {
  [TROPHY_TYPE_NAME.BRONZE]: 15,
  [TROPHY_TYPE_NAME.SILVER]: 30,
  [TROPHY_TYPE_NAME.GOLD]: 90,
  [TROPHY_TYPE_NAME.PLATINUM]: 300,
};

export const CAPITALIZE_TYPE_MAP: Record<TROPHY_TYPE_NAME, string> = {
  [TROPHY_TYPE_NAME.BRONZE]: "Bronze",
  [TROPHY_TYPE_NAME.SILVER]: "Silver",
  [TROPHY_TYPE_NAME.GOLD]: "Gold",
  [TROPHY_TYPE_NAME.PLATINUM]: "Platinum",
};
