import { Button } from "@/components/ui/button";
import Link from "@/icons/Link";
import React from "react";
import NextLink from "next/link";

export default function Mafia() {
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/mafia.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Black overlay */}
      <div className="absolute inset-0 bg-black/80 z-10"></div>

      {/* Main content container */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Main title */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 text-center">
          مافيا
        </h1>

        {/* Game description */}
        <div className="max-w-4xl mx-auto text-center mb-4">
          <p className="text-[#D5D5D5] text-lg md:text-xl leading-relaxed">
            "مافيا" هي لعبة أدوار خيالية تعتمد على الذكاء، التحليل، والخداع.
            تُقسم المجموعة إلى فريقين: المافيا الذين يحاولون التخلص من البقية
            سرًا، والمواطنين الذين يحاولون كشف المافيا وحمايتهم. اللعبة تدور على
            شكل جولات: في الليل تتحرك المافيا سرًا، وفي النهار يبدأ النقاش بين
            اللاعبين حيث يحاول كل طرف الدفاع عن نفسه أو اتهام الآخرين.
          </p>
        </div>

        {/* Play Now button */}
        <Button
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 text-lg transition-all duration-200"
        >
          <NextLink
            href={"/mafia/start"}
            className="flex items-center gap-3 mx-auto"
          >
            <Link />
            العب الان
          </NextLink>
        </Button>
      </div>
    </main>
  );
}
