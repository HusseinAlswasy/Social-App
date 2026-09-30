import type { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../../models/userModel";
import { HydratedDocument, Model } from "mongoose";
import { signUpDto } from "./auth.validation";
import { userRepository } from "../../DB/repositories/user.repository";
import AppError from "../../common/middleware/globalErrorHandel.middleware.js";
import { hash } from "../../common/security/hash.js";
import { Encrypt } from "../../common/security/encrypt.js";
import { eventEmitter } from "../../events/sendEmailEvent.js";
import { EventEnum } from "../../common/enums/event_enum.js";
import sendEmail, { otp } from "../../common/service/send_email.js";
import { emailTemplate } from "../../common/utils/email.template.js";
import { successResponse } from "../../common/utils/successResponse.js";
import { RedisService } from "../../common/service/redis.service.js";
import redisServices from "../../common/service/redis.service";
class AuthServices {
  private readonly _userModel = new userRepository();

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

    const emailExist = await this._userModel.findOne({ filter: { email } });
    if (emailExist) {
      throw new AppError("Email already Exist", 409);
    }

    const otpCode = await otp();
    const otpHashed = await hash(otpCode.toString());

    await redisServices.setValue({
      key: `otp:${email}`,
      value: otpHashed,
      ttl: 60, // 1 minutes
    });

    await redisServices.setValue({
      key: await redisServices.max_otp_key(email),
      value: 1,
      ttl: 60 * 6, // 1 minutes
    });

    const createUser: HydratedDocument<IUser> = await this._userModel.create({
      fName,
      lName,
      email,
      password: await hash(password),
      age,
      gender,
      phone: phone ? Encrypt(phone) : null,
      address,
    } as Partial<IUser>);

    eventEmitter.emit(EventEnum.confirmEmail, async () => {
      const emailSent = await sendEmail({
        to: email,
        subject: "Email Verification",
        html: emailTemplate({
          fName,
          email,
          otp: otpCode,
        }),
      });
      if (!emailSent) {
        throw new Error("Failed to send verification email", { cause: 500 });
      }

      successResponse({
        res,
        status: 201,
        data: createUser,
        message: "SignUp Successfuly",
      });
    });
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    successResponse({
      res,
      status: 201,
      // data: ,
      message: "SignIn Successfuly",
    });
  };
}

export default new AuthServices();
