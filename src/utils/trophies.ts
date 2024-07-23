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
  const nonEarnedDateTime = new Date(0).toISOString();

  return {
    trophyId: trophy.trophyId,
    trophyHidden: trophy.trophyHidden,
    isEarned: trophy.earned,
    isEarnedDateTime: trophy.earned ? trophy.earnedDateTime : nonEarnedDateTime,
    trophyType: capitalizeTypeMap[trophy.trophyType ?? trophy.trophyType],
    trophyRare: trophy.trophyRare,
    trophyEarnedRate: Number(trophy.trophyEarnedRate),
    trophyName: trophy.trophyName,
    trophyDetail: trophy.trophyDetail,
    trophyIconUrl: trophy.trophyIconUrl,
    trophyGroupId: trophy.trophyGroupId,
    rarity: rarityMap[trophy.trophyRare ?? 0],
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
