import type { Trophy } from "psn-api";
import { TrophyRarity } from "psn-api";
import { TrophyTypes } from "../enums/trophy";

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
) => {
  const mergedTrophies: any[] = [];

  for (const earnedTrophy of earnedTrophies) {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === earnedTrophy.trophyId
    );

    mergedTrophies.push(
      normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy })
    );
  }

  return mergedTrophies;
};

const normalizeTrophy = (trophy: Trophy) => {
  return {
    isEarned: trophy.earned ?? false,
    earnedOn: trophy.earned ? trophy.earnedDateTime : "unearned",
    type: capitalizeTypeMap[trophy.trophyType ?? trophy.trophyType],
    rarity: rarityMap[trophy.trophyRare ?? 0],
    earnedRate: Number(trophy.trophyEarnedRate),
    trophyName: trophy.trophyName,
    groupId: trophy.trophyGroupId,
    points: pointsMap[trophy.trophyType ?? 0],
  };
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};

const pointsMap: Record<TrophyTypes, number> = {
  [TrophyTypes.Bronze]: 15,
  [TrophyTypes.Silver]: 30,
  [TrophyTypes.Gold]: 90,
  [TrophyTypes.Platinum]: 180,
};

const capitalizeTypeMap: Record<TrophyTypes, string> = {
  [TrophyTypes.Bronze]: "Bronze",
  [TrophyTypes.Silver]: "Silver",
  [TrophyTypes.Gold]: "Gold",
  [TrophyTypes.Platinum]: "Platinum",
};

export { mergeTrophyLists, normalizeTrophy };
