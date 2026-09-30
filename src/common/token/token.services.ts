import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

class tokenService {
  constructor() {}
  GenerateToken = ({
    payload,
    secretKey,
    options = {},
  }: {
    payload: Object;
    secretKey: Secret;
    options: SignOptions;
  }): string => {
    return jwt.sign(payload, secretKey, options);
  };

  VerifyToken = ({
    token,
    secretKey,
  }: {
    token: string;
    secretKey: Secret;
  }): JwtPayload => {
    return jwt.verify(token, secretKey) as JwtPayload;
  };
}

export default new tokenService()
