import { z } from "zod";

const requiredString = z.string().trim().min(1, "This field is required");

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
