import mongoose, { Types } from "mongoose";
import { GenderEnum, RoleEnum } from "../common/enums/user.enum";

export interface IUser {
  _id: Types.ObjectId;
  fName: string;
  lName: string;
  email: string;
  password: string;
  age: number;
  phone?: string;
  address?: string;
  gender?: GenderEnum;
  role?: RoleEnum;
  confirmed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fName: { type: String, required: true, trim: true, minLength: 2 },
    lName: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    address: { type: String, trim: true },
    phone: { type: String, required: true, trim: true, minLength: 2 },
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    confirmed: { type: Boolean },
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.models.User || mongoose.model<IUser>("User",userSchema)

export default userModel