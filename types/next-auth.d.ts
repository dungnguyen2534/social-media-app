import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"];
  }

  // Add custom user fields here
  interface User {
    username: string | null | undefined;
  }
}
