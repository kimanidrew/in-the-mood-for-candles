import SiteFooter from "./SiteFooter";
import SiteChromeClient from "./SiteChromeClient";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteChromeClient>{children}</SiteChromeClient>
      <SiteFooter />
    </>
  );
}
