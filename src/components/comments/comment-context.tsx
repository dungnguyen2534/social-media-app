"use client";

import { CommentData } from "@/lib/type";
import { createContext, useContext, useState } from "react";

interface CommentContextType {
  newLocalReplies: CommentData[];
  setNewLocalReplies: React.Dispatch<React.SetStateAction<CommentData[]>>;
}

const CommentContext = createContext<CommentContextType | null>(null);

export function CommentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newLocalReplies, setNewLocalReplies] = useState<CommentData[]>([]);

  return (
    <CommentContext.Provider value={{ newLocalReplies, setNewLocalReplies }}>
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
