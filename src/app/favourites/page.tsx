"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import ProductItem from "@/components/shop/ProductItem";

type FavoriteProduct = { id: string; name: string; slug: string; mood: string; images: { url: string }[]; shortDescription?: string | null; description?: string | null };
type FavoriteMood = { id: string; name: string; slug: string; imageUrl?: string | null };

export default function FavouritesPage() {
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [moods, setMoods] = useState<FavoriteMood[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/favorites", { cache: "no-store" });
      const data = await response.json();
      setAuthenticated(Boolean(data?.authenticated));
      setProducts(Array.isArray(data?.products) ? data.products : []);
      setMoods(Array.isArray(data?.moods) ? data.moods : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("imc:favourite-changed", refresh);
    return () => window.removeEventListener("imc:favourite-changed", refresh);
  }, []);

  if (loading) return <main className="min-h-screen bg-[#f6f1e9] px-5 py-16 md:px-12"><div className="mx-auto max-w-6xl"><div className="h-64 animate-pulse rounded-[2rem] bg-[#e9dfd4]" /></div></main>;

  if (!authenticated) return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-16 text-[#211d19] md:px-12 md:py-24">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-[#211d19] p-9 text-center text-[#f7f3ec] md:p-16">
        <Heart className="mx-auto text-[#d2a38c]" size={34} strokeWidth={1} />
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[.32em] text-[#d2a38c]">Your saved collection</p>
        <h1 className="serif mt-3 text-5xl md:text-7xl">Keep the scents you love.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/65">Sign in to save favourite candles and moods and find them again whenever you return.</p>
        <Link href="/account" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f6f1e9] px-6 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#211d19]">Sign in to favourites <ArrowRight size={14} /></Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-10 text-[#211d19] md:px-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#211d19] px-7 py-12 text-[#f7f3ec] md:px-14 md:py-16">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#d2a38c]">Your favourites</p>
            <h1 className="serif mt-3 text-5xl leading-[.9] md:text-7xl">A little collection of what feels like you.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">Candles and moods you have chosen to keep close.</p>
          </div>
          <Heart className="absolute -bottom-10 -right-4 h-44 w-44 text-white/[.04] md:h-64 md:w-64" strokeWidth={0.6} />
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Saved candles</p><h2 className="serif mt-2 text-4xl md:text-5xl">The ones you love.</h2></div>
            <span className="text-[10px] font-bold uppercase tracking-[.15em] text-[#776f67]">{products.length} saved</span>
          </div>
          {products.length ? (
            <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => <ProductItem key={product.id} product={{ id: product.id, name: product.name, slug: product.slug, mood: product.mood, img: product.images?.[0]?.url || "/hero.jpg", shortDescription: product.shortDescription, description: product.description }} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white/60 p-8 text-center">
              <p className="serif text-3xl">Nothing saved yet.</p>
              <p className="mt-2 text-sm text-[#776f67]">Tap the heart on a candle to add it to your collection.</p>
              <Link href="/#products" className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]">Explore candles <ArrowRight size={13} /></Link>
            </div>
          )}
        </section>

        <section className="mt-16 pb-12">
          <div className="flex items-end justify-between gap-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Saved moods</p><h2 className="serif mt-2 text-4xl md:text-5xl">Feel it again.</h2></div>
            <Link href="/moods" className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] sm:inline-flex">Explore moods <ArrowRight size={13} /></Link>
          </div>
          {moods.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moods.map((mood) => (
                <Link key={mood.id} href={"/moods/" + mood.slug} className="group relative min-h-[250px] overflow-hidden rounded-[1.75rem] bg-[#211d19]">
                  {mood.imageUrl ? <Image src={mood.imageUrl} alt={mood.name} fill unoptimized={mood.imageUrl.startsWith("data:image/")} className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-[#5a392a] to-[#211d19]" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-[9px] font-bold uppercase tracking-[.24em] text-[#d2a38c]">Favourite mood</p>
                    <h3 className="serif mt-1 text-4xl">{mood.name}</h3>
                  </div>
                  <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f1e9] text-[#9c5638]"><Heart size={17} fill="currentColor" strokeWidth={1.3} /></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white/60 p-8 text-center">
              <p className="serif text-3xl">No moods saved yet.</p>
              <p className="mt-2 text-sm text-[#776f67]">Open a mood and tap the heart in its banner.</p>
              <Link href="/moods" className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]">Browse moods <ArrowRight size={13} /></Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
