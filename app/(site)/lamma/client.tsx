"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import NextLink from "next/link";
import { Menu, X, Play } from "lucide-react";
import Image from "next/image";

export default function Lamma({
  categories,
  mainCategories,
}: {
  categories: any;
  mainCategories: any;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main>
      {/* Navbar */}
      <nav className="bg-[#4F4C45] border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Right side (RTL) */}
            <div className="flex items-center gap-6">
              <NextLink href="/lamma" className="flex items-center">
                <Image src="/logo.png" alt="لمة" width={90} height={90} />
              </NextLink>

              {/* Desktop Buttons - Left side (RTL) */}
              <div className="hidden lg:flex items-center gap-6">
                <Button
                  className="bg-[#251B1A] hover:bg-[#333333] text-white rounded-2xl px-4 py-2 text-lg font-medium transition-colors"
                  asChild
                  style={{
                    boxShadow: "none",
                  }}
                >
                  <NextLink href="/lamma/buy">شراء الالعاب</NextLink>
                </Button>
                <Button
                  className="bg-[#251B1A] hover:bg-[#333333] text-white rounded-2xl px-8 py-2 text-lg font-medium transition-colors shadow-none"
                  asChild
                  style={{
                    boxShadow: "none",
                  }}
                >
                  <NextLink href="/lamma/my-games">ألعابي</NextLink>
                </Button>
              </div>
            </div>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <NextLink
                href="/lamma"
                className="text-yellow-400 font-bold text-lg hover:text-yellow-300 transition-colors"
              >
                الرئيسية
              </NextLink>
              <NextLink
                href="/lamma/about"
                className="text-white font-bold text-lg hover:text-yellow-400 transition-colors"
              >
                عن اللعبه
              </NextLink>
              <NextLink
                href="/lamma/contact"
                className="text-white font-bold text-lg hover:text-yellow-400 transition-colors"
              >
                تواصل معنا
              </NextLink>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-700 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-3">
                <NextLink
                  href="/lamma"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-yellow-400 font-medium text-base px-2 py-1 hover:bg-gray-700 rounded transition-colors"
                >
                  الرئيسية
                </NextLink>
                <NextLink
                  href="/lamma/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white font-medium text-base px-2 py-1 hover:bg-gray-700 rounded transition-colors"
                >
                  عن اللعبه
                </NextLink>
                <NextLink
                  href="/lamma/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white font-medium text-base px-2 py-1 hover:bg-gray-700 rounded transition-colors"
                >
                  تواصل معنا
                </NextLink>
              </div>

              {/* Mobile Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  className="bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors w-full"
                  asChild
                >
                  <NextLink
                    href="/lamma/buy"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    شراء الالعاب
                  </NextLink>
                </Button>
                <Button
                  className="bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors w-full"
                  asChild
                >
                  <NextLink
                    href="/lamma/start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    العب الان
                  </NextLink>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="bg-[#EFE8CE] relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full">
            <div className="w-full flex flex-col justify-center space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                <span className="text-black">لعبة لمّه :</span>{" "}
                <span className="text-[#D4AF37]">
                  الجمعة ما تحلى إلا بتحدي!
                </span>
              </h1>

              <p className="text-xl md:text-3xl font-medium text-black">
                6 فئات متنوعة, اسأله حماسيه !
              </p>
            </div>
            <Image
              src="/lamma.png"
              alt="People playing Lamma game"
              width={500}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="bg-[#251B1A] py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#D9A428] text-center mb-12 md:mb-16">
            كيف نظام اللعبة؟
          </h2>

          {/* Three Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            {/* Step 1: Choose Categories */}
            <div className="flex flex-col items-center text-center justify-between">
              <div className="flex justify-center mb-2">
                <Image
                  src="/categories.png"
                  alt="Categories"
                  width={140}
                  height={120}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  1 - اختر الفئات
                </h3>
                <p className="text-base md:text-lg text-white/90">
                  اختر 6 فئات من العديد من الفئات المناسبه للجميع
                </p>
              </div>
            </div>

            {/* Step 2: Answer Questions */}
            <div className="flex flex-col items-center text-center justify-between h-full">
              <div className="flex justify-center mb-2">
                <Image
                  src="/cards.png"
                  alt="Cards"
                  width={180}
                  height={120}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  2 - جاوب على الأسئله
                </h3>
                <p className="text-base md:text-lg text-white/90 max-w-sm">
                  كل ما زاد النقاط زادت الصعوبه !
                </p>
              </div>
            </div>

            {/* Step 3: Top the Points */}
            <div className="flex flex-col items-center text-center justify-between h-full">
              <div className="flex justify-center mb-2">
                <Image
                  src="/cup.png"
                  alt="Trophy Cup"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  3 - تصدر النقاط !
                </h3>
                <p className="text-base md:text-lg text-white/90">
                  جمع أعلى نقاط لتفوز باللعبة
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorial & Categories Section */}
      <section className="bg-[#EFE8CE] py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Video Tutorial Section */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#251B1A] text-center mb-8">
              شرح كيف تلعب اللعبة !
            </h2>
            <div className="relative w-full max-w-4xl mx-auto aspect-video bg-[#383838] rounded-lg overflow-hidden flex items-center justify-center">
              {/* Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#D9A428] transition-colors shadow-lg">
                  <Play className="w-10 h-10 text-[#251B1A] ml-1" />
                </div>
              </div>
              {/* Placeholder for video thumbnail/background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 opacity-50"></div>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#251B1A] text-center mb-8 md:mb-12">
              أقسامنا الرهيبة
            </h2>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10">
              {mainCategories &&
                mainCategories.length > 0 &&
                mainCategories.map((category: any) => (
                  <div
                    key={category._id?.toString() || category.id}
                    className="bg-[#CCE0F4] rounded-2xl p-4 border-5 border-[#D9A428] hover:border-[#D9A428] transition-all hover:shadow-lg flex flex-col items-center justify-center gap-3 min-h-[200px] flex-[0_1_calc(45%-0.75rem)] sm:flex-[0_1_calc(28%-1rem)] md:flex-[0_1_calc(18%-1.25rem)]"
                  >
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name || "Category"}
                        width={240}
                        height={240}
                        className="object-contain"
                      />
                    ) : (
                      <Image
                        src="/lofi.png"
                        alt={category.name || "Category"}
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    )}
                    <h3 className="text-lg md:text-xl font-bold text-[#251B1A] text-center">
                      {category.name || "Category"}
                    </h3>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why to Play Section */}
      <section className="bg-[#251B1A] py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#D9A428] text-center mb-12 md:mb-16">
            ليش تختار ‘لمّه’؟
          </h2>

          {/* Three Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            {/* Step 1: Choose Categories */}
            <div className="flex flex-col items-center text-center justify-between">
              <div className="flex justify-center mb-2">
                <Image
                  src="/points.png"
                  alt="Categories"
                  width={150}
                  height={120}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  واجهة سهلة
                </h3>
                <p className="text-base md:text-lg text-white/90">
                  واجهة سلسه وسهلة الإستخدام
                </p>
              </div>
            </div>

            {/* Step 2: Answer Questions */}
            <div className="flex flex-col items-center text-center justify-between h-full">
              <div className="flex justify-center mb-2">
                <Image
                  src="/brain.png"
                  alt="Cards"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  اسألة ذهنية
                </h3>
                <p className="text-base md:text-lg text-white/90 max-w-sm">
                  اسأله ممتعه وتنافسيه بجميع المجالات
                </p>
              </div>
            </div>

            {/* Step 3: Top the Points */}
            <div className="flex flex-col items-center text-center justify-between h-full">
              <div className="flex justify-center mb-2">
                <Image
                  src="/group.png"
                  alt="Trophy Cup"
                  width={150}
                  height={120}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  لعبة جماعية
                </h3>
                <p className="text-base md:text-lg text-white/90">
                  لعبه تجمع بين الأهل والأصدقاء في اجواء ممتعه
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Categories Section */}
      {categories && categories.length > 0 && (
        <section className="bg-[#EFE8CE] py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#251B1A] text-center mb-12 md:mb-16">
              فئات جديدة !
            </h2>

            {/* Category Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 w-full">
              {categories.map((parentCategory: any) => (
                <div
                  key={parentCategory._id?.toString()}
                  className="flex flex-col items-center w-full"
                >
                  {/* Parent Category Heading */}
                  <h3 className="text-2xl md:text-3xl font-bold text-[#251B1A] mb-6 md:mb-8">
                    {parentCategory.name}
                  </h3>

                  {/* Subcategories Grid */}
                  {parentCategory.subcategories &&
                    parentCategory.subcategories.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10 w-full">
                        {parentCategory.subcategories.map(
                          (subcategory: any) => (
                            <div
                              key={subcategory._id?.toString()}
                              className="bg-[#CCE0F4] rounded-2xl p-4 border-5 border-[#D9A428] hover:border-[#D9A428] transition-all hover:shadow-lg flex flex-col items-center justify-center gap-3 min-h-[200px] flex-[0_1_calc(50%-0.75rem)] sm:flex-[0_1_calc(45%-1rem)] md:flex-[0_1_calc(30%-1.25rem)]"
                            >
                              {subcategory.image ? (
                                <Image
                                  src={subcategory.image}
                                  alt={subcategory.name || "Category"}
                                  width={240}
                                  height={240}
                                  className="object-contain"
                                />
                              ) : (
                                <Image
                                  src="/lofi.png"
                                  alt={subcategory.name || "Category"}
                                  width={120}
                                  height={120}
                                  className="object-contain"
                                />
                              )}
                              <h4 className="text-lg md:text-xl font-bold text-[#251B1A] text-center">
                                {subcategory.name || "Category"}
                              </h4>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col items-center justify-center gap-8 py-16 bg-[#CE991A]">
        <h1 className="text-center text-4xl font-bold text-[#251B1A]">
          جاهز للعب؟ ابدأ اللعب الآن!
        </h1>
        <Button className="bg-[#251B1A] hover:bg-[#333333] text-[#CE991A] rounded-4xl p-8 py-6 text-2xl font-bold transition-colors shadow-none">
          <NextLink href="/lamma/start">ابدأ العب الآن</NextLink>
        </Button>
      </div>

      <footer className="bg-[#4F4C45] border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center w-full py-8">
            <Image src="/logo.png" alt="لمة" width={120} height={120} />
          </div>
        </div>
      </footer>
    </main>
  );
}
