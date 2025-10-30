import { getSessionData } from "@/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "../auth-context";
import MobileNavbar from "@/components/mobile-navbar/MobileNavbar";
import FeaturePanel from "@/components/sidebars/FeaturePanel";
import { prisma } from "@/lib/prisma";
import { DiscoveryPanel } from "@/components/sidebars/DiscoveryPanel";
import { Suspense } from "react";
import {
  TrendingTopics,
  TrendingTopicsSkeleton,
} from "@/components/sidebars/TrendingTopics";
import {
  WhoToFollow,
  WhoToFollowSkeleton,
} from "@/components/sidebars/WhoToFollow";
import MainGrid from "./MainGrid";
import { StreamClientProvider } from "./StreamClientProvider";
import { headers } from "next/headers";

export interface UserInitialDisplayData {
  unreadNotificationCount: number;
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  // If user hasn't set their username on complete-profile page
  const session = await getSessionData();
  if (session && !session.user.username) redirect("/complete-profile");

  // Auth required path
  const pathsToRedirect = [
    "/messages",
    "/notifications",
    "/search",
    "/bookmarks",
  ];

  if (pathname && !session && pathsToRedirect.includes(pathname)) redirect("/");

  // Initial unread notificaiton count data
  let unreadNotificationCount = 0;
  if (session?.user.id) {
    unreadNotificationCount = await prisma.notification.count({
      where: {
        recipientId: session!.user.id,
        read: false,
      },
    });
  }

  const userInitialDisplayData: UserInitialDisplayData = {
    unreadNotificationCount,
  };

  return (
    <AuthProvider session={session}>
      <StreamClientProvider>
        <MobileNavbar userInitialDisplayData={userInitialDisplayData} />
        <MainGrid>
          <aside className="app-sidebar">
            <FeaturePanel userInitialDisplayData={userInitialDisplayData} />
          </aside>

          <main>{children}</main>

          <aside className="app-sidebar">
            <DiscoveryPanel>
              <Suspense fallback={<TrendingTopicsSkeleton count={5} />}>
                <TrendingTopics />
              </Suspense>
              <Suspense fallback={<WhoToFollowSkeleton count={5} />}>
                <WhoToFollow />
              </Suspense>
            </DiscoveryPanel>
          </aside>
        </MainGrid>
      </StreamClientProvider>
    </AuthProvider>
  );
}
