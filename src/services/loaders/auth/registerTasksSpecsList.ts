import { ITaskHandlerSpecs } from "jrd_task_handler";

import {
  checkEmailExists,
  checkOnlineIdExists,
  createUserAndProfile,
  getGamesTrophiesList,
  getPsnCredentials,
  getResultData,
  getUserGamesList,
  isMissingNpsso,
  loadGamesIcons,
} from "./registerLoaderSteps";

/**
 * This is an example of the specifications for each task used by the task loader
 */
export const registerTasksSpecsList: Array<ITaskHandlerSpecs> = [
  {
    taskId: 1,
    taskName: "checkOnlineIdExists",
    task: checkOnlineIdExists,
    requestArgs: {
      requestArgsKeys: ["psnOnlineId"],
    },
  },
  {
    taskId: 2,
    taskName: "checkEmailExists",
    task: checkEmailExists,
    requestArgs: {
      requestArgsKeys: ["email"],
    },
  },
  {
    taskId: 3,
    taskName: "isMissingNpsso",
    task: isMissingNpsso,
    requestArgs: {
      requestArgsKeys: ["npsso"],
    },
  },
  {
    taskId: 4,
    taskName: "getPsnCredentials",
    task: getPsnCredentials,
    requestArgs: {
      requestArgsKeys: ["npsso"],
    },
    taskReturnData: {
      cacheData: false,
    },
  },
  {
    taskId: 5,
    taskName: "createUserAndProfile",
    task: createUserAndProfile,
    requestArgs: {
      requestArgsKeys: ["psnOnlineId", "email", "password"],
    },
    taskReturnData: {
      cacheData: true,
    },
  },
  {
    taskId: 6,
    taskName: "getUserGamesList",
    task: getUserGamesList,
    prevTaskDataAsArg: {
      prevTaskId: 5,
      prevTaskDataArgs: ["userDb._id"],
    },
    taskReturnData: {
      cacheData: false,
    },
  },
  {
    taskId: 7,
    taskName: "loadGamesIcons",
    task: loadGamesIcons,
    prevTaskDataAsArg: {
      prevTaskId: 5,
      prevTaskDataArgs: ["userDb._id"],
    },
  },
  {
    taskId: 8,
    taskName: "getGamesTrophiesList",
    task: getGamesTrophiesList,
    prevTaskDataAsArg: {
      prevTaskId: 5,
      prevTaskDataArgs: ["userDb._id"],
    },
  },
  {
    taskId: 9,
    taskName: "getResultData",
    task: getResultData,
    requestArgs: {
      requestArgsKeys: ["res"],
    },
    prevTaskDataAsArg: {
      prevTaskId: 5,
      prevTaskDataArgs: ["userDb", "userProfileDb"],
    },
    taskReturnData: {
      cacheData: false,
    },
  },
];
