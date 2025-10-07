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
import { ThemeChanger } from "./ThemeChanger";

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
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-card [&>button:last-child]:top-5">
          <SheetHeader>
            <SheetTitle />
            <SheetDescription />
          </SheetHeader>

          <ThemeChanger
            switchMode
            className="text-muted-foreground absolute top-3 left-3"
            iconStyle="size-4"
            variant={"secondary"}
          />

          <div className="space-y-1 [&>*]:cursor-pointer [&>*]:text-right">
            <Link
              href={`/users/${session?.user.username}`}
              className="hover:bg-accent block w-full p-4"
            >
              Profile
            </Link>
            <Link
              href="/bookmarks"
              className="hover:bg-accent block w-full p-4"
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
