"use client";

import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useState } from "react";
import { useAuth } from "@/app/auth-context";
import { CommentData, Gif } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";
import { SendHorizontal, X } from "lucide-react";
import Image from "next/image";
import { useEditReplyMutation } from "../actions/edit-comment/mutations";
import UserAvatar from "@/components/common/UserAvatar";
import GifButton from "../gifs/GifButton";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/common/LoadingButton";

interface ReplyEditorProps {
  parentCommentId: string;
  reply: CommentData;
  onOpenChange: (open: boolean) => void;
}

const convertGifDataFromServer = (
  source: CommentData["gif"] | null,
): Gif | undefined => {
  if (!source) return undefined;

  return {
    id: source.id,
    title: source.title ?? "",
    media_formats: {
      webp: {
        url: source.url,
        dims: [source.width, source.height],
      },
    },
  };
};

export default function ReplyEditor({
  parentCommentId,
  reply,
  onOpenChange,
}: ReplyEditorProps) {
  const session = useAuth();

  const mutation = useEditReplyMutation(parentCommentId, reply.id);

  const [gif, setGif] = useState<Gif | undefined>(
    convertGifDataFromServer(reply.gif),
  );

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const editor = useEditor({
    content: reply.content || "",
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: reply.content || "Edit your reply",
      }),
    ],

    onUpdate: ({ editor }) => {
      setIsEditorEmpty(editor.isEmpty);
    },

    onCreate: ({ editor }) => {
      editor.commands.focus("end");
    },

    immediatelyRender: false,
    autofocus: true,
  });

  const onSubmit = async () => {
    mutation.mutate(
      {
        commentId: reply.id,
        data: {
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

          setGif(undefined);
          onOpenChange(false);
          editor?.commands.clearContent();
        },
      },
    );
  };

  return (
    <div>
      <div className="bg-card py-3">
        <div className="flex w-full gap-3">
          <UserAvatar avatarUrl={session?.user.image} />

          <div className="mr-10 flex flex-1 flex-col gap-1">
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
                <div className="flex items-center">
                  <Button
                    variant="secondary"
                    className="hover:bg-input/50 text-muted-foreground shadow-none"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>

                  <hr className="w-5 rotate-90" />

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
        {gif && (
          <div
            className={`mt-2 mr-10 ml-12 h-[${gif.media_formats.webp.dims[1]}] w-[${gif.media_formats.webp.dims[0]}] `}
          >
            <div className="relative w-fit">
              <Image
                alt={gif.title || "GIF"}
                src={gif.media_formats.webp.url}
                width={gif.media_formats.webp.dims[0]}
                height={gif.media_formats.webp.dims[1]}
                key={gif.id}
                className="rounded-md"
              />

              <button
                onClick={() => setGif(undefined)}
                className="transition-color absolute top-2 right-2 cursor-pointer rounded-full bg-white p-1 text-black"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
