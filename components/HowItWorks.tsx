"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Step1 from "@/icons/Step1";
import Step2 from "@/icons/Step2";
import Step3 from "@/icons/Step3";
import Link from "@/icons/Link";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "سجل دخولك وابدأ رحلتك",
      icon: Step1,
      description:
        "أنشئ حسابك بسرعة وسهولة، ادخل عالم الألعاب الجماعية. كل ما تحتاجه هو البريد الإلكتروني واسم المستخدم - سهل وسريع.",
      buttonText: "تسجيل دخول",
      buttonIcon: Link,
    },
    {
      number: 2,
      title: "جرب أول لعبة مجانا",
      icon: Step3,
      description:
        "اختر لعبتك المفضلة وابدأ اللعب فوراً بدون رسوم. اكتشف الأجواء، تواصل مع اللاعبين، واستمتع بالإثارة.",
      buttonText: "العب الان",
      buttonIcon: Link,
    },
    {
      number: 3,
      title: "اشترك وواصل اللعب",
      icon: Step2,
      description:
        "بعد التجربة المجانية الأولى، افتح جميع الألعاب الجماعية والميزات الحصرية باشتراك بسيط. استمتع بالتحديات المستمرة والمكافآت.",
      buttonText: "اشترك الان",
      buttonIcon: Link,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-start relative w-full">
          {/* Right Side - Title and Third Step */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right">
            {/* Title Section */}
            <div className="relative mb-8 flex items-center gap-2">
              <Image src="/help.png" alt="title" width={100} height={100} />
              <h2 className="text-4xl font-bold text-white mb-4">كيف نعمل ؟</h2>
            </div>

            {/* Third Step Card - Centered on Right Side */}
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              {/* Step Card */}
              <Card
                style={{
                  backgroundColor: "rgba(252, 203, 151, 0.1)",
                  boxShadow: "6px 6px 10px 0 rgba(252, 203, 151, 0.3)",
                }}
                className="border-2 border-[#FCCB97] flex flex-col justify-center items-center"
              >
                <CardHeader className="">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                    <Step2 />
                    {steps[2].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p className="text-gray-300 leading-relaxed">
                    {steps[2].description}
                  </p>
                </CardContent>

                <Button
                  size={"lg"}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-2 transition-all duration-200 flex items-center gap-2 w-fit"
                  style={{
                    boxShadow: "2px 2px 10px 0px rgba(203, 161, 53, 1)",
                  }}
                >
                  <Link />
                  {steps[2].buttonText}
                </Button>
              </Card>
            </div>
          </div>
          {/* Connecting Line - Between the two columns */}
          <div
            className="h-full hidden lg:block"
            style={{
              backgroundImage: "url('/steps.png')",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
          {/* Steps Section - Left Side */}
          <div className="relative">
            {/* Steps */}
            <div className="space-y-8">
              {steps.slice(0, 2).map((step, index) => {
                const IconComponent = step.icon;
                const ButtonIconComponent = step.buttonIcon;

                return (
                  <div key={step.number} className="relative">
                    {/* Step Card */}
                    <Card
                      style={{
                        backgroundColor: "rgba(252, 203, 151, 0.1)",
                        boxShadow: "6px 6px 10px 0 rgba(252, 203, 151, 0.3)",
                      }}
                      className="border-2 border-[#FCCB97] flex flex-col justify-center items-center"
                    >
                      <CardHeader className="">
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                          <IconComponent />
                          {step.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-center">
                        <p className="text-[#D5D5D5] font-medium leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>

                      <Button
                        size={"lg"}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-2 transition-all duration-200 flex items-center gap-2 w-fit"
                      >
                        <ButtonIconComponent />
                        {step.buttonText}
                      </Button>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
