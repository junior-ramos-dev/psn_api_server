import { Request, Response, NextFunction } from "express";
import fresh from "fresh";

// Helper function to get token value
export const getBearerTokenFromHeader = (authToken: any) => {
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
