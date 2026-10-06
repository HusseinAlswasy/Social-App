import multer from "multer";
import { storeEnum, multerEnum } from "../enums/multer_enum";
import { tmpdir } from "node:os";

const multerCloud = ({
  store_type = storeEnum.memory,
  customTypes = multerEnum.image,
}: {
  store_type?: storeEnum;
  customTypes?: string[];
}) => {
  const storage =
    store_type == storeEnum.memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: tmpdir(),
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + "-" + file.fieldname);
          },
        });

  function fileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) {
    if (customTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
  const upload = multer({ storage, fileFilter });
  return upload
};

export default multerCloud;