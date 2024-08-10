import { GameIcon, UserGames } from "../../models/schemas/game";
import { Convert, IGame } from "../../models/interfaces/game";
import { PSN_AUTH, psnAuthFactory } from "../psnApi/auth";
import { getTrophyTitles } from "../psnApi/games";
import { Types } from "mongoose";
import { dolwnloadFileToBase64 } from "../../utils/download";

// Get games by user and add (populate) the virtual reference from GameIcon schema
export const getDbGamesByUser = async (userId: Types.ObjectId) => {
  const userGames = await UserGames.findOne({
    userId: userId,
  });
  // .populate({
  //   path: "games.gameIconBin",
  //   select: "iconBinaryData",
  //   // model: "gameiscons",
  // });

  let gamesList = Convert.toIGameArray(userGames!.games);

  return gamesList;
};

// Create the lsit of games by user
export const createDbGamesByUser = async (userId: Types.ObjectId) => {
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);
  const psnApiGames = await getTrophyTitles(accessToken, accountId);

  let gamesList = Convert.toIGameArray(psnApiGames);

  try {
    await UserGames.create({
      userId: userId,
      games: gamesList,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err: any) {
    console.log(err);
  }

  return gamesList;
};

// Update the lsit of games by user
export const updateDbGamesByUser = async (userId: Types.ObjectId) => {
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);
  const psnApiGames = await getTrophyTitles(accessToken, accountId);

  let gamesList = Convert.toIGameArray(psnApiGames);

  try {
    const userGames = await UserGames.findOneAndUpdate(
      userId,
      {
        $set: { games: gamesList, updatedAt: new Date() },
      },
      {
        new: true,
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await userGames?.save();
  } catch (err: any) {
    console.log(err);
  }

  return gamesList;
};

// Get the game icon binary data
export const getDbGameIconBin = async (npCommunicationId: string) => {
  const userGames = await GameIcon.findOne({
    npCommunicationId: npCommunicationId,
  });

  return userGames;
};

/**
 * Download the game icon (if not exists yet) and insert as binary data in the collection "gamesicons"
 * aside from the "usergames" collection.
 */
export const createDbGameIconBin = async (games: IGame[]) => {
  try {
    let count = 1;

    for (const game of games) {
      const gamesIconExists = await GameIcon.findOne({
        npCommunicationId: game.npCommunicationId,
      }).lean();

      if (gamesIconExists) {
        console.log(
          `[${count}/${games.length}] Game Icon already exists: ${game.trophyTitleName};`
        );
      } else {
        console.log(
          `[${count}/${games.length}] Downloading Game Icon: ${game.trophyTitleName};`
        );
        const iconBase64 = await dolwnloadFileToBase64(game.trophyTitleIconUrl);

        await GameIcon.create({
          npCommunicationId: game.npCommunicationId,
          trophyTitleName: game.trophyTitleName,
          trophyTitleIconUrl: game.trophyTitleIconUrl,
          iconBinaryData: iconBase64,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      count++;
    }
  } catch (err: any) {
    console.log(err);
  }
};

// async function getGame(id: number): Promise<Game | undefined> {
//   return new Promise((resolve, reject) => {
//     return resolve(games.find((c) => c.id === id));
//   });
// }

// async function addGame(game: Game): Promise<Game> {
//   return new Promise((resolve, reject) => {
//     if (!game.name || !game.cpf)
//       return reject(new Error(`Invalid game.`));

//     const newGame = new Game(game.name, game.cpf);
//     games.push(newGame);

//     return resolve(newGame);
//   });
// }

// async function updateGame(
//   id: number,
//   newGame: Game
// ): Promise<Game | undefined> {
//   return new Promise((resolve, reject) => {
//     const index = games.findIndex((c) => c.id === id);
//     if (index >= 0) {
//       if (newGame.name && games[index].name !== newGame.name)
//         games[index].name = newGame.name;

//       if (newGame.cpf && games[index].cpf !== newGame.cpf)
//         games[index].cpf = newGame.cpf;

//       return resolve(games[index]);
//     }

//     return resolve(undefined);
//   });
// }

// async function deleteGame(id: number): Promise<boolean> {
//   return new Promise((resolve, reject) => {
//     const index = games.findIndex((c) => c.id === id);
//     if (index >= 0) {
//       games.splice(index, 1);
//       return resolve(true);
//     }

//     return resolve(false);
//   });
// }
