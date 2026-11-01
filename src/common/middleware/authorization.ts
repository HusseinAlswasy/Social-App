import AppError from "./globalErrorHandel.middleware";
import { userRepository } from "../../models/repositories/user.repository";
const userRepo = new userRepository();
import { RoleEnum } from "../enums/user.enum.js";

export const authorization = async (access_roles: string[], role: RoleEnum) => {
  if (!access_roles.includes(role)) {
    throw new AppError("You are not authorized to access this resource", 403);
  }
  return true;
};
