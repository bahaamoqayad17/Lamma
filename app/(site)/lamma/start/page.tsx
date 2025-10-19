"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoryCard from "@/components/CategoryCard";
import { ArrowLeft, LogOut, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Sample categories data
const politicsCategories = [
  { id: 1, title: "test1", image: "/seen-jeem.png" },
  { id: 2, title: "test2", image: "/seen-jeem.png" },
  { id: 3, title: "test3", image: "/seen-jeem.png" },
  { id: 4, title: "test4", image: "/seen-jeem.png" },
  { id: 5, title: "test5", image: "/seen-jeem.png" },
  { id: 6, title: "test6", image: "/seen-jeem.png" },
  { id: 7, title: "test7", image: "/seen-jeem.png" },
  { id: 8, title: "test8", image: "/seen-jeem.png" },
  { id: 9, title: "test9", image: "/seen-jeem.png" },
  { id: 10, title: "test10", image: "/seen-jeem.png" },
];

const seriesCategories = [
  { id: 11, title: "test11", image: "/seen-jeem.png" },
  { id: 12, title: "test12", image: "/seen-jeem.png" },
  { id: 13, title: "test13", image: "/seen-jeem.png" },
  { id: 14, title: "test14", image: "/seen-jeem.png" },
  { id: 15, title: "test15", image: "/seen-jeem.png" },
];

export default function Start() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]); // Pre-selected cards as shown in image
  const maxSelections = 5;
  const router = useRouter();
  const handleCardClick = (cardId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cardId)) {
        // Remove if already selected
        return prev.filter((id) => id !== cardId);
      } else if (prev.length < maxSelections) {
        // Add if under limit
        return [...prev, cardId];
      }
      // Do nothing if at limit
      return prev;
    });
  };

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  // Get selected category data
  const getSelectedCategoryData = () => {
    const allCategories = [...politicsCategories, ...seriesCategories];
    return selectedCategories
      .map((id) => allCategories.find((cat) => cat.id === id))
      .filter(Boolean);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gray-100">
      {/* Header */}
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

      {/* Main Content */}
      <div className="relative z-10 px-4 py-8 md:px-10">
        {/* Page Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            فئات الاسئلة
          </h1>
          <div className="w-16 h-1 bg-orange-400 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اختر 5 من الفئات والتي ستكون الاسالة ضمن نطاقها
          </p>
        </div>

        {/* Politics Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-800 text-center mb-8">
            سياسة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mx-auto">
            {politicsCategories.map((category) => (
              <CategoryCard
                key={category.id}
                image={category.image}
                title={category.title}
                isSelected={selectedCategories.includes(category.id)}
                onClick={() => handleCardClick(category.id)}
                imageAlt={`Politics category ${category.id}`}
                className="w-full"
              />
            ))}
          </div>
        </div>

        {/* Series Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-800 text-center mb-8">
            المسلسلات
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mx-auto">
            {seriesCategories.map((category) => (
              <CategoryCard
                key={category.id}
                image={category.image}
                title={category.title}
                isSelected={selectedCategories.includes(category.id)}
                onClick={() => handleCardClick(category.id)}
                imageAlt={`Series category ${category.id}`}
                className="w-full"
              />
            ))}
          </div>
        </div>

        {/* Selection Counter */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">
            تم اختيار {selectedCategories.length} من {maxSelections} فئات
          </p>
          {selectedCategories.length === maxSelections && (
            <p className="text-green-600 font-medium mt-2">
              تم الوصول للحد الأقصى من الفئات المختارة
            </p>
          )}
        </div>

        {/* Game Name Input Section */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-gray-800">اسم اللعبة</span>
            <span className="text-sm text-gray-500">اقترح مسمى</span>
          </div>
          <Input
            type="text"
            placeholder="أدخل اسم اللعبة"
            className="w-full px-4 py-3 bg-gray-200 border-2 border-yellow-400 rounded-lg text-gray-800 placeholder-gray-500 focus:border-yellow-500 transition-colors duration-200"
          />
        </div>

        {/* Team Setup Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team One */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">اقترح مسمى</span>
                <span className="text-sm font-bold text-gray-800">
                  اسم الفريق الأول
                </span>
              </div>
              <Input
                type="text"
                placeholder="أدخل اسم الفريق الأول"
                className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:border-yellow-500 transition-colors duration-200"
              />
            </div>

            {/* Team Two */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">اقترح مسمى</span>
                <span className="text-sm font-bold text-gray-800">
                  اسم الفريق الثاني
                </span>
              </div>
              <Input
                type="text"
                placeholder="أدخل اسم الفريق الثاني"
                className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:border-yellow-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Power Cards Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team One Power Cards */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  اختر وسائل القوة المناسبة
                </h3>
                <div
                  className="text-white px-4 py-2 rounded-full text-center mb-4"
                  style={{
                    backgroundColor: "rgba(106, 13, 173, 0.1)",
                  }}
                >
                  <span className="text-sm font-medium text-[#6A0DAD]">
                    رصيدك 22$
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:mx-16">
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-[#192734] border border-[#FDD835] rounded-xl text-center relative shadow-lg"
                  >
                    {/* Main Content Area */}
                    <div className="h-24 flex items-center justify-center">
                      <Image
                        src="/helping-card.png"
                        alt="Power Card"
                        width={130}
                        height={130}
                        className="object-contain"
                      />
                    </div>

                    {/* Question Mark Icon */}
                    <div className="w-6 h-6 bg-[#FCBB00] rounded-full flex items-center justify-center absolute bottom-0 left-0">
                      <span className="text-black text-xl font-bold">؟</span>
                    </div>

                    {/* Bottom Section */}
                    {/* Price */}
                    <div className="px-2">
                      <p className="text-white text-sm text-right mb-2 font-regular">
                        2.2$
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Two Power Cards */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  اختر وسائل القوة المناسبة
                </h3>
                <div
                  className="text-white px-4 py-2 rounded-full text-center mb-4"
                  style={{
                    backgroundColor: "rgba(106, 13, 173, 0.1)",
                  }}
                >
                  <span className="text-sm font-medium text-[#6A0DAD]">
                    رصيدك 22$
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:mx-16">
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-[#192734] border border-[#FDD835] rounded-xl text-center relative shadow-lg"
                  >
                    {/* Main Content Area */}
                    <div className="h-24 flex items-center justify-center">
                      <Image
                        src="/helping-card.png"
                        alt="Power Card"
                        width={130}
                        height={130}
                        className="object-contain"
                      />
                    </div>

                    {/* Question Mark Icon */}
                    <div className="w-6 h-6 bg-[#FCBB00] rounded-full flex items-center justify-center absolute bottom-0 left-0">
                      <span className="text-black text-xl font-bold">؟</span>
                    </div>

                    {/* Bottom Section */}
                    {/* Price */}
                    <div className="px-2">
                      <p className="text-white text-sm text-right mb-2 font-regular">
                        2.2$
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Match Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-12 py-4 text-lg transition-all duration-200 flex items-center gap-3 mx-auto"
            onClick={() => router.push("/lamma/in-game")}
          >
            ابدأ المباراة
            <ArrowLeft />
          </Button>
        </div>
      </div>

      {/* Right Sidebar - Selected Categories - Only show when categories are selected */}
      {selectedCategories.length > 0 && (
        <div className="fixed right-[50%] translate-x-1/2 md:translate-x-0 top-20 md:right-0 bg-transparent p-2 md:h-[80vh] flex flex-col justify-between z-20">
          {/* Scrollable categories */}
          <div className="space-y-3 overflow-y-auto overflow-x-hidden flex-1 p-2 bg-white flex rounded-lg md:block md:bg-transparent">
            {getSelectedCategoryData().map((category) => (
              <div key={category?.id} className="relative w-fit md:w-[200px]">
                <CategoryCard
                  image={category?.image || ""}
                  title={category?.title || ""}
                  isSelected={true}
                  onClick={() => handleCardClick(category?.id || 0)}
                  imageAlt={`Selected category ${category?.id}`}
                  className="w-full origin-center"
                />

                <div
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      prev.filter((cId) => cId !== category?.id)
                    )
                  }
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                >
                  <span className="text-white text-lg font-bold">×</span>
                </div>
              </div>
            ))}
          </div>

          {/* Arrow fixed below the scroll */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleScrollDown}
              className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <ArrowDown className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
