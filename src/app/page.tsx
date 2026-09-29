"use client";
import Image from "next/image";
import {useEffect,useMemo,useState} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {ArrowRight,ChevronDown,Heart,Instagram,Menu,Minus,Plus,ShoppingBag,X} from "lucide-react";

const products=[
{name:"Pandan Coconut",mood:"Tropical",priceUSD:19,desc:"Creamy coconut, green pandan and a soft tropical finish.",img:"https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85"},
{name:"Mango Lychee Jelly",mood:"Playful",priceUSD:19,desc:"Juicy mango and lychee with a bright, playful sweetness.",img:"https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=1000&q=85"},
{name:"Thai Massage",mood:"Relaxing",priceUSD:19,desc:"A calming spa-inspired blend for slow evenings.",img:"https://images.unsplash.com/photo-1602874801006-e26d7b7b8e8a?auto=format&fit=crop&w=1000&q=85"},
{name:"Kopitiam Mornings",mood:"Energising",priceUSD:19,desc:"Roasted coffee, condensed milk and vanilla — cafe mornings in a jar.",img:"https://images.unsplash.com/photo-1603905179139-db12ab535b0b?auto=format&fit=crop&w=1000&q=85"},
{name:"Croissant in Paris",mood:"Romantic",priceUSD:19,desc:"Warm pastry, buttery comfort and a little Parisian romance.",img:"https://images.unsplash.com/photo-1605651202774-7d573fd12f8f?auto=format&fit=crop&w=1000&q=85"},
{name:"Winter Forest",mood:"Cosy",priceUSD:18,desc:"Evergreen woods, cool air and a quiet cabin feeling.",img:"https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=85"},
{name:"Cosy Christmas",mood:"Festive",priceUSD:19,desc:"A warm festive blend made for glowing nights.",img:"https://images.unsplash.com/photo-1602874801006-e26d7b7b8e8a?auto=format&fit=crop&w=1000&q=85"},
{name:"Small Towns in Italy",mood:"Dreamy",priceUSD:19,desc:"A sun-warmed, leisurely Mediterranean escape.",img:"https://images.unsplash.com/photo-1523293836416-66be4f2b0b3b?auto=format&fit=crop&w=1000&q=85"}
];
type Cart=Record<string,number>;

