"use client";

import "./style.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuth } from "@/app/auth-context";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import LoadingButton from "@/components/common/LoadingButton";
import { useSubmitPostMutation } from "../actions/create-post/mutations";
import { isActionError } from "@/lib/action-error";
import Link from "next/link";
import { ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PostEditorProps {
  onPostCreated?: () => void;
}

// TODO: drag and drop image/video
export default function PostEditor({ onPostCreated }: PostEditorProps) {
  const session = useAuth();
  const mutation = useSubmitPostMutation();
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const {
    attachments,
    startUpload,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUpload,
  } = useMediaUpload();

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

    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[], // shorthand to filter out null/undefined
      },
      {
        onSuccess: (result) => {
          if (isActionError(result)) {
            toast.error(result.error, {
              duration: 3000,
              position: "bottom-center",
            });
            return;
          }

          editor?.commands.clearContent();
          resetMediaUpload();

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
      },
    );
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
      <div>
        {!!attachments.length && (
          <AttachmentPreviews
            attachments={attachments}
            removeAttachment={removeAttachment}
          />
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="text-primary size-5 animate-spin" />
          </>
        )}

        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={(isEditorEmpty && attachments.length === 0) || isUploading}
          className="w-24"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-full"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="size-6" />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <Carousel className="relative overflow-hidden rounded-md">
      <CarouselContent className="-ml-0">
        {attachments.map((a) => (
          <AttachmentPreview
            key={a.file.name}
            attachment={a}
            onRemoveClick={() => removeAttachment(a.file.name)}
          />
        ))}
      </CarouselContent>
      {attachments.length > 1 && (
        <>
          <CarouselPrevious className="left-3" variant="outline" />
          <CarouselNext className="right-3" variant="outline" />
        </>
      )}
    </Carousel>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  if (file.type.startsWith("image")) {
    return (
      <CarouselItem className="bg-background flex items-center pl-0">
        <Image
          src={src}
          width={500}
          height={500}
          alt="Attachment"
          className={cn("w-full object-contain", isUploading && "opacity-50")}
        />
        {!isUploading && (
          <button
            onClick={onRemoveClick}
            className="transition-color absolute top-3 right-3 cursor-pointer rounded-full bg-white p-1.5 text-black"
          >
            <X className="size-5" />
          </button>
        )}
      </CarouselItem>
    );
  }

  if (file.type.startsWith("video")) {
    return (
      <CarouselItem className="pl-0">
        <video
          controls
          className={cn("aspect-video w-full", isUploading && "opacity-50")}
        >
          <source src={src} />
        </video>
        {!isUploading && (
          <button
            onClick={onRemoveClick}
            className="transition-color absolute top-3 right-3 cursor-pointer rounded-full bg-white/50 p-1.5 hover:bg-white"
          >
            <X className="size-5" />
          </button>
        )}
      </CarouselItem>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}
