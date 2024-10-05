import { Request, Response } from "express";

import { TaskHandler } from "@/models/classes/taskHandler";

import { IObjectMap, ITaskHandler } from "../../models/interfaces/taskHandler";
import { remapObj, TaskFunctionParams } from "../../models/types/taskHandler";

import { registerUserLoader } from "./auth/registerLoader";
import { taskProgressLoader } from "./taskProgressLoader";

const taskHandler: TaskHandler = new TaskHandler();

export const taskProgressLoaderWrapper = async (
  req: Request,
  res: Response
) => {
  //TODO Fix
  // Get NPSSO code set in the session
  const npsso = req.session.npsso!;

  const requestParams: object = getRequestParams(req);

  const genericParamsObj: object = {
    ...requestParams,
    npsso,
    res,
  };

  const taskFunctionParams: TaskFunctionParams = remapObj(
    genericParamsObj
  ) as IObjectMap<object>;

  const result = await taskProgressLoader(
    registerUserLoader,
    taskFunctionParams,
    taskHandler
  );

  if (result) {
    const response: ITaskHandler = result;
    if (response && !response.data && "taskProps" in response) {
      res.status(201).json(response);
    } else if (response?.error && response?.error.status > 0) {
      res.status(response.error.status).json(response.error);
    } else if (response?.data) {
      res.status(200).json(response);
    }
  }
};

const getRequestParams = (req: Request): object => {
  let params: object;

  switch (req.method) {
    case "GET":
      return {};

    case "POST":
      params = getPostRequestBody(req);
      return params;

    default:
      return {};
  }
};

const getPostRequestBody = (req: Request) => {
  const body = req.body;

  return body;
};
