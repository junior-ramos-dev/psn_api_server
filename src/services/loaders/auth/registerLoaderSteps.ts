import { IBulkResponse } from "@/models/interfaces/common/bulk";
import { MongoDbError, PsnApiError } from "@/models/interfaces/common/error";
import { PsnAuth } from "@/services/psnApi/psnAuth";
import { insertAllDbGamesByUser } from "@/services/repositories/bulk/game";
import { upsertDbTrophiesForAllGamesBulk } from "@/services/repositories/bulk/trophy";
import { createDbGameIconBin } from "@/services/repositories/gameIconRepository";
import {
  createDbUserAndProfile,
  getDbUserByEmail,
  getDbUserByPsnOnlineId,
} from "@/services/repositories/userRepository";

// Step 1 - Check PSN onlineId exists
export const checkOnlineIdExists = async (psnOnlineId: string) => {
  const onlineIdExists = await getDbUserByPsnOnlineId(psnOnlineId);

  if (onlineIdExists) {
    //[return taskHandler error]
    throw new MongoDbError(
      `An account with PSN Username '${psnOnlineId}' already exists! If you used this username to register, try to Login.`
    );
  }
};

// Step 2 - Check email
export const checkEmailExists = async (email: string) => {
  const userEmailExists = await getDbUserByEmail(email);
  if (userEmailExists) {
    //[return taskHandler error]
    throw new MongoDbError(
      `An account with email '${email}' already exists! If you used this email to register, try to Login.`
    );
  }
};

// Step 3 - Check if NPSSO exists [return taskHandler error]
export const isMissingNpsso = (npsso: string) => {
  if (!npsso) {
    throw new PsnApiError(
      "An error occurred in creating the account: Missing 'NPSSO' code"
    );
  }
};

// Step 4 - Get PSN credentials
export const getPsnCredentials = async (npsso: string) => {
  const psnAuth = await PsnAuth.createPsnAuth(npsso).then((psnAuth) => psnAuth);

  return psnAuth;
};

// Step 5 - Create user and user profile
export const createUserAndProfile = async (
  psnOnlineId: string,
  email: string,
  password: string
) => {
  // Create user and user profile
  const data = await createDbUserAndProfile(psnOnlineId, email, password).then(
    (data) => {
      console.log("userData");
      console.log(data?.userDb._id);
      return data;
    }
  );

  if (data && "userDb" in data && "userProfileDb" in data) {
    return data;
  } else {
    // [return taskHandler error]
    throw new MongoDbError("An error occurred while creating the account");
  }
};

// Step 6 - Get user games list
export const getUserGamesList = async (userId: string) => {
  // Get the list of games from PSN and insert on DB
  console.log(
    `[${new Date().toISOString()}] Started loading games data from PSN...`
  );

  await insertAllDbGamesByUser(userId)
    .then((data) => {
      console.log(
        "================================================== GAMES LIST"
      );
      return data;
    })
    .catch(() => {
      // [return taskHandler error]
      throw new MongoDbError("An error occurred while getting the games list");
    });
};

// Step 7 - Load the games icons
export const loadGamesIcons = async (userId: string) => {
  // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
  // and insert as binary data in the collection "gamesicons"
  await createDbGameIconBin(userId).then(() => {
    console.log(
      "================================================== GAMES ICONS"
    );
  });
};

// Step 8 - Get the games trohies list
export const getGamesTrophiesList = async (userId: string) => {
  // Response for getting list of trophies
  const bulkResponse: IBulkResponse<string> = {
    name: "upsertTrophiesForAllGamesBulk",
    message: "",
    data: {},
    isError: false,
  };

  //Insert or Update the list of trophies for all games from a user (bulk)
  await upsertDbTrophiesForAllGamesBulk(userId, bulkResponse).then(() => {
    console.log(
      "================================================== GAMES TROPHIES"
    );
  });

  console.log(
    `[${new Date().toISOString()}] Finished loading user data from PSN...`
  );
};
