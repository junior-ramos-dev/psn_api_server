import { TaskHandler } from "@/models/classes/taskHandler";

import {
  TaskFunction,
  TaskFunctionParams,
  TaskProgressLoader,
} from "../../models/types/taskHandler";

export const taskProgressLoader: TaskProgressLoader = async (
  taskFunction: TaskFunction,
  params: TaskFunctionParams,
  taskHandler: TaskHandler
) => {
  const response = await taskFunction(params, taskHandler);

  return response;
};
