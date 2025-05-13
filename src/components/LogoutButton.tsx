import { signOut } from "@/auth";
import { Button } from "./ui/button";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit">Log Out</Button>
    </form>
  );
}
