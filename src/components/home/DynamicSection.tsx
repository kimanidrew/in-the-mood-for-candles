"use client";

import Image from "next/image";
import { ArrowRight, Quote } from "lucide-react";
import { motion } from "framer-motion";

export type SectionLayout = "AUTO"|"CINEMATIC"|"SPLIT_LEFT"|"SPLIT_RIGHT"|"STATEMENT"|"COLLAGE"|"FULL_BLEED"|"PRODUCT_SHOWCASE"|"QUOTE"|"FLOATING_CARD"|"MINIMAL";
export type DynamicSectionData = { key:string; type?:string; layout?:SectionLayout|string|null; title?:string|null; eyebrow?:string|null; body?:string|null; imageUrl?:string|null; imageAlt?:string|null; buttonText?:string|null; buttonUrl?:string|null; sortOrder?:number; isActive?:boolean };

export const SECTION_STYLES:{value:SectionLayout;label:string;description:string;sampleImage:string}[]=[
{value:"AUTO",label:"Auto mix",description:"Rotates through editorial layouts so each section feels different.",sampleImage:"/section-samples/cinematic.svg"},
{value:"CINEMATIC",label:"Cinematic",description:"Full-width image, atmospheric overlay and strong editorial copy.",sampleImage:"/section-samples/cinematic.svg"},
{value:"SPLIT_LEFT",label:"Split left",description:"Image-led editorial layout with the image on the left.",sampleImage:"/section-samples/split-left.svg"},
{value:"SPLIT_RIGHT",label:"Split right",description:"Editorial story with the image moved to the right.",sampleImage:"/section-samples/split-right.svg"},
{value:"STATEMENT",label:"Statement",description:"Large typography and generous space for a brand message.",sampleImage:"/section-samples/statement.svg"},
{value:"COLLAGE",label:"Collage",description:"Layered image composition with a magazine-like feel.",sampleImage:"/section-samples/collage.svg"},
{value:"FULL_BLEED",label:"Full bleed",description:"Immersive photography with centered copy over the image.",sampleImage:"/section-samples/full-bleed.svg"},
{value:"PRODUCT_SHOWCASE",label:"Product showcase",description:"A product-style composition for highlighting a scent or ritual.",sampleImage:"/section-samples/product-showcase.svg"},
{value:"QUOTE",label:"Quote",description:"Bold typography for memorable copy and short statements.",sampleImage:"/section-samples/quote.svg"},
{value:"FLOATING_CARD",label:"Floating card",description:"Image background with an elegant content card floating above it.",sampleImage:"/section-samples/floating-card.svg"},
{value:"MINIMAL",label:"Minimal",description:"Quiet, refined copy block for breathing room between sections.",sampleImage:"/section-samples/minimal.svg"}];

export const SAMPLE_SECTION:DynamicSectionData={key:"sample-section",type:"GENERAL",layout:"CINEMATIC",eyebrow:"A new mood",title:"Light something beautiful.",body:"A small flame can change the atmosphere of an entire room. Let the scent become part of the moment.",imageAlt:"Sample candle scene",buttonText:"discover the mood",buttonUrl:"#products"};
const AUTO_LAYOUTS:SectionLayout[]=["CINEMATIC","SPLIT_LEFT","STATEMENT","SPLIT_RIGHT","COLLAGE","QUOTE","FULL_BLEED","PRODUCT_SHOWCASE","FLOATING_CARD","MINIMAL"];
function resolveLayout(layout:DynamicSectionData["layout"],index:number){if(layout&&layout!=="AUTO"&&AUTO_LAYOUTS.includes(layout as SectionLayout))return layout as SectionLayout;return AUTO_LAYOUTS[index%AUTO_LAYOUTS.length]}
function paragraphs(body?:string|null){return(body||"").split(/\n\n/).filter(Boolean)}
const CANDLE_IMAGE_POOL = [
  "https://images.pexels.com/photos/6755743/pexels-photo-6755743.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/10771904/pexels-photo-10771904.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/5782650/pexels-photo-5782650.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/6311846/pexels-photo-6311846.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/5782675/pexels-photo-5782675.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/8247308/pexels-photo-8247308.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/9765419/pexels-photo-9765419.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/10771942/pexels-photo-10771942.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/12480609/pexels-photo-12480609.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/6798396/pexels-photo-6798396.jpeg?auto=compress&cs=tinysrgb&w=1600",
];

