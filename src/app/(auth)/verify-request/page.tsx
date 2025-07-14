import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MailCheck } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Card className="h-[21.5rem] w-[85%] px-3 py-10 text-center sm:w-[25rem]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Check your Email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-1 grid place-items-center">
          <MailCheck size={150} />
        </CardContent>
      </Card>
    </div>
  );
}
