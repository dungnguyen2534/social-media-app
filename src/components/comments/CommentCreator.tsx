"use client";

import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useState } from "react";
import UserAvatar from "../common/UserAvatar";
import { useAuth } from "@/app/auth-context";
import { useSubmitCommentMutation } from "./actions/create-comment/mutations";
import { Gif, PostData } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";
import LoadingButton from "../common/LoadingButton";
import { SendHorizontal, X } from "lucide-react";
import GifButton from "./gifs/GifButton";
import Image from "next/image";
import useUpdatePostCommentCount from "./hooks/useUpdatePostCommentCount";

interface CommentCreatorProps {
  post: PostData;
  autoFocus?: boolean;
}

export default function CommentCreator({
  post,
  autoFocus = true,
}: CommentCreatorProps) {
  const session = useAuth();

  const mutation = useSubmitCommentMutation(post.id);
  const { incrementCommentCount } = useUpdatePostCommentCount();

  const [gif, setGif] = useState<Gif | undefined>(undefined);

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

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

    onUpdate: ({ editor }) => {
      setIsEditorEmpty(editor.isEmpty);
    },

    immediatelyRender: false,
    autofocus: autoFocus,
  });

  const onSubmit = async () => {
    mutation.mutate(
      {
        post,
        data: {
          parentCommentId: null,
          gifDetails: gif
            ? {
                gifId: gif.id,
                width: gif.media_formats.webp.dims[0],
                height: gif.media_formats.webp.dims[1],
                url: gif.media_formats.webp.url,
              }
            : undefined,
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
          setGif(undefined);
          editor?.commands.clearContent();
        },
      },
    );
  };

  return (
    <div>
      {gif && (
        <div
          className={`relative -mb-2 ml-17 h-[${gif.media_formats.webp.dims[1]}] w-32`}
        >
          <Image
            alt={gif.title}
            src={gif.media_formats.webp.url}
            width={gif.media_formats.webp.dims[0]}
            height={gif.media_formats.webp.dims[1]}
            key={gif.id}
            className="h-full w-full rounded-md"
          />
          <button
            onClick={() => setGif(undefined)}
            className="transition-color absolute top-2 right-2 cursor-pointer rounded-full bg-white p-1 text-black"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="bg-card flex items-start justify-between gap-3 px-5 py-3">
        <UserAvatar avatarUrl={session?.user.image} />

        <div className="flex flex-1 flex-col gap-1">
          <div className="group bg-accent relative w-full items-center rounded-md">
            <EditorContent
              editor={editor}
              className={cn(
                "bg-accent white max-h-[20rem] w-full overflow-y-auto rounded-md px-5 pt-3 text-base transition-all",
              )}
              disabled={!session}
            />
            <div className="flex items-center justify-between p-1">
              <div>
                <GifButton
                  onGifSelect={setGif}
                  className="hover:bg-input/50 text-muted-foreground hover:text-primary shadow-none"
                />
              </div>
              <div>
                <LoadingButton
                  loading={mutation.isPending}
                  onClick={onSubmit}
                  size="icon"
                  variant="secondary"
                  className="hover:bg-input/50 shadow-none"
                  disabled={!session || (isEditorEmpty && !gif)}
                >
                  <SendHorizontal className="size-5" />
                </LoadingButton>
              </div>
            </div>

            <div className="group-focus-within:ring-ring/50 pointer-events-none absolute inset-0 rounded-md transition-all group-focus-within:ring-[3px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
