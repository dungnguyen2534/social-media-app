"use client";

import "./style.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuth } from "@/app/auth-context";
import { ClipboardEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import LoadingButton from "@/components/common/LoadingButton";
import { useSubmitPostMutation } from "../actions/create-post/mutations";
import { isActionError } from "@/lib/action-error";
import Link from "next/link";
import { ArrowRight, Loader2, PencilLine } from "lucide-react";
import useMediaUpload from "./useMediaUpload";
import { Button } from "@/components/ui/button";
import { cn, remoteMediaToAttachments } from "@/lib/utils";
import { useDropzone } from "@uploadthing/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AttachmentPreviews from "./AttachmentPreviews";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/ky";
import { Media } from "@prisma/client";
import AddAttachmentsButton from "./AddAttachmentsButton";

interface Draft {
  content: string;
  mediaIds: string[];
  mediaExpiresAt?: number;
}

export default function PostEditor() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const session = useAuth();
  const userId = session?.user.id;

  const mutation = useSubmitPostMutation();
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isDraftMediaLoaded, setIsDraftMediaLoaded] = useState(false);

  const {
    attachments,
    startUpload,
    isUploading,
    uploadProgress,
    uploadCompleted,
    setAttachments,
    removeAttachment,
    reset: resetMediaUpload,
  } = useMediaUpload();

  const localDraftKey = `draft_${userId}`;

  const localDraft: Draft = (() => {
    if (typeof window === "undefined" || !userId) return {} as Draft;
    const storedDraft = localStorage.getItem(localDraftKey);

    if (!storedDraft) return {} as Draft;

    const draft: Draft = JSON.parse(storedDraft);
    const currentTime = Date.now();

    if (draft.mediaExpiresAt && draft.mediaExpiresAt < currentTime) {
      const expiredDraft = {
        content: draft.content,
        mediaIds: [],
        mediaExpiresAt: undefined,
      } as Draft;

      localStorage.setItem(localDraftKey, JSON.stringify(expiredDraft));
      toast("Draft media has expired  and was removed.", {
        duration: 10000,
      });

      return expiredDraft;
    }

    return draft;
  })();

  const localAttachmentIds = localDraft.mediaIds || [];

  const initialLocalAttachmentIdsRef = useRef(localAttachmentIds);
  const initialLocalAttachmentIds = initialLocalAttachmentIdsRef.current;

  const shouldFetchInitialDraftMedia = initialLocalAttachmentIds.length > 0;

  const editor = useEditor({
    content: localDraft.content || "",
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
    autofocus: true,
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
          setIsEditorOpen(false);
          resetMediaUpload(() => {
            localStorage.setItem(localDraftKey, JSON.stringify({}));
          });

          toast.success(
            <div className="flex items-center gap-1">
              Post created,{" "}
              <Link
                className="flex items-center gap-1 text-blue-400 hover:underline"
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
        },
      },
    );
  };

  // Draft
  const { data: remoteMedia, isLoading } = useQuery({
    queryKey: ["draft", userId],
    queryFn: () =>
      api.get(`media?ids=${localAttachmentIds.join(",")}`).json<Media[]>(),

    enabled: shouldFetchInitialDraftMedia && !!userId && !isDraftMediaLoaded,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (remoteMedia) setIsDraftMediaLoaded(true);

    const remoteData = remoteMedia?.map(remoteMediaToAttachments) || [];
    const remoteDataIds = new Set(remoteData.map((m) => m.mediaId));

    setAttachments((prevAttachments) => {
      const filteredLocalData = prevAttachments.filter(
        (a) => !a.mediaId || !remoteDataIds.has(a.mediaId),
      );

      const newAttachments = [...remoteData, ...filteredLocalData];

      if (
        newAttachments.length === prevAttachments.length &&
        newAttachments.every(
          (attachment, index) => attachment === prevAttachments[index],
        )
      ) {
        return prevAttachments;
      }

      return newAttachments;
    });
  }, [remoteMedia, setAttachments]);

  useEffect(() => {
    if (isEditorOpen && editor) editor.commands.focus("end");
    const saveDraft = () => {
      if (!editor || !userId) return;

      const mediaIds = attachments
        .filter((a) => !a.isUploading && a.mediaId)
        .map((a) => a.mediaId) as string[];

      const currentDraft: Draft = JSON.parse(
        localStorage.getItem(localDraftKey) || "{}",
      );

      const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

      const draft: Draft = {
        content: editor.getHTML(),
        mediaIds: mediaIds,
        mediaExpiresAt:
          mediaIds.length > 0
            ? currentDraft.mediaExpiresAt ||
              Date.now() + TWENTY_FOUR_HOURS_IN_MS
            : undefined,
      };
      localStorage.setItem(localDraftKey, JSON.stringify(draft));
    };

    if (uploadCompleted) saveDraft();
    return () => {
      if (isEditorOpen) saveDraft();
    };
  }, [
    attachments,
    uploadCompleted,
    isEditorOpen,
    editor,
    userId,
    localDraftKey,
  ]);

  // Uploadthing drag and drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const rootProps = getRootProps();
  delete rootProps.onClick;

  // Copy/paste media
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];

    startUpload(files);
  };

  return (
    <div className="lg:w-full">
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogTrigger asChild>
          <div className="w-full">
            <Button
              variant="custom"
              className="hidden h-12 w-full rounded-full !px-4 lg:flex"
            >
              <PencilLine className="mt-[0.15rem] size-4" />
              Create a post
            </Button>
            <Button className="lg:hidden" size="icon" variant="ghost">
              <PencilLine className="mt-[0.15rem] h-[1.1rem] w-[1.1rem]" />
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="responsive-dialog">
          <DialogTitle className="-mb-1 text-lg font-semibold">
            Create a post
          </DialogTitle>
          <DialogDescription className="hidden" />
          <hr />
          <div className="space-y-3 rounded-md" suppressHydrationWarning>
            <div className="flex gap-3">
              <UserAvatar
                avatarUrl={session?.user.image}
                className="hidden h-12 w-12 sm:inline"
              />
              <div {...rootProps} className="w-full">
                <EditorContent
                  editor={editor}
                  className={cn(
                    "bg-accent focus-within:ring-ring/50 white max-h-[20rem] w-full overflow-y-auto rounded-md px-5 py-3 text-base break-words break-all transition-all focus-within:ring-[3px]",
                    isDragActive && "outline-dashed",
                  )}
                  onPaste={onPaste}
                />
                <input {...getInputProps()} />
              </div>
            </div>
            <div>
              {!!attachments.length && (
                <AttachmentPreviews
                  isLoading={isLoading}
                  attachments={attachments}
                  removeAttachment={removeAttachment}
                />
              )}
            </div>
            <div
              className={
                "flex items-center justify-between gap-3 [&>*]:flex [&>*]:items-center [&>*]:gap-2"
              }
            >
              <div>
                {isUploading && (
                  <>
                    <Loader2 className="text-primary size-5 animate-spin" />
                    <span className="text-sm">{uploadProgress ?? 0}%</span>
                  </>
                )}
              </div>

              <div>
                <AddAttachmentsButton
                  onFilesSelected={startUpload}
                  disabled={isUploading || attachments.length >= 5}
                />
                <LoadingButton
                  onClick={onSubmit}
                  loading={mutation.isPending}
                  disabled={
                    (isEditorEmpty && attachments.length === 0) || isUploading
                  }
                  className="w-24"
                >
                  Post
                </LoadingButton>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
