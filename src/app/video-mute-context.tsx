"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface VideoMuteContextType {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

const VideoMuteContext = createContext<VideoMuteContextType | undefined>(
  undefined,
);

export function VideoMuteProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true); // Default: videos are muted

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return (
    <VideoMuteContext.Provider value={{ isMuted, setIsMuted, toggleMute }}>
      {children}
    </VideoMuteContext.Provider>
  );
}

export function useVideoMute() {
  const context = useContext(VideoMuteContext);
  if (!context) {
    throw new Error("useVideoMute must be used within VideoMuteProvider");
  }
  return context;
}
