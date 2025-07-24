"use client";

import { Session } from "next-auth";
import React, { createContext, useContext } from "react";

type AuthContextType = Session | null | undefined;

export const AuthContext = createContext<AuthContextType>(undefined);

export function AuthProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): Session | null {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
