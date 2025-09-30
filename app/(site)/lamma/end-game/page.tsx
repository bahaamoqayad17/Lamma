"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function EndGame() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <Image
        src="/left-win.png"
        alt=""
        width={300}
        height={300}
        className="absolute left-0 bottom-0"
      />
      <Image
        src="/right-win.png"
        alt=""
        width={300}
        height={300}
        className="absolute right-0 bottom-0"
      />
      <div className="relative z-10 flex items-center justify-between p-4 md:px-10 sm:p-6 bg-[#6A0DAD] backdrop-blur-sm">
        {/* Logo - Left side for RTL */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center">
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
        <Link href="/">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-200"
            style={{
              boxShadow: "none",
            }}
          >
            <span className="text-sm sm:text-lg font-medium text-[#FCBB00]">
              خروج
            </span>
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-[#FCBB00]" />
          </Button>
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-4xl">
          {/* Top Section - Team Scores */}
          <div className="flex flex-col sm:flex-row justify-center gap-24 mb-12">
            {/* First Team Score */}
            <div className="text-center">
              <h3 className="text-black font-bold text-base sm:text-lg mb-2 bg-purple-200 rounded-full px-6 sm:px-12 py-2">
                الفريق الثاني
              </h3>
              <div className="text-purple-800 font-bold text-2xl sm:text-3xl">
                20000
              </div>
            </div>

            {/* Second Team Score */}
            <div className="text-center">
              <h3 className="text-black font-bold text-base sm:text-lg mb-2 bg-purple-200 rounded-full px-6 sm:px-12 py-2">
                الفريق الثاني
              </h3>
              <div className="text-purple-800 font-bold text-2xl sm:text-3xl">
                20000
              </div>
            </div>
          </div>

          {/* Middle Section - Winner Display */}
          <div className="text-center mb-12">
            <h2 className="text-black font-bold text-2xl mb-8">
              الفريق الفائز
            </h2>

            {/* Winner Circle with Trophy */}
            <div className="relative inline-block">
              {/* Radial Gradient Glow Background */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(106, 13, 173, 1) 100%)",
                  filter: "blur(20px)",
                  opacity: 0.2,
                  transform: "scale(1.1)",
                }}
              />

              {/* Outer Circle with 1px border - rgba(250, 204, 21, 0.2) */}
              <div
                className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full flex items-center justify-center border z-10"
                style={{
                  borderColor: "rgba(250, 204, 21, 0.2)",
                  borderWidth: "1px",
                  backgroundColor: "transparent",
                }}
              >
                {/* Middle Circle with 1px border - rgba(106, 13, 173, 0.7) */}
                <div
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center border"
                  style={{
                    borderColor: "rgba(106, 13, 173, 0.7)",
                    borderWidth: "1px",
                    backgroundColor: "transparent",
                  }}
                >
                  {/* Inner Circle with 1px border - rgba(106, 13, 173, 1) */}
                  <div
                    className="w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center border"
                    style={{
                      borderColor: "rgba(106, 13, 173, 1)",
                      borderWidth: "1px",
                      backgroundColor: "transparent",
                    }}
                  >
                    {/* Trophy Icon */}
                    <div className="mb-2 sm:mb-4">
                      <Image
                        src="/trophy.png"
                        alt="Trophy"
                        width={86}
                        height={86}
                      />
                    </div>

                    {/* Winner Team Name */}
                    <h3 className="text-black font-bold text-base sm:text-xl mb-1 sm:mb-2">
                      فريق التعاون
                    </h3>

                    {/* Winner Points */}
                    <div className="text-black font-bold text-sm sm:text-lg">
                      2000 نقطة
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            {/* New Round Button */}
            <Link href="/lamma/start">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto cursor-pointer">
                <span className="text-black">جولة جديدة</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </button>
            </Link>

            {/* Return to Home Button */}
            <Link href="/">
              <button className="border border-purple-800 cursor-pointer hover:bg-purple-300 text-purple-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto">
                <span>العودة للرئيسية</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
