interface SidebarSkeletonWrapperProps extends React.PropsWithChildren {
  skeletonCount: number;
  title: string;
  listStyle?: string;
}

export default function SidebarSkeletonWrapper({
  children,
  skeletonCount,
  title,
  listStyle,
}: SidebarSkeletonWrapperProps) {
  return (
    <div className="bg-card overflow-hidden rounded-md p-2 shadow-sm">
      <div className="p-2 text-lg font-semibold">{title}</div>
      <hr className="my-1" />
      <div className={listStyle}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="w-full p-2">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
