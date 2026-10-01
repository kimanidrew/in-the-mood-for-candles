"use client";

import { usePathname } from "next/navigation";
import SiteNavbar from "./SiteNavbar";
import SiteBag from "./SiteBag";

export default function SiteChromeClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <SiteNavbar />}
      {children}
      {!isAdmin && <SiteBag />}
    </>
  );
}
