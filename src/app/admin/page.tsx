"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Content={id:string;key:string;type:string;title:string|null;eyebrow:string|null;body:string|null;imageUrl:string|null;imageAlt:string|null;buttonText:string|null;buttonUrl:string|null};
type Collection={id:string;slug:string;title:string;subtitle:string|null;imageUrl:string;imageAlt:string|null;mood:string|null;sortOrder:number};
type Social={id:string;platform:string;label:string|null;url:string};
type Product={id:string;sku:string;slug:string;name:string;shortName:string|null;shortDescription:string|null;description:string;mood:string;category:string;status:string;priceUSD:string|number;sizeLabel:string|null;waxType:string|null;wickType:string|null;burnTimeHours:string|number|null;scentFamily:string|null;scentIntensity:string|null;topNotes:string|null;middleNotes:string|null;baseNotes:string|null;ingredients:string|null;allergens:string|null;careInstructions:string|null;vesselMaterial:string|null;vesselColor:string|null;dimensions:string|null;netWeight:string|null;stock:number;featured:boolean;seoTitle:string|null;seoDescription:string|null;images:{url:string}[]};

const fields=["sku","slug","name","shortName","shortDescription","description","mood","category","status","priceUSD","sizeLabel","waxType","wickType","burnTimeHours","scentFamily","scentIntensity","topNotes","middleNotes","baseNotes","ingredients","allergens","careInstructions","vesselMaterial","vesselColor","dimensions","netWeight","stock","seoTitle","seoDescription"];

