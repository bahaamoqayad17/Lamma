import { Button } from "@/components/ui/button";
import Link from "@/icons/Link";
import React from "react";
import NextLink from "next/link";

export default function Mafia() {
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/seen-jeem.png')",
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
          لـــــمَّــــــة
        </h1>

        {/* Game description */}
        <div className="max-w-4xl mx-auto text-center mb-4">
          <p className="text-[#D5D5D5] text-lg md:text-xl leading-relaxed">
            "لـــــمَّــــــة" هي لعبة جماعية تعتمد على الأسئلة والأجوبة
            التفاعلية. يطرح على اللاعبين أسئلة متنوعة في مجالات الثقافة العامة،
            الرياضة، الفنون، العلوم، والتاريخ، ويتنافسون فيما بينهم للإجابة
            بأسرع وقت ممكن أو بأكبر قدر من الدقة.  تهدف اللعبة إلى الدمج بين
            المتعة والمعرفة، فهي ليست مجرد اختبار معلومات بل وسيلة للتعلم بطريقة
            مسلية، وتحفيز روح1 التحدي بين الأصدقاء أو أفراد العائلة.
          </p>
        </div>

        {/* Play Now button */}
        <Button
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 text-lg transition-all duration-200"
        >
          <NextLink
            href={"/lamma/start"}
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
