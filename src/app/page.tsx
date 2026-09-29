"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DynamicSection, type DynamicSectionData } from "@/components/home/DynamicSection";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Instagram,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

const products = [
  { name: "Lavender", mood: "Relaxing", priceUSD: 19, desc: "Soft lavender and herbal notes made for quiet evenings and slow rituals.", img: "https://images.pexels.com/photos/6755743/pexels-photo-6755743.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Kootenay Pine Fig", mood: "Dreamy", priceUSD: 19, desc: "A peaceful pine-and-fig inspired fragrance with a calm natural character.", img: "https://images.pexels.com/photos/10771904/pexels-photo-10771904.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Festive Cinnamon", mood: "Festive", priceUSD: 19, desc: "Aromatic cinnamon and holiday notes for a warm seasonal glow.", img: "https://images.pexels.com/photos/5782650/pexels-photo-5782650.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Warm Amber", mood: "Cosy", priceUSD: 19, desc: "A warmly lit scented candle with a soft amber atmosphere.", img: "https://images.pexels.com/photos/6311846/pexels-photo-6311846.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Rosemary Spice", mood: "Playful", priceUSD: 19, desc: "Bright rosemary and spice notes with a vivid, inviting character.", img: "https://images.pexels.com/photos/5782675/pexels-photo-5782675.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Spa Serenity", mood: "Relaxing", priceUSD: 19, desc: "A tranquil candle styled for slow self-care and spa-like evenings.", img: "https://images.pexels.com/photos/8247308/pexels-photo-8247308.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Rustic Retreat", mood: "Romantic", priceUSD: 19, desc: "A rustic scented candle with warm natural textures and intimate glow.", img: "https://images.pexels.com/photos/9765419/pexels-photo-9765419.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Mount Revelstoke", mood: "Energising", priceUSD: 19, desc: "A fresh nature-inspired scented candle with a crisp outdoor feeling.", img: "https://images.pexels.com/photos/10771942/pexels-photo-10771942.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Autumn Glow", mood: "Tropical", priceUSD: 19, desc: "Warm botanical notes and glowing candlelight for an inviting escape.", img: "https://images.pexels.com/photos/12480609/pexels-photo-12480609.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  { name: "Ginger & Rose", mood: "Romantic", priceUSD: 19, desc: "Warm ginger, candlelight and rose petals for a romantic atmosphere.", img: "https://images.pexels.com/photos/6798396/pexels-photo-6798396.jpeg?auto=compress&cs=tinysrgb&w=1200" },
];

const collectionCards = [
  { label: "Candles", sub: "Set the mood", img: products[3].img },
  { label: "Linen sprays", sub: "Freshen your space", img: products[5].img },
  { label: "Gift sets", sub: "Thoughtful. Luxurious.", img: products[9].img },
  { label: "New arrivals", sub: "Fresh scents. New moods.", img: products[1].img },
  { label: "The edit", sub: "Curated beauty", img: products[6].img },
];

type Cart = Record<string, number>;
type CurrencyInfo = { code: string; locale: string; label: string };
type StoreProduct = typeof products[number] & { id?: string };
type StoreContent = { key: string; type?: string; layout?: string|null; title?: string|null; eyebrow?: string|null; body?: string|null; imageUrl?: string|null; imageAlt?: string|null; buttonText?: string|null; buttonUrl?: string|null; sortOrder?: number; isActive?: boolean };
type StoreCollection = { slug:string; title:string; subtitle?:string|null; imageUrl:string; mood?:string|null; products?:StoreProduct[] };
type Social = { platform:string; url:string; label?:string|null };
type StoreMood = { id:string; name:string; slug:string; imageUrl?:string|null; sortOrder:number };

const CURRENCY_BY_ZONE: Record<string, CurrencyInfo> = {
  "Africa/Nairobi": { code: "KES", locale: "en-KE", label: "Kenya" },
  "Africa/Kampala": { code: "UGX", locale: "en-UG", label: "Uganda" },
  "Africa/Dar_es_Salaam": { code: "TZS", locale: "sw-TZ", label: "Tanzania" },
  "Africa/Kigali": { code: "RWF", locale: "rw-RW", label: "Rwanda" },
  "Africa/Lagos": { code: "NGN", locale: "en-NG", label: "Nigeria" },
  "Africa/Accra": { code: "GHS", locale: "en-GH", label: "Ghana" },
  "Africa/Johannesburg": { code: "ZAR", locale: "en-ZA", label: "South Africa" },
  "Europe/London": { code: "GBP", locale: "en-GB", label: "United Kingdom" },
  "Europe/Paris": { code: "EUR", locale: "en-FR", label: "Europe" },
  "Europe/Berlin": { code: "EUR", locale: "de-DE", label: "Europe" },
  "Asia/Dubai": { code: "AED", locale: "en-AE", label: "United Arab Emirates" },
  "Asia/Kolkata": { code: "INR", locale: "en-IN", label: "India" },
  "Asia/Tokyo": { code: "JPY", locale: "ja-JP", label: "Japan" },
  "Asia/Singapore": { code: "SGD", locale: "en-SG", label: "Singapore" },
  "Asia/Shanghai": { code: "CNY", locale: "zh-CN", label: "China" },
  "Australia/Sydney": { code: "AUD", locale: "en-AU", label: "Australia" },
  "America/New_York": { code: "USD", locale: "en-US", label: "United States" },
  "America/Los_Angeles": { code: "USD", locale: "en-US", label: "United States" },
  "America/Toronto": { code: "CAD", locale: "en-CA", label: "Canada" },
};

const FALLBACK_CURRENCY: CurrencyInfo = { code: "USD", locale: "en-US", label: "United States" };
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, KES: 129, GBP: 0.74, EUR: 0.85, CAD: 1.38, AUD: 1.52, INR: 88, JPY: 149,
  SGD: 1.28, AED: 3.67, CNY: 7.1, ZAR: 17.3, NGN: 1540, GHS: 12.5, UGX: 3500, TZS: 2600, RWF: 1450,
};

