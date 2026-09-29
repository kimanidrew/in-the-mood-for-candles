"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, LogOut, ShieldCheck, UserRound } from "lucide-react";

type User = { id:string; name:string|null; email:string; role:"CUSTOMER"|"ADMIN" };

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

  async function loadUser() {
    const res=await fetch("/api/auth/me",{cache:"no-store"});
    const data=await res.json();
    if(data?.user?.role==="ADMIN"){router.replace("/admin");return;}
    if(data?.user){
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
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#211d19] text-white"><UserRound size={19}/></span>
            <span><span className="serif block text-2xl leading-none">In The Mood</span><span className="mt-1 block text-[8px] font-bold uppercase tracking-[.3em] text-[#776f67]">Your account</span></span>
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] hover:bg-black/5"><LogOut size={13}/> Sign out</button>
        </header>

        <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#211d19] p-7 text-[#f7f3ec] md:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#d2a38c]">Customer account</p>
          <h1 className="serif mt-3 text-5xl leading-none md:text-7xl">Welcome back{user.name ? ", "+user.name.split(" ")[0] : ""}.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">Manage your personal details and keep your sign-in information up to date.</p>
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
      <Link href="/" className="serif text-3xl">In The Mood</Link>
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
