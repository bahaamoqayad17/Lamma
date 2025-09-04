"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, RefreshCw } from "lucide-react";
import Link from "@/icons/Link";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Contact form submitted:", formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative max-w-3xl w-full h-[83%] flex items-center justify-center"
        style={{
          backgroundImage: "url('/contact-bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-10 cursor-pointer w-8 h-8 bg-[#FCCB97] hover:bg-yellow-500 rounded-lg flex items-center justify-center transition-colors duration-200 z-10"
        >
          <X className="w-5 h-5 text-gray-900" />
        </button>

        {/* Inner Box with Form - Centered */}
        <div className="w-full max-w-2xl mx-4">
          <div className="rounded-xl p-8">
            {/* Header Text */}
            <div className="text-center mb-8">
              <p className="text-white text-sm mb-2">لنبقى على اتصال</p>
              <h2 className="text-2xl font-bold text-white">
                نحن هنا لمساعدتك والإجابة على استفساراتك في أي وقت
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="firstName"
                      className="text-white text-sm font-medium"
                    >
                      الاسم الأول
                    </Label>
                    <span className="text-yellow-400 text-lg">☆</span>
                  </div>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="الاسم الأول"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="lastName"
                      className="text-white text-sm font-medium"
                    >
                      الاسم الأول
                    </Label>
                    <span className="text-yellow-400 text-lg">☆</span>
                  </div>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="الاسم الأول"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="email"
                    className="text-white text-sm font-medium"
                  >
                    البريد الالكتروني
                  </Label>
                  <span className="text-green-400 text-lg">○</span>
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example12@123.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg"
                  required
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="message"
                    className="text-white text-sm font-medium"
                  >
                    الرسالة
                  </Label>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="اكتب رسالتك هنا..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
                style={{
                  boxShadow: "2px 2px 10px 0px rgba(203, 161, 53, 1)",
                }}
              >
                <Link />
                ارسال
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
