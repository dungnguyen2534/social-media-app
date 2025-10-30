"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SignOutDialog from "../common/SignOutDialog";
import { ThemeSwitcher } from "../ui/theme-switcher";
import { cn } from "@/lib/utils";

export default function HamburgerMenu() {
  const session = useAuth();
  const pathname = usePathname();

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild aria-label="Open menu">
          <Button variant="ghost" size="icon">
            <Menu className="mt-[0.15rem] size-5.5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-card [&>button:last-child]:top-5">
          <SheetHeader>
            <SheetTitle />
            <SheetDescription />
          </SheetHeader>

          <ThemeSwitcher className="text-muted-foreground absolute top-4 left-3" />

          <div className="space-y-1 [&>*]:cursor-pointer [&>*]:text-right">
            <Link
              href={`/users/${session?.user.username}`}
              className={cn(
                "hover:bg-accent block w-full p-4",
                pathname === `/users/${session?.user.username}` && "bg-accent",
              )}
            >
              Profile
            </Link>
            <Link
              href="/search"
              className={cn(
                "hover:bg-accent block w-full p-4",
                pathname === "/search" && "bg-accent",
              )}
            >
              Search
            </Link>
            <Link
              href="/bookmarks"
              className={cn(
                "hover:bg-accent block w-full p-4",
                pathname === "/bookmarks" && "bg-accent",
              )}
            >
              Bookmarks
            </Link>
            <hr />
            <button
              onClick={() => setIsSignOutDialogOpen(true)}
              className="hover:bg-accent block w-full p-4"
            >
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <SignOutDialog
        isSignOutDialogOpen={isSignOutDialogOpen}
        setIsSignOutDialogOpen={setIsSignOutDialogOpen}
      />
    </>
  );
}
