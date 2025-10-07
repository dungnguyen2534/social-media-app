"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/app/auth-context";
import Link from "next/link";
import { LogOutIcon, UserRound } from "lucide-react";
import UserAvatar from "./UserAvatar";
import SignOutDialog from "./SignOutDialog";

interface UserButtonProps {
  className?: string;
  iconSize?: string;
}

export default function UserButton({ className, iconSize }: UserButtonProps) {
  const session = useAuth();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar
            avatarUrl={session?.user.image}
            className={className}
            iconSize={iconSize}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-36">
          <DropdownMenuItem asChild>
            <Link href={`/users/${session?.user.username}`}>
              <UserRound className="mt-[0.15rem] mr-2 size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsSignOutDialogOpen(true)}>
            <LogOutIcon className="mt-[0.15rem] mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog
        isSignOutDialogOpen={isSignOutDialogOpen}
        setIsSignOutDialogOpen={setIsSignOutDialogOpen}
      />
    </>
  );
}
