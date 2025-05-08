"use client";
import React from "react";
import Header from "@/components/Header";
import BottomNavbar from "@/components/BottomNavbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Background wallpaper - not applying to homepage as it has its own */}
      <div 
        className="fixed inset-0 z-0 bg-[#14192E]"
        style={{
          backgroundImage: "url('/wallpepe.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.8
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-[#14192E]/70"></div>
      </div>
      
      <div className="relative z-0">
        <Header />
        
        <main className="relative z-10 pb-24 px-4 max-w-3xl mx-auto">
          {children}
        </main>
        
        <BottomNavbar />
      </div>
    </>
  );
}