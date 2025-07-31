import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Link from "next/link";

interface SignInDialogTrigger {
  children: React.ReactNode;
}

export default function SignInDialogTrigger({ children }: SignInDialogTrigger) {
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            Sign in to continue and enjoy the full experience. We&apos;re happy
            to have you!
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
