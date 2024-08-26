export interface IBulkResponse<T> {
  name: string;
  message: string;
  data: { [key: string]: string | number | object | Array<T> };
  isError: boolean;
}
