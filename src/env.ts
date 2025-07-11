import { z } from "zod";

const requiredString = () => z.string().nonempty();

const envSchema = z.object({
  DATABASE_URL: requiredString(),
  AUTH_SECRET: requiredString(),
  EMAIL_SERVER: requiredString(),
  EMAIL_FROM: requiredString(),
  AUTH_GOOGLE_ID: requiredString(),
  AUTH_GOOGLE_SECRET: requiredString(),
  AUTH_TRUST_HOST: requiredString().optional(),
});

export const env = envSchema.parse(process.env);
