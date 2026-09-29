import type { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../../models/userModel";
import { HydratedDocument, Model } from "mongoose";
import { signUpDto } from "./auth.validation.js";
import { dataBaseRepository } from "../../DB/repositories/base.repository.js";

class AuthServices {
  private readonly _userModel = new dataBaseRepository<IUser>(userModel);

  constructor() {} // its work when i create object

  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const {
      fName,
      lName,
      email,
      password,
      age,
      gender,
      phone,
      address,
    }: signUpDto = req.body;

    const createUser: HydratedDocument<IUser> = await this._userModel.create({
      fName,
      lName,
      email,
      password,
      age,
      gender,
      phone,
      address,
    } as Partial<IUser>);

    res.status(201).json({ message: "Success SignUp", createUser });
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    res.status(201).json({ message: "Success SignIn" });
  };
}

export default new AuthServices();
