"use client";

import { useState } from "react";
import { completeProfile } from "../actions";
import { useAuth } from "../../auth-context";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";

export default function CompleteProfilePage() {
  const session = useAuth();

  const [userData, setUserData] = useState({
    name: session?.user.name ?? "",
    username: "",
  });

  // TODO: Use shadcn form

  return (
    <div className="space-y-1">
      <input
        type="text"
        defaultValue={userData.name}
        onChange={(e) =>
          setUserData((prev) => ({ ...prev, name: e.target.value }))
        }
      />

      <input
        type="text"
        onChange={(e) =>
          setUserData((prev) => ({ ...prev, username: e.target.value }))
        }
      />
      <button
        onClick={async () => {
          const result = await completeProfile(session!.user.id!, userData);
          if (isActionError(result)) {
            console.log(result.error);
            toast(result.error);
          }
        }}
      >
        Continue
      </button>
    </div>
  );
}
