import { Types } from "mongoose";

import { ITrophyTypeStats } from "@/models/interfaces/stats/trophyStats";
import { UserGamesTrophies } from "@/models/schemas/user";

/**
 *
 * @param userId
 * @param startDate
 * @param endDate
 * @returns
 */
export const getDbEarnedTrophyTypesStats = async (
  userId: string,
  startDate: string,
  endDate: string
) => {
  const earnedTrophyTypesStats = await UserGamesTrophies.aggregate([
    // Make reference to the usergames collection using the "userId"
    {
      $lookup: {
        from: "usergames",
        localField: "usergames.userId",
        foreignField: "this.userId",
        as: "usergame",
      },
    },
    // Unwind gameTrohpies array
    {
      $unwind: "$gamesTrophies",
    },
    // Unwind trophyGroupsInfo array
    {
      $unwind: "$gamesTrophies.trophyGroups.trophyGroupsInfo",
    },
    // Unwind groupTrophies array
    {
      $unwind: "$gamesTrophies.trophyGroups.trophyGroupsInfo.groupTrophies",
    },
    // Unwind userGame object
    {
      $unwind: "$usergame",
    },
    // Unwind usergame games array
    {
      $unwind: "$usergame.games",
    },
    {
      // Match userId, platform and npCommunicationId for the usergame
      $match: {
        userId: new Types.ObjectId(userId),

        // "usergame.games.trophyTitlePlatform": "PS5",
        // "usergame.games.npCommunicationId": {
        //   $in: [ "NPWR18041_00"]
        // },
        //2024-07-22T22:06:07.000+00:00
        // Match the range of dates for the last game update
        "usergame.games.lastUpdatedDateTime": {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        $expr: {
          // Expression to assert usergametrophies and usergame with same npCommunicationId
          $eq: [
            "$usergame.games.npCommunicationId",
            "$gamesTrophies.npCommunicationId",
          ],
        },
      },
    },
    // Group the trophies by type and sum whether is earned or not
    {
      $group: {
        _id: {
          trophyType:
            "$gamesTrophies.trophyGroups.trophyGroupsInfo.groupTrophies.trophyType",
        },
        earnedTotal: {
          $sum: {
            $cond: {
              if: {
                $eq: [
                  true,
                  "$gamesTrophies.trophyGroups.trophyGroupsInfo.groupTrophies.isEarned",
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        notEarnedTotal: {
          $sum: {
            $cond: {
              if: {
                $eq: [
                  false,
                  "$gamesTrophies.trophyGroups.trophyGroupsInfo.groupTrophies.isEarned",
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        total: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.trophyType": 1,
      },
    },

    //Project the the final output excluding the "_id" field
    {
      $project: {
        _id: 0,
        trophyType: "$_id.trophyType",
        earnedTotal: 1,
        notEarnedTotal: 1,
        total: 1,
      },
    },
  ]);

  return earnedTrophyTypesStats as ITrophyTypeStats[];
};
