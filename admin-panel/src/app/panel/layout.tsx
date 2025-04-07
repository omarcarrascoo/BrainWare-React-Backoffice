"use client"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Sidebar from "@/components/side-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className="flex h-screen">
          {/* Sidebar takes fixed width */}
          <Sidebar />
          {/* Main content takes the rest */}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
  );
}
