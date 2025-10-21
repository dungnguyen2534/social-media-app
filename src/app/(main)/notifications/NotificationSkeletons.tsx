import { Skeleton } from "@/components/ui/skeleton";

interface NotificationSkeletonsProps {
  count: number;
}

export default function NotificationSkeletons({
  count,
}: NotificationSkeletonsProps) {
  const skeletonFixedStyles =
    "bg-card w-full [animation-duration:1s] h-[5.5rem]";

  return (
    <div className="space-y-1 lg:space-y-2">
      {Array.from({ length: count }).map((_, index) => {
        return (
          <Skeleton
            key={index}
            className={`${skeletonFixedStyles} lg:rounded-md`}
            suppressHydrationWarning
          />
        );
      })}
    </div>
  );
}
