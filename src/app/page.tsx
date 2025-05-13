import { auth, signIn } from "@/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session;

  if (session && (!session.user?.username || !session.user?.name)) {
    redirect("/onboarding");
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          {session.user?.name}
          <LogoutButton />
        </div>
      ) : (
        <form
          action={async (formData) => {
            "use server";
            await signIn("nodemailer", formData);
          }}
        >
          <input type="text" name="email" placeholder="Email" />
          <button type="submit">Signin with Magic link</button>
        </form>
      )}
    </div>
  );
}
