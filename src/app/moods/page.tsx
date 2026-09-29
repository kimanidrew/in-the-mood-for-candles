import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default async function MoodsPage() {
  const moods = await prisma.mood.findMany({
    where: { isActive: true },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f1e9]/90 px-5 backdrop-blur-xl md:px-12">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/tm-logo.svg" alt="In The Mood For Candles" width={48} height={48} unoptimized />
            <span className="serif text-[17px] tracking-[.1em]">IN THE MOOD</span>
          </Link>
          <Link href="/#collection" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-5 py-14 md:px-12 md:py-24">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#9c5638]">Shop by feeling</p>
          <h1 className="serif mt-4 text-6xl leading-[.88] md:text-8xl">
            Find your <span className="italic">mood.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[#776f67]">
            Explore every mood in the collection and discover candles created to bring a distinct feeling into your space.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {moods.map((mood, index) => {
            const image = mood.imageUrl || mood.products[0]?.images[0]?.url || "/hero.jpg";
            return (
              <Link
                key={mood.id}
                href={"/moods/" + mood.slug}
                className="group relative overflow-hidden bg-[#2a180f] text-[#f5eadf]"
              >
                <div className="relative aspect-[1.08] overflow-hidden">
                  <Image
                    src={image}
                    alt={mood.name}
                    fill
                    unoptimized={image.startsWith("data:image/")}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <p className="mb-2 text-[9px] font-bold uppercase tracking-[.25em] text-[#d5b5a0]">
                        {String(index + 1).padStart(2, "0")} · {mood.products.length ? "Candle mood" : "Explore"}
                      </p>
                      <h2 className="serif text-4xl">{mood.name}</h2>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 transition group-hover:bg-white group-hover:text-[#211d19]">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!moods.length && (
          <div className="mt-14 border border-black/10 bg-white/50 p-12 text-center">
            <p className="serif text-3xl">No moods available yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}
