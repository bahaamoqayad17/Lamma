import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Twitter, Facebook, Linkedin, Github, X } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    {
      href: "https://x.com",
      icon: X,
      label: "X (Twitter)",
    },
    {
      href: "https://twitter.com",
      icon: Twitter,
      label: "Twitter",
    },
    {
      href: "https://facebook.com",
      icon: Facebook,
      label: "Facebook",
    },
    {
      href: "https://linkedin.com",
      icon: Linkedin,
      label: "LinkedIn",
    },
    {
      href: "https://github.com",
      icon: Github,
      label: "GitHub",
    },
  ];

  return (
    <footer className="bg-[#FCBB00] text-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper Section - Logo and Social Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
          {/* Social Media Icons - Right side */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <Link
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-gray-600 transition-colors duration-200 p-2"
                  aria-label={social.label}
                >
                  <IconComponent className="w-5 h-5" />
                </Link>
              );
            })}
          </div>

          {/* Logo - Left side */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-footer.png"
                alt="لمة"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Divider Line - Full width */}
      <div className="border-t border-black w-full"></div>

      {/* Lower Section - Copyright */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <p className="text-center text-gray-800 font-medium">
            جميع الحقوق محفوظة لدى لمة
          </p>
        </div>
      </div>
    </footer>
  );
}
