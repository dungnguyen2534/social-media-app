import { Skeleton } from "../ui/skeleton";

interface FeedSkeletonsProps {
  count: number;
}

export default function FeedSkeletons({ count }: FeedSkeletonsProps) {
  const heightClasses = [
    "h-32",
    "h-36",
    "h-40",
    "h-44",
    "h-48",
    "h-52",
    "h-56",
    "h-60",
    "h-64",
  ];

  const skeletonFixedStyles =
    "bg-card w-full [animation-duration:1s] rounded-md";

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => {
        const randomIndex = Math.floor(Math.random() * heightClasses.length);
        const randomHeightClass = heightClasses[randomIndex];
        return (
          <Skeleton
            key={index}
            className={`${skeletonFixedStyles} ${randomHeightClass}`}
            suppressHydrationWarning
          />
        );
      })}
    </div>
  );
}