type CurrencyInfo={code:string;locale:string;label:string};
const CURRENCY_BY_ZONE:Record<string,CurrencyInfo>={
 "Africa/Nairobi":{code:"KES",locale:"en-KE",label:"Kenya"},"Africa/Kampala":{code:"UGX",locale:"en-UG",label:"Uganda"},"Africa/Dar_es_Salaam":{code:"TZS",locale:"sw-TZ",label:"Tanzania"},"Africa/Kigali":{code:"RWF",locale:"rw-RW",label:"Rwanda"},"Africa/Lagos":{code:"NGN",locale:"en-NG",label:"Nigeria"},"Africa/Accra":{code:"GHS",locale:"en-GH",label:"Ghana"},"Africa/Johannesburg":{code:"ZAR",locale:"en-ZA",label:"South Africa"},"Europe/London":{code:"GBP",locale:"en-GB",label:"United Kingdom"},"Europe/Paris":{code:"EUR",locale:"en-FR",label:"Europe"},"Europe/Berlin":{code:"EUR",locale:"de-DE",label:"Europe"},"Asia/Dubai":{code:"AED",locale:"en-AE",label:"United Arab Emirates"},"Asia/Kolkata":{code:"INR",locale:"en-IN",label:"India"},"Asia/Tokyo":{code:"JPY",locale:"ja-JP",label:"Japan"},"Asia/Singapore":{code:"SGD",locale:"en-SG",label:"Singapore"},"Asia/Shanghai":{code:"CNY",locale:"zh-CN",label:"China"},"Australia/Sydney":{code:"AUD",locale:"en-AU",label:"Australia"},"America/New_York":{code:"USD",locale:"en-US",label:"United States"},"America/Los_Angeles":{code:"USD",locale:"en-US",label:"United States"},"America/Toronto":{code:"CAD",locale:"en-CA",label:"Canada"}
};
const FALLBACK_CURRENCY:CurrencyInfo={code:"USD",locale:"en-US",label:"United States"};
function detectCurrency():CurrencyInfo{
 if(typeof window==="undefined") return FALLBACK_CURRENCY;
 const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
 if(CURRENCY_BY_ZONE[zone]) return CURRENCY_BY_ZONE[zone];
 const region=(navigator.language||"en-US").split("-")[1]?.toUpperCase();
 const byRegion:Record<string,CurrencyInfo>={KE:{code:"KES",locale:"en-KE",label:"Kenya"},GB:{code:"GBP",locale:"en-GB",label:"United Kingdom"},CA:{code:"CAD",locale:"en-CA",label:"Canada"},AU:{code:"AUD",locale:"en-AU",label:"Australia"},IN:{code:"INR",locale:"en-IN",label:"India"},JP:{code:"JPY",locale:"ja-JP",label:"Japan"},SG:{code:"SGD",locale:"en-SG",label:"Singapore"},ZA:{code:"ZAR",locale:"en-ZA",label:"South Africa"},NG:{code:"NGN",locale:"en-NG",label:"Nigeria"},GH:{code:"GHS",locale:"en-GH",label:"Ghana"},AE:{code:"AED",locale:"en-AE",label:"United Arab Emirates"},CN:{code:"CNY",locale:"zh-CN",label:"China"}};
 return byRegion[region||""]||FALLBACK_CURRENCY;
}
const FALLBACK_RATES:Record<string,number>={USD:1,KES:129,GBP:.74,EUR:.85,CAD:1.38,AUD:1.52,INR:88,JPY:149,SGD:1.28,AED:3.67,CNY:7.1,ZAR:17.3,NGN:1540,GHS:12.5,UGX:3500,TZS:2600,RWF:1450};
function formatMoney(amount:number,info:CurrencyInfo){try{return new Intl.NumberFormat(info.locale,{style:"currency",currency:info.code,maximumFractionDigits:info.code==="JPY"?0:2}).format(amount)}catch{return info.code+" "+amount.toFixed(2)}}

