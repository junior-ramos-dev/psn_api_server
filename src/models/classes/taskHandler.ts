import { IErrorResponse } from "@/models/interfaces/common/error";

import { ITaskHandler, ITaskProps } from "../interfaces/taskHandler";

export class TaskHandler implements ITaskHandler {
  data: object;
  error: IErrorResponse;
  taskProps: ITaskProps;

  constructor(taskHandler?: ITaskHandler) {
    this.data = taskHandler?.data ?? {};
    this.error = taskHandler?.error ?? {
      status: 0,
      name: "",
      message: "",
    };
    this.taskProps = taskHandler?.taskProps ?? {
      runTask: 0,
      runSubTask: 0,
      stepId: 0,
    };
  }

  setData = (data: object) => {
    this.data = data;
  };

  setError = (error: IErrorResponse) => {
    this.error = error;
  };

  setTaskProps = (taskProps: ITaskProps) => {
    this.taskProps = taskProps;
  };

  getResponse = () => {
    const taskhandlerResponse: ITaskHandler = {
      data: this.data,
      error: this.error,
      taskProps: this.taskProps,
    };

    return taskhandlerResponse;
  };

  getTaskPropsRunTask = () => this.taskProps.runTask;

  getTaskPropsRunSubTask = () => this.taskProps.runSubTask;

  getTaskPropsStepId = () => this.taskProps.stepId;

  setTaskPropsRunTask = (runTask: number) => {
    this.taskProps.runTask = runTask;
  };

  setTaskPropsRunSubTask = (runSubTask: number) => {
    this.taskProps.runSubTask = runSubTask;
  };

  setTaskPropsStepId = (stepId: number) => {
    this.taskProps.stepId = stepId;
  };

  logTaskProps = () => {
    console.log(this.taskProps);
  };
}