export default function AdminPage(){
 const router=useRouter();
 const [user,setUser]=useState<any>(null); const [loading,setLoading]=useState(true);
 const [content,setContent]=useState<Content[]>([]); const [collections,setCollections]=useState<Collection[]>([]); const [socials,setSocials]=useState<Social[]>([]); const [products,setProducts]=useState<Product[]>([]);
 const [selected,setSelected]=useState<Product|null>(null); const [message,setMessage]=useState("");
 useEffect(()=>{(async()=>{const me=await fetch("/api/auth/me").then(r=>r.json()); if(me.user?.role!=="ADMIN"){router.replace("/account");return;} setUser(me.user); const [c,p]=await Promise.all([fetch("/api/admin/content"),fetch("/api/admin/products")]); const cd=await c.json(),pd=await p.json(); setContent(cd.content||[]);setCollections(cd.collections||[]);setSocials(cd.socials||[]);setProducts(pd.products||[]);setLoading(false);})()},[router]);
 if(loading)return <main className="min-h-screen bg-[#f6f1e9] p-10">Loading admin...</main>;
 if(!user)return null;
 const save=async(kind:string,item:any)=>{setMessage("Saving...");const r=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,id:item.id,...item})});setMessage(r.ok?"Saved.":"Could not save.");};
 const saveProduct=async()=>{if(!selected)return;setMessage("Saving product...");const r=await fetch("/api/admin/products",{method:selected.id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...selected,images:(selected.images||[]).map(x=>x.url)})});const d=await r.json();if(r.ok){setMessage("Product saved.");setSelected(null);const p=await fetch("/api/admin/products").then(x=>x.json());setProducts(p.products||[])}else setMessage(d.error||"Could not save.");};
 const logout=async()=>{await fetch("/api/auth/logout",{method:"POST"});router.push("/");router.refresh()};
 return <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
  <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f1e9]/95 px-5 py-4 backdrop-blur md:px-10">
   <div className="mx-auto flex max-w-[1500px] items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.3em] text-[#9c5638]">In The Mood</p><h1 className="serif text-3xl">Store Admin</h1></div><div className="flex gap-4"><Link href="/" className="px-4 py-2 text-xs uppercase tracking-[.15em]">View store</Link><button onClick={logout} className="bg-[#211d19] px-4 py-2 text-xs uppercase tracking-[.15em] text-white">Sign out</button></div></div>
  </header>
  <div className="mx-auto max-w-[1500px] space-y-12 px-5 py-10 md:px-10">
   {message&&<div className="sticky top-[85px] z-30 rounded-xl bg-[#211d19] px-4 py-3 text-sm text-white">{message}</div>}
   <section><div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Website</p><h2 className="serif text-4xl">Banner, story, mission, vision & journal</h2></div>
    <div className="grid gap-5 md:grid-cols-2">{content.map(item=><article key={item.id} className="rounded-2xl bg-white/70 p-6 ring-1 ring-black/5">
      <p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#9c5638]">{item.type}</p><h3 className="serif mt-1 text-2xl">{item.key}</h3>
      <div className="mt-4 space-y-3">{(["eyebrow","title","body","imageUrl","imageAlt","buttonText","buttonUrl"] as const).map(key=><label key={key} className="block text-xs font-semibold capitalize">{key}<textarea rows={key==="body"?4:1} value={item[key]||""} onChange={e=>setContent(v=>v.map(x=>x.id===item.id?{...x,[key]:e.target.value}:x))} className="mt-1 w-full resize-y border border-black/10 bg-white p-3 font-normal outline-none focus:border-[#9c5638]" /></label>)}</div>
      <button onClick={()=>save("content",item)} className="mt-4 bg-[#211d19] px-5 py-3 text-[10px] font-bold uppercase tracking-[.2em] text-white">Save</button>
    </article>)}</div>
   </section>
   <section><div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Collections</p><h2 className="serif text-4xl">Collection images & titles</h2></div>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{collections.map(item=><article key={item.id} className="rounded-2xl bg-white/70 p-6 ring-1 ring-black/5">
      {(["title","subtitle","imageUrl","imageAlt","mood"] as const).map(key=><label key={key} className="mt-3 block text-xs font-semibold capitalize">{key}<input value={item[key]||""} onChange={e=>setCollections(v=>v.map(x=>x.id===item.id?{...x,[key]:e.target.value}:x))} className="mt-1 w-full border border-black/10 bg-white p-3 font-normal outline-none focus:border-[#9c5638]" /></label>)}
      <button onClick={()=>save("collection",item)} className="mt-4 bg-[#211d19] px-5 py-3 text-[10px] font-bold uppercase tracking-[.2em] text-white">Save</button>
    </article>)}</div>
   </section>
   <section><div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Social</p><h2 className="serif text-4xl">Instagram, TikTok & Facebook</h2></div>
    <div className="grid gap-5 md:grid-cols-3">{socials.map(item=><article key={item.id} className="rounded-2xl bg-white/70 p-6 ring-1 ring-black/5"><p className="font-bold uppercase tracking-[.2em]">{item.platform}</p><input value={item.url} onChange={e=>setSocials(v=>v.map(x=>x.id===item.id?{...x,url:e.target.value}:x))} className="mt-4 w-full border border-black/10 bg-white p-3 outline-none focus:border-[#9c5638]" /><button onClick={()=>save("social",item)} className="mt-4 bg-[#211d19] px-5 py-3 text-[10px] font-bold uppercase tracking-[.2em] text-white">Save</button></article>)}</div>
   </section>
   <section><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Products</p><h2 className="serif text-4xl">Candle catalogue</h2></div><button onClick={()=>setSelected({id:"",sku:"",slug:"",name:"",shortName:null,shortDescription:null,description:"",mood:"Relaxing",category:"Candles",status:"DRAFT",priceUSD:19,sizeLabel:"Standard jar",waxType:"Soy wax",wickType:"Cotton wick",burnTimeHours:null,scentFamily:null,scentIntensity:null,topNotes:null,middleNotes:null,baseNotes:null,ingredients:null,allergens:null,careInstructions:null,vesselMaterial:null,vesselColor:null,dimensions:null,netWeight:null,stock:0,featured:false,seoTitle:null,seoDescription:null,images:[]})} className="bg-[#211d19] px-5 py-3 text-[10px] font-bold uppercase tracking-[.2em] text-white">+ Add product</button></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{products.map(p=><button key={p.id} onClick={()=>setSelected(p)} className="text-left rounded-2xl bg-white/70 p-5 ring-1 ring-black/5 hover:ring-[#9c5638]"><div className="flex gap-4">{p.images?.[0]?.url&&<img src={p.images[0].url} alt="" className="h-24 w-20 object-cover" />}<div><h3 className="serif text-2xl">{p.name}</h3><p className="text-xs text-[#776f67]">{p.mood} · {p.status} · stock {p.stock}</p><p className="mt-2 text-xs">{p.sku}</p></div></div></button>)}</div>
   </section>
  </div>
  {selected&&<div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 md:p-10"><div className="mx-auto max-w-5xl rounded-3xl bg-[#f6f1e9] p-6 md:p-10"><div className="flex justify-between"><h2 className="serif text-4xl">{selected.id?"Edit product":"New product"}</h2><button onClick={()=>setSelected(null)} className="text-xl">×</button></div><div className="mt-7 grid gap-4 md:grid-cols-2">{fields.map(key=><label key={key} className="text-xs font-semibold capitalize">{key.replace(/([A-Z])/g," $1")}<textarea rows={key==="description"||key==="careInstructions"?3:1} value={(selected as any)[key]??""} onChange={e=>setSelected({...selected,[key]:e.target.value})} className="mt-1 w-full border border-black/10 bg-white p-3 font-normal outline-none focus:border-[#9c5638]" /></label>)}</div><label className="mt-4 block text-xs font-semibold">Image URLs <textarea rows={4} value={(selected.images||[]).map(x=>x.url).join("\n")} onChange={e=>setSelected({...selected,images:e.target.value.split(/\n+/).filter(Boolean).map(url=>({url}))})} className="mt-1 w-full border border-black/10 bg-white p-3 font-normal" /></label><div className="mt-6 flex gap-3"><button onClick={saveProduct} className="bg-[#211d19] px-6 py-4 text-xs font-bold uppercase tracking-[.2em] text-white">Save product</button><button onClick={()=>setSelected(null)} className="border border-black/20 px-6 py-4 text-xs font-bold uppercase tracking-[.2em]">Cancel</button></div></div></div>}
 </main>
}
