import { MongooseError, Types } from "mongoose";
import { GameTrophies } from "src/models/schemas/game";

import { PSN_AUTH, psnAuthFactory } from "../psnApi/auth";
import { getGameTrophiesInfo } from "../psnApi/trophies";

/**
 * Create the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
export const createDbTrophiesByGame = async (
  userId: Types.ObjectId,
  npCommunicationId: string,
  trophyTitlePlatform: string
) => {
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);
  const gameTrophiesList = await getGameTrophiesInfo(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform
  );
  // const gamesList = Convert.toIGameArray(psnApiGames);

  try {
    await GameTrophies.create({
      userId: userId,
      npCommunicationId: npCommunicationId,
      trophies: gameTrophiesList,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
    }
  }

  return gameTrophiesList;
};

/**
 * Get the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @returns
 */
export const getDbTrophiesByGame = async (
  userId: Types.ObjectId,
  npCommunicationId: string
) => {
  const gameTrophiesList = await GameTrophies.findOne({
    userId: userId,
    npCommunicationId: npCommunicationId,
  });
  // const gamesList = Convert.toIGameArray(userGames!.games);

  return gameTrophiesList;
};

export const updateDbTrophiesByGame = async (
  userId: Types.ObjectId,
  npCommunicationId: string,
  trophyTitlePlatform: string
) => {
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);
  const gameTrophiesList = await getGameTrophiesInfo(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform
  );
  // const gamesList = Convert.toIGameArray(psnApiGames);

  try {
    const gameTrophies = await GameTrophies.findOneAndUpdate(
      { userId: userId, npCommunicationId: npCommunicationId },
      {
        $set: { games: gameTrophiesList, updatedAt: new Date() },
      },
      {
        new: true,
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await gameTrophies?.save();
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
    }
  }

  return gameTrophiesList;
};
