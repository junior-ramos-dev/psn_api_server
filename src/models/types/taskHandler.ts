import { TaskHandler } from "../classes/taskHandler";
import { IObjectMap, ITaskHandler } from "../interfaces/taskHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TaskFunctionParams = IObjectMap<any>;

export type TaskFunction = (
  taskFunctionParams: TaskFunctionParams,
  taskHandler: TaskHandler
) => Promise<ITaskHandler | undefined>;

export type TaskProgressLoader = (
  taskFunction: TaskFunction,
  taskFunctionParams: TaskFunctionParams,
  taskHandler: TaskHandler
) => Promise<ITaskHandler | undefined>;

type Remap<Obj extends object> = {
  [Prop in keyof Obj as Prop]: Obj[Prop];
};

export const remapObj = <Obj extends object>(obj: Obj) =>
  (Object.keys(obj) as Array<keyof Obj>).reduce(
    (acc, elem) => ({
      ...acc,
      [elem]: obj[elem],
    }),
    {} as Remap<Obj>
  );
