"use client";

import { ThemeToggler } from "@/components/ThemeToggler";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Home() {
  return (
    <>
      <ThemeToggler />
      <Button onClick={() => toast("Test")}>Toast</Button>
    </>
  );
}
