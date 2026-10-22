import z from "zod";
import { Types } from "mongoose";

export const general_rules = {
  id: z.string().refine((val) => {
    return Types.ObjectId.isValid(val) ? true : false;
  }),
  email: z.string().email(),
  password: z.string().regex(/^[A-Z]?[a-zA-Z0-9]{8}$/),

  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number(),
    buffer: z.instanceof(Buffer),
  }),
};

// export const deleteUploadedFiles = async (files) => {
//     if (!files) return

//     for (const filed of Object.values(files)) {
//         for (const file of filed) {
//             try {
//                 await fs.unlink(file.path)
//             } catch (error) {
//                 console.log("Error deleting", error.messages);
//             }
//         }
//     }
// }
