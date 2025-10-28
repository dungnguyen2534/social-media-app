"use client";

import React from "react";
import { Button } from "../ui/button";
import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";

interface DirectMessageButton {
  className?: string;
  userId: string;
}

export default function DirectMessageButton({
  className,
  userId,
}: DirectMessageButton) {
  const session = useAuth();

  const router = useRouter();

  const signedInUserId = session?.user.id;
  if (!signedInUserId) return null;

  return (
    <Button
      variant="custom"
      onClick={() => router.push(`/messages?userId=${userId}`)}
      className={className}
    >
      Message
    </Button>
  );
}
