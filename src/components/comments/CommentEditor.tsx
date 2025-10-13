"use client";

import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import UserAvatar from "../common/UserAvatar";
import { useAuth } from "@/app/auth-context";
import {
  useSubmitCommentMutation,
  useUpdatePostCommentCount,
} from "./actions/create-comments/mutations";
import { PostData } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";
import LoadingButton from "../common/LoadingButton";
import { SendHorizontal } from "lucide-react";

interface CommentEditorProps {
  post: PostData;
}

export default function CommentEditor({ post }: CommentEditorProps) {
  const session = useAuth();

  const mutation = useSubmitCommentMutation(post.id);
  const { incrementCommentCount } = useUpdatePostCommentCount();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Write a public comment...",
      }),
    ],

    immediatelyRender: false,
    autofocus: true,
  });

  const onSubmit = async () => {
    mutation.mutate(
      {
        post,
        data: {
          parentCommentId: null,
          content:
            editor?.getText({
              blockSeparator: "\n",
            }) || "",
        },
      },
      {
        onSuccess: (result) => {
          if (isActionError(result)) {
            toast.error(result.error, {
              duration: 3000,
            });
            return;
          }

          incrementCommentCount(post.id);
          editor?.commands.clearContent();
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <UserAvatar
        avatarUrl={session?.user.image}
        className="hidden h-12 w-12 sm:block"
      />
      <EditorContent
        editor={editor}
        className={cn(
          "bg-accent focus-within:ring-ring/50 white max-h-[20rem] w-full overflow-y-auto rounded-md px-5 py-3 text-base transition-all focus-within:ring-[3px]",
        )}
        disabled={!session}
      />

      <LoadingButton
        loading={mutation.isPending}
        onClick={onSubmit}
        className="h-12 w-20"
        disabled={!session}
      >
        <SendHorizontal className="size-5" />
      </LoadingButton>
    </div>
  );
}
