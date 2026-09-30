import type { NextFunction, Request, Response } from "express";

class AppError extends Error {
  constructor(
    public message: any,
    public statusCode: number = 500,
  ) {
    super(message);
  }
}

export const GlobalErrorHandling = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message, stack: err.stack });
  }

export default AppError;
