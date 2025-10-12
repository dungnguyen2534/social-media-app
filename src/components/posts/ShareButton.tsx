"use client";

import "../posts/editor/style.css";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSubmitPostMutation } from "./actions/create-post/mutations";
import toast from "react-hot-toast";
import { isActionError } from "@/lib/action-error";
import LoadingButton from "../common/LoadingButton";
import UserAvatar from "../common/UserAvatar";
import { useAuth } from "@/app/auth-context";
import { useState } from "react";
import { SharedPostData } from "@/lib/type";
import SharedPost from "./SharedPost";

interface ShareButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  post: SharedPostData;
}

export default function ShareButton({ post, ...rest }: ShareButtonProps) {
  const session = useAuth();
  const mutation = useSubmitPostMutation();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const editor = useEditor({
    content: "",
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Say something about this...",
      }),
    ],

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
        sharedPostId: post.id,
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
          setIsShareDialogOpen(false);

          toast.success(
            <div className="flex items-center gap-1">Post shared</div>,
            {
              duration: 5000,
              position: "bottom-center",
            },
          );
        },
      },
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    setIsShareDialogOpen(false);
    toast("Post link copied to clipboard");
  };

  return (
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" title="Share" {...rest}>
          <Send className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="responsive-dialog">
        <DialogTitle className="-mb-1 text-lg font-semibold">Share</DialogTitle>
        <DialogDescription className="hidden" />
        <hr />

        <div className="flex justify-between gap-3">
          <UserAvatar
            avatarUrl={session?.user.image}
            className="hidden h-12 w-12 sm:block"
          />

          <div className="flex-1 space-y-3">
            <div>
              <EditorContent
                editor={editor}
                className="bg-accent focus-within:ring-ring/50 max-h-[20rem] w-full overflow-y-auto rounded-md px-5 py-3 text-base transition-all focus-within:ring-[3px]"
              />
            </div>

            <div>
              <SharedPost post={post} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={handleCopyLink}>
                Copy link
              </Button>
              <LoadingButton onClick={onSubmit} loading={mutation.isPending}>
                Share
              </LoadingButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
