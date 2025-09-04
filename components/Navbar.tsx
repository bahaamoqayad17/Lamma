"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, UserPlus } from "lucide-react";
import LoginModal from "@/components/modals/LoginModal";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigationItems = [
    { href: "/contact", label: "تواصل معنا" },
    { href: "/games", label: "الألعاب" },
    { href: "/faq", label: "الأسئلة الشائعة" },
    { href: "/how-we-work", label: "كيف نعمل" },
  ];

  return (
    <nav className="bg-transparent text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Right side for RTL */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="لمة"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-amber-200 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Login Button - Left side for RTL */}
          <div className="hidden md:flex items-center">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-500 font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              size="lg"
            >
              <UserPlus className="w-4 h-4" />
              تسجيل دخول
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-amber-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-amber-800/50 rounded-lg mt-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-amber-200 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  size="lg"
                >
                  <UserPlus className="w-4 h-4" />
                  تسجيل دخول
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login/Register Modal */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="login"
      />
    </nav>
  );
}
