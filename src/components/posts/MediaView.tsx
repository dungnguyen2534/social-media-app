"use client";

import { Media } from "@prisma/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
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
  priority?: boolean;
}

export default function MediaView({
  attachments,
  className,
  priority,
}: MediaViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const { ref: containerRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const videoRefsMap = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Pause all videos except the one at targetIndex
  const updateVideoPlayback = useCallback(
    (targetIndex: number) => {
      videoRefsMap.current.forEach((videoElement, index) => {
        if (parseInt(index) === targetIndex && inView) {
          videoElement.play().catch(() => {
            // Video play might fail due to autoplay policies
          });
        } else {
          videoElement.pause();
        }
      });
    },
    [inView],
  );

  // Initialize carousel and setup event listeners
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    const currentIndex = api.selectedScrollSnap();
    setCurrent(currentIndex + 1);
    updateVideoPlayback(currentIndex);

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex + 1);
      updateVideoPlayback(selectedIndex);
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api, inView, updateVideoPlayback]);

  // Handle viewport visibility changes
  useEffect(() => {
    if (!api) return;

    const currentIndex = api.selectedScrollSnap();

    if (inView) {
      updateVideoPlayback(currentIndex);
    } else {
      // Pause all videos when out of view
      videoRefsMap.current.forEach((videoElement) => {
        videoElement.pause();
      });
    }
  }, [inView, api, updateVideoPlayback]);

  // Cleanup video refs when attachments change
  useEffect(() => {
    const videoMap = videoRefsMap.current;
    return () => {
      videoMap.clear();
    };
  }, [attachments.length]);

  const handleMetadataLoad = (videoRef: HTMLVideoElement) => {
    setIsVideoLoaded(true);

    // Remove event listener to prevent memory leaks
    videoRef.removeEventListener("loadedmetadata", () => {});
  };

  return (
    <div ref={containerRef}>
      <Carousel
        className={cn("relative overflow-hidden", className)}
        setApi={setApi}
        key={attachments.length}
      >
        <CarouselContent className="-ml-1 max-h-dvh">
          {attachments.map((a, i) => {
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
                    className="max-h-screen w-full object-contain"
                    priority={priority && i === 0}
                  />
                </CarouselItem>
              );
            }

            if (a.type === "VIDEO") {
              return (
                <CarouselItem
                  key={a.id}
                  className="flex items-center bg-black pl-1"
                >
                  <video
                    ref={(videoElement) => {
                      if (videoElement) {
                        videoRefsMap.current.set(i.toString(), videoElement);
                      }
                    }}
                    controls
                    className={cn("w-full", !isVideoLoaded && "aspect-video")}
                    loop
                    muted
                    playsInline
                    onLoadedMetadata={(e) =>
                      handleMetadataLoad(e.currentTarget)
                    }
                    preload="metadata"
                  >
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
