"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { dbText } from "@/lib/db-text";

export type CustomerProduct = {
  id: string;
  name: string;
  slug?: string | null;
  mood?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  img: string;
  priceUSD?: number | null;
};

export default function ProductItem({
  product,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: {
  product: CustomerProduct;
  sizes?: string;
}) {
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && Array.isArray(data?.favoriteProductIds)) {
          setFavorite(data.favoriteProductIds.includes(product.id));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [product.id]);

  async function toggleFavorite() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/favorites", {
        method: favorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "product", id: product.id }),
      });
      if (response.status === 401) {
        window.location.href = "/account";
        return;
      }
      if (!response.ok) return;
      const nextFavorite = !favorite;
      setFavorite(nextFavorite);
      window.dispatchEvent(new CustomEvent("imc:favourite-changed", {
        detail: { type: "product", id: product.id, favorite: nextFavorite },
      }));
    } finally {
      setBusy(false);
    }
  }

  function addToBag() {
    window.dispatchEvent(new CustomEvent("imc:add-to-bag", {
      detail: {
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug || "",
          mood: product.mood || "",
          img: product.img,
          priceUSD: product.priceUSD ?? null,
        },
      },
    }));
  }

  const productHref = product.slug ? `/products/${product.slug}` : "#";

  return (
    <article className="group">
      <Link href={productHref} className="block">
        <div className="relative aspect-[.82] overflow-hidden bg-[#e2d8cb]">
          <Image
            src={product.img}
            alt={dbText(product.name)}
            fill
            sizes={sizes}
            unoptimized={product.img.startsWith("data:image/")}
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />

          {product.mood && (
            <div className="absolute left-3 top-3 bg-[#f6f1e9]/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[.18em]">
              {dbText(product.mood)}
            </div>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleFavorite();
            }}
            disabled={busy}
            aria-label={(favorite ? "Remove " : "Save ") + dbText(product.name) + " to favourites"}
            aria-pressed={favorite}
            className={"absolute right-3 top-3 bg-[#f6f1e9]/90 p-2.5 transition hover:bg-white " + (favorite ? "text-[#9c5638]" : "text-[#211d19]")}
          >
            <Heart size={15} fill={favorite ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addToBag();
            }}
            className="absolute bottom-0 left-0 right-0 bg-[#211d19] py-4 text-[11px] font-bold uppercase tracking-[.2em] text-white opacity-100 transition hover:bg-[#9c5638] md:opacity-0 md:group-hover:opacity-100"
          >
            add to bag <span className="ml-1">+</span>
          </button>
        </div>
      </Link>

      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={productHref} className="serif text-[21px] transition hover:text-[#9c5638]">
              {dbText(product.name)}
            </Link>
            {product.mood && (
              <p className="mt-1 text-[12px] font-bold uppercase tracking-[.18em] text-[#9c5638]">
                {product.mood}
              </p>
            )}
          </div>
          <span className="serif pt-1 text-[16px] italic text-[#9c5638]">
            Price coming soon
          </span>
        </div>
        {(product.shortDescription || product.description) && (
          <p className="mt-3 text-[12px] leading-5 text-[#776f67]">
            {dbText(product.shortDescription || product.description)}
          </p>
        )}
      </div>
    </article>
  );
}
