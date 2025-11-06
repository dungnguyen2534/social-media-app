import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username: string | null | undefined;
    } & DefaultSession["user"];
  }
}
