import { IBulkResponse } from "@/models/interfaces/common/bulk";
import { servicesErrorHandler } from "@/models/interfaces/common/error";

import { createDbGameIconBin, createDbGamesByUser } from "../gameRepository";

import { upsertTrophiesForAllGamesBulk } from "./trophy";

/**
 * Load the games and trophy user data from PSN and insert on DB
 *
 * @param userId
 */
export const loadPsnUserDataOnRegister = async (userId: string) => {
  try {
    let dataLoaded = false;

    // Get the list of games from PSN and insert on DB
    console.log(
      `[${new Date().toISOString()}] Started loading user data from PSN...`
    );
    const createdGames = await createDbGamesByUser(userId);

    if (createdGames) {
      // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
      // and insert as binary data in the collection "gamesicons"
      await createDbGameIconBin(createdGames);

      // Response for getting list of trophies
      const bulkResponse: IBulkResponse<string> = {
        name: "createTrophiesListForAllGamesBulk",
        message: "",
        data: {},
        isError: false,
      };

      //Insert or Update the list of trophies for all games from a user (bulk)
      await upsertTrophiesForAllGamesBulk(userId, bulkResponse);
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