function candleImageForSection(section:DynamicSectionData,index:number){
  const seed = Array.from(section.key || "section").reduce((total,char)=>total + char.charCodeAt(0), index);
  return CANDLE_IMAGE_POOL[Math.abs(seed) % CANDLE_IMAGE_POOL.length];
}

function imageProps(section:DynamicSectionData,index=0){
  const src=section.imageUrl || candleImageForSection(section,index);
  return{src,alt:section.imageAlt||section.title||"Candle editorial",unoptimized:src.startsWith("data:image/")};
}

function UnderTextImage({image}:{image:ReturnType<typeof imageProps>}){
  return <div className="absolute inset-0 overflow-hidden">
    <Image {...image} fill sizes="100vw" className="object-cover blur-[18px] scale-110"/>
    <div className="absolute inset-0 bg-black/10"/>
  </div>;
}
function Copy({section,dark=false,center=false}:{section:DynamicSectionData;dark?:boolean;center?:boolean}){return <div className={center?"mx-auto max-w-3xl text-center":"max-w-2xl"}>{section.eyebrow&&<p className={`mb-5 text-[10px] font-bold uppercase tracking-[.34em] ${dark?"text-[#d2a38c]":"text-[#9c5638]"}`}>{section.eyebrow}</p>}{section.title&&<h2 className={`serif text-5xl leading-[.94] md:text-7xl ${dark?"text-[#f7f3ec]":"text-[#211d19]"}`}>{section.title}</h2>}{section.body&&<div className={`mt-7 space-y-5 text-[13px] leading-7 md:text-[15px] md:leading-8 ${dark?"text-white/70":"text-[#776f67]"}`}>{paragraphs(section.body).map((p,i)=><p key={i}>{p}</p>)}</div>}{section.buttonText&&section.buttonUrl&&<a href={section.buttonUrl} className={`mt-8 inline-flex items-center gap-3 border-b pb-2 text-[10px] font-bold uppercase tracking-[.2em] ${dark?"border-white/40 text-white":"border-black/30 text-[#211d19]"}`}>{section.buttonText}<ArrowRight size={14}/></a>}</div>}

