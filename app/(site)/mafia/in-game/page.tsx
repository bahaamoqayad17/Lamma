"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, LogOut } from "lucide-react";

export default function InGame() {
  const [activeTab, setActiveTab] = useState("killers");
  const [message, setMessage] = useState("");

  // Sample players data - this would come from your game state
  const players = [
    { id: "1234", name: "انت (مواطن)", role: "citizen", isCurrentUser: true },
    { id: "1235", name: "Player 2", role: "citizen", isCurrentUser: false },
    { id: "1236", name: "Player 3", role: "citizen", isCurrentUser: false },
    { id: "1237", name: "Player 4", role: "citizen", isCurrentUser: false },
    { id: "1238", name: "Player 5", role: "citizen", isCurrentUser: false },
    { id: "1238", name: "Player 5", role: "citizen", isCurrentUser: false },
    { id: "1238", name: "Player 5", role: "citizen", isCurrentUser: false },
    { id: "1239", name: "Player 6", role: "citizen", isCurrentUser: false },
    { id: "1240", name: "Player 7", role: "citizen", isCurrentUser: false },
  ];

  // Calculate positions for elliptical arrangement (wider in both directions)
  const getCharacterPosition = (index: number, total: number) => {
    const angle = (index * 360) / total;
    const baseRadius = Math.min(300, Math.max(200, 400 - total * 15));
    const horizontalRadius = baseRadius * 1.4; // 40% wider horizontally
    const verticalRadius = baseRadius * 1.25; // 40% wider vertically
    const x = Math.cos((angle - 90) * (Math.PI / 180)) * horizontalRadius;
    const y = Math.sin((angle - 90) * (Math.PI / 180)) * verticalRadius;
    return { x, y };
  };

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
        {/* Logo - Left side for RTL */}
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

        {/* Exit button - Right side for RTL */}
        <Link href="/mafia/start">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-200"
            style={{
              boxShadow: "none",
            }}
          >
            <span className="text-sm sm:text-lg font-medium">خروج</span>
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </Link>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] pb-64 lg:pb-0">
        {/* Left Sidebar - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:flex w-80 bg-black/30 backdrop-blur-sm border-r border-gray-700 flex-col h-full">
          {/* Chat Tabs */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex space-y-2">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors w-full cursor-pointer ${
                  activeTab === "general"
                    ? "bg-[#FCCB97] text-black font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                العامة
              </button>
              <button
                onClick={() => setActiveTab("killers")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors relative w-full cursor-pointer ${
                  activeTab === "killers"
                    ? "bg-[#FCCB97] text-black font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                القتلة
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {/* Sample messages would go here */}
              <div className="text-gray-400 text-sm text-center py-8">
                لا توجد رسائل بعد
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-500 text-white p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة"
                className="flex-1 bg-gray-800 border-yellow-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>
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
              {players.map((player) => (
                <div key={player.id} className="flex flex-col items-center">
                  <div className="relative">
                    <div className="rounded-full bg-[#FCCB97] w-16 h-16 border-2 border-[#FFEA00] hover:border-yellow-600 transition-colors cursor-pointer flex items-center justify-center">
                      <Image
                        src="/citizen.png"
                        alt={player.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </div>
                    {player.isCurrentUser && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="mt-1 text-center">
                    <div className="text-white text-xs font-medium">
                      {player.name}
                    </div>
                    {!player.isCurrentUser && (
                      <div className="text-gray-400 text-xs">#{player.id}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Circular Layout */}
          <div className="hidden md:block relative w-full h-full flex items-center justify-center">
            {players.map((player, index) => {
              const position = getCharacterPosition(index, players.length);
              return (
                <div
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${position.x}px)`,
                    top: `calc(50% + ${position.y}px)`,
                  }}
                >
                  {/* Character Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="rounded-full bg-[#FCCB97] w-28 h-28 border-2 border-[#FFEA00] hover:border-yellow-600 transition-colors cursor-pointer flex items-center justify-center">
                        <Image
                          src="/citizen.png"
                          alt={player.name}
                          width={86}
                          height={60}
                          className="rounded-full"
                        />
                      </div>
                      {player.isCurrentUser && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="mt-2 text-center">
                      <div className="text-white text-xs font-medium mb-1">
                        {player.name}
                      </div>
                      {!player.isCurrentUser && (
                        <>
                          <div className="text-gray-400 text-xs">
                            #{player.id}
                          </div>
                          <div className="text-gray-400 text-xs">569</div>
                        </>
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
              onClick={() => setActiveTab("general")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors flex-1 cursor-pointer ${
                activeTab === "general"
                  ? "bg-[#FCCB97] text-black font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              العامة
            </button>
            <button
              onClick={() => setActiveTab("killers")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors flex-1 cursor-pointer ${
                activeTab === "killers"
                  ? "bg-[#FCCB97] text-black font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              القتلة
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="h-32 p-3 overflow-y-auto">
          <div className="space-y-2">
            <div className="text-gray-400 text-sm text-center py-4">
              لا توجد رسائل بعد
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-500 text-white p-2"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالة"
              className="flex-1 bg-gray-800 border-yellow-600 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
