"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useStreamClient } from "@/app/(main)/StreamClientProvider";
import { useAuth } from "@/app/auth-context";

interface MessageButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  className?: string;
  onMobileNav?: boolean;
}

export default function MessageButton({
  className,
  onMobileNav,
  ...rest
}: MessageButtonProps) {
  const session = useAuth();
  const client = useStreamClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    client
      .getUnreadCount(session?.user.id)
      .then((data) => setUnreadCount(data.total_unread_count));
  }, [client, session?.user.id]);

  client.on((event) => {
    if (event.total_unread_count !== undefined) {
      setUnreadCount(event.total_unread_count);
    }
  });

  return (
    <Button asChild size={onMobileNav ? "icon" : "default"} {...rest}>
      <Link href="/messages" className={className}>
        <div className="relative">
          <Mail className="size-5" />
          {unreadCount > 0 && (
            <span className="text-primary absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 text-xs font-medium tabular-nums"></span>
          )}
        </div>

        {!onMobileNav && (
          <div>
            Messages
            {unreadCount > 0 && ` (${unreadCount})`}
          </div>
        )}
      </Link>
    </Button>
  );
}
