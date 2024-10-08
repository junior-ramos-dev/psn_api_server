import chalk from "chalk";
import etag from "etag";
import { Request, Response } from "express";
import fresh from "fresh";
import _ from "lodash";

import { IS_NODE_ENV_PRODUCTION } from "./env";

const poll = chalk.blueBright;

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

// Helper function to check npsso
export const checkNpssoFormat = (npsso: string) => {
  const npssoRegex = /^([a-zA-Z0-9]){64}$/;

  return npssoRegex.test(npsso);
};

/**
 * Helper function to check if Etag is new
 *
 * The ETag (or entity tag) HTTP response header is an identifier for a specific version of a resource.
 * It lets caches be more efficient and save bandwidth, as a web server does not need to resend a full response
 * if the content was not changed.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
 *
 * @param req
 * @param res
 * @param jsonObj
 * @returns
 */
export const isFreshEtagHeader = (
  req: Request,
  res: Response,
  jsonObj: object
) => {
  try {
    res.setHeader("etag", etag(Buffer.from(JSON.stringify(jsonObj))));
    res.setHeader("if-none-match", etag(Buffer.from(JSON.stringify(jsonObj))));

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
    console.log(reqHeader, resHeader);
    return fresh(reqHeader, resHeader);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Set the interval in hours to retrieve data from psn_api
 *
 * @param objUpdatedAt
 * @param intervalHours
 * @returns
 */
export const setPsnApiPollingInterval = (
  objUpdatedAt: Date,
  intervalHours: number
) => {
  const devInterval = 1000; //hours

  // Interval in hours to request data from psnApi;
  const pollingInterval = IS_NODE_ENV_PRODUCTION ? intervalHours : devInterval;
  const currentDate = new Date();
  const updatedAt = objUpdatedAt;

  // Check the "updatedAt" from UserGames schema to retrieve new data from psnApi after 2 hours
  const diffHours =
    Math.abs(currentDate.getTime() - updatedAt.getTime()) / 3600000;

  console.log(poll(`Current Date: ${currentDate.toUTCString()}`));
  console.log(poll(`Last Update: ${updatedAt.toUTCString()}`));
  console.log(
    poll(`Poll interval: ${_.round(diffHours, 2)}/${pollingInterval} Hs`)
  );

  return { diffHours, pollingInterval };
};
