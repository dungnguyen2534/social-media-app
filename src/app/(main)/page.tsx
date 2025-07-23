import { getSessionData, signOut } from "@/auth";
import { ThemeToggler } from "@/components/ThemeToggler";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getSessionData();

  return (
    <>
      <div className="space-y-2">
        <div>
          {session?.user.name} - {session?.user.username}
        </div>

        <ThemeToggler />
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button type="submit">Sign Out</Button>
        </form>
      </div>
    </>
  );
}
