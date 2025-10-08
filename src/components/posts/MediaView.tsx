import { Media } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaViewProps {
  attachments: Media[];
  className?: string;
}

export default function MediaView({ attachments, className }: MediaViewProps) {
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
      <Carousel
        className={cn("relative overflow-hidden", className)}
        setApi={setApi}
      >
        <CarouselContent className="-ml-1">
          {attachments.map((a) => {
            if (a.type === "IMAGE") {
              return (
                <CarouselItem
                  key={a.id}
                  className="bg-background flex items-center pl-1"
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
                <CarouselItem key={a.id} className="pl-1">
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
