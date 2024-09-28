import { TaskHandler } from "@/models/classes/taskHandler";

import {
  TASK_NAME,
  TaskFunction,
  TaskFunctionParams,
  TaskProgressLoader,
} from "../../models/types/taskHandler";

export const taskProgressLoader: TaskProgressLoader = async (
  taskFunctionName: TASK_NAME,
  taskFunction: TaskFunction,
  params: TaskFunctionParams,
  taskHandler: TaskHandler
) => {
  if (taskFunctionName === taskFunction.name) {
    const response = await taskFunction(params, taskHandler);

    return response;
  } else {
    console.log("wrong function");
  }
};
