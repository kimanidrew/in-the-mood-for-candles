import Link from "next/link";
import { prisma } from "@/lib/prisma";

function SocialIcon({ platform }: { platform: string }) {
  const name = platform.toLowerCase();

  if (name.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.7" r="1" className="fill-current stroke-none" />
      </svg>
    );
  }

  if (name.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.7 0-4.5 1.6-4.5 4.6V10H7.6v3H10v8h4Z" />
      </svg>
    );
  }

  if (name.includes("tiktok")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M15.2 3c.2 1.8 1.2 3.2 3 3.8v2.5c-1.3-.1-2.4-.5-3.4-1.2v6.4a5.5 5.5 0 1 1-4.8-5.4v2.7a2.8 2.8 0 1 0 2.1 2.7V3h3.1Z" />
      </svg>
    );
  }

  return <span className="text-[9px] font-bold">↗</span>;
}

export default async function SiteFooter() {
  const socials = await prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, platform: true, label: true, url: true },
  });

  return (
    <footer className="bg-[#f6f1e9] px-5 py-10 md:px-14">
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-7 border-t border-black/10 pt-7 text-[12px] font-semibold uppercase tracking-[.18em] md:flex-row md:items-end">
        <div className="flex flex-col gap-4">
          <span>© {new Date().getFullYear()} In The Mood For Candles</span>
          {socials.length > 0 && (
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <Link
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label || social.platform}
                  title={social.label || social.platform}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/35 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#211d19] hover:text-[#f6f1e9]"
                >
                  <SocialIcon platform={social.platform} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/moods" className="transition-opacity hover:opacity-50">Moods</Link>
          <Link href="/#products" className="transition-opacity hover:opacity-50">Shop</Link>
          <span className="text-[#776f67]">Made for slow moments</span>
        </div>
      </div>
    </footer>
  );
}