export function DynamicSection({section,index=0}:{section:DynamicSectionData;index?:number}){if(section.isActive===false)return null;const layout=resolveLayout(section.layout,index),image=imageProps(section,index),id=["journal","story","mission","vision"].includes(section.key)?section.key:`section-${section.key}`;
if(layout==="CINEMATIC")return <section id={id} className="relative min-h-[620px] overflow-hidden bg-[#211d19]"><Image {...image} fill sizes="100vw" className="object-cover blur-[18px] scale-110"/><div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10"/><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10"/><div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1400px] items-center px-6 py-24 md:px-14"><motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.7}}><Copy section={section} dark/></motion.div></div></section>;
if(layout==="SPLIT_LEFT"||layout==="SPLIT_RIGHT"){const reverse=layout==="SPLIT_RIGHT";return <section id={id} className="bg-[#f6f1e9] px-5 py-20 md:px-14 md:py-28"><div className={`mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2 md:items-center md:gap-16 ${reverse?"md:[&>div:first-child]:order-2":""}`}><div className="relative aspect-[.9] overflow-hidden rounded-[2rem] bg-[#e8dfd5]"><Image {...image} fill sizes="50vw" className="object-cover transition duration-700 hover:scale-[1.02]"/></div><Copy section={section}/></div></section>}
if(layout==="STATEMENT")return <section id={id} className="relative isolate overflow-hidden bg-[#e9dfd4] px-5 py-24 md:px-14 md:py-36"><UnderTextImage image={image}/><div className="absolute inset-0 bg-[#f6f1e9]/70"/><motion.div className="relative z-10 mx-auto max-w-[1200px]" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}}><Copy section={section} center/></motion.div></section>;
if(layout==="COLLAGE")return <section id={id} className="bg-[#f6f1e9] px-5 py-20 md:px-14 md:py-28"><div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-[1.2fr_.8fr] md:items-end"><div className="relative aspect-[1.1] overflow-hidden rounded-[2rem] bg-[#e8dfd5] md:row-span-2"><Image {...image} fill sizes="60vw" className="object-cover"/></div><div className="rounded-[2rem] bg-[#211d19] p-8 text-[#f7f3ec] md:p-10"><Copy section={section} dark/></div><div className="hidden min-h-40 rounded-[2rem] bg-[#d2a38c] p-8 md:block"><p className="serif text-4xl italic">Make space for the moments you want to remember.</p></div></div></section>;
if(layout==="FULL_BLEED")return <section id={id} className="relative min-h-[560px] overflow-hidden bg-[#211d19]"><Image {...image} fill sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-black/45"/><div className="relative z-10 flex min-h-[560px] items-center justify-center px-5 py-24"><Copy section={section} dark center/></div></section>;
if(layout==="PRODUCT_SHOWCASE")return <section id={id} className="bg-[#2a180f] px-5 py-20 text-[#f5eadf] md:px-14 md:py-28"><div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[.9fr_1.1fr] md:items-center"><div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/15"><Image {...image} fill sizes="45vw" className="object-cover"/></div><div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-12"><Copy section={section} dark/></div></div></section>;
if(layout==="QUOTE")return <section id={id} className="bg-[#211d19] px-5 py-24 text-[#f7f3ec] md:px-14 md:py-36"><div className="mx-auto max-w-[1000px] text-center"><Quote className="mx-auto mb-7 text-[#d2a38c]" size={34} strokeWidth={1}/><p className="serif text-4xl italic leading-[1.02] md:text-7xl">“{section.title||section.body||"A scent is a memory waiting to happen."}”</p>{section.body&&<p className="mx-auto mt-7 max-w-2xl text-xs leading-6 text-white/55">{paragraphs(section.body)[0]}</p>}</div></section>;
if(layout==="FLOATING_CARD")return <section id={id} className="bg-[#e9dfd4] px-5 py-20 md:px-14 md:py-28"><div className="relative mx-auto min-h-[580px] max-w-[1200px] overflow-hidden rounded-[2rem] bg-[#211d19]"><Image {...image} fill sizes="1200px" className="object-cover"/><div className="absolute inset-0 bg-black/20"/><div className="relative z-10 flex min-h-[580px] items-end p-5 md:items-center md:p-12"><div className="max-w-xl rounded-[1.75rem] bg-[#f6f1e9]/95 p-7 shadow-2xl backdrop-blur md:p-10"><Copy section={section}/></div></div></div></section>;
return <section id={id} className="relative isolate overflow-hidden bg-[#f6f1e9] px-5 py-20 md:px-14 md:py-28"><UnderTextImage image={image}/><div className="absolute inset-0 bg-[#f6f1e9]/75"/><div className="relative z-10 mx-auto max-w-[900px] border-y border-black/10 py-12 md:py-16"><Copy section={section}/></div></section>}

