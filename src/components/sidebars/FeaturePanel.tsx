"use client";

import { Bookmark, House, Mail } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FeaturePanel() {
  const pathname = usePathname();

  return (
    <div className="bg-card flex flex-col gap-1 overflow-hidden rounded-md p-2 shadow-sm">
      <Button
        variant={pathname === "/" ? "secondary" : "ghost"}
        className="h-14 w-full justify-start rounded-sm"
        asChild
      >
        <Link href="/">
          <House className="size-5" />
          Home
        </Link>
      </Button>
      <Button
        variant={pathname.startsWith("/bookmarks") ? "secondary" : "ghost"}
        className="h-14 w-full justify-start rounded-sm"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark className="size-5" />
          Bookmarks
        </Link>
      </Button>
      <Button variant="ghost" className="h-14 w-full justify-start rounded-sm">
        <Mail className="size-5" />
        Messages
      </Button>
    </div>
  );
}
