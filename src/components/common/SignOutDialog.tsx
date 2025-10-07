"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import LoadingButton from "./LoadingButton";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

interface SignOutDialogProps {
  isSignOutDialogOpen: boolean;
  setIsSignOutDialogOpen: (open: boolean) => void;
}

export default function SignOutDialog({
  isSignOutDialogOpen,
  setIsSignOutDialogOpen,
}: SignOutDialogProps) {
  const queryClient = useQueryClient();
  const [isSignOutClicked, setIsSignOutClicked] = useState(false);

  return (
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
            className="sm:w-24"
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
            className="sm:w-24"
            variant="outline"
            onClick={() => setIsSignOutDialogOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
