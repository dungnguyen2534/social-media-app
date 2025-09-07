"use client";

import "./style.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuth } from "@/app/auth-context";
import { useState } from "react";
import toast from "react-hot-toast";
import LoadingButton from "@/components/common/LoadingButton";
import { useSubmitPostMutation } from "../actions/create-post/mutations";
import { isActionError } from "@/lib/action-error";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PostEditorProps {
  onPostCreated?: () => void;
}

export default function PostEditor({ onPostCreated }: PostEditorProps) {
  const session = useAuth();
  const mutation = useSubmitPostMutation();
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    onUpdate: ({ editor }) => {
      setIsEditorEmpty(editor.isEmpty);
    },
    immediatelyRender: false,
  });

  const onSubmit = async () => {
    const input =
      editor?.getText({
        blockSeparator: "\n",
      }) || "";

    mutation.mutate(input, {
      onSuccess: (result) => {
        if (isActionError(result)) {
          toast.error(result.error, {
            duration: 3000,
            position: "bottom-center",
          });
          return;
        }

        editor?.commands.clearContent();
        toast.success(
          <div className="flex items-center gap-1">
            Post created,{" "}
            <Link
              className="flex items-center gap-1 py-4 pr-4 text-blue-400 hover:underline"
              href={`/posts/${result.id}`}
            >
              view <ArrowRight className="mt-[0.2rem] size-3" />
            </Link>
          </div>,
          {
            duration: 5000,
            position: "bottom-center",
          },
        );

        if (onPostCreated) onPostCreated();
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-md">
      <div className="flex gap-3">
        <UserAvatar
          avatarUrl={session?.user.image}
          className="hidden sm:inline"
        />
        <EditorContent
          editor={editor}
          className="bg-accent focus-within:ring-ring/50 max-h-[20rem] w-full overflow-y-auto rounded-md px-5 py-3 text-base transition-all focus-within:ring-[3px]"
        />
      </div>
      <div className="flex justify-end">
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={isEditorEmpty}
          className="w-24"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
