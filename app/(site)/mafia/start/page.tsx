"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Copy, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Start() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [playerCount, setPlayerCount] = useState("");
  const [gameUrl] = useState("https://www.behance.net/shahedhamami");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
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
        <Link href="/mafia">
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

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-3xl bg-transparent border-none">
          <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Game Name Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="gameName"
                  className="text-white text-base sm:text-lg font-medium"
                >
                  اسم اللعبة
                </Label>
                <span className="text-gray-300 text-xs sm:text-sm">
                  اقترح مسمى
                </span>
              </div>
              <Input
                id="gameName"
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="ادخل اسم اللعبة"
                className="bg-transparent border-white/30 text-white placeholder-gray-400 rounded-lg h-10 sm:h-12 text-right focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              />
            </div>

            {/* Number of Players Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="playerCount"
                  className="text-white text-base sm:text-lg font-medium"
                >
                  عدد افراد اللعبة
                </Label>
                <span className="text-gray-300 text-xs sm:text-sm">اجباري</span>
              </div>
              <Input
                id="playerCount"
                type="number"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                placeholder="ادخل عدد اللاعبين"
                className="bg-transparent border-white/30 text-white placeholder-gray-400 rounded-lg h-10 sm:h-12 text-right focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
                min="4"
                max="20"
              />
            </div>

            {/* Join Link Section */}
            <div className="space-y-3">
              <p className="text-white text-center text-xs sm:text-sm">
                انسخ رابط اللعبة للانضمام
              </p>
              <div className="flex items-center gap-2 sm:gap-3 bg-black/30 rounded-lg p-2 sm:p-3">
                <Button
                  onClick={handleCopyUrl}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 p-2 hover:text-yellow-400 hover:bg-white/10 text-white"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <span className="text-white text-xs sm:text-sm flex-1 text-center break-all">
                  {gameUrl}
                </span>
                {isCopied && (
                  <span className="text-yellow-400 text-xs">تم النسخ!</span>
                )}
              </div>
            </div>

            {/* Start Game Button */}
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 text-lg transition-all duration-200 flex items-center gap-3 mx-auto"
              onClick={() => router.push("/mafia/in-game")}
            >
              ابدأ المباراة
              <ArrowLeft />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
