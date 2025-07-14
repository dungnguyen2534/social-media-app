"use client";

import { useState } from "react";
import { completeProfile } from "../actions";
import { useAuth } from "../../auth-context";

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
      <button onClick={() => completeProfile(session!.user.id!, userData)}>
        Continue
      </button>
    </div>
  );
}
