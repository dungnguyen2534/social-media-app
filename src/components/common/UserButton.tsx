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
  iconStyle?: string;
}

export default function UserButton({ className, iconStyle }: UserButtonProps) {
  const session = useAuth();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger>
          <UserAvatar
            avatarUrl={session?.user.image}
            className={className}
            iconStyle={iconStyle}
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
          <DropdownMenuItem
            onClick={() => {
              setIsSignOutDialogOpen(true);

              // To prevent a bug where the dropdown modal remains open even when the sign out dialog is closed
              setIsDropdownOpen(false);
            }}
          >
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
