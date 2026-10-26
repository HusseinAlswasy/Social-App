import z, { date } from "zod";
import { general_rules } from "../../common/utils/generalRules";
import { OnModelEnum } from "../../common/enums/post_enum.js";

export const commentSchema = {
  body: z
    .strictObject({
      content: z.string().min(2, "content Name is too short").optional(),
      attachments: z.array(general_rules.file).optional(),
      tags: z.array(general_rules.id).optional(), 
      onModel:z.enum(OnModelEnum)    
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

     params: z
    .strictObject({
      commentId: general_rules.id.optional(),
      postId: general_rules.id.optional()
    }),
};

export type createCommentDto = z.infer<typeof commentSchema.body>;


