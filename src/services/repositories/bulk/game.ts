import _ from "lodash";
import { TrophyTitle } from "psn-api";

import { IBulkResponse } from "@/models/interfaces/common/bulk";
import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { Convert } from "@/models/interfaces/game";
import { IUserGames } from "@/models/interfaces/user";
import { UserGames } from "@/models/schemas/user";
import { getTrophyTitles } from "@/services/psnApi/games";

import { createDbGameIconBin } from "../gameIconRepository";

import { upsertDbTrophiesForAllGamesBulk } from "./trophy";

const PSN_API_GAME_LIMIT = 20;
const PSN_API_GAME_OFFSET = 0;

/**
 * Load the games and trophy user data from PSN and insert on DB
 *
 * @param userId
 */
export const loadPsnGamesData = async (userId: string) => {
  try {
    let dataLoaded = false;

    // Get the list of games from PSN and insert on DB
    console.log(
      `[${new Date().toISOString()}] Started loading user data from PSN...`
    );
    const createdGames = await insertAllDbGamesByUser(userId);

    if (createdGames) {
      // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
      // and insert as binary data in the collection "gamesicons"
      await createDbGameIconBin(userId);

      // Response for getting list of trophies
      const bulkResponse: IBulkResponse<string> = {
        name: "upsertTrophiesForAllGamesBulk",
        message: "",
        data: {},
        isError: false,
      };

      //Insert or Update the list of trophies for all games from a user (bulk)
      await upsertDbTrophiesForAllGamesBulk(userId, bulkResponse);
    }
    console.log(
      `[${new Date().toISOString()}] Finished loading user data from PSN...`
    );

    dataLoaded = true;

    return dataLoaded;
  } catch (error) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Insert the list of all games by user
 *
 * @param userId
 * @returns
 */
export const insertAllDbGamesByUser = async (
  userId: string
): Promise<IUserGames | undefined> => {
  try {
    console.log(
      `[${new Date().toISOString()}] Started getting games from PSN...`
    );
    // Get the total of games
    const { totalItemCount } = await getTrophyTitles();

    // Iterates over the total of items and insert all games
    const trophyTitleList: TrophyTitle[] = await getAllTrophyTitles(
      totalItemCount
    );

    const gamesList = Convert.toIGameArray(trophyTitleList);

    const userGames = await UserGames.create({
      userId: userId,
      games: gamesList,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(
      `[${new Date().toISOString()}] Finished getting games from PSN.`
    );
    return userGames as IUserGames;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Update the list of all games by user
 *
 * @param userId
 * @returns
 */
export const updateAllDbGamesByUserId = async (
  userId: string
): Promise<IUserGames | undefined> => {
  try {
    // Get the total of games
    const { totalItemCount } = await getTrophyTitles();

    // Iterates over the total of items and update all games
    const trophyTitleList: TrophyTitle[] = await getAllTrophyTitles(
      totalItemCount
    );

    const gamesList = Convert.toIGameArray(trophyTitleList);

    const userGames = await UserGames.findOneAndUpdate(
      { userId: userId },
      {
        $set: { games: gamesList, updatedAt: new Date() },
      },
      {
        new: true,
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await userGames?.save();

    return userGames as IUserGames;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

// Iterates over the totalItemCount and return the list of all games;
const getAllTrophyTitles = async (
  totalItemCount: number
): Promise<TrophyTitle[]> => {
  let trophyTitleList: TrophyTitle[] = [];
  for (
    let nOffset = PSN_API_GAME_OFFSET;
    nOffset <= totalItemCount;
    nOffset += PSN_API_GAME_LIMIT + PSN_API_GAME_OFFSET
  ) {
    // Get the user's list of titles (games) from psn_api
    const { trophyTitles, totalItemCount, nextOffset, previousOffset } =
      await getTrophyTitles(PSN_API_GAME_LIMIT, nOffset);
    trophyTitleList = _.concat(trophyTitleList, trophyTitles);

    console.log("LIMIT " + PSN_API_GAME_LIMIT, "N_OFFSET " + nOffset);
    console.log(
      "TOTAL_ITEMS " + totalItemCount,
      "NEXT_OFFSET " + nextOffset,
      "PREV_OFFSET " + previousOffset
    );
    console.log("LIST_LENGTH " + trophyTitleList.length);
  }

  return trophyTitleList;
};
