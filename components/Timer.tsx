"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Timer as TimerIcon } from "lucide-react";
import ResetTimer from "@/icons/ResetTimer";

interface TimerProps {
  className?: string;
}

export default function Timer({ className }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setSeconds(0);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Auto-start timer when component mounts
  useEffect(() => {
    start();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle interval based on isRunning state
  useEffect(() => {
    if (isRunning) {
      // Clear any existing interval before creating a new one
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Set interval to increment seconds every second
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Stop the interval when isRunning is false
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handleResetClick = () => {
    // Reset seconds to 0
    setSeconds(0);
    // Ensure timer is running
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  return (
    <div
      className={`border-2 border-[#2F2C22] rounded-full px-4 py-2 flex items-center space-x-2 ${
        className || ""
      }`}
    >
      <button
        onClick={handleResetClick}
        className="cursor-pointer hover:opacity-70 transition-opacity"
        type="button"
      >
        <ResetTimer />
      </button>

      <span className="text-black font-medium text-sm">
        {formatTime(seconds)}
      </span>
      <span className="text-black">
        <TimerIcon color="#2F2C22" />
      </span>
    </div>
  );
}
