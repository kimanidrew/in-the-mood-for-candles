import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default async function MoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mood = await prisma.mood.findUnique({
    where: { slug },
    include: { products: { where: { status: "ACTIVE" }, include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!mood || !mood.isActive) notFound();

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-12 md:py-20">
        <div className="grid gap-8 overflow-hidden rounded-[2rem] bg-[#2a180f] text-[#f5eadf] md:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[360px] md:min-h-[500px]">{mood.imageUrl && <Image src={mood.imageUrl} alt={mood.name} fill unoptimized={mood.imageUrl.startsWith("data:image/")} className="object-cover"/>}<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/></div>
          <div className="flex flex-col justify-center p-8 md:p-14"><p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#d5b5a0]">A feeling, bottled</p><h1 className="serif mt-4 text-6xl leading-[.9] md:text-8xl">{mood.name}</h1><p className="mt-6 max-w-lg text-sm leading-7 text-white/70">Discover candles selected for this mood — scents designed to shape the atmosphere around you.</p><p className="mt-8 text-[10px] font-bold uppercase tracking-[.22em] text-[#d5b5a0]">{mood.products.length} candles</p></div>
        </div>
        <div className="mt-16 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">The candles</p><h2 className="serif mt-2 text-5xl md:text-6xl">Made for {mood.name.toLowerCase()} moments.</h2></div></div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {mood.products.map((product) => { const image=product.images[0]?.url || "/hero.jpg"; return <article key={product.id} className="group"><div className="relative aspect-[.82] overflow-hidden bg-[#e2d8cb]"><Image src={image} alt={product.name} fill unoptimized={image.startsWith("data:image/")} sizes="(max-width:640px) 100vw,(max-width:1024px)50vw,25vw" className="object-cover transition duration-700 group-hover:scale-[1.04]"/></div><div className="pt-4"><h3 className="serif text-2xl">{product.name}</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#9c5638]">{mood.name}</p><p className="mt-3 text-xs leading-5 text-[#776f67]">{product.shortDescription || product.description}</p></div></article>; })}
        </div>
      </section>
    </main>
  );
}
