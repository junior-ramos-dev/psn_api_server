import { TrophyRarity } from "psn-api";

enum TrophyTypesNames {
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
  Platinum = "platinum",
}

export const RARITY_MAP: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};

export const POINTS_MAP: Record<TrophyTypesNames, number> = {
  [TrophyTypesNames.Bronze]: 15,
  [TrophyTypesNames.Silver]: 30,
  [TrophyTypesNames.Gold]: 90,
  [TrophyTypesNames.Platinum]: 180,
};

export const CAPITALIZE_TYPE_MAP: Record<TrophyTypesNames, string> = {
  [TrophyTypesNames.Bronze]: "Bronze",
  [TrophyTypesNames.Silver]: "Silver",
  [TrophyTypesNames.Gold]: "Gold",
  [TrophyTypesNames.Platinum]: "Platinum",
};
