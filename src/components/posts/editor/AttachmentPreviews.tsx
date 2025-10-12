"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Attachment } from "./useMediaUpload";
import { useEffect, useState } from "react";

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (identifier: string) => void;
  isLoading: boolean;
}

export default function AttachmentPreviews({
  attachments,
  removeAttachment,
  isLoading,
}: AttachmentPreviewsProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const count = attachments.length;

  return (
    <div>
      <Carousel className="overflow-hidden rounded-md" setApi={setApi}>
        <CarouselContent className="-ml-1 max-h-dvh">
          {isLoading ? (
            <div className="bg-background flex aspect-square w-full items-center justify-center">
              <div className="text-muted-foreground text-center">
                <Loader2 className="mx-auto mb-2 size-8 animate-spin" />
              </div>
            </div>
          ) : (
            attachments.map((a) => (
              <AttachmentPreview
                key={a.file.name}
                attachment={a}
                onRemoveClick={() => removeAttachment(a.file.name)}
              />
            ))
          )}
        </CarouselContent>
        {!!attachments.length && !isLoading && (
          <>
            <CarouselPrevious
              className="left-3 opacity-0 md:opacity-100"
              variant="outline"
            />
            <CarouselNext
              className="right-3 opacity-0 md:opacity-100"
              variant="outline"
            />
          </>
        )}
      </Carousel>
      {attachments.length > 1 && (
        <div className="mt-3 flex w-full items-center justify-center space-x-2">
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

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment,
  onRemoveClick,
}: AttachmentPreviewProps) {
  const { file, isUploading, url } = attachment;
  const src = url || URL.createObjectURL(file);

  const isImage = file.type.startsWith("image");
  const isVideo = file.type.startsWith("video");

  if (isImage) {
    return (
      <CarouselItem className="bg-background relative flex items-center pl-1">
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
            className="transition-color absolute top-3 right-3 cursor-pointer rounded-full bg-white p-1 text-black"
          >
            <X className="size-4" />
          </button>
        )}
      </CarouselItem>
    );
  }

  if (isVideo) {
    return (
      <CarouselItem className="bg-background relative flex items-center pl-1">
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
