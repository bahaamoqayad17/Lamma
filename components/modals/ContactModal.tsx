"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import Link from "@/icons/Link";
import { createContact } from "@/actions/contact-actions";
import { toast } from "react-toastify";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "الموضوع مطلوب";
    }

    if (!formData.message.trim()) {
      newErrors.message = "الرسالة مطلوبة";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "الرسالة يجب أن تكون أكثر من 10 أحرف";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsSubmitting(true);

    try {
      await createContact(formData);

      toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً");

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setErrors({});

      // Close modal after successful submission
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        onClose();
      }, 800);
    }
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
        className="relative max-w-3xl w-full h-full md:h-[83%] flex items-center justify-center"
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
              {/* Name Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="name"
                    className="text-white text-sm font-medium mb-0"
                  >
                    الاسم الكامل
                  </Label>
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="الاسم الكامل"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="subject"
                    className="text-white text-sm font-medium mb-0"
                  >
                    الموضوع
                  </Label>
                </div>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="موضوع الرسالة"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg ${
                    errors.subject ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.subject && (
                  <p className="text-red-400 text-sm">{errors.subject}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="email"
                    className="text-white text-sm font-medium mb-0"
                  >
                    البريد الإلكتروني
                  </Label>
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="message"
                    className="text-white text-sm font-medium mb-0"
                  >
                    الرسالة
                  </Label>
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="اكتب رسالتك هنا..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                    errors.message ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.message && (
                  <p className="text-red-400 text-sm">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: "2px 2px 10px 0px rgba(203, 161, 53, 1)",
                }}
              >
                <Link />
                {isSubmitting ? "جاري الإرسال..." : "إرسال"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
