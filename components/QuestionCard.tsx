import React, { useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Type definitions based on the provided data structure
interface Question {
  _id: string;
  category: string;
  file: string | null;
  question: string;
  answer: string;
  points: number;
}

interface CategoryData {
  _id: string;
  name: string;
  description: string;
  image: string;
  questions: Question[];
}

interface QuestionCardProps {
  data: CategoryData;
  onQuestionSelect?: (question: Question, blockKey?: string) => void;
  answeredQuestionIds?: Set<string>;
  blockedBlocks?: Set<string>;
  className?: string;
}

export default function QuestionCard({
  data,
  onQuestionSelect,
  answeredQuestionIds = new Set(),
  blockedBlocks = new Set(),
  className,
}: QuestionCardProps) {
  // Group questions by points for display
  const questionsByPoints = data.questions.reduce((acc, question) => {
    if (!acc[question.points]) {
      acc[question.points] = [];
    }
    acc[question.points].push(question);
    return acc;
  }, {} as Record<number, Question[]>);

  const pointValues = Object.keys(questionsByPoints)
    .map(Number)
    .sort((a, b) => a - b);

  const handleQuestionClick = (question: Question, blockKey: string) => {
    // Don't allow selecting already answered questions
    // Ensure question ID is always a string for comparison
    const questionId =
      typeof question._id === "string" ? question._id : String(question._id);
    if (answeredQuestionIds.has(questionId)) {
      console.warn(
        "Attempted to select already answered question:",
        questionId
      );
      return;
    }
    // Don't allow selecting from blocked blocks
    if (blockedBlocks.has(blockKey)) {
      console.warn("Attempted to select from blocked block:", blockKey);
      return;
    }
    onQuestionSelect?.(question, blockKey);
  };

  // Find the first unanswered question for a specific point value
  const getFirstUnansweredQuestion = (points: number): Question | null => {
    const questions = questionsByPoints[points];
    if (!questions || questions.length === 0) return null;
    // Find the first question that hasn't been answered
    // Ensure question IDs are compared as strings
    return (
      questions.find((q) => {
        const questionId = typeof q._id === "string" ? q._id : String(q._id);
        return !answeredQuestionIds.has(questionId);
      }) || null
    );
  };

  // Check if ALL questions with specific points are answered
  const areAllQuestionsAnswered = (points: number) => {
    const questions = questionsByPoints[points];
    if (!questions || questions.length === 0) return false;
    // Check if ALL questions for this point value are answered
    // Ensure question IDs are compared as strings
    return questions.every((q) => {
      const questionId = typeof q._id === "string" ? q._id : String(q._id);
      return answeredQuestionIds.has(questionId);
    });
  };

  useEffect(() => {
    console.log("Screen width:", window.innerWidth);
  }, []);

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto bg-[#FCCB97] rounded-xl",
        className
      )}
    >
      {/* Category Header */}

      {/* Main Card Body */}
      <div className="rounded-b-lg overflow-hidden">
        <div className="flex items-center justify-center">
          {/* Left Points Column */}
          <div className="border-r border-gray-300 flex flex-1 flex-col h-80 [@media(min-width:2160px)]:h-88">
            {pointValues.map((points) => {
              const question = getFirstUnansweredQuestion(points);
              const blockKey = `${data._id}-${points}-left`;
              const isBlocked = blockedBlocks.has(blockKey);
              const allAnswered = areAllQuestionsAnswered(points);
              const isDisabled = isBlocked || allAnswered || !question;
              return (
                <button
                  key={`left-${points}`}
                  onClick={() => {
                    if (question && !isBlocked)
                      handleQuestionClick(question, blockKey);
                  }}
                  disabled={isDisabled}
                  className={cn(
                    "flex flex-1 items-center justify-center border-b border-gray-300 last:border-b-0 transition-colors duration-200",
                    isDisabled
                      ? "bg-gray-400 opacity-50 cursor-not-allowed"
                      : "hover:bg-orange-200 cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "text-3xl font-extrabold",
                      isDisabled ? "text-gray-600 line-through" : "text-black"
                    )}
                  >
                    {points}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center - Category Image */}
          <div className="relative bg-[#CCE0F4]">
            <div className="w-70 h-80 rounded-lg [@media(min-width:2160px)]:w-80 [@media(min-width:2160px)]:h-100">
              <div className="flex flex-1 w-full h-full justify-center items-center">
                <Image
                  src={data.image}
                  alt={data.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
            <div className="bg-yellow-400 rounded-t-lg px-6 py-4 text-center w-full absolute top-0 left-0">
              <h1 className="text-2xl font-bold text-black">{data.name}</h1>
            </div>
          </div>

          {/* Right Points Column */}
          <div className="border-l border-gray-300 flex flex-1 flex-col h-80 [@media(min-width:2160px)]:h-88">
            {pointValues.map((points) => {
              const question = getFirstUnansweredQuestion(points);
              const blockKey = `${data._id}-${points}-right`;
              const isBlocked = blockedBlocks.has(blockKey);
              const allAnswered = areAllQuestionsAnswered(points);
              const isDisabled = isBlocked || allAnswered || !question;
              return (
                <button
                  key={`right-${points}`}
                  onClick={() => {
                    if (question && !isBlocked)
                      handleQuestionClick(question, blockKey);
                  }}
                  disabled={isDisabled}
                  className={cn(
                    "flex flex-1 items-center justify-center border-b border-gray-300 last:border-b-0 transition-colors duration-200",
                    isDisabled
                      ? "bg-gray-400 opacity-50 cursor-not-allowed"
                      : "hover:bg-orange-200 cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "text-3xl font-extrabold",
                      isDisabled ? "text-gray-600 line-through" : "text-black"
                    )}
                  >
                    {points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
