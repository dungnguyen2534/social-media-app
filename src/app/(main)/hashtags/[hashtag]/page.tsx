import HashTagFeed from "@/components/feeds/HashTagFeed";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ hashtag: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { hashtag } = await params;
  return {
    title: "#" + hashtag,
  };
}

export default async function MessagesPage({ params }: PageProps) {
  const { hashtag } = await params;

  return (
    <div>
      <div className="bg-card mb-1 flex h-9 items-center justify-center p-1 shadow-sm lg:mb-2 lg:rounded-md">
        <h1 className="font-medium">{"#" + hashtag}</h1>
      </div>
      <HashTagFeed hashtag={hashtag} />
    </div>
  );
}
