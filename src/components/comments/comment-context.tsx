"use client";

import { CommentData } from "@/lib/type";
import { createContext, useContext, useState } from "react";

interface CommentContextType {
  newReplies: CommentData[];
  setNewReplies: React.Dispatch<React.SetStateAction<CommentData[]>>;
}

const CommentContext = createContext<CommentContextType | null>(null);

export function CommentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newReplies, setNewReplies] = useState<CommentData[]>([]);

  return (
    <CommentContext.Provider value={{ newReplies, setNewReplies }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentContext() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error(
      "useCommentContext must be used within a CommentContextProvider",
    );
  }
  return context;
}
