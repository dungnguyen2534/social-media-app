import React from "react";
import { Button } from "./ui/button";
import { signIn } from "@/auth";

export default function LoginButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <Button type="submit">Login with Google</Button>
    </form>
  );
}
