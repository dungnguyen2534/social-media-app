import { Skeleton } from "../ui/skeleton";

interface CommentSkeletonsProps {
  count: number;
}

export default function CommentSkeletons({ count }: CommentSkeletonsProps) {
  const widthClasses = [
    "w-16",
    "w-20",
    "w-24",
    "w-28",
    "w-32",
    "w-36",
    "w-40",
    "w-44",
    "w-48",
  ];

  const skeletonFixedStyles =
    "bg-accent h-[3.75rem] [animation-duration:1s] rounded-md shadow-sm";

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => {
        const randomIndex = Math.floor(Math.random() * widthClasses.length);
        const randomWidthClass = widthClasses[randomIndex];
        return (
          <div key={index} className="mt-3 flex gap-3">
            <Skeleton className={`aspect-square h-9 rounded-full`} />
            <Skeleton
              className={`${skeletonFixedStyles} ${randomWidthClass}`}
              suppressHydrationWarning
            />
          </div>
        );
      })}
    </div>
  );
}
