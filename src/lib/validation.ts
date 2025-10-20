import { z } from "zod";

export const requiredString = z
  .string()
  .trim()
  .min(1, "This field is required");

// Sign in validation
export const emailSignInSchema = z.object({
  email: z.email(),
});

export type emailSignInData = z.infer<typeof emailSignInSchema>;

// Update user profile validation
export const userProfileSchema = z.object({
  name: requiredString
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  username: requiredString
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - are allowed")
    .min(3, "Username must be at least 3 characters")
    .max(25, "Username must be less than 25 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
});

export type userProfileData = z.infer<typeof userProfileSchema>;

// Create post validation
export const createPostSchema = z
  .object({
    content: z.string().optional(),
    mediaIds: z
      .array(z.string())
      .max(5, "Cannot have more than 5 attachments")
      .optional(),

    sharedPostId: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasMedia = data.mediaIds && data.mediaIds.length > 0;
      const hasSharedPost = !!data.sharedPostId;

      return !(hasMedia && hasSharedPost);
    },
    {
      message:
        "A post cannot contain both media attachments and a shared post ID.",
      path: ["sharedPostId"],
    },
  )
  .refine(
    (data) => {
      const hasContent = !!data.content;
      const hasMedia = data.mediaIds && data.mediaIds.length > 0;
      const hasSharedPost = !!data.sharedPostId;

      return hasContent || hasMedia || hasSharedPost;
    },
    {
      message:
        "A post must have either content, at least one attachment, or a shared post ID.",
      path: ["content"],
    },
  );

export type createPostData = z.infer<typeof createPostSchema>;

// Create comment validation
export const gifDetailsSchema = z.object({
  gifId: requiredString,
  url: requiredString,
  title: z.string().optional(),
  width: z.number().int().positive("Width must be a positive integer."),
  height: z.number().int().positive("Height must be a positive integer."),
});

export type gifDetails = z.infer<typeof gifDetailsSchema>;

export const createCommentSchema = z
  .object({
    parentCommentId: z.string().optional().nullable(),
    replyingToId: z.string().optional().nullable(),
    content: z
      .string()
      .max(2200, "Comment must be less than 2200 characters (Instagram limit)")
      .optional(),
    gifDetails: gifDetailsSchema.optional(),
  })
  .refine(
    (data) => {
      const hasContent = !!data.content && data.content.trim().length > 0;
      const hasGif = !!data.gifDetails;
      return hasContent || hasGif;
    },
    {
      message: "A comment must contain either text content, a GIF, or both.",
      path: ["content", "gifDetails"],
    },
  );

export type createCommentData = z.infer<typeof createCommentSchema>;
