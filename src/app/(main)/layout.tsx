import { getSessionData } from "@/auth";
import { AuthProvider } from "../auth-context";
import MobileNavbar from "@/components/mobile-navbar/MobileNavbar";
import FeaturePanel from "@/components/sidebars/FeaturePanel";
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
import { redirect } from "next/navigation";

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

  return (
    <AuthProvider session={session}>
      <StreamClientProvider>
        <MobileNavbar />
        <MainGrid>
          <aside className="app-sidebar">
            <FeaturePanel />
          </aside>

          <main>{children}</main>

          <aside className="app-sidebar">
            <DiscoveryPanel>
              <Suspense fallback={<TrendingTopicsSkeleton count={5} />}>
                <TrendingTopics />
              </Suspense>
              <Suspense fallback={<WhoToFollowSkeleton />}>
                <WhoToFollow />
              </Suspense>
            </DiscoveryPanel>
          </aside>
        </MainGrid>
      </StreamClientProvider>
    </AuthProvider>
  );
}
