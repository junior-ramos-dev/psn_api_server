import chalk from "chalk";
import { Request, Response } from "express";
import fresh from "fresh";

enum VERBS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  LIST = "LIST",
}

enum CHALK_COLOR {
  GREEN = "green",
  CYAN = "cyan",
  YELLOW = "yellow",
  RED = "red",
  WHITE = "white",
}

// Apply color to the HTTP response status code
export const applyColorToHttpStatusCode = (status: number) => {
  let range = 0;

  if (status >= 200 && status <= 299) range = 1;
  if (status >= 300 && status <= 399) range = 2;
  if (status >= 400 && status <= 499) range = 3;
  if (status >= 500 && status <= 599) range = 4;

  switch (range) {
    case 1:
      return chalk[CHALK_COLOR.GREEN](status);
    case 2:
      return chalk[CHALK_COLOR.CYAN](status);
    case 3:
      return chalk[CHALK_COLOR.YELLOW](status);
    case 4:
      return chalk[CHALK_COLOR.RED](status);
    default:
      return chalk[CHALK_COLOR.WHITE](status);
  }
};

// Apply color to the HTTP request method
export const applyColorToHttpMethod = (method: string) => {
  switch (method) {
    case VERBS.GET:
      return chalk[CHALK_COLOR.GREEN](method);
    case VERBS.POST:
      return chalk[CHALK_COLOR.YELLOW](method);
    case VERBS.PUT:
      return chalk[CHALK_COLOR.CYAN](method);
    case VERBS.PATCH:
      return chalk[CHALK_COLOR.CYAN](method);
    case VERBS.DELETE:
      return chalk[CHALK_COLOR.RED](method);
    default:
      return chalk[CHALK_COLOR.WHITE](method);
  }
};

// Helper function to get token value
export const getBearerTokenFromHeader = (authToken: string) => {
  return authToken.split(" ")[1];
};

// Helper function to check if Etag is new
export const isFreshEtagHeader = (req: Request, res: Response) => {
  try {
    const resHeader = {
      etag: JSON.parse(res.get("etag")!),
      "if-none-match": JSON.parse(res.get("if-none-match")!),
    };
    const reqHeader = {
      etag:
        req.headers["etag"] != ""
          ? JSON.parse(req.headers["etag"]!)
          : req.headers["etag"],
      "if-none-match": JSON.parse(req.headers["if-none-match"]!),
    };
    // console.log(reqHeader);
    // console.log(resHeader);
    return fresh(reqHeader, resHeader);
  } catch (error) {
    console.log(error);
  }
};
