"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, LogOut, ShieldCheck, UserRound } from "lucide-react";

type User = { id:string; name:string|null; email:string; role:"CUSTOMER"|"ADMIN" };
type FavoriteProduct = { id:string; name:string; slug:string; mood:string; images:{url:string}[] };
type FavoriteMood = { id:string; name:string; slug:string };

export default function AccountPage() {
  const router=useRouter();
  const [user,setUser]=useState<User|null>(null);
  const [checking,setChecking]=useState(true);
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [currentPassword,setCurrentPassword]=useState("");
  const [newPassword,setNewPassword]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [loading,setLoading]=useState(false);
  const [favoriteProducts,setFavoriteProducts]=useState<FavoriteProduct[]>([]);
  const [favoriteMoods,setFavoriteMoods]=useState<FavoriteMood[]>([]);

  async function loadUser() {
    const [res, favoritesRes]=await Promise.all([
      fetch("/api/auth/me",{cache:"no-store"}),
      fetch("/api/favorites",{cache:"no-store"}),
    ]);
    const data=await res.json();
    const favoritesData=await favoritesRes.json().catch(()=>({}));
    if(data?.user?.role==="ADMIN"){router.replace("/admin");return;}
    if(data?.user){
      if(Array.isArray(favoritesData.products)) setFavoriteProducts(favoritesData.products);
      if(Array.isArray(favoritesData.moods)) setFavoriteMoods(favoritesData.moods);
      setUser(data.user);
      setName(data.user.name||"");
      setEmail(data.user.email);
    }
    setChecking(false);
  }

  useEffect(()=>{loadUser().catch(()=>setChecking(false));},[router]);

  async function submitAuth(e:FormEvent){
    e.preventDefault(); setError(""); setNotice(""); setLoading(true);
    const endpoint=mode==="login"?"/api/auth/login":"/api/auth/signup";
    try {
      const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});
      const data=await res.json();
      if(!res.ok){setError(data.error||"Something went wrong.");return;}
      if(data.user?.role==="ADMIN"){router.replace("/admin");return;}
      setUser(data.user);
      setName(data.user.name||"");
      setEmail(data.user.email);
      setPassword("");
      setNotice(mode==="login"?"Welcome back. Your session will stay saved on this device.":"Your account has been created and you are now signed in.");
    } catch { setError("Unable to connect. Please try again."); }
    finally { setLoading(false); }
  }

  async function saveProfile(e:FormEvent){
    e.preventDefault(); setError(""); setNotice(""); setLoading(true);
    try {
      const res=await fetch("/api/auth/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,currentPassword,newPassword})});
      const data=await res.json();
      if(!res.ok){setError(data.error||"Could not save your account.");return;}
      setUser(data.user);
      setName(data.user.name||"");
      setEmail(data.user.email);
      setCurrentPassword("");
      setNewPassword("");
      setNotice("Your account details have been saved.");
    } catch { setError("Unable to connect. Please try again."); }
    finally { setLoading(false); }
  }

  async function logout(){
    await fetch("/api/auth/logout",{method:"POST"});
    setUser(null);
    setPassword("");
    setCurrentPassword("");
    setNewPassword("");
    setNotice("You have been signed out.");
  }

  if(checking) return <main className="grid min-h-screen place-items-center bg-[#f6f1e9] text-[#211d19]"><p className="serif text-3xl">Checking your account…</p></main>;

  if(user) return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-10 text-[#211d19] md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-end">
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] hover:bg-black/5"><LogOut size={13}/> Sign out</button>
        </div>

        <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#211d19] p-7 text-[#f7f3ec] md:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#d2a38c]">Customer account</p>
          <h1 className="serif mt-3 text-5xl leading-none md:text-7xl">Welcome back{user.name ? ", "+user.name.split(" ")[0] : ""}.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">Manage your personal details and keep your sign-in information up to date.</p>
        </section>

        <section id="favourites" className="mt-7 rounded-[2rem] bg-white p-7 ring-1 ring-black/5 md:p-9">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Your favourites</p>
              <h2 className="serif mt-2 text-4xl">The scents you love.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#776f67]">Your favourite candles and moods are saved to your account, ready whenever you return.</p>
            </div>
            <Link href="/#products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]">Explore candles <ArrowRight size={13}/></Link>
          </div>

          {favoriteProducts.length > 0 ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteProducts.map((product) => (
                <Link key={product.id} href={"/#products"} className="group overflow-hidden rounded-2xl bg-[#f6f1e9]">
                  <div className="relative aspect-square overflow-hidden bg-[#e2d8cb]">
                    {product.images?.[0]?.url ? <Image src={product.images[0].url} alt={product.name} fill unoptimized={product.images[0].url.startsWith("data:image/")} className="object-cover transition duration-500 group-hover:scale-105" /> : null}
                  </div>
                  <div className="p-4">
                    <h3 className="serif text-2xl">{product.name}</h3>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[.18em] text-[#9c5638]">{product.mood}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl bg-[#f6f1e9] p-6 text-sm text-[#776f67]">No favourite candles yet. Tap the heart on any candle to save it here.</div>
          )}

          <div className="mt-7 border-t border-black/10 pt-6">
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#776f67]">Favourite moods</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {favoriteMoods.length > 0 ? favoriteMoods.map((mood) => (
                <Link key={mood.id} href="/#products" className="rounded-full bg-[#eee4da] px-4 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#9c5638]">{mood.name}</Link>
              )) : <span className="text-sm text-[#776f67]">No favourite moods yet. Tap the heart beside a mood on the shop.</span>}
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[2rem] bg-white p-7 ring-1 ring-black/5 md:p-9">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eee4da] text-[#9c5638]"><UserRound size={25} strokeWidth={1.5}/></div>
            <h2 className="serif mt-6 text-4xl">{user.name || "Customer"}</h2>
            <p className="mt-2 break-all text-sm text-[#776f67]">{user.email}</p>
            <div className="mt-7 flex items-center gap-2 rounded-2xl bg-[#f6f1e9] p-4 text-xs text-[#665c54]"><ShieldCheck size={16} className="text-[#9c5638]"/><span>Your account is securely signed in.</span></div>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]">Continue shopping <ArrowRight size={13}/></Link>
          </aside>

          <section className="rounded-[2rem] bg-white p-7 ring-1 ring-black/5 md:p-9">
            <div className="flex items-end justify-between gap-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Profile & security</p><h2 className="serif mt-2 text-4xl">Your details.</h2></div>
              <span className="hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-[#9c5638] sm:flex"><Check size={13}/> Saved account</span>
            </div>
            <form onSubmit={saveProfile} className="mt-8 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full name"><input value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="Your full name"/></Field>
                <Field label="Email address"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" placeholder="you@example.com"/></Field>
              </div>
              <div className="border-t border-black/10 pt-6">
                <p className="serif text-2xl">Change password</p>
                <p className="mt-1 text-xs text-[#776f67]">Leave the new password blank if you do not want to change it.</p>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Field label="Current password"><input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="input" placeholder="Required for email/password changes"/></Field>
                  <Field label="New password"><input type="password" minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="input" placeholder="8+ characters"/></Field>
                </div>
              </div>
              {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {notice && <p className="rounded-2xl bg-[#eee4da] px-4 py-3 text-sm text-[#665c54]">{notice}</p>}
              <button disabled={loading} className="w-full rounded-full bg-[#211d19] py-4 text-[10px] font-bold uppercase tracking-[.2em] text-white transition hover:bg-[#9c5638] disabled:opacity-50">{loading?"Saving…":"Save account changes"}</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );

  return <main className="min-h-screen bg-[#f6f1e9] px-5 py-16 text-[#211d19]">
    <div className="mx-auto max-w-md">
      <div className="mt-12 rounded-[2rem] bg-white/70 p-7 shadow-sm ring-1 ring-black/5 md:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Your account</p>
        <h1 className="serif mt-3 text-5xl">{mode==="login"?"Welcome back.":"Create your account."}</h1>
        <p className="mt-3 text-sm text-[#776f67]">{mode==="login"?"Sign in to continue shopping and manage your account.":"Create a customer account in a few seconds."}</p>
        <form onSubmit={submitAuth} className="mt-8 space-y-4">
          {mode==="signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="input" />}
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="input" />
          <input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (8+ characters)" className="input" />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-full bg-[#211d19] py-4 text-[10px] font-bold uppercase tracking-[.2em] text-white disabled:opacity-50">{loading?"Please wait…":mode==="login"?"Sign in":"Create account"}</button>
        </form>
        <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setNotice("")}} className="mt-6 w-full text-sm underline underline-offset-4">{mode==="login"?"New here? Create an account":"Already have an account? Sign in"}</button>
        <Link href="/" className="mt-5 block text-center text-xs uppercase tracking-[.18em] text-[#776f67]">Back to store</Link>
      </div>
    </div>
  </main>;
}

function Field({label,children}:{label:string;children:React.ReactNode}) {
  return <label className="block text-xs font-semibold text-[#211d19]"><span>{label}</span>{children}</label>;
}
