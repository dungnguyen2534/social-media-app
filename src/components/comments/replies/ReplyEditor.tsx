"use client";

import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useSubmitReplyMutation,
  useUpdatePostCommentCount,
} from "../actions/create-comments/mutations";
import { CommentData, PostData } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";
import LoadingButton from "../../common/LoadingButton";
import { SendHorizontal } from "lucide-react";
import { useCommentContext } from "../comment-context";
import { useAuth } from "@/app/auth-context";

interface ReplyEditorProps {
  post: PostData;
  parentCommentId: string;
  replyingToUser: CommentData["user"];
  onReplySuccess?: (result: CommentData) => void;
}

export default function ReplyEditor({
  post,
  parentCommentId,
  replyingToUser,
  onReplySuccess,
}: ReplyEditorProps) {
  const session = useAuth();

  const { setNewLocalReplies } = useCommentContext();
  const mutation = useSubmitReplyMutation(parentCommentId);
  const { incrementCommentCount } = useUpdatePostCommentCount();

  const isReplyToUserOwnComment =
    session?.user.username !== replyingToUser.username;

  const editor = useEditor({
    content: isReplyToUserOwnComment ? `@${replyingToUser.username}` : "",
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: isReplyToUserOwnComment
          ? `Reply to @${replyingToUser.username}`
          : "Reply to your own comment",
      }),
    ],

    onCreate: ({ editor }) => {
      editor.commands.focus("end");
    },

    immediatelyRender: false,
    autofocus: true,
  });

  const onSubmit = async () => {
    mutation.mutate(
      {
        post,
        data: {
          parentCommentId: parentCommentId,
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

          if (onReplySuccess) onReplySuccess(result);
          setNewLocalReplies((prev) => [...prev, result]);
          incrementCommentCount(post.id);

          editor?.commands.clearContent();
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-between gap-3">
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
