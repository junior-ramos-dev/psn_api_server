import { Request, Response } from "express";

import {
  handleResponse,
  taskHandler,
  taskHandlerWrapper,
} from "../../../../node_modules/jrd_task_handler/dist";

import { registerTasksSpecsList } from "./registerTasksSpecsList";

export const taskEndpoint = async (req: Request, res: Response) => {
  //TODO Fix
  // Get NPSSO code set in the session
  const npsso = req.session.npsso!;

  const requestArgs: object = { ...req.body, npsso, res };

  // console.log(requestArgs);

  const result = await taskHandlerWrapper(
    taskHandler,
    requestArgs,
    registerTasksSpecsList
  );

  console.log("result:", result);

  handleResponse(result, res);
};
