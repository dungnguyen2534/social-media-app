import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { Media } from "@prisma/client";
import { Attachment } from "@/components/posts/editor/useMediaUpload";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date();

  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    } else {
      return formatDate(from, "MMM d, yyyy");
    }
  }
}

export const remoteMediaToAttachments = (media: Media): Attachment => {
  const mimeType = media.type.toLowerCase();
  const dummyFile = new File([], media.id, { type: mimeType });

  return {
    file: dummyFile,
    isUploading: false,
    mediaId: media.id,
    url: media.url,
  };
};
