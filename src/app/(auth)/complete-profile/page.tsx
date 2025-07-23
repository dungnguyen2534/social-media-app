"use client";

import { useTransition } from "react";
import { completeProfile } from "./actions";
import { useAuth } from "../../auth-context";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";
import RHFForm from "@/components/form/RHFForm";
import RHFInput from "@/components/form/RHFInput";
import LoadingButton from "@/components/LoadingButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileData, userProfileSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {
  const form = useForm<userProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      username: "",
    },
  });

  const session = useAuth();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = async (data: userProfileData) => {
    startTransition(async () => {
      const result = await completeProfile(session!.user.id!, data);
      if (isActionError(result)) {
        toast(result.error);
      } else {
        router.replace("/");
      }
    });
  };

  return (
    <div className="grid min-h-screen min-w-screen">
      <div className="mx-auto mt-56 w-[85%] justify-center px-3 sm:w-[30rem]">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Socius!</h1>
          <p className="text-accent-foreground text-sm">
            Let&apos;s quickly set up your profile so you can start connecting.
          </p>
        </div>

        <RHFForm
          form={form}
          className="mt-5 space-y-3 [&>*]:w-full"
          onSubmit={onSubmit}
        >
          <RHFInput
            control={form.control}
            name="name"
            label="How should people call you"
            placeholder="e.g., John"
            disabled={isPending}
          />

          <RHFInput
            control={form.control}
            name="username"
            label="Create a username"
            placeholder="something_unique"
            disabled={isPending}
          />

          <LoadingButton loading={isPending}>Continue</LoadingButton>
        </RHFForm>
      </div>
    </div>
  );
}