function detectCurrency(): CurrencyInfo {
  if (typeof window === "undefined") return FALLBACK_CURRENCY;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (CURRENCY_BY_ZONE[zone]) return CURRENCY_BY_ZONE[zone];
  const region = (navigator.language || "en-US").split("-")[1]?.toUpperCase();
  const byRegion: Record<string, CurrencyInfo> = {
    KE: { code: "KES", locale: "en-KE", label: "Kenya" }, GB: { code: "GBP", locale: "en-GB", label: "United Kingdom" },
    CA: { code: "CAD", locale: "en-CA", label: "Canada" }, AU: { code: "AUD", locale: "en-AU", label: "Australia" },
    IN: { code: "INR", locale: "en-IN", label: "India" }, JP: { code: "JPY", locale: "ja-JP", label: "Japan" },
    SG: { code: "SGD", locale: "en-SG", label: "Singapore" }, ZA: { code: "ZAR", locale: "en-ZA", label: "South Africa" },
    NG: { code: "NGN", locale: "en-NG", label: "Nigeria" }, GH: { code: "GHS", locale: "en-GH", label: "Ghana" },
    AE: { code: "AED", locale: "en-AE", label: "United Arab Emirates" }, CN: { code: "CNY", locale: "zh-CN", label: "China" },
  };
  return byRegion[region || ""] || FALLBACK_CURRENCY;
}

function normalizeImageUrl(src?: string | null) {
  if (!src) return "/hero.jpg";
  try {
    const parsed = new URL(src, typeof window !== "undefined" ? window.location.origin : "https://in-the-mood-for-candles.vercel.app");
    if (parsed.pathname === "/hero.jpg" || parsed.pathname === "/hero.webp") return "/hero.jpg";
    return src;
  } catch {
    return src;
  }
}

function isDataImage(src?: string | null) {
  return Boolean(src?.startsWith("data:image/"));
}

function formatMoney(amount: number, info: CurrencyInfo) {
  try {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      maximumFractionDigits: info.code === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return info.code + " " + amount.toFixed(2);
  }
}

