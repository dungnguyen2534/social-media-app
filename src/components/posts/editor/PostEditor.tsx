"use client";

import "./style.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/UserAvatar";
import { submitPost } from "./actions";
import { useAuth } from "@/app/auth-context";
import { useState, useTransition } from "react";
import LoadingButton from "@/components/LoadingButton";
import toast from "react-hot-toast";

interface PostEditorProps {
  onPostCreated?: () => void;
}

export default function PostEditor({ onPostCreated }: PostEditorProps) {
  const session = useAuth();

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isPending, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What is happening?",
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

    startTransition(async () => {
      await submitPost(input);
      editor?.commands.clearContent();

      if (onPostCreated) {
        onPostCreated();
      }

      toast.success("Post created!", {
        duration: 3000,
        position: "bottom-center",
      }); // TODO: Add a link to the new post
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
          className="dark:bg-input/30 bg-background focus-within:ring-ring/50 max-h-[20rem] w-full overflow-y-auto rounded-md px-5 py-3 transition-all focus-within:ring-[3px]"
        />
      </div>
      <div className="flex justify-end">
        <LoadingButton
          onClick={onSubmit}
          loading={isPending}
          disabled={isEditorEmpty}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
