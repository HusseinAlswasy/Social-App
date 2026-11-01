import { GraphQLError } from "graphql";
import { userRepository } from "../../models/repositories/user.repository";

let users = [
  { id: 1, name: "Hussein", age: 25 },
  { id: 2, name: "Ahmed", age: 27 },
];

class UserService {
  private readonly _userModel = new userRepository();

  constructor() {}

  getUser = (user:any) => {
    return user
  };

  getUsers = async() => {
    return await this._userModel.find({filter:{}});
  };

  createUser =async (parent: any, args: any) => {
    const { fName,lName,email,password, age, gender } = args;

    const userExist =await this._userModel.findOne({filter:{email}})
    if (userExist) {
      throw new GraphQLError("user already exist", {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const user = await this._userModel.create({ fName,lName,email,password, age, gender})
    return user
  };
}

export default new UserService();
