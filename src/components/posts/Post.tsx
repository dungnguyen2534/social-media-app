"use client";

import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PostData } from "@/lib/type";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";
import { Media } from "@prisma/client";
import Image from "next/image";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { useEffect, useState } from "react";

interface PostProps {
  post: PostData;
  className?: string;
}

export default function Post({ post, className }: PostProps) {
  return (
    <article
      className={cn(
        "round bg-card space-y-3 rounded-md p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center">
        <MiniProfile user={post.user}>
          <Link
            className="group flex flex-wrap items-center gap-2"
            href={`/users/${post.user.username}`}
          >
            <div>
              <UserAvatar avatarUrl={post.user.image} />
            </div>
            <div className="h-9">
              <div className="flex gap-1">
                <div className="block font-medium underline-offset-2 group-hover:underline">
                  {post.user.name}
                </div>
                <div className="text-muted-foreground">
                  @{post.user.username}
                </div>
              </div>

              <time
                dateTime={post.createdAt.toDateString()}
                className="text-muted-foreground block text-xs"
              >
                {formatRelativeDate(post.createdAt)}
              </time>
            </div>
          </Link>
        </MiniProfile>

        <PostMoreButton post={post} className="-mt-5 ml-auto" />
      </div>
      <Linkify>
        <div className="text-base break-words whitespace-pre-line">
          {post.content}
        </div>
      </Linkify>
      {!!post.attachments.length && (
        <MediaView attachments={post.attachments} />
      )}
    </article>
  );
}

interface MediaViewProps {
  attachments: Media[];
}

function MediaView({ attachments }: MediaViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div>
      <Carousel className="relative overflow-hidden rounded-md" setApi={setApi}>
        <CarouselContent className="-ml-0">
          {attachments.map((a) => {
            if (a.type === "IMAGE") {
              return (
                <CarouselItem
                  key={a.id}
                  className="bg-background flex items-center pl-0"
                >
                  <Image
                    src={a.url}
                    width={500}
                    height={500}
                    alt="Attachment"
                    className="w-full object-contain"
                  />
                </CarouselItem>
              );
            }

            if (a.type === "VIDEO") {
              return (
                <CarouselItem key={a.id} className="pl-0">
                  <video controls className="aspect-video w-full">
                    <source src={a.url} />
                  </video>
                </CarouselItem>
              );
            }

            return (
              <p key={a.id} className="text-destructive">
                Unsupported media type
              </p>
            );
          })}
        </CarouselContent>
        {attachments.length > 1 && (
          <>
            <CarouselPrevious className="left-3" variant="outline" />
            <CarouselNext className="right-3" variant="outline" />
          </>
        )}
      </Carousel>
      {attachments.length > 1 && (
        <div className="flex w-full items-center justify-center space-x-2 py-2">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                index + 1 === current ? "bg-primary" : "bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