export default function Home() {
  const [filter, setFilter] = useState("ALL");
  const [shopProducts, setShopProducts] = useState<StoreProduct[]>(products);
  const [cart, setCart] = useState<Cart>({});
  const [bag, setBag] = useState(false);
  const [menu, setMenu] = useState(false);
  const [currency, setCurrency] = useState<CurrencyInfo>(FALLBACK_CURRENCY);
  const [rate, setRate] = useState(1);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(products);
  const [storeContent, setStoreContent] = useState<StoreContent[]>([]);
  const [storeCollections, setStoreCollections] = useState<StoreCollection[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [moods, setMoods] = useState<StoreMood[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([]);
  const [favoriteMoodIds, setFavoriteMoodIds] = useState<string[]>([]);
  const [favoriteNotice, setFavoriteNotice] = useState("");
  const [heroImage, setHeroImage] = useState("/hero.jpg");
  const [activeCollection, setActiveCollection] = useState(0);
  const [activeProductCollection, setActiveProductCollection] = useState("ALL");
  const collectionRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrency(detectCurrency());
    Promise.all([fetch("/api/storefront"), fetch("/api/moods"), fetch("/api/favorites")])
      .then(async ([storeResponse, moodsResponse, favoritesResponse]) => {
        const data = storeResponse.ok ? await storeResponse.json() : {};
        const moodData = moodsResponse.ok ? await moodsResponse.json() : {};
        const favoriteData = favoritesResponse.ok ? await favoritesResponse.json() : {};
        if (Array.isArray(moodData.moods)) setMoods(moodData.moods);
        if (Array.isArray(favoriteData.favoriteProductIds)) setFavoriteProductIds(favoriteData.favoriteProductIds);
        if (Array.isArray(favoriteData.favoriteMoodIds)) setFavoriteMoodIds(favoriteData.favoriteMoodIds);
        return data;
      })
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length) {
          setStoreProducts(data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            mood: p.mood,
            priceUSD: Number(p.priceUSD || 0),
            desc: p.shortDescription || p.description,
            img: p.images?.[0]?.url || "/hero.jpg",
          })));
        }
        if (Array.isArray(data.content)) {
          setStoreContent(data.content);
          const dbHero = data.content.find((item: StoreContent) => item.key === "hero");
          if (dbHero?.imageUrl) setHeroImage(normalizeImageUrl(dbHero.imageUrl));
        }
        if (Array.isArray(data.collections)) setStoreCollections(data.collections);
        if (Array.isArray(data.socials)) setSocials(data.socials);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    setShopProducts([...storeProducts].sort(() => Math.random() - 0.5));
  }, [storeProducts]);
  useEffect(() => {
    if (currency.code === "USD") { setRate(1); return; }
    let cancelled = false;
    fetch("https://api.frankfurter.app/latest?from=USD&to=" + currency.code)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => { if (!cancelled && d?.rates?.[currency.code]) setRate(Number(d.rates[currency.code])); })
      .catch(() => { if (!cancelled) setRate(FALLBACK_RATES[currency.code] || 1); });
    return () => { cancelled = true; };
  }, [currency.code]);

  useEffect(() => {
    const rail = collectionRailRef.current;
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-mood-card]"));
    if (!cards.length) return;
    const updateActive = () => {
      const center = rail.scrollLeft + rail.clientWidth / 2;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const nextDistance = Math.abs(cardCenter - center);
        if (nextDistance < distance) { distance = nextDistance; closest = index; }
      });
      setActiveCollection(closest);
    };
    rail.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();
    return () => { rail.removeEventListener("scroll", updateActive); window.removeEventListener("resize", updateActive); };
  }, [moods.length]);

  const moodTabs = moods.length ? moods : Array.from(new Set(shopProducts.map((product) => product.mood).filter(Boolean))).map((name) => ({ id: name, name, slug: String(name).toLowerCase().replace(/\\s+/g, "-"), sortOrder: 0 }));
  const selectedProductCollection = storeCollections.find((collection) => collection.slug === activeProductCollection);
  const shown = useMemo(() => {
    if (activeProductCollection === "ALL") return shopProducts;
    const ids = new Set((selectedProductCollection?.products || []).map((product) => product.id).filter(Boolean));
    return ids.size ? shopProducts.filter((product) => ids.has(product.id)) : [];
  }, [activeProductCollection, selectedProductCollection, shopProducts]);

  const totalUSD = Object.entries(cart).reduce(
    (sum, [name, quantity]) => sum + (storeProducts.find((p) => p.name === name)?.priceUSD || 0) * quantity,
    0,
  );
  const total = totalUSD * rate;
  const count = Object.values(cart).reduce((sum, value) => sum + value, 0);
  const content = (key: string) => storeContent.find((item) => item.key === key);
  const hero = content("hero");
  const story = content("story");
  const mission = content("mission");
  const vision = content("vision");
  const journal = content("journal");
  const instagram = socials.find((item) => item.platform === "instagram")?.url || "https://www.instagram.com/inthemoodfor_candles";

  const add = (name: string) => setCart((current) => ({ ...current, [name]: (current[name] || 0) + 1 }));
  const toggleFavorite = async (type: "product" | "mood", id?: string) => {
    if (!id) return;
    const isFavorite = type === "product" ? favoriteProductIds.includes(id) : favoriteMoodIds.includes(id);
    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        window.location.href = "/account";
        return;
      }
      if (!response.ok) {
        setFavoriteNotice(data?.error || "Could not update favourites.");
        window.setTimeout(() => setFavoriteNotice(""), 2500);
        return;
      }
      if (type === "product") {
        setFavoriteProductIds((current) => isFavorite ? current.filter((item) => item !== id) : [...current, id]);
      } else {
        setFavoriteMoodIds((current) => isFavorite ? current.filter((item) => item !== id) : [...current, id]);
      }
    } catch {
      setFavoriteNotice("Could not update favourites. Please try again.");
      window.setTimeout(() => setFavoriteNotice(""), 2500);
    }
  };

  const change = (name: string, amount: number) => setCart((current) => {
    const next = { ...current, [name]: Math.max(0, (current[name] || 0) + amount) };
    if (!next[name]) delete next[name];
    return next;
  });

  const whatsapp = () => {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000";
    const lines = Object.entries(cart).map(([name, quantity]) => "• " + name + " × " + quantity);
    const message = "Hello In The Mood For! ✨\nI'd like to order:\n" + lines.join("\n") +
      "\n\nEstimated total: " + formatMoney(total, currency) + ".";
    window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(message), "_blank");
  };

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      {favoriteNotice && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-[#211d19] px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white shadow-xl">
          {favoriteNotice}
        </div>
      )}
      <header className="site-header sticky top-0 z-50 border-b border-[#211d19]/10 bg-[#f6f1e9]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 md:px-14">
          <button
            aria-label="In The Mood Candles home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 text-left"
          >
            <Image src="/tm-logo.svg" alt="In The Mood Candles logo" width={56} height={56} priority unoptimized className="h-12 w-12 object-contain" />
            <span className="leading-none">
              <span className="serif block text-[15px] tracking-[.11em] sm:text-[17px]">IN THE MOOD</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.39em] text-[#776f67]">FOR CANDLES</span>
            </span>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {[
              ["home", "#top"],
              ["shop", "#collection"],
              ["our story", "#story"],
              ["journal", "#journal"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className={"nav-link relative px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#211d19] transition-opacity hover:opacity-50 " +
                  (label === "home" ? "nav-link-active" : "")}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <button aria-label="Search" className="hidden p-2.5 transition-opacity hover:opacity-50 md:block"><Search size={18} strokeWidth={1.5} /></button>
            <button aria-label="Account" onClick={() => window.location.href = "/account"} className="hidden p-2.5 transition-opacity hover:opacity-50 md:block"><UserRound size={18} strokeWidth={1.5} /></button>
            <button aria-label="Shopping bag" className="relative p-2.5 transition-opacity hover:opacity-50" onClick={() => setBag(true)}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#211d19] text-[12px] font-bold text-white">{count}</span>}
            </button>
            <button aria-label={menu ? "Close menu" : "Open menu"} className="p-2.5 md:hidden" onClick={() => setMenu((open) => !open)}>
              {menu ? <X size={23} strokeWidth={1.5} /> : <Menu size={23} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-black/10 bg-[#f6f1e9] md:hidden"
            >
              <div className="flex flex-col px-5 py-4">
                {[
                  ["shop", "#collection"],
                  ["our story", "#story"],
                  ["journal", "#journal"],
                  ["account", "/account"],
                  ["instagram", "https://www.instagram.com/inthemoodfor_candles"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target={label === "instagram" ? "_blank" : undefined}
                    rel={label === "instagram" ? "noreferrer" : undefined}
                    onClick={() => setMenu(false)}
                    className="border-b border-black/10 py-4 text-[12px] font-bold uppercase tracking-[.22em]"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section id="top" className="hero-section relative min-h-[680px] overflow-hidden md:min-h-[690px]">
        <Image
          src={normalizeImageUrl(heroImage)}
          onError={() => setHeroImage("/hero.jpg")}
          alt={hero?.imageAlt || "Warm candlelit room with a scented candle"}
          fill
          priority
          sizes="100vw"
          unoptimized={isDataImage(heroImage)}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1440px] items-center px-7 py-24 md:min-h-[690px] md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[75%] text-white"
          >
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[.3em] text-white/80 md:text-[10px]">
              {hero?.eyebrow || "Candles • Linen sprays • Memories"}
            </p>
            <h1 className="serif italic font-bold text-[3.7rem] leading-[.92] tracking-[-.035em] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.15rem]">
              {hero?.title || "Set the mood. Leave a scent worth remembering."}
            </h1>
            <span className="mt-7 block h-px w-10 bg-white/80" />
            <p className="mt-6 max-w-[520px] text-[13px] leading-7 text-white/90 md:text-[15px] md:leading-7.5">
              {hero?.body || "Beautifully scented candles and linen sprays designed to transform your space, creating a feeling that stays with you."}
            </p>
            <a
              href={hero?.buttonUrl || "#collection"}
              className="mt-8 inline-flex items-center gap-3 border border-white/75 px-5 py-3 text-[10px] font-bold uppercase tracking-[.18em] transition hover:bg-white hover:text-[#211d19]"
            >
              {hero?.buttonText || "explore the collection"} <ArrowRight size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      <section id="collection" className="collection-section bg-[#2a180f] px-5 py-16 text-[#f5eadf] md:px-16 md:py-[72px]">
        <div className="mx-auto max-w-[1310px]">
          <div className="mb-9"><p className="mb-3 text-[12px] font-semibold uppercase tracking-[.34em] text-[#d5b5a0]">Shop our collection</p><h2 className="serif text-[3rem] leading-none md:text-[4rem]">Find your <span className="italic">mood.</span></h2></div>
          <div ref={collectionRailRef} className="collection-grid">
            {moodTabs.map((mood, index) => (
              <a href={"/moods/" + mood.slug} key={mood.id} data-mood-card className={"collection-card group " + (activeCollection === index ? "collection-card-active" : "")}>
                <div className="relative aspect-[1.05] overflow-hidden border border-white/20 bg-black/20">
                  {mood.imageUrl ? <Image src={normalizeImageUrl(mood.imageUrl)} alt={mood.name} fill unoptimized={isDataImage(mood.imageUrl)} sizes="(max-width: 768px) 70vw, 240px" className="object-cover transition duration-700 group-hover:scale-105"/> : <div className="absolute inset-0 bg-gradient-to-br from-[#6f4937] via-[#3a2117] to-[#160d09]"/>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"/>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-center"><p className="text-[12px] font-semibold uppercase tracking-[.32em]">{mood.name}</p><p className="mt-2 text-[9px] uppercase tracking-[.22em] text-[#d5b5a0]">Explore this feeling</p></div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="bg-[#f6f1e9] px-5 py-20 md:px-14 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between"><div><p className="mb-3 text-[12px] font-bold uppercase tracking-[.36em] text-[#9c5638]">The candle collection</p><h2 className="serif text-5xl leading-none md:text-7xl">Choose your <span className="italic">collection.</span></h2></div><p className="max-w-sm text-[9px] leading-6 text-[#776f67]">Curated candles for every atmosphere, ritual and little moment.</p></div>
          <div className="hide-scroll mb-12 flex gap-7 overflow-x-auto border-b border-black/10 pb-4 md:justify-center md:overflow-visible">
            <button onClick={() => setActiveProductCollection("ALL")} className={"shrink-0 pb-3 text-[12px] font-bold uppercase tracking-[.25em] transition " + (activeProductCollection === "ALL" ? "border-b border-[#211d19] text-[#211d19]" : "text-[#776f67] hover:text-[#211d19]")}>all</button>
            {storeCollections.map((collection) => <button key={collection.slug} onClick={() => setActiveProductCollection(collection.slug)} className={"shrink-0 pb-3 text-[12px] font-bold uppercase tracking-[.25em] transition " + (activeProductCollection === collection.slug ? "border-b border-[#211d19] text-[#211d19]" : "text-[#776f67] hover:text-[#211d19]")}>{collection.title}</button>)}
          </div>
          {activeProductCollection !== "ALL" && <div className="mb-8 flex items-center justify-between gap-4"><div><p className="serif text-2xl">{selectedProductCollection?.title}</p><p className="mt-1 text-xs text-[#776f67]">{selectedProductCollection?.subtitle}</p></div><a href={"/collections/" + activeProductCollection} className="inline-flex shrink-0 items-center gap-2 border-b border-black/30 pb-1 text-[10px] font-bold uppercase tracking-[.18em]">view all <ArrowRight size={13}/></a></div>}
          <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {shown.slice(0,4).map((product,index) => <motion.article layout key={product.id||product.name} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-50px"}} transition={{delay:index*.035,duration:.5}} className="group">
              <div className="relative aspect-[.82] overflow-hidden bg-[#e2d8cb]"><Image src={normalizeImageUrl(product.img)} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" unoptimized={isDataImage(product.img)} className="object-cover transition duration-700 group-hover:scale-[1.04]"/><div className="absolute left-3 top-3 bg-[#f6f1e9]/90 px-3 py-2 text-[12px] font-bold uppercase tracking-[.18em]">{product.mood}</div><button onClick={()=>toggleFavorite("product",product.id)} aria-label={(favoriteProductIds.includes(product.id||"")?"Remove ":"Save ")+product.name+" to favourites"} className={"absolute right-3 top-3 bg-[#f6f1e9]/90 p-2.5 transition hover:bg-white "+(favoriteProductIds.includes(product.id||"")?"text-[#9c5638]":"text-[#211d19]")}><Heart size={14} fill={favoriteProductIds.includes(product.id||"")?"currentColor":"none"} strokeWidth={1.5}/></button><button onClick={()=>add(product.name)} className="absolute bottom-0 left-0 right-0 bg-[#211d19] py-4 text-[12px] font-bold uppercase tracking-[.2em] text-white opacity-0 transition group-hover:opacity-100">add to bag <span className="ml-1">+</span></button></div>
              <div className="pt-4"><div className="flex items-start justify-between gap-3"><div><h3 className="serif text-[21px]">{product.name}</h3><p className="mt-1 text-[12px] font-bold uppercase tracking-[.18em] text-[#9c5638]">{product.mood}</p></div><span className="serif pt-1 text-[16px] italic text-[#9c5638]">Price coming soon</span></div><p className="mt-3 text-[12px] leading-5 text-[#776f67]">{product.desc}</p></div>
            </motion.article>)}
          </div>
          {activeProductCollection !== "ALL" && <div className="mt-12 text-center"><a href={"/collections/" + activeProductCollection} className="inline-flex items-center gap-3 border border-[#211d19] px-6 py-3 text-[10px] font-bold uppercase tracking-[.2em] transition hover:bg-[#211d19] hover:text-white">view all {selectedProductCollection?.title || "candles"} <ArrowRight size={14}/></a></div>}
        </div>
      </section>

      {((storeContent.length ? storeContent.filter((item) => item.key !== "hero") : [{"key":"journal","type":"GENERAL","layout":"STATEMENT","eyebrow":"The journal","title":"A scent is a memory.","body":"There is magic in lighting a candle and letting a familiar fragrance fill the room. Scent can take us back to places, people and little moments we thought we had forgotten.","buttonText":"discover the collection","buttonUrl":"#products"},{"key":"story","type":"STORY","layout":"SPLIT_LEFT","eyebrow":"Our story","title":"More than a candle. It’s a feeling.","body":"It started with a simple love for beautiful scents and the magic they create.\\n\\nAt In The Mood For Candles, we believe fragrance has the power to create memories.","imageUrl":"/section-samples/split-left.svg","imageAlt":"Warm candle editorial"},{"key":"mission","type":"MISSION","layout":"PRODUCT_SHOWCASE","eyebrow":"Our mission","title":"Create beautifully scented moments.","body":"To create beautifully scented candles that transform everyday spaces into memorable experiences, bringing warmth, comfort and a little luxury into every moment.","imageUrl":"/section-samples/product-showcase.svg","imageAlt":"Candle product detail"},{"key":"vision","type":"VISION","layout":"QUOTE","eyebrow":"Our vision","title":"Make fragrance part of the stories people remember.","body":"To become a beloved fragrance brand known for creating scents that become part of people’s stories, spaces and most cherished memories."}]).filter((item) => item.isActive !== false) as StoreContent[]).map((section, index) => (
        <DynamicSection key={section.key} section={section as DynamicSectionData} index={index} />
      ))}

      {storeContent.length > 0 && instagram && (
        <section className="border-t border-black/10 bg-[#f6f1e9] px-5 py-8 md:px-14">
          <div className="mx-auto flex max-w-[1200px] justify-end">
            <a href={instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 border-b border-[#211d19]/30 pb-2 text-[10px] font-bold uppercase tracking-[.2em]">
              follow the journey <Instagram size={14} />
            </a>
          </div>
        </section>
      )}

      <footer className="bg-[#f6f1e9] px-5 py-10 md:px-14">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 border-t border-black/10 pt-7 text-[12px] font-semibold uppercase tracking-[.18em] md:flex-row">
          <span>© {new Date().getFullYear()} In The Mood For Candles</span>
          <span>Made for slow moments</span>
        </div>
      </footer>

      <AnimatePresence>
        {bag && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBag(false)} className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-[460px] flex-col bg-[#f6f1e9] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
                <div><p className="text-[12px] font-bold uppercase text-[#776f67]">Your</p><h3 className="serif text-2xl">Bag</h3></div>
                <button onClick={() => setBag(false)} aria-label="Close bag"><X /></button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {Object.keys(cart).length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <ShoppingBag size={24} strokeWidth={1.5} />
                    <p className="serif mt-4 text-2xl">Your bag is empty.</p>
                    <a href="#products" onClick={() => setBag(false)} className="mt-5 border-b border-black pb-1 text-[12px] font-bold uppercase tracking-[.18em]">discover candles</a>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(cart).map(([name, quantity]) => {
                      const product = storeProducts.find((item) => item.name === name)!;
                      return (
                        <div key={name} className="flex gap-4 border-b border-black/10 pb-5">
                          <Image src={product.img} width={80} height={96} sizes="80px" unoptimized={isDataImage(product.img)} className="h-24 w-20 object-cover" alt="" />
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between gap-3"><span className="serif text-lg">{name}</span><span className="text-sm">{formatMoney(product.priceUSD * rate * quantity, currency)}</span></div>
                            <div className="mt-auto flex items-center gap-3">
                              <button onClick={() => change(name, -1)} className="rounded-full border p-1"><Minus size={12} /></button>
                              <span className="text-xs">{quantity}</span>
                              <button onClick={() => change(name, 1)} className="rounded-full border p-1"><Plus size={12} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {count > 0 && (
                <div className="border-t border-black/10 p-6">
                  <div className="mb-5 flex justify-between text-sm"><span>Estimated total</span><span className="font-semibold">{formatMoney(total, currency)}</span></div>
                  <button onClick={whatsapp} className="w-full bg-[#211d19] py-4 text-[12px] font-bold uppercase tracking-[.2em] text-white transition hover:bg-[#9c5638]">order via WhatsApp</button>
                  <p className="mt-3 text-center text-[12px] text-[#776f67]">We'll confirm availability, delivery and payment with you on WhatsApp.</p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
