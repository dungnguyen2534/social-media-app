"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { PostData } from "@/lib/type";
import { useAuth } from "@/app/auth-context";
import { useEditPostMutation } from "./actions/edit-post/mutations";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LoadingButton from "../common/LoadingButton";
import UserAvatar from "../common/UserAvatar";
import toast from "react-hot-toast";
import { isActionError } from "@/lib/action-error";
import { ClipboardEvent, useEffect, useState } from "react";
import SharedPost from "./SharedPost";
import useMediaUpload from "./editor/useMediaUpload";
import AttachmentPreviews from "./editor/AttachmentPreviews";
import { cn, plainTextToHtml, remoteMediaToAttachments } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import AddAttachmentsButton from "./editor/AddAttachmentsButton";
import { useDropzone } from "@uploadthing/react";

interface EditPostDialogProps {
  post: PostData;
  isEditPostDialogOpen: boolean;
  setIsEditPostDialogOpen: (open: boolean) => void;
}

export default function EditPostDialog({
  post,
  isEditPostDialogOpen,
  setIsEditPostDialogOpen,
}: EditPostDialogProps) {
  const session = useAuth();
  const mutation = useEditPostMutation();

  const [editorInput, setEditorInput] = useState(post.content || "");
  const [isEditorEmpty, setIsEditorEmpty] = useState(
    post.content ? false : true,
  );

  const [isEditorDirty, setIsEditorDirty] = useState(false);
  const [isAttachmentsDirty, setIsAttachmentsDirty] = useState(false);

  const {
    attachments,
    startUpload,
    isUploading,
    uploadProgress,
    setAttachments,
    removeAttachment,
  } = useMediaUpload();

  const editor = useEditor({
    content: plainTextToHtml(editorInput),
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
      setEditorInput(
        editor.getText({
          blockSeparator: "\n",
        }),
      );
    },

    immediatelyRender: false,
    autofocus: true,
  });

  const onSubmit = async () => {
    mutation.mutate(
      {
        postId: post.id,
        data: {
          content: editorInput,
          mediaIds: !!attachments.length
            ? (attachments.map((a) => a.mediaId).filter(Boolean) as string[])
            : undefined,
          sharedPostId: post.sharedPost ? post.sharedPost.id : undefined,
        },
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

          setIsEditPostDialogOpen(false);
          setIsEditorDirty(false);
          setIsAttachmentsDirty(false);

          toast.success(
            <div className="flex items-center gap-1">Post edited</div>,
            {
              duration: 5000,
              position: "bottom-center",
            },
          );
        },
      },
    );
  };

  useEffect(() => {
    if (isAttachmentsDirty) return;
    setAttachments(post.attachments?.map(remoteMediaToAttachments) || []);
  }, [post.attachments, setAttachments, isAttachmentsDirty]);

  useEffect(() => {
    if (isEditPostDialogOpen && editor) editor.commands.focus("end");
  }, [editor, isEditPostDialogOpen]);

  useEffect(() => {
    if (editorInput.trim() !== (post.content || "").trim()) {
      setIsEditorDirty(true);
    } else {
      setIsEditorDirty(false);
    }
  }, [post.content, editorInput, isAttachmentsDirty]);

  // Uploadthing drag and drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (post.sharedPost) return;
      startUpload(files);
      setIsAttachmentsDirty(true);
    },
  });

  const rootProps = getRootProps();
  delete rootProps.onClick;

  // Copy/paste media
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (post.sharedPost) return;
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];

    startUpload(files);
  };

  return (
    <Dialog open={isEditPostDialogOpen} onOpenChange={setIsEditPostDialogOpen}>
      <DialogContent className="responsive-dialog">
        <DialogTitle className="-mb-1 text-lg font-semibold">
          Edit post
        </DialogTitle>
        <DialogDescription className="hidden" />
        <hr />

        <div className="flex justify-between gap-3">
          <UserAvatar
            avatarUrl={session?.user.image}
            className="hidden h-12 w-12 sm:block"
          />

          <div className="flex-1 space-y-3">
            <div {...rootProps} className="w-full">
              <EditorContent
                editor={editor}
                className={cn(
                  "bg-accent focus-within:ring-ring/50 white max-h-[20rem] w-full overflow-y-auto rounded-md px-5 py-3 text-base transition-all focus-within:ring-[3px]",
                  isDragActive && !post.sharedPost && "outline-dashed",
                )}
                onPaste={onPaste}
              />
              <input {...getInputProps()} />
            </div>

            {!!attachments.length && (
              <AttachmentPreviews
                attachments={attachments}
                removeAttachment={(id) => {
                  removeAttachment(id);
                  setIsAttachmentsDirty(true);
                }}
                isLoading={false}
              />
            )}

            {!!post.sharedPost && (
              <div>
                <SharedPost post={post.sharedPost} noMiniProfile />
              </div>
            )}

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
                  onFilesSelected={(file) => {
                    startUpload(file);
                    setIsAttachmentsDirty(true);
                  }}
                  disabled={
                    isUploading || attachments.length >= 5 || !!post.sharedPost
                  }
                />
                <LoadingButton
                  onClick={onSubmit}
                  loading={mutation.isPending}
                  disabled={
                    isUploading ||
                    (!isEditorDirty && !isAttachmentsDirty) ||
                    (attachments.length === 0 &&
                      !post.sharedPost &&
                      isEditorEmpty)
                  }
                  className="w-24"
                >
                  Submit
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
