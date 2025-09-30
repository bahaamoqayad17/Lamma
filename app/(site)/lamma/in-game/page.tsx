"use client";

import React from "react";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LogOut, SkipForward } from "lucide-react";
export default function InGame() {
  // Sample data for the game - you can replace this with actual data from your API
  const gameData = [
    {
      _id: "64f8a1b9c2e8a1f23d9a0001",
      name: "فئة الرياضة",
      description: "أسئلة متنوعة حول الرياضة",
      image: "seen-jeem.png",
      questions: [
        {
          _id: "64f8a1b9c2e8a1f23d9a1001",
          category: "64f8a1b9c2e8a1f23d9a0001",
          file: null,
          question: "من فاز بكأس العالم الأخير؟",
          answer: "الأرجنتين",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a1002",
          category: "64f8a1b9c2e8a1f23d9a0001",
          file: null,
          question: "كم عدد اللاعبين في فريق كرة السلة؟",
          answer: "خمسة",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a1003",
          category: "64f8a1b9c2e8a1f23d9a0001",
          file: "sprint.jpg",
          question: "ما هو الرقم القياسي لسباق 100 متر؟",
          answer: "9.58 ثانية",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a1004",
          category: "64f8a1b9c2e8a1f23d9a0001",
          file: null,
          question: "أي دولة اخترعت رياضة الجودو؟",
          answer: "اليابان",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a1005",
          category: "64f8a1b9c2e8a1f23d9a0001",
          file: null,
          question: "أي فريق لديه أكبر عدد من ألقاب دوري أبطال أوروبا؟",
          answer: "ريال مدريد",
          points: 600,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a1006",
          category: "64f8a1b9c2e8a1f23d9a0001",
          file: null,
          question: "من هو أسرع عداء في العالم؟",
          answer: "يوسين بولت",
          points: 600,
        },
      ],
    },
    // Add more categories as needed for the 6 cards
    {
      _id: "64f8a1b9c2e8a1f23d9a0002",
      name: "فئة التاريخ",
      description: "أسئلة متنوعة حول التاريخ",
      image: "seen-jeem.png",
      questions: [
        {
          _id: "64f8a1b9c2e8a1f23d9a2001",
          category: "64f8a1b9c2e8a1f23d9a0002",
          file: null,
          question: "متى انتهت الحرب العالمية الثانية؟",
          answer: "1945",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a2002",
          category: "64f8a1b9c2e8a1f23d9a0002",
          file: null,
          question: "من هو أول خليفة للمسلمين؟",
          answer: "أبو بكر الصديق",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a2003",
          category: "64f8a1b9c2e8a1f23d9a0002",
          file: null,
          question: "أين تم اكتشاف مقبرة توت عنخ آمون؟",
          answer: "مصر",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a2004",
          category: "64f8a1b9c2e8a1f23d9a0002",
          file: null,
          question: "متى تأسست الدولة العثمانية؟",
          answer: "1299",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a2005",
          category: "64f8a1b9c2e8a1f23d9a0002",
          file: null,
          question: "من هو مؤسس الدولة الأموية؟",
          answer: "معاوية بن أبي سفيان",
          points: 600,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a2006",
          category: "64f8a1b9c2e8a1f23d9a0002",
          file: null,
          question: "أين وقعت معركة اليرموك؟",
          answer: "سوريا",
          points: 600,
        },
      ],
    },
    {
      _id: "64f8a1b9c2e8a1f23d9a0003",
      name: "فئة العلوم",
      description: "أسئلة متنوعة حول العلوم",
      image: "seen-jeem.png",
      questions: [
        {
          _id: "64f8a1b9c2e8a1f23d9a3001",
          category: "64f8a1b9c2e8a1f23d9a0003",
          file: null,
          question: "ما هو العنصر الكيميائي للذهب؟",
          answer: "Au",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a3002",
          category: "64f8a1b9c2e8a1f23d9a0003",
          file: null,
          question: "كم عدد الكواكب في المجموعة الشمسية؟",
          answer: "8",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a3003",
          category: "64f8a1b9c2e8a1f23d9a0003",
          file: null,
          question: "ما هو أسرع حيوان في العالم؟",
          answer: "الفهد",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a3004",
          category: "64f8a1b9c2e8a1f23d9a0003",
          file: null,
          question: "ما هو أكبر محيط في العالم؟",
          answer: "المحيط الهادئ",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a3005",
          category: "64f8a1b9c2e8a1f23d9a0003",
          file: null,
          question: "ما هو أعمق محيط في العالم؟",
          answer: "المحيط الهادئ",
          points: 600,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a3006",
          category: "64f8a1b9c2e8a1f23d9a0003",
          file: null,
          question: "ما هو أطول نهر في العالم؟",
          answer: "نهر النيل",
          points: 600,
        },
      ],
    },
    {
      _id: "64f8a1b9c2e8a1f23d9a0004",
      name: "فئة الأدب",
      description: "أسئلة متنوعة حول الأدب",
      image: "seen-jeem.png",
      questions: [
        {
          _id: "64f8a1b9c2e8a1f23d9a4001",
          category: "64f8a1b9c2e8a1f23d9a0004",
          file: null,
          question: "من هو مؤلف كتاب الأغاني؟",
          answer: "الأصبهاني",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a4002",
          category: "64f8a1b9c2e8a1f23d9a0004",
          file: null,
          question: "ما هو ديوان المعلقات؟",
          answer: "قصائد عربية قديمة",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a4003",
          category: "64f8a1b9c2e8a1f23d9a0004",
          file: null,
          question: "من هو شاعر النيل؟",
          answer: "حافظ إبراهيم",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a4004",
          category: "64f8a1b9c2e8a1f23d9a0004",
          file: null,
          question: "من هو مؤلف كتاب ألف ليلة وليلة؟",
          answer: "مجهول",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a4005",
          category: "64f8a1b9c2e8a1f23d9a0004",
          file: null,
          question: "من هو شاعر القطرين؟",
          answer: "أحمد شوقي",
          points: 600,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a4006",
          category: "64f8a1b9c2e8a1f23d9a0004",
          file: null,
          question: "من هو مؤلف كتاب البخلاء؟",
          answer: "الجاحظ",
          points: 600,
        },
      ],
    },
    {
      _id: "64f8a1b9c2e8a1f23d9a0005",
      name: "فئة الجغرافيا",
      description: "أسئلة متنوعة حول الجغرافيا",
      image: "seen-jeem.png",
      questions: [
        {
          _id: "64f8a1b9c2e8a1f23d9a5001",
          category: "64f8a1b9c2e8a1f23d9a0005",
          file: null,
          question: "ما هي عاصمة فرنسا؟",
          answer: "باريس",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a5002",
          category: "64f8a1b9c2e8a1f23d9a0005",
          file: null,
          question: "ما هي أكبر دولة في العالم؟",
          answer: "روسيا",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a5003",
          category: "64f8a1b9c2e8a1f23d9a0005",
          file: null,
          question: "ما هي أعلى قمة في العالم؟",
          answer: "إفرست",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a5004",
          category: "64f8a1b9c2e8a1f23d9a0005",
          file: null,
          question: "ما هي أصغر دولة في العالم؟",
          answer: "الفاتيكان",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a5005",
          category: "64f8a1b9c2e8a1f23d9a0005",
          file: null,
          question: "ما هي عاصمة أستراليا؟",
          answer: "كانبرا",
          points: 600,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a5006",
          category: "64f8a1b9c2e8a1f23d9a0005",
          file: null,
          question: "ما هي أكبر صحراء في العالم؟",
          answer: "الصحراء الكبرى",
          points: 600,
        },
      ],
    },
    {
      _id: "64f8a1b9c2e8a1f23d9a0006",
      name: "فئة الفنون",
      description: "أسئلة متنوعة حول الفنون",
      image: "seen-jeem.png",
      questions: [
        {
          _id: "64f8a1b9c2e8a1f23d9a6001",
          category: "64f8a1b9c2e8a1f23d9a0006",
          file: null,
          question: "من هو مؤلف لوحة الموناليزا؟",
          answer: "ليوناردو دافنشي",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a6002",
          category: "64f8a1b9c2e8a1f23d9a0006",
          file: null,
          question: "ما هو نوع الفن الذي يسمى بالرسم بالزيت؟",
          answer: "الرسم الزيتي",
          points: 200,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a6003",
          category: "64f8a1b9c2e8a1f23d9a0006",
          file: null,
          question: "من هو مؤلف سمفونية البيتهوفن التاسعة؟",
          answer: "بيتهوفن",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a6004",
          category: "64f8a1b9c2e8a1f23d9a0006",
          file: null,
          question: "ما هو نوع الفن الذي يسمى بالتصوير الفوتوغرافي؟",
          answer: "التصوير",
          points: 400,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a6005",
          category: "64f8a1b9c2e8a1f23d9a0006",
          file: null,
          question: "من هو مؤلف مسرحية هاملت؟",
          answer: "شكسبير",
          points: 600,
        },
        {
          _id: "64f8a1b9c2e8a1f23d9a6006",
          category: "64f8a1b9c2e8a1f23d9a0006",
          file: null,
          question: "ما هو نوع الفن الذي يسمى بالنحت؟",
          answer: "النحت",
          points: 600,
        },
      ],
    },
  ];

  const handleQuestionSelect = (question: any) => {
    console.log("Selected question:", question);
    // Handle question selection logic here
  };

  return (
    <main>
      <div className="relative z-10 flex items-center justify-between p-4 md:px-10 sm:p-6 bg-[#6A0DAD] backdrop-blur-sm">
        {/* Logo - Left side for RTL */}
        <div className="flex-shrink-0">
          <Link href="/lamma" className="flex items-center">
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

        <div className="flex justify-center text-white">فريق باكستاان</div>

        {/* Exit button - Right side for RTL */}
        <div className="flex gap-2 items-center">
          <Link href="/lamma/start">
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
          <Link href="/lamma/end-game">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:text-yellow-400 hover:bg-white/10 transition-all duration-200"
              style={{
                boxShadow: "none",
              }}
            >
              <span className="text-sm sm:text-lg font-medium text-[#FCBB00]">
                انتهاء اللعبة
              </span>
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-[#FCBB00]" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Main Game Grid - 6 Question Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {gameData.map((category) => (
              <div key={category._id} className="w-full">
                <QuestionCard
                  data={category}
                  onQuestionSelect={handleQuestionSelect}
                  className="h-full"
                />
              </div>
            ))}
          </div>

          {/* Bottom Section - Power-up Cards and Score Display */}
          <div className="flex justify-between items-center md:mx-16">
            {/* Horizontal Score Display */}
            <div className="bg-[#E0D9EB] rounded-full px-12 py-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                {/* Team Hope Score */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-black font-bold text-base md:text-lg">
                      فريق الأمل
                    </span>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-[#6A0DAD] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs md:text-sm font-bold">
                        +
                      </span>
                    </div>
                  </div>
                  <span className="text-[#6A0DAD] font-bold text-xl md:text-2xl">
                    200
                  </span>
                </div>

                {/* Central Separator */}
                <div className="flex items-center justify-center px-2 md:px-4">
                  <span className="text-black font-bold text-2xl md:text-3xl">
                    :
                  </span>
                </div>

                {/* Team Cooperation Score */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-[#6A0DAD] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs md:text-sm font-bold">
                        +
                      </span>
                    </div>
                    <span className="text-black font-bold text-base md:text-lg">
                      فريق التعاون
                    </span>
                  </div>
                  <span className="text-[#6A0DAD] font-bold text-xl md:text-2xl">
                    0
                  </span>
                </div>
              </div>
            </div>
            {/* Left Section - Power-up Cards */}
            <div className="">
              <h3 className="text-lg font-semibold text-black mb-4 text-center">
                استخدم احد كروت القوة للمساعدة
              </h3>
              <div className="flex justify-center space-x-4">
                <Image
                  src="/helping-card.png"
                  alt="Power Card"
                  width={80}
                  height={80}
                />
                <Image
                  src="/helping-card.png"
                  alt="Power Card"
                  width={80}
                  height={80}
                />
                <Image
                  src="/helping-card.png"
                  alt="Power Card"
                  width={80}
                  height={80}
                />
              </div>
            </div>

            {/* Right Section - Score Display */}
          </div>
        </div>
      </div>
    </main>
  );
}