export default function Home(){
 const [filter,setFilter]=useState("ALL");
 const [cart,setCart]=useState<Cart>({});
 const [bag,setBag]=useState(false);
 const [menu,setMenu]=useState(false);
 const [scrolled,setScrolled]=useState(false);
 const [currency,setCurrency]=useState<CurrencyInfo>(FALLBACK_CURRENCY);
 const [rate,setRate]=useState(1);
 useEffect(()=>{setCurrency(detectCurrency())},[]);
 useEffect(()=>{if(currency.code==="USD"){setRate(1);return;} let cancelled=false; fetch("https://api.frankfurter.app/latest?from=USD&to="+currency.code).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(!cancelled&&d?.rates?.[currency.code])setRate(Number(d.rates[currency.code]))}).catch(()=>{if(!cancelled)setRate(FALLBACK_RATES[currency.code]||1)}); return()=>{cancelled=true}},[currency.code]);
 useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>12);onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[]);
 const shown=useMemo(()=>filter==="ALL"?products:products.filter(p=>p.mood===filter),[filter]);
 const totalUSD=Object.entries(cart).reduce((s,[name,q])=>s+(products.find(p=>p.name===name)?.priceUSD||0)*q,0);
 const total=totalUSD*rate;
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 const add=(name:string)=>setCart(c=>({...c,[name]:(c[name]||0)+1}));
 const change=(name:string,n:number)=>setCart(c=>{const x={...c,[name]:Math.max(0,(c[name]||0)+n)};if(!x[name])delete x[name];return x});
 const whatsapp=()=>{
   const number=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||"254700000000";
   const lines=Object.entries(cart).map(([n,q])=>"• "+n+" × "+q);
   const msg="Hello In The Mood For! ✨\nI'd like to order:\n"+lines.join("\n")+"\n\nEstimated total: "+formatMoney(total,currency)+".";
   window.open("https://wa.me/"+number+"?text="+encodeURIComponent(msg),"_blank");
 };
 return <main className="grain min-h-screen overflow-hidden"><div aria-hidden="true" className="app-candle-collage" /><div className="app-content">
  <header className={"fixed top-0 z-40 w-full transition-all duration-500 "+(scrolled?"border-b border-black/10 bg-[#f7f3ec]/92 shadow-[0_8px_30px_rgba(33,29,25,0.08)] backdrop-blur-xl":"border-b border-white/15 bg-transparent")}>
   <div className="mx-auto flex h-[82px] max-w-[1400px] items-center justify-between px-5 md:px-10">
    <button aria-label="In The Mood Candles home" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="group flex items-center gap-3 text-left">
      <span className="flex h-12 w-12 items-center justify-center">
        <Image src="/tm-logo.svg" alt="In The Mood Candles TM logo" width={48} height={48} priority className="h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className={"leading-none transition-colors duration-500 "+(scrolled?"text-[#211d19]":"text-white drop-shadow-[0_1px_8px_rgba(0,0,0,.25)]")}>
        <span className="mood-brand block text-[16px] leading-none tracking-[.04em] sm:text-[17px]">in the <strong className="font-bold">mood</strong> for</span>
        <span className={"mt-1 block text-[8px] font-semibold uppercase tracking-[.34em] "+(scrolled?"text-[#776f67]":"text-white/75")}>candles</span>
      </span>
    </button>
    <nav className="hidden items-center gap-1 md:flex">
      {[["shop","#shop"],["our story","#story"],["instagram","https://www.instagram.com/inthemoodfor_candles/"]].map(([label,href])=>
        <a key={label} href={href} target={label==="instagram"?"_blank":undefined} rel={label==="instagram"?"noreferrer":undefined} className={"rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] transition-all duration-300 "+(scrolled?"text-[#211d19] hover:bg-black/5":"text-white hover:bg-white/15 drop-shadow-[0_1px_8px_rgba(0,0,0,.2)]")}>{label}</a>
      )}
    </nav>
    <div className="flex items-center gap-1.5">
      <button aria-label="Open shopping bag" className={"relative rounded-full p-2.5 transition-all duration-300 "+(scrolled?"text-[#211d19] hover:bg-black/5":"text-white hover:bg-white/15 drop-shadow-[0_1px_8px_rgba(0,0,0,.2)]")} onClick={()=>setBag(true)}>
        <ShoppingBag size={19}/>{count>0&&<span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#9c5638] text-[9px] font-bold text-white">{count}</span>}
      </button>
      <button aria-label={menu?"Close menu":"Open menu"} className={"rounded-full p-2.5 transition-all duration-300 md:hidden "+(scrolled?"text-[#211d19] hover:bg-black/5":"text-white hover:bg-white/15")} onClick={()=>setMenu(!menu)}>{menu?<X size={21}/>:<Menu size={21}/>}</button>
    </div>
   </div>
   <AnimatePresence>{menu&&<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden border-t border-black/10 bg-[#f7f3ec]/98 px-5 py-5 shadow-xl backdrop-blur-xl md:hidden"><div className="flex flex-col gap-1">
     {[["shop","#shop"],["our story","#story"],["instagram","https://www.instagram.com/inthemoodfor_candles/"]].map(([label,href])=><a key={label} href={href} target={label==="instagram"?"_blank":undefined} rel={label==="instagram"?"noreferrer":undefined} onClick={()=>setMenu(false)} className="rounded-2xl px-4 py-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#211d19] transition hover:bg-black/5">{label}</a>)}
   </div></motion.div>}</AnimatePresence>
  </header>

  <section className="relative flex min-h-[92vh] items-end overflow-hidden px-5 pb-14 pt-28 md:min-h-[820px] md:px-10 md:pb-20">
   <div className="absolute inset-0"><Image src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=2200&q=90" fill priority sizes="100vw" className="object-cover object-center" alt="Candle in a warm interior"/></div>
   <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/10"/><div className="absolute left-5 top-28 z-10 md:left-10 md:top-32"><div className="flex items-center justify-center"><Image src="/tm-logo.svg" alt="In The Mood Candles logo" width={80} height={80} className="h-16 w-16 object-contain md:h-20 md:w-20" /></div></div>
   <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.9}} className="relative z-10 max-w-3xl text-white">
    <p className="mb-4 text-[10px] font-bold uppercase tracking-[.28em]">candles • gifts • memories</p>
    <h1 className="serif text-6xl leading-[.9] tracking-[-.045em] md:text-8xl">Light a candle.<br/><span className="italic">Travel somewhere.</span></h1>
    <p className="mt-7 max-w-lg text-sm leading-6 text-white/85 md:text-base">Hand-poured scents inspired by places, food and the little moments we never want to forget.</p>
    <a href="#shop" className="mt-8 inline-flex items-center gap-3 border border-white/70 px-6 py-3 text-[11px] font-bold uppercase tracking-[.18em] transition hover:bg-white hover:text-black">shop the collection <ArrowRight size={15}/></a>
   </motion.div>
  </section>

  <section className="border-b border-t border-black/10 bg-[#e9e1d6] px-5 py-4 md:px-10"><div className="hide-scroll mx-auto flex max-w-[1400px] justify-between gap-8 overflow-auto whitespace-nowrap text-[10px] font-bold uppercase tracking-[.2em]"><span>hand-poured</span><span>soy wax</span><span>inspired by travel</span><span>small-batch care</span><span>beautifully giftable</span></div></section>

  <section id="shop" className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
   <div className="mb-12 flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#9c5638]">the collection</p><h2 className="serif text-5xl tracking-[-.04em] md:text-6xl">Find your mood.</h2></div><div className="hide-scroll -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 md:max-w-none md:overflow-visible">{["ALL","Relaxing","Romantic","Cosy","Playful","Tropical","Energising","Festive","Dreamy"].map(x=><button key={x} onClick={()=>setFilter(x)} className={"rounded-full border px-5 py-2 text-[10px] font-bold tracking-[.18em] transition "+(filter===x?"border-[#211d19] bg-[#211d19] text-white":"border-black/15 hover:border-black/40")}>{x}</button>)}</div></div>
   <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
    {shown.map((p,i)=><motion.article layout key={p.name} initial={{opacity:0,y:25}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-50px"}} transition={{delay:i*.04,duration:.5}} className="group">
      <div className="relative aspect-[.88] overflow-hidden rounded-[1.35rem] bg-[#ded5c8] shadow-[0_12px_35px_rgba(33,29,25,0.08)] ring-1 ring-black/5"><Image src={p.img} alt={p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.045]"/><div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100"/><div className="absolute left-3 top-3 rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-white backdrop-blur-md">{p.mood}</div><button aria-label={"Save "+p.name} className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 text-[#211d19] shadow-lg backdrop-blur transition hover:scale-105"><Heart size={15}/></button><button onClick={()=>add(p.name)} className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 py-3.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#211d19] shadow-xl transition duration-300 hover:bg-[#211d19] hover:text-white sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">add to bag <span className="ml-1">+</span></button></div>
      <div className="px-1 pt-4"><div className="flex items-start justify-between gap-3"><div><h3 className="serif text-[21px] leading-tight">{p.name}</h3><p className="mt-1 text-[9px] font-bold uppercase tracking-[.15em] text-[#9c5638]">{p.mood} collection</p></div><span className="whitespace-nowrap rounded-full bg-[#eee7de] px-3 py-1.5 text-sm font-semibold">{formatMoney(p.priceUSD*rate,currency)}</span></div><p className="mt-3 text-xs leading-5 text-[#776f67]">{p.desc}</p></div>
    </motion.article>)}
   </div>
  </section>

  <section id="story" className="bg-[#211d19] px-5 py-24 text-[#f7f3ec] md:px-10 md:py-32"><div className="mx-auto grid max-w-[1200px] gap-14 md:grid-cols-[.8fr_1.2fr] md:items-center"><div><p className="mb-5 text-[10px] font-bold uppercase tracking-[.25em] text-[#d2a38c]">our story</p><h2 className="serif text-5xl leading-none md:text-7xl">Scent is a<br/><span className="italic">memory.</span></h2></div><div className="max-w-xl text-sm leading-7 text-white/70 md:text-base"><p>We believe there is magic in lighting a candle when the scent fills the room. It can take you to cherished places, treasured moments and heartfelt memories.</p><p className="mt-6">Inspired by travel, food and the places that stay with us, every candle is made to turn an ordinary moment into somewhere worth remembering.</p><a href="https://www.instagram.com/inthemoodfor_candles/" target="_blank" className="mt-8 inline-flex items-center gap-3 border-b border-white/40 pb-2 text-[10px] font-bold uppercase tracking-[.2em]">follow the journey <Instagram size={15}/></a></div></div></section>

  <footer className="px-5 py-10 md:px-10"><div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 border-t border-black/10 pt-7 text-[10px] font-semibold uppercase tracking-[.15em] md:flex-row"><span>© {new Date().getFullYear()} in the mood for</span><span>made for slow moments</span></div></footer>

  <AnimatePresence>{bag&&<><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setBag(false)} className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"/><motion.aside initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:260}} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-[#f7f3ec] shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-6 py-5"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#776f67]">your</p><h3 className="serif text-2xl">Bag</h3></div><button onClick={()=>setBag(false)}><X/></button></div><div className="flex-1 overflow-auto p-6">{Object.keys(cart).length===0?<div className="flex h-full flex-col items-center justify-center text-center"><ShoppingBag size={25}/><p className="serif mt-4 text-2xl">Your bag is empty.</p><a href="#shop" onClick={()=>setBag(false)} className="mt-5 border-b border-black pb-1 text-[10px] font-bold uppercase tracking-[.18em]">discover candles</a></div>:<div className="space-y-5">{Object.entries(cart).map(([name,q])=>{const p=products.find(x=>x.name===name)!;return <div key={name} className="flex gap-4 border-b border-black/10 pb-5"><Image src={p.img} width={80} height={96} sizes="80px" className="h-24 w-20 object-cover" alt=""/><div className="flex flex-1 flex-col"><div className="flex justify-between"><span className="serif text-lg">{name}</span><span>{formatMoney(p.priceUSD*rate*q,currency)}</span></div><div className="mt-auto flex items-center gap-3"><button onClick={()=>change(name,-1)} className="rounded-full border p-1"><Minus size={12}/></button><span className="text-xs">{q}</span><button onClick={()=>change(name,1)} className="rounded-full border p-1"><Plus size={12}/></button></div></div></div>})}</div>}</div>{count>0&&<div className="border-t border-black/10 p-6"><div className="mb-5 flex justify-between text-sm"><span>Estimated total</span><span className="font-semibold">{formatMoney(total,currency)}</span></div><button onClick={whatsapp} className="w-full bg-[#211d19] py-4 text-[10px] font-bold uppercase tracking-[.2em] text-white transition hover:bg-[#9c5638]">order via WhatsApp</button><p className="mt-3 text-center text-[10px] text-[#776f67]">We'll confirm availability, delivery and payment with you on WhatsApp.</p></div>}</motion.aside></>}</AnimatePresence>
 </div>
 </main>
}