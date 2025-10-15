"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "login" | "register";
}

export default function LoginModal({
  isOpen,
  onClose,
  mode = "register",
}: LoginModalProps) {
  const [currentMode, setCurrentMode] = useState<"login" | "register">(mode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Update current mode when prop changes
  React.useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (currentMode === "register") {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError("كلمات المرور غير متطابقة");
          setIsLoading(false);
          return;
        }

        // Register API call
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.status) {
          // Registration successful
          console.log("Registration successful:", data);
          onClose(); // Close modal
          // You might want to show a success message or redirect
        } else {
          // Handle registration errors
          if (data.error === "alreadyTaken") {
            setError("البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل");
          } else if (
            data.error === "Password must be at least 6 characters long"
          ) {
            setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          } else {
            setError(data.error || "حدث خطأ أثناء التسجيل");
          }
        }
      } else {
        // Login API call
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe,
          }),
        });

        const data = await response.json();

        if (data.status) {
          // Login successful
          console.log("Login successful:", data);
          onClose(); // Close modal
          // You might want to redirect or update user state
          window.location.reload(); // Simple way to refresh the page
        } else {
          // Handle login errors
          if (data.error === "invalidEmailOrPassword") {
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
          } else if (data.error === "userNotVerified") {
            setError("الحساب غير مفعل، يرجى التحقق من بريدك الإلكتروني");
          } else {
            setError(data.error || "حدث خطأ أثناء تسجيل الدخول");
          }
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setError("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = () => {
    const newMode = currentMode === "login" ? "register" : "login";
    setCurrentMode(newMode);
    // Clear form when switching modes
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      rememberMe: false,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(""); // Clear any existing errors
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
          backgroundImage: "url('/register-bg.svg')",
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
        <div className="w-full max-w-md mx-4">
          <div
            className="rounded-xl p-8 border border-yellow-400/30"
            style={{
              background: "linear-gradient(180deg, #463636 0%, #2B2122 100%)",
            }}
          >
            {/* Close Button */}

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="لمة"
                width={120}
                height={40}
                className="h-12 w-auto"
                priority
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {currentMode === "register"
                ? "أنشأ حسابك و أبدأ المغامرة"
                : "مرحباً بك مرة أخرى"}
            </h2>

            {/* Subtitle */}
            <p className="text-gray-300 text-center mb-8 text-sm">
              {currentMode === "register"
                ? "من فضلك ادخل البيانات للدخول"
                : "سجل دخولك للمتابعة"}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center">
                  {error}
                </div>
              )}
              {currentMode === "register" && (
                <>
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-white text-sm font-medium"
                    >
                      اسم المستخدم
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="اسم المستخدم"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg"
                      required
                    />
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-white text-sm font-medium"
                >
                  البريد الالكتروني
                </Label>
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

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-white text-sm font-medium"
                >
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox - Only for login mode */}
              {currentMode === "login" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-yellow-400/50 rounded focus:ring-yellow-400 focus:ring-2"
                  />
                  <Label htmlFor="rememberMe" className="text-white text-sm">
                    تذكرني
                  </Label>
                </div>
              )}

              {/* Confirm Password Field - Only for register mode */}
              {currentMode === "register" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-white text-sm font-medium"
                  >
                    تأكيد كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: "2px 2px 10px 0px rgba(203, 161, 53, 1)",
                }}
              >
                {isLoading
                  ? "جاري التسجيل..."
                  : currentMode === "register"
                  ? "انشاء حساب"
                  : "تسجيل الدخول"}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-300 text-sm">
                {currentMode === "register"
                  ? "لديك حساب بالفعل ؟ "
                  : "ليس لديك حساب ؟ "}
                <button
                  onClick={handleModeSwitch}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors cursor-pointer"
                >
                  {currentMode === "register" ? "تسجيل الدخول" : "انشاء حساب"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
