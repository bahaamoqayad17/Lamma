"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus } from "lucide-react";

export default function Faq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const faqItems = [
    {
      id: "1",
      question: "هل يجب إنشاء حساب للعب؟",
      answer:
        "منصة ألعاب أونلاين متعددة تجمعك بأصدقائك ومنافسين من حول العالم. استعد لتجربة لعب جماعية مليئة بالإثارة، التحديات، والتواصل الحقيقي. كل لعبة هي مغامرة، وكل فوز هو إنجاز.",
    },
    {
      id: "2",
      question: "هل يجب إنشاء حساب للعب؟",
      answer:
        "منصة ألعاب أونلاين متعددة تجمعك بأصدقائك ومنافسين من حول العالم. استعد لتجربة لعب جماعية مليئة بالإثارة، التحديات، والتواصل الحقيقي. كل لعبة هي مغامرة، وكل فوز هو إنجاز.",
    },
    {
      id: "3",
      question: "هل يجب إنشاء حساب للعب؟",
      answer:
        "منصة ألعاب أونلاين متعددة تجمعك بأصدقائك ومنافسين من حول العالم. استعد لتجربة لعب جماعية مليئة بالإثارة، التحديات، والتواصل الحقيقي. كل لعبة هي مغامرة، وكل فوز هو إنجاز.",
    },
    {
      id: "4",
      question: "هل يجب إنشاء حساب للعب؟",
      answer:
        "منصة ألعاب أونلاين متعددة تجمعك بأصدقائك ومنافسين من حول العالم. استعد لتجربة لعب جماعية مليئة بالإثارة، التحديات، والتواصل الحقيقي. كل لعبة هي مغامرة، وكل فوز هو إنجاز.",
    },
    {
      id: "5",
      question: "هل يجب إنشاء حساب للعب؟",
      answer:
        "منصة ألعاب أونلاين متعددة تجمعك بأصدقائك ومنافسين من حول العالم. استعد لتجربة لعب جماعية مليئة بالإثارة، التحديات، والتواصل الحقيقي. كل لعبة هي مغامرة، وكل فوز هو إنجاز.",
    },
  ];

  const toggleItem = (itemId: string) => {
    setOpenItem(openItem === itemId ? null : itemId);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" id="faq">
      <div className="container mx-auto max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            الأسئلة الشائعة
          </h2>
          <div className="w-16 h-0.5 bg-yellow-400 mx-auto"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative flex items-center border border-gray-400 rounded-full overflow-hidden px-2">
            {/* Search Button - Left Side */}

            {/* Input Field - Right Side */}
            <input
              type="text"
              placeholder="ابحث عن سؤالك"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-8 py-3 text-right border-0 outline-none"
            />

            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2 border-0"
              size={"lg"}
              style={{
                boxShadow: "none",
              }}
            >
              <Search className="w-5 h-5" />
              ابحث
            </Button>
          </div>
        </div>

        {/* Custom FAQ Accordion */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openItem === item.id;

            return (
              <div
                key={item.id}
                className="rounded-lg overflow-hidden border border-[#FCCB97]"
                style={{
                  background: `linear-gradient(180deg, rgba(252, 203, 151, 0.3) 0%, rgba(252, 203, 151, 0) 100%)`,
                }}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-opacity-80 transition-all duration-200"
                >
                  <span className="text-white font-medium text-lg flex-1 mr-4">
                    {item.question}
                  </span>
                  <div className="flex items-center justify-center w-6 h-6">
                    {isOpen ? (
                      <Minus className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-white" />
                    )}
                  </div>
                </button>

                {/* Answer Content */}
                {isOpen && (
                  <div className="px-6 py-4 border-t border-white/20">
                    <p className="text-white leading-relaxed text-right">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