export function SectionStylePreview({layout}:{layout:SectionLayout}){
  const style=SECTION_STYLES.find(x=>x.value===layout)||SECTION_STYLES[1];
  const image=style.sampleImage;
  const badge=<div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.16em]">{style.label}</div>;
  if(layout==="STATEMENT"||layout==="QUOTE"||layout==="MINIMAL")return <div className="relative h-[190px] overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#e9dfd4] p-5"><div className="flex h-full flex-col justify-center text-center"><span className="text-[7px] font-bold uppercase tracking-[.28em] text-[#9c5638]">A new mood</span><p className="serif mt-2 text-[26px] leading-[.9]">{SAMPLE_SECTION.title}</p><p className="mx-auto mt-2 max-w-[220px] text-[8px] leading-3 text-[#776f67]">{layout==="QUOTE"?"A scent is a memory waiting to happen.":style.description}</p></div>{badge}</div>;
  if(layout==="SPLIT_LEFT"||layout==="SPLIT_RIGHT")return <div className="relative h-[190px] overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#f6f1e9] p-3"><div className={`flex h-full gap-3 ${layout==="SPLIT_RIGHT"?"flex-row-reverse":""}`}><div className="relative w-1/2 overflow-hidden rounded-xl"><Image src={image} alt="" fill sizes="180px" className="object-cover"/></div><div className="flex w-1/2 flex-col justify-center"><span className="text-[7px] font-bold uppercase tracking-[.2em] text-[#9c5638]">A new mood</span><p className="serif mt-1 text-[21px] leading-[.9]">{SAMPLE_SECTION.title}</p><p className="mt-2 text-[7px] leading-3 text-[#776f67]">A small flame can change the atmosphere.</p></div></div>{badge}</div>;
  if(layout==="COLLAGE")return <div className="relative h-[190px] overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#f6f1e9] p-3"><div className="grid h-full grid-cols-[1.25fr_.75fr] gap-3"><div className="relative overflow-hidden rounded-xl"><Image src={image} alt="" fill sizes="200px" className="object-cover"/></div><div className="grid gap-3"><div className="rounded-xl bg-[#211d19] p-3 text-white"><p className="serif text-lg leading-none">{SAMPLE_SECTION.title}</p></div><div className="rounded-xl bg-[#d2a38c] p-3"><p className="serif text-sm italic">Make space for the moment.</p></div></div></div>{badge}</div>;
  if(layout==="PRODUCT_SHOWCASE")return <div className="relative h-[190px] overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#2a180f] p-3 text-white"><div className="flex h-full items-center gap-3"><div className="relative h-full w-1/2 overflow-hidden rounded-xl"><Image src={image} alt="" fill sizes="180px" className="object-cover"/></div><div className="w-1/2 rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[7px] font-bold uppercase tracking-[.2em] text-[#d2a38c]">A new mood</p><p className="serif mt-1 text-lg leading-none">{SAMPLE_SECTION.title}</p></div></div>{badge}</div>;
  if(layout==="FULL_BLEED"||layout==="CINEMATIC"||layout==="FLOATING_CARD")return <div className="relative h-[190px] overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#211d19]"><Image src={image} alt="" fill sizes="400px" className="object-cover"/><div className="absolute inset-0 bg-black/45"/>{layout==="FLOATING_CARD"?<div className="absolute bottom-3 left-3 max-w-[72%] rounded-xl bg-[#f6f1e9]/95 p-3"><p className="serif text-lg leading-none text-[#211d19]">{SAMPLE_SECTION.title}</p><p className="mt-1 text-[7px] text-[#776f67]">A small flame can change the atmosphere.</p></div>:<div className="absolute inset-0 flex items-center p-5"><div className="max-w-[78%] text-white"><p className="text-[7px] font-bold uppercase tracking-[.2em] text-[#d2a38c]">A new mood</p><p className="serif mt-1 text-[24px] leading-[.9]">{SAMPLE_SECTION.title}</p></div></div>}{badge}</div>;
  return <div className="relative h-[190px] overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#f6f1e9] p-5"><div className="relative h-full overflow-hidden rounded-xl"><Image src={image} alt="" fill sizes="400px" className="object-cover"/></div>{badge}</div>;
}
