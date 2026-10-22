import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import AppError from "./globalErrorHandel.middleware";

type reqType = keyof Request; // properties in express request

type schemaType = Partial<Record<reqType, ZodType>>;

export const Validation = (schema: schemaType) => {
  // it is take schema
  return async (req: Request, res: Response, next: NextFunction) => {
    // return middleware
    const errorResults = [];
    for (const key of Object.keys(schema) as reqType[]) {
      if (!schema[key]) continue;
      if (req?.file) {
        req.body.attachment = req.file;
      }

      if (req?.files?.length) {
        req.body.attachments = req.files;
      }
      const result = await schema[key].safeParseAsync(req[key]);

      if (!result.success) {
        errorResults.push(result.error.message);
      } else {
        Object.assign(req[key] as object, result.data);
      }
    }
    if (errorResults?.length) {
      throw new AppError(JSON.parse(errorResults as any));
    }
    next();
  };
};
