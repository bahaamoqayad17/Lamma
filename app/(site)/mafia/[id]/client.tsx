"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, LogOut, Clock, Users, AlertCircle } from "lucide-react";
import { useMafiaGame } from "@/hooks/useMafiaGame";
import {
  joinMafiaGame,
  startMafiaGame,
  performAction,
  submitVote,
  sendChatMessage,
  getChatMessages,
} from "@/actions/mafia-actions";
import { getSocket } from "@/lib/socket-client";
import { toast } from "react-toastify";

export default function InGame({ data }: { data: any }) {
  const gameId = data?.gameId || "";
  const { gameState, isLoading, error, refresh } = useMafiaGame({
    gameId,
  });

  const [activeTab, setActiveTab] = useState<"all" | "mafia">("all");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasJoined, setHasJoined] = useState(false);

  // Get current user ID
  useEffect(() => {
    async function getUserId() {
      try {
        const session = await fetch("/api/user", {
          credentials: "include",
        }).then((res) => res.json());
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
      } catch (err) {
        console.error("Error getting user:", err);
      }
    }
    getUserId();
  }, []);

  // Auto-join game on mount
  useEffect(() => {
    if (
      gameId &&
      currentUserId &&
      !hasJoined &&
      gameState?.status === "created"
    ) {
      joinMafiaGame(gameId).then((result) => {
        if (result.success) {
          setHasJoined(true);
          // WebSocket will update automatically, but refresh once for immediate feedback
          refresh();
        }
      });
    }
  }, [gameId, currentUserId, hasJoined, gameState?.status, refresh]);

  // Update time remaining
  useEffect(() => {
    if (!gameState?.phaseEndTime) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const endTime = new Date(gameState.phaseEndTime).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [gameState?.phaseEndTime]);

  const loadChatMessages = async () => {
    const result = await getChatMessages(gameId, activeTab);
    if (result.success && result.data) {
      setChatMessages(result.data);
    }
  };

  // Load chat messages and listen to WebSocket events
  useEffect(() => {
    if (gameState?.status === "started" && currentUserId) {
      loadChatMessages();
    }
  }, [gameState?.status, activeTab, currentUserId, gameId]);

  // Listen to WebSocket chat messages
  useEffect(() => {
    if (gameState?.status !== "started") return;

    const socket = getSocket();

    const handleChatMessage = (data: any) => {
      // Only update if it's for the current chat tab
      if (data.chatType === activeTab) {
        loadChatMessages();
      }
    };

    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, [gameState?.status, activeTab, gameId]);

  // Get current player
  const currentPlayer = useMemo(() => {
    if (!gameState || !currentUserId) return null;
    return gameState.players?.find(
      (p: any) =>
        p.user?._id?.toString() === currentUserId ||
        p.user?.toString() === currentUserId
    );
  }, [gameState, currentUserId]);

  // Get active players
  const activePlayers = useMemo(() => {
    if (!gameState) return [];
    return gameState.players?.filter((p: any) => p.isActive) || [];
  }, [gameState]);

  // Check if user is host
  const isHost = currentPlayer?.host || false;

  // Get role display name
  const getRoleName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      mafia: "مافيا",
      doctor: "طبيب",
      detective: "محقق",
      citizen: "مواطن",
    };
    return roleMap[role] || role;
  };

  // Get phase name
  const getPhaseName = (phase: string) => {
    const phaseMap: { [key: string]: string } = {
      waiting: "انتظار",
      action: "مرحلة الأفعال",
      voting: "مرحلة التصويت",
      results: "النتائج",
    };
    return phaseMap[phase] || phase;
  };

  // Handle start game
  const handleStartGame = async () => {
    if (!isHost) return;
    const result = await startMafiaGame(gameId);
    if (result.success) {
      toast.success("تم بدء اللعبة!");
      // WebSocket will update automatically
    } else {
      toast.error(result.message || "فشل بدء اللعبة");
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const chatType = activeTab === "all" ? "all" : "mafia";
    const result = await sendChatMessage(gameId, message, chatType);
    if (result.success) {
      setMessage("");
      // WebSocket event will trigger chat-message handler to reload
    } else {
      toast.error(result.message || "فشل إرسال الرسالة");
    }
  };

  // Handle perform action
  const handlePerformAction = async (
    actionType: "kill" | "heal" | "reveal"
  ) => {
    if (!selectedTarget && actionType !== "heal") {
      toast.error("يجب اختيار هدف");
      return;
    }
    const result = await performAction(gameId, actionType, selectedTarget);
    if (result.success) {
      toast.success("تم تنفيذ الإجراء بنجاح");
      setSelectedTarget(null);
      // WebSocket will update game state automatically
    } else {
      toast.error(result.message || "فشل تنفيذ الإجراء");
    }
  };

  // Handle vote
  const handleVote = async (targetUserId: string | null) => {
    const result = await submitVote(gameId, targetUserId);
    if (result.success) {
      toast.success("تم التصويت بنجاح");
      // WebSocket will update game state automatically
    } else {
      toast.error(result.message || "فشل التصويت");
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate positions for elliptical arrangement
  const getCharacterPosition = (index: number, total: number) => {
    const angle = (index * 360) / total;
    const baseRadius = Math.min(300, Math.max(200, 400 - total * 15));
    const horizontalRadius = baseRadius * 1.4;
    const verticalRadius = baseRadius * 1.25;
    const x = Math.cos((angle - 90) * (Math.PI / 180)) * horizontalRadius;
    const y = Math.sin((angle - 90) * (Math.PI / 180)) * verticalRadius;
    return { x, y };
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">جاري التحميل...</div>
      </main>
    );
  }

  if (error || !gameState) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-400 text-xl">{error || "حدث خطأ"}</div>
      </main>
    );
  }

  const players = gameState.players || [];
  const isActionPhase =
    gameState.phase === "action" && gameState.status === "started";
  const isVotingPhase =
    gameState.phase === "voting" && gameState.status === "started";
  const gameEnded = gameState.status === "ended";

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/start-mafia.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:px-10 sm:p-6 bg-black backdrop-blur-sm">
        <div className="flex-shrink-0">
          <Link href="/mafia" className="flex items-center">
            <Image
              src="/logo.png"
              alt="لمة"
              width={80}
              height={30}
              className="h-6 sm:h-8 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Game Info */}
          {gameState.status === "started" && (
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">
                  {activePlayers.length}/{players.length}
                </span>
              </div>
              <div className="text-sm bg-yellow-600 px-3 py-1 rounded">
                {getPhaseName(gameState.phase)}
              </div>
            </div>
          )}

          {gameState.status === "created" && (
            <div className="relative z-10 flex justify-center p-4">
              <Button
                onClick={handleStartGame}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-8 py-4 text-lg"
                disabled={
                  !isHost ||
                  players.length < 4 ||
                  gameState.status !== "created"
                }
              >
                ابدأ اللعبة ({players.length} لاعبين)
              </Button>
            </div>
          )}

          <Link href="/mafia/start">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-200"
            >
              <span className="text-sm sm:text-lg font-medium">خروج</span>
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Game Ended Message */}
      {gameEnded && (
        <div className="relative z-10 flex justify-center p-4">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {gameState.winner === "citizens"
                ? "🏆 فاز المواطنون!"
                : "💀 فاز المافيا!"}
            </h2>
            <p className="text-gray-300">
              {gameState.winner === "citizens"
                ? "تم القضاء على المافيا"
                : "تم القضاء على جميع المواطنين"}
            </p>
          </div>
        </div>
      )}

      {/* Role Display - Only show when game started */}
      {gameState.status === "started" && currentPlayer && (
        <div className="relative z-10 flex justify-center p-2">
          <div className="bg-yellow-600/90 backdrop-blur-sm rounded-lg px-6 py-2">
            <p className="text-black font-bold text-lg">
              دورك: {getRoleName(currentPlayer.role)}
            </p>
          </div>
        </div>
      )}

      {/* Action Panels - Only during action phase */}
      {isActionPhase && currentPlayer && (
        <div className="relative z-10 flex justify-center p-4 gap-4 flex-wrap">
          {currentPlayer.role === "mafia" && (
            <div className="bg-red-900/90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">اختر من تقتل</h3>
              <div className="flex gap-2 flex-wrap">
                {activePlayers
                  .filter((p: any) => {
                    const userId =
                      p.user?._id?.toString() || p.user?.toString();
                    return userId !== currentUserId;
                  })
                  .map((p: any) => {
                    const userId =
                      p.user?._id?.toString() || p.user?.toString();
                    return (
                      <Button
                        key={userId}
                        onClick={() => setSelectedTarget(userId)}
                        variant={
                          selectedTarget === userId ? "default" : "outline"
                        }
                        className="text-white"
                      >
                        {p.user?.name || "Unknown"}
                      </Button>
                    );
                  })}
              </div>
              {selectedTarget && (
                <Button
                  onClick={() => handlePerformAction("kill")}
                  className="mt-2 bg-red-600 hover:bg-red-500 text-white"
                >
                  قتل
                </Button>
              )}
            </div>
          )}

          {currentPlayer.role === "doctor" && (
            <div className="bg-green-900/90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">
                اختر من تشفي (أو نفسك)
              </h3>
              <div className="flex gap-2 flex-wrap">
                {activePlayers.map((p: any) => {
                  const userId = p.user?._id?.toString() || p.user?.toString();
                  return (
                    <Button
                      key={userId}
                      onClick={() => setSelectedTarget(userId)}
                      variant={
                        selectedTarget === userId ? "default" : "outline"
                      }
                      className="text-white"
                    >
                      {userId === currentUserId
                        ? "نفسك"
                        : p.user?.name || "Unknown"}
                    </Button>
                  );
                })}
              </div>
              {selectedTarget && (
                <Button
                  onClick={() => handlePerformAction("heal")}
                  className="mt-2 bg-green-600 hover:bg-green-500 text-white"
                >
                  شفاء
                </Button>
              )}
            </div>
          )}

          {currentPlayer.role === "detective" && (
            <div className="bg-blue-900/90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">اختر من تفحص</h3>
              <div className="flex gap-2 flex-wrap">
                {activePlayers
                  .filter((p: any) => {
                    const userId =
                      p.user?._id?.toString() || p.user?.toString();
                    return userId !== currentUserId;
                  })
                  .map((p: any) => {
                    const userId =
                      p.user?._id?.toString() || p.user?.toString();
                    return (
                      <Button
                        key={userId}
                        onClick={() => setSelectedTarget(userId)}
                        variant={
                          selectedTarget === userId ? "default" : "outline"
                        }
                        className="text-white"
                      >
                        {p.user?.name || "Unknown"}
                      </Button>
                    );
                  })}
              </div>
              {selectedTarget && (
                <Button
                  onClick={() => handlePerformAction("reveal")}
                  className="mt-2 bg-blue-600 hover:bg-blue-500 text-white"
                >
                  فحص
                </Button>
              )}
              {gameState.currentPhaseActions?.detectiveReveal?.target && (
                <div className="mt-2 text-white bg-blue-800 p-2 rounded">
                  دور{" "}
                  {(gameState.currentPhaseActions.detectiveReveal.target as any)
                    ?.name || "Unknown"}
                  :{" "}
                  {getRoleName(
                    gameState.currentPhaseActions.detectiveReveal
                      .revealedRole || ""
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voting Panel - Only during voting phase */}
      {isVotingPhase && (
        <div className="relative z-10 flex justify-center p-4">
          <div className="bg-purple-900/90 backdrop-blur-sm rounded-lg p-4 max-w-2xl w-full">
            <h3 className="text-white font-bold mb-4 text-center">
              من تشك أنه المافيا؟
            </h3>
            <div className="flex gap-2 flex-wrap justify-center">
              {activePlayers
                .filter((p: any) => {
                  const userId = p.user?._id?.toString() || p.user?.toString();
                  return userId !== currentUserId;
                })
                .map((p: any) => {
                  const userId = p.user?._id?.toString() || p.user?.toString();
                  const hasVotedFor = gameState.votes?.some((v: any) => {
                    const voterId =
                      v.voter?._id?.toString() || v.voter?.toString();
                    const targetId =
                      v.target?._id?.toString() || v.target?.toString();
                    return voterId === currentUserId && targetId === userId;
                  });
                  return (
                    <Button
                      key={userId}
                      onClick={() => handleVote(userId)}
                      variant={hasVotedFor ? "default" : "outline"}
                      className="text-white"
                    >
                      {p.user?.name || "Unknown"}
                    </Button>
                  );
                })}
              <Button
                onClick={() => handleVote(null)}
                variant="outline"
                className="text-white"
              >
                تخطي
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] pb-64 lg:pb-0">
        {/* Left Sidebar - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:flex w-80 bg-black/30 backdrop-blur-sm border-r border-gray-700 flex-col h-full">
          {/* Chat Tabs */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex space-y-2">
              <button
                onClick={() => {
                  setActiveTab("all");
                }}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors w-full cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[#FCCB97] text-black font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                العامة
              </button>
              {currentPlayer?.role === "mafia" &&
                gameState.status === "started" && (
                  <button
                    onClick={() => {
                      setActiveTab("mafia");
                    }}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors w-full cursor-pointer ${
                      activeTab === "mafia"
                        ? "bg-[#FCCB97] text-black font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    القتلة
                  </button>
                )}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {chatMessages.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-8">
                  لا توجد رسائل بعد
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className="text-white text-sm">
                    <span className="font-medium text-yellow-400">
                      {msg.senderName || msg.sender?.name || "Unknown"}:
                    </span>{" "}
                    <span>{msg.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Input */}
          {gameState.status === "started" && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white p-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="اكتب رسالة"
                  className="flex-1 bg-gray-800 border-yellow-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Central Mafia Title */}
          <div className="absolute top-4 lg:top-1/2 left-1/2 transform -translate-x-1/2 lg:-translate-y-1/2 z-20">
            <h1 className="text-3xl lg:text-6xl xl:text-8xl font-bold text-white text-center">
              مافيا
            </h1>
          </div>

          {/* Mobile Grid Layout */}
          <div className="md:hidden w-full h-full flex flex-col items-center justify-center p-4">
            <div className="grid grid-cols-3 gap-4 mt-16 w-full max-w-sm">
              {players.map((player: any, index: number) => {
                const userId =
                  player.user?._id?.toString() || player.user?.toString();
                const isCurrentUser = userId === currentUserId;
                const isEliminated = !player.isActive;

                return (
                  <div key={userId} className="flex flex-col items-center">
                    <div className="relative">
                      <div
                        className={`rounded-full bg-[#FCCB97] w-16 h-16 border-2 ${
                          isEliminated
                            ? "border-red-600 opacity-50"
                            : "border-[#FFEA00]"
                        } hover:border-yellow-600 transition-colors cursor-pointer flex items-center justify-center`}
                      >
                        <Image
                          src="/citizen.png"
                          alt={player.user?.name || "Player"}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>
                      {isCurrentUser && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                      {isEliminated && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-center">
                      <div className="text-white text-xs font-medium">
                        {player.user?.name || "Unknown"}
                      </div>
                      {gameState.status === "started" && currentPlayer && (
                        <div className="text-gray-400 text-xs">
                          {getRoleName(player.role)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Circular Layout */}
          <div className="hidden md:block relative w-full h-full flex items-center justify-center">
            {players.map((player: any, index: number) => {
              const userId =
                player.user?._id?.toString() || player.user?.toString();
              const isCurrentUser = userId === currentUserId;
              const isEliminated = !player.isActive;
              const position = getCharacterPosition(index, players.length);

              return (
                <div
                  key={userId}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${position.x}px)`,
                    top: `calc(50% + ${position.y}px)`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div
                        className={`rounded-full bg-[#FCCB97] w-28 h-28 border-2 ${
                          isEliminated
                            ? "border-red-600 opacity-50"
                            : "border-[#FFEA00]"
                        } hover:border-yellow-600 transition-colors cursor-pointer flex items-center justify-center`}
                      >
                        <Image
                          src="/citizen.png"
                          alt={player.user?.name || "Player"}
                          width={86}
                          height={60}
                          className="rounded-full"
                        />
                      </div>
                      {isCurrentUser && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                      {isEliminated && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-center">
                      <div className="text-white text-xs font-medium mb-1">
                        {player.user?.name || "Unknown"}
                      </div>
                      {gameState.status === "started" && currentPlayer && (
                        <div className="text-gray-400 text-xs">
                          {getRoleName(player.role)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Chat - Bottom of screen on mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-700 z-20">
        {/* Chat Tabs */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors flex-1 cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#FCCB97] text-black font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              العامة
            </button>
            {currentPlayer?.role === "mafia" &&
              gameState.status === "started" && (
                <button
                  onClick={() => setActiveTab("mafia")}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex-1 cursor-pointer ${
                    activeTab === "mafia"
                      ? "bg-[#FCCB97] text-black font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  القتلة
                </button>
              )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="h-32 p-3 overflow-y-auto">
          <div className="space-y-2">
            {chatMessages.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-4">
                لا توجد رسائل بعد
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className="text-white text-sm">
                  <span className="font-medium text-yellow-400">
                    {msg.senderName || msg.sender?.name || "Unknown"}:
                  </span>{" "}
                  <span>{msg.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Input */}
        {gameState.status === "started" && (
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSendMessage}
                className="bg-yellow-600 hover:bg-yellow-500 text-white p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="اكتب رسالة"
                className="flex-1 bg-gray-800 border-yellow-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
