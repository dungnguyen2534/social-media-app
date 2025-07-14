import { z } from "zod";

const requiredString = z.string().trim().min(1, "This field is required");

export const emailSignInSchema = z.object({
  email: z.email(),
});

export type emailSignInData = z.infer<typeof emailSignInSchema>;

export const userProfileSchema = z.object({
  name: requiredString.max(50, "Name must be less than 50 characters"),
  username: requiredString
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - are allowed")
    .max(25, "Username must be less than 25 characters"),
});

export type userProfileData = z.infer<typeof userProfileSchema>;
