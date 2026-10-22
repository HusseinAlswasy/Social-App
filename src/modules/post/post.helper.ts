import { Request } from "express";
import { PostAvailabilityEnum } from "../../common/enums/post_enum";
import { IRequest } from "../../common/types/request.type";

export const PostAvailability: any = (req: IRequest) => {
  return [
    { availability: PostAvailabilityEnum.public },
    {
      availability: PostAvailabilityEnum.private,
      createdBy: req?.user?._id!,
    },
    {
      availability: PostAvailabilityEnum.friends,
      createdBy: { $in: [...(req?.user?.friends || []), req?.user?._id] },
    },
    { tags: { $in: [req?.user?._id] } },
  ];
};
