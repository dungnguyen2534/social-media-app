"use client";

import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { onboardingSchema, OnboardingValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import LoadingButton from "@/components/LoadingButton";
import toast from "react-hot-toast";
import { completeOnboarding } from "@/app/actions";
import { isActionError } from "@/lib/action-error";

export default function OnboardingDialog() {
  const { data: session, status } = useSession();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", username: "" },
  });

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user) {
        form.reset({
          name: session.user.name || "",
          username: session.user.username || "",
        });
        setIsOpenDialog(!session.user.isOnboarded);
      }
    }
  }, [status, session, form]);

  const [isPending, startTransition] = useTransition();

  async function onSubmit(values: OnboardingValues) {
    startTransition(async () => {
      const result = await completeOnboarding(values);
      if (isActionError(result)) {
        toast.error(result.error, { duration: 5000 });
      } else {
        setIsOpenDialog(false);
        //TODO: data need to be in sync in all components
      }
    });
  }

  return (
    <Dialog onOpenChange={setIsOpenDialog} open={isOpenDialog} modal>
      <DialogContent className="w-[85%] sm:w-[23.75rem]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            Welcome to Socius!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please complete your profile setup.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What should people call you"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Create a unique username" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="mt-1 w-full"
              loading={isPending}
              disabled={isPending}
            >
              Finish and explore
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
