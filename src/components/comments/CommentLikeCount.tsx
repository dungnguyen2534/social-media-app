import { cn, formatNumber } from "@/lib/utils";
import { Heart } from "lucide-react";

interface CommentLikeCountProps {
  count: number;
  className?: string;
}

export default function CommentLikeCount({
  count,
  className,
}: CommentLikeCountProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "bg-card dark:bg-background/35 flex w-fit items-center justify-center gap-1 rounded-full px-1.5 text-xs shadow-sm outline-black/15 dark:outline-1",
        className,
      )}
    >
      <Heart className="size-3 fill-red-500 text-red-500" />
      {formatNumber(count)}
    </span>
  );
}
