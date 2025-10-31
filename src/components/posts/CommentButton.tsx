"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";
import { PostData } from "@/lib/type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import Post from "./Post";
import Comments from "../comments/Comments";
import CommentCreator from "../comments/CommentCreator";
import { formatNumber } from "@/lib/utils";

interface LikeButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  post: PostData;
}

export default function CommentButton({ post, ...rest }: LikeButtonProps) {
  const [openCommentDialog, setOpenCommentDialog] = useState(false);

  return (
    <>
      <Button
        title="Comment"
        variant="ghost"
        onClick={() => setOpenCommentDialog(true)}
        className="gap-1"
        {...rest}
      >
        <MessageCircle className="size-5" />
        {post._count.comments > 0 && (
          <span className="font-medium tabular-nums">
            {formatNumber(post._count.comments)}
          </span>
        )}
        {post._count.comments > 1 ? " Comments" : " Comment"}
      </Button>

      <Dialog open={openCommentDialog} onOpenChange={setOpenCommentDialog}>
        <DialogContent className="responsive-dialog [&>button:last-child]:hover:bg-accent !overflow-y-scroll !p-0 lg:!h-[calc(100dvh-1rem)] [&>button:last-child]:top-2 [&>button:last-child]:right-2 [&>button:last-child]:flex [&>button:last-child]:aspect-square [&>button:last-child]:h-9 [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:rounded-full lg:[&>button:last-child]:top-[0.85rem] lg:[&>button:last-child]:right-4">
          <div className="relative space-y-3">
            <div className="p-0">
              <DialogTitle className="hidden" />
              <DialogDescription className="hidden" />
            </div>

            <Post
              post={post}
              className="my-0 !pt-1.5 !pb-0 shadow-none lg:!pt-3"
              noCommentButton
              postMoreButtonStyle="mr-12 lg:mr-10"
            />

            <div className="mb-0 px-2.5 lg:px-5">
              <Comments post={post} className="mt-3" />
            </div>
          </div>
          <div className="sticky bottom-0 left-0 mt-auto h-fit">
            <CommentCreator post={post} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
