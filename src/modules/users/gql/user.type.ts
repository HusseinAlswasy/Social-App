import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { GenderEnum } from "../../../common/enums/user.enum.js";

export const Gender_Enum = new GraphQLEnumType({
  name: "gender",
  values: {
    female: { value: GenderEnum.female },
    male: { value: GenderEnum.male },
  },
});

export const userType = new GraphQLObjectType({
  name: "getUser",
  fields: {
    id: {
      type: GraphQLID,
      resolve: (parent: any) => parent._id?.toString() ?? parent.id,
    },
    name: {
      type: GraphQLString,
      resolve: (parent: any) =>
        parent.name ?? `${parent.fName ?? ""} ${parent.lName ?? ""}`.trim(),
    },
    fName: { type: GraphQLString },
    lName: { type: GraphQLString },
    gender: { type: Gender_Enum },
    age: { type: GraphQLInt },
  },
});
