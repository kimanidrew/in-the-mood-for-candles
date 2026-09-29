"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const router=useRouter();
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault(); setError(""); setLoading(true);
    const endpoint=mode==="login"?"/api/auth/login":"/api/auth/signup";
    const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});
    const data=await res.json();
    setLoading(false);
    if(!res.ok){setError(data.error||"Something went wrong.");return;}
    router.push(data.user.role==="ADMIN"?"/admin":"/");
    router.refresh();
  }

  return <main className="min-h-screen bg-[#f6f1e9] px-5 py-16 text-[#211d19]">
    <div className="mx-auto max-w-md">
      <Link href="/" className="serif text-3xl">In The Mood</Link>
      <div className="mt-12 rounded-[2rem] bg-white/70 p-7 shadow-sm ring-1 ring-black/5 md:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Your account</p>
        <h1 className="serif mt-3 text-5xl">{mode==="login"?"Welcome back.":"Create your account."}</h1>
        <p className="mt-3 text-sm text-[#776f67]">{mode==="login"?"Sign in to continue shopping and manage your account.":"Create a customer account in a few seconds."}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode==="signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-[#9c5638]" />}
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-[#9c5638]" />
          <input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (8+ characters)" className="w-full border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-[#9c5638]" />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="w-full bg-[#211d19] py-4 text-xs font-bold uppercase tracking-[.2em] text-white disabled:opacity-50">{loading?"Please wait...":mode==="login"?"Sign in":"Create account"}</button>
        </form>
        <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("")}} className="mt-6 w-full text-sm underline underline-offset-4">{mode==="login"?"New here? Create an account":"Already have an account? Sign in"}</button>
        <Link href="/" className="mt-5 block text-center text-xs uppercase tracking-[.18em] text-[#776f67]">Back to store</Link>
      </div>
    </div>
  </main>;
}
