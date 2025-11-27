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
  onQuestionSelect?: (question: Question) => void;
  answeredQuestionIds?: Set<string>;
  className?: string;
}

export default function QuestionCard({
  data,
  onQuestionSelect,
  answeredQuestionIds = new Set(),
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

  const handleQuestionClick = (question: Question) => {
    // Don't allow selecting already answered questions
    // Ensure question ID is always a string for comparison
    const questionId =
      typeof question._id === "string" ? question._id : question._id.toString();
    if (answeredQuestionIds.has(questionId)) {
      console.warn(
        "Attempted to select already answered question:",
        questionId
      );
      return;
    }
    onQuestionSelect?.(question);
  };

  // Find the first unanswered question for a specific point value
  const getFirstUnansweredQuestion = (points: number): Question | null => {
    const questions = questionsByPoints[points];
    if (!questions || questions.length === 0) return null;
    // Find the first question that hasn't been answered
    // Ensure question IDs are compared as strings
    return (
      questions.find((q) => {
        const questionId = typeof q._id === "string" ? q._id : q._id.toString();
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
      const questionId = typeof q._id === "string" ? q._id : q._id.toString();
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
      <div className="bg-yellow-400 rounded-t-lg px-6 py-4 text-center w-full">
        <h1 className="text-3xl font-bold text-black">{data.name}</h1>
      </div>

      {/* Main Card Body */}
      <div className="rounded-b-lg overflow-hidden">
        <div className="flex items-center justify-center">
          {/* Left Points Column */}
          <div className="border-r border-gray-300 flex flex-1 flex-col h-65 [@media(min-width:2160px)]:h-88">
            {pointValues.map((points) => {
              const question = getFirstUnansweredQuestion(points);
              const allAnswered = areAllQuestionsAnswered(points);
              return (
                <button
                  key={`left-${points}`}
                  onClick={() => {
                    if (question) handleQuestionClick(question);
                  }}
                  disabled={allAnswered}
                  className={cn(
                    "flex flex-1 items-center justify-center border-b border-gray-300 last:border-b-0 transition-colors duration-200",
                    allAnswered
                      ? "bg-gray-400 opacity-50 cursor-not-allowed"
                      : "hover:bg-orange-200 cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "text-lg font-bold",
                      allAnswered ? "text-gray-600 line-through" : "text-black"
                    )}
                  >
                    {points}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center - Category Image */}
          <div className="flex items-center justify-center">
            <div className="w-70 h-65 rounded-lg flex items-center justify-center [@media(min-width:2160px)]:w-96 [@media(min-width:2160px)]:h-88">
              <Image
                src={data.image}
                alt={data.name}
                width={200}
                height={128}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Right Points Column */}
          <div className="border-l border-gray-300 flex flex-1 flex-col h-65 [@media(min-width:2160px)]:h-88">
            {pointValues.map((points) => {
              const question = getFirstUnansweredQuestion(points);
              const allAnswered = areAllQuestionsAnswered(points);
              return (
                <button
                  key={`right-${points}`}
                  onClick={() => {
                    if (question) handleQuestionClick(question);
                  }}
                  disabled={allAnswered}
                  className={cn(
                    "flex flex-1 items-center justify-center border-b border-gray-300 last:border-b-0 transition-colors duration-200",
                    allAnswered
                      ? "bg-gray-400 opacity-50 cursor-not-allowed"
                      : "hover:bg-orange-200 cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "text-lg font-bold",
                      allAnswered ? "text-gray-600 line-through" : "text-black"
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
