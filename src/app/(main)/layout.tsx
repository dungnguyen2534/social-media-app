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

export interface UserInitialDisplayData {
  unreadNotificationCount: number;
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionData();

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
