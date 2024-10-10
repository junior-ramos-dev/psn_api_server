// import { generateToken } from "@/controllers/authController";
// import { TaskHandler } from "@/models/classes/taskHandler";
// import { controllersErrorHandler } from "@/models/interfaces/common/error";
// import { IUserAndProfile, IUserProfile } from "@/models/interfaces/user";

// import { TaskFunctionParams } from "../../../models/types/taskHandler";
// import { PsnAuth } from "../../psnApi/psnAuth";

// import {
//   checkEmailExists,
//   checkOnlineIdExists,
//   createUserAndProfile,
//   getGamesTrophiesList,
//   getPsnCredentials,
//   getUserGamesList,
//   isMissingNpsso,
//   loadGamesIcons,
// } from "./registerLoaderSteps";

// // PsnAuth object
// let PSN_AUTH2: PsnAuth;

// interface RegisterData {
//   user: {
//     id: string;
//     psnOnlineId: string;
//     email: string;
//   };
//   profile: IUserProfile | undefined;
// }

// const registerData: RegisterData = {
//   user: {
//     id: "",
//     psnOnlineId: "",
//     email: "",
//   },
//   profile: undefined,
// };

// const setRegisterData = (
//   userData: IUserAndProfile,
//   registerData: RegisterData
// ) => {
//   registerData.user.id = String(userData.userDb._id);
//   registerData.user.psnOnlineId = userData.userDb.psnOnlineId;
//   registerData.user.email = userData.userDb.email;
//   registerData.profile = userData.userProfileDb;
// };

// let runSubTask = 0;
// let stepId = 1;

// /**
//  * Register an user
//  *
//  * @param req
//  * @param res
//  * @returns
//  */
// const registerUserLoader = async (
//   params: TaskFunctionParams,
//   taskHandler: TaskHandler
// ) => {
//   // Subtasks Vars
//   // Step 5 - Create user and user profile
//   let userData: IUserAndProfile | undefined;
//   // Steps 6 to 8 - Load games and trophies
//   // let userId: string;

//   try {
//     console.log("TASK RUNNING");
//     console.log("x", taskHandler.logTaskProps());

//     // Step 1 - Check PSN onlineId exists
//     if (stepId === 1 && !runSubTask) {
//       runSubTask = 1;
//       await checkOnlineIdExists(params.psnOnlineId).then(() => {
//         stepId = 2;
//         runSubTask = 0;
//       });
//     }

//     // Step 2 - Check email
//     if (stepId === 2 && !runSubTask) {
//       runSubTask = 1;
//       await checkEmailExists(params.email).then(() => {
//         stepId = 3;
//         runSubTask = 0;
//       });
//     }

//     // Step 3 - Check if NPSSO exists
//     if (stepId === 3 && !runSubTask) {
//       runSubTask = 1;
//       //[return taskHandler error]
//       isMissingNpsso(params.npsso);

//       stepId = 4;
//       runSubTask = 0;
//     }

//     // Step 4 - Get PSN credentials
//     if (stepId === 4 && !runSubTask) {
//       runSubTask = 1;
//       getPsnCredentials(params.npsso).then((data) => {
//         PSN_AUTH2 = data;
//         stepId = 5;
//         runSubTask = 0;
//       });
//     }

//     // Step 5 - Create user and user profile
//     if (stepId === 5 && !runSubTask) {
//       runSubTask = 1;
//       // Create user and user profile
//       await createUserAndProfile(
//         params.psnOnlineId,
//         params.email,
//         params.password
//       ).then((data) => {
//         userData = data;
//         setRegisterData(userData, registerData);
//         stepId = 6;
//         runSubTask = 0;
//       });
//     }

//     // Steps 6 to 8 - Load games and trophies
//     // Step 6 - Get user games list
//     if (stepId === 6 && runSubTask) {
//       console.log("Running Step 6 - Get user games list...");
//     } else if (stepId === 6 && !runSubTask) {
//       runSubTask = 1;
//       await getUserGamesList(registerData.user.id).then(() => {
//         stepId = 7;
//         runSubTask = 0;
//       });
//     }
//     // Step 7 - Load the games icons
//     if (stepId === 7 && runSubTask) {
//       console.log("Running Step 7 - Load the games icons...");
//     } else if (stepId === 7 && !runSubTask) {
//       runSubTask = 1;
//       await loadGamesIcons(registerData.user.id).then(() => {
//         stepId = 8;
//         runSubTask = 0;
//       });
//     }

//     // Step 8 - Get the games trohies list
//     if (stepId === 8 && runSubTask) {
//       console.log("Step 8 - Get the games trohies list...");
//     } else if (stepId === 8 && !runSubTask) {
//       runSubTask = 1;
//       await getGamesTrophiesList(registerData.user.id).then(() => {
//         stepId = 9;
//         runSubTask = 0;
//       });
//     }

//     // Step 9 - Finishing (Return register data)
//     if (stepId === 9 && !runSubTask) {
//       runSubTask = 1;
//       generateToken(params.res, registerData.user.id);

//       taskHandler.data = registerData;

//       taskHandler.setTaskPropsRunTask(0);
//       stepId = 0;
//       runSubTask = 0;
//     }

//     taskHandler.setTaskPropsStepId(stepId);
//     return taskHandler.getResponse();
//   } catch (error) {
//     console.log(error);
//     const resObj = controllersErrorHandler(error);

//     taskHandler.error = {
//       status: resObj.status,
//       name: resObj.name,
//       message: resObj.message,
//       errors: resObj.errors ? resObj.errors : undefined,
//     };
//     return taskHandler.getResponse();
//   }
// };

// export { PSN_AUTH2, registerUserLoader };
