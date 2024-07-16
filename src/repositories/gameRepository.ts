import { getUserTitles, TrophyTitle } from "psn-api";
import fs from "fs";

// Get the user's list of titles (games).
const getTrophyTitles = async (
  acessToken: string,
  accountId: string
): Promise<TrophyTitle[]> => {
  const { trophyTitles } = await getUserTitles(
    { accessToken: acessToken },
    accountId,
    { limit: 150 }
  );

  //Use for dev
  fs.writeFileSync("./games.json", JSON.stringify(trophyTitles));

  return new Promise((resolve, reject) => {
    return resolve(trophyTitles);
  });
};

export { getTrophyTitles };

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
