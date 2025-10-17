import { getSessionData } from "@/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "../auth-context";
import MobileNavbar from "@/components/mobile-navbar/MobileNavbar";
import FeaturePanel from "@/components/sidebars/FeaturePanel";
import { Suspense } from "react";
import {
  TrendingTopics,
  TrendingTopicsSkeleton,
} from "@/components/sidebars/TrendingTopics";
import {
  WhoToFollow,
  WhoToFollowSkeleton,
} from "@/components/sidebars/WhoToFollow";
import { prisma } from "@/lib/prisma";

export interface UserInitialDisplayData {
  unreadNotificationCount: number;
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionData();
  if (session && !session.user.username) redirect("/complete-profile");

  let unreadNotificationCount = 0;
  if (session?.user.id) {
    unreadNotificationCount = await prisma.notification.count({
      where: {
        recipientId: session!.user.id,
        read: false,
      },
    });
  }

  // for more info later if needed
  const userInitialDisplayData: UserInitialDisplayData = {
    unreadNotificationCount,
  };

  return (
    <AuthProvider session={session}>
      <MobileNavbar userInitialDisplayData={userInitialDisplayData} />

      <main className="app-container app-grid mt-1 !px-0 lg:mt-2 lg:px-3">
        <aside className="app-sidebar">
          <FeaturePanel userInitialDisplayData={userInitialDisplayData} />
        </aside>

        {children}

        <aside className="app-sidebar">
          <Suspense fallback={<TrendingTopicsSkeleton count={5} />}>
            <TrendingTopics />
          </Suspense>
          <Suspense fallback={<WhoToFollowSkeleton count={5} />}>
            <WhoToFollow />
          </Suspense>
        </aside>
      </main>
    </AuthProvider>
  );
}
