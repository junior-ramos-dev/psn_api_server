import type { Trophy } from "psn-api";
import { TrophyRarity } from "psn-api";
import { TrophyNormalized } from "src/models/interfaces/trophy";

import { TrophyTypesNames } from "../enums/trophy";

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
) => {
  const mergedTrophies: TrophyNormalized[] = [];

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

  const trophyNormalized: TrophyNormalized = {
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

  return trophyNormalized;
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};

const pointsMap: Record<TrophyTypesNames, number> = {
  [TrophyTypesNames.Bronze]: 15,
  [TrophyTypesNames.Silver]: 30,
  [TrophyTypesNames.Gold]: 90,
  [TrophyTypesNames.Platinum]: 180,
};

const capitalizeTypeMap: Record<TrophyTypesNames, string> = {
  [TrophyTypesNames.Bronze]: "Bronze",
  [TrophyTypesNames.Silver]: "Silver",
  [TrophyTypesNames.Gold]: "Gold",
  [TrophyTypesNames.Platinum]: "Platinum",
};

export { mergeTrophyLists, normalizeTrophy };
