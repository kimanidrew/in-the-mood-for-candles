"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BagProduct = { id:string; name:string; slug?:string; mood?:string; img:string; priceUSD?:number|null };
type BagLine = BagProduct & { quantity:number };

const STORAGE_KEY = "imc-bag";

export default function SiteBag() {
  const [open,setOpen] = useState(false);
  const [lines,setLines] = useState<BagLine[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(saved)) setLines(saved);
      } catch {}
    };

    const handleOpen = () => {
      load();
      setOpen(true);
    };

    const handleAdd = (event: Event) => {
      const detail = (event as CustomEvent<{ product?: BagProduct }>).detail;
      const product = detail?.product;
      if (!product?.id || !product.name || !product.img) return;

      setLines(current => {
        const existing = current.find(line => line.id === product.id);
        if (existing) {
          return current.map(line =>
            line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
          );
        }
        return [...current, { ...product, quantity: 1 }];
      });
      setOpen(true);
    };

    load();
    window.addEventListener("imc:open-bag", handleOpen);
    window.addEventListener("imc:add-to-bag", handleAdd);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("imc:open-bag", handleOpen);
      window.removeEventListener("imc:add-to-bag", handleAdd);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify(lines));
    } catch {}
    window.dispatchEvent(new CustomEvent("imc:bag-changed",{
      detail:{count:lines.reduce((sum,line)=>sum+line.quantity,0)}
    }));
  },[lines]);

  const count = useMemo(()=>lines.reduce((sum,line)=>sum+line.quantity,0),[lines]);

  function change(id:string,amount:number) {
    setLines(current=>current.map(line=>line.id===id?{...line,quantity:Math.max(0,line.quantity+amount)}:line).filter(line=>line.quantity>0));
  }

  function removeItem(id:string) {
    setLines(current => current.filter(line => line.id !== id));
  }

  function whatsapp() {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000";
    const message = "Hello In The Mood For! ✨\nI'd like to order:\n" +
      lines.map(line=>"• "+line.name+" × "+line.quantity).join("\n") +
      "\n\nPlease confirm the final price, availability and delivery details with me.";
    window.open("https://wa.me/"+number+"?text="+encodeURIComponent(message),"_blank");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOpen(false)} className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-sm"/>
          <motion.aside initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:260}} className="fixed right-0 top-0 z-[71] flex h-full w-full max-w-[460px] flex-col bg-[#f6f1e9] text-[#211d19] shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div><p className="text-[12px] font-bold uppercase text-[#776f67]">Your</p><h3 className="serif text-2xl">Bag <span className="text-base font-normal">({count})</span></h3></div>
              <button onClick={()=>setOpen(false)} aria-label="Close bag"><X/></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {lines.length===0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center"><ShoppingBag size={24} strokeWidth={1.5}/><p className="serif mt-4 text-2xl">Your bag is empty.</p><a href="/#products" onClick={()=>setOpen(false)} className="mt-5 border-b border-black pb-1 text-[12px] font-bold uppercase tracking-[.18em]">discover candles</a></div>
              ) : (
                <div className="space-y-5">
                  {lines.map(line=>(
                    <div key={line.id} className="flex gap-4 border-b border-black/10 pb-5">
                      <Image src={line.img} width={80} height={96} sizes="80px" unoptimized={line.img.startsWith("data:image/")} className="h-24 w-20 object-cover" alt={line.name}/>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <span className="serif text-lg">{line.name}</span>
                          <button
                            type="button"
                            onClick={()=>removeItem(line.id)}
                            className="shrink-0 rounded-full p-2 text-[#776f67] transition hover:bg-black/5 hover:text-[#211d19]"
                            aria-label={`Remove ${line.name} from bag`}
                            title="Remove item"
                          >
                            <Trash2 size={16} strokeWidth={1.6}/>
                          </button>
                        </div>
                        <div className="mt-auto flex items-center gap-3 pt-5">
                          <button onClick={()=>change(line.id,-1)} className="rounded-full border border-black/15 p-1" aria-label="Decrease quantity"><Minus size={12}/></button>
                          <span className="text-xs">{line.quantity}</span>
                          <button onClick={()=>change(line.id,1)} className="rounded-full border border-black/15 p-1" aria-label="Increase quantity"><Plus size={12}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {lines.length>0 && (
              <div className="border-t border-black/10 p-6">
                <button onClick={whatsapp} className="w-full bg-[#211d19] py-4 text-[12px] font-bold uppercase tracking-[.2em] text-white transition hover:bg-[#9c5638]">order via WhatsApp</button>
                <p className="mt-3 text-center text-[12px] text-[#776f67]">We'll confirm availability, delivery and payment with you on WhatsApp.</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
