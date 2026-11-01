import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { Gender_Enum, userType } from "./user.type";
import userServices from "../user.services.js";
import { GraphQLError } from "graphql";
import { Validation_gql } from "../../../common/middleware/validation.js";
import { signUpSchema } from "../user.validation.js";
let users = [
  { id: 1, name: "Hussein", age: 25 },
  { id: 2, name: "Ahmed", age: 27 },
];

export class UserFields {
  constructor() {}

  query = () => {
    return {
      //===========get user===============
      getUser: {
        type: userType,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: (parent: any, args: any, context: any) => {
          return userServices.getUser(context.req.raw.user);
        },
      },
      //===============get users===================
      getUsers: {
        type: new GraphQLList(userType),
        resolve: async (parent: any, args: any) => {
          return userServices.getUsers();
        },
      },
    };
  };
  mutation = () => {
    return {
      createUser: {
        type: userType,
        args: {
          fName: { type: new GraphQLNonNull(GraphQLString) },
          lName: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
          cPassword: { type: new GraphQLNonNull(GraphQLString) },
          age: { type: new GraphQLNonNull(GraphQLInt) },
          gender: { type: Gender_Enum },
        },
        resolve: async (parent: any, args: any) => {
          await Validation_gql(signUpSchema, args);

          return userServices.createUser(parent, args);
        },
      },
    };
  };
}
