import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const cairo = localFont({
  src: [
    {
      path: "../public/fonts/Cairo-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Cairo-Bold.ttf",
      weight: "700",
      style: "bold",
    },
    {
      path: "../public/fonts/Cairo-ExtraBold.ttf",
      weight: "800",
      style: "extrabold",
    },
    {
      path: "../public/fonts/Cairo-Black.ttf",
      weight: "900",
      style: "black",
    },
    {
      path: "../public/fonts/Cairo-SemiBold.ttf",
      weight: "600",
      style: "semibold",
    },
    {
      path: "../public/fonts/Cairo-Medium.ttf",
      weight: "600",
      style: "medium",
    },
    {
      path: "../public/fonts/Cairo-Light.ttf",
      weight: "300",
      style: "light",
    },
    {
      path: "../public/fonts/Cairo-ExtraLight.ttf",
      weight: "200",
      style: "extralight",
    },
  ],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Lamma",
  description: "Lamma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          backgroundImage: "url('/home-bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className={`${cairo.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
