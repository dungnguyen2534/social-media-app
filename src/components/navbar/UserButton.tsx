"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/app/auth-context";
import Link from "next/link";
import { LogOutIcon, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import UserAvatar from "../common/UserAvatar";
import SignInDialog from "../common/SignInDialogTrigger";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import LoadingButton from "../common/LoadingButton";

export default function UserButton() {
  const session = useAuth();
  const queryClient = useQueryClient();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSignOutClicked, setIsSignOutClicked] = useState(false);

  return (
    <>
      <SignInDialog
        trigger={<UserAvatar avatarUrl={null} />}
        asChild={!!session}
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <UserAvatar avatarUrl={session?.user.image} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-36">
            <DropdownMenuItem asChild>
              <Link href={`/user/${session?.user.username}`}>
                <UserRound className="mt-[0.15rem] mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <ThemeChanger />
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => setIsSignOutDialogOpen(true)}>
              <LogOutIcon className="mt-[0.15rem] mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignInDialog>

      <Dialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <hr />
            <DialogDescription>
              Are you sure you want to sign out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <LoadingButton
              className="w-20"
              loading={isSignOutClicked}
              onClick={() => {
                setIsSignOutClicked(true);
                queryClient.clear();
                signOut();
              }}
            >
              Sign out
            </LoadingButton>
            <Button
              className="w-20"
              variant="outline"
              onClick={() => setIsSignOutDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ThemeChanger() {
  const { theme, setTheme } = useTheme();
  const themeIconStyle = "text-muted-foreground mr-4 size-4 mt-[0.15rem]";

  let themeIcon = <Monitor className={themeIconStyle} />;
  if (theme === "dark") themeIcon = <Moon className={themeIconStyle} />;
  if (theme === "light") themeIcon = <Sun className={themeIconStyle} />;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {themeIcon}
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className={theme === "light" ? "underline" : ""}
          >
            <Sun className={`${themeIconStyle} !mr-3`} />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "underline" : ""}
          >
            <Moon className={`${themeIconStyle} !mr-3`} />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className={theme === "system" ? "underline" : ""}
          >
            <Monitor className={`${themeIconStyle} !mr-3`} />
            System
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
