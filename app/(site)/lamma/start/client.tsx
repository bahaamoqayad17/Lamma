"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoryCard from "@/components/CategoryCard";
import HelpingCard from "@/components/HelpingCard";
import { ArrowLeft, LogOut, ArrowDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createLammaGame } from "@/actions/lamma-actions";
import { toast } from "react-toastify";
import helpingCardsData from "@/data/helping-cards.json";

// Type definition for category data structure
type Subcategory = {
  _id: string;
  name: string;
  image?: string;
};

type CategoryWithSubcategories = {
  _id: string;
  name: string;
  image?: string;
  subcategories: Subcategory[];
};

type HelpingCard = {
  id: number;
  image: string;
  price: number;
  name: string;
  description: string;
  isAttack: boolean;
};

const helpingCards: HelpingCard[] = helpingCardsData as HelpingCard[];

interface StartProps {
  data: CategoryWithSubcategories[] | null | undefined;
}

export default function Start({ data }: StartProps) {
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [teamOneSelectedCards, setTeamOneSelectedCards] = useState<number[]>(
    []
  );
  const [teamTwoSelectedCards, setTeamTwoSelectedCards] = useState<number[]>(
    []
  );
  const [playWithoutCards, setPlayWithoutCards] = useState(false);
  const [gameName, setGameName] = useState("");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const maxSelections = 6;
  const maxCardSelections = 5;
  const router = useRouter();

  // Ensure data is an array
  const categories = data || [];

  const handleCardClick = (subcategoryId: string) => {
    setSelectedSubcategories((prev) => {
      if (prev.includes(subcategoryId)) {
        // Remove if already selected
        return prev.filter((id) => id !== subcategoryId);
      } else if (prev.length < maxSelections) {
        // Add if under limit
        return [...prev, subcategoryId];
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

  // Get selected subcategory data
  const getSelectedSubcategoryData = (): Subcategory[] => {
    if (categories.length === 0) return [];
    const selected: Subcategory[] = [];

    categories.forEach((category) => {
      category.subcategories?.forEach((subcategory) => {
        if (selectedSubcategories.includes(subcategory._id)) {
          selected.push(subcategory);
        }
      });
    });

    return selected;
  };

  // Handle card selection for team one
  const handleTeamOneCardSelect = (cardId: number) => {
    setTeamOneSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else if (prev.length < maxCardSelections) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  // Handle card selection for team two
  const handleTeamTwoCardSelect = (cardId: number) => {
    setTeamTwoSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else if (prev.length < maxCardSelections) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  // Handle start game
  const handleStartGame = async () => {
    // Validation
    if (!gameName.trim()) {
      toast.error("يرجى إدخال اسم اللعبة");
      return;
    }

    if (!team1Name.trim()) {
      toast.error("يرجى إدخال اسم الفريق الأول");
      return;
    }

    if (!team2Name.trim()) {
      toast.error("يرجى إدخال اسم الفريق الثاني");
      return;
    }

    if (!playWithoutCards && selectedSubcategories.length === 0) {
      toast.error("يرجى اختيار فئات على الأقل");
      return;
    }

    if (
      !playWithoutCards &&
      selectedSubcategories.length < maxSelections &&
      !confirm(
        `تم اختيار ${selectedSubcategories.length} من ${maxSelections} فئات. هل تريد المتابعة؟`
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createLammaGame({
        name: gameName.trim(),
        team1Name: team1Name.trim(),
        team2Name: team2Name.trim(),
        selectedSubcategories,
        team1SelectedCards: teamOneSelectedCards,
        team2SelectedCards: teamTwoSelectedCards,
        playWithoutCards,
      });

      if (result.success) {
        toast.success("تم إنشاء اللعبة بنجاح");
        router.push(`/lamma/${result.data._id}`);
      } else {
        toast.error(result.message || "فشل إنشاء اللعبة");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("حدث خطأ أثناء إنشاء اللعبة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gray-100">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center gap-4 max-w-md mx-4">
            <Loader2 className="w-12 h-12 text-[#6A0DAD] animate-spin" />
            <h3 className="text-xl font-bold text-gray-800">
              جاري إنشاء اللعبة...
            </h3>
            <p className="text-gray-600 text-center">
              يرجى الانتظار بينما نقوم بإنشاء جلسة اللعبة الخاصة بك
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:px-10 sm:p-6 bg-[#55504C] backdrop-blur-sm">
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
      <div className="relative z-10 px-4 py-4 sm:py-6 md:py-8 md:px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Page Title Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
            فئات الاسئلة
          </h1>
          <div className="w-12 sm:w-16 h-1 bg-orange-400 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            اختر 6 من الفئات والتي ستكون الاسالة ضمن نطاقها
          </p>
        </div>

        {/* Categories Section */}
        {categories.length > 0 ? (
          <div className="mb-10 sm:mb-12 md:mb-16 space-y-8 sm:space-y-10 md:space-y-12">
            {categories.map((category) => (
              <div key={category._id} className="space-y-4 sm:space-y-6">
                {/* Category Title Section */}
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 px-2">
                    {category.name}
                  </h2>
                  <div className="w-10 sm:w-12 h-1 bg-orange-400 mx-auto"></div>
                </div>

                {/* Subcategories Grid */}
                {category.subcategories && category.subcategories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mx-auto">
                    {category.subcategories.map((subcategory) => (
                      <CategoryCard
                        key={subcategory._id}
                        image={
                          subcategory.image ||
                          category.image ||
                          "/seen-jeem.png"
                        }
                        title={subcategory.name}
                        isSelected={selectedSubcategories.includes(
                          subcategory._id
                        )}
                        onClick={() => handleCardClick(subcategory._id)}
                        imageAlt={`Subcategory ${subcategory.name}`}
                        className="w-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">لا توجد فئات فرعية</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">لا توجد فئات متاحة</p>
          </div>
        )}

        {/* Selection Counter */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-gray-600 px-2">
            تم اختيار {selectedSubcategories.length} من {maxSelections} فئات
          </p>
          {selectedSubcategories.length === maxSelections && (
            <p className="text-green-600 font-medium mt-2 text-sm sm:text-base px-2">
              تم الوصول للحد الأقصى من الفئات المختارة
            </p>
          )}
        </div>

        {/* Game Name Input Section */}
        <div className="max-w-md mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs sm:text-sm font-bold text-gray-800">
              اسم اللعبة
            </span>
            <span className="text-xs sm:text-sm text-gray-500">اقترح مسمى</span>
          </div>
          <Input
            type="text"
            placeholder="أدخل اسم اللعبة"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-200 border-2 border-yellow-400 rounded-lg text-gray-800 placeholder-gray-500 focus:border-yellow-500 transition-colors duration-200"
          />
        </div>

        {/* Team Setup Section */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
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
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:border-yellow-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Play Without Cards Checkbox */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-300 hover:border-[#6A0DAD] transition-colors duration-200 max-w-md mx-auto cursor-pointer shadow-md mx-4 sm:mx-auto">
          <input
            type="checkbox"
            id="playWithoutCards"
            checked={playWithoutCards}
            onChange={(e) => setPlayWithoutCards(e.target.checked)}
            className="w-4 h-4 sm:w-5 sm:h-5 text-[#6A0DAD] border-2 border-gray-400 rounded focus:ring-2 focus:ring-[#6A0DAD] focus:ring-offset-2 cursor-pointer"
          />
          <label
            htmlFor="playWithoutCards"
            className="text-gray-800 font-semibold text-sm sm:text-base cursor-pointer flex items-center gap-2"
          >
            <span className="text-base sm:text-lg">🎮</span>
            <span>العب بدون كروت القوة</span>
          </label>
        </div>

        {/* Power Cards Section */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Team One Power Cards */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 text-center">
                  اختر وسائل القوة المناسبة
                </h3>
                <div
                  className="text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-center"
                  style={{
                    backgroundColor: "rgba(106, 13, 173, 0.1)",
                  }}
                >
                  <span className="text-xs sm:text-sm font-medium text-[#6A0DAD]">
                    رصيدك 22$
                  </span>
                </div>
              </div>
              <div className="mb-2 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  تم اختيار {teamOneSelectedCards.length} من {maxCardSelections}{" "}
                  كروت
                </p>
                {teamOneSelectedCards.length === maxCardSelections && (
                  <p className="text-green-600 text-xs mt-1">
                    تم الوصول للحد الأقصى
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {helpingCards.map((card) => (
                  <HelpingCard
                    key={card.id}
                    id={card.id}
                    image={card.image}
                    price={card.price}
                    name={card.name}
                    description={card.description}
                    isAttack={card.isAttack}
                    isSelected={teamOneSelectedCards.includes(card.id)}
                    onSelect={() => handleTeamOneCardSelect(card.id)}
                    canSelect={
                      !playWithoutCards &&
                      (teamOneSelectedCards.length < maxCardSelections ||
                        teamOneSelectedCards.includes(card.id))
                    }
                  />
                ))}
              </div>
            </div>

            {/* Team Two Power Cards */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 text-center">
                  اختر وسائل القوة المناسبة
                </h3>
                <div
                  className="text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-center"
                  style={{
                    backgroundColor: "rgba(106, 13, 173, 0.1)",
                  }}
                >
                  <span className="text-xs sm:text-sm font-medium text-[#6A0DAD]">
                    رصيدك 22$
                  </span>
                </div>
              </div>
              <div className="mb-2 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  تم اختيار {teamTwoSelectedCards.length} من {maxCardSelections}{" "}
                  كروت
                </p>
                {teamTwoSelectedCards.length === maxCardSelections && (
                  <p className="text-green-600 text-xs mt-1">
                    تم الوصول للحد الأقصى
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {helpingCards.map((card) => (
                  <HelpingCard
                    key={card.id}
                    id={card.id}
                    image={card.image}
                    price={card.price}
                    name={card.name}
                    description={card.description}
                    isAttack={card.isAttack}
                    isSelected={teamTwoSelectedCards.includes(card.id)}
                    onSelect={() => handleTeamTwoCardSelect(card.id)}
                    canSelect={
                      !playWithoutCards &&
                      (teamTwoSelectedCards.length < maxCardSelections ||
                        teamTwoSelectedCards.includes(card.id))
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Match Button */}
        <div className="text-center space-y-3 sm:space-y-4 px-4 sm:px-0">
          <Button
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 sm:px-8 md:px-12 py-3 sm:py-4 text-base sm:text-lg transition-all duration-200 flex items-center gap-2 sm:gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            onClick={handleStartGame}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                جاري الإنشاء...
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              </>
            ) : (
              <>
                ابدأ المباراة
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </Button>

          {playWithoutCards && (
            <p className="text-xs sm:text-sm text-[#6A0DAD] font-medium max-w-md mx-auto px-2">
              سيتم بدء المباراة بدون اختيار أي كروت قوة
            </p>
          )}
        </div>
      </div>

      {/* Right Sidebar - Selected Subcategories - Only show when subcategories are selected */}
      {selectedSubcategories.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 md:top-20 bg-transparent p-2 md:h-[80vh] flex flex-col justify-between z-20 max-w-[90vw] md:max-w-none">
          {/* Scrollable subcategories */}
          <div className="space-y-2 sm:space-y-3 overflow-y-auto overflow-x-auto md:overflow-x-hidden flex-1 p-2 bg-white/95 backdrop-blur-sm md:bg-transparent flex flex-row md:flex-col rounded-lg shadow-lg md:shadow-none max-h-[120px] md:max-h-none">
            {getSelectedSubcategoryData().map((subcategory) => (
              <div
                key={subcategory?._id}
                className="relative w-[80px] sm:w-[100px] md:w-[150px] flex-shrink-0 md:flex-shrink"
              >
                <CategoryCard
                  image={subcategory?.image || ""}
                  title={subcategory?.name || ""}
                  isSelected={true}
                  onClick={() => handleCardClick(subcategory?._id || "")}
                  imageAlt={`Selected subcategory ${subcategory?.name}`}
                  className="w-full origin-center"
                />

                <div
                  onClick={() =>
                    setSelectedSubcategories((prev) =>
                      prev.filter((sId) => sId !== subcategory?._id)
                    )
                  }
                  className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors z-10"
                >
                  <span className="text-white text-sm sm:text-lg font-bold">
                    ×
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Arrow fixed below the scroll - Hidden on mobile */}
          <div className="hidden md:flex mt-4 justify-center">
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
