import { auth, signIn } from "@/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session;

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
