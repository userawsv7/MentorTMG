"use client";

import { useState, useEffect } from "react";
import { SPIRITUAL_ELEMENTS } from "@/lib/generalRules";

interface SpiritualRouterProps {
  isSearching: boolean;
  onComplete?: () => void;
}

export default function SpiritualRouter({ isSearching, onComplete }: SpiritualRouterProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isSearching) {
      setCurrentMessage("");
      if (onComplete) onComplete();
      return;
    }

    // Rotate through spiritual messages
    const interval = setInterval(() => {
      const nextIndex = (messageIndex + 1) % SPIRITUAL_ELEMENTS.length;
      setMessageIndex(nextIndex);
      setCurrentMessage(SPIRITUAL_ELEMENTS[nextIndex]);
    }, 2000);

    // Set initial message
    if (!currentMessage) {
      setCurrentMessage(SPIRITUAL_ELEMENTS[0]);
    }

    return () => clearInterval(interval);
  }, [isSearching, messageIndex, currentMessage, onComplete]);

  if (!isSearching || !currentMessage) return null;

  return (
    <div className="px-4 py-3 border-b border-base-700 bg-base-900/60">
      <div className="flex items-center justify-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <span className="text-amber-400">◉</span>
          </div>
          <span className="text-base-300 font-light italic transition-opacity duration-500">
            {currentMessage}
          </span>
          <div className="animate-pulse">
            <span className="text-amber-400">◉</span>
          </div>
        </div>
      </div>
    </div>
  );
}