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

export function formatRelativeDate(from: Date, shortForm?: boolean): string {
  const currentDate = new Date();
  const diffTime = currentDate.getTime() - from.getTime();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const tenSecondsInMs = 10 * 1000;

  if (diffTime < oneDayInMs) {
    if (diffTime < tenSecondsInMs) {
      return "Just now";
    }

    const relativeDateString = formatDistanceToNowStrict(from, {
      addSuffix: true,
    });

    if (shortForm) {
      const match = relativeDateString.match(
        /(\d+)\s(minute|hour|second)s?\sago/,
      );

      if (match) {
        const value = match[1];
        const unit = match[2];
        let shortUnit = "";

        if (unit.startsWith("minute")) {
          shortUnit = "m";
        } else if (unit.startsWith("hour")) {
          shortUnit = "h";
        } else if (unit.startsWith("second")) {
          shortUnit = "s";
        }

        if (shortUnit) {
          return `${value}${shortUnit}`;
        }
      }
    }

    return relativeDateString;
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    } else {
      return formatDate(from, "MMM d, yyyy");
    }
  }
}

export function remoteMediaToAttachments(media: Media): Attachment {
  const mimeType = media.type.toLowerCase();
  const dummyFile = new File([], media.id, { type: mimeType });

  return {
    file: dummyFile,
    isUploading: false,
    mediaId: media.id,
    url: media.url,
  };
}

export function plainTextToHtml(text: string): string {
  const htmlContent = `<p>${text.trim().replace(/\n/g, "</p><p>")}</p>`;
  return htmlContent;
}
