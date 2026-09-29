"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Instagram, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";

export default function SiteNavbar() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  const openBag = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("imc:open-bag"));
    }
  };

  const links = [
    ["home", "/#top"],
    ["shop", "/#collection"],
    ["our story", "/#story"],
    ["journal", "/#journal"],
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
            <Link key={label} href={href} className={"nav-link relative px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#211d19] transition-opacity hover:opacity-50 " + (label === "home" && pathname === "/" ? "nav-link-active" : "")}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <Link href="/#products" aria-label="Search" className="hidden p-2.5 transition-opacity hover:opacity-50 md:block"><Search size={18} strokeWidth={1.5} /></Link>
          <Link href="/account" aria-label="Account" className="hidden p-2.5 transition-opacity hover:opacity-50 md:block"><UserRound size={18} strokeWidth={1.5} /></Link>
          <Link href="/account#favourites" aria-label="Favourites" className="hidden p-2.5 transition-opacity hover:opacity-50 md:hidden"><Heart size={24} strokeWidth={1.6} /></Link>
          <button aria-label="Shopping bag" className="relative p-2.5 transition-opacity hover:opacity-50" onClick={openBag}>
            <ShoppingBag size={24} strokeWidth={1.6} />
          </button>
          <button aria-label={menu ? "Close menu" : "Open menu"} className="p-2.5 md:hidden" onClick={() => setMenu((open) => !open)}>
            {menu ? <X size={27} strokeWidth={1.6} /> : <Menu size={27} strokeWidth={1.6} />}
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
                ["favourites", "/account#favourites"],
                ["instagram", "https://www.instagram.com/inthemoodfor_candles"],
              ].map(([label, href]) => (
                <Link key={label} href={href} target={label === "instagram" ? "_blank" : undefined} rel={label === "instagram" ? "noreferrer" : undefined} onClick={() => setMenu(false)} className="border-b border-black/10 py-4 text-[12px] font-bold uppercase tracking-[.22em]">
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
