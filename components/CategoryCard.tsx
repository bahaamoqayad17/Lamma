"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  image: string;
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  imageAlt?: string;
}

export default function CategoryCard({
  image,
  title,
  isSelected = false,
  onClick,
  className,
  imageAlt = "Category image",
}: CategoryCardProps) {
  return (
    <div
      className={cn(
        "relative w-full mx-auto cursor-pointer transition-all duration-200 hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      {/* Card Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        {/* Title Section */}
        <div
          className={cn(
            "px-4 py-3 text-center transition-colors duration-200",
            isSelected
              ? "bg-orange-200" // Light orange/peach background when selected
              : "bg-[#D5D5D5]" // Light gray background when not selected
          )}
        >
          <h3 className="text-lg font-medium text-gray-800 leading-tight">
            {title}
          </h3>
        </div>

        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    </div>
  );
}
