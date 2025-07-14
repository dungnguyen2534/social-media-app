"use client";

import { Input } from "@/components/ui/input";
import emailSignIn from "./actions";
import { useForm } from "react-hook-form";
import { emailSignInData, emailSignInSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [isPending, startTransition] = useTransition();
  const [isGoogleBtnLoading, setIsGoogleBtnLoading] = useState(false);

  const form = useForm<emailSignInData>({
    resolver: zodResolver(emailSignInSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(
    async (data) => {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("email", data.email);
        const result = await emailSignIn(formData);
        if (isActionError(result)) {
          toast.error(result.error);
        }
      });
    },
    () => toast.error("Invalid email adress"),
  );

  return (
    <div className="grid min-h-screen place-items-center">
      <Card className="flex h-[21.5rem] w-[85%] justify-center px-3 sm:w-[25rem]">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Sign in to Socius
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 [&>*]:w-full">
          <LoadingButton
            loading={isGoogleBtnLoading}
            onClick={() => {
              signIn("google");
              setIsGoogleBtnLoading(true);
            }}
          >
            <GoogleIcon />
            Sign in with Google
          </LoadingButton>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t"></div>
            <span className="text- mx-2 flex-shrink text-xs font-semibold">
              OR
            </span>
            <div className="flex-grow border-t"></div>
          </div>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-2 [&>*]:w-full">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sign in with Email</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Your email"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <LoadingButton loading={isPending}>
                Send a magic link
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      ></path>
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      ></path>
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      ></path>
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      ></path>
      <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
  );
}
