import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[#f6f1e9] px-5 py-10 md:px-14">
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 border-t border-black/10 pt-7 text-[12px] font-semibold uppercase tracking-[.18em] md:flex-row">
        <span>© {new Date().getFullYear()} In The Mood For Candles</span>
        <div className="flex flex-wrap gap-5">
          <Link href="/moods" className="transition-opacity hover:opacity-50">Moods</Link>
          <Link href="/#products" className="transition-opacity hover:opacity-50">Shop</Link>
          <span>Made for slow moments</span>
        </div>
      </div>
    </footer>
  );
}
