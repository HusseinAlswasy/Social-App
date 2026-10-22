import z, { date } from "zod";
import { general_rules } from "../../common/utils/generalRules.js";
import {
  PostAction,
  PostAvailabilityEnum,
} from "../../common/enums/post_enum.js";

export const postSchema = {
  body: z
    .strictObject({
      content: z.string().min(2, "content Name is too short").optional(),
      attachments: z.array(general_rules.file).optional(),
      allowComment: z.union([z.boolean(), z.stringbool()]).optional(),
      availability: z
        .enum(PostAvailabilityEnum)
        .default(PostAvailabilityEnum.public)
        .optional(),
      tags: z.array(general_rules.id).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data.attachments?.length) {
        ctx.addIssue({
          path: ["content", "attachments"],
          code: "custom",
          message: "Either content or attachments must be provided 😒",
        });
      }
      if (data?.tags?.length) {
        const uniqueTags = new Set(data.tags);
        if (data.tags.length !== uniqueTags.size) {
          ctx.addIssue({
            path: ["tags"],
            code: "custom",
            message: "duplicate tags 😒",
          });
        }
      }
    }),
};

export type createPostDto = z.infer<typeof postSchema.body>;

const toArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (val === undefined ? undefined : Array.isArray(val) ? val : [val]),
    z.array(schema).optional(),
  );

export const updatePostSchema = {
  body: z
    .strictObject({
      content: z.string().min(2, "content is too short").optional(),
      attachments: z.array(general_rules.file).optional(),
      allowComment: z.union([z.boolean(), z.stringbool()]).optional(),
      availability: z.enum(PostAvailabilityEnum).optional(),
      tags: toArray(general_rules.id),
      removeTags: toArray(general_rules.id),
      removeFile: toArray(z.string()),
    })
    .superRefine((data, ctx) => {
      if (data.tags?.length) {
        const uniqueTags = new Set(data.tags);
        if (data.tags.length !== uniqueTags.size) {
          ctx.addIssue({
            path: ["tags"],
            code: "custom",
            message: "duplicate tags",
          });
        }
      }

      if (data.tags?.length && data.removeTags?.length) {
        const overlap = data.tags.filter((t) => data.removeTags!.includes(t));
        if (overlap.length) {
          ctx.addIssue({
            path: ["removeTags"],
            code: "custom",
            message: "a tag can not be added and removed at the same time",
          });
        }
      }

      if (!Object.values(data).some((v) => v !== undefined)) {
        ctx.addIssue({
          path: [],
          code: "custom",
          message: "at least one field is required to update",
        });
      }
    }),
};

export type updatePostDto = z.infer<typeof updatePostSchema.body>;

export const like_unLike_Schema = {
  params: z.strictObject({
    id: general_rules.id,
  }),
  query: z.strictObject({
    flag: z.enum([PostAction.like,PostAction.unLike]),
  }),
};

export type like_unLikeDto = z.infer<typeof like_unLike_Schema.params>;
export type like_unLike_query_Dto = z.infer<typeof like_unLike_Schema.query>;
