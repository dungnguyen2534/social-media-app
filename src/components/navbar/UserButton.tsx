"use client";

import React from "react";
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
import SignInDialogTrigger from "../common/SignInDialogTrigger";
import { useQueryClient } from "@tanstack/react-query";

export default function UserButton() {
  const session = useAuth();
  const queryClient = useQueryClient();

  return session ? (
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
        <DropdownMenuItem
          onClick={() => {
            queryClient.clear();
            signOut();
          }}
        >
          <LogOutIcon className="mt-[0.15rem] mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <SignInDialogTrigger>
      <UserAvatar avatarUrl={null} />
    </SignInDialogTrigger>
  );
}

function ThemeChanger() {
  const { theme, setTheme } = useTheme();

  const themeIconClass = "text-muted-foreground mr-4 size-4 mt-[0.15rem]";
  let themeIcon = <Monitor className={themeIconClass} />;
  if (theme === "dark") themeIcon = <Moon className={themeIconClass} />;
  if (theme === "light") themeIcon = <Sun className={themeIconClass} />;

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
            <Sun className="mt-[0.15rem] size-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "underline" : ""}
          >
            <Moon className="mt-[0.15rem] size-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className={theme === "system" ? "underline" : ""}
          >
            <Monitor className="mt-[0.15rem] size-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
