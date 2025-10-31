import { Metadata } from "next";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return (
    <div>
      <div className="bg-card mb-1 flex h-9.5 items-center justify-center p-1 shadow-sm lg:mb-2 lg:h-9 lg:rounded-md">
        <h1 className="font-medium">Notifications</h1>
      </div>
      <Notifications />
    </div>
  );
}
