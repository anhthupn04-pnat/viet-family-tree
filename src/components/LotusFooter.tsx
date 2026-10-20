"use client";

import React from "react";
import { Flower2, ShieldCheck, Heart, Sparkles } from "lucide-react";

export default function LotusFooter() {
  return (
    <footer className="mt-16 relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] to-[#F7F3EA] border-t border-[#E8DEC7]">
      {/* 1. LIVELY STYLIZED VECTOR ILLUSTRATION: Blooming Pink Lotus Flowers & Layered Lotus Leaves over Rippling Waves */}
      <div className="w-full relative h-36 sm:h-48 overflow-hidden pointer-events-none select-none">
        <svg
          viewBox="0 0 1440 220"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients for Lotus Petals & Leaves */}
            <linearGradient id="lotusPinkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EC407A" />
              <stop offset="60%" stopColor="#F06292" />
              <stop offset="100%" stopColor="#F8BBD0" />
            </linearGradient>

            <linearGradient id="lotusCenterPetal" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#D81B60" />
              <stop offset="100%" stopColor="#F48FB1" />
            </linearGradient>

            <linearGradient id="jadeLeafDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E5F52" />
              <stop offset="100%" stopColor="#14463C" />
            </linearGradient>

            <linearGradient id="jadeLeafMedium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2B7A6A" />
              <stop offset="100%" stopColor="#1E5F52" />
            </linearGradient>

            <linearGradient id="jadeLeafLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3D9986" />
              <stop offset="100%" stopColor="#2B7A6A" />
            </linearGradient>

            <linearGradient id="waterWaveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="waterWaveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* SOFT RIPPLING WATER WAVES */}
          {/* Back Wave */}
          <path
            d="M0,130 C240,110 480,150 720,130 C960,110 1200,150 1440,130 L1440,220 L0,220 Z"
            fill="url(#waterWaveGrad1)"
          />
          {/* Middle Wave */}
          <path
            d="M0,150 C300,170 600,130 900,160 C1200,180 1350,150 1440,160 L1440,220 L0,220 Z"
            fill="url(#waterWaveGrad2)"
          />
          {/* Front Ripples */}
          <path
            d="M0,175 C200,165 400,185 600,175 C800,165 1000,185 1200,175 C1320,170 1400,180 1440,175 L1440,220 L0,220 Z"
            fill="#E6F4F1"
            opacity="0.9"
          />

          {/* LAYERED GREEN LOTUS LEAVES (Lá sen xanh ngọc bích xòe rộng) */}
          {/* Left Cluster of Lotus Leaves */}
          <ellipse cx="140" cy="170" rx="95" ry="32" fill="url(#jadeLeafDark)" />
          <ellipse cx="230" cy="180" rx="80" ry="26" fill="url(#jadeLeafMedium)" />
          <ellipse cx="80" cy="185" rx="70" ry="22" fill="url(#jadeLeafLight)" />
          {/* Leaf vein lines */}
          <path d="M140,170 L80,155 M140,170 L200,160 M140,170 L110,195 M140,170 L170,195" stroke="#3D9986" strokeWidth="1.2" opacity="0.6" fill="none" />

          {/* Center Cluster of Lotus Leaves */}
          <ellipse cx="680" cy="175" rx="120" ry="36" fill="url(#jadeLeafDark)" />
          <ellipse cx="810" cy="182" rx="95" ry="28" fill="url(#jadeLeafMedium)" />
          <ellipse cx="580" cy="185" rx="85" ry="26" fill="url(#jadeLeafLight)" />
          <path d="M680,175 L600,160 M680,175 L760,165 M680,175 L650,200 M680,175 L710,200" stroke="#3D9986" strokeWidth="1.2" opacity="0.6" fill="none" />

          {/* Right Cluster of Lotus Leaves */}
          <ellipse cx="1280" cy="172" rx="100" ry="32" fill="url(#jadeLeafDark)" />
          <ellipse cx="1180" cy="180" rx="85" ry="26" fill="url(#jadeLeafMedium)" />
          <ellipse cx="1360" cy="185" rx="75" ry="24" fill="url(#jadeLeafLight)" />

          {/* BLOOMING PINK LOTUS FLOWERS (Hoa sen hồng nở rộ) */}
          {/* Left Lotus Flower 1 */}
          <g transform="translate(190, 85)">
            {/* Outer Petals */}
            <path d="M0,50 C-40,25 -45,0 0,-30 C45,0 40,25 0,50 Z" fill="url(#lotusPinkGrad)" opacity="0.85" />
            <path d="M-10,50 C-55,30 -60,10 -35,-15 C-15,-5 -5,25 -10,50 Z" fill="url(#lotusPinkGrad)" />
            <path d="M10,50 C55,30 60,10 35,-15 C15,-5 5,25 10,50 Z" fill="url(#lotusPinkGrad)" />
            {/* Inner Petals */}
            <path d="M-5,48 C-35,32 -30,5 -15,-22 C-2,-10 2,25 -5,48 Z" fill="url(#lotusCenterPetal)" />
            <path d="M5,48 C35,32 30,5 15,-22 C2,-10 -2,25 5,48 Z" fill="url(#lotusCenterPetal)" />
            <path d="M0,45 C-15,20 -15,-10 0,-28 C15,-10 15,20 0,45 Z" fill="#FCE4EC" />
            {/* Golden Stamen (Nhụy sen vàng kim) */}
            <ellipse cx="0" cy="15" rx="9" ry="5" fill="#E0A926" />
            <circle cx="-4" cy="14" r="1.5" fill="#FFF59D" />
            <circle cx="0" cy="13" r="1.5" fill="#FFF59D" />
            <circle cx="4" cy="14" r="1.5" fill="#FFF59D" />
          </g>

          {/* Lotus Bud 1 (Búp sen vươn cao) */}
          <g transform="translate(320, 100)">
            <path d="M0,45 L0,15" stroke="#2B7A6A" strokeWidth="3" />
            <path d="M0,25 C-12,15 -12,-5 0,-20 C12,-5 12,15 0,25 Z" fill="url(#lotusCenterPetal)" />
            <path d="M-5,25 C-10,15 -6,0 0,-15" stroke="#2B7A6A" strokeWidth="1.5" fill="none" />
          </g>

          {/* Center Main Blooming Lotus Flower */}
          <g transform="translate(730, 60)">
            {/* Stem */}
            <path d="M0,75 L0,50" stroke="#1E5F52" strokeWidth="4" />
            {/* Back wide petals */}
            <path d="M-20,60 C-70,40 -80,10 -40,-20 C-15,-5 -5,35 -20,60 Z" fill="url(#lotusPinkGrad)" opacity="0.9" />
            <path d="M20,60 C70,40 80,10 40,-20 C15,-5 5,35 20,60 Z" fill="url(#lotusPinkGrad)" opacity="0.9" />
            {/* Middle Petals */}
            <path d="M-10,58 C-50,35 -50,-5 -20,-35 C-5,-15 5,30 -10,58 Z" fill="url(#lotusCenterPetal)" />
            <path d="M10,58 C50,35 50,-5 20,-35 C5,-15 -5,30 10,58 Z" fill="url(#lotusCenterPetal)" />
            {/* Center Standing Petal */}
            <path d="M0,55 C-25,25 -25,-20 0,-42 C25,-20 25,25 0,55 Z" fill="#F8BBD0" />
            <path d="M0,52 C-15,25 -15,-10 0,-32 C15,-10 15,25 0,52 Z" fill="#FFF" opacity="0.8" />
            {/* Golden Stamen */}
            <ellipse cx="0" cy="18" rx="12" ry="6" fill="#E0A926" />
            <circle cx="-6" cy="17" r="2" fill="#FFF9C4" />
            <circle cx="0" cy="16" r="2" fill="#FFF9C4" />
            <circle cx="6" cy="17" r="2" fill="#FFF9C4" />
          </g>

          {/* Right Lotus Flower 3 */}
          <g transform="translate(1220, 80)">
            <path d="M0,55 C-45,30 -50,5 0,-25 C50,5 45,30 0,55 Z" fill="url(#lotusPinkGrad)" opacity="0.85" />
            <path d="M-10,52 C-45,32 -40,10 -25,-12 C-10,-2 0,28 -10,52 Z" fill="url(#lotusCenterPetal)" />
            <path d="M10,52 C45,32 40,10 25,-12 C10,-2 0,28 10,52 Z" fill="url(#lotusCenterPetal)" />
            <path d="M0,48 C-18,22 -18,-8 0,-24 C18,-8 18,22 0,48 Z" fill="#FFF0F5" />
            <ellipse cx="0" cy="14" rx="8" ry="4" fill="#E0A926" />
          </g>

          {/* Right Lotus Bud 2 */}
          <g transform="translate(1080, 110)">
            <path d="M0,35 L0,15" stroke="#2B7A6A" strokeWidth="2.5" />
            <path d="M0,20 C-10,10 -10,-8 0,-18 C10,-8 10,10 0,20 Z" fill="url(#lotusCenterPetal)" />
          </g>
        </svg>
      </div>

      {/* 2. FOOTER CONTENT & BRAND METADATA */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-[#E8DEC7]/80 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-xs text-stone-600">
        {/* Brand & Cultural Quote */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1E5F52] to-[#2B7A6A] border-2 border-[#E0A926] text-[#FADB7F] font-serif font-black flex items-center justify-center text-base shadow-sm">
            GP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-bold text-stone-900 font-serif text-sm">
                Gia Phả Việt — VietFamilyTree
              </p>
              <span className="text-[10px] bg-[#FCE4EC] text-[#C62828] font-bold px-2 py-0.5 rounded-full border border-[#F06292]/40 flex items-center space-x-1">
                <Flower2 className="w-3 h-3 text-[#F06292]" />
                <span>Hương Sắc Hoa Sen</span>
              </span>
            </div>
            <p className="text-stone-500 text-[11px] mt-0.5 font-serif italic">
              “Cây có cội mới trổ cành xanh ngọn — Nước có nguồn mới bủa khắp rạch sông”
            </p>
          </div>
        </div>

        {/* System Badges & Account Info */}
        <div className="flex flex-wrap items-center gap-3 text-stone-500 text-[11px]">
          <span className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E5F52]" />
            <span>Admin: <strong className="text-stone-800">anhthuphan0102@gmail.com</strong></span>
          </span>
          <span className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E0A926]" />
            <span>Khởi tạo: <strong className="text-stone-800">4 chi họ mẫu ban đầu</strong></span>
          </span>
          <span className="flex items-center space-x-1 bg-emerald-50 text-[#1E5F52] px-2.5 py-1 rounded-xl border border-emerald-200 font-semibold shadow-2xs">
            <span>Ngăn chặn chu trình huyết thống</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
