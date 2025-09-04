import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export default function Header() {
  return (
    <header className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center max-w-5xl mx-auto mb-16">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-Regular text-white mb-6 leading-tight">
          ادخل عالم التحدي الجماعي العب، تواصل، انتصر مع{" "}
          <span className="relative text-[#FCCA97]">لمَّــــــــــــــــة</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-white mb-8 leading-relaxed max-w-3xl mx-auto">
          منصة ألعاب أونلاين متعددة تجمعك بأصدقائك ومنافسين من حول العالم. استعد
          لتجربة لعب جماعية مليئة بالإثارة، التحديات، والتواصل الحقيقي. كل لعبة
          هي مغامرة، وكل فوز هو إنجاز.
        </p>

        {/* Call to Action Button */}
        <Button
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 text-lg transition-all duration-200 flex items-center gap-3 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          العب الان
        </Button>
      </div>

      {/* Game Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full h-90">
        {/* Seen Jeem Game Card */}
        <Card className="bg-amber-50 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
          <Image
            src="/seen-jeem.png"
            alt="سين جيم - لعبة الأسئلة والأجوبة"
            fill
            className="rounded-lg"
            priority
          />
        </Card>

        {/* Mafia Game Card */}
        <Card className="bg-amber-50 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
          <Image
            src="/mafia.png"
            alt="مافيا - لعبة المافيا"
            fill
            className="rounded-lg"
            priority
          />
        </Card>
      </div>
    </header>
  );
}
