"use client";

import { ThemeToggler } from "@/components/ThemeToggler";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function Home() {
  return (
    <>
      <ThemeToggler />
      <Button onClick={() => signOut()}>Sign out</Button>
    </>
  );
}
