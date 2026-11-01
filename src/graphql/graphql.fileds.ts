import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { UserFields } from "../modules/users/gql/user.fields";
import { userType } from "../modules/users/gql/user.type.js";

let users = [
  { id: 1, name: "Hussein", age: 25 },
  { id: 2, name: "Ahmed", age: 27 },
  { id: 3, name: "Mo", age: 29 },
];
const user_Fields = new UserFields();

export const schema_gql = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "query",
    fields: {
      ...user_Fields.query(),
    },
  }),
});
