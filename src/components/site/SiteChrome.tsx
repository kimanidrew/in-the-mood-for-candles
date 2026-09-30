"use client";

import { usePathname } from "next/navigation";
import SiteNavbar from "./SiteNavbar";
import SiteFooter from "./SiteFooter";
import SiteBag from "./SiteBag";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <SiteNavbar />}
      {children}
      <SiteFooter />
      {!isAdmin && <SiteBag />}
    </>
  );
}
