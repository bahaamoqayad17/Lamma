"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getMafiaSession } from "@/actions/mafia-actions";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import type { MafiaSessionType } from "@/models/MafiaSession";

interface UseMafiaGameOptions {
  gameId: string;
}

export function useMafiaGame({ gameId }: UseMafiaGameOptions) {
  const [gameState, setGameState] = useState<MafiaSessionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const fetchGameState = useCallback(async () => {
    try {
      const result = await getMafiaSession(gameId);
      if (result.success && result.data) {
        setGameState(result.data as any);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch game state");
      }
    } catch (err) {
      setError("Error fetching game state");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    let mounted = true;

    // Initial fetch
    fetchGameState();

    // Setup WebSocket connection
    try {
      const socket = getSocket();
      socketRef.current = socket;

      // Join game room
      socket.emit("join-game", gameId);

      // Listen for game state updates
      socket.on("game-state-update", (data: any) => {
        if (mounted && data) {
          setGameState(data);
          setError(null);
        }
      });

      // Listen for game events
      socket.on("game-event", (event: any) => {
        if (mounted) {
          // Refresh game state when events occur
          fetchGameState();
        }
      });

      // Listen for phase transitions
      socket.on("phase-transition", (data: any) => {
        if (mounted) {
          fetchGameState();
        }
      });

      // Listen for player actions
      socket.on("player-action", (data: any) => {
        if (mounted) {
          fetchGameState();
        }
      });

      // Listen for votes
      socket.on("vote-updated", (data: any) => {
        if (mounted) {
          fetchGameState();
        }
      });

      // Listen for chat messages
      socket.on("chat-message", (data: any) => {
        if (mounted) {
          // Trigger a refresh if needed
          fetchGameState();
        }
      });

      // Listen for connection status
      socket.on("joined-game", (data: any) => {
        console.log("Joined game room:", data);
      });

      socket.on("connect", () => {
        console.log("Socket connected, joining game:", gameId);
        socket.emit("join-game", gameId);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (error: any) => {
        console.error("Socket connection error:", error);
        if (mounted) {
          setError("Connection error. Please refresh the page.");
        }
      });
    } catch (err) {
      console.error("Error setting up socket:", err);
      if (mounted) {
        setError("Failed to establish connection");
      }
    }

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit("leave-game", gameId);
      }
    };
  }, [gameId, fetchGameState]);

  return {
    gameState,
    isLoading,
    error,
    refresh: fetchGameState,
  };
}
