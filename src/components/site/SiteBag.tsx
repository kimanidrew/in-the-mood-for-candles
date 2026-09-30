"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BagProduct = { id:string; name:string; slug?:string; mood?:string; img:string; priceUSD?:number|null };
type BagLine = BagProduct & { quantity:number };

const CURRENCIES:Record<string,{code:string;locale:string}> = {
  "Africa/Nairobi":{code:"KES",locale:"en-KE"},
  "Africa/Kampala":{code:"UGX",locale:"en-UG"},
  "Africa/Dar_es_Salaam":{code:"TZS",locale:"sw-TZ"},
  "Africa/Kigali":{code:"RWF",locale:"rw-RW"},
  "Africa/Lagos":{code:"NGN",locale:"en-NG"},
  "Africa/Accra":{code:"GHS",locale:"en-GH"},
  "Africa/Johannesburg":{code:"ZAR",locale:"en-ZA"},
  "Europe/London":{code:"GBP",locale:"en-GB"},
  "Europe/Paris":{code:"EUR",locale:"en-FR"},
  "Europe/Berlin":{code:"EUR",locale:"de-DE"},
  "Asia/Dubai":{code:"AED",locale:"en-AE"},
  "Asia/Kolkata":{code:"INR",locale:"en-IN"},
  "Asia/Tokyo":{code:"JPY",locale:"ja-JP"},
  "Asia/Singapore":{code:"SGD",locale:"en-SG"},
  "Asia/Shanghai":{code:"CNY",locale:"zh-CN"},
  "Australia/Sydney":{code:"AUD",locale:"en-AU"},
  "America/New_York":{code:"USD",locale:"en-US"},
  "America/Los_Angeles":{code:"USD",locale:"en-US"},
  "America/Toronto":{code:"CAD",locale:"en-CA"},
};

const FALLBACK_RATES:Record<string,number> = { USD:1,KES:129,GBP:.74,EUR:.85,CAD:1.38,AUD:1.52,INR:88,JPY:149,SGD:1.28,AED:3.67,CNY:7.1,ZAR:17.3,NGN:1540,GHS:12.5,UGX:3500,TZS:2600,RWF:1450 };

function currencyForBrowser() {
  if (typeof window === "undefined") return { code:"USD", locale:"en-US" };
  return CURRENCIES[Intl.DateTimeFormat().resolvedOptions().timeZone] || { code:"USD", locale:"en-US" };
}

function money(value:number, currency:{code:string;locale:string}) {
  return new Intl.NumberFormat(currency.locale,{style:"currency",currency:currency.code,maximumFractionDigits:currency.code==="JPY"?0:2}).format(value);
}

const STORAGE_KEY = "imc-bag";

export default function SiteBag() {
  const [open,setOpen] = useState(false);
  const [lines,setLines] = useState<BagLine[]>([]);
  const [currency,setCurrency] = useState({code:"USD",locale:"en-US"});
  const [rate,setRate] = useState(1);

  useEffect(() => {
    setCurrency(currencyForBrowser());
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setLines(saved);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY,JSON.stringify(lines));
    window.dispatchEvent(new CustomEvent("imc:bag-changed",{detail:{count:lines.reduce((sum,line)=>sum+line.quantity,0)}}));
  },[lines]);

  useEffect(() => {
    const add = (event:Event) => {
      const product = (event as CustomEvent<{product:BagProduct}>).detail?.product;
      if (!product) return;
      setLines(current => {
        const existing = current.find(line => line.id === product.id);
        if (existing) return current.map(line => line.id===product.id ? {...line,quantity:line.quantity+1} : line);
        return [...current,{...product,quantity:1}];
      });
      setOpen(true);
    };
    const openBag = () => setOpen(true);
    window.addEventListener("imc:add-to-bag",add);
    window.addEventListener("imc:open-bag",openBag);
    return () => {
      window.removeEventListener("imc:add-to-bag",add);
      window.removeEventListener("imc:open-bag",openBag);
    };
  },[]);

  useEffect(() => {
    if (currency.code==="USD") { setRate(1); return; }
    let cancelled=false;
    fetch("https://api.frankfurter.app/latest?from=USD&to="+currency.code)
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>{if(!cancelled && data?.rates?.[currency.code]) setRate(Number(data.rates[currency.code]));})
      .catch(()=>{if(!cancelled) setRate(FALLBACK_RATES[currency.code]||1);});
    return()=>{cancelled=true};
  },[currency.code]);

  const count = useMemo(()=>lines.reduce((sum,line)=>sum+line.quantity,0),[lines]);
  const totalUSD = useMemo(()=>lines.reduce((sum,line)=>sum+(line.priceUSD||0)*line.quantity,0),[lines]);
  const total = totalUSD*rate;

  function change(id:string,amount:number) {
    setLines(current=>current.map(line=>line.id===id?{...line,quantity:Math.max(0,line.quantity+amount)}:line).filter(line=>line.quantity>0));
  }

  function whatsapp() {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000";
    const message = "Hello In The Mood For! ✨\nI'd like to order:\n" +
      lines.map(line=>"• "+line.name+" × "+line.quantity).join("\n") +
      "\n\nEstimated total: "+money(total,currency)+".";
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
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3"><span className="serif text-lg">{line.name}</span>{line.priceUSD != null && <span className="text-sm">{money(line.priceUSD*rate*line.quantity,currency)}</span>}</div>
                        <div className="mt-auto flex items-center gap-3">
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
                {totalUSD>0 && <div className="mb-5 flex justify-between text-sm"><span>Estimated total</span><span className="font-semibold">{money(total,currency)}</span></div>}
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
