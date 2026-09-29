"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SECTION_STYLES, SectionStylePreview, type SectionLayout } from "@/components/home/DynamicSection";
import {
  Check,
  ExternalLink,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

type Content = {
  id:string; key:string; type:string; layout:SectionLayout|string; title:string|null; eyebrow:string|null; body:string|null;
  imageUrl:string|null; imageAlt:string|null; buttonText:string|null; buttonUrl:string|null; sortOrder:number; isActive:boolean;
};
type Collection = {
  id:string; slug:string; title:string; subtitle:string|null; imageUrl:string; imageAlt:string|null;
  mood:string|null; sortOrder:number; isActive:boolean;
};
type Social = { id:string; platform:string; label:string|null; url:string; isActive:boolean; sortOrder:number };
type Product = {
  id:string; sku:string; slug:string; name:string; shortName:string|null; shortDescription:string|null;
  description:string; mood:string; category:string; status:string; priceUSD:string|number; currency:string;
  sizeLabel:string|null; waxType:string|null; wickType:string|null; burnTimeHours:string|number|null;
  scentFamily:string|null; scentIntensity:string|null; topNotes:string|null; middleNotes:string|null; baseNotes:string|null;
  ingredients:string|null; allergens:string|null; careInstructions:string|null; vesselMaterial:string|null;
  vesselColor:string|null; dimensions:string|null; netWeight:string|null; stock:number; featured:boolean;
  seoTitle:string|null; seoDescription:string|null; images:{id?:string;url:string;alt?:string|null}[];
};

export type Tab = "overview"|"content"|"collections"|"products"|"social";

function normalizeImageUrl(src?: string | null) {
  if (!src) return src;
  try {
    const parsed = new URL(src, "https://in-the-mood-for-candles.vercel.app");
    if (parsed.pathname === "/hero.jpg" || parsed.pathname === "/hero.webp") return "/hero.jpg";
    return src;
  } catch { return src; }
}

const productFields = [
  ["sku","SKU"],["slug","Slug"],["name","Name"],["shortName","Short name"],["shortDescription","Short description"],
  ["description","Description"],["mood","Mood"],["category","Category"],["status","Status"],["priceUSD","Price (USD)"],
  ["sizeLabel","Size"],["waxType","Wax type"],["wickType","Wick type"],["burnTimeHours","Burn time (hours)"],
  ["scentFamily","Scent family"],["scentIntensity","Scent intensity"],["topNotes","Top notes"],["middleNotes","Middle notes"],
  ["baseNotes","Base notes"],["ingredients","Ingredients"],["allergens","Allergens"],["careInstructions","Care instructions"],
  ["vesselMaterial","Vessel material"],["vesselColor","Vessel color"],["dimensions","Dimensions"],["netWeight","Net weight"],
  ["stock","Stock"],["seoTitle","SEO title"],["seoDescription","SEO description"],
] as const;

const moods = ["Relaxing","Romantic","Cosy","Playful","Tropical","Energising","Festive","Dreamy"];

function isDataImage(src?:string|null) {
  return Boolean(src?.startsWith("data:image/"));
}

function newProduct():Product {
  return {
    id:"", sku:"", slug:"", name:"", shortName:null, shortDescription:null, description:"",
    mood:"Relaxing", category:"Candles", status:"DRAFT", priceUSD:19, currency:"USD",
    sizeLabel:"Standard jar", waxType:"Soy wax", wickType:"Cotton wick", burnTimeHours:null,
    scentFamily:null, scentIntensity:null, topNotes:null, middleNotes:null, baseNotes:null,
    ingredients:null, allergens:null, careInstructions:null, vesselMaterial:null, vesselColor:null,
    dimensions:null, netWeight:null, stock:0, featured:false, seoTitle:null, seoDescription:null, images:[],
  };
}

async function imageToDataUrl(file:File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Please choose an image smaller than 10MB.");

  const bitmap = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const data = canvas.toDataURL("image/webp", 0.82);
  if (data.length > 2_200_000) {
    return canvas.toDataURL("image/jpeg", 0.72);
  }
  return data;
}

function ImagePicker({
  value,
  alt,
  onChange,
  label = "Image",
  compact = false,
}: {
  value?:string|null;
  alt?:string|null;
  onChange:(value:string)=>void;
  label?:string;
  compact?:boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");

  async function handleFile(e:ChangeEvent<HTMLInputElement>) {
    const file=e.target.files?.[0];
    e.target.value="";
    if(!file) return;
    setBusy(true); setError("");
    try { onChange(await imageToDataUrl(file)); }
    catch(err) { setError(err instanceof Error ? err.message : "Could not read image."); }
    finally { setBusy(false); }
  }

  return (
    <div className={compact ? "" : "space-y-3"}>
      {!compact && <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#9c5638]">{label}</p><p className="mt-1 text-xs text-[#776f67]">Choose an image from this device. No URL is needed.</p></div></div>}
      <div className={"relative overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#e8dfd5] " + (compact ? "aspect-[4/3]" : "aspect-[16/8]")}>
        {value ? (
          <>
            <Image src={normalizeImageUrl(value)!} alt={alt || label} fill unoptimized={isDataImage(value)} sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
            <div className="absolute inset-x-3 bottom-3 flex justify-between gap-2">
              <button type="button" onClick={()=>inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] shadow-lg"><Pencil size={13}/> Replace</button>
              <button type="button" onClick={()=>onChange("")} className="inline-flex items-center gap-2 rounded-full bg-[#211d19]/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white"><Trash2 size={13}/> Remove</button>
            </div>
          </>
        ) : (
          <button type="button" onClick={()=>inputRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#776f67] transition hover:bg-white/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"><ImagePlus size={22}/></span>
            <span className="text-[10px] font-bold uppercase tracking-[.2em]">{busy ? "Preparing image..." : "Upload image"}</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {busy && <div className="absolute inset-0 grid place-items-center bg-white/65 backdrop-blur-sm"><span className="rounded-full bg-[#211d19] px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-white">Preparing…</span></div>}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

function SectionHeading({ eyebrow,title,action }:{eyebrow:string;title:string;action?:React.ReactNode}) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="text-[10px] font-bold uppercase tracking-[.32em] text-[#9c5638]">{eyebrow}</p><h2 className="serif mt-2 text-4xl leading-none md:text-5xl">{title}</h2></div>
    {action}
  </div>;
}

function Button({children,onClick,kind="dark",type="button",disabled=false}:{children:React.ReactNode;onClick?:()=>void;kind?:"dark"|"light"|"danger"|"ghost";type?:"button"|"submit";disabled?:boolean}) {
  const styles = kind==="dark" ? "bg-[#211d19] text-white hover:bg-[#9c5638]" : kind==="danger" ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : kind==="light" ? "border border-black/10 bg-white hover:bg-[#eee7df]" : "hover:bg-black/5";
  return <button type={type} disabled={disabled} onClick={onClick} className={"inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.17em] transition disabled:cursor-not-allowed disabled:opacity-50 "+styles}>{children}</button>;
}

export default function AdminPage({ initialTab = "overview" }: { initialTab?: Tab }) {
  const router=useRouter();
  const [user,setUser]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState<Tab>(initialTab);
  const [content,setContent]=useState<Content[]>([]);
  const [collections,setCollections]=useState<Collection[]>([]);
  const [socials,setSocials]=useState<Social[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [selectedProduct,setSelectedProduct]=useState<Product|null>(null);
  const [editingContent,setEditingContent]=useState<Content|null>(null);
  const [editingCollection,setEditingCollection]=useState<Collection|null>(null);
  const [editingSocial,setEditingSocial]=useState<Social|null>(null);
  const [notice,setNotice]=useState("");
  const [search,setSearch]=useState("");

  async function loadData() {
    const me=await fetch("/api/auth/me");
    const md=await me.json();
    if(md.user?.role!=="ADMIN"){router.replace("/account");return;}
    setUser(md.user);
    const [c,p]=await Promise.all([fetch("/api/admin/content"),fetch("/api/admin/products")]);
    const cd=await c.json(), pd=await p.json();
    setContent(cd.content||[]); setCollections(cd.collections||[]); setSocials(cd.socials||[]); setProducts(pd.products||[]);
    setLoading(false);
  }

  useEffect(()=>{loadData().catch(()=>router.replace("/account"));},[router]);

  async function mutateContent(method:"POST"|"PUT"|"DELETE", body:any) {
    setNotice("Saving changes…");
    const r=await fetch("/api/admin/content",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok){setNotice(d.error||"Something went wrong.");return false;}
    setNotice("Saved.");
    await loadData();
    return true;
  }

  async function mutateProduct(method:"POST"|"PUT"|"DELETE", body:any) {
    setNotice("Saving product…");
    const r=await fetch("/api/admin/products",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok){setNotice(d.error||"Something went wrong.");return false;}
    setNotice("Product saved.");
    setSelectedProduct(null);
    await loadData();
    return true;
  }

  async function removeProduct(id:string) {
    if(!window.confirm("Delete this candle permanently?")) return;
    await mutateProduct("DELETE",{id});
  }

  async function removeItem(kind:"content"|"collection"|"social",id:string) {
    if(!window.confirm("Delete this item? This cannot be undone.")) return;
    await mutateContent("DELETE",{kind,id});
  }

  async function logout() {
    await fetch("/api/auth/logout",{method:"POST"});
    router.push("/");
    router.refresh();
  }

  const orderedContent=useMemo(()=>[...content].sort((a,b)=>{ if(a.type==="HERO" && b.type!=="HERO") return -1; if(a.type!=="HERO" && b.type==="HERO") return 1; return b.sortOrder-a.sortOrder; }),[content]);
  const filteredProducts=useMemo(()=>products.filter(p=>[p.name,p.mood,p.sku,p.category].join(" ").toLowerCase().includes(search.toLowerCase())),[products,search]);

  if(loading) return <main className="grid min-h-screen place-items-center bg-[#f6f1e9] text-[#211d19]"><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-[.35em] text-[#9c5638]">In The Mood</p><p className="serif mt-2 text-4xl">Preparing your studio…</p></div></main>;
  if(!user) return null;

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f1e9]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/tm-logo.svg" alt="In The Mood For Candles" width={52} height={52} className="h-11 w-11 object-contain"/>
            <span className="hidden leading-none sm:block"><span className="serif block text-[19px] tracking-[.12em]">IN THE MOOD</span><span className="mt-1 block text-[8px] font-bold uppercase tracking-[.36em] text-[#776f67]">FOR CANDLES</span></span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {(["overview","content","collections","products","social"] as Tab[]).map(item=><Link key={item} href={item==="overview"?"/admin":"/admin/"+item} className={"rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] transition "+(tab===item?"bg-[#211d19] text-white":"hover:bg-black/5")}>{item}</Link>)}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] hover:bg-black/5 md:inline-flex"><ExternalLink size={13}/> Store</Link>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] hover:bg-black/5"><LogOut size={13}/> <span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-5 pb-3 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["overview","content","collections","products","social"] as Tab[]).map(item=><Link key={item} href={item==="overview"?"/admin":"/admin/"+item} className={"shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] "+(tab===item?"bg-[#211d19] text-white":"bg-white/60")}>{item}</Link>)}
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-12 md:py-12">
        {notice && <div className="mb-6 flex items-center justify-between rounded-2xl bg-[#211d19] px-5 py-3.5 text-xs text-white shadow-lg"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={16}/></button></div>}

        {tab==="overview" && (
          <div className="space-y-12">
            <section className="overflow-hidden rounded-[2rem] bg-[#211d19] p-7 text-[#f7f3ec] md:p-12">
              <div className="grid gap-10 lg:grid-cols-[1fr_.75fr] lg:items-center">
                <div><p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#d2a38c]">The studio</p><h1 className="serif mt-4 max-w-3xl text-5xl leading-[.92] md:text-7xl">Shape the feeling behind every candle.</h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/70">Manage the same visual language as the storefront — quietly editorial, warm, image-led and simple to maintain.</p><div className="mt-7 flex flex-wrap gap-3"><Button onClick={()=>router.push("/admin/products")}><Plus size={14}/> Add candle</Button><Button kind="light" onClick={()=>router.push("/admin/content")}><Pencil size={14}/> Edit homepage</Button></div></div>
                <div className="grid grid-cols-2 gap-3">{[
                  ["Products",products.length,"products"],["Homepage blocks",content.length,"content"],["Collections",collections.length,"collections"],["Social links",socials.length,"social"]
                ].map(([label,count,target])=><button key={label} onClick={()=>router.push(target==="overview"?"/admin":"/admin/"+target)} className="rounded-[1.5rem] bg-white/10 p-5 text-left transition hover:bg-white/15"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/50">{label}</p><p className="serif mt-2 text-4xl">{count}</p><p className="mt-2 text-[10px] uppercase tracking-[.16em] text-white/50">Manage →</p></button>)}</div>
              </div>
            </section>
            <section><SectionHeading eyebrow="Quick edit" title="Homepage at a glance" action={<Button kind="light" onClick={()=>setTab("content")}>Open content</Button>}/><div className="grid gap-5 md:grid-cols-2">{orderedContent.slice(0,4).map(item=><button key={item.id} onClick={()=>router.push("/admin/content")} className="group overflow-hidden rounded-[1.7rem] bg-white p-5 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl">{item.imageUrl&&<div className="relative mb-5 aspect-[2/1] overflow-hidden rounded-[1.25rem] bg-[#e8dfd5]"><Image src={normalizeImageUrl(item.imageUrl)!} alt={item.imageAlt||item.key} fill unoptimized={isDataImage(item.imageUrl)} sizes="(max-width: 768px) 100vw, 600px" className="object-cover transition duration-700 group-hover:scale-[1.03]"/></div>}<p className="text-[9px] font-bold uppercase tracking-[.24em] text-[#9c5638]">{item.type}</p><div className="mt-1 flex items-center justify-between gap-4"><h3 className="serif text-3xl">{item.title||item.key}</h3><Pencil size={16}/></div></button>)}</div></section>
          </div>
        )}

        {tab==="content" && (
          <section>
            <SectionHeading eyebrow="Homepage content" title="Tell the story." action={<Button onClick={()=>setEditingContent({id:"",key:"new-section-"+Date.now(),type:"GENERAL",layout:"AUTO",title:"",eyebrow:"",body:"",imageUrl:null,imageAlt:"",buttonText:"",buttonUrl:"",sortOrder:orderedContent.length,isActive:true})}><Plus size={14}/> Add section</Button>}/>
            <div className="grid gap-5 md:grid-cols-2">{orderedContent.map(item=><article key={item.id} className="overflow-hidden rounded-[1.7rem] bg-white ring-1 ring-black/5">{item.imageUrl&&<div className="relative aspect-[2.2/1] bg-[#e8dfd5]"><Image src={normalizeImageUrl(item.imageUrl)!} alt={item.imageAlt||item.key} fill unoptimized={isDataImage(item.imageUrl)} sizes="(max-width: 768px) 100vw, 700px" className="object-cover"/></div>}<div className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#9c5638]">{item.type}</p><h3 className="serif mt-1 text-3xl">{item.title||item.key}</h3></div><span className={"rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[.15em] "+(item.isActive?"bg-[#eee4da]":"bg-black/5")}>{item.isActive?"Live":"Hidden"}</span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#776f67]">{item.body||"No body copy yet."}</p><div className="mt-5 flex gap-2"><Button kind="light" onClick={()=>setEditingContent(item)}><Pencil size={13}/> Edit</Button><Button kind="danger" onClick={()=>removeItem("content",item.id)}><Trash2 size={13}/> Delete</Button></div></div></article>)}</div>
          </section>
        )}

        {tab==="collections" && (
          <section>
            <SectionHeading eyebrow="Collections" title="Curate the moods." action={<Button onClick={()=>setEditingCollection({id:"",slug:"new-collection",title:"New collection",subtitle:"",imageUrl:"",imageAlt:"",mood:"Relaxing",sortOrder:collections.length,isActive:true})}><Plus size={14}/> Add collection</Button>}/>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{collections.map(item=><article key={item.id} className="overflow-hidden rounded-[1.7rem] bg-white ring-1 ring-black/5"><div className="relative aspect-[1.15] bg-[#e8dfd5]">{item.imageUrl&&<Image src={item.imageUrl} alt={item.imageAlt||item.title} fill unoptimized={isDataImage(item.imageUrl)} sizes="(max-width: 768px) 100vw, 420px" className="object-cover"/>}<div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[.16em]">{item.mood||"Collection"}</div></div><div className="p-5"><h3 className="serif text-3xl">{item.title}</h3><p className="mt-1 text-xs text-[#776f67]">{item.subtitle}</p><div className="mt-5 flex gap-2"><Button kind="light" onClick={()=>setEditingCollection(item)}><Pencil size={13}/> Edit</Button><Button kind="danger" onClick={()=>removeItem("collection",item.id)}><Trash2 size={13}/></Button></div></div></article>)}</div>
          </section>
        )}

        {tab==="products" && (
          <section>
            <SectionHeading eyebrow="Candle catalogue" title="Make the collection." action={<div className="flex flex-wrap gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search candles…" className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs outline-none focus:border-[#9c5638]"/><Button onClick={()=>setSelectedProduct(newProduct())}><Plus size={14}/> Add candle</Button></div>}/>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredProducts.map(product=><article key={product.id} className="overflow-hidden rounded-[1.7rem] bg-white ring-1 ring-black/5"><div className="relative aspect-[.88] bg-[#e8dfd5]">{product.images?.[0]?.url&&<Image src={normalizeImageUrl(product.images[0].url)!} alt={product.name} fill unoptimized={isDataImage(product.images[0].url)} sizes="(max-width: 640px) 50vw, 300px" className="object-cover"/>}<span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[.15em]">{product.mood}</span><span className={"absolute right-3 top-3 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[.15em] "+(product.status==="ACTIVE"?"bg-[#211d19] text-white":"bg-white/90")}>{product.status}</span></div><div className="p-5"><h3 className="serif text-2xl">{product.name||"Untitled candle"}</h3><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-[#776f67]">{product.sku} · stock {product.stock}</p><div className="mt-5 flex gap-2"><Button kind="light" onClick={()=>setSelectedProduct(product)}><Pencil size={13}/> Edit</Button><Button kind="danger" onClick={()=>removeProduct(product.id)}><Trash2 size={13}/></Button></div></div></article>)}</div>
          </section>
        )}

        {tab==="social" && (
          <section>
            <SectionHeading eyebrow="Social links" title="Keep the outside world connected." action={<Button onClick={()=>setEditingSocial({id:"",platform:"instagram",label:"",url:"https://",isActive:true,sortOrder:socials.length})}><Plus size={14}/> Add link</Button>}/>
            <div className="grid gap-5 md:grid-cols-3">{socials.map(item=><article key={item.id} className="rounded-[1.7rem] bg-white p-6 ring-1 ring-black/5"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#9c5638]">{item.platform}</p><h3 className="serif mt-2 text-3xl">{item.label||item.platform}</h3><p className="mt-3 truncate text-xs text-[#776f67]">{item.url}</p><div className="mt-5 flex gap-2"><Button kind="light" onClick={()=>setEditingSocial(item)}><Pencil size={13}/> Edit</Button><Button kind="danger" onClick={()=>removeItem("social",item.id)}><Trash2 size={13}/></Button></div></article>)}</div>
          </section>
        )}
      </div>

      {editingContent && <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#211d19]/55 p-4 backdrop-blur-sm md:p-8"><div className="mx-auto max-w-5xl rounded-[2rem] bg-[#f6f1e9] p-6 shadow-2xl md:p-9"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Homepage section builder</p><h2 className="serif mt-1 text-4xl">{editingContent.id?"Edit section":"New section"}</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-[#776f67]">Choose the visual style first. Every preview uses built-in sample copy and artwork from <code className="rounded bg-black/5 px-1">/public</code>.</p></div><button onClick={()=>setEditingContent(null)}><X/></button></div><div className="mt-7"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.25em] text-[#9c5638]">1. Choose section style</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{SECTION_STYLES.map(style=><button type="button" key={style.value} onClick={()=>setEditingContent({...editingContent,layout:style.value})} className={"text-left transition "+(editingContent.layout===style.value?"rounded-[1.5rem] ring-2 ring-[#9c5638]":"rounded-[1.5rem] ring-1 ring-black/5 hover:ring-black/20")}><SectionStylePreview layout={style.value}/></button>)}</div></div><div className="mt-9 border-t border-black/10 pt-8"><p className="mb-4 text-[10px] font-bold uppercase tracking-[.25em] text-[#9c5638]">2. Add your content</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Key"><input value={editingContent.key} disabled={Boolean(editingContent.id)} onChange={e=>setEditingContent({...editingContent,key:e.target.value})} className="input"/></Field><Field label="Type"><select value={editingContent.type} onChange={e=>setEditingContent({...editingContent,type:e.target.value})} className="input">{["HERO","STORY","MISSION","VISION","GENERAL","SOCIAL"].map(x=><option key={x}>{x}</option>)}</select></Field></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="space-y-5"><Field label="Eyebrow"><input value={editingContent.eyebrow||""} onChange={e=>setEditingContent({...editingContent,eyebrow:e.target.value})} className="input"/></Field><Field label="Title"><input value={editingContent.title||""} onChange={e=>setEditingContent({...editingContent,title:e.target.value})} className="input"/></Field><Field label="Body"><textarea rows={7} value={editingContent.body||""} onChange={e=>setEditingContent({...editingContent,body:e.target.value})} className="input resize-y"/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Button text"><input value={editingContent.buttonText||""} onChange={e=>setEditingContent({...editingContent,buttonText:e.target.value})} className="input"/></Field><Field label="Button destination"><input value={editingContent.buttonUrl||""} onChange={e=>setEditingContent({...editingContent,buttonUrl:e.target.value})} className="input"/></Field></div><label className="flex items-center gap-3 text-xs font-semibold"><input type="checkbox" checked={editingContent.isActive} onChange={e=>setEditingContent({...editingContent,isActive:e.target.checked})}/> Visible on storefront</label></div><div><ImagePicker value={editingContent.imageUrl} alt={editingContent.imageAlt} onChange={value=>setEditingContent({...editingContent,imageUrl:value||null})} label="Section image"/><div className="mt-4"><Field label="Image alt text"><input value={editingContent.imageAlt||""} onChange={e=>setEditingContent({...editingContent,imageAlt:e.target.value})} className="input"/></Field></div></div></div></div><div className="mt-8 flex justify-end gap-2"><Button kind="light" onClick={()=>setEditingContent(null)}>Cancel</Button><Button onClick={async()=>{const ok=await mutateContent(editingContent.id?"PUT":"POST",{kind:"content",...editingContent});if(ok)setEditingContent(null)}}><Save size={14}/> Save section</Button></div></div></div>}

      {editingCollection && <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#211d19]/55 p-4 backdrop-blur-sm md:p-8"><div className="mx-auto max-w-3xl rounded-[2rem] bg-[#f6f1e9] p-6 shadow-2xl md:p-9"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Collection</p><h2 className="serif mt-1 text-4xl">{editingCollection.id?"Edit collection":"New collection"}</h2></div><button onClick={()=>setEditingCollection(null)}><X/></button></div><div className="mt-7 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Title"><input value={editingCollection.title} onChange={e=>setEditingCollection({...editingCollection,title:e.target.value})} className="input"/></Field><Field label="Slug"><input value={editingCollection.slug} onChange={e=>setEditingCollection({...editingCollection,slug:e.target.value})} className="input"/></Field></div><Field label="Subtitle"><input value={editingCollection.subtitle||""} onChange={e=>setEditingCollection({...editingCollection,subtitle:e.target.value})} className="input"/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Mood"><select value={editingCollection.mood||""} onChange={e=>setEditingCollection({...editingCollection,mood:e.target.value})} className="input"><option value="">None</option>{moods.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Order"><input type="number" value={editingCollection.sortOrder} onChange={e=>setEditingCollection({...editingCollection,sortOrder:Number(e.target.value)})} className="input"/></Field></div><ImagePicker value={editingCollection.imageUrl} alt={editingCollection.imageAlt} onChange={value=>setEditingCollection({...editingCollection,imageUrl:value})} label="Collection image"/><Field label="Image alt text"><input value={editingCollection.imageAlt||""} onChange={e=>setEditingCollection({...editingCollection,imageAlt:e.target.value})} className="input"/></Field><label className="flex items-center gap-3 text-xs font-semibold"><input type="checkbox" checked={editingCollection.isActive} onChange={e=>setEditingCollection({...editingCollection,isActive:e.target.checked})}/> Visible on storefront</label></div><div className="mt-8 flex justify-end gap-2"><Button kind="light" onClick={()=>setEditingCollection(null)}>Cancel</Button><Button onClick={async()=>{const ok=await mutateContent(editingCollection.id?"PUT":"POST",{kind:"collection",...editingCollection});if(ok)setEditingCollection(null)}}><Save size={14}/> Save collection</Button></div></div></div>}

      {editingSocial && <div className="fixed inset-0 z-[80] grid place-items-center bg-[#211d19]/55 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[2rem] bg-[#f6f1e9] p-7 shadow-2xl md:p-9"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Social</p><h2 className="serif mt-1 text-4xl">{editingSocial.id?"Edit link":"New link"}</h2></div><button onClick={()=>setEditingSocial(null)}><X/></button></div><div className="mt-7 space-y-5"><Field label="Platform"><input value={editingSocial.platform} onChange={e=>setEditingSocial({...editingSocial,platform:e.target.value.toLowerCase()})} className="input"/></Field><Field label="Label"><input value={editingSocial.label||""} onChange={e=>setEditingSocial({...editingSocial,label:e.target.value})} className="input"/></Field><Field label="Link"><input type="url" value={editingSocial.url} onChange={e=>setEditingSocial({...editingSocial,url:e.target.value})} className="input"/></Field><label className="flex items-center gap-3 text-xs font-semibold"><input type="checkbox" checked={editingSocial.isActive} onChange={e=>setEditingSocial({...editingSocial,isActive:e.target.checked})}/> Visible on storefront</label></div><div className="mt-8 flex justify-end gap-2"><Button kind="light" onClick={()=>setEditingSocial(null)}>Cancel</Button><Button onClick={async()=>{const ok=await mutateContent(editingSocial.id?"PUT":"POST",{kind:"social",...editingSocial});if(ok)setEditingSocial(null)}}><Save size={14}/> Save link</Button></div></div></div>}

      {selectedProduct && <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#211d19]/55 p-4 backdrop-blur-sm md:p-8"><div className="mx-auto max-w-5xl rounded-[2rem] bg-[#f6f1e9] p-6 shadow-2xl md:p-9"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Candle catalogue</p><h2 className="serif mt-1 text-4xl">{selectedProduct.id?"Edit candle":"New candle"}</h2></div><button onClick={()=>setSelectedProduct(null)}><X/></button></div><div className="mt-7 grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><div><ImagePicker value={selectedProduct.images?.[0]?.url||""} alt={selectedProduct.name} onChange={value=>setSelectedProduct({...selectedProduct,images:value?[{...selectedProduct.images?.[0],url:value}]:[]})} label="Primary candle image"/><div className="mt-4 grid grid-cols-3 gap-2">{(selectedProduct.images||[]).slice(1).map((image,index)=><div key={image.url} className="relative aspect-square overflow-hidden rounded-xl bg-[#e8dfd5]"><Image src={normalizeImageUrl(image.url)!} alt={selectedProduct.name} fill unoptimized={isDataImage(image.url)} sizes="120px" className="object-cover"/><button type="button" onClick={()=>setSelectedProduct({...selectedProduct,images:[selectedProduct.images[0],...(selectedProduct.images||[]).slice(1).filter((_,i)=>i!==index)]})} className="absolute right-1 top-1 rounded-full bg-[#211d19]/80 p-1 text-white"><X size={12}/></button></div>)}</div><DeviceGalleryPicker onAdd={async value=>setSelectedProduct({...selectedProduct,images:[...(selectedProduct.images||[]),...value.map(url=>({url}))]})}/></div><div className="grid gap-4 sm:grid-cols-2">{productFields.map(([key,label])=><Field key={key} label={label}><textarea rows={key==="description"||key==="careInstructions"||key==="seoDescription"?3:1} value={(selectedProduct as any)[key]??""} onChange={e=>setSelectedProduct({...selectedProduct,[key]:e.target.value})} className="input resize-y"/></Field>)}<Field label="Status"><select value={selectedProduct.status} onChange={e=>setSelectedProduct({...selectedProduct,status:e.target.value})} className="input"><option>DRAFT</option><option>ACTIVE</option><option>ARCHIVED</option></select></Field><Field label="Mood"><select value={selectedProduct.mood} onChange={e=>setSelectedProduct({...selectedProduct,mood:e.target.value})} className="input">{moods.map(x=><option key={x}>{x}</option>)}</select></Field><label className="flex items-center gap-3 text-xs font-semibold"><input type="checkbox" checked={selectedProduct.featured} onChange={e=>setSelectedProduct({...selectedProduct,featured:e.target.checked})}/> Featured candle</label></div></div><div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><Button kind="danger" onClick={()=>selectedProduct.id&&removeProduct(selectedProduct.id)} disabled={!selectedProduct.id}><Trash2 size={14}/> Delete</Button><div className="flex gap-2"><Button kind="light" onClick={()=>setSelectedProduct(null)}>Cancel</Button><Button onClick={()=>mutateProduct(selectedProduct.id?"PUT":"POST",{...selectedProduct,images:(selectedProduct.images||[]).map(x=>x.url)})}><Check size={14}/> Save candle</Button></div></div></div></div>}
    </main>
  );
}

function DeviceGalleryPicker({onAdd}:{onAdd:(urls:string[])=>void}) {
  const ref=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false);
  async function change(e:ChangeEvent<HTMLInputElement>) {
    const files=Array.from(e.target.files||[]);
    e.target.value="";
    if(!files.length) return;
    setBusy(true);
    try {
      const urls=await Promise.all(files.map(imageToDataUrl));
      onAdd(urls);
    } catch { /* individual picker errors are surfaced by the browser if needed */ }
    finally { setBusy(false); }
  }
  return <><input ref={ref} type="file" accept="image/*" multiple onChange={change} className="hidden"/><button type="button" onClick={()=>ref.current?.click()} disabled={busy} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-black/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[.17em] hover:bg-white disabled:opacity-50"><ImagePlus size={14}/>{busy?"Preparing images…":"Add more images from device"}</button></>;
}

function Field({label,children}:{label:string;children:React.ReactNode}) {
  return <label className="block text-xs font-semibold text-[#211d19]"><span>{label}</span>{children}</label>;
}
