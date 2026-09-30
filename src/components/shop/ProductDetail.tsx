"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { dbText } from "@/lib/db-text";

type ProductImage = { id: string; url: string; alt: string | null };
type Product = {
  id: string; name: string; slug: string; mood: string | null;
  description: string; shortDescription: string | null; category: string;
  priceUSD: number; stock: number; sizeLabel: string | null; waxType: string | null;
  wickType: string | null; burnTimeHours: number | null; scentFamily: string | null;
  scentIntensity: string | null; topNotes: string | null; middleNotes: string | null;
  baseNotes: string | null; ingredients: string | null; allergens: string | null;
  careInstructions: string | null; vesselMaterial: string | null; vesselColor: string | null;
  dimensions: string | null; netWeight: string | null; featured: boolean;
  images: ProductImage[];
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return <div className="border-t border-[#211d19]/10 py-4"><dt className="text-[9px] font-bold uppercase tracking-[.22em] text-[#9c5638]">{label}</dt><dd className="mt-1 whitespace-pre-line text-sm leading-6 text-[#4e4640]">{dbText(String(value))}</dd></div>;
}

export default function ProductPage({ product }: { product: Product }) {
  const images = product.images.length ? product.images : [{ id: "fallback", url: "/hero.jpg", alt: product.name }];
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/favorites", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => {
      if (Array.isArray(d?.favoriteProductIds)) setFavorite(d.favoriteProductIds.includes(product.id));
    }).catch(() => {});
  }, [product.id]);

  const addToBag = () => {
    setAdding(true);
    for (let i = 0; i < quantity; i++) {
      window.dispatchEvent(new CustomEvent("imc:add-to-bag", { detail: { product: {
        id: product.id, name: product.name, slug: product.slug, mood: product.mood || "",
        img: images[0].url, priceUSD: product.priceUSD
      }}}));
    }
    setTimeout(() => setAdding(false), 700);
  };

  const toggleFavorite = async () => {
    const response = await fetch("/api/favorites", {
      method: favorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product", id: product.id }),
    });
    if (response.status === 401) { window.location.href = "/account"; return; }
    if (response.ok) setFavorite(v => !v);
  };

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-8 md:px-12 md:pb-32 md:pt-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#776f67] hover:text-[#9c5638]"><ArrowLeft size={14}/> Back to shop</Link>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="lg:sticky lg:top-[110px] lg:self-start">
            <div className="relative aspect-[.9] overflow-hidden bg-[#e2d8cb] md:aspect-square">
              <Image src={images[selected].url} alt={images[selected].alt || product.name} fill priority unoptimized={images[selected].url.startsWith("data:image/")} className="object-cover"/>
              {product.mood && <div className="absolute left-5 top-5 bg-[#f6f1e9]/90 px-4 py-2 text-[9px] font-bold uppercase tracking-[.2em]">{dbText(product.mood)}</div>}
            </div>
            {images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-3">{images.map((image, i) => <button key={image.id} onClick={() => setSelected(i)} className={"relative aspect-square overflow-hidden " + (i === selected ? "ring-2 ring-[#211d19]" : "opacity-65 hover:opacity-100")}><Image src={image.url} alt={image.alt || product.name} fill unoptimized={image.url.startsWith("data:image/")} className="object-cover"/></button>)}</div>}
          </div>

          <div className="flex flex-col justify-center py-2 lg:py-10">
            <p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#9c5638]">{dbText(product.category)}</p>
            <div className="mt-4 flex items-start justify-between gap-5">
              <h1 className="serif max-w-2xl text-5xl leading-[.9] md:text-7xl">{dbText(product.name)}</h1>
              <button onClick={toggleFavorite} aria-label="Favourite product" className={"shrink-0 rounded-full border border-[#211d19]/10 p-3 transition " + (favorite ? "bg-[#211d19] text-white" : "bg-white/60 hover:bg-white")}><Heart size={19} fill={favorite ? "currentColor" : "none"}/></button>
            </div>
            {product.mood && <p className="mt-4 text-[10px] font-bold uppercase tracking-[.22em] text-[#9c5638]">{dbText(product.mood)} mood</p>}
            <p className="mt-7 max-w-xl text-sm leading-7 text-[#5e554e]">{dbText(product.shortDescription || product.description)}</p>

            <div className="mt-8 border-y border-[#211d19]/10 py-6">
              <p className="serif text-2xl italic text-[#9c5638]">Price coming soon</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-14 items-center justify-between border border-[#211d19]/15 bg-white/50 sm:w-36">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-white"><Minus size={15}/></button>
                  <span className="text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(Math.max(1, product.stock || 99), q + 1))} className="px-4 py-3 hover:bg-white"><Plus size={15}/></button>
                </div>
                <button onClick={addToBag} disabled={adding || product.stock === 0} className="flex h-14 flex-1 items-center justify-center gap-3 bg-[#211d19] px-6 text-[10px] font-bold uppercase tracking-[.2em] text-white transition hover:bg-[#9c5638] disabled:opacity-50">
                  <ShoppingBag size={17}/>{adding ? "Added to bag" : product.stock === 0 ? "Out of stock" : "Add " + quantity + " to bag"}
                </button>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[.16em] text-[#776f67]">{product.stock > 0 ? product.stock + " available" : "Currently unavailable"}</p>
            </div>

            <div className="mt-9">
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">The scent</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#4e4640]">{dbText(product.description)}</p>
            </div>

            <dl className="mt-9 grid gap-x-10 sm:grid-cols-2">
              <Field label="Scent family" value={product.scentFamily}/><Field label="Scent intensity" value={product.scentIntensity}/>
              <Field label="Top notes" value={product.topNotes}/><Field label="Middle notes" value={product.middleNotes}/>
              <Field label="Base notes" value={product.baseNotes}/><Field label="Wax" value={product.waxType}/>
              <Field label="Wick" value={product.wickType}/><Field label="Burn time" value={product.burnTimeHours ? product.burnTimeHours + " hours" : null}/>
              <Field label="Size" value={product.sizeLabel}/><Field label="Vessel" value={product.vesselMaterial}/>
              <Field label="Vessel colour" value={product.vesselColor}/><Field label="Dimensions" value={product.dimensions}/>
              <Field label="Net weight" value={product.netWeight}/><Field label="Ingredients" value={product.ingredients}/>
              <Field label="Allergens" value={product.allergens}/><Field label="Care" value={product.careInstructions}/>
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
