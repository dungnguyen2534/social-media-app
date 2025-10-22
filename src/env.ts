import { createEnv } from "@t3-oss/env-nextjs";
import { requiredString } from "./lib/validation";

export const env = createEnv({
  server: {
    DATABASE_URL: requiredString,
    AUTH_SECRET: requiredString,
    AUTH_RESEND_KEY: requiredString,
    AUTH_GOOGLE_ID: requiredString,
    AUTH_GOOGLE_SECRET: requiredString,
    UPLOADTHING_TOKEN: requiredString,
    UPLOADTHING_APP_ID: requiredString,
    CRON_SECRET: requiredString,
    TENOR_API_KEY: requiredString,
    STREAM_SECRET: requiredString,
  },
  client: {
    NEXT_PUBLIC_API_URL: requiredString,
    NEXT_PUBLIC_STREAM_KEY: requiredString,
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
  },
});
