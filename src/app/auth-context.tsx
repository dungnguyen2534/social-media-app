"use client";

import { Session } from "next-auth";
import React, { createContext, useContext } from "react";

export const AuthContext = createContext<Session | null>(null);

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

/**
 * Returns the current session or null if unauthenticated.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  return useContext(AuthContext); // Not check context and throw error because context is the session itself
}
