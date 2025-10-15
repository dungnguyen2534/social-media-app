"use client";

import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useState } from "react";
import UserAvatar from "../common/UserAvatar";
import { useAuth } from "@/app/auth-context";
import {
  useSubmitCommentMutation,
  useUpdatePostCommentCount,
} from "./actions/create-comments/mutations";
import { Gif, PostData } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";
import LoadingButton from "../common/LoadingButton";
import { SendHorizontal, X } from "lucide-react";
import GifButton from "./gifs/GifButton";
import Image from "next/image";

interface CommentEditorProps {
  post: PostData;
}

export default function CommentEditor({ post }: CommentEditorProps) {
  const session = useAuth();

  const mutation = useSubmitCommentMutation(post.id);
  const { incrementCommentCount } = useUpdatePostCommentCount();

  const [gif, setGif] = useState<Gif | undefined>(undefined);

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
          className={`relative mb-0.5 ml-5 sm:ml-20 h-[${gif.media_formats.webp.dims[1]}] w-52`}
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
      <div className="bg-card flex items-end justify-between gap-3 p-5">
        <UserAvatar
          avatarUrl={session?.user.image}
          className="hidden h-12 w-12 sm:block"
        />

        <div className="flex flex-1 flex-col gap-1">
          <div className="group relative flex w-full items-center">
            <EditorContent
              editor={editor}
              className={cn(
                "bg-accent white max-h-[20rem] w-full overflow-y-auto px-5 py-3 text-base transition-all",
                "rounded-tl-md rounded-bl-md",
              )}
              disabled={!session}
            />
            <GifButton
              onGifSelect={setGif}
              className={cn("h-12 rounded-none", "rounded-tr-md rounded-br-md")}
            />

            <div className="group-focus-within:ring-ring/50 pointer-events-none absolute inset-0 rounded-md transition-all group-focus-within:ring-[3px]"></div>
          </div>
        </div>

        <LoadingButton
          loading={mutation.isPending}
          onClick={onSubmit}
          className="h-12 w-20"
          disabled={!session}
        >
          <SendHorizontal className="size-5" />
        </LoadingButton>
      </div>
    </div>
  );
}
