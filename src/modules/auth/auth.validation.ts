import z, { date } from "zod";
import { GenderEnum, RoleEnum } from "../../common/enums/user.enum";

export const signUpSchema = {
  body: z
    .strictObject({
      fName: z.string().min(2, "First Name is too short"),
      lName: z.string().min(2, "Last Name is too short"),
      email: z.email(),
      password: z.string(),
      cPassword: z.string(),
      phone: z.string().optional(),
      address: z.string().optional(),
      age: z.number().min(20),
      gender: z.enum(GenderEnum).optional(),
      role: z.enum(RoleEnum).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.cPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Password Not Match Confirm Password.",
        });
      }
    }),
};

export type signUpDto = z.infer<typeof signUpSchema.body>;
