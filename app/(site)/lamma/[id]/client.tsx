"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, SkipForward } from "lucide-react";
import TimerComponent from "@/components/Timer";
import { submitAnswer } from "@/actions/lamma-actions";

export default function InGame({ data }: { data: any }) {
  const [step, setStep] = useState<"list" | "question">("list");
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Local state for scores (optimistic updates)
  const [localScores, setLocalScores] = useState({
    team1: data?.session?.team1?.score || 0,
    team2: data?.session?.team2?.score || 0,
  });

  // Local state for answered questions (optimistic updates)
  const initialAnsweredQuestions = useMemo<Set<string>>(() => {
    const questionIds: string[] = [];
    if (data?.session?.moves) {
      for (const move of data.session.moves) {
        let questionId: string | null = null;
        if (typeof move.question === "object" && move.question?._id) {
          questionId = move.question._id.toString();
        } else if (move.question) {
          questionId = move.question.toString();
        }
        if (questionId) {
          questionIds.push(questionId);
        }
      }
    }
    return new Set<string>(questionIds);
  }, [data?.session?.moves]);

  const [localAnsweredQuestions, setLocalAnsweredQuestions] = useState<
    Set<string>
  >(initialAnsweredQuestions as Set<string>);

  // Extract answered question IDs from moves (combine server and local)
  const answeredQuestionIds = localAnsweredQuestions;

  const handleQuestionSelect = (question: any) => {
    // Don't allow selecting already answered questions
    if (answeredQuestionIds.has(question._id)) {
      return;
    }
    setSelectedQuestion(question);
    setShowAnswer(false);
    setStep("question");
  };

  const handleTeamAnswer = async (teamName: "team1" | "team2") => {
    if (!selectedQuestion) return;

    const questionId = selectedQuestion._id;
    const points = selectedQuestion.points;

    // Optimistic update: Update local state immediately
    setLocalScores((prev) => ({
      ...prev,
      [teamName]: prev[teamName] + points,
    }));

    // Mark question as answered locally
    setLocalAnsweredQuestions((prev: Set<string>) => {
      const newSet = new Set<string>(prev);
      newSet.add(questionId);
      return newSet;
    });

    // Keep timer running - don't stop it here
    // Timer will reset when new question is selected or reset button is clicked

    // Reset UI state
    setShowAnswer(false);
    setSelectedQuestion(null);
    setStep("list");

    // Save to database (fire and forget - no need to wait)
    const sessionId = data?.session?._id
      ? typeof data.session._id === "string"
        ? data.session._id
        : data.session._id.toString()
      : data?.session?.id;

    if (sessionId) {
      submitAnswer(
        sessionId,
        questionId,
        teamName,
        true, // isCorrect - always true when team button is clicked
        points
      ).catch((error) => {
        console.error("Error submitting answer:", error);
        // Optionally revert optimistic update on error
        // For now, we'll keep it optimistic
      });
    }
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
      <div className="min-h-screen bg-[#E6E6E6] py-8">
        <div className="mx-auto px-4">
          {/* Main Game Grid - 6 Question Cards */}
          {step === "list" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {data?.gameData?.map((category: any) => (
                <div key={category._id} className="w-full">
                  <QuestionCard
                    data={category}
                    onQuestionSelect={handleQuestionSelect}
                    answeredQuestionIds={answeredQuestionIds}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          )}
          {step === "question" && selectedQuestion && (
            <div className="mx-20 mb-8">
              {/* Question Display Container */}
              <div
                className="rounded-xl bg-white border border-[#FCCB97]"
                style={{
                  boxShadow: "10px 10px 20px 0px #FCCB9733",
                }}
              >
                {/* Top Header Bar */}
                <div className="px-6 py-4 flex items-center justify-between">
                  {/* Right - Points */}
                  <div className="text-black font-bold text-lg">
                    {selectedQuestion.points} نقطة
                  </div>

                  {/* Center - Timer */}
                  <TimerComponent
                    key={selectedQuestion._id}
                    onReset={() => {
                      // Timer resets automatically via key prop
                    }}
                  />
                  {/* Left - Category Button */}

                  <div className="bg-purple-100 px-8 py-3 rounded-full">
                    <span className="text-black font-bold text-lg">
                      {selectedQuestion.category.name}
                    </span>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-8">
                  {/* Question Text */}
                  <div className="text-center mb-8 flex flex-col items-center justify-center gap-6">
                    {showAnswer ? (
                      <h1 className="text-black text-xl md:text-2xl font-medium leading-relaxed text-green-500">
                        الإجابة الصحيحة هي : {selectedQuestion.answer}
                      </h1>
                    ) : (
                      <h1 className="text-black text-xl md:text-2xl font-medium leading-relaxed">
                        {selectedQuestion.question}
                      </h1>
                    )}
                    {selectedQuestion.file && (
                      <div className="w-full h-180 relative">
                        <Image
                          src={`/${selectedQuestion.file}`}
                          alt="Question Image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-300 px-6 py-4">
                  {!showAnswer ? (
                    <div className="flex">
                      <button
                        className="text-purple-600 hover:text-white hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                        onClick={() => setShowAnswer(true)}
                      >
                        عرض الاجابة
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex w-[58%] justify-between items-center gap-4">
                        <div className="flex">
                          <button
                            className="text-[#FF6F00] hover:text-white hover:bg-[#FF6F00] px-6 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                            onClick={() => setShowAnswer(true)}
                          >
                            تصحيح الإجابة
                          </button>
                        </div>
                        <div className="flex justify-center items-center flex-col gap-4">
                          <h2 className="text-black font-bold text-lg">
                            أي الفريقين أجاب بشكل صحيح
                          </h2>

                          <div className="flex gap-4">
                            <button
                              onClick={() => handleTeamAnswer("team1")}
                              className="text-black font-bold text-md border border-gray-300 rounded-xl px-4 py-2 hover:bg-gray-300 transition-all duration-200 cursor-pointer"
                            >
                              {data?.session?.team1?.name}
                            </button>
                            <button
                              onClick={() => handleTeamAnswer("team2")}
                              className="text-black font-bold text-md border border-gray-300 rounded-xl px-4 py-2 hover:bg-gray-300 transition-all duration-200 cursor-pointer"
                            >
                              {data?.session?.team2?.name}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Section - Power-up Cards and Score Display */}
          <div className="flex flex-col gap-8 md:gap-0 md:flex-row justify-between items-center md:mx-16">
            {/* Horizontal Score Display */}
            <div className="bg-[#E0D9EB] rounded-full md:px-12 px-4 py-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                {/* Team Hope Score */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-black font-bold text-base md:text-lg">
                      {data?.session?.team2?.name}
                    </span>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-[#6A0DAD] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs md:text-sm font-bold">
                        +
                      </span>
                    </div>
                  </div>
                  <span className="text-[#6A0DAD] font-bold text-xl md:text-2xl">
                    {localScores.team2}
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
                      {data?.session?.team1?.name}
                    </span>
                  </div>
                  <span className="text-[#6A0DAD] font-bold text-xl md:text-2xl">
                    {localScores.team1}
                  </span>
                </div>
              </div>
            </div>
            {/* Left Section - Power-up Cards */}
            {!data?.session?.playWithoutCards && (
              <div className="">
                <h3 className="text-lg font-semibold text-black mb-4 text-center">
                  استخدم احد كروت القوة للمساعدة
                </h3>
                <div className="flex justify-center space-x-4">
                  <h3 className="text-lg font-semibold text-black mb-4 text-center">
                    {data?.session?.team1?.name}
                  </h3>
                  <div className="flex justify-center space-x-4">
                    {data?.session?.team1?.selectedCards?.map((card: any) => (
                      <Image
                        src={card.image}
                        alt="Power Card"
                        width={80}
                        height={80}
                      />
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-black mb-4 text-center">
                    {data?.session?.team2?.name}
                  </h3>
                  <div className="flex justify-center space-x-4">
                    {data?.session?.team2?.selectedCards?.map((card: any) => (
                      <Image
                        src={card.image}
                        alt="Power Card"
                        width={80}
                        height={80}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Right Section - Score Display */}
          </div>
        </div>
      </div>
    </main>
  );
}
