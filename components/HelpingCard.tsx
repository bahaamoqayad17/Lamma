"use client";

import React, { useState } from "react";
import Image from "next/image";

type HelpingCardProps = {
  id: number;
  image: string;
  price: number;
  name: string;
  description: string;
  isAttack: boolean;
  isSelected: boolean;
  onSelect: () => void;
  canSelect: boolean;
};

export default function HelpingCard({
  id,
  image,
  price,
  name,
  description,
  isAttack,
  isSelected,
  onSelect,
  canSelect,
}: HelpingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-[#192734] border-2 rounded-xl text-center relative shadow-lg transition-all duration-200 ${
        isSelected
          ? "border-[#FCBB00] ring-4 ring-[#FCBB00] ring-opacity-50 scale-105 cursor-pointer"
          : canSelect
          ? "border-[#FDD835] hover:border-[#FCBB00] cursor-pointer"
          : "border-gray-600 opacity-40 cursor-not-allowed"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (canSelect || isSelected) {
          onSelect();
        }
      }}
    >
      {/* Main Content Area */}
      <div className="h-24 flex items-center justify-center">
        <Image
          src={image}
          alt={name}
          width={130}
          height={130}
          className="object-contain"
        />
      </div>

      {/* Question Mark Icon */}
      <div className="w-6 h-6 bg-[#FCBB00] rounded-full flex items-center justify-center absolute bottom-0 left-0">
        <span className="text-black text-xl font-bold">؟</span>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      )}

      {/* Bottom Section */}
      {/* Price */}
      <div className="px-2">
        <p className="text-white text-sm text-right mb-2 font-regular">
          {price}$
        </p>
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 mb-3 w-64 bg-[#1a1a1a] border-2 border-[#FDD835] rounded-lg shadow-2xl p-4 pointer-events-none animate-tooltip-fade-in">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#FDD835]"></div>
          <h3 className="text-[#FDD835] font-bold text-lg mb-2 text-center">
            {name}
          </h3>
          <p className="text-white text-sm mb-3 text-center leading-relaxed">
            {description}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isAttack ? "bg-red-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {isAttack ? "كرت هجومي" : "كرت دفاعي"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

