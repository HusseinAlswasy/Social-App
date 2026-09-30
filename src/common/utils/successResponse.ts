import { Response } from "express";

export const successResponse = ({
  res,
  message = "Done",
  data = undefined,
  status = 200,
}: {
  res: Response;
  message: string;
  data?: any;
  status?: number;
}) => {
  return res.status(status).json({ message, data });
};
