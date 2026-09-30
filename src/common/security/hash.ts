import bcrypt from "bcrypt";

export const hash = async (plainText:string) => {
    return bcrypt.hash(plainText, 5);
}

export const compareHash = (plainText:string, hashValue:string) => {
  return bcrypt.compare(plainText, hashValue);
}