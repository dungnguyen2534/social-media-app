import { Button } from "@/components/ui/button";
import { House } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-44 flex flex-col items-center space-y-1 overflow-y-hidden text-base">
      <h2 className="flex items-center gap-2 text-3xl font-medium [&>*]:inline-block">
        <span>404</span>
        <span className="bg-accent mt-1 h-8 w-0.5"></span>
        <span> Not found</span>
      </h2>
      <p>This user doesn&apos;t exist or may have changed their username</p>

      <Button asChild variant="custom" className="mt-2">
        <Link href="/">
          <House className="size-5" />
          Return Home
        </Link>
      </Button>
    </div>
  );
}
