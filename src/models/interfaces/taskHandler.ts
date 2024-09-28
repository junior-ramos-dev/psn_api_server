import { IErrorResponse } from "@/models/interfaces/common/error";

export interface ITaskHandler {
  data: object;
  error: IErrorResponse;
  taskProps: ITaskProps;
}

export interface ITaskProps {
  runTask: number;
  runSubTask: number;
  stepId: number;
}

export interface IObjectMap<T extends NonNullable<unknown>> {
  [key: string]: T;
}
