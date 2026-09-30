"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SiteNavbar() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [bagCount, setBagCount] = useState(0);

  useEffect(() => {
    const update = (event?: Event) => {
      const detail = (event as CustomEvent<{ count?: number }> | undefined)?.detail;
      if (typeof detail?.count === "number") {
        setBagCount(detail.count);
        return;
      }
      try {
        const lines = JSON.parse(localStorage.getItem("imc-bag") || "[]");
        setBagCount(Array.isArray(lines) ? lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0) : 0);
      } catch {
        setBagCount(0);
      }
    };
    update();
    window.addEventListener("imc:bag-changed", update);
    return () => window.removeEventListener("imc:bag-changed", update);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const openBag = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("imc:open-bag"));
    }
  };

  const links = [
    ["home", "/#top"],
    ["collections", "/#products"],
    ["our story", "/#story"],
  ];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-[#211d19]/10 bg-[#f6f1e9]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 md:px-14">
        <Link href="/" className="flex items-center gap-3 text-left" onClick={() => setMenu(false)}>
          <Image src="/tm-logo.svg" alt="In The Mood Candles logo" width={56} height={56} priority unoptimized className="h-12 w-12 object-contain" />
          <span className="leading-none">
            <span className="serif block text-[15px] tracking-[.11em] sm:text-[17px]">IN THE MOOD</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.39em] text-[#776f67]">FOR CANDLES</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={"nav-link relative px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#211d19] transition-opacity hover:opacity-50 " + (label === "home" && pathname === "/" ? "nav-link-active" : "")}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 md:gap-0.5">
          <Link href="/#products" aria-label="Search" className="hidden p-2.5 transition-opacity hover:opacity-50 md:block"><Search size={18} strokeWidth={1.5} /></Link>
          <Link href="/account" aria-label="Account" className="hidden p-2.5 transition-opacity hover:opacity-50 md:block"><UserRound size={18} strokeWidth={1.5} /></Link>

          <Link href="/favourites" aria-label="Favourites" className="group hidden h-12 w-12 items-center justify-center rounded-full border border-[#211d19]/10 bg-white/40 shadow-[0_2px_12px_rgba(33,29,25,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_18px_rgba(33,29,25,0.1)] md:hidden">
            <Heart size={27} strokeWidth={1.55} className="transition-transform duration-200 group-hover:scale-105" />
          </Link>

          <button aria-label="Shopping bag" className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-[#211d19]/10 bg-white/40 shadow-[0_2px_12px_rgba(33,29,25,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_18px_rgba(33,29,25,0.1)]" onClick={openBag}>
            <ShoppingBag size={27} strokeWidth={1.55} className="transition-transform duration-200 group-hover:scale-105" />
            {bagCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#211d19] px-1 text-[9px] font-bold text-white shadow-sm">{bagCount}</span>}
          </button>

          <button aria-label={menu ? "Close menu" : "Open menu"} className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#211d19]/10 bg-white/40 shadow-[0_2px_12px_rgba(33,29,25,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_18px_rgba(33,29,25,0.1)] md:hidden" onClick={() => setMenu((open) => !open)}>
            {menu ? <X size={29} strokeWidth={1.55} className="transition-transform duration-200 group-hover:scale-105" /> : <Menu size={29} strokeWidth={1.55} className="transition-transform duration-200 group-hover:scale-105" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-black/10 bg-[#f6f1e9] md:hidden">
            <div className="flex flex-col px-5 py-4">
              {[
                ["shop", "/#collection"],
                ["our story", "/#story"],
                ["journal", "/#journal"],
                ["account", "/account"],
                ["favourites", "/favourites"],
                ["instagram", "https://www.instagram.com/inthemoodfor_candles"],
              ].map(([label, href]) => (
                <Link key={label} href={href} target={label === "instagram" ? "_blank" : undefined} rel={label === "instagram" ? "noreferrer" : undefined} onClick={() => setMenu(false)} className="border-b border-black/10 py-4 text-[12px] font-bold uppercase tracking-[.22em]">{label}</Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
