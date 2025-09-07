"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useAuth } from "@/app/auth-context";

interface SignInDialog {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  asChild?: boolean;
}

export default function SignInDialog({
  children,
  trigger,
  asChild,
}: SignInDialog) {
  const session = useAuth();

  if (session) {
    return <>{children}</>;
  }

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer" asChild={asChild}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            Continue and enjoy the full experience.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild className="w-full">
            <Link href="/sign-in"> Go to sign in page</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
